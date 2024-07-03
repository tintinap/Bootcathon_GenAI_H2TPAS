"use client";

import { useEffect, useState } from "react";

import { cn } from "@/app/lib/utils";

interface TypingAnimationProps {
  text: string;
  duration?: number;
  className?: string;
}

export default function TypingAnimation({
  text,
  duration = 120,
  className,
}: TypingAnimationProps) {
  const [showTyping, setShowTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState<string>("");
  const [i, setI] = useState<number>(0);

  useEffect(() => {
    const typingEffect = setInterval(() => {
      if (i < text.length) {
        setShowTyping(true);
        setDisplayedText(text.substring(0, i + 1));
        setI(i + 1);
      } else {
        setShowTyping(false);
        clearInterval(typingEffect);
      }
    }, duration);

    return () => {
      clearInterval(typingEffect);
    };
  }, [duration, i]);

  return (
    <h1
      className={cn(
        "tracking-[-0.02em]",
        className
      )}
    >
      {displayedText ? displayedText : text}{showTyping && "|"}
    </h1>
  );
}
