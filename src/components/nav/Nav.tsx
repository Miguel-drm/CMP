import { WordRotate } from "../magicui/word-rotate";
import { AnimatedThemeToggler } from "../magicui/animated-theme-toggler";
import ActiveListeners from "../ActiveListeners/ActiveListeners";
const Nav = () => {
  return (
    <>
      <div className="flex items-center justify-around px-4 py-[12px] text-foreground bg-primary-foreground transition-colors duration-300 fixed w-full">
        <WordRotate words={["Caelven", "Music", "Playlist"]} className="text-[clamp(1.5rem,6vw,3rem)] font-bold md:text-3xl lg:text-5xl cursor-pointer font-spotify-display tracking-tight" />
        <div className="flex items-center gap-8">
          <ActiveListeners />
          <AnimatedThemeToggler className="text-4xl font-bold cursor-pointer" />
        </div>
      </div>
    </>
  )
}

export default Nav