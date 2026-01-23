import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import { GameProvider } from "./context/GameContext";
import { CameraProvider, useCamera } from "./context/CameraContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BerandaPage from "./pages/BerandaPage";
import BelajarPage from "./pages/BelajarPage";
import LevelPlayPage from "./pages/LevelPlayPage";
import FreeDetectPage from "./pages/FreeDetectPage";
import TentangKamiPage from "./pages/TentangKamiPage";
import HubungiKamiPage from "./pages/HubungiKamiPage";
import KamusPage from "./pages/KamusPage";

function AppContent() {
	const { isCameraActive } = useCamera();

	return (
		<div className="app-wrapper">
			<Navbar isCameraActive={isCameraActive} />
			<main className="main-content">
				<Routes>
					<Route path="/" element={<BerandaPage />} />
					<Route path="/belajar" element={<BelajarPage />} />
					<Route path="/gerakan-bebas" element={<FreeDetectPage />} />
					<Route path="/play/:levelId" element={<LevelPlayPage />} />
					<Route path="/kamus" element={<KamusPage />} />
					<Route path="/tentang-kami" element={<TentangKamiPage />} />
					<Route path="/hubungi-kami" element={<HubungiKamiPage />} />
				</Routes>
			</main>
			<Footer />
		</div>
	);
}

function App() {
	return (
		<GameProvider>
			<CameraProvider>
				<AppContent />
			</CameraProvider>
		</GameProvider>
	);
}

export default App;
