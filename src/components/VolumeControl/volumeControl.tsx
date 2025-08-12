import { useRef, useState, useEffect } from "react";

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

import { SpeakerSimpleHigh, SpeakerSimpleX } from "phosphor-react";
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

  const handleVolumeChange = (e: MouseEvent | React.MouseEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = (e as MouseEvent).clientX;
    const clickX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    onVolumeChange(percentage);
  };

  // Only show mute/unmute icon, no slider or percentage
  return (
    <div className="flex items-center gap-2 select-none">
      {volume === 0 ? (
        <SpeakerSimpleX size={24} />
      ) : (
        <SpeakerSimpleHigh size={24} />
      )}
    </div>
  );
};

export default VolumeControl;