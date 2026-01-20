import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import { GameProvider } from "./context/GameContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BerandaPage from "./pages/BerandaPage";
import BelajarPage from "./pages/BelajarPage";
import LevelPlayPage from "./pages/LevelPlayPage";
import ArtikelPage from "./pages/ArtikelPage";
import TentangKamiPage from "./pages/TentangKamiPage";
import HubungiKamiPage from "./pages/HubungiKamiPage";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import KamusPage from "./pages/KamusPage";
import TentangBisindoPage from "./pages/TentangBisindoPage";
import GamificationDemoPage from "./pages/GamificationDemoPage";

function App() {
	return (
		<GameProvider>
			<div className="app-wrapper">
				<Navbar />
				<main className="main-content">
					<Routes>
						<Route path="/" element={<BerandaPage />} />
						<Route path="/belajar" element={<BelajarPage />} />
						<Route path="/play/:levelId" element={<LevelPlayPage />} />
						<Route path="/kamus" element={<KamusPage />} />
						{/* <Route path="/artikel" element={<ArtikelPage />} />
						<Route path="/artikel/:slug" element={<ArticleDetailPage />} /> */}
						<Route path="/tentang-kami" element={<TentangKamiPage />} />
						{/* <Route path="/tentang-bisindo" element={<TentangBisindoPage />} /> */}
						<Route path="/hubungi-kami" element={<HubungiKamiPage />} />
						<Route path="/demo-gamification" element={<GamificationDemoPage />} />
					</Routes>
				</main>
				<Footer />
			</div>
		</GameProvider>
	);
}

export default App;
