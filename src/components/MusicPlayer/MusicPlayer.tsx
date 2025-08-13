import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  SpeakerSimpleHigh,
  SpeakerSimpleX,
  Shuffle,
  Repeat,
} from "phosphor-react";
import ProgressBar from "../ProgressBar/progressBar";
import Playlist from "../Playlist/playlist";
import { tracks } from "../../data/tracks";
import { useState, useRef, useEffect, useCallback } from "react";
import Nailong from "../../assets/nailong.png";
import {
  ScrollVelocityContainer,
  ScrollVelocityRow,
} from "@/components/magicui/scroll-based-velocity";

const MusicPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(6);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [repeatMode, setRepeatMode] = useState<"none" | "one" | "all">("none");
  const [isShuffled, setIsShuffled] = useState(false);

  const [volume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const currentTrack = tracks[currentTrackIndex];

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getRandomTrackIndex = useCallback(
    (excludeIndex: number) => {
      let idx = Math.floor(Math.random() * tracks.length);
      while (tracks.length > 1 && idx === excludeIndex) {
        idx = Math.floor(Math.random() * tracks.length);
      }
      return idx;
    },
    []
  );

  const playTrackAtIndex = useCallback((index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setTimeout(() => {
      audioRef.current?.play();
      if (videoRef.current) videoRef.current.play();
    }, 0);
  }, []);

  const handlePrevious = useCallback(() => {
    if (isShuffled) {
      playTrackAtIndex(getRandomTrackIndex(currentTrackIndex));
    } else {
      const newIndex =
        currentTrackIndex > 0 ? currentTrackIndex - 1 : tracks.length - 1;
      playTrackAtIndex(newIndex);
    }
  }, [isShuffled, currentTrackIndex, getRandomTrackIndex, playTrackAtIndex]);

  const handleNext = useCallback(() => {
    if (isShuffled) {
      playTrackAtIndex(getRandomTrackIndex(currentTrackIndex));
    } else {
      const newIndex =
        currentTrackIndex < tracks.length - 1 ? currentTrackIndex + 1 : 0;
      playTrackAtIndex(newIndex);
    }
  }, [isShuffled, currentTrackIndex, getRandomTrackIndex, playTrackAtIndex]);

  const handleTrackEnd = useCallback(() => {
    if (repeatMode === "one") {
      audioRef.current!.currentTime = 0;
      videoRef.current!.currentTime = 0;
      audioRef.current?.play();
      videoRef.current?.play();
      setIsPlaying(true);
      return;
    }

    if (isShuffled) {
      if (tracks.length > 1) {
        playTrackAtIndex(getRandomTrackIndex(currentTrackIndex));
      } else {
        setIsPlaying(false);
      }
      return;
    }

    if (repeatMode === "all") {
      const nextIndex =
        currentTrackIndex === tracks.length - 1 ? 0 : currentTrackIndex + 1;
      playTrackAtIndex(nextIndex);
      return;
    }

    if (currentTrackIndex < tracks.length - 1) {
      playTrackAtIndex(currentTrackIndex + 1);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [
    repeatMode,
    isShuffled,
    currentTrackIndex,
    getRandomTrackIndex,
    playTrackAtIndex,
  ]);

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      video?.pause();
    } else {
      audio.play();
      video?.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      if (videoRef.current) videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleRepeat = () => {
    const modes: Array<"none" | "one" | "all"> = ["none", "one", "all"];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleTrackEnd);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleTrackEnd);
    };
  }, [handleTrackEnd]);

  return (
    <div className="relative min-h-[calc(100dvh-78px)] flex items-center justify-center bg-background text-foreground transition-colors duration-300 px-2 sm:px-4 md:px-8 overflow-hidden">

      <audio ref={audioRef} src={currentTrack.audioUrl} preload="metadata" />

      {currentTrack.videoUrl && (
        <video
          ref={videoRef}
          key={currentTrack.videoUrl}
          className="absolute inset-0 w-full h-full object-cover opacity-30 scale-100"
          src={currentTrack.videoUrl}
          autoPlay
          muted
          loop
          playsInline
          style={{ pointerEvents: "none", zIndex: 1 }}
        />
      )}
      <div className="relative z-10 w-full max-w-[1280px] p-2 sm:p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PLAYER PANEL */}
          <div className="lg:col-span-2  rounded-3xl p-8  text-card-foreground transition-colors duration-300 overflow-hidden">
            {/* Track Info */}
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col justify-between overflow-hidden">
                <div className="text-center md:text-left">
                  <div>
                    <div className="flex flex-col-reverse lg:flex-row gap-5 md:justify-center md:items-center">
                      <div className="aspect-square min-w-64 max-w-64 mx-auto md:mx-0 rounded-3xl overflow-hidden shadow-2xl">
                        <img
                          src={currentTrack.coverUrl}
                          className="w-full h-full object-cover"
                          alt={currentTrack.album}
                        />
                      </div>
                      <div className="flex flex-1 justify-center lg:text-left font-fjalla">
                        <div className="text-center flex justify-center flex-col lg:text-left w-full">
                          <h2 className="text-[clamp(1.5rem,6vw,3rem)] font-lobster mb-2 ">
                            {currentTrack.title}
                          </h2>
                          <p className="text-muted-foreground text-[clamp(0.8rem,4vw,1.2rem)]">
                            {currentTrack.artist}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Scrolling Text */}
                  <div className="rounded-2xl w-full overflow-hidden my-5 font-fjalla">
                    <ScrollVelocityContainer
                      className="w-full max-w-full text-[clamp(2rem,3vw,4rem)] font-bold whitespace-nowrap"
                      paused={!isPlaying}
                    >
                      <ScrollVelocityRow baseVelocity={20} direction={1}>
                        {currentTrack.title}&nbsp;
                      </ScrollVelocityRow>
                      <ScrollVelocityRow baseVelocity={20} direction={-1}>
                        {currentTrack.artist}&nbsp;
                      </ScrollVelocityRow>
                    </ScrollVelocityContainer>
                  </div>
                </div>

                {/* Controls */}
                <div className="mt-5 p-5">
                  <ProgressBar
                    currentTime={currentTime}
                    duration={duration || currentTrack.duration}
                    onSeek={handleSeek}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(currentTrack.duration)}</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 mt-6 w-full mx-auto">
                    {/* Shuffle */}
                    <button
                      className={`p-2 sm:p-3 rounded-full transition-all duration-300 border ${isShuffled
                        ? "bg-primary text-primary-foreground border-primary shadow-lg"
                        : "bg-secondary hover:bg-secondary/80 border-secondary"
                        }`}
                      onClick={() => setIsShuffled(!isShuffled)}
                    >
                      <Shuffle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                    </button>

                    {/* Previous */}
                    <button
                      className="p-2 sm:p-3 rounded-full transition-all duration-300 bg-secondary hover:bg-accent hover:scale-110"
                      onClick={handlePrevious}
                    >
                      <SkipBack className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                    </button>

                    {/* Play / Pause */}
                    <button
                      className="p-3 sm:p-4 rounded-full transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/80 hover:scale-110"
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                      ) : (
                        <Play className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                      )}
                    </button>

                    {/* Next */}
                    <button
                      className="p-2 sm:p-3 rounded-full transition-all duration-300 bg-secondary hover:bg-accent hover:scale-110"
                      onClick={handleNext}
                    >
                      <SkipForward className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                    </button>

                    {/* Repeat */}
                    <button
                      className="relative p-2 sm:p-3 rounded-full transition-all duration-300 bg-secondary hover:bg-accent hover:scale-110"
                      onClick={toggleRepeat}
                    >
                      <Repeat className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                      {repeatMode === "one" && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-bold">
                          1
                        </span>
                      )}
                    </button>

                    {/* Volume */}
                    <button
                      className="p-1 sm:p-2 hover:scale-110 transition-all duration-300"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? (
                        <SpeakerSimpleX className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                      ) : (
                        <SpeakerSimpleHigh className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* PLAYLIST */}
          <div className="relative rounded-3xl p-6 text-card-foreground transition-colors duration-300 tracking-widest">
            <div className="flex items-center justify-between mb-6 mx-6">
              <h3 className="text-[clamp(1.5rem,6vw,2rem)] font-semibold font-lobster">Playlist</h3>
              <img src={Nailong} alt="" className="w-10 h-10" />
            </div>
            <div
              className="space-y-3 h-[clamp(512px,40vh,100vh)] overflow-y-auto overflow-x-hidden 
               [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden text-[clamp(1rem,6vw,1.5rem)]"
            >
              {tracks.map((track, index) => (
                <Playlist
                  key={index}
                  track={track}
                  isActive={index === currentTrackIndex}
                  onClick={() => playTrackAtIndex(index)}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>


  );
};

export default MusicPlayer;
