// src/pages/TentangBisindoPage.js
import React from "react";
import { Link } from "react-router-dom";
import "./ArticleDetailPage.css"; // Kita bisa gunakan style yang sama dengan detail artikel

function TentangBisindoPage() {
  return (
    <div className="article-detail-page">
      {/* Kita gunakan style yang mirip dengan detail artikel untuk konsistensi */}
      <div
        className="article-content-wrapper"
        style={{ maxWidth: "800px", paddingTop: "6rem" }}
      >
        <div className="article-body">
          <h2>Mengenal Bahasa Isyarat Indonesia (BISINDO)</h2>
          <p>
            Bahasa Isyarat Indonesia (BISINDO) adalah bahasa visual yang
            digunakan oleh teman-teman Tuli di Indonesia untuk berkomunikasi.
            Berbeda dengan bahasa lisan yang mengandalkan suara, BISINDO
            menggunakan gerakan tangan, ekspresi wajah, dan posisi tubuh sebagai
            media utama penyampaian makna. Melalui kombinasi gerakan tersebut,
            pengguna BISINDO dapat mengekspresikan kata, kalimat, dan emosi
            dengan cara yang unik dan penuh makna.
          </p>

          {/* --- Anda bisa menambahkan tulisan lebih detail di sini --- */}
          <h2>Asal usul dan perkembangan BISINDO</h2>
          <p>
            Bahasa isyarat di Indonesia telah berkembang sejak lama melalui
            interaksi komunitas Tuli di berbagai daerah. Seiring waktu, variasi
            bahasa isyarat lokal mulai disatukan dan dikenal secara luas sebagai
            BISINDO. Bahasa ini terus berkembang secara alami, mengikuti
            kebutuhan komunikasi masyarakat Tuli di Indonesia. Meskipun
            Indonesia pernah mengenal SIBI (Sistem Isyarat Bahasa Indonesia) —
            sistem yang meniru struktur Bahasa Indonesia — BISINDO berbeda
            karena lebih alami dan kontekstual, mengikuti tata bahasa visual
            yang berkembang dalam komunitas Tuli sendiri. Karena itulah BISINDO
            diakui dan digunakan secara luas dalam kehidupan sehari-hari oleh
            komunitas Tuli di berbagai kota di Indonesia.
          </p>
          <h2>Ciri Khas BISINDO</h2>
          <p>Beberapa hal yang menjadi ciri khas BISINDO antara lain:</p>
          <ul>
            <li>
              Visual dan Gestural: Makna disampaikan melalui gerakan tangan dan
              ekspresi wajah.
            </li>
            <li>
              Tidak mengikuti struktur Bahasa Indonesia baku: Urutan kalimat
              disusun secara visual, bukan tata bahasa tertulis.
            </li>
            <li>
              Kontekstual dan ekspresif: Satu gerakan bisa memiliki makna
              berbeda tergantung konteks dan ekspresi wajah.
            </li>
            <li>
              Beragam dialek: Setiap daerah bisa memiliki variasi gerakan untuk
              kata atau huruf yang sama.
            </li>
          </ul>

          <h2>Peran Penting BISINDO dalam Komunikasi</h2>
          <p>
            Belajar BISINDO bukan hanya tentang mengenal gerakan tangan, tetapi
            juga memahami cara baru dalam berkomunikasi — cara yang
            mengedepankan visual, empati, dan inklusivitas. Melalui situs ini,
            kamu bisa mulai mempelajari abjad, angka, dan kosakata dasar
            BISINDO, bahkan mencoba fitur deteksi gerakan interaktif untuk
            berlatih secara langsung.
          </p>
        </div>
        <Link to="/" className="back-link">
          &larr; Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

export default TentangBisindoPage;
