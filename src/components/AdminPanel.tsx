import { Plus, Trash2, Edit2, X, Music, User, Flame, ChevronLeft, Palette, LayoutDashboard, Users, DollarSign, ArrowUpRight, TrendingUp } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { addTrack, deleteTrack, updateTrack, addArtist, deleteArtist, updateArtist, subscribeToArtists, subscribeToCategories, addCategory, updateCategory, deleteCategory, uploadMedia } from '../services/tracksService';
import { Track, Artist, Category } from '../types';
import { CATEGORIES } from '../constants';

interface AdminPanelProps {
  tracks: Track[];
  onClose: () => void;
}

type Tab = 'dashboard' | 'tracks' | 'artists' | 'categories';

export default function AdminPanel({ tracks, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isAdding, setIsAdding] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trackFile, setTrackFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [trackFormData, setTrackFormData] = useState<Omit<Track, 'id'>>({
    title: '',
    artist: '',
    album: '',
    cover: '',
    duration: 180,
    genre: '',
    isHit: false,
    audioUrl: ''
  });

  const [artistFormData, setArtistFormData] = useState<Omit<Artist, 'id'>>({
    name: '',
    genre: '',
    photo: '',
    bio: ''
  });

  const [categoryFormData, setCategoryFormData] = useState<Omit<Category, 'id'>>({
    name: '',
    color: 'bg-emerald-500'
  });

  useEffect(() => {
    const unsubscribeArtists = subscribeToArtists(setArtists);
    const unsubscribeCategories = subscribeToCategories(setCategories);
    return () => {
      unsubscribeArtists();
      unsubscribeCategories();
    };
  }, []);

  const [users, setUsers] = useState([
    { id: '1', name: 'Alok Petrillo', email: 'alok@dj.com', plan: 'Mensal', status: 'Ativo', joining: '12/03/2026' },
    { id: '2', name: 'Anitta Machado', email: 'anitta@funk.br', plan: 'Trimestral', status: 'Ativo', joining: '05/04/2026' },
    { id: '3', name: 'Luan Santana', email: 'luan@serta.br', plan: 'Free', status: 'Ativo', joining: '20/04/2026' },
    { id: '4', name: 'Ludmilla Oliveira', email: 'lud@noman.br', plan: 'Mensal', status: 'Pendente', joining: '25/04/2026' },
  ]);

  const handleConfirmPayment = (userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: 'Ativo', joining: new Date().toLocaleDateString('pt-BR') } : u
    ));
  };

  const renderDashboard = () => {
    const stats = [
      { label: 'Usuários Ativos', value: '1,284', icon: Users, color: 'text-blue-500', trend: '+12%' },
      { label: 'Receita Mensal', value: 'R$ 8.432', icon: DollarSign, color: 'text-emerald-500', trend: '+8%' },
      { label: 'Novos Premium', value: '42', icon: ArrowUpRight, color: 'text-purple-500', trend: '+24%' },
      { label: 'Engajamento', value: '86%', icon: TrendingUp, color: 'text-orange-500', trend: '+2%' },
    ];

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col gap-3 hover:bg-white/10 transition-all cursor-default scale-100 hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-zinc-800/50 ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/10">
                  {stat.trend}
                </span>
              </div>
              <div>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* User Management Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Users size={18} className="text-emerald-500" />
              Gestão de Contas e Assinaturas
            </h3>
            <button className="text-xs font-bold text-zinc-400 hover:text-white transition-colors">Ver todos</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest border-b border-white/5">
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Plano</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-emerald-500 transition-colors">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{u.name}</p>
                          <p className="text-[10px] text-zinc-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                        u.plan === 'Free' ? 'bg-zinc-800 text-zinc-400' : 'bg-emerald-500/20 text-emerald-500'
                      }`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Ativo' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                        <span className="text-xs text-zinc-300">{u.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-zinc-500">{u.joining}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.status === 'Pendente' ? (
                        <button 
                          onClick={() => handleConfirmPayment(u.id)}
                          className="px-3 py-1 bg-emerald-500 text-black text-[10px] font-black rounded-full hover:scale-105 transition-transform"
                        >
                          Confirmar
                        </button>
                      ) : (
                        <button className="p-2 text-zinc-500 hover:text-emerald-500 transition-colors">
                          <Edit2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue Projection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#181818] p-6 rounded-2xl border border-white/10">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <DollarSign size={18} className="text-emerald-500" />
              Recebimentos dos Planos
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider uppercase">Plano Mensal</p>
                  <p className="text-xl font-black text-white">R$ 4.200</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-400">600 assinaturas</p>
                  <p className="text-[10px] text-emerald-500 font-bold">+15% este mês</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider uppercase">Plano Trimestral</p>
                  <p className="text-xl font-black text-white">R$ 4.232</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-400">705 assinaturas</p>
                  <p className="text-[10px] text-emerald-500 font-bold">+22% este mês</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent p-6 rounded-2xl border border-emerald-500/20 flex flex-col justify-center group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-500 rounded-2xl text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform">
                <TrendingUp size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black text-white leading-tight">Meta de Crescimento</h4>
                <p className="text-sm text-zinc-400">84% da meta mensal atingida</p>
              </div>
            </div>
            <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden border border-white/5 relative">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                style={{ width: '84%' }} 
              />
            </div>
            <p className="mt-4 text-[10px] text-zinc-500 text-center uppercase tracking-[0.2em] font-black">
              Faltam <span className="text-white">R$ 1.568</span> para a meta
            </p>
          </div>
        </div>
      </div>
    );
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let finalTrackData = { ...trackFormData };
      
      if (coverFile) {
        const fileExt = coverFile.name.split('.').pop();
        const path = `covers/${Date.now()}.${fileExt}`;
        const url = await uploadMedia('tracks-covers', coverFile, path);
        finalTrackData.cover = url;
      }
      
      if (trackFile) {
        const fileExt = trackFile.name.split('.').pop();
        const path = `audio/${Date.now()}.${fileExt}`;
        const url = await uploadMedia('tracks-audio', trackFile, path);
        finalTrackData.audioUrl = url;
      }

      if (editingTrack) {
        await updateTrack(editingTrack.id, finalTrackData);
      } else {
        await addTrack(finalTrackData);
      }
      setIsAdding(false);
      setEditingTrack(null);
      setTrackFile(null);
      setCoverFile(null);
      setTrackFormData({
        title: '',
        artist: '',
        album: '',
        cover: '',
        duration: 180,
        genre: '',
        isHit: false,
        audioUrl: ''
      });
    } catch (err) {
      alert("Erro ao salvar música.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleArtistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingArtist) {
        await updateArtist(editingArtist.id, artistFormData);
      } else {
        await addArtist(artistFormData);
      }
      setIsAdding(false);
      setEditingArtist(null);
      setArtistFormData({
        name: '',
        genre: '',
        photo: '',
        bio: ''
      });
    } catch (err) {
      alert("Erro ao salvar artista.");
    }
  };

  const handleDeleteTrack = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta música?")) return;
    try {
      await deleteTrack(id);
    } catch (err: any) {
      alert("Erro ao excluir música: " + err.message);
    }
  };

  const handleDeleteArtist = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este artista?")) return;
    try {
      await deleteArtist(id);
    } catch (err: any) {
      alert("Erro ao excluir artista: " + err.message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este ritmo?")) return;
    try {
      await deleteCategory(id);
    } catch (err: any) {
      alert("Erro ao excluir ritmo: " + err.message);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryFormData);
      } else {
        await addCategory(categoryFormData);
      }
      setIsAdding(false);
      setEditingCategory(null);
      setCategoryFormData({ name: '', color: 'bg-emerald-500' });
    } catch (err) {
      alert("Erro ao salvar ritmo.");
    }
  };

  const handleEditTrack = (track: Track) => {
    setEditingTrack(track);
    setTrackFormData({
      title: track.title,
      artist: track.artist,
      album: track.album,
      cover: track.cover,
      duration: track.duration,
      genre: track.genre,
      isHit: !!track.isHit,
      audioUrl: track.audioUrl || ''
    });
    setIsAdding(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      color: category.color
    });
    setIsAdding(true);
  };

  const handleEditArtist = (artist: Artist) => {
    setEditingArtist(artist);
    setArtistFormData({
      name: artist.name,
      genre: artist.genre,
      photo: artist.photo,
      bio: artist.bio || ''
    });
    setIsAdding(true);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-0 md:p-4">
      <div className="bg-zinc-900 w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] md:rounded-2xl overflow-hidden flex flex-col border-white/10 shadow-2xl">
        <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-6">
            <button onClick={onClose} className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white">
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <span className="bg-emerald-500 p-1.5 rounded-lg text-black hidden md:block"><Music size={20} /></span>
              <span className="md:hidden">Admin</span>
              <span className="hidden md:inline">Painel Admin</span>
            </h2>
            <div className="flex bg-white/5 rounded-lg p-1 scale-90 md:scale-100">
              <button 
                onClick={() => { setActiveTab('dashboard'); setIsAdding(false); }}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${activeTab === 'dashboard' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => { setActiveTab('tracks'); setIsAdding(false); }}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${activeTab === 'tracks' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                Músicas
              </button>
              <button 
                onClick={() => { setActiveTab('artists'); setIsAdding(false); }}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${activeTab === 'artists' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                Artistas
              </button>
              <button 
                onClick={() => { setActiveTab('categories'); setIsAdding(false); }}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${activeTab === 'categories' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                Ritmos
              </button>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' ? renderDashboard() : isAdding || editingTrack || editingArtist || editingCategory ? (
            activeTab === 'tracks' ? (
              <form onSubmit={handleTrackSubmit} className="space-y-6">
                <h3 className="text-xl font-bold">{editingTrack ? 'Editar Música' : 'Adicionar Música'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Título</label>
                    <input type="text" required className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-emerald-500" value={trackFormData.title} onChange={e => setTrackFormData({ ...trackFormData, title: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Artista</label>
                    <input type="text" required className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-emerald-500" value={trackFormData.artist} onChange={e => setTrackFormData({ ...trackFormData, artist: e.target.value })} list="artist-list" />
                    <datalist id="artist-list">
                      {artists.map(a => <option key={a.id} value={a.name} />)}
                    </datalist>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Álbum</label>
                    <input type="text" required className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-emerald-500" value={trackFormData.album} onChange={e => setTrackFormData({ ...trackFormData, album: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Gênero</label>
                    <input type="text" required className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-emerald-500" value={trackFormData.genre} onChange={e => setTrackFormData({ ...trackFormData, genre: e.target.value })} list="genre-list" />
                    <datalist id="genre-list">
                      {categories.map(c => <option key={c.id} value={c.name} />)}
                      {CATEGORIES.map(c => <option key={c.id} value={c.name} />)}
                    </datalist>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-zinc-400">URL da Capa (Foto da Música) ou Arquivo</label>
                    <div className="flex flex-col md:flex-row gap-2">
                      <input type="url" className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-emerald-500" value={trackFormData.cover} onChange={e => setTrackFormData({ ...trackFormData, cover: e.target.value })} placeholder="Ou cole a URL aqui..." required={!coverFile && !trackFormData.cover} />
                      <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)} className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20" />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-zinc-400">URL do Áudio (Arquivo MP3) ou Arquivo</label>
                    <div className="flex flex-col md:flex-row gap-2">
                      <input type="url" className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-emerald-500" value={trackFormData.audioUrl} onChange={e => setTrackFormData({ ...trackFormData, audioUrl: e.target.value })} placeholder="Ou cole a URL aqui..." />
                      <input type="file" accept="audio/*" onChange={e => setTrackFile(e.target.files?.[0] || null)} className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Duração (segundos)</label>
                    <input type="number" required className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-emerald-500" value={trackFormData.duration} onChange={e => setTrackFormData({ ...trackFormData, duration: parseInt(e.target.value) })} />
                  </div>
                  <div className="space-y-2 text-white">
                    <label className="flex items-center gap-2 cursor-pointer mt-4">
                       <input 
                        type="checkbox" 
                        className="w-5 h-5 accent-emerald-500" 
                        checked={trackFormData.isHit}
                        onChange={e => setTrackFormData({ ...trackFormData, isHit: e.target.checked })}
                      />
                      <span className="flex items-center gap-1 font-bold text-emerald-400"><Flame size={16} /> É um Hit Brasileiro?</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={isUploading} className="flex-1 bg-emerald-500 text-black font-bold py-3 rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isUploading ? 'Fazendo Upload...' : (editingTrack ? 'Salvar Alterações' : 'Adicionar Música')}
                  </button>
                  <button type="button" onClick={() => { setIsAdding(false); setEditingTrack(null); setTrackFile(null); setCoverFile(null); }} className="px-6 border border-white/10 py-3 rounded-lg hover:bg-white/5">Cancelar</button>
                </div>
              </form>
            ) : activeTab === 'artists' ? (
              <form onSubmit={handleArtistSubmit} className="space-y-6">
                <h3 className="text-xl font-bold">{editingArtist ? 'Editar Artista' : 'Adicionar Artista'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Nome</label>
                    <input type="text" required className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-emerald-500" value={artistFormData.name} onChange={e => setArtistFormData({ ...artistFormData, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Gênero Principal</label>
                    <input type="text" required className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-emerald-500" value={artistFormData.genre} onChange={e => setArtistFormData({ ...artistFormData, genre: e.target.value })} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-zinc-400">URL da Foto</label>
                    <input type="url" required className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-emerald-500" value={artistFormData.photo} onChange={e => setArtistFormData({ ...artistFormData, photo: e.target.value })} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-zinc-400">Biografia</label>
                    <textarea className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-emerald-500 h-24" value={artistFormData.bio} onChange={e => setArtistFormData({ ...artistFormData, bio: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 bg-emerald-500 text-black font-bold py-3 rounded-lg hover:bg-emerald-400 transition-colors">{editingArtist ? 'Salvar' : 'Adicionar'}</button>
                  <button type="button" onClick={() => { setIsAdding(false); setEditingArtist(null); }} className="px-6 border border-white/10 py-3 rounded-lg hover:bg-white/5">Cancelar</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCategorySubmit} className="space-y-6">
                <h3 className="text-xl font-bold">{editingCategory ? 'Editar Ritmo' : 'Adicionar Ritmo'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Nome do Ritmo</label>
                    <input type="text" required className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-emerald-500" value={categoryFormData.name} onChange={e => setCategoryFormData({ ...categoryFormData, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Cor de Fundo (Tailwind Class)</label>
                    <select className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-emerald-500" value={categoryFormData.color} onChange={e => setCategoryFormData({ ...categoryFormData, color: e.target.value })}>
                      <option value="bg-emerald-500">Esmeralda</option>
                      <option value="bg-blue-500">Azul</option>
                      <option value="bg-purple-500">Roxo</option>
                      <option value="bg-orange-500">Laranja</option>
                      <option value="bg-pink-500">Rosa</option>
                      <option value="bg-red-500">Vermelho</option>
                      <option value="bg-yellow-500">Amarelo</option>
                      <option value="bg-indigo-500">Indigo</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 bg-emerald-500 text-black font-bold py-3 rounded-lg hover:bg-emerald-400 transition-colors">{editingCategory ? 'Salvar' : 'Adicionar'}</button>
                  <button type="button" onClick={() => { setIsAdding(false); setEditingCategory(null); }} className="px-6 border border-white/10 py-3 rounded-lg hover:bg-white/5">Cancelar</button>
                </div>
              </form>
            )
          ) : (
            <div className="space-y-6 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {activeTab === 'tracks' ? `Músicas (${tracks.length})` : activeTab === 'artists' ? `Artistas (${artists.length})` : `Ritmos (${categories.length})`}
                </h3>
                <button
                  onClick={() => setIsAdding(true)}
                  className="bg-white text-black font-bold px-4 py-2 rounded-full flex items-center gap-2 hover:scale-105 transition-transform text-sm"
                >
                  <Plus size={18} /> Adicionar {activeTab === 'tracks' ? 'Música' : activeTab === 'artists' ? 'Artista' : 'Ritmo'}
                </button>
              </div>

              <div className="space-y-2">
                {activeTab === 'tracks' ? (
                  tracks.filter(Boolean).map(track => (
                    <div key={track.id} className="bg-white/5 p-4 rounded-lg flex items-center justify-between group hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        {track.cover ? (
                          <img src={track.cover} className="w-12 h-12 rounded object-cover" alt="" />
                        ) : (
                          <div className="w-12 h-12 rounded bg-zinc-800 flex items-center justify-center">
                            <Music size={20} className="text-zinc-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold flex items-center gap-2">
                            {track.title}
                            {track.isHit && <Flame size={14} className="text-orange-500" />}
                          </p>
                          <p className="text-sm text-zinc-400">{track.artist}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditTrack(track)} className="p-2 text-zinc-400 hover:text-emerald-500 transition-colors"><Edit2 size={18} /></button>
                        <button onClick={() => handleDeleteTrack(track.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))
                ) : activeTab === 'artists' ? (
                  artists.map(artist => (
                    <div key={artist.id} className="bg-white/5 p-4 rounded-lg flex items-center justify-between group hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        {artist.photo ? (
                          <img src={artist.photo} className="w-12 h-12 rounded-full object-cover" alt="" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                            <User size={20} className="text-zinc-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold">{artist.name}</p>
                          <p className="text-sm text-zinc-400">{artist.genre}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditArtist(artist)} className="p-2 text-zinc-400 hover:text-emerald-500 transition-colors"><Edit2 size={18} /></button>
                        <button onClick={() => handleDeleteArtist(artist.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))
                ) : (
                  categories.map(category => (
                    <div key={category.id} className="bg-white/5 p-4 rounded-lg flex items-center justify-between group hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded ${category.color} flex items-center justify-center border border-white/5`}>
                          <Palette size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="font-bold">{category.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditCategory(category)} className="p-2 text-zinc-400 hover:text-emerald-500 transition-colors"><Edit2 size={18} /></button>
                        <button onClick={() => handleDeleteCategory(category.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
