import { Album } from './vinylSelector';
const base = location.hostname === 'localhost' ? '/' : '/vinyl_runner/';
export const albums: Album[] = [
    {
        name: 'Dolling',
        cover: `${base}assets/covers/dolling.jpg`,
        vinylName: 'VINYL164_2',
        audio: `${base}assets/audio/dolling.mp3`
    },
    {
        name: 'Lofi',
        cover: `${base}assets/covers/lofi.jpg`,
        vinylName: 'VINYL165_3',
        audio: `${base}assets/audio/lofi.mp3`
    },
    {
        name: 'Summer',
        cover: `${base}assets/covers/summer.jpg`,
        vinylName: 'VINYL166_4',
        audio: `${base}assets/audio/summer.mp3`
    },
];