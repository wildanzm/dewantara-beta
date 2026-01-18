// src/pages/KamusPage.js
import React, { useState } from "react";
import {
  alphabetData,
  numberData,
  vocabularyData,
} from "../data/dictionaryData";
import "./KamusPage.css";

// Komponen Item Kamus (Grid)
const KamusItem = ({ item, onClick }) => {
  const handleClick = (e) => {
    // 1. Mencegah event bubbling (klik tembus)
    e.preventDefault();
    e.stopPropagation();

    // 2. Memberi jeda 10ms agar UI stabil sebelum modal muncul
    // Ini solusi ampuh untuk masalah pop-up yang langsung hilang
    setTimeout(() => {
      onClick(item);
    }, 10);
  };

  return (
    <div className="kamus-item" onClick={handleClick}>
      <div className="item-media">
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.char || item.term}
            loading="lazy"
          />
        )}
        {item.videoUrl && (
          <video
            key={item.videoUrl}
            loop
            muted
            playsInline
            controls={false} /* Controls dimatikan di grid agar klik kena ke kartu */
            preload="metadata"
          >
            <source src={item.videoUrl} type="video/mp4" />
          </video>
        )}
      </div>
      <p className="item-label">{item.char || item.term}</p>
    </div>
  );
};

function KamusPage() {
  const [activeTab, setActiveTab] = useState("abjad");
  const [selectedItem, setSelectedItem] = useState(null);

  const closeModal = () => {
    setSelectedItem(null);
  };

  const renderContent = () => {
    const renderItem = (item) => (
      <KamusItem key={item.id} item={item} onClick={setSelectedItem} />
    );

    switch (activeTab) {
      case "angka":
        return numberData.map(renderItem);
      case "kosakata":
        return vocabularyData.map(renderItem);
      case "abjad":
      default:
        return alphabetData.map(renderItem);
    }
  };

  return (
    <div className="kamus-page">
      <div className="kamus-header">
        <h1>Kamus BISINDO</h1>
        <p>
          Referensi visual untuk abjad, angka, dan kosakata sehari-hari dalam
          Bahasa Isyarat Indonesia.
        </p>
      </div>

      <div className="kamus-tabs">
        <button
          className={`kamus-tab-button ${
            activeTab === "abjad" ? "active" : ""
          }`}
          onClick={() => setActiveTab("abjad")}
        >
          Abjad
        </button>
        <button
          className={`kamus-tab-button ${
            activeTab === "angka" ? "active" : ""
          }`}
          onClick={() => setActiveTab("angka")}
        >
          Angka
        </button>
        <button
          className={`kamus-tab-button ${
            activeTab === "kosakata" ? "active" : ""
          }`}
          onClick={() => setActiveTab("kosakata")}
        >
          Kosakata
        </button>
      </div>

      <div className="kamus-grid">{renderContent()}</div>

      {/* Bagian MODAL / POP-UP */}
      {selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>
              &times;
            </button>

            <div className="modal-body">
              {/* Gambar Besar */}
              {selectedItem.imageUrl && (
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.char || selectedItem.term}
                  className="modal-image"
                />
              )}

              {/* Video Besar (Auto Play dengan Controls) */}
              {selectedItem.videoUrl && (
                <video controls autoPlay className="modal-video">
                  <source src={selectedItem.videoUrl} type="video/mp4" />
                </video>
              )}

              <div className="modal-text">
                <h2>{selectedItem.char || selectedItem.term}</h2>
                <p>
                  {selectedItem.description
                    ? selectedItem.description
                    : "Peragakan isyarat tangan sesuai dengan visual di atas."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KamusPage;