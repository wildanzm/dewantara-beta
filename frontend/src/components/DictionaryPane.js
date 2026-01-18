// src/components/DictionaryPane.js
import React, { useState } from "react";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const DictionaryItem = ({ char }) => (
  <div className="dictionary-item">
    <img src={`/images/${char}.jpg`} alt={`Isyarat ${char}`} />
    <p>{char}</p>
  </div>
);

function DictionaryPane() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAlphabet = ALPHABET.filter((char) =>
    char.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dictionary-pane-full">
      <div className="dictionary-header">
        <h3>Kamus Alfabet BISINDO</h3>
        <div className="search-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Cari huruf..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="dictionary-grid">
        {filteredAlphabet.length > 0 ? (
          filteredAlphabet.map((char) => (
            <DictionaryItem key={char} char={char} />
          ))
        ) : (
          <p className="no-results">Tidak ada hasil untuk "{searchTerm}"</p>
        )}
      </div>
    </div>
  );
}

export default DictionaryPane;
