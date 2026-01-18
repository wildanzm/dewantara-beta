// src/hooks/useWindowSize.js
import { useState, useEffect } from "react";

// Custom hook untuk mendapatkan lebar jendela browser secara real-time
export default function useWindowSize() {
  // State untuk menyimpan lebar jendela
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth, // Ambil lebar awal saat hook dijalankan
  });

  useEffect(() => {
    // Fungsi yang akan dipanggil saat jendela di-resize
    function handleResize() {
      // Update state dengan lebar jendela yang baru
      setWindowSize({
        width: window.innerWidth,
      });
    }

    // Tambahkan event listener saat komponen yang menggunakan hook ini dimuat
    window.addEventListener("resize", handleResize);

    // Panggil sekali saat awal untuk memastikan nilai awal benar
    handleResize();

    // Fungsi cleanup: Hapus event listener saat komponen dilepas
    // Ini penting untuk mencegah memory leak
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Array dependensi kosong berarti efek ini hanya berjalan sekali (saat mount & unmount)

  // Kembalikan objek yang berisi lebar jendela
  return windowSize;
}
