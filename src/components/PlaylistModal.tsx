import { X, Music, ListPlus, Folder, Radio, Users2, ChevronRight, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { Playlist } from '../types';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => void;
  onUpdate?: (playlist: Partial<Playlist>) => void;
  onCreateFolder?: (name: string) => void;
  editingPlaylist?: Playlist | null;
}

type ModalView = 'selection' | 'form';

export default function PlaylistModal({ isOpen, onClose, onCreate, onUpdate, onCreateFolder, editingPlaylist }: PlaylistModalProps) {
  const [view, setView] = useState<ModalView>('selection');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editingPlaylist) {
      setName(editingPlaylist.name);
      setDescription(editingPlaylist.description || '');
      setView('form');
    } else {
      setName('');
      setDescription('');
      setView('selection');
    }
  }, [editingPlaylist, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      if (editingPlaylist && onUpdate) {
        onUpdate({ 
          name: name.trim(), 
          description: description.trim() 
        });
      } else {
        onCreate(name.trim(), description.trim());
      }
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`bg-[#282828] w-full ${view === 'selection' ? 'max-w-sm' : 'max-w-md'} rounded-xl shadow-2xl relative z-10 overflow-hidden`}
          >
            <div className="p-1">
              <div className="flex items-center justify-between p-4 pb-2">
                <div className="flex items-center gap-2">
                  <button onClick={onClose} className="p-1 hover:text-white text-zinc-400">
                    <X size={20} />
                  </button>
                  <h2 className="text-sm font-black text-white">Criar</h2>
                </div>
                <button className="p-1 hover:text-white text-zinc-400">
                  <Maximize2 size={16} />
                </button>
              </div>

              {view === 'selection' ? (
                <div className="p-2 space-y-1">
                  <button 
                    onClick={() => setView('form')}
                    className="w-full flex items-center gap-4 p-3 hover:bg-white/10 rounded-lg transition-colors text-left group"
                  >
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-300 group-hover:text-white">
                      <ListPlus size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-white">Playlist</p>
                      <p className="text-xs text-zinc-400">Crie uma playlist com músicas ou episódios</p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-4 p-3 hover:bg-white/10 rounded-lg transition-colors text-left group">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-300 group-hover:text-white">
                      <div className="relative">
                        <div className="w-5 h-5 rounded-full border-2 border-current" />
                        <div className="w-5 h-5 rounded-full border-2 border-current absolute -right-2 top-0 bg-[#282828]" />
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-white">Match</p>
                      <p className="text-xs text-zinc-400">Junte os gostos musicais da sua galera em uma playlist</p>
                    </div>
                  </button>

                  <div className="my-2 border-t border-white/5 mx-3" />

                  <button 
                    onClick={() => {
                      if (onCreateFolder) {
                        onCreateFolder('Nova Pasta');
                        onClose();
                      }
                    }}
                    className="w-full flex items-center gap-4 p-3 hover:bg-white/10 rounded-lg transition-colors text-left group"
                  >
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-300 group-hover:text-white">
                      <Folder size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-white">Pasta</p>
                      <p className="text-xs text-zinc-400">Organize suas playlists</p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-4 p-3 hover:bg-white/10 rounded-lg transition-colors text-left group">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-300 group-hover:text-white">
                      <Radio size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-white">Jam</p>
                      <p className="text-xs text-zinc-400">Ouça junto, de qualquer lugar</p>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="p-6 pt-2">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      {editingPlaylist ? 'Editar Playlist' : 'Criar Nova Playlist'}
                    </h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-48 h-48 bg-zinc-800 rounded-md shadow-2xl flex items-center justify-center group relative cursor-pointer">
                        {editingPlaylist?.cover ? (
                          <img src={editingPlaylist.cover} alt="" className="w-full h-full object-cover rounded-md" />
                        ) : (
                          <Music size={64} className="text-zinc-600 group-hover:scale-110 transition-transform" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-sm font-bold">Trocar foto</span>
                        </div>
                      </div>

                      <div className="w-full space-y-4">
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Nome</label>
                           <input 
                            type="text"
                            autoFocus
                            placeholder="Minha playlist"
                            className="w-full bg-white/10 border border-transparent focus:border-white/20 focus:bg-white/20 rounded-md p-3 text-white outline-none transition-all placeholder:text-zinc-600"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Descrição (opcional)</label>
                           <textarea 
                            placeholder="Dê um toque brasileiro à sua coleção"
                            className="w-full bg-white/10 border border-transparent focus:border-white/20 focus:bg-white/20 rounded-md p-3 text-white outline-none transition-all placeholder:text-zinc-600 h-24 resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => editingPlaylist ? onClose() : setView('selection')}
                        className="px-6 py-2 text-white font-bold hover:scale-105 transition-transform"
                      >
                        {editingPlaylist ? 'Cancelar' : 'Voltar'}
                      </button>
                      <button
                        type="submit"
                        disabled={!name.trim()}
                        className="bg-emerald-500 text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {editingPlaylist ? 'Salvar' : 'Criar'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
            
            {view === 'form' && (
              <div className="bg-white/5 p-4">
                <p className="text-[10px] text-zinc-400 text-center uppercase tracking-tighter">
                  {editingPlaylist ? 'Alterações aplicadas instantaneamente' : 'Sua playlist será salva nas nuvens do Brasil'}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
