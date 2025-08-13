import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  SpeakerSimpleHigh,
  SpeakerSimpleX,
  Shuffle,
  Repeat
} from "phosphor-react";
import ProgressBar from "../ProgressBar/progressBar";
import Playlist from "../Playlist/playlist";
import { tracks } from "../../data/tracks";
import { useState, useRef, useEffect, useCallback } from "react";
import Nailong from "../../assets/nailong.png";
import {
  ScrollVelocityContainer,
  ScrollVelocityRow
} from "@/components/magicui/scroll-based-velocity";
import { motion, AnimatePresence } from "framer-motion";

const MusicPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
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
    setTimeout(() => audioRef.current?.play(), 0);
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
      audioRef.current?.play();
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
    playTrackAtIndex
  ]);

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
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
    <div className="min-h-[calc(100dvh-78px)] flex items-center justify-center bg-background text-foreground px-2 sm:px-4 md:px-8">
      <audio ref={audioRef} src={currentTrack.audioUrl} preload="metadata" />
      <div className="w-full max-w-[1280px] p-2 sm:p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 backdrop-blur-xl rounded-3xl p-8 shadow-2xl bg-card">
            <div className="flex flex-col md:flex-row gap-8 ">
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
                      <div className="flex flex-1 justify-center lg:text-left">
                        <div className="text-center flex justify-center flex-col lg:text-left w-full">
                          <h2 className="text-5xl font-bold mb-2">
                            {currentTrack.title}
                          </h2>
                          <p className="text-muted-foreground">
                            {currentTrack.artist}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl w-full overflow-hidden my-5">
                    <ScrollVelocityContainer
                      className="w-full max-w-full text-3xl md:text-4xl lg:text-5xl font-bold whitespace-nowrap"
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
                <div className="mt-5">
                  <ProgressBar
                    currentTime={currentTime}
                    duration={duration || currentTrack.duration}
                    onSeek={handleSeek}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(currentTrack.duration)}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                    {/* Animated Shuffle */}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      animate={{
                        scale: isShuffled ? 1.2 : 1,
                        rotate: isShuffled ? 15 : 0
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`p-3 rounded-full border ${
                        isShuffled
                          ? "bg-primary text-primary-foreground border-primary shadow-lg"
                          : "bg-secondary text-secondary-foreground border-secondary"
                      }`}
                      onClick={() => setIsShuffled(!isShuffled)}
                    >
                      <Shuffle className="w-8 h-8" />
                    </motion.button>

                    <button
                      className="p-3 rounded-full bg-secondary hover:scale-110"
                      onClick={handlePrevious}
                    >
                      <SkipBack className="w-8 h-8" />
                    </button>

                    <button
                      className="p-4 rounded-full bg-primary text-primary-foreground hover:scale-110"
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? (
                        <Pause className="w-12 h-12" />
                      ) : (
                        <Play className="w-12 h-12" />
                      )}
                    </button>

                    <button
                      className="p-3 rounded-full bg-secondary hover:scale-110"
                      onClick={handleNext}
                    >
                      <SkipForward className="w-8 h-8" />
                    </button>

                    {/* Animated Repeat */}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      animate={{
                        rotate: repeatMode !== "none" ? 360 : 0,
                        scale: repeatMode !== "none" ? 1.2 : 1
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="relative p-3 rounded-full bg-secondary"
                      onClick={toggleRepeat}
                    >
                      <Repeat className="w-8 h-8" />
                      <AnimatePresence>
                        {repeatMode === "one" && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground"
                          >
                            1
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    <button
                      className="p-2"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? (
                        <SpeakerSimpleX className="w-8 h-8" />
                      ) : (
                        <SpeakerSimpleHigh className="w-8 h-8" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Playlist */}
          <div className="relative backdrop-blur-xl rounded-3xl p-6 shadow-2xl bg-card">
            <div className="flex items-center justify-between mb-6 mx-6">
              <h3 className="text-lg font-semibold">Playlist</h3>
              <img src={Nailong} alt="" className="w-10 h-10" />
            </div>
            <div className="space-y-3 h-128 overflow-y-auto scrollbar-thin">
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
