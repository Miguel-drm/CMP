import { useRef, useState } from "react";

type ProgressBarProps = {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
};

const ProgressBar = ({ currentTime, duration, onSeek }: ProgressBarProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);

  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayProgress = isDragging ? dragProgress : progress;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handlePointerMove(e);
    window.addEventListener("pointermove", handlePointerMove as any);
    window.addEventListener("pointerup", handlePointerUp as any);
  };

  const handlePointerMove = (e: PointerEvent | React.PointerEvent) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const x = (e as PointerEvent).clientX - rect.left;
    let percent = (x / rect.width) * 100;
    percent = Math.max(0, Math.min(100, percent));
    setDragProgress(percent);
  };

  const handlePointerUp = (e: PointerEvent) => {
    setIsDragging(false);
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let percent = (x / rect.width) * 100;
    percent = Math.max(0, Math.min(100, percent));
    const newTime = (percent / 100) * duration;
    onSeek(newTime);
    window.removeEventListener("pointermove", handlePointerMove as any);
    window.removeEventListener("pointerup", handlePointerUp as any);
  };

  return (
    <div className="w-full group select-none">
      <div
        ref={barRef}
        className="relative h-1 md:h-1.5 rounded-full bg-muted/30 hover:bg-muted/40 transition-[height,background-color] duration-200 cursor-pointer"
        onPointerDown={handlePointerDown}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={duration || 0}
        aria-valuenow={(displayProgress / 100) * (duration || 0)}
      >
        {/* Progress Fill */}
        <div
          className="absolute top-0 left-0 h-full bg-primary rounded-full transition-[width] duration-150 pointer-events-none"
          style={{ width: `${displayProgress}%` }}
        />
        {/* Progress Thumb (always visible) */}
        <div
          className={`${
            isDragging 
              ? "w-4 h-4 scale-110" 
              : "w-3 h-3 scale-100 group-hover:w-4 group-hover:h-4 group-hover:scale-110"
          } absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-background border-2 border-primary rounded-full shadow-lg transition-all duration-150 pointer-events-none opacity-100`}
          style={{ left: `${displayProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;