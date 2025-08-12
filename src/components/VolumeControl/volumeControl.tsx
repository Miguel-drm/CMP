import { useRef, useState, useEffect } from "react";

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

const VolumeControl = ({ volume, onVolumeChange }: VolumeControlProps) => {
  const [isDragging, setIsDragging] = useState(false);
  // Removed unused hoverTime state
  const sliderRef = useRef<HTMLDivElement>(null);

  // Handle global mouse up/move for better drag experience
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleVolumeChange(e);
      }
    };
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleVolumeChange(e);
  };

  const handleVolumeChange = (e: MouseEvent | React.MouseEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = (e as MouseEvent).clientX;
    const clickX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    onVolumeChange(percentage);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const newVolume = Math.max(0, volume - 0.05);
      onVolumeChange(newVolume);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const newVolume = Math.min(1, volume + 0.05);
      onVolumeChange(newVolume);
    }
  };

  return (
    <div className="flex items-center gap-2 select-none">
      {/* Volume Slider */}
      <div
        className="relative w-28 h-3 bg-gray-300 dark:bg-gray-800 rounded-full cursor-pointer group overflow-hidden"
        ref={sliderRef}
        onMouseDown={handleMouseDown}
  // Removed unused hoverTime handlers
        tabIndex={0}
        role="slider"
        aria-valuenow={Math.round(volume * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Volume control"
        onKeyDown={handleKeyDown}
      >
        {/* Volume Fill (identical to song progress bar) */}
        <div
          className="absolute top-0 left-0 h-full bg-gray-500 dark:bg-primary rounded-full transition-all duration-150 shadow-lg shadow-pink-500/50"
          style={{ width: `${volume * 100}%` }}
        ></div>
        {/* Progress Thumb */}
        <div
          className={`absolute top-1/2 w-5 h-5 bg-white dark:bg-gray-900 rounded-full shadow-lg transform -translate-y-1/2 transition-all duration-150 border-pink-500 ${isDragging ? "scale-125 shadow-pink-500/50" : "scale-0 group-hover:scale-100"}`}
          style={{ left: `calc(${volume * 100}% - 8px)` }}
        ></div>
      </div>
      {/* Volume Percentage */}
  <span className="ml-2 text-xs w-8 text-right tabular-nums text-foreground dark:text-foreground">{Math.round(volume * 100)}%</span>
    </div>
  );
};

export default VolumeControl;