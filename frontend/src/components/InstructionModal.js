// src/components/InstructionModal.js
import React from "react";
import "./InstructionModal.css"; // Kita akan buat file CSS ini

// Komponen menerima fungsi 'onClose' sebagai prop
function InstructionModal({ onClose }) {
  return (
    // Lapisan luar gelap yang menutupi layar
    <div className="modal-overlay" onClick={onClose}>
      {" "}
      {/* Klik overlay juga menutup modal */}
      {/* Konten modal di tengah */}
      {/* Hentikan event klik agar tidak 'bubble up' ke overlay */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Tombol tutup ('X') di pojok kanan atas */}
        <button
          className="modal-close-button"
          onClick={onClose}
          aria-label="Tutup Instruksi"
        >
          &times;
        </button>

        {/* Isi Instruksi */}
        <h2>Selamat Datang di Ruang Belajar!</h2>
        <p>Ikuti langkah mudah ini:</p>
        <ol>
          <li>
            Tekan tombol <strong>"Mulai Kamera"</strong>.
          </li>
          <li>
            Pilih mode <strong>"Deteksi Bebas"</strong> atau{" "}
            <strong>"Mode Ujian"</strong>.
          </li>
          <li>Peragakan isyarat di depan kamera.</li>
          <li>Lihat hasilnya langsung di area di bawah video!</li>{" "}
          {/* Sesuaikan teks jika perlu */}
        </ol>

        {/* Tombol konfirmasi di bawah */}
        <button className="modal-confirm-button" onClick={onClose}>
          Mengerti
        </button>
      </div>
    </div>
  );
}

export default InstructionModal;
