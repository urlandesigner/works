-- Analytics Dashboard — schema inicial do MVP
-- Ferramenta interna, single-user, fonte única GA4.
-- Tabelas: site, metrica, pagina_metrica, canal_metrica, sync_state
-- RLS: somente usuário autenticado (sem multi-tenant).

create extension if not exists pgcrypto;

-- ───────────────────────────────────────── tabelas

create table site (
  id              uuid primary key default gen_random_uuid(),
  nome            text not null,
  url             text not null,
  ga4_property_id text not null,
  cliente         text,
  segmento        text,
  status          text not null default 'ativo',   -- ativo | pausado | arquivado
  created_at      timestamptz not null default now()
);

create table metrica (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references site(id) on delete cascade,
  data        date not null,
  usuarios    integer not null default 0,
  sessoes     integer not null default 0,
  pageviews   integer not null default 0,
  conversoes  integer not null default 0,
  unique (site_id, data)
);
create index idx_metrica_site_data on metrica (site_id, data);

create table pagina_metrica (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references site(id) on delete cascade,
  data        date not null,
  page_path   text not null,
  page_title  text,
  pageviews   integer not null default 0,
  unique (site_id, data, page_path)
);
create index idx_pagina_site_data on pagina_metrica (site_id, data);

create table canal_metrica (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references site(id) on delete cascade,
  data        date not null,
  canal       text not null,                        -- sessionDefaultChannelGroup
  usuarios    integer not null default 0,
  sessoes     integer not null default 0,
  conversoes  integer not null default 0,
  unique (site_id, data, canal)
);
create index idx_canal_site_data on canal_metrica (site_id, data);

create table sync_state (
  site_id       uuid primary key references site(id) on delete cascade,
  last_sync_at  timestamptz,
  status        text not null default 'no_data',    -- ok | running | error | no_data
  error_message text
);

-- cria a linha de sync_state automaticamente ao cadastrar um site
create or replace function on_site_insert() returns trigger
language plpgsql as $$
begin
  insert into sync_state (site_id, status) values (new.id, 'no_data')
  on conflict (site_id) do nothing;
  return new;
end;
$$;

create trigger trg_site_insert
  after insert on site
  for each row execute function on_site_insert();

-- ───────────────────────────────────────── helper de variação

-- variação % com regra de período-anterior-zero → null ("novo")
create or replace function pct(cur numeric, prev numeric) returns numeric
language sql immutable as $$
  select case when prev is null or prev = 0 then null
              else round((cur - prev) / prev * 100, 1) end;
$$;

-- ───────────────────────────────────────── RPC: Home (portfólio)

-- Janela: atual = [hoje-p_days, ontem]; anterior = [hoje-2*p_days, hoje-p_days-1].
-- attention_reason priorizado: technical > drop(<=-30%) > spike(>=50%) > null (estável).
create or replace function get_portfolio_overview(p_days int default 7)
returns table (
  site_id            uuid,
  nome               text,
  cliente            text,
  status             text,
  sync_status        text,
  last_sync_at       timestamptz,
  usuarios_atual     bigint,
  usuarios_anterior  bigint,
  conversoes_atual   bigint,
  conversoes_anterior bigint,
  var_usuarios       numeric,
  var_conversoes     numeric,
  attention_reason   text
)
language sql stable as $$
  with b as (
    select current_date - p_days       as cs,
           current_date - 1            as ce,
           current_date - (2 * p_days) as ps,
           current_date - p_days - 1   as pe
  ),
  agg as (
    select s.id as site_id,
      coalesce(sum(m.usuarios)   filter (where m.data between b.cs and b.ce), 0) as u_cur,
      coalesce(sum(m.usuarios)   filter (where m.data between b.ps and b.pe), 0) as u_prev,
      coalesce(sum(m.conversoes) filter (where m.data between b.cs and b.ce), 0) as c_cur,
      coalesce(sum(m.conversoes) filter (where m.data between b.ps and b.pe), 0) as c_prev
    from site s
    cross join b
    left join metrica m on m.site_id = s.id and m.data between b.ps and b.ce
    group by s.id
  )
  select
    s.id, s.nome, s.cliente, s.status,
    ss.status, ss.last_sync_at,
    a.u_cur, a.u_prev, a.c_cur, a.c_prev,
    pct(a.u_cur, a.u_prev),
    pct(a.c_cur, a.c_prev),
    case
      when ss.status is null or ss.status in ('error', 'no_data')
           or ss.last_sync_at is null
           or ss.last_sync_at < now() - interval '24 hours' then 'technical'
      when a.u_prev > 0 and (a.u_cur - a.u_prev)::numeric / a.u_prev * 100 <= -30 then 'drop'
      when a.u_prev > 0 and (a.u_cur - a.u_prev)::numeric / a.u_prev * 100 >=  50 then 'spike'
      else null
    end
  from site s
  join agg a on a.site_id = s.id
  left join sync_state ss on ss.site_id = s.id
  where s.status is distinct from 'arquivado';
$$;

-- ───────────────────────────────────────── RPC: Dashboard do Site

