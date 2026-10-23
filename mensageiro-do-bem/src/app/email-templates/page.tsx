import type { Metadata } from "next";
import { getEmailTemplatePreviews } from "@/lib/email/templates";

export const metadata: Metadata = {
  title: "Templates de E-mail · Mensageiro do Bem",
  description:
    "Preview interno dos templates de e-mail do Mensageiro do Bem.",
  robots: { index: false, follow: false },
};

export default function EmailTemplatesPage() {
  const templates = getEmailTemplatePreviews();

  return (
    <main className="min-h-full px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
            Studio interno
          </p>
          <h1 className="mt-4 font-serif text-[2.4rem] font-semibold leading-[0.96] tracking-[-0.04em] text-[var(--ink)] sm:text-[3.6rem]">
            Templates de e-mail com cara de produto, não de disparo genérico.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
            Cada template abaixo já sai com assunto, preview text, HTML e
            versão texto puro. Os previews usam a mesma direção editorial do
            app para facilitar aprovação de copy e visual.
          </p>
        </header>

        <section className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          {templates.map(({ id, name, description, template }) => (
            <article
              key={id}
              className="overflow-hidden rounded-[2rem] border border-[var(--stroke)] bg-[var(--paper)] shadow-[var(--shadow-ticket)]"
            >
              <div className="border-b border-[var(--stroke)] bg-[linear-gradient(180deg,rgba(250,245,236,0.96)_0%,rgba(253,249,243,0.92)_100%)] px-6 py-6 sm:px-7">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  {name}
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-[0.98rem]">
                  {description}
                </p>
              </div>

              <div className="grid gap-0 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <div className="border-b border-[var(--stroke)] px-6 py-6 xl:border-b-0 xl:border-r xl:px-7">
                  <div className="rounded-[1.4rem] border border-[var(--stroke)] bg-[var(--paper-warm)] px-4 py-4">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                      Assunto
                    </p>
                    <p className="mt-2 text-base font-medium leading-7 text-[var(--ink)]">
                      {template.subject}
                    </p>
                  </div>

                  <div className="mt-4 rounded-[1.4rem] border border-[var(--stroke)] bg-[var(--paper-warm)] px-4 py-4">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                      Preview text
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[var(--ink)]/92">
                      {template.previewText}
                    </p>
                  </div>

                  <div className="mt-4 rounded-[1.4rem] border border-[var(--stroke)] bg-[var(--paper-warm)] px-4 py-4">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                      Texto puro
                    </p>
                    <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words font-sans text-[0.92rem] leading-7 text-[var(--ink)]/92">
                      {template.text}
                    </pre>
                  </div>
                </div>

                <div className="bg-[var(--canvas-mid)]/32 p-3 sm:p-4">
                  <div className="overflow-hidden rounded-[1.55rem] border border-[var(--stroke-strong)] bg-white shadow-[0_18px_50px_-22px_rgba(74,67,60,0.45)]">
                    <iframe
                      title={`Preview do template ${name}`}
                      srcDoc={template.html}
                      className="h-[780px] w-full bg-white"
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
