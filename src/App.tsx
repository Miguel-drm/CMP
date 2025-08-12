
import Nav from "./components/nav/Nav";
import { DotPattern } from "./components/magicui/dot-pattern";
import MusicPlayer from "./components/MusicPlayer/MusicPlayer";
function App() {

  return (
    <>
      <Nav />
      <div className="max-h-screen shadow-md">
        <MusicPlayer/>
        <DotPattern className="opacity-30" />
      </div>
    </>
  )
}

export default App
