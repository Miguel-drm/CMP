import Playlist from "./playlist";
import { tracks as allTracks } from "@/data/tracks";

type Props = {
  trackIndices: number[];
  currentTrackIndex: number;
  onSelect: (index: number) => void;
  className?: string;
};

export default function PlaylistContainer({ trackIndices, currentTrackIndex, onSelect, className }: Props) {
  return (
    <div
      className={
        className
          ? className
          : "space-y-3 h-[clamp(512px,40vh,100vh)] overflow-y-auto overflow-x-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden text-[clamp(1rem,6vw,1.5rem)]"
      }
    >
      {trackIndices.map((trackIndex) => (
        <Playlist
          key={allTracks[trackIndex].id}
          track={allTracks[trackIndex]}
          isActive={trackIndex === currentTrackIndex}
          onClick={() => onSelect(trackIndex)}
        />
      ))}
    </div>
  );
}


