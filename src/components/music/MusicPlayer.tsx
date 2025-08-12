"use client";

import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "../../lib/utils";

interface MusicPlayerProps {
  className?: string;
}

export const MusicPlayer = ({ className }: MusicPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    setMuted((prev) => !prev);
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
    }
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  return (
    <div className={cn("flex items-center gap-4 p-4 bg-card rounded-lg shadow", className)}>
      <button onClick={() => skip(-10)} title="Back 10s">
        <SkipBack className="w-6 h-6" />
      </button>
      <button onClick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
        {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
      </button>
      <button onClick={() => skip(10)} title="Forward 10s">
        <SkipForward className="w-6 h-6" />
      </button>
      <button onClick={toggleMute} title={muted ? "Unmute" : "Mute"}>
        {muted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </button>
      {/* Example audio element, replace src with your audio file */}
      <audio ref={audioRef} src="/sample.mp3" />
    </div>
  );
};
