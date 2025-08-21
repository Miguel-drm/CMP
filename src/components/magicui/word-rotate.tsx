"use client";

import { AnimatePresence, motion, type MotionProps } from "motion/react";
import { useEffect, useState } from "react";

import { cn } from "../../lib/utils";

interface WordRotateProps {
  words: string[];
  duration?: number;
  motionProps?: MotionProps;
  className?: string;
  onWordClick?: (word: string) => void;
}

export function WordRotate({
  words,
  duration = 2500,
  motionProps = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { duration: 0.25, ease: "easeOut" },
  },
  className,
  onWordClick,
}: WordRotateProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [words, duration]);

  const handleClick = () => {
    if (onWordClick) {
      onWordClick(words[index]);
    }
  };

  return (
    <div className="overflow-hidden py-2">
      <AnimatePresence mode="wait">
        <motion.h1
          key={words[index]}
          className={cn(className)}
          onClick={handleClick}
          {...motionProps}
        >
          {words[index]}
        </motion.h1>
      </AnimatePresence>
    </div>
  );
}
