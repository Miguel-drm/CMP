import { WordRotate } from "../magicui/word-rotate";
import { AnimatedThemeToggler } from "../magicui/animated-theme-toggler";
const Nav = () => {
  return (
    <>
      <div className="flex items-center justify-around p-[12px] text-foreground transition-colors duration-300 inset-0 z-1000">
        <WordRotate words={["Caelven", "Music", "Playlist"]} className="text-4xl font-bold" />
        <AnimatedThemeToggler className="text-4xl font-bold" />
      </div>
    </>
  )
}

export default Nav