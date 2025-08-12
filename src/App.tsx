
import Nav from "./components/nav/Nav";
import { DotPattern } from "./components/magicui/dot-pattern";
import MusicPlayer from "./components/MusicPlayer/MusicPlayer";
function App() {

  return (
    <>
    <div className="relative min-h-[calc(100dvh-78px)] w-full">
      <Nav />
        <MusicPlayer/>
        <DotPattern className="opacity-30" />
      </div>
    </>
  )
}

export default App
