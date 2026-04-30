import React, { useEffect, useRef } from 'react';
import { 
  Plus, MinusCircle, Heart, ListMusic, User, Disc, 
  Share2, Radio, Info, Users, Clock, Music2, ChevronRight 
} from 'lucide-react';
import { Track, Playlist } from '../types';

interface TrackContextMenuProps {
  track: Track;
  playlists: Playlist[];
  onClose: () => void;
  onAddToPlaylist: (playlistId: string, track: Track) => void;
  onRemoveFromPlaylist: (playlistId: string, trackId: string) => void;
  onAddToQueue: (track: Track) => void;
  onSetSleepTimer: (minutes: number) => void;
  onToggleLike: (trackId: string) => void;
  isLiked: boolean;
  position: { x: number; y: number };
  currentPlaylistId?: string;
}

export default function TrackContextMenu({ 
  track, 
  playlists, 
  onClose, 
  onAddToPlaylist, 
  onRemoveFromPlaylist,
  onAddToQueue,
  onSetSleepTimer,
  onToggleLike,
  isLiked,
  position,
  currentPlaylistId
}: TrackContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Adjust position if it goes off screen
  const menuWidth = 280;
  const submenuWidth = 200;
  const menuHeight = 500;
  const adjustedX = Math.min(position.x, window.innerWidth - menuWidth - 20);
  const adjustedY = Math.min(position.y, window.innerHeight - menuHeight - 20);

  const showSubmenuOnLeft = (adjustedX + menuWidth + submenuWidth) > window.innerWidth;

  return (
    <div 
      ref={menuRef}
      className="fixed z-[100] w-[280px] bg-[#282828] rounded shadow-2xl py-1 text-[#EAEAEA] font-medium text-sm animate-in fade-in zoom-in duration-100"
      style={{ left: adjustedX, top: adjustedY }}
    >
      <div className="relative group/submenu">
        <button className="w-full px-3 py-3 flex items-center justify-between hover:bg-white/10 text-left transition-colors">
          <div className="flex items-center gap-3">
            <Plus size={18} className="text-zinc-400" />
            <span>Adicionar à playlist</span>
          </div>
          <ChevronRight size={16} className="text-zinc-400" />
        </button>
        
        <div className={`absolute top-0 hidden group-hover/submenu:block w-[200px] bg-[#282828] rounded shadow-2xl py-1 border-white/5 ${showSubmenuOnLeft ? 'right-full mr-0.5 border-r' : 'left-full ml-0.5 border-l'}`}>
           {playlists.map(p => (
             <button 
              key={p.id}
              onClick={() => { onAddToPlaylist(p.id, track); onClose(); }}
              className="w-full px-3 py-2 flex items-center gap-3 hover:bg-white/10 text-left truncate"
             >
               <ListMusic size={16} className="text-zinc-400" />
               <span className="truncate">{p.name}</span>
             </button>
           ))}
        </div>
      </div>

      {currentPlaylistId && (
        <button 
          onClick={() => { onRemoveFromPlaylist(currentPlaylistId, track.id); onClose(); }}
          className="w-full px-3 py-3 flex items-center gap-3 hover:bg-white/10 text-left"
        >
          <MinusCircle size={18} className="text-zinc-400" />
          <span>Remover desta playlist</span>
        </button>
      )}

      <button 
        onClick={() => { onToggleLike(track.id); onClose(); }}
        className="w-full px-3 py-3 flex items-center gap-3 hover:bg-white/10 text-left"
      >
        <Heart size={18} className={isLiked ? "text-emerald-500 fill-emerald-500" : "text-zinc-400"} />
        <span>{isLiked ? 'Remover das Curtidas' : 'Salvar em Músicas Curtidas'}</span>
      </button>

      <div className="h-[1px] bg-white/10 my-1 mx-3" />

      <button 
        onClick={() => { onAddToQueue(track); onClose(); }}
        className="w-full px-3 py-3 flex items-center gap-3 hover:bg-white/10 text-left"
      >
        <Music2 size={18} className="text-zinc-400" />
        <span>Adicionar à fila</span>
      </button>

      <button className="w-full px-3 py-3 flex items-center gap-3 hover:bg-white/10 text-left">
        <MinusCircle size={18} className="text-zinc-400" />
        <span>Exclua do seu perfil musical</span>
      </button>

      <button className="w-full px-3 py-3 flex items-center gap-3 hover:bg-white/10 text-left">
        <Users size={18} className="text-zinc-400" />
        <span>Iniciar uma Jam</span>
      </button>

      <div className="relative group/timer">
        <button className="w-full px-3 py-3 flex items-center justify-between hover:bg-white/10 text-left transition-colors">
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-zinc-400" />
            <span>Timer</span>
          </div>
          <ChevronRight size={16} className="text-zinc-400" />
        </button>
        
        <div className={`absolute top-0 hidden group-hover/timer:block w-[200px] bg-[#282828] rounded shadow-2xl py-1 border-white/5 ${showSubmenuOnLeft ? 'right-full mr-0.5 border-r' : 'left-full ml-0.5 border-l'}`}>
           {[5, 10, 15, 30, 45].map(m => (
             <button 
              key={m}
              onClick={() => { onSetSleepTimer(m); onClose(); }}
              className="w-full px-3 py-2 flex items-center gap-3 hover:bg-white/10 text-left"
             >
               <span>{m} minutos</span>
             </button>
           ))}
           <button 
            onClick={() => { onSetSleepTimer(60); onClose(); }}
            className="w-full px-3 py-2 flex items-center gap-3 hover:bg-white/10 text-left"
           >
             <span>1 hora</span>
           </button>
           <button 
            onClick={() => { onSetSleepTimer(0); onClose(); }}
            className="w-full px-3 py-2 flex items-center gap-3 hover:bg-white/10 text-left"
           >
             <span>Quando a faixa terminar</span>
           </button>
        </div>
      </div>

      <div className="h-[1px] bg-white/10 my-1 mx-3" />

      <button className="w-full px-3 py-3 flex items-center gap-3 hover:bg-white/10 text-left">
        <Radio size={18} className="text-zinc-400" />
        <span>Ir para a rádio da música</span>
      </button>

      <button className="w-full px-3 py-3 flex items-center gap-3 hover:bg-white/10 text-left">
        <User size={18} className="text-zinc-400" />
        <span>Ir para o artista</span>
      </button>

      <button className="w-full px-3 py-3 flex items-center gap-3 hover:bg-white/10 text-left">
        <Disc size={18} className="text-zinc-400" />
        <span>Ir para o álbum</span>
      </button>

      <button className="w-full px-3 py-3 flex items-center gap-3 hover:bg-white/10 text-left">
        <Info size={18} className="text-zinc-400" />
        <span>Ver créditos</span>
      </button>

      <div className="h-[1px] bg-white/10 my-1 mx-3" />

      <button className="w-full px-3 py-3 flex items-center justify-between hover:bg-white/10 text-left group">
        <div className="flex items-center gap-3">
          <Share2 size={18} className="text-zinc-400" />
          <span>Compartilhar</span>
        </div>
        <ChevronRight size={16} className="text-zinc-400" />
      </button>
    </div>
  );
}
