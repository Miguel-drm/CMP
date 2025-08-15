// import { Play } from 'lucide-react';

type Track = {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl: string;
  audioUrl: string;
  videoUrl: string;
  showVideoSecond: number;
};

interface PlaylistProps {
  track: Track;
  isActive: boolean;
  onClick: () => void;
}

const Playlist = ({ track, isActive, onClick }: PlaylistProps) => {
    return (
        <div
            className={`group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${isActive ? 'bg-primary/10' : ''}`}
            onClick={onClick}
        >
            <div className="relative flex-shrink-0">
                <div className='w-12 h-12 rounded-full overflow-hidden'>
                    {/* You can use <img src={track.coverUrl} alt={track.title} /> here */}
                    <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                </div>
                {/* Play Pause Overlay */}
                {/* <div className={`absolute inset-0 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0  bg-black/40'}`}>
                    <Play size={16} />
                </div> */}
            </div>
            <div className='flex-1 min-w-0'>
                <h4 className="truncate font-semibold font-spotify tracking-tight">{track.title}</h4>
                <p className="truncate text-sm text-muted-foreground font-spotify font-medium">{track.artist}</p>
            </div>
            {/* Time Duration */}
            <div className='flex items-center gap-3 text-xs text-muted-foreground font-spotify font-medium'>
                {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
            </div>
            
        </div>
    )
}

export default Playlist