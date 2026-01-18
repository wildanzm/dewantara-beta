// src/data/dictionaryData.js

export const alphabetData = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  .split("")
  .map((char) => ({
    id: char,
    char: char,
    imageUrl: `/images/${char}.jpg`,
  }));

export const numberData = [
  { id: "1", char: "1", imageUrl: "/images/numbers/1.jpg" },
  { id: "2", char: "2", imageUrl: "/images/numbers/2.jpg" },
  { id: "3", char: "3", imageUrl: "/images/numbers/3.jpg" },
  { id: "4", char: "4", imageUrl: "/images/numbers/4.jpg" },
  { id: "5", char: "5", imageUrl: "/images/numbers/5.jpg" },
  { id: "6", char: "6", imageUrl: "/images/numbers/6.jpg" },
  { id: "7", char: "7", imageUrl: "/images/numbers/7.jpg" },
  { id: "8", char: "8", imageUrl: "/images/numbers/8.jpg" },
  { id: "9", char: "9", imageUrl: "/images/numbers/9.jpg" },
  { id: "10", char: "10", imageUrl: "/images/numbers/10.jpg" },
  // Tambahkan angka lain jika ada
];

export const vocabularyData = [
  {
    id: 1,
    term: "Aku",
    videoUrl: "/videos/vocabulary/aku.mp4",
  },
  {
    id: 2,
    term: "Kamu",
    videoUrl: "/videos/vocabulary/kamu.mp4",
  },
  {
    id: 3,
    term: "Saya",
    videoUrl: "/videos/vocabulary/saya.mp4",
  },
  { id: 4, term: "dia", videoUrl: "/videos/vocabulary/dia.mp4" },
  { id: 5, term: "kita", videoUrl: "/videos/vocabulary/kita.mp4" },
  { id: 6, term: "semua", videoUrl: "/videos/vocabulary/semua.mp4" },
  { id: 7, term: "apa", videoUrl: "/videos/vocabulary/apa.mp4" },
  { id: 8, term: "kenapa", videoUrl: "/videos/vocabulary/kenapa.mp4" },
  { id: 9, term: "gimana", videoUrl: "/videos/vocabulary/gimana.mp4" },
  { id: 10, term: "berapa", videoUrl: "/videos/vocabulary/berapa.mp4" },
  { id: 11, term: "boros", videoUrl: "/videos/vocabulary/boros.mp4" },
  { id: 12, term: "ganteng", videoUrl: "/videos/vocabulary/ganteng.mp4" },
  { id: 13, term: "cantik", videoUrl: "/videos/vocabulary/cantik.mp4" },
  { id: 14, term: "baik", videoUrl: "/videos/vocabulary/baik.mp4" },
  {
    id: 15,
    term: "cerewet",
    videoUrl: "/videos/vocabulary/cerewet.mp4",
  },
  // Tambahkan kosakata lain di sini
];
