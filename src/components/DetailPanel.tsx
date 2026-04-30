import { X, Play, Plus, MoreHorizontal, Info } from 'lucide-react';
import React from 'react';
import { Track } from '../types';

interface DetailPanelProps {
  currentTrack: Track | null;
  onClose: () => void;
  queue?: Track[];
  onRemoveFromQueue?: (index: number) => void;
}

export default function DetailPanel({ currentTrack, onClose, queue = [], onRemoveFromQueue }: DetailPanelProps) {
  if (!currentTrack) return null;

  return (
    <aside className="w-80 bg-[#121212] rounded-xl flex flex-col hidden xl:flex overflow-y-auto scrollbar-hide relative">
      <div className="p-4 flex items-center justify-between sticky top-0 bg-[#121212] z-10 shadow-sm">
        <h2 className="font-bold text-sm">Reproduzindo agora</h2>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="px-4 py-2 flex flex-col gap-6">
        {/* Album Art */}
        <div className="relative group">
          <img 
            src={currentTrack.cover} 
            alt={currentTrack.title} 
            className="w-full aspect-square object-cover rounded-xl shadow-2xl"
          />
        </div>

        {/* Track Title & Artist */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-black hover:underline cursor-pointer">{currentTrack.title}</h1>
          <p className="text-zinc-400 font-medium">{currentTrack.artist}</p>
        </div>

        {/* Video Preview / Mini Loop */}
        <div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-white/5">
          <div className="p-4 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Neste vídeo</span>
            <Plus size={16} className="text-zinc-400 hover:text-white cursor-pointer" />
          </div>
          <div className="aspect-video bg-zinc-800 relative">
             <img src={currentTrack.cover} className="w-full h-full object-cover opacity-50 blur-sm" alt="" />
             <div className="absolute inset-0 flex items-center justify-center">
                <Play fill="white" size={32} className="text-white" />
             </div>
          </div>
          <div className="p-3 bg-zinc-900/50 flex flex-col">
             <span className="text-sm font-bold truncate">{currentTrack.title} - Tempo Ao...</span>
             <span className="text-xs text-zinc-400">Música • {currentTrack.artist}</span>
          </div>
        </div>

        {/* Queue Section */}
        {queue.length > 0 && (
          <div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-white/5 mt-2">
            <div className="p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Próximo na fila</h3>
              <button className="text-xs font-bold text-zinc-400 hover:text-white">Abrir fila</button>
            </div>
            <div className="px-2 pb-2 space-y-1">
              {queue.slice(0, 5).map((track, i) => track && (
                <div key={`${track.id}-${i}`} className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 group">
                  <img src={track.cover} className="w-10 h-10 rounded shadow-md" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{track.title}</p>
                    <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                  </div>
                  <button 
                    onClick={() => onRemoveFromQueue?.(i)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-white transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {queue.length > 5 && (
                <p className="text-xs text-center text-zinc-500 py-2">E mais {queue.length - 5} músicas...</p>
              )}
            </div>
          </div>
        )}

        {/* About Artist */}
        <div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-white/5 mt-2">
          <div className="relative h-40">
             <img src={currentTrack.cover} className="w-full h-full object-cover" alt="" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                <span className="text-xs font-bold uppercase tracking-widest mb-1 text-white">Sobre o artista</span>
                <h3 className="font-bold text-lg">{currentTrack.artist}</h3>
             </div>
          </div>
          <div className="p-4 flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-sm font-bold">12.421.312 ouvintes mensais</span>
                <button className="px-4 py-1.5 border border-zinc-500 rounded-full text-xs font-bold hover:border-white transition-colors">Seguir</button>
             </div>
             <p className="text-xs text-zinc-400 line-clamp-3">
                {currentTrack.artist} é uma das maiores vozes do sertanejo clássico e romântico do Brasil. Com décadas de sucesso e hits que atravessam gerações.
             </p>
          </div>
        </div>

        {/* Credits */}
        <div className="bg-[#1e1e1e] rounded-xl p-4 shadow-lg border border-white/5 mt-2 mb-8">
           <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold">Créditos</span>
              <span className="text-xs font-bold text-zinc-400 hover:text-white cursor-pointer">Mostrar tudo</span>
           </div>
           <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                 <div>
                    <p className="text-sm font-bold">{currentTrack.artist}</p>
                    <p className="text-xs text-zinc-400">Artista principal</p>
                 </div>
                 <button className="px-4 py-1 text-xs font-bold border border-zinc-600 rounded-full hover:border-white">Seguir</button>
              </div>
              <div className="flex flex-col">
                 <p className="text-sm font-bold">Vários Autores</p>
                 <p className="text-xs text-zinc-400">Compositor</p>
              </div>
           </div>
        </div>
      </div>
    </aside>
  );
}
