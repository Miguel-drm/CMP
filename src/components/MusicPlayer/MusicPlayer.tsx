import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
} from "phosphor-react";
import ProgressBar from "../ProgressBar/progressBar";
import Playlist from "../Playlist/playlist";
import { tracks } from "../../data/tracks";
import { useState, useRef, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import Nailong from "../../assets/nailong.png";
import {
  ScrollVelocityContainer,
  ScrollVelocityRow,
} from "@/components/magicui/scroll-based-velocity";
import { Ripple } from "../magicui/ripple";

const MusicPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);

  // Animation refs
  const albumCoverRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const artistRef = useRef<HTMLParagraphElement>(null);
  const scrollingTextRef = useRef<HTMLDivElement>(null);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [previewTime, setPreviewTime] = useState<number | null>(null);
  const [showVideo, setShowVideo] = useState(false);

  // Simplified repeat: false = repeat queue (default), true = repeat current song
  const [repeatCurrentSong, setRepeatCurrentSong] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [shuffleHistory, setShuffleHistory] = useState<number[]>([]);

  const currentTrack = tracks[currentTrackIndex];

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Handle preview time from progress bar

  // Video control functions
  const showBackgroundVideo = useCallback(() => {
    console.log('showBackgroundVideo called');
    const video = backgroundVideoRef.current;
    console.log('Video element:', video);
    console.log('Video URL:', currentTrack.videoUrl);
    
    if (video && currentTrack.videoUrl) {
      console.log('Setting video src to:', currentTrack.videoUrl);
      video.src = currentTrack.videoUrl;
      video.currentTime = Math.max(0, currentTime - currentTrack.showVideoSecond);
      
      if (isPlaying) {
        console.log('Playing video');
        video.play().catch((error) => {
          console.error('Error playing video:', error);
        });
      }
      
      setShowVideo(true);
      console.log('Set showVideo to true');
      
      // Ultra-smooth GSAP fade-in animation
      const tl = gsap.timeline();
      tl.set(backgroundVideoRef.current, { 
        opacity: 0, 
        scale: 1.02,
        filter: "blur(8px) brightness(1.1)",
        transformOrigin: "center center"
      })
      .to(backgroundVideoRef.current, {
        opacity: 0.2,
        duration: 0.4,
        ease: "sine.out"
      })
      .to(backgroundVideoRef.current, {
        opacity: 0.5,
        scale: 1.01,
        filter: "blur(4px) brightness(1.05)",
        duration: 0.8,
        ease: "power2.out"
      }, "-=0.2")
      .to(backgroundVideoRef.current, {
        opacity: 0.65,
        scale: 1,
        filter: "blur(0px) brightness(1)",
        duration: 1.2,
        ease: "power1.out"
      }, "-=0.4")
      .to(backgroundVideoRef.current, {
        opacity: 0.7,
        duration: 0.6,
        ease: "sine.inOut"
      }, "-=0.3");
    } else {
      console.log('Video element or videoUrl missing:', { video: !!video, videoUrl: currentTrack.videoUrl });
    }
  }, [currentTrack, currentTime, isPlaying]);

  const hideBackgroundVideo = useCallback(() => {
    const video = backgroundVideoRef.current;
    if (video) {
      // Ultra-smooth GSAP fade-out animation
      const tl = gsap.timeline();
      tl.to(backgroundVideoRef.current, {
        opacity: 0.4,
        filter: "blur(2px) brightness(0.9)",
        duration: 0.4,
        ease: "sine.inOut"
      })
      .to(backgroundVideoRef.current, {
        opacity: 0.15,
        scale: 0.98,
        filter: "blur(6px) brightness(0.7)",
        duration: 0.6,
        ease: "power2.inOut"
      }, "-=0.2")
      .to(backgroundVideoRef.current, {
        opacity: 0,
        scale: 0.96,
        filter: "blur(12px) brightness(0.5)",
        duration: 0.8,
        ease: "power3.in",
        onComplete: () => {
          video.pause();
          video.src = "";
          setShowVideo(false);
          // Reset properties for next time
          gsap.set(backgroundVideoRef.current, {
            scale: 1,
            filter: "blur(0px) brightness(1)",
            transformOrigin: "center center"
          });
        }
      }, "-=0.3");
    }
  }, []);

  // Check if video should be shown based on current time
  useEffect(() => {
    console.log('Video check:', {
      currentTime,
      showVideoSecond: currentTrack.showVideoSecond,
      videoUrl: currentTrack.videoUrl,
      showVideo,
      isPlaying,
      shouldShow: currentTime >= currentTrack.showVideoSecond && !showVideo && isPlaying
    });
    
    if (currentTrack.videoUrl && currentTrack.showVideoSecond) {
      if (currentTime >= currentTrack.showVideoSecond && !showVideo && isPlaying) {
        console.log('Showing video at', currentTime);
        showBackgroundVideo();
      } else if (currentTime < currentTrack.showVideoSecond && showVideo) {
        console.log('Hiding video at', currentTime);
        hideBackgroundVideo();
      }
    }
  }, [currentTime, currentTrack, showVideo, isPlaying, showBackgroundVideo, hideBackgroundVideo]);

  // Sync background video with audio
  useEffect(() => {
    const video = backgroundVideoRef.current;
    if (video && showVideo) {
      if (isPlaying) {
        video.play().catch(console.error);
      } else {
        video.pause();
      }
    }
  }, [isPlaying, showVideo]);

  // Animation function for track changes
  const animateTrackChange = useCallback(() => {
    const tl = gsap.timeline();

    // Hide video when changing tracks
    if (showVideo) {
      hideBackgroundVideo();
    }

    // Animate out current elements
    tl.to([albumCoverRef.current, titleRef.current, artistRef.current, scrollingTextRef.current], {
      opacity: 0,
      duration: 0.3,
      ease: "power2.out"
    })
    // Reset positions for incoming animation
    .set(albumCoverRef.current, { x: -100, scale: 0.8 })
    .set([titleRef.current, artistRef.current], { y: -30 })
    .set(scrollingTextRef.current, { y: 20, scale: 0.95 })
    // Animate in new elements
    .to(albumCoverRef.current, {
      x: 0,
      scale: 1,
      opacity: 1,
      duration: 0.6,
      ease: "back.out(1.7)"
    }, "+=0.1")
    .to([titleRef.current, artistRef.current], {
      y: 0,
      opacity: 1,
      duration: 0.5,
      ease: "power2.out",
      stagger: 0.1
    }, "-=0.4")
    .to(scrollingTextRef.current, {
      y: 0,
      scale: 1,
      opacity: 1,
      duration: 0.4,
      ease: "power2.out"
    }, "-=0.2");

    return tl;
  }, [showVideo, hideBackgroundVideo]);

  // Enhanced shuffle logic with proper queue management
  const createShuffledQueue = useCallback(() => {
    const indices = Array.from({ length: tracks.length }, (_, i) => i);
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, [tracks.length]);

  const getNextShuffledTrack = useCallback(() => {
    if (shuffledIndices.length === 0) {
      const newQueue = createShuffledQueue();
      setShuffledIndices(newQueue);
      return newQueue[0];
    }
    
    const currentIndexInQueue = shuffledIndices.indexOf(currentTrackIndex);
    if (currentIndexInQueue === -1 || currentIndexInQueue === shuffledIndices.length - 1) {
      // Current track not in queue or at end - always repeat queue (create new shuffled queue)
      const newQueue = createShuffledQueue();
      setShuffledIndices(newQueue);
      return newQueue[0];
    }
    
    return shuffledIndices[currentIndexInQueue + 1];
  }, [shuffledIndices, currentTrackIndex, createShuffledQueue]);

  const getPreviousShuffledTrack = useCallback(() => {
    if (shuffleHistory.length > 0) {
      const previousTrack = shuffleHistory[shuffleHistory.length - 1];
      setShuffleHistory(prev => prev.slice(0, -1));
      return previousTrack;
    }
    
    // If no history, go to a random track
    const availableIndices = Array.from({ length: tracks.length }, (_, i) => i)
      .filter(i => i !== currentTrackIndex);
    return availableIndices[Math.floor(Math.random() * availableIndices.length)];
  }, [shuffleHistory, currentTrackIndex, tracks.length]);

  const playTrackAtIndex = useCallback((index: number) => {
    // Add current track to shuffle history if shuffled
    if (isShuffled && currentTrackIndex !== index) {
      setShuffleHistory(prev => [...prev, currentTrackIndex]);
    }
    
    // Only animate if track is actually changing
    const isTrackChanging = index !== currentTrackIndex;
    
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    
    // Trigger animation if track changed
    if (isTrackChanging) {
      setTimeout(() => {
        animateTrackChange();
      }, 50);
    }
    
    setTimeout(() => {
      audioRef.current?.play();
      if (videoRef.current) videoRef.current.play();
    }, 0);
  }, [isShuffled, currentTrackIndex, animateTrackChange]);

  const handlePrevious = useCallback(() => {
    let newIndex: number;
    
    if (isShuffled) {
      newIndex = getPreviousShuffledTrack();
    } else {
      // Always loop back to end when at beginning (queue repeat behavior)
      newIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : tracks.length - 1;
    }
    
    playTrackAtIndex(newIndex);
  }, [isShuffled, currentTrackIndex, getPreviousShuffledTrack, playTrackAtIndex, tracks.length]);

  const handleNext = useCallback(() => {
    let newIndex: number;
    
    if (isShuffled) {
      newIndex = getNextShuffledTrack();
    } else {
      // Always loop back to beginning when at end (queue repeat behavior)
      newIndex = currentTrackIndex < tracks.length - 1 ? currentTrackIndex + 1 : 0;
    }
    
    playTrackAtIndex(newIndex);
  }, [isShuffled, currentTrackIndex, getNextShuffledTrack, playTrackAtIndex, tracks.length]);

  const handleTrackEnd = useCallback(() => {
    // Repeat Current Song: replay current track
    if (repeatCurrentSong) {
      const audio = audioRef.current;
      const video = videoRef.current;
      
      if (audio) {
        // Reset the audio position
        audio.currentTime = 0;
        setCurrentTime(0);
        
        // Hide video when restarting
        if (showVideo) {
          hideBackgroundVideo();
        }
        
        // Use a small delay to ensure the audio element is ready
        setTimeout(() => {
          audio.play().then(() => {
            setIsPlaying(true);
            if (video) {
              video.currentTime = 0;
              video.play().catch(console.error);
            }
          }).catch((error) => {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
          });
        }, 100);
      }
      return;
    }

    // Default behavior: continue to next track (queue repeat)
    handleNext();
  }, [repeatCurrentSong, handleNext, showVideo, hideBackgroundVideo]);

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
      
      // Sync background video
      if (backgroundVideoRef.current && showVideo) {
        const videoTime = Math.max(0, time - currentTrack.showVideoSecond);
        backgroundVideoRef.current.currentTime = videoTime;
      }
      
      setCurrentTime(time);
    }
  };

  const toggleRepeat = () => {
    // Simple toggle: off (repeat queue) <-> on (repeat current song)
    setRepeatCurrentSong(!repeatCurrentSong);
  };

  const toggleShuffle = () => {
    const newShuffleState = !isShuffled;
    setIsShuffled(newShuffleState);
    
    if (newShuffleState) {
      // Create initial shuffled queue
      const newQueue = createShuffledQueue();
      setShuffledIndices(newQueue);
      setShuffleHistory([]);
    } else {
      // Clear shuffle state
      setShuffledIndices([]);
      setShuffleHistory([]);
    }
  };

  // Initial animation on component mount
  useEffect(() => {
    gsap.set([albumCoverRef.current, titleRef.current, artistRef.current, scrollingTextRef.current], {
      opacity: 0
    });
    
    const tl = gsap.timeline({ delay: 0.2 });
    tl.set(albumCoverRef.current, { x: -100, scale: 0.8 })
      .set([titleRef.current, artistRef.current], { y: -30 })
      .set(scrollingTextRef.current, { y: 20, scale: 0.95 })
      .to(albumCoverRef.current, {
        x: 0,
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: "back.out(1.7)"
      })
      .to([titleRef.current, artistRef.current], {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.15
      }, "-=0.5")
      .to(scrollingTextRef.current, {
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out"
      }, "-=0.3");
  }, []);

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
    <div className="relative min-h-dvh flex items-center justify-center bg-background text-foreground transition-colors duration-300 px-2 sm:px-4 md:px-8 overflow-hidden">

      {/* Background Video */}
      {true && (
        <video
          ref={backgroundVideoRef}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 pointer-events-none z-0"
          muted
          loop
          playsInline style={{opacity: showVideo ? 0.6 : 0}}
        />
      )}

      {/* Background Overlay */}
      <div className="absolute inset-0 bg-background/40 backdrop-blur-sm z-[1]" />

      <audio ref={audioRef} src={currentTrack.audioUrl} preload="metadata" />

      <div className="relative z-10 w-full max-w-[1280px] p-2 sm:p-4 md:p-6 lg:p-8 ">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">
          {/* PLAYER PANEL */}
          <div className="lg:col-span-2 rounded-3xl p-8 text-card-foreground transition-colors duration-300 overflow-hidden">
            {/* Track Info */}
            <div className="flex flex-col md:flex-row gap-8 mt-13 lg:mt-0">
              <div className="flex flex-col justify-between overflow-hidden">
                <div className="text-center md:text-left">
                  <div>
                    <div className="relative flex flex-col-reverse lg:flex-row gap-5 md:justify-center md:items-center">
                      <div 
                        ref={albumCoverRef}
                        className="aspect-square min-w-64 max-w-64 mx-auto md:mx-0 rounded-3xl shadow-2xl overflow-hidden"
                      >
                        <Ripple className="absolute rounded-2xl inset-0 opacity-80"/>
                        <img
                          src={currentTrack.coverUrl}
                          className="w-full h-full object-cover opacity-100"
                          alt={currentTrack.album}
                        />
                      </div>
                      <div className="flex flex-1 justify-center lg:text-left">
                        <div className="text-center flex justify-center flex-col lg:text-left w-full mt-5">
                          <h2 
                            ref={titleRef}
                            className="text-[clamp(1.5rem,6vw,3rem)] font-bold font-spotify-display mb-2 tracking-tight"
                          >
                            {currentTrack.title}
                          </h2>
                          <p 
                            ref={artistRef}
                            className="text-muted-foreground text-[clamp(0.8rem,4vw,1.2rem)] font-medium font-spotify"
                          >
                            {currentTrack.artist}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Scrolling Text */}
                  <div 
                    ref={scrollingTextRef}
                    className="rounded-2xl w-full overflow-hidden my-5 py-3"
                  >
                    <ScrollVelocityContainer
                      className="w-full max-w-full text-[clamp(2rem,3vw,4rem)] font-bold font-spotify-display whitespace-nowrap tracking-tight"
                      paused={!isPlaying}
                    >
                      <ScrollVelocityRow baseVelocity={20} direction={1}>
                        {currentTrack.title}&nbsp;•&nbsp;
                      </ScrollVelocityRow>
                      <ScrollVelocityRow baseVelocity={20} direction={-1}>
                        {currentTrack.artist}&nbsp;•&nbsp;
                      </ScrollVelocityRow>
                    </ScrollVelocityContainer>
                  </div>
                </div>

                {/* Controls */}
                <div>
                  <ProgressBar
                    currentTime={currentTime}
                    duration={duration || currentTrack.duration}
                    onSeek={handleSeek}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2 font-spotify font-medium">
                    <span>{previewTime !== null ? formatTime(previewTime) : formatTime(currentTime)}</span>
                    <span>{formatTime(currentTrack.duration)}</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8 w-full mx-auto p-2">
                    {/* Shuffle */}
                    <button
                      className={`group cursor-pointer p-2 sm:p-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${
                        isShuffled
                          ? "text-primary bg-primary/10 shadow-sm"
                          : "text-muted-foreground hover:text-foreground bg-transparent hover:bg-muted/20"
                      }`}
                      onClick={toggleShuffle}
                      aria-label={`Shuffle ${isShuffled ? "on" : "off"}`}
                      title={isShuffled ? "Turn off shuffle" : "Turn on shuffle"}
                    >
                      <Shuffle 
                        className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 transition-transform duration-200 group-hover:scale-110" 
                        weight={isShuffled ? "fill" : "regular"}
                      />
                    </button>

                    {/* Previous */}
                    <button
                      className="group cursor-pointer p-2 sm:p-3 rounded-full text-muted-foreground hover:text-foreground bg-transparent hover:bg-muted/20 transition-all duration-200 hover:scale-105 active:scale-95"
                      onClick={handlePrevious}
                      aria-label="Previous"
                    >
                      <SkipBack 
                        className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 transition-transform duration-200 group-hover:scale-110" 
                        weight="fill"
                      />
                    </button>

                    {/* Play / Pause */}
                    <button
                      className="group cursor-pointer w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 transition-all duration-150 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                      onClick={handlePlayPause}
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause 
                          className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 transition-transform duration-200 group-hover:scale-110" 
                          weight="fill"
                        />
                      ) : (
                        <Play 
                          className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 translate-x-[1px] transition-transform duration-200 group-hover:scale-110" 
                          weight="fill"
                        />
                      )}
                    </button>

                    {/* Next */}
                    <button
                      className="group cursor-pointer p-2 sm:p-3 rounded-full text-muted-foreground hover:text-foreground bg-transparent hover:bg-muted/20 transition-all duration-200 hover:scale-105 active:scale-95"
                      onClick={handleNext}
                      aria-label="Next"
                    >
                      <SkipForward 
                        className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 transition-transform duration-200 group-hover:scale-110" 
                        weight="fill"
                      />
                    </button>

                    {/* Repeat Current Song */}
                    <button
                      className={`group cursor-pointer relative p-2 sm:p-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${
                        repeatCurrentSong
                          ? "text-primary bg-primary/10 shadow-sm"
                          : "text-muted-foreground hover:text-foreground bg-transparent hover:bg-muted/20"
                      }`}
                      onClick={toggleRepeat}
                      aria-label={repeatCurrentSong ? "Repeat current song on" : "Repeat current song off"}
                      title={repeatCurrentSong ? "Turn off repeat current song" : "Repeat current song"}
                    >
                      <Repeat 
                        className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 transition-transform duration-200 group-hover:scale-110" 
                        weight={repeatCurrentSong ? "fill" : "regular"}
                      />
                      {repeatCurrentSong && (
                        <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-bold font-spotify shadow-sm">
                          1
                        </span>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* PLAYLIST */}
          <div className="relative rounded-3xl p-6 text-card-foreground transition-colors duration-300">
            <div className="flex items-center justify-between mb-6 mx-6">
              <h3 className="text-[clamp(1.5rem,6vw,2rem)] font-bold font-spotify-display cursor-pointer tracking-tight">Playlist</h3>
              <img src={Nailong} alt="" className="w-10 h-10 cursor-pointer" />
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
