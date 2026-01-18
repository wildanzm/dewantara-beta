import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BerandaPage from "./pages/BerandaPage";
import BelajarPage from "./pages/BelajarPage";
import ArtikelPage from "./pages/ArtikelPage";
import TentangKamiPage from "./pages/TentangKamiPage";
import HubungiKamiPage from "./pages/HubungiKamiPage";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import KamusPage from "./pages/KamusPage";
import TentangBisindoPage from "./pages/TentangBisindoPage";

function App() {
  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<BerandaPage />} />
          <Route path="/belajar" element={<BelajarPage />} />
          <Route path="/kamus" element={<KamusPage />} />
          <Route path="/artikel" element={<ArtikelPage />} />
          <Route path="/artikel/:slug" element={<ArticleDetailPage />} />
          <Route path="/tentang-kami" element={<TentangKamiPage />} />
          <Route path="/tentang-bisindo" element={<TentangBisindoPage />} />
          <Route path="/hubungi-kami" element={<HubungiKamiPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
