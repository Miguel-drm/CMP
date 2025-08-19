import { memo } from "react";

type Props = {
  sessionId: string;
  title: string;
  artist: string;
  coverUrl?: string;
};

function NotificationCard({ sessionId, title, artist, coverUrl }: Props) {
  const anon = `Anonymous${sessionId.replace(/-/g, "").slice(-6).toUpperCase()}`;
  return (
    <div className="rounded-xl border border-white/10 bg-background/95 shadow-xl px-3 py-2 text-foreground/90 w-[260px]">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-md overflow-hidden bg-muted shrink-0">
          {coverUrl ? (
            <img src={coverUrl} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-muted/60 to-muted" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-foreground/70 truncate">🎧 {anon} is listening to</div>
          <div className="text-sm font-medium text-foreground/90 leading-tight truncate">{title}</div>
          <div className="text-xs text-foreground/70 leading-tight truncate">{artist}</div>
        </div>
      </div>
    </div>
  );
}

export default memo(NotificationCard);


