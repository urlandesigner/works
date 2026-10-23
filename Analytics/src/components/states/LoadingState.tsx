function Block({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-100 ${className}`} />;
}

// Skeleton da Home: nunca parece "quebrada" durante carregamento/sync.
export function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Block className="h-20" />
        <Block className="h-20" />
        <Block className="h-20" />
        <Block className="h-20" />
      </div>
      <Block className="h-40" />
      <div className="space-y-2">
        <Block className="h-12" />
        <Block className="h-12" />
        <Block className="h-12" />
      </div>
    </div>
  );
}
