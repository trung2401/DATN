import React, { useEffect, useRef, useState } from "react";

const AudioPlayer = ({ audioSrc, autoPlay, handleNext, part }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const currentAudioSrcRef = useRef(audioSrc);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioSrc !== currentAudioSrcRef.current) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = audioSrc || "";
      currentAudioSrcRef.current = audioSrc;
    }

    if (autoPlay && audioSrc && !isPlaying) {
      setIsPlaying(true);
      const playTimeout = setTimeout(() => {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {})
            .catch((error) => {
              console.error("Error playing audio:", error);
              setIsPlaying(false);
            });
        }
      }, 100);

      return () => clearTimeout(playTimeout);
    }

    return () => {
      if (audio && isPlaying) {
        audio.pause();
        setIsPlaying(false);
      }
    };
  }, [audioSrc, autoPlay]);

  const onAudioEnded = () => {
    setIsPlaying(false);
    if ([1, 2, 3, 4].includes(part) && handleNext) {
      handleNext();
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="border-3 border-gray-500 rounded-4xl">
        <audio
          ref={audioRef}
          controls
          autoPlay={autoPlay && !!audioSrc}
          onEnded={onAudioEnded}
        >
          {audioSrc && <source src={audioSrc} type="audio/mpeg" />}
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  );
};

export default AudioPlayer;
