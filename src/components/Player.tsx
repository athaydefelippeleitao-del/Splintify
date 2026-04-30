import { Laptop2, LayoutList, Maximize2, Mic2, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume2, Music, Youtube, ListMusic, Heart, User, Check } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Track } from '../types';

interface PlayerProps {
  currentTrack: Track | null;
  isDetailsOpen?: boolean;
  onToggleDetails?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNextInQueue?: boolean;
  hasPrevious?: boolean;
  isShuffle?: boolean;
  onToggleShuffle?: () => void;
  repeatMode?: 'off' | 'track' | 'all';
  onToggleRepeat?: () => void;
  isLyricsOpen?: boolean;
  onToggleLyrics?: () => void;
  isFullQueueOpen?: boolean;
  onToggleFullQueue?: () => void;
  volume?: number;
  onVolumeChange?: (val: number) => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  pauseTrigger?: number;
  stopAfterCurrentTrack?: boolean;
  onTrackEnded?: () => void;
}

export default function Player({ 
  currentTrack, 
  isDetailsOpen, 
  onToggleDetails,
  onNext,
  onPrevious,
  hasNextInQueue,
  hasPrevious,
  isShuffle = false,
  onToggleShuffle,
  repeatMode = 'off',
  onToggleRepeat,
  isLyricsOpen,
  onToggleLyrics,
  isFullQueueOpen,
  onToggleFullQueue,
  volume: globalVolume = 0.7,
  onVolumeChange,
  isMuted = false,
  onToggleMute,
  pauseTrigger = 0,
  stopAfterCurrentTrack = false,
  onTrackEnded
}: PlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const effectiveVolume = isMuted ? 0 : globalVolume;

  useEffect(() => {
    if (currentTrack) {
      setIsPlaying(true);
      setProgress(0);
      if (audioRef.current) {
        audioRef.current.src = currentTrack.audioUrl || '';
        audioRef.current.play().catch(e => console.warn("Playback prevented:", e));
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    if (pauseTrigger > 0) {
      setIsPlaying(false);
    }
  }, [pauseTrigger]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.warn("Playback prevented:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = effectiveVolume;
    }
  }, [effectiveVolume]);

  useEffect(() => {
    let interval: any;
    if (isPlaying && currentTrack && !currentTrack.audioUrl) {
      // Simulation for when there is no audioUrl
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= currentTrack.duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(Math.floor(audioRef.current.currentTime));
    }
  };

  const handleEnded = () => {
    if (stopAfterCurrentTrack) {
      setIsPlaying(false);
      setProgress(0);
      onTrackEnded?.();
      return;
    }

    if (onNext && hasNextInQueue) {
      onNext();
    } else {
      setIsPlaying(false);
      setProgress(0);
    }
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) {
    return (
      <footer className="h-24 bg-black border-t border-zinc-800 flex items-center justify-center text-zinc-500">
        Selecione uma música para começar a ouvir
      </footer>
    );
  }

  const progressPercent = (progress / currentTrack.duration) * 100;

  return (
    <footer className="fixed bottom-16 md:bottom-0 left-0 right-0 md:relative h-[auto] md:h-[100px] bg-black/95 md:bg-black backdrop-blur-lg md:backdrop-blur-none border-t border-white/5 md:border-none grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] px-2 md:px-6 z-40">
      {/* Mobile Top Indicator (Jam) */}
      <div className="md:hidden w-full flex items-center justify-between px-4 py-2 bg-white/5 rounded-t-xl mb-1">
        <span className="text-[10px] font-bold text-zinc-300">Jam de AthaydeLeitão</span>
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
          <User size={12} className="text-zinc-500" />
        </div>
      </div>

      <audio 
        ref={audioRef} 
        onTimeUpdate={handleTimeUpdate} 
        onEnded={handleEnded}
      />
      
      {/* Track Info & Mobile Controls Combined for Mobile */}
      <div className="flex items-center justify-between md:justify-start gap-3 md:gap-4 overflow-hidden px-2 md:px-0 py-2 md:py-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative shrink-0">
            {currentTrack.cover ? (
              <img src={currentTrack.cover} alt={currentTrack.title} className="w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-md object-cover shadow-lg" />
            ) : (
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-md bg-zinc-800 flex items-center justify-center">
                <Music size={24} className="text-zinc-600" />
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs md:text-sm font-bold text-white truncate">{currentTrack.title}</span>
            <span className="text-[10px] md:text-xs text-zinc-400 truncate">{currentTrack.artist}</span>
          </div>
        </div>

        {/* Mobile-only tools seen in screenshot */}
        <div className="flex items-center gap-4 md:hidden">
          <button className="text-emerald-500">
            <Laptop2 size={20} />
          </button>
          <button className="text-emerald-500">
            <Check size={20} className="bg-emerald-500 text-black rounded-full p-0.5" />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-white"
          >
            {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
          </button>
        </div>

        <button className="hidden md:block text-zinc-400 hover:text-white transition-colors ml-2">
          <Heart size={16} />
        </button>
      </div>

      {/* Desktop Playback Controls */}
      <div className="hidden md:flex flex-col items-center justify-center gap-2 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-6 text-zinc-400">
          <Shuffle 
            size={18} 
            className={`transition-colors cursor-pointer ${isShuffle ? 'text-emerald-500 hover:text-emerald-400' : 'hover:text-white'}`} 
            onClick={onToggleShuffle}
          />
          <SkipBack 
            size={24} 
            fill="currentColor" 
            className={`transition-colors ${onPrevious && hasPrevious ? 'hover:text-white cursor-pointer' : 'opacity-30 cursor-not-allowed'}`} 
            onClick={() => onPrevious && hasPrevious && onPrevious()}
          />
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-lg"
          >
            {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
          </button>
          <SkipForward 
            size={24} 
            fill="currentColor" 
            className={`transition-colors ${onNext && hasNextInQueue ? 'hover:text-white cursor-pointer' : 'opacity-30 cursor-not-allowed'}`} 
            onClick={() => onNext && hasNextInQueue && onNext()}
          />
          <div className="relative group">
            <Repeat 
              size={18} 
              className={`transition-colors cursor-pointer ${repeatMode !== 'off' ? 'text-emerald-500 hover:text-emerald-400' : 'hover:text-white'}`} 
              onClick={onToggleRepeat}
            />
            {repeatMode === 'track' && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full flex items-center justify-center text-[7px] text-black font-bold">1</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full">
          <span className="text-[11px] text-zinc-400 w-10 text-right font-medium">{formatTime(progress)}</span>
          <div className="flex-1 h-1 bg-zinc-800 rounded-full group cursor-pointer relative">
            <input 
              type="range"
              min="0"
              max={currentTrack.duration}
              value={progress}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setProgress(val);
                if (audioRef.current) {
                  audioRef.current.currentTime = val;
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div 
              className="h-full bg-white group-hover:bg-emerald-500 rounded-full relative" 
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-xl" />
            </div>
          </div>
          <span className="text-[11px] text-zinc-400 w-10 font-medium">{formatTime(currentTrack.duration)}</span>
        </div>
      </div>

      <div className="hidden lg:flex items-center justify-end gap-3 text-zinc-400">
        <button 
          className="hover:text-white cursor-pointer transition-colors" 
          title="Ver vídeo"
        >
          <Youtube size={20} />
        </button>
        
        <button 
          onClick={onToggleLyrics}
          className={`transition-colors ${isLyricsOpen ? 'text-emerald-500' : 'hover:text-white'}`}
          title="Letras"
        >
          <Mic2 size={18} />
        </button>

        <button 
          onClick={onToggleFullQueue}
          className={`transition-colors ${isFullQueueOpen ? 'text-emerald-500' : 'hover:text-white'}`}
          title="Fila"
        >
          <ListMusic size={18} />
        </button>

        <button className="hover:text-white cursor-pointer transition-colors" title="Conectar a um dispositivo">
          <Laptop2 size={18} />
        </button>
        
        <div className="flex items-center gap-2 group w-32">
          <button onClick={onToggleMute} className="hover:text-white cursor-pointer shrink-0 transition-colors">
            <Volume2 size={18} className={isMuted ? 'text-zinc-600' : 'text-zinc-400'} />
          </button>
          <div className="flex-1 h-1 bg-zinc-800 rounded-full group cursor-pointer relative">
            <input 
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={globalVolume}
              onChange={(e) => onVolumeChange?.(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div 
              className={`h-full rounded-full transition-colors ${isMuted ? 'bg-zinc-600' : 'bg-white group-hover:bg-emerald-500'}`} 
              style={{ width: `${globalVolume * 100}%` }} 
            />
          </div>
        </div>

        <button 
          onClick={onToggleDetails}
          className={`p-1 transition-colors ${isDetailsOpen ? 'text-emerald-500' : 'hover:text-white'}`}
          title="Vista Reproduzindo agora"
        >
          <LayoutList size={18} />
        </button>

        <button 
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch((e) => {
                console.error(`Error attempting to enable full-screen mode: ${e.message}`);
              });
            } else {
              document.exitFullscreen();
            }
          }}
          className="hover:text-white cursor-pointer transition-colors" 
          title="Ecrã inteiro"
        >
          <Maximize2 size={18} />
        </button>
      </div>
    </footer>
  );
}
