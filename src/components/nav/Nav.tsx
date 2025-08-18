import { WordRotate } from "../magicui/word-rotate";
import { AnimatedThemeToggler } from "../magicui/animated-theme-toggler";
const Nav = () => {
  return (
    <>
      <div className="flex items-center justify-around p-[12px] text-foreground bg-primary-foreground transition-colors duration-300 fixed w-full">
        <WordRotate words={["Caelven", "Music", "Playlist"]} className="text-[clamp(1.5rem,6vw,3rem)] font-bold md:text-3xl lg:text-5xl cursor-pointer font-spotify-display tracking-tight" />
        <AnimatedThemeToggler className="text-4xl font-bold cursor-pointer" />
      </div>
    </>
  )
}

export default Nav