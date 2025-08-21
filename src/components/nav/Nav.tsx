import { useState } from "react";
import { WordRotate } from "../magicui/word-rotate";
import { AnimatedThemeToggler } from "../magicui/animated-theme-toggler";
import LiveListenersBadge from "@/components/LiveListenerBadge/LiveListenersBadge";
import { ModalForm } from "../ui/modal-form";

const Nav = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleWordClick = (word: string) => {
    if (word === "Miguel") {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-10 py-[12px] text-foreground bg-primary-foreground transition-colors duration-300 fixed w-full">
        <div>
          <WordRotate 
            words={["Miguel", "Music", "Playlist"]} 
            className="text-[clamp(1.5rem,6vw,3rem)] font-bold md:text-3xl lg:text-5xl cursor-pointer font-spotify-display tracking-tight" 
            onWordClick={handleWordClick}
          />
        </div>
        <div className="flex items-center gap-8">
          <LiveListenersBadge />
          <AnimatedThemeToggler className="text-4xl font-bold cursor-pointer" />
        </div>
      </div>
      
      <ModalForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}

export default Nav