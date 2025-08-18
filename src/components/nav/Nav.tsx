import { WordRotate } from "../magicui/word-rotate";
import { AnimatedThemeToggler } from "../magicui/animated-theme-toggler";
import LiveListenersBadge from "@/components/LiveListenerBadge/LiveListenersBadge";
const Nav = () => {
  return (
    <>
      <div className="flex items-center justify-between px-10 py-[12px] text-foreground bg-primary-foreground transition-colors duration-300 fixed w-full">
        <div>
          <WordRotate words={["Caelven", "Music", "Playlist"]} className="text-[clamp(1.5rem,6vw,3rem)] font-bold md:text-3xl lg:text-5xl cursor-pointer font-spotify-display tracking-tight" />
        </div>
        <div className="flex items-center gap-8">
          <LiveListenersBadge />
          <AnimatedThemeToggler className="text-4xl font-bold cursor-pointer" />
        </div>
      </div>
    </>
  )
}

export default Nav