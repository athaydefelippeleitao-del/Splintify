import { Home, Library, ListMusic, PlusSquare, Search, History, Music, User, ChevronRight, Heart, Folder as FolderIcon, MoreVertical, Trash2, Edit } from 'lucide-react';
import React, { useState } from 'react';
import { PLAYLISTS } from '../constants';
import { Playlist, Track, Folder } from '../types';

interface SidebarProps {
  activeView: 'home' | 'search' | 'library' | 'profile' | string;
  onViewChange: (view: 'home' | 'search' | 'library' | 'profile' | string) => void;
  userPlaylists: Playlist[];
  folders: Folder[];
  onOpenPlaylistModal: () => void;
  recentTracks: Track[];
  onPlayTrack: (track: Track, contextTracks?: Track[]) => void;
  onMovePlaylistToFolder: (playlistId: string, folderId: string | null) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
}

export default function Sidebar({ 
  activeView, 
  onViewChange, 
  userPlaylists, 
  folders,
  onOpenPlaylistModal,
  recentTracks,
  onPlayTrack,
  onMovePlaylistToFolder,
  onRenameFolder,
  onDeleteFolder
}: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [draggingPlaylistId, setDraggingPlaylistId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]
    );
  };

  const handleDragStart = (e: React.DragEvent, playlistId: string) => {
    e.dataTransfer.setData('playlistId', playlistId);
    setDraggingPlaylistId(playlistId);
  };

  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    setDragOverFolderId(folderId);
  };

  const handleDrop = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    const playlistId = e.dataTransfer.getData('playlistId');
    if (playlistId) {
      onMovePlaylistToFolder(playlistId, folderId);
    }
    setDraggingPlaylistId(null);
    setDragOverFolderId(null);
  };

  const playlistsInFolders = new Set(folders.flatMap(f => f.playlistIds));
  const allPlaylists = [...PLAYLISTS, ...userPlaylists].filter(Boolean);
  const rootPlaylists = allPlaylists.filter(p => !playlistsInFolders.has(p.id));

  const renderPlaylistButton = (playlist: Playlist) => (
    <button 
      key={playlist.id} 
      draggable
      onDragStart={(e) => handleDragStart(e, playlist.id)}
      onClick={() => onViewChange(`playlist:${playlist.id}`)}
      className={`flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition-colors group text-left w-full ${activeView === `playlist:${playlist.id}` ? 'bg-white/10' : ''}`}
    >
      <div className="w-12 h-12 rounded-md shrink-0 overflow-hidden bg-zinc-800">
        <img src={playlist.cover} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className={`text-sm font-bold truncate ${activeView === `playlist:${playlist.id}` ? 'text-emerald-400' : 'text-white'}`}>{playlist.name}</span>
        <span className="text-xs text-zinc-400 truncate">Playlist • {playlist.tracks?.length || 0} músicas</span>
      </div>
    </button>
  );

  return (
    <>
      <aside className="hidden md:flex w-72 md:w-80 flex-col gap-2 shrink-0 h-full overflow-hidden">
        <div className="bg-[#121212] rounded-xl p-4 flex flex-col gap-5">
          <button 
            onClick={() => onViewChange('home')}
            className={`flex items-center gap-4 transition-colors font-bold ${activeView === 'home' ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            <Home size={24} /> Home
          </button>
          <button 
            onClick={() => onViewChange('search')}
            className={`flex items-center gap-4 transition-colors font-bold ${activeView === 'search' ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            <Search size={24} /> Buscar
          </button>
        </div>

        <div 
          className="flex-1 bg-[#121212] rounded-xl flex flex-col overflow-hidden"
          onDragOver={(e) => handleDragOver(e, null)}
          onDrop={(e) => handleDrop(e, null)}
        >
          <div className="p-4 flex flex-col gap-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center gap-2 text-zinc-400 hover:text-white cursor-pointer transition-colors"
                onClick={() => onViewChange('library')}
              >
                <Library size={24} />
                <span className="font-bold">Sua Biblioteca</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={onOpenPlaylistModal} className="p-1 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
                  <PlusSquare size={20} />
                </button>
                <button className="p-1 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
                  <ChevronRight size={20} className="rotate-[-90deg]" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-1 scrollbar-hide">
            {/* Liked Songs Shortcut */}
            <button 
              onClick={() => onViewChange('library')}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition-colors group text-left w-full"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-700 to-emerald-400 rounded-md flex items-center justify-center shadow-lg shrink-0">
                <Heart size={20} fill="white" className="text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-white truncate">Músicas Curtidas</span>
                <span className="text-xs text-zinc-400 truncate">
                  <span className="text-emerald-500">Pinned</span> • Playlist
                </span>
              </div>
            </button>

            {/* Folders */}
            {folders.map(folder => (
              <div key={folder.id} className="flex flex-col gap-1">
                <div 
                  onDragOver={(e) => handleDragOver(e, folder.id)}
                  onDrop={(e) => handleDrop(e, folder.id)}
                  className={`flex items-center justify-between p-2 rounded-md transition-all group ${dragOverFolderId === folder.id ? 'bg-emerald-500/10 border-emerald-500/50 border' : 'hover:bg-white/5'}`}
                >
                  <button 
                    onClick={() => toggleFolder(folder.id)}
                    className="flex-1 flex items-center gap-3 text-left"
                  >
                    <div className="w-12 h-12 bg-zinc-800 rounded-md flex items-center justify-center text-zinc-400 shrink-0">
                      <FolderIcon size={24} fill={expandedFolders.includes(folder.id) ? "currentColor" : "none"} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-white truncate group-hover:text-emerald-400">{folder.name}</span>
                      <span className="text-xs text-zinc-400 truncate">Pasta • {folder.playlistIds.length} playlists</span>
                    </div>
                  </button>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onDeleteFolder(folder.id)}
                      className="p-1.5 hover:text-red-500 transition-colors"
                      title="Excluir pasta"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {expandedFolders.includes(folder.id) && (
                  <div className="ml-4 pl-4 border-l border-white/5 flex flex-col gap-1 mt-1">
                    {folder.playlistIds.map(pid => {
                      const playlist = allPlaylists.find(p => p.id === pid);
                      return playlist ? renderPlaylistButton(playlist) : null;
                    })}
                    {folder.playlistIds.length === 0 && (
                      <p className="text-[10px] text-zinc-600 italic py-2">Pasta vazia. Arraste playlists aqui.</p>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Root Playlists */}
            {rootPlaylists.map(playlist => renderPlaylistButton(playlist))}

            {recentTracks.length > 0 && (
              <>
                <div className="h-[1px] bg-white/5 my-2 mx-2" />
                <div className="px-2 mb-2">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Recentes</span>
                </div>
                {recentTracks.filter(Boolean).map(track => (
                  <button 
                    key={track.id}
                    onClick={() => onPlayTrack(track, recentTracks.filter(Boolean))}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition-colors group text-left w-full"
                  >
                    <div className="w-12 h-12 rounded-md shrink-0 overflow-hidden bg-zinc-800">
                      <img src={track.cover} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-white truncate group-hover:text-emerald-400">{track.title}</span>
                      <span className="text-xs text-zinc-400 truncate">{track.artist}</span>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 flex items-center justify-around p-3 pb-6 z-50">
        <button 
          onClick={() => onViewChange('home')}
          className={`flex flex-col items-center gap-1 ${activeView === 'home' ? 'text-white' : 'text-zinc-400'}`}
        >
          <Home size={24} />
          <span className="text-[10px]">Início</span>
        </button>
        <button 
          onClick={() => onViewChange('search')}
          className={`flex flex-col items-center gap-1 ${activeView === 'search' ? 'text-white' : 'text-zinc-400'}`}
        >
          <Search size={24} />
          <span className="text-[10px]">Buscar</span>
        </button>
        <button 
          onClick={() => onViewChange('library')}
          className={`flex flex-col items-center gap-1 ${activeView === 'library' ? 'text-white' : 'text-zinc-400'}`}
        >
          <Library size={24} />
          <span className="text-[10px]">Biblioteca</span>
        </button>
        <button 
          onClick={() => onViewChange('profile')}
          className={`flex flex-col items-center gap-1 ${activeView === 'profile' ? 'text-white' : 'text-zinc-400'}`}
        >
          <User size={24} />
          <span className="text-[10px]">Perfil</span>
        </button>
      </nav>
    </>
  );
}
