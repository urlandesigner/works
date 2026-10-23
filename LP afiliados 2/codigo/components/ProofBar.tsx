import Image from "next/image";

type Props = {
  items: string[];
  badgeImage?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
};

/**
 * Prova social do hero. Lista vazia = não renderiza nada.
 *
 * A margem superior é do próprio componente, de propósito: se ficasse
 * numa div em volta, o wrapper sobreviveria ao null e deixaria 32px de
 * buraco no hero quando o produto não tem prova social — que é o caso
 * normal no primeiro produto.
 *
 * O selo de imagem é decorativo (o texto ao lado já carrega o mesmo
 * conteúdo para leitor de tela) — por isso alt vazio, não redundante.
 */
export function ProofBar({ items, badgeImage }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="mt-8">
      <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <span aria-hidden="true" className="text-accent">
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>
      {badgeImage && (
        <Image
          src={badgeImage.src}
          alt=""
          width={badgeImage.width}
          height={badgeImage.height}
          className="mt-4 h-auto w-full max-w-xs"
        />
      )}
    </div>
  );
}