create or replace function get_site_cards(p_site_id uuid, p_days int default 7)
returns table (
  usuarios_atual bigint, usuarios_anterior bigint, var_usuarios numeric,
  sessoes_atual bigint, sessoes_anterior bigint, var_sessoes numeric,
  pageviews_atual bigint, pageviews_anterior bigint, var_pageviews numeric,
  conversoes_atual bigint, conversoes_anterior bigint, var_conversoes numeric
)
language sql stable as $$
  with b as (
    select current_date - p_days as cs, current_date - 1 as ce,
           current_date - (2 * p_days) as ps, current_date - p_days - 1 as pe
  ),
  s as (
    select
      coalesce(sum(m.usuarios)   filter (where m.data between b.cs and b.ce), 0) as u_cur,
      coalesce(sum(m.usuarios)   filter (where m.data between b.ps and b.pe), 0) as u_prev,
      coalesce(sum(m.sessoes)    filter (where m.data between b.cs and b.ce), 0) as se_cur,
      coalesce(sum(m.sessoes)    filter (where m.data between b.ps and b.pe), 0) as se_prev,
      coalesce(sum(m.pageviews)  filter (where m.data between b.cs and b.ce), 0) as p_cur,
      coalesce(sum(m.pageviews)  filter (where m.data between b.ps and b.pe), 0) as p_prev,
      coalesce(sum(m.conversoes) filter (where m.data between b.cs and b.ce), 0) as c_cur,
      coalesce(sum(m.conversoes) filter (where m.data between b.ps and b.pe), 0) as c_prev
    from b
    left join metrica m on m.site_id = p_site_id and m.data between b.ps and b.ce
    group by b.cs, b.ce, b.ps, b.pe
  )
  select u_cur, u_prev, pct(u_cur, u_prev),
         se_cur, se_prev, pct(se_cur, se_prev),
         p_cur, p_prev, pct(p_cur, p_prev),
         c_cur, c_prev, pct(c_cur, c_prev)
  from s;
$$;

-- série diária alinhada: cada dia atual + o dia equivalente do período anterior
create or replace function get_site_trend(p_site_id uuid, p_days int default 7)
returns table (dia date, usuarios_atual bigint, usuarios_anterior bigint)
language sql stable as $$
  with days as (select generate_series(0, p_days - 1) as off)
  select
    (current_date - 1 - d.off)::date as dia,
    coalesce(cur.usuarios, 0)  as usuarios_atual,
    coalesce(prev.usuarios, 0) as usuarios_anterior
  from days d
  left join metrica cur  on cur.site_id  = p_site_id and cur.data  = current_date - 1 - d.off
  left join metrica prev on prev.site_id = p_site_id and prev.data = current_date - 1 - d.off - p_days
  order by dia;
$$;

create or replace function get_site_channels(p_site_id uuid, p_days int default 7)
returns table (canal text, usuarios bigint, sessoes bigint, conversoes bigint, var_usuarios numeric)
language sql stable as $$
  with b as (
    select current_date - p_days as cs, current_date - 1 as ce,
           current_date - (2 * p_days) as ps, current_date - p_days - 1 as pe
  )
  select c.canal,
    coalesce(sum(c.usuarios)   filter (where c.data between b.cs and b.ce), 0),
    coalesce(sum(c.sessoes)    filter (where c.data between b.cs and b.ce), 0),
    coalesce(sum(c.conversoes) filter (where c.data between b.cs and b.ce), 0),
    pct(
      coalesce(sum(c.usuarios) filter (where c.data between b.cs and b.ce), 0),
      coalesce(sum(c.usuarios) filter (where c.data between b.ps and b.pe), 0)
    )
  from canal_metrica c
  cross join b
  where c.site_id = p_site_id and c.data between b.ps and b.ce
  group by c.canal
  order by 2 desc;
$$;

create or replace function get_site_pages(p_site_id uuid, p_days int default 7, p_limit int default 10)
returns table (page_path text, page_title text, pageviews bigint, var_pageviews numeric, pct_total numeric)
language sql stable as $$
  with b as (
    select current_date - p_days as cs, current_date - 1 as ce,
           current_date - (2 * p_days) as ps, current_date - p_days - 1 as pe
  ),
  agg as (
    select pm.page_path,
      max(pm.page_title) as page_title,
      coalesce(sum(pm.pageviews) filter (where pm.data between b.cs and b.ce), 0) as pv_cur,
      coalesce(sum(pm.pageviews) filter (where pm.data between b.ps and b.pe), 0) as pv_prev
    from pagina_metrica pm
    cross join b
    where pm.site_id = p_site_id and pm.data between b.ps and b.ce
    group by pm.page_path
  ),
  tot as (select nullif(sum(pv_cur), 0) as total from agg)
  select a.page_path, a.page_title, a.pv_cur,
    pct(a.pv_cur, a.pv_prev),
    case when t.total is null then null else round(a.pv_cur::numeric / t.total * 100, 1) end
  from agg a cross join tot t
  order by a.pv_cur desc
  limit p_limit;
$$;

-- ───────────────────────────────────────── RLS (somente autenticado)

alter table site           enable row level security;
alter table metrica        enable row level security;
alter table pagina_metrica enable row level security;
alter table canal_metrica  enable row level security;
alter table sync_state     enable row level security;

create policy auth_all_site   on site           for all to authenticated using (true) with check (true);
create policy auth_all_metr   on metrica        for all to authenticated using (true) with check (true);
create policy auth_all_pag    on pagina_metrica for all to authenticated using (true) with check (true);
create policy auth_all_can    on canal_metrica  for all to authenticated using (true) with check (true);
create policy auth_all_sync   on sync_state     for all to authenticated using (true) with check (true);

-- ───────────────────────────────────────── grants das RPC

grant execute on function get_portfolio_overview(int) to authenticated;
grant execute on function get_site_cards(uuid, int)    to authenticated;
grant execute on function get_site_trend(uuid, int)    to authenticated;
grant execute on function get_site_channels(uuid, int) to authenticated;
grant execute on function get_site_pages(uuid, int, int) to authenticated;
