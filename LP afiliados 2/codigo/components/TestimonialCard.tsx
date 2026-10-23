import type { Testimonial } from "@/content";

/** Depoimento específico. Elogio genérico não convence e não entra aqui. */
export function TestimonialCard({ quote, author, context }: Testimonial) {
  return (
    <figure className="rounded-lg border border-line bg-surface p-6">
      <blockquote className="text-body">
        <p>“{quote}”</p>
      </blockquote>
      <figcaption className="mt-4 text-sm text-muted">
        <span className="font-medium text-heading">{author}</span>
        {" · "}
        {context}
      </figcaption>
    </figure>
  );
}
