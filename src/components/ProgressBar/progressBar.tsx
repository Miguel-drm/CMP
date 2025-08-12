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
    <div className="relative bg-gray-300 rounded-full">
      <div
        ref={barRef}
        className="relative h-3 bg-white/10 rounded-full cursor-pointer group overflow-hidden"
        onPointerDown={handlePointerDown}
      >
        {/* Progress Fill */}
        <div
          className="absolute top-0 left-0 h-full bg-gray-500 rounded-full transition-all duration-150 shadow-lg shadow-pink-500/50"
          style={{ width: `${displayProgress}%` }}
        ></div>
        {/* Progress Thumb */}
        <div
          className="absolute top-1/2 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-150 border-pink-500"
          style={{ left: `${displayProgress}%`, transform: "translate(-50%, -50%)" }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
