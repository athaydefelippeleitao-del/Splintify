import { ChevronLeft, ChevronRight, Play, Sparkles, Settings, Heart, Clock, Search as SearchIcon, Check, ListMusic, Flame, User, Music, Plus, Library, X, Home, PlusSquare, MoreHorizontal, ExternalLink, LayoutDashboard } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState, useMemo } from 'react';
import { CATEGORIES, PLAYLISTS } from '../constants';
import { getMoodPlaylist } from '../services/gemini';
import { Track, Playlist, Artist, Category } from '../types';
import { useAuth } from '../contexts/AuthContext';
import AdminPanel from './AdminPanel';
import TrackContextMenu from './TrackContextMenu';

interface MainContentProps {
  tracks: Track[];
  artists: Artist[];
  categories: Category[];
  onPlayTrack: (track: Track, contextTracks?: Track[]) => void;
  activeView: 'home' | 'search' | 'library' | string;
  onViewChange: (view: 'home' | 'search' | 'library' | string) => void;
  likedTrackIds: string[];
  onToggleLike: (trackId: string) => void;
  userPlaylists: Playlist[];
  onOpenPlaylistModal: () => void;
  onEditPlaylist: (playlist: Playlist) => void;
  onAddTrackToPlaylist: (playlistId: string, track: Track) => void;
  onRemoveFromPlaylist: (playlistId: string, trackId: string) => void;
  onAddToQueue: (track: Track) => void;
  onSetSleepTimer: (minutes: number) => void;
  birthDate: string;
  onBirthDateChange: (val: string) => void;
  country: string;
  onCountryChange: (val: string) => void;
  userPlan: string;
  onPlanChange: (plan: string) => void;
}

