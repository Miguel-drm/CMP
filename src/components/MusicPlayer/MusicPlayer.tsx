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

  // Format time
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Get random track index, avoiding the current one
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

  // Play track by index
  const playTrackAtIndex = useCallback((index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play(), 0);
  }, []);

  // Navigation
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

  // End of track handling
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

  // Toggle play/pause
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

  // Seek handler
  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Repeat mode toggle
  const toggleRepeat = () => {
    const modes: Array<"none" | "one" | "all"> = ["none", "one", "all"];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  // Update volume on mute change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Audio event listeners
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
    <div className="min-h-[calc(100dvh-78px)] flex items-center justify-center bg-background text-foreground transition-colors duration-300 px-2 sm:px-4 md:px-8">
      <audio ref={audioRef} src={currentTrack.audioUrl} preload="metadata" />
      <div className="w-full max-w-[1280px] p-2 sm:p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 backdrop-blur-xl rounded-3xl p-8 shadow-2xl bg-card text-card-foreground transition-colors duration-300">
            <div className="flex flex-col md:flex-row gap-8 ">
              <div className="flex flex-col justify-between overflow-hidden">
                <div className="text-center md:text-left">
                  <div>
                    <div className="flex flex-col-reverse lg:flex-row gap-5 md:justify-center md:items-center">
                      <div className="aspect-square min-w-64 max-w-64 mx-auto md:mx-0 rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-500 group-hover:scale-105 bg-muted">
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
                    <div className="rounded-2xl w-full overflow-hidden">
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
                  <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-2 md:gap-3 mt-6 w-full min-w-0 mx-auto pe-5">
                    <button
                      className={`p-1 sm:p-2 md:p-3 rounded-full transition-all duration-300 bg-secondary text-secondary-foreground border
                    ${isShuffled ? "bg-primary text-primary-foreground border-primary shadow-lg" : "hover:bg-secondary/80 border-secondary"}`}
                      onClick={() => setIsShuffled(!isShuffled)}
                    >
                      <Shuffle className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
                    </button>
                    <button
                      className="p-1 sm:p-2 md:p-3 rounded-full transition-all duration-300 bg-secondary hover:bg-accent hover:scale-110 text-secondary-foreground"
                      onClick={handlePrevious}
                    >
                      <SkipBack className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
                    </button>
                    <button
                      className="p-2 sm:p-3 md:p-4 rounded-full transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground hover:scale-110"
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? (
                        <Pause className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" />
                      ) : (
                        <Play className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" />
                      )}
                    </button>
                    <button
                      className="p-1 sm:p-1 md:p-3 rounded-full transition-all duration-300 bg-secondary hover:bg-accent hover:scale-110 text-secondary-foreground"
                      onClick={handleNext}
                    >
                      <SkipForward className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
                    </button>
                    <button
                      className="relative p-1 sm:p-2 md:p-3 rounded-full transition-all duration-300 bg-secondary hover:bg-accent hover:scale-110 text-secondary-foreground"
                      onClick={toggleRepeat}
                    >
                      <Repeat className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
                      {repeatMode === "one" && (
                        <span className="absolute -top-1 -right-1 w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 bg-primary rounded-full flex items-center justify-center font-bold text-xs text-primary-foreground">
                          1
                        </span>
                      )}
                    </button>
                    <div className="flex items-center gap-1 sm:gap-2 md:gap-3 min-w-0 max-w-full">
                      <button
                        className="text-foreground hover:scale-110 transition-all duration-300 p-1 sm:p-2"
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? (
                          <SpeakerSimpleX className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
                        ) : (
                          <SpeakerSimpleHigh className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative backdrop-blur-xl rounded-3xl p-6 shadow-2xl bg-card text-card-foreground transition-colors duration-300">
            <div className="flex items-center justify-between mb-6 mx-6">
              <h3 className="text-lg font-semibold">Playlist</h3>
              <img src={Nailong} alt="" className="w-10 h-10" />
            </div>
            <div className="space-y-3 h-128 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted-foreground/30 scrollbar-thumb-primary/40 dark:scrollbar-thumb-muted-foreground/60 dark:scrollbar-thumb-primary/60 scrollbar-track-transparent">
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
