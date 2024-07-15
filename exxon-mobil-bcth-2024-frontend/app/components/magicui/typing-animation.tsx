"use client";

import { useEffect, useState } from "react";

import { cn } from "@/app/lib/utils";
import React from "react";

interface TypingAnimationProps {
  text: string;
  duration?: number;
  className?: string;
}

export default function TypingAnimation({
  text,
  duration = 10,
  className,
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState<string>("");
  const [i, setI] = useState<number>(0);

  useEffect(() => {
    const typingEffect = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        setI(i + 1);
      } else {
        clearInterval(typingEffect);
      }
    }, duration);

    return () => {
      clearInterval(typingEffect);
    };
  }, [duration, i]);

  return (
    <h1 className={cn("tracking-[-0.02em]", className)}>
      {displayedText.split("\n").map((line, index) => (
        <React.Fragment key={index}>
          {line}
          <br />
        </React.Fragment>
      ))}
    </h1>
  );
}
