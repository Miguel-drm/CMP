
type DrawerItem = {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
};

type Props = {
  items: DrawerItem[];
  loading?: boolean;
};

export default function ListenersDrawerContent({ items, loading }: Props) {
  const SkeletonRow = () => (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 animate-pulse">
      <div className="h-10 w-10 rounded-md bg-white/10" />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="h-3 w-3/4 rounded bg-white/10" />
        <div className="h-3 w-1/2 rounded bg-white/10" />
      </div>
      <div className="h-3 w-10 rounded bg-white/10" />
    </div>
  );

  if (loading) {
    return (
      <div className="w-full max-w-md space-y-2">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-2">
      {items.length === 0 && (
        <div className="text-sm text-foreground/80 text-center">No one is listening right now.</div>
      )}
      {items.map((l) => (
        <div key={l.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="h-10 w-10 rounded-md overflow-hidden bg-muted shrink-0">
            {l.coverUrl ? (
              <img src={l.coverUrl} alt={l.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-muted/60 to-muted" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground/90 leading-tight line-clamp-1">{l.title}</div>
            <div className="text-xs text-foreground/70 leading-tight line-clamp-1">{l.artist}</div>
          </div>
          <div className="text-xs text-foreground/60">#{l.id.slice(-6)}</div>
        </div>
      ))}
    </div>
  );
}


