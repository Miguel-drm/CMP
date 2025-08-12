import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import Nav from "./components/nav/Nav";
import { DotPattern } from "./components/magicui/dot-pattern";
import MusicPlayer from "./components/MusicPlayer/MusicPlayer";
import { LoaderOne } from "./components/ui/loader";

function App() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const mainContentRef = useRef(null);
  const navRef = useRef(null);
  const musicRef = useRef(null);
  const dotsRef = useRef(null);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1500);

    const hideTimer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // GSAP intro animation
  useEffect(() => {
    if (!loading) {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        mainContentRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6 }
      )
        .from(navRef.current, { y: -30, opacity: 0, duration: 0.6 }, "-=0.3")
        .from(musicRef.current, { y: 30, opacity: 0, duration: 0.6 }, "-=0.2")
        .from(dotsRef.current, { scale: 0.8, opacity: 0, duration: 0.6 }, "-=0.4");
    }
  }, [loading]);

  return (
    <>
      {loading ? (
        <div
          className={`min-h-dvh bg-black flex items-center justify-center transition-opacity duration-500 ${
            fadeOut ? "opacity-0" : "opacity-100"
          }`}
        >
          <LoaderOne />
        </div>
      ) : (
        <div
          ref={mainContentRef}
          className="relative min-h-[calc(100dvh-78px)] w-full opacity-0"
        >
          <div ref={navRef}>
            <Nav />
          </div>
          <div ref={musicRef}>
            <MusicPlayer />
          </div>
          <div ref={dotsRef}>
            <DotPattern className="opacity-30" />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