export default function MainContent({ 
  tracks, 
  artists,
  categories,
  onPlayTrack, 
  activeView, 
  onViewChange,
  likedTrackIds,
  onToggleLike,
  userPlaylists,
  onOpenPlaylistModal,
  onEditPlaylist,
  onAddTrackToPlaylist,
  onRemoveFromPlaylist,
  onAddToQueue,
  onSetSleepTimer,
  birthDate,
  onBirthDateChange,
  country,
  onCountryChange,
  userPlan,
  onPlanChange
}: MainContentProps) {
  const { user, isAdmin, login, logout } = useAuth();
  const [mood, setMood] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isPrivateSession, setIsPrivateSession] = useState(false);
  const [isAccountEditing, setIsAccountEditing] = useState(false);
  const [tempBirthDate, setTempBirthDate] = useState(birthDate);
  const [tempCountry, setTempCountry] = useState(country);
  const [searchQuery, setSearchQuery] = useState('');
  const [addedFeedbackId, setAddedFeedbackId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, track: Track } | null>(null);

  const handleSaveAccount = () => {
    onBirthDateChange(tempBirthDate);
    onCountryChange(tempCountry);
    setIsAccountEditing(false);
  };

  const handleGenerateMood = async () => {
    if (!mood.trim()) return;
    setIsGenerating(true);
    const result = await getMoodPlaylist(mood);
    // Open some modal or view with the result
    setIsGenerating(false);
  };

  const handleToggleLike = (trackId: string) => {
    const isAdding = !likedTrackIds.includes(trackId);
    onToggleLike(trackId);
    
    if (isAdding) {
      setAddedFeedbackId(trackId);
      setTimeout(() => setAddedFeedbackId(null), 2000);
    }
  };

  const likedTracks = useMemo(() => 
    tracks.filter(t => likedTrackIds.includes(t.id)), 
    [tracks, likedTrackIds]
  );

  const filteredTracks = useMemo(() => {
    if (!searchQuery) return tracks;
    const q = searchQuery.toLowerCase();
    return tracks.filter(t => 
      t.title.toLowerCase().includes(q) || 
      t.artist.toLowerCase().includes(q)
    );
  }, [tracks, searchQuery]);

  const hitTracks = useMemo(() => tracks.filter(t => t.isHit), [tracks]);

  const renderPlaylistDetail = (playlistId: string) => {
    const playlist = userPlaylists.find(p => p.id === playlistId) || PLAYLISTS.find(p => p.id === playlistId);
    if (!playlist) return <div className="p-8 text-white">Playlist não encontrada</div>;

    return (
      <div className="flex flex-col text-white pb-32">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-end gap-6 px-8 pt-12 pb-8 bg-gradient-to-b from-zinc-800 to-transparent">
          <div className="w-48 h-48 md:w-60 md:h-60 shadow-2xl shrink-0">
            {playlist.cover ? (
              <img src={playlist.cover} className="w-full h-full object-cover rounded-md" alt="" />
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                <Music size={80} className="text-zinc-600" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase">Playlist</span>
            <h1 className="text-4xl md:text-7xl font-black">{playlist.name}</h1>
            {playlist.description && <p className="text-zinc-400 text-sm mt-2">{playlist.description}</p>}
            <div className="flex items-center gap-2 mt-4 text-sm">
              <span className="font-bold">Sons do Brasil</span>
              <span className="text-zinc-400">•</span>
              <span>{playlist.tracks.length} músicas</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 py-6 flex items-center gap-8">
          <button 
            onClick={() => playlist.tracks.length > 0 && onPlayTrack(playlist.tracks[0], playlist.tracks)}
            className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-xl"
          >
            <Play size={28} fill="black" />
          </button>
          <button 
            onClick={() => onEditPlaylist(playlist)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <Settings size={28} />
          </button>
        </div>

        {/* Tracks List */}
        <div className="px-8 mt-4">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-zinc-400 text-xs uppercase tracking-widest">
                <th className="py-3 pl-4 font-medium w-12">#</th>
                <th className="py-3 font-medium">Título</th>
                <th className="py-3 font-medium hidden md:table-cell">Álbum</th>
                <th className="py-3 pr-4 font-medium text-right"><Clock size={16} className="inline" /></th>
              </tr>
            </thead>
            <tbody>
              {playlist.tracks.filter(Boolean).map((track, i) => (
                <tr 
                  key={track.id} 
                  className="group hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => onPlayTrack(track, playlist.tracks.filter(Boolean))}
                >
                  <td className="py-3 pl-4 text-zinc-400 group-hover:text-white text-sm rounded-l-md">{i + 1}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img src={track.cover} className="w-10 h-10 rounded shadow-lg" alt="" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm truncate">{track.title}</span>
                        <span className="text-xs text-zinc-400 group-hover:text-zinc-200 truncate">{track.artist}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-zinc-400 text-sm hidden md:table-cell truncate">{track.album}</td>
                  <td className="py-3 pr-4 text-right text-zinc-400 text-sm rounded-r-md">
                    <div className="flex items-center justify-end gap-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onToggleLike(track.id); }}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity ${likedTrackIds.includes(track.id) ? 'text-emerald-500' : 'text-zinc-400 hover:text-white'}`}
                      >
                        <Heart size={16} fill={likedTrackIds.includes(track.id) ? "currentColor" : "none"} />
                      </button>
                      <span>{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setContextMenu({ x: e.clientX, y: e.clientY, track });
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-white"
                      >
                        <MoreHorizontal size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {playlist.tracks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500 border border-white/5 border-dashed rounded-xl mt-4">
              <PlusSquare size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">Esta playlist está vazia</p>
              <p className="text-sm">Encontre músicas abaixo para dar vida à sua coleção</p>
            </div>
          )}
        </div>

        {/* Recommended Tracks to Add */}
        <div className="px-8 mt-12 pb-20">
          <h3 className="text-xl font-bold mb-2">Recomendadas</h3>
          <p className="text-zinc-400 text-sm mb-6">Baseado no que você gosta no Brasil</p>
          <div className="space-y-1">
            {tracks.filter(t => t && !playlist.tracks.some(pt => pt && pt.id === t.id)).slice(0, 10).map(track => (
              <div key={track.id} className="flex items-center justify-between p-2 rounded-md hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4 flex-1">
                  <img src={track.cover} className="w-10 h-10 rounded shadow-lg" alt="" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{track.title}</p>
                    <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onAddTrackToPlaylist(playlist.id, track); }}
                  className="px-6 py-1.5 rounded-full border border-zinc-700 text-xs font-bold hover:border-white transition-colors"
                >
                  Adicionar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryDetail = (category: Category) => {
    const categoryTracks = tracks.filter(t => t.genre === category.name);
    
    return (
      <div className="flex flex-col text-white pb-32">
        <header className={`p-8 pb-12 flex flex-col items-start gap-4 ${category.color} relative overflow-hidden`}>
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-0" />
           <div className="relative z-10 w-full">
              <button 
                onClick={() => onViewChange('search')}
                className="mb-6 p-2 bg-black/40 rounded-full hover:bg-black/60 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-6xl font-black mb-2">{category.name}</h1>
              <p className="font-bold text-zinc-300">{categoryTracks.length} músicas disponíveis</p>
           </div>
        </header>

        <div className="p-4 md:p-8">
           <div className="flex items-center gap-6 mb-8">
              <button 
                className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-xl"
                onClick={() => categoryTracks.length > 0 && onPlayTrack(categoryTracks[0], categoryTracks)}
              >
                <Play fill="black" size={28} />
              </button>
              <button className="border border-white/40 hover:border-white font-bold px-8 py-2 rounded-full transition-all">Seguir</button>
           </div>

           <div className="space-y-1">
              {categoryTracks.filter(Boolean).map((track, i) => (
                <div 
                  key={track.id} 
                  className="group flex items-center gap-4 p-3 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => onPlayTrack(track, categoryTracks.filter(Boolean))}
                >
                  <p className="w-8 text-right text-zinc-500 font-mono group-hover:text-white">{i + 1}</p>
                  <img src={track.cover} className="w-10 h-10 rounded object-cover shadow-lg" alt="" />
                  <div className="flex-1 min-w-0 ml-2">
                    <p className="font-bold truncate">{track.title}</p>
                    <p className="text-sm text-zinc-400 truncate group-hover:text-white">{track.artist}</p>
                  </div>
                   <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onToggleLike(track.id); }}
                      className={`transition-colors ${likedTrackIds.includes(track.id) ? 'text-emerald-500' : 'text-zinc-400 hover:text-white'}`}
                    >
                      <Heart size={16} fill={likedTrackIds.includes(track.id) ? "currentColor" : "none"} />
                    </button>
                    <span className="text-sm text-zinc-500 font-mono">
                       {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setContextMenu({ x: e.clientX, y: e.clientY, track });
                      }}
                      className="text-zinc-400 hover:text-white"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                </div>
              ))}
              {categoryTracks.length === 0 && (
                <div className="py-24 text-center text-zinc-500 flex flex-col items-center gap-4">
                   <Music size={64} className="opacity-20" />
                   <div>
                     <p className="text-xl font-bold">Nenhuma música em {category.name}</p>
                     <p className="mt-2 text-sm">Adicione músicas com este gênero no Painel Admin</p>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    );
  };

  const renderPlans = () => (
    <div className="p-4 md:p-12 text-white flex flex-col gap-10 pb-32 max-w-5xl mx-auto">
      <header className="text-center">
        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">Escolha seu plano Premium</h1>
        <p className="text-zinc-400 text-lg">Música sem limites, sem anúncios e com a melhor qualidade.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        {/* Plano 1 Mês */}
        <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl flex flex-col hover:border-emerald-500/50 transition-colors group">
          <div className="flex justify-between items-start mb-8">
            <div>
              <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 inline-block">Individual</span>
              <h2 className="text-3xl font-black">1 Mês</h2>
            </div>
            <p className="text-3xl font-black">R$ 7,00</p>
          </div>
          
          <ul className="flex-1 space-y-4 mb-10">
            <li className="flex items-center gap-3 text-zinc-300">
              <Check size={20} className="text-emerald-500 shrink-0" />
              <span>Ouça sem anúncios</span>
            </li>
            <li className="flex items-center gap-3 text-zinc-300">
              <Check size={20} className="text-emerald-500 shrink-0" />
              <span>Qualidade de som superior</span>
            </li>
            <li className="flex items-center gap-3 text-zinc-300">
              <Check size={20} className="text-emerald-500 shrink-0" />
              <span>Cancele quando quiser</span>
            </li>
          </ul>

          <button 
            onClick={() => {
              onPlanChange('Mensal');
              onViewChange('account');
            }}
            className="w-full bg-white text-black font-bold py-4 rounded-full hover:scale-105 transition-transform shadow-xl"
          >
            Assinar agora
          </button>
        </div>

        {/* Plano 3 Meses */}
        <div className="bg-emerald-500 border border-emerald-400 p-8 rounded-3xl flex flex-col hover:scale-[1.02] transition-all shadow-[0_0_50px_rgba(16,185,129,0.2)] relative overflow-hidden group">
          <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Melhor Valor</div>
          
          <div className="flex justify-between items-start mb-8 text-black">
            <div>
              <span className="bg-black/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 inline-block text-black">Trimestral</span>
              <h2 className="text-3xl font-black">3 Meses</h2>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black">R$ 6,00</p>
              <p className="text-[10px] font-bold uppercase">por mês</p>
            </div>
          </div>
          
          <ul className="flex-1 space-y-4 mb-10 text-black/80 font-medium">
            <li className="flex items-center gap-3">
              <Check size={20} className="text-black shrink-0" />
              <span>Pague R$ 18,00 a cada 3 meses</span>
            </li>
            <li className="flex items-center gap-3">
              <Check size={20} className="text-black shrink-0" />
              <span>Economize no plano de longo prazo</span>
            </li>
            <li className="flex items-center gap-3">
              <Check size={20} className="text-black shrink-0" />
              <span>Qualidade máxima de áudio</span>
            </li>
            <li className="flex items-center gap-3">
              <Check size={20} className="text-black shrink-0" />
              <span>Acesso antecipado a novos sons</span>
            </li>
          </ul>

          <button 
            onClick={() => {
              onPlanChange('Trimestral');
              onViewChange('account');
            }}
            className="w-full bg-black text-white font-bold py-4 rounded-full hover:scale-105 transition-transform shadow-2xl"
          >
            Aproveitar oferta
          </button>
        </div>
      </div>

      <div className="text-center mt-12">
        <p className="text-zinc-500 text-xs">Sujeito a termos e condições. O plano de 3 meses é cobrado como um pagamento único de R$ 18,00.</p>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="flex flex-col gap-6 text-white pb-32 pt-2">
      {/* Top Filter Chips */}
      <div className="px-4 md:px-8 flex items-center gap-2 mb-2 overflow-x-auto no-scrollbar pb-2">
        {['Tudo', 'Músicas', 'Podcasts'].map((tab) => (
          <button 
            key={tab} 
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${tab === 'Tudo' ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Hero Quick Access Grid - 2 columns on mobile */}
      <div className="px-4 md:px-8 grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {/* Liked Songs Shortcut */}
        <div 
          onClick={() => onViewChange('library')}
          className="bg-white/5 hover:bg-white/10 transition-colors rounded overflow-hidden flex items-center gap-2 md:gap-3 pr-2 cursor-pointer group relative"
        >
          <div className="w-12 h-12 md:w-20 md:h-20 shrink-0 bg-gradient-to-br from-indigo-700 to-emerald-400 flex items-center justify-center shadow-lg">
            <Heart size={20} fill="white" />
          </div>
          <div className="flex-1 flex items-center justify-between min-w-0">
            <span className="font-bold truncate text-[12px] md:text-[14px]">Músicas Curtidas</span>
          </div>
        </div>

        {[...PLAYLISTS, ...userPlaylists].filter(Boolean).slice(0, 7).map((playlist) => (
          <div 
            key={playlist.id} 
            onClick={() => onViewChange(`playlist:${playlist.id}`)}
            className="bg-white/5 hover:bg-white/10 transition-colors rounded overflow-hidden flex items-center gap-2 md:gap-3 pr-2 cursor-pointer group relative"
          >
            <div className="w-12 h-12 md:w-20 md:h-20 shrink-0 shadow-lg">
              <img src={playlist.cover} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="flex-1 flex items-center justify-between min-w-0">
              <span className="font-bold truncate text-[12px] md:text-[14px]">{playlist.name}</span>
              <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-black shadow-xl">
                  <Play fill="black" size={18} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Featured Media Card (as seen in screenshot) */}
      <div className="px-4 md:px-8 mt-2">
        <div className="relative aspect-square md:aspect-video rounded-2xl overflow-hidden group cursor-pointer">
          <img 
            src="https://images.unsplash.com/photo-1514525253361-bee8718a300c?w=1000&q=80" 
            className="w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform duration-700" 
            alt="Featured" 
          />
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
            <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-emerald-500 mb-1">Destaque</p>
            <h3 className="text-2xl md:text-5xl font-black tracking-tighter mb-2">Canal São Josemaria Escrivá</h3>
            <span className="bg-black/60 px-3 py-1 rounded text-xs font-mono">26:16</span>
            
            <div className="absolute right-6 bottom-6 flex flex-col gap-4">
              <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors">
                <Plus size={20} />
              </button>
              <button className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-2xl">
                <Play size={24} fill="black" />
              </button>
            </div>
          </div>
          <div className="absolute top-6 left-6 text-sm font-bold opacity-60">não importa</div>
        </div>
      </div>

      {/* Featured Single Track Card below media card */}
      <div className="px-4 md:px-8 -mt-2">
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
          <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden shadow-xl">
             <img src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&q=80" className="w-full h-full object-cover" alt="" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-base truncate group-hover:text-emerald-500 transition-colors">A ROTINA QUE SANTIFICA - SÃO JOSEMARIA ESCRIVÁ</h4>
            <p className="text-zinc-400 text-sm truncate">Meditações São Josemaria Escrivá • 100 mi...</p>
          </div>
          <button className="text-zinc-400 p-2">
            <MoreHorizontal size={24} />
          </button>
        </div>
      </div>

      {/* Squares Section */}
      <div className="px-4 md:px-8 mt-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold hover:underline cursor-pointer">Álbuns com as músicas que você adora</h2>
          <span className="text-sm font-bold text-zinc-400 hover:underline cursor-pointer">Mostrar tudo</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {hitTracks.filter(Boolean).slice(0, 12).map(track => (
            <div 
              key={track.id} 
              className="bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition-all group cursor-pointer"
              onClick={() => onPlayTrack(track, hitTracks.filter(Boolean))}
            >
              <div className="relative mb-4 aspect-square shadow-2xl rounded-lg overflow-hidden">
                <img src={track.cover} className="w-full h-full object-cover" alt="" />
                <div className="absolute bottom-2 right-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 shadow-xl transition-all">
                  <button className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform">
                    <Play fill="black" size={24} />
                  </button>
                </div>
              </div>
              <h3 className="font-bold truncate text-[16px]">{track.title}</h3>
              <p className="text-[14px] text-zinc-400 mt-1 line-clamp-1">{track.artist}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Circles Section */}
      <div className="px-4 md:px-8 mt-4 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold hover:underline cursor-pointer tracking-tight">Suas músicas estão com saudade</h2>
          <span className="text-sm font-bold text-zinc-400 hover:underline cursor-pointer">Mostrar tudo</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {artists.slice(0, 6).map(artist => (
            <div 
              key={artist.id} 
              className="bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition-all group cursor-pointer text-center"
            >
              <div className="relative mb-4 aspect-square shadow-2xl rounded-full overflow-hidden group-hover:shadow-emerald-500/10">
                <img src={artist.photo} className="w-full h-full object-cover" alt="" />
                <div className="absolute bottom-2 right-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 shadow-xl transition-all">
                  <button className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-black">
                    <Play fill="black" size={24} />
                  </button>
                </div>
              </div>
              <h3 className="font-bold truncate text-base">{artist.name}</h3>
              <p className="text-sm text-zinc-400 mt-1">Artista</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLibrary = () => (
    <div className="flex flex-col gap-8 p-4 md:p-8 text-white">
      <div className="flex flex-col md:flex-row gap-8 items-end bg-gradient-to-b from-emerald-600/20 to-zinc-900/10 p-8 rounded-3xl border border-white/5">
        <div className="w-48 h-48 bg-gradient-to-br from-indigo-600 to-emerald-400 rounded-lg shadow-2xl flex items-center justify-center shrink-0 border border-white/10">
          <Heart size={80} fill="white" className="text-white" />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">Playlist</span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4">Músicas Curtidas</h1>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="text-white">{user?.displayName || 'Você'}</span>
            <span className="text-zinc-400">• {likedTracks.length} músicas</span>
          </div>
        </div>
      </div>

      <div className="bg-black/20 rounded-xl overflow-hidden backdrop-blur-sm border border-white/5">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="text-zinc-400 text-xs uppercase tracking-widest border-b border-white/10">
              <th className="px-4 py-4 font-normal w-12">#</th>
              <th className="px-4 py-4 font-normal">Título</th>
              <th className="px-4 py-4 font-normal hidden md:table-cell">Álbum</th>
              <th className="px-4 py-4 font-normal hidden sm:table-cell text-right pr-8"><Clock size={16} className="inline" /></th>
            </tr>
          </thead>
          <tbody>
            {likedTracks.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-zinc-500 italic">
                  Sua biblioteca brasileira está vazia. Explore e curta algumas músicas!
                </td>
              </tr>
            ) : (
              likedTracks.filter(Boolean).map((track, i) => (
                <tr 
                  key={track.id} 
                  className="hover:bg-white/5 group cursor-pointer transition-colors"
                  onClick={() => onPlayTrack(track, likedTracks.filter(Boolean))}
                >
                  <td className="px-4 py-3 text-zinc-400 text-sm group-hover:text-emerald-500 transition-colors">
                    <span className="group-hover:hidden">{i + 1}</span>
                    <Play size={14} fill="currentColor" className="hidden group-hover:block" />
                  </td>
                  <td className="px-4 py-3 flex items-center gap-3">
                    <img src={track.cover} className="w-10 h-10 rounded shadow-lg" alt="" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-white truncate">{track.title}</span>
                      <span className="text-sm text-zinc-400 group-hover:text-white transition-colors truncate">{track.artist}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400 hidden md:table-cell truncate">{track.album}</td>
                  <td className="px-4 py-3 text-sm text-zinc-400 hidden sm:table-cell text-right pr-8">
                    {Math.floor(track.duration / 60)}:{Math.floor(track.duration % 60).toString().padStart(2, '0')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {userPlaylists.length > 0 ? (
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Minhas Playlists Brasileiras</h2>
            <button 
              onClick={onOpenPlaylistModal}
              className="text-sm font-bold text-emerald-500 hover:underline"
            >
              Criar nova
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-12">
            {userPlaylists.filter(Boolean).map(playlist => (
              <div 
                key={playlist.id} 
                className="bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer"
                onClick={() => onViewChange(`playlist:${playlist.id}`)}
              >
                <div className="relative mb-4">
                  <img src={playlist.cover} className="w-full aspect-square object-cover rounded-lg shadow-2xl" alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onPlayTrack(playlist.tracks[0], playlist.tracks); }}
                      className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-black shadow-lg hover:scale-110 transition-transform"
                    >
                      <Play size={20} fill="black" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEditPlaylist(playlist); }}
                      className="w-10 h-10 bg-zinc-800/80 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg border border-white/10 hover:bg-zinc-700 transition-all hover:scale-110"
                      title="Configurar Playlist"
                    >
                      <Settings size={20} />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold truncate">{playlist.name}</h3>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Playlist</p>
                  {playlist.description && (
                    <span className="text-[10px] text-zinc-500 italic max-w-[80px] truncate" title={playlist.description}>
                      {playlist.description}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-8 flex flex-col items-center justify-center py-12 bg-white/5 rounded-3xl border border-white/5 border-dashed">
          <ListMusic size={64} className="text-zinc-600 mb-4" />
          <h2 className="text-xl font-bold mb-2">Crie sua primeira playlist</h2>
          <p className="text-zinc-400 text-sm mb-6 max-w-xs text-center">Organize seus sons brasileiros favoritos em coleções personalizadas.</p>
          <button 
            onClick={onOpenPlaylistModal}
            className="bg-white text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
          >
            Criar playlist
          </button>
        </section>
      )}
    </div>
  );

  const renderSearch = () => (
    <div className="p-4 md:p-8 flex flex-col gap-8 text-white">
      <div className="relative max-w-2xl w-full">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
        <input 
          type="text" 
          placeholder="Artistas, músicas ou ritmos brasileiros..." 
          className="w-full bg-white/10 border border-white/5 rounded-full py-4 pl-12 pr-4 outline-none focus:bg-white/20 focus:border-white/10 transition-all text-sm md:text-lg font-medium"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
      </div>

      {searchQuery ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4 md:gap-6">
          {filteredTracks.filter(Boolean).map((track) => (
            <motion.div
              key={track.id}
              whileHover={{ y: -5 }}
              className="bg-white/5 p-3 md:p-4 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer"
              onClick={() => onPlayTrack(track)}
            >
              <img src={track.cover} className="w-full aspect-square object-cover rounded-md shadow-2xl mb-3" alt="" />
              <h3 className="font-bold truncate text-sm md:text-base">{track.title}</h3>
              <p className="text-xs md:text-sm text-zinc-400 truncate">{track.artist}</p>
            </motion.div>
          ))}
          {filteredTracks.length === 0 && (
            <p className="col-span-full text-zinc-500 italic text-center py-12">Nenhum resultado brasileiro para "{searchQuery}"</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <h2 className="col-span-full text-2xl font-bold mb-2">Explorar Ritmos</h2>
          {(categories.length > 0 ? categories : CATEGORIES).map((cat) => (
            <div 
              key={cat.id} 
              onClick={() => {
                setSelectedCategory(cat);
                onViewChange(`genre:${cat.id}`);
              }}
              className={`${cat.color} aspect-video rounded-xl p-4 cursor-pointer hover:scale-[1.02] transition-transform shadow-xl relative overflow-hidden group`}
            >
              <span className="text-xl md:text-2xl font-extrabold tracking-tighter text-white z-10 relative">{cat.name}</span>
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rotate-[20deg] blur-2xl group-hover:bg-white/20 transition-colors" />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="p-4 md:p-8 text-white flex flex-col gap-8 pb-32">
      <div className="flex items-end gap-6 bg-gradient-to-b from-zinc-800 to-transparent p-8 rounded-3xl">
        <div className="w-48 h-48 rounded-full overflow-hidden shadow-2xl border-4 border-white/10">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-emerald-500/20 flex items-center justify-center">
              <User size={80} className="text-emerald-500" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-widest">Perfil</span>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter">{user?.displayName || 'Usuário'}</h1>
          <div className="flex items-center gap-2 mt-4 text-sm font-bold">
            <span>{userPlaylists.length} Playlists Públicas</span>
            <span className="text-zinc-500">•</span>
            <span>{likedTracks.length} Músicas Curtidas</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-2xl font-bold mb-6">Playlists Recentes</h2>
          <div className="grid grid-cols-2 gap-4">
            {userPlaylists.slice(0, 4).map(playlist => (
              <div 
                key={playlist.id} 
                onClick={() => onViewChange(`playlist:${playlist.id}`)}
                className="bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer"
              >
                <img src={playlist.cover} className="w-full aspect-square object-cover rounded-lg shadow-lg mb-3" alt="" />
                <p className="font-bold truncate">{playlist.name}</p>
              </div>
            ))}
            {userPlaylists.length === 0 && (
              <div className="col-span-full py-12 text-center text-zinc-500 border border-white/5 border-dashed rounded-xl">
                 Nenhuma playlist criada ainda.
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Músicas Curtidas Recentemente</h2>
          <div className="space-y-1">
            {likedTracks.slice(0, 5).map(track => (
              <div 
                key={track.id} 
                onClick={() => onPlayTrack(track)}
                className="flex items-center gap-4 p-2 rounded-md hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <img src={track.cover} className="w-10 h-10 rounded" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{track.title}</p>
                  <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                </div>
              </div>
            ))}
            {likedTracks.length === 0 && (
               <div className="py-12 text-center text-zinc-500 border border-white/5 border-dashed rounded-xl">
                 Você ainda não curtiu nenhuma música.
               </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );

  const renderAccount = () => (
    <div className="p-4 md:p-12 text-white flex flex-col gap-10 pb-32 max-w-4xl mx-auto">
      <header>
        <h1 className="text-4xl font-black mb-2">Visão geral da conta</h1>
        <p className="text-zinc-400">Gerencie seus detalhes de perfil e configurações de privacidade.</p>
      </header>

      <div className="grid gap-6">
        <div className="bg-white/5 p-8 rounded-2xl border border-white/5">
          <h2 className="text-xl font-bold mb-8">Perfil</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-3 border-b border-white/5 pb-4">
              <span className="text-zinc-500 font-medium">Nome de usuário</span>
              <span className="col-span-2 font-bold">{user?.displayName}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-white/5 pb-4">
              <span className="text-zinc-500 font-medium">E-mail</span>
              <span className="col-span-2 font-bold">{user?.email}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-white/5 pb-4">
              <span className="text-zinc-500 font-medium">Data de nascimento</span>
              <span className="col-span-2 font-bold">
                {isAccountEditing ? (
                  <input 
                    type="date"
                    value={tempBirthDate}
                    onChange={(e) => setTempBirthDate(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded px-3 py-1 outline-none text-white focus:border-emerald-500 transition-colors"
                  />
                ) : (
                  birthDate || <span className="opacity-30">Não informada</span>
                )}
              </span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-zinc-500 font-medium">País ou região</span>
              <span className="col-span-2 font-bold flex items-center gap-2">
                {isAccountEditing ? (
                  <select 
                    value={tempCountry}
                    onChange={(e) => setTempCountry(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded px-3 py-1 outline-none text-white focus:border-emerald-500 transition-colors"
                  >
                    <option value="Brasil">Brasil</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Estados Unidos">Estados Unidos</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Espanha">Espanha</option>
                  </select>
                ) : (
                  <>
                    <span className="text-emerald-500">{country}</span>
                    <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-[10px] uppercase text-emerald-500">Padrão</span>
                  </>
                )}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            {isAccountEditing ? (
              <>
                <button 
                  onClick={handleSaveAccount}
                  className="mt-8 bg-emerald-500 text-black px-8 py-2.5 rounded-full font-bold transition-all text-sm hover:scale-105"
                >
                  Salvar perfil
                </button>
                <button 
                  onClick={() => setIsAccountEditing(false)}
                  className="mt-8 border border-zinc-500 hover:border-white px-8 py-2.5 rounded-full font-bold transition-all text-sm"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button 
                onClick={() => {
                  setTempBirthDate(birthDate);
                  setTempCountry(country);
                  setIsAccountEditing(true);
                }}
                className="mt-8 border border-zinc-500 hover:border-white px-8 py-2.5 rounded-full font-bold transition-all text-sm"
              >
                Editar perfil
              </button>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-8 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold mb-2">Seu plano</h2>
            <p className="text-3xl font-black text-emerald-500 uppercase tracking-tighter">
              {userPlan === 'Free' ? 'Sons do Brasil Free' : `Sons do Brasil ${userPlan}`}
            </p>
            <p className="text-zinc-400 mt-2 text-sm">
              {userPlan === 'Free' 
                ? 'Aproveite músicas ilimitadas com anúncios ocasionais.' 
                : 'Você está aproveitando todos os recursos Premium sem anúncios.'}
            </p>
          </div>
          {userPlan === 'Free' ? (
            <button 
              onClick={() => onViewChange('plans')}
              className="bg-white text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform shrink-0 shadow-lg"
            >
              Seja Premium
            </button>
          ) : (
            <button 
              onClick={() => onPlanChange('Free')}
              className="border border-zinc-500 hover:border-red-500 hover:text-red-500 text-zinc-400 font-bold px-8 py-3 rounded-full transition-all shrink-0"
            >
              Cancelar Premium
            </button>
          )}
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <h3 className="font-bold text-zinc-500 uppercase tracking-widest text-xs">Ações rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={logout} className="p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-500 font-bold transition-colors text-left flex items-center justify-between">
            Sair desta conta
            <ChevronRight size={20} />
          </button>
          <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-white font-bold transition-colors text-left flex items-center justify-between">
            Gerenciar aplicativos
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-[#121212] overflow-y-auto scroll-smooth pb-32 md:pb-10 rounded-xl m-2 ml-0">
      {/* Header */}
      <header className="py-3 px-8 flex items-center justify-between sticky top-0 bg-[#121212]/95 backdrop-blur-md z-40 gap-4 h-16">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button className="bg-black/60 p-2 rounded-full text-zinc-400 hover:text-white transition-colors" onClick={() => onViewChange('home')}><ChevronLeft size={20} /></button>
            <button className="hidden md:block bg-black/20 p-2 rounded-full text-zinc-400/50 cursor-not-allowed"><ChevronRight size={20} /></button>
          </div>
        </div>
        
        {/* Centered Top Nav element as seen in screenshot */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <button 
            onClick={() => onViewChange('home')}
            className={`p-3 rounded-full transition-colors ${activeView === 'home' ? 'bg-[#2a2a2a] text-white' : 'hover:bg-white/5 text-zinc-400'}`}
          >
            <Home size={24} />
          </button>
          <div className="flex items-center bg-[#242424] rounded-full px-4 py-2 gap-3 border border-white/5 w-64 md:w-[450px] shadow-inner group focus-within:ring-2 focus-within:ring-white/20 transition-all">
            <SearchIcon size={20} className="text-zinc-400" />
            <input 
              type="text" 
              placeholder="O que você quer ouvir?" 
              className="bg-transparent outline-none text-sm w-full text-white placeholder:text-zinc-500"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value && activeView !== 'search') onViewChange('search');
              }}
            />
            <div className="w-[1px] h-5 bg-white/10 mx-1" />
            <div className="p-1 hover:bg-white/5 rounded-full cursor-pointer text-zinc-400 hover:text-white" onClick={handleGenerateMood}>
              <Sparkles size={18} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 relative">
          {isAdmin && (
            <button 
              onClick={() => setIsAdminPanelOpen(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
            >
              <Settings size={20} />
            </button>
          )}

          {user ? (
            <div className="relative shrink-0">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 bg-black/40 hover:bg-white/10 p-1 md:pr-3 rounded-full transition-colors border border-white/5"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-white/20" />
                ) : (
                  <div className="w-8 h-8 rounded-full border border-white/20 bg-emerald-500/20 flex items-center justify-center">
                    <User size={16} className="text-emerald-500" />
                  </div>
                )}
                <span className="hidden md:block text-xs font-bold text-white max-w-[100px] truncate">{user.displayName}</span>
              </button>

              {isProfileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-72 bg-[#282828] border border-white/10 rounded-md shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-1">
                      <button 
                        onClick={() => { onViewChange('account'); setIsProfileMenuOpen(false); }}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium hover:bg-white/10 rounded-sm transition-colors text-zinc-100"
                      >
                        Conta <ExternalLink size={16} className="text-zinc-400" />
                      </button>
                      <button 
                        onClick={() => { onViewChange('profile'); setIsProfileMenuOpen(false); }}
                        className="w-full text-left px-3 py-2.5 text-sm font-medium hover:bg-white/10 rounded-sm transition-colors text-zinc-100"
                      >
                        Perfil
                      </button>
                      <button 
                         onClick={() => { onViewChange('home'); setIsProfileMenuOpen(false); }}
                         className="w-full text-left px-3 py-2.5 text-sm font-medium hover:bg-white/10 rounded-sm transition-colors text-zinc-100"
                      >
                        Recentes
                      </button>
                      <button 
                         className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium hover:bg-white/10 rounded-sm transition-colors text-zinc-100"
                      >
                        Suporte <ExternalLink size={16} className="text-zinc-400" />
                      </button>
                      <button 
                        onClick={() => { setIsPrivateSession(!isPrivateSession); setIsProfileMenuOpen(false); }}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium hover:bg-white/10 rounded-sm transition-colors text-zinc-100"
                      >
                        Sessão particular
                        {isPrivateSession && <Check size={14} className="text-emerald-500" />}
                      </button>
                      <button 
                        onClick={() => { onViewChange('account'); setIsProfileMenuOpen(false); }}
                        className="w-full text-left px-3 py-2.5 text-sm font-medium hover:bg-white/10 rounded-sm transition-colors text-zinc-100"
                      >
                        Configurações
                      </button>
                      {isAdmin && (
                        <>
                          <div className="border-t border-white/5 my-1" />
                          <button 
                            onClick={() => { setIsAdminPanelOpen(true); setIsProfileMenuOpen(false); }}
                            className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-black hover:bg-emerald-500/10 rounded-sm transition-all text-emerald-500 group"
                          >
                            <span className="flex items-center gap-2">
                              <LayoutDashboard size={14} className="group-hover:scale-110 transition-transform" />
                              Painel Admin
                            </span>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => { logout(); setIsProfileMenuOpen(false); }}
                        className="w-full text-left px-3 py-2.5 text-sm font-medium hover:bg-white/10 rounded-sm transition-colors text-zinc-100"
                      >
                        Sair
                      </button>
                    </div>

                    <div className="border-t border-white/10 mt-1" />

                    <div className="p-4">
                      <h3 className="font-bold text-white text-base mb-6">Suas atualizações</h3>
                      
                      <div className="flex flex-col items-center text-center py-4">
                        <div className="mb-4">
                          <Check size={40} className="text-white" strokeWidth={3} />
                        </div>
                        <p className="font-bold text-white text-base mb-2">Você está em dia</p>
                        <p className="text-zinc-400 text-[13px] leading-relaxed">
                          Fique de olho neste espaço pra saber das novidades sobre seus seguidores, playlists, eventos e muito mais.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          ) : (
            <button onClick={login} className="bg-white text-black font-bold px-6 py-2 rounded-full hover:scale-105 transition-transform text-sm">Entrar</button>
          )}
        </div>
      </header>

      {isAdminPanelOpen && (
        <AdminPanel 
          tracks={tracks} 
          onClose={() => setIsAdminPanelOpen(false)} 
        />
      )}

      <main>
        {activeView === 'home' && renderHome()}
        {activeView === 'search' && renderSearch()}
        {activeView === 'library' && renderLibrary()}
        {activeView === 'profile' && renderProfile()}
        {activeView === 'account' && renderAccount()}
        {activeView === 'plans' && renderPlans()}
        {activeView.startsWith('playlist:') && renderPlaylistDetail(activeView.split(':')[1])}
        {activeView.startsWith('genre:') && selectedCategory && renderCategoryDetail(selectedCategory)}
        
        {contextMenu && (
          <TrackContextMenu
            track={contextMenu.track}
            playlists={userPlaylists}
            position={{ x: contextMenu.x, y: contextMenu.y }}
            onClose={() => setContextMenu(null)}
            onAddToPlaylist={onAddTrackToPlaylist}
            onRemoveFromPlaylist={onRemoveFromPlaylist}
            onAddToQueue={onAddToQueue}
            onSetSleepTimer={onSetSleepTimer}
            onToggleLike={onToggleLike}
            isLiked={likedTrackIds.includes(contextMenu.track.id)}
            currentPlaylistId={activeView.startsWith('playlist:') ? activeView.split(':')[1] : undefined}
          />
        )}
      </main>
    </div>
  );
}
