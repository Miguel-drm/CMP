import { Play, Pause, SkipBack, SkipForward, SpeakerSimpleHigh, SpeakerSimpleX, Heart, Shuffle, Repeat } from "phosphor-react";
import ProgressBar from "../ProgressBar/progressBar"
import Playlist from "../Playlist/playlist";
import { tracks } from "../../data/tracks"
import { useState, useRef, useEffect } from "react";
// import { track } from "motion/react-client";


const MusicPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [repeatMode, setRepeatMode] = useState("none");
  const [isShuffled, setIsShuffled] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    }
    const updateDuration = () => {
      setDuration(audio.duration);
    }
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleTrackEnd);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleTrackEnd);
    }
  }, [currentTrackIndex]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    setIsPlaying(!isPlaying);
  };
   
  const getRandomTrackIndex = (excludeIndex: number) => {
    let idx = Math.floor(Math.random() * tracks.length);
    // Avoid picking the same track
    while (tracks.length > 1 && idx === excludeIndex) {
      idx = Math.floor(Math.random() * tracks.length);
    }
    return idx;
  };

  const handlePrevious = () => {
    if (isShuffled) {
      const randomIndex = getRandomTrackIndex(currentTrackIndex);
      setCurrentTrackIndex(randomIndex);
    } else {
      const newIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : tracks.length - 1;
      setCurrentTrackIndex(newIndex);
    }
    setIsPlaying(true);
    setTimeout(() => {
      audioRef.current?.play();
    }, 0);
  };

  const handleNext = () => {
    if (isShuffled) {
      const randomIndex = getRandomTrackIndex(currentTrackIndex);
      setCurrentTrackIndex(randomIndex);
    } else {
      const newIndex = currentTrackIndex < tracks.length - 1 ? currentTrackIndex + 1 : 0;
      setCurrentTrackIndex(newIndex);
    }
    setIsPlaying(true);
    setTimeout(() => {
      audioRef.current?.play();
    }, 0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleRepeat = () => {
    const modes = ["none", "one", "all"];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const handleSeek = (time: number) => {
    if(audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // const handleTrackEnd = () => {
  //   if (repeatMode === "one") {
  //     if (audioRef.current) {
  //       audioRef.current.currentTime = 0;
  //       audioRef.current.play();
  //     }
  //   } else if (repeatMode === "all") {
  //     handleNext();
  //   }
  // };
  const handleTrackEnd = () => {
    if (repeatMode === "one") {
      // Repeat current track
      audioRef.current!.currentTime = 0;
      audioRef.current?.play();
      setIsPlaying(true);
      return;
    }
    if (isShuffled) {
      // Shuffle mode: go to a random next track, unless only one track
      if (tracks.length > 1) {
        let nextIndex = getRandomTrackIndex(currentTrackIndex);
        setCurrentTrackIndex(nextIndex);
        setIsPlaying(true);
        setTimeout(() => {
          audioRef.current?.play();
        }, 0);
      } else {
        setIsPlaying(false);
      }
      return;
    }
    if (repeatMode === "all") {
      // Repeat all: go to next, or loop to start
      if (currentTrackIndex === tracks.length - 1) {
        setCurrentTrackIndex(0);
      } else {
        setCurrentTrackIndex(currentTrackIndex + 1);
      }
      setIsPlaying(true);
      setTimeout(() => {
        audioRef.current?.play();
      }, 0);
      return;
    }
    // No repeat, no shuffle: go to next or stop at end
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
      setIsPlaying(true);
      setTimeout(() => {
        audioRef.current?.play();
      }, 0);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  useEffect(() => {
    if (audioRef.current){
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);


  return (
  <div className="min-h-[calc(100dvh-78px)] flex items-center justify-center bg-background text-foreground transition-colors duration-300 px-2 sm:px-4 md:px-8">
      <audio ref={audioRef} src={currentTrack.audioUrl} preload="metadata" />
      <div className="w-full max-w-[1280px] p-2 sm:p-4 md:p-6 lg:p-8">
        {/* Music Player Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 backdrop-blur-xl rounded-3xl p-8 shadow-2xl bg-card text-card-foreground transition-colors duration-300">
            {/* Album */}
            <div className="flex flex-col md:flex-row gap-8 ">
              <div className="flex-shrink-0">
                <div className="w-64 h-64 mx-auto md:mx-0 rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-500 group-hover:scale-105 bg-muted">
                  {/* Image */}
                  <img src={currentTrack.coverUrl} className="w-full h-full object-cover" alt={currentTrack.album} />
                </div>
              </div>

              {/* Track & Controls */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="text-center md:text-left ">
                  <h2 className="text-2xl font-bold mb-2">
                    {currentTrack.title}
                  </h2>
                  <p className="text-muted-foreground"> {currentTrack.artist} </p>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
                    <button className={`p-2 sm:p-3 md:p-4 rounded-full transition-all duration-300 border 
                    {isLiked ? "bg-pink-500 shadow-lg text-white border-pink-500" : "bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80"}`}
                    onClick={() => setIsLiked(!isLiked)}>
                      <Heart className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" weight={isLiked ? "fill" : "regular"} />
                    </button>
                    <button className="px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-secondary rounded-full text-secondary-foreground font-semibold hover:shadow-lg hover:bg-secondary/80 transition-all duration-300 cursor-pointer text-base sm:text-lg"> Add to Playlist</button>
                  </div>
                </div>
                {/* Progress Section */}
                <div className="mt-8">
                  <ProgressBar 
                    currentTime={currentTime} 
                    duration={ duration || currentTrack.duration } 
                    onSeek={handleSeek} />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(currentTrack.duration)}</span>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-2 md:gap-3 mt-6 w-full min-w-0 mx-auto">
                    <button className={`p-1 sm:p-2 md:p-3 rounded-full transition-all duration-300 bg-secondary text-secondary-foreground border
                    ${isShuffled ? "bg-primary text-primary-foreground border-primary shadow-lg" : "hover:bg-secondary/80 border-secondary"}`}
                    onClick={() => setIsShuffled(!isShuffled)}>
                      <Shuffle className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
                    </button>
                    <button className="p-1 sm:p-2 md:p-3 rounded-full transition-all duration-300 bg-secondary hover:bg-accent hover:scale-110 text-secondary-foreground">
                      <SkipBack className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" onClick={handlePrevious} />
                    </button>
                    <button className="p-2 sm:p-3 md:p-4 rounded-full transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground hover:scale-110"
                      onClick={handlePlayPause}>
                      {isPlaying
                        ? <Pause className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" />
                        : <Play className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" />}
                    </button>
                    <button className="p-1 sm:p-1 md:p-3 rounded-full transition-all duration-300 bg-secondary hover:bg-accent hover:scale-110 text-secondary-foreground">
                      <SkipForward className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" onClick={handleNext} />
                    </button>
                    <button className="relative p-1 sm:p-2 md:p-3 rounded-full transition-all duration-300 bg-secondary hover:bg-accent hover:scale-110 text-secondary-foreground"
                      onClick={toggleRepeat}>
                      <Repeat className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
                      {repeatMode === "one" && (<span className="absolute -top-1 -right-1 w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 bg-primary rounded-full flex items-center justify-center font-bold text-xs text-primary-foreground">
                        1
                      </span>)}
                    </button>

                    {/* Volume Controls: Show mute/unmute button with icon and handler */}
                    <div className="flex items-center gap-1 sm:gap-2 md:gap-3 min-w-0 max-w-full">
                      <button className="text-foreground hover:scale-110 transition-all duration-300 p-1 sm:p-2"
                        onClick={() => setIsMuted(!isMuted)}>
                        {isMuted
                          ? <SpeakerSimpleX className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
                          : <SpeakerSimpleHigh className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Playlist Side Bar */}
          <div className="backdrop-blur-xl rounded-3xl p-6 shadow-2xl bg-card text-card-foreground transition-colors duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Playlist</h3>
              {/* <p className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">Track Length</p> */}
            </div>
            <div className="space-y-3 h-96 overflow-y-auto overflow-x-hidden">
              {tracks.map((track, index) => (
                <Playlist 
                key={index} 
                track={track} 
                isActive={index === currentTrackIndex} 
                onClick={() => {
                  setCurrentTrackIndex(index);
                  setIsPlaying(true);
                  setTimeout(() => {
                    audioRef.current?.play();
                  }, 0);
                }} 
              />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MusicPlayer

