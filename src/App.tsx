/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import MainContent from './components/MainContent';
import Player from './components/Player';
import Sidebar from './components/Sidebar';
import { TRACKS } from './constants';
import { Track, Playlist, Artist, Category, Folder } from './types';
import { AuthProvider } from './contexts/AuthContext';
import { subscribeToTracks, subscribeToArtists, subscribeToCategories } from './services/tracksService';
import DetailPanel from './components/DetailPanel';
import PlaylistModal from './components/PlaylistModal';
import { motion, AnimatePresence } from 'motion/react';
import { X, Home, Search as SearchIcon, Library, Plus } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import LoadingScreen from './components/LoadingScreen';
import AuthScreen from './components/AuthScreen';
function AppContent() {
  const [tracks, setTracks] = useState<Track[]>(TRACKS);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(true);
  const [activeView, setActiveView] = useState<'home' | 'search' | 'library' | string>('home');
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [birthDate, setBirthDate] = useState<string>('');
  const [country, setCountry] = useState<string>('Brasil');
  const [userPlan, setUserPlan] = useState<string>('Free');
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [playbackHistory, setPlaybackHistory] = useState<Track[]>([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'track' | 'all'>('off');
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isFullQueueOpen, setIsFullQueueOpen] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [pauseTrigger, setPauseTrigger] = useState(0);
  const [stopAfterCurrentTrack, setStopAfterCurrentTrack] = useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const startSleepTimer = (minutes: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (minutes === 0) {
      setStopAfterCurrentTrack(true);
      return;
    }
    
    setStopAfterCurrentTrack(false);
    timerRef.current = setTimeout(() => {
      setPauseTrigger(prev => prev + 1);
      timerRef.current = null;
    }, minutes * 60 * 1000);
  };

  useEffect(() => {
    // Load data from localStorage
    const savedHistory = localStorage.getItem('music-history');
    if (savedHistory) {
      try {
        setRecentTracks(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    const savedBirthDate = localStorage.getItem('user-birthdate');
    if (savedBirthDate) setBirthDate(savedBirthDate);

    const savedCountry = localStorage.getItem('user-country');
    if (savedCountry) setCountry(savedCountry);

    const savedPlan = localStorage.getItem('user-plan');
    if (savedPlan) setUserPlan(savedPlan);

    const savedFolders = localStorage.getItem('user-folders');
    if (savedFolders) {
      try {
        setFolders(JSON.parse(savedFolders));
      } catch (e) {
        console.error("Failed to parse folders", e);
      }
    }
  }, []);

  useEffect(() => {
    // Save history to localStorage whenever it changes
    localStorage.setItem('music-history', JSON.stringify(recentTracks.slice(0, 10)));
  }, [recentTracks]);

  useEffect(() => {
    localStorage.setItem('user-birthdate', birthDate);
  }, [birthDate]);

  useEffect(() => {
    localStorage.setItem('user-country', country);
  }, [country]);

  useEffect(() => {
    localStorage.setItem('user-plan', userPlan);
  }, [userPlan]);

  useEffect(() => {
    localStorage.setItem('user-folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    const unsubscribeTracks = subscribeToTracks((newTracks) => {
      setTracks(newTracks.length > 0 ? newTracks : TRACKS);
      if (!currentTrack && newTracks.length > 0) {
        setCurrentTrack(newTracks[0]);
      }
    });

    const unsubscribeArtists = subscribeToArtists(setArtists);
    const unsubscribeCategories = subscribeToCategories(setCategories);

    return () => {
      unsubscribeTracks();
      unsubscribeArtists();
      unsubscribeCategories();
    };
  }, [currentTrack]);

  const handlePlayTrack = (track: Track, contextTracks?: Track[]) => {
    if (currentTrack) {
      setPlaybackHistory(prev => [currentTrack, ...prev].slice(0, 50));
    }

    setCurrentTrack(track);
    // Add to history
    setRecentTracks(prev => {
      const filtered = prev.filter(t => t && t.id !== track.id);
      return [track, ...filtered].slice(0, 50);
    });

    // If context tracks are provided, queue the ones after current track
    if (contextTracks && contextTracks.length > 0) {
      const currentIndex = contextTracks.findIndex(t => t && t.id === track.id);
      if (currentIndex !== -1) {
        let remainingTracks = contextTracks.slice(currentIndex + 1).filter(Boolean);
        
        if (isShuffle) {
          remainingTracks = [...remainingTracks].sort(() => Math.random() - 0.5);
        }
        
        setQueue(remainingTracks);
      }
    }
  };

  const toggleLikeTrack = (trackId: string) => {
    setLikedTrackIds(prev => 
      prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]
    );
  };

  const createPlaylist = (name: string, description?: string) => {
    const newPlaylist: Playlist = {
      id: `up-${Date.now()}`,
      name,
      description: description || 'Playlist criada por você',
      cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
      tracks: []
    };
    setUserPlaylists(prev => [...prev, newPlaylist]);
    setActiveView('library');
  };

  const updatePlaylist = (updatedFields: Partial<Playlist>) => {
    if (editingPlaylist) {
      setUserPlaylists(prev => prev.map(p => 
        p.id === editingPlaylist.id ? { ...p, ...updatedFields } : p
      ));
      setEditingPlaylist(null);
    }
  };

  const addTrackToPlaylist = (playlistId: string, track: Track) => {
    setUserPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        if (p.tracks.some(t => t.id === track.id)) return p;
        return { ...p, tracks: [...p.tracks, track] };
      }
      return p;
    }));
  };

  const openEditPlaylist = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setIsPlaylistModalOpen(true);
  };

  const removeFromPlaylist = (playlistId: string, trackId: string) => {
    setUserPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return { ...p, tracks: p.tracks.filter(t => t.id !== trackId) };
      }
      return p;
    }));
  };

  const createFolder = (name: string) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: name || 'Nova Pasta',
      playlistIds: []
    };
    setFolders(prev => [...prev, newFolder]);
  };

  const movePlaylistToFolder = (playlistId: string, folderId: string | null) => {
    setFolders(prev => {
      // First, remove it from all folders
      const cleanFolders = prev.map(f => ({
        ...f,
        playlistIds: f.playlistIds.filter(id => id !== playlistId)
      }));

      // Then add it to the target folder if target is not null
      if (folderId) {
        return cleanFolders.map(f => 
          f.id === folderId ? { ...f, playlistIds: [...f.playlistIds, playlistId] } : f
        );
      }
      return cleanFolders;
    });
  };

  const renameFolder = (folderId: string, newName: string) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name: newName } : f));
  };

  const deleteFolder = (folderId: string) => {
    setFolders(prev => prev.filter(f => f.id !== folderId));
  };

  const addToQueue = (track: Track) => {
    setQueue(prev => [...prev, track]);
  };

  const playNext = () => {
    if (repeatMode === 'track' && currentTrack) {
      // Re-play current track
      const tempTrack = currentTrack;
      setCurrentTrack(null);
      setTimeout(() => setCurrentTrack(tempTrack), 0);
      return;
    }

    if (queue.length > 0) {
      const nextTrack = queue[0];
      setQueue(prev => prev.slice(1));
      
      if (currentTrack) {
        setPlaybackHistory(prev => [currentTrack, ...prev].slice(0, 50));
      }
      
      setCurrentTrack(nextTrack);
    } else if (repeatMode === 'all' && playbackHistory.length > 0) {
      // Logic for repeating all could be complex depending on "context", 
      // but for now let's just loop the history if queue is empty
      const firstTrack = [...playbackHistory].reverse()[0];
      if (firstTrack) handlePlayTrack(firstTrack);
    }
  };

  const playPrevious = () => {
    if (playbackHistory.length > 0) {
      const prevTrack = playbackHistory[0];
      
      if (currentTrack) {
        setQueue(prev => [currentTrack, ...prev]);
      }
      
      setPlaybackHistory(prev => prev.slice(1));
      setCurrentTrack(prevTrack);
    }
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => {
      const next = !prev;
      if (next && queue.length > 0) {
        setQueue(prevQueue => [...prevQueue].sort(() => Math.random() - 0.5));
      }
      return next;
    });
  };
  const toggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'track';
      return 'off';
    });
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden">
      <div className="flex flex-1 overflow-hidden p-0 md:p-2 gap-0 md:gap-2">
        <div className="hidden md:flex">
          <Sidebar 
            activeView={activeView} 
            onViewChange={setActiveView} 
            userPlaylists={userPlaylists}
            folders={folders}
            onOpenPlaylistModal={() => setIsPlaylistModalOpen(true)}
            recentTracks={recentTracks}
            onPlayTrack={handlePlayTrack}
            onMovePlaylistToFolder={movePlaylistToFolder}
            onRenameFolder={renameFolder}
            onDeleteFolder={deleteFolder}
          />
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <MainContent 
            tracks={tracks} 
            artists={artists}
            categories={categories}
            onPlayTrack={handlePlayTrack} 
            activeView={activeView}
            onViewChange={setActiveView}
            likedTrackIds={likedTrackIds}
            onToggleLike={toggleLikeTrack}
            userPlaylists={userPlaylists}
            onOpenPlaylistModal={() => { setEditingPlaylist(null); setIsPlaylistModalOpen(true); }}
            onEditPlaylist={openEditPlaylist}
            onAddTrackToPlaylist={addTrackToPlaylist}
            onRemoveFromPlaylist={removeFromPlaylist}
            onAddToQueue={addToQueue}
            onSetSleepTimer={startSleepTimer}
            birthDate={birthDate}
            onBirthDateChange={setBirthDate}
            country={country}
            onCountryChange={setCountry}
            userPlan={userPlan}
            onPlanChange={setUserPlan}
          />
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-black/95 border-t border-white/5 flex items-center justify-around px-4 z-50">
          <button 
            onClick={() => setActiveView('home')}
            className={`flex flex-col items-center gap-1 ${activeView === 'home' ? 'text-white' : 'text-zinc-400'}`}
          >
            <Home size={24} fill={activeView === 'home' ? "currentColor" : "none"} />
            <span className="text-[10px] font-bold">Início</span>
          </button>
          <button 
            onClick={() => setActiveView('search')}
            className={`flex flex-col items-center gap-1 ${activeView === 'search' ? 'text-white' : 'text-zinc-400'}`}
          >
             <SearchIcon size={24} />
             <span className="text-[10px] font-bold">Buscar</span>
          </button>
          <button 
            onClick={() => setActiveView('library')}
            className={`flex flex-col items-center gap-1 ${activeView === 'library' ? 'text-white' : 'text-zinc-400'}`}
          >
             <Library size={24} />
             <span className="text-[10px] font-bold">Sua Biblioteca</span>
          </button>
          <button 
            onClick={() => setIsPlaylistModalOpen(true)}
            className="flex flex-col items-center gap-1 text-zinc-400"
          >
             <Plus size={24} className="border border-zinc-400 rounded-sm p-0.5" />
             <span className="text-[10px] font-bold">Criar</span>
          </button>
        </div>

        {isDetailPanelOpen && currentTrack && (
          <DetailPanel 
            currentTrack={currentTrack} 
            onClose={() => setIsDetailPanelOpen(false)} 
            queue={queue}
            onRemoveFromQueue={removeFromQueue}
          />
        )}

        {/* Lyrics Overlay */}
        {isLyricsOpen && currentTrack && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-0 top-0 left-0 right-0 bottom-[100px] bg-zinc-900/95 z-50 p-8 md:p-16 flex flex-col items-center justify-center text-center overflow-y-auto"
          >
            <button 
              onClick={() => setIsLyricsOpen(false)}
              className="absolute top-8 right-8 text-zinc-400 hover:text-white"
            >
              <X size={32} />
            </button>
            <div className="max-w-2xl w-full">
              <h2 className="text-4xl md:text-6xl font-bold mb-12 text-white/40">Letras</h2>
              <div className="space-y-6 text-2xl md:text-4xl font-bold text-white leading-relaxed">
                <p className="text-emerald-500">Música: {currentTrack.title}</p>
                <p>Artista: {currentTrack.artist}</p>
                <div className="h-20" />
                <p className="opacity-50">Não há letras disponíveis para esta faixa no momento.</p>
                <p className="opacity-30 text-xl font-medium mt-8">Splintify • 2024</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Full Queue Overlay */}
        {isFullQueueOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed top-0 right-0 bottom-[100px] w-full md:w-[400px] bg-black border-l border-zinc-800 z-50 p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Fila</h2>
              <button 
                onClick={() => setIsFullQueueOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              <div>
                <h3 className="text-zinc-400 text-sm font-bold mb-4">Tocando agora</h3>
                {currentTrack && (
                   <div className="flex items-center gap-4 bg-white/5 p-3 rounded-lg">
                      <img src={currentTrack.cover} className="w-12 h-12 rounded" alt="" />
                      <div>
                        <p className="font-bold text-emerald-500">{currentTrack.title}</p>
                        <p className="text-sm text-zinc-400">{currentTrack.artist}</p>
                      </div>
                   </div>
                )}
              </div>

              <div>
                <h3 className="text-zinc-400 text-sm font-bold mb-4">Próximo</h3>
                {queue.length > 0 ? (
                  <div className="space-y-4">
                    {queue.map((track, i) => (
                      <div key={`${track.id}-${i}`} className="flex items-center gap-4 group">
                        <span className="w-4 text-xs text-zinc-500">{i + 1}</span>
                        <img src={track.cover} className="w-10 h-10 rounded" alt="" />
                        <div className="flex-1">
                          <p className="text-sm font-bold truncate">{track.title}</p>
                          <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                        </div>
                        <button 
                          onClick={() => removeFromQueue(i)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-white"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-sm italic">Fila vazia. Adicione músicas para continuar ouvindo.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      <Player 
        currentTrack={currentTrack || tracks[0]} 
        isDetailsOpen={isDetailPanelOpen}
        onToggleDetails={() => setIsDetailPanelOpen(!isDetailPanelOpen)}
        onNext={playNext}
        onPrevious={playPrevious}
        hasNextInQueue={queue.length > 0 || repeatMode !== 'off'}
        hasPrevious={playbackHistory.length > 0}
        isShuffle={isShuffle}
        onToggleShuffle={toggleShuffle}
        repeatMode={repeatMode}
        onToggleRepeat={toggleRepeat}
        isLyricsOpen={isLyricsOpen}
        onToggleLyrics={() => setIsLyricsOpen(!isLyricsOpen)}
        isFullQueueOpen={isFullQueueOpen}
        onToggleFullQueue={() => setIsFullQueueOpen(!isFullQueueOpen)}
        volume={volume}
        onVolumeChange={setVolume}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        pauseTrigger={pauseTrigger}
        stopAfterCurrentTrack={stopAfterCurrentTrack}
        onTrackEnded={() => setStopAfterCurrentTrack(false)}
      />

      <PlaylistModal 
        isOpen={isPlaylistModalOpen}
        onClose={() => { setIsPlaylistModalOpen(false); setEditingPlaylist(null); }}
        onCreate={createPlaylist}
        onUpdate={updatePlaylist}
        onCreateFolder={createFolder}
        editingPlaylist={editingPlaylist}
      />
    </div>
  );
}

function AppRouter() {
  const { user, loading } = useAuth();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Artificial delay to ensure the cool animation plays for at least 2 seconds
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading || showLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <AppContent />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
