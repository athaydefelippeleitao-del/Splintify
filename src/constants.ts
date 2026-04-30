import { Category, Playlist, Track } from './types';

export const TRACKS: Track[] = [
  {
    id: '1',
    title: 'Garota de Ipanema',
    artist: 'Antônio Carlos Jobim',
    album: 'The Composer of Desafinado, Plays',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
    duration: 167,
    genre: 'Bossa Nova'
  },
  {
    id: '2',
    title: 'Avisa que é o Funk',
    artist: 'MC Braz',
    album: 'Hits do Baile',
    cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=500&q=80',
    duration: 185,
    genre: 'Funk'
  },
  {
    id: '3',
    title: 'Onde Você Mora?',
    artist: 'Cidade Negra',
    album: 'Sobre Todas as Forças',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
    duration: 210,
    genre: 'Reggae Nacional'
  },
  {
    id: '4',
    title: 'Asa Branca',
    artist: 'Luiz Gonzaga',
    album: 'O Rei do Baião',
    cover: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=500&q=80',
    duration: 195,
    genre: 'Forró'
  },
  {
    id: '5',
    title: 'Pelo Telefone',
    artist: 'Bahiano',
    album: 'História do Samba',
    cover: 'https://images.unsplash.com/photo-1420161907993-e2989d9577af?w=500&q=80',
    duration: 202,
    genre: 'Samba'
  },
  {
    id: '6',
    title: 'Mas que Nada',
    artist: 'Jorge Ben Jor',
    album: 'Samba Esquema Novo',
    cover: 'https://images.unsplash.com/photo-1514525253361-bee8d4a9ecae?w=500&q=80',
    duration: 182,
    genre: 'MPB'
  }
];

export const PLAYLISTS: Playlist[] = [
  {
    id: 'p1',
    name: 'Top Brasil',
    description: 'As músicas mais tocadas no Brasil agora.',
    cover: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=500&q=80',
    tracks: TRACKS.slice(0, 4)
  },
  {
    id: 'p2',
    name: 'Samba de Raiz',
    description: 'O melhor do samba tradicional.',
    cover: 'https://images.unsplash.com/photo-1420161907993-e2989d9577af?w=500&q=80',
    tracks: [TRACKS[4], TRACKS[5]]
  },
  {
    id: 'p3',
    name: 'Forró Pé de Serra',
    description: 'Para balançar o corpo o dia todo.',
    cover: 'https://images.unsplash.com/photo-1514525253361-bee8d4a9ecae?w=500&q=80',
    tracks: [TRACKS[3]]
  }
];

export const CATEGORIES: Category[] = [
  { id: 'c1', name: 'Samba', color: 'bg-emerald-600' },
  { id: 'c2', name: 'Funk', color: 'bg-purple-600' },
  { id: 'c3', name: 'MPB', color: 'bg-yellow-600' },
  { id: 'c4', name: 'Forró', color: 'bg-amber-700' },
  { id: 'c5', name: 'Rock Brasil', color: 'bg-indigo-600' },
  { id: 'c6', name: 'Sertanejo', color: 'bg-orange-600' }
];
