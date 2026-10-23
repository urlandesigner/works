import type { PropsWithChildren } from 'react';

interface Props {
  className?: string;
}

export function Card({ children, className = '' }: PropsWithChildren<Props>) {
  return (
    <div className={`rounded-xl border border-zinc-200 bg-white ${className}`}>{children}</div>
  );
}
