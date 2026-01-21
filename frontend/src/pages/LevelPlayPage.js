// src/pages/LevelPlayPage.js
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useGame } from "../context/GameContext";
import { getLevelById, calculateStars } from "../data/levels";
import VideoDisplay from "../components/VideoDisplay";
import { FeedbackOverlay } from "../components/gamification";
import config from "../config";
import "./LevelPlayPage.css";

function LevelPlayPage() {
	const { levelId } = useParams();
	const navigate = useNavigate();
	const { completeLevel, incrementAttempts } = useGame();

	const level = getLevelById(levelId);

	const videoRef = useRef(null);
	const socketRef = useRef(null);
	const streamRef = useRef(null);
	const intervalRef = useRef(null);

	const [isCameraOn, setIsCameraOn] = useState(false);
	const [facingMode, setFacingMode] = useState("user");
	const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
	const [prediction, setPrediction] = useState("-");
	const [confidence, setConfidence] = useState(0);
	const [showLevelComplete, setShowLevelComplete] = useState(false);
	const [levelStats, setLevelStats] = useState({ stars: 0, xp: 0, time: 0 });
	const [showLetterSuccess, setShowLetterSuccess] = useState(false);
	const [completedLetter, setCompletedLetter] = useState("");
	const [levelStartTime, setLevelStartTime] = useState(null);
	const [letterStartTime, setLetterStartTime] = useState(null);
	const [letterCompletionTimes, setLetterCompletionTimes] = useState([]);

	useEffect(() => {
		if (!level) {
			Swal.fire({ icon: "error", title: "Level tidak ditemukan" }).then(() => navigate("/belajar"));
		}
	}, [level, navigate]);

	useEffect(() => {
		if (level) {
			startCamera();
			incrementAttempts(levelId);
		}
		return () => stopCamera();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [levelId]);

	const startCamera = async () => {
		// Tampilkan Loading
		Swal.fire({
			title: "Menghubungkan...",
			text: "Sedang menyalakan kamera & AI",
			allowOutsideClick: false,
			didOpen: () => Swal.showLoading(),
		});

		try {
			console.log("📷 Meminta akses kamera...");
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: facingMode },
				audio: false,
			});

			console.log("📷 Kamera didapat!");
			streamRef.current = stream;

			// Nyalakan Video di State React
			setIsCameraOn(true);

			// Pasang stream ke Video Element (jika ref sudah ada)
			// Kita beri sedikit delay agar komponen VideoDisplay ter-render
			setTimeout(() => {
				if (videoRef.current) {
					videoRef.current.srcObject = stream;
				}
			}, 100);

			console.log("🔌 Menghubungkan WebSocket ke:", config.WS_URL);
			socketRef.current = new WebSocket(config.WS_URL);

			socketRef.current.onopen = () => {
				console.log("✅ WebSocket Terhubung!");

				// 1. TUTUP LOADING PAKSA (PENTING!)
				Swal.close();

				// 2. Tampilkan Notifikasi Kecil (Toast) agar tidak memblokir UI
				Swal.fire({
					icon: "success",
					title: "Siap Bermain!",
					toast: true,
					position: "top",
					showConfirmButton: false,
					timer: 2000,
				});

				// 3. Kirim PING agar tidak timeout 20s
				socketRef.current.send("PING");

				// Set Waktu Mulai
				setLevelStartTime(Date.now());
				setLetterStartTime(Date.now());

				// Mulai kirim gambar
				if (!intervalRef.current) {
					intervalRef.current = setInterval(sendFrame, 400);
				}
			};

			socketRef.current.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					setPrediction(data.prediction || "-");
					setConfidence(data.confidence || 0);
				} catch (error) {
					// Ignore ping responses
				}
			};

			socketRef.current.onclose = () => {
				console.log("❌ WebSocket Putus");
				if (intervalRef.current) clearInterval(intervalRef.current);
			};

			socketRef.current.onerror = (error) => {
				console.error("❌ WebSocket Error:", error);
				// Jangan tampilkan alert error dulu, biarkan retry atau user refresh
			};
		} catch (error) {
			console.error("🔥 Camera/Connection Error:", error);
			Swal.fire({
				icon: "error",
				title: "Gagal",
				text: "Izin kamera ditolak atau Server mati.",
				confirmButtonText: "Kembali",
			}).then(() => navigate("/belajar"));
		}
	};

	const toggleCamera = async () => {
		const newFacingMode = facingMode === "user" ? "environment" : "user";
		setFacingMode(newFacingMode);
		if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: newFacingMode },
				audio: false,
			});
			streamRef.current = stream;
			if (videoRef.current) videoRef.current.srcObject = stream;
		} catch (error) {
			console.error("Switch Cam Error:", error);
		}
	};

	const stopCamera = useCallback(() => {
		if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
		if (socketRef.current) socketRef.current.close();
		if (intervalRef.current) clearInterval(intervalRef.current);
	}, []);

	const sendFrame = () => {
		// Cek Socket Ready
		if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

		// Cek Video Ready
		if (!videoRef.current || videoRef.current.videoWidth === 0) {
			// Jika video belum siap, kirim PING saja biar gak timeout
			socketRef.current.send("PING");
			return;
		}

		const video = videoRef.current;
		const canvas = document.createElement("canvas");
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		const ctx = canvas.getContext("2d");

		// Mirroring & Draw
		ctx.translate(canvas.width, 0);
		ctx.scale(-1, 1);
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

		// Convert to Base64 & Send
		const base64Data = canvas.toDataURL("image/jpeg", 0.6);
		socketRef.current.send(base64Data);
	};

	const handleLevelComplete = useCallback(() => {
		const completionTime = levelStartTime ? Math.floor((Date.now() - levelStartTime) / 1000) : 0;
		const avgLetterTime = letterCompletionTimes.length > 0 ? letterCompletionTimes.reduce((a, b) => a + b, 0) / letterCompletionTimes.length : 0;
		const stars = calculateStars(completionTime, 0, avgLetterTime, level.letters.length);
		const xpReward = stars * 50;

		stopCamera();
		setLevelStats({ stars, xp: xpReward, time: completionTime });
		completeLevel(levelId, stars, completionTime);
		setShowLevelComplete(true);
	}, [levelStartTime, letterCompletionTimes, level.letters.length, completeLevel, levelId, stopCamera]);

	const handleLetterSuccess = useCallback(
		(letter) => {
			if (letterStartTime) {
				setLetterCompletionTimes((prev) => [...prev, (Date.now() - letterStartTime) / 1000]);
			}
			setCompletedLetter(letter);
			setShowLetterSuccess(true);
			setTimeout(() => {
				setShowLetterSuccess(false);
				if (currentLetterIndex < level.letters.length - 1) {
					setCurrentLetterIndex((prev) => prev + 1);
					setLetterStartTime(Date.now());
				} else {
					handleLevelComplete();
				}
			}, 1200);
		},
		[currentLetterIndex, level, letterStartTime, handleLevelComplete],
	);

	const handleBackToMap = () => {
		stopCamera();
		navigate("/belajar");
	};

	const handleCloseLevelComplete = () => {
		setShowLevelComplete(false);
		navigate("/belajar");
	};

	if (!level) return null;
	const currentLetter = level.letters[currentLetterIndex];
	const progressPercentage = ((currentLetterIndex + 1) / level.letters.length) * 100;

	return (
		<div className="level-play-page">
			<div className="play-header">
				<button className="back-button" onClick={handleBackToMap}>
					← Kembali
				</button>
				<div className="level-info">
					<h2 className="level-title">
						{level.icon} {level.title}
					</h2>
					<p className="level-subtitle">{level.subtitle}</p>
				</div>
			</div>

			<div className="play-content">
				<div className="progress-section">
					<div className="progress-header">
						<span className="progress-text">
							Huruf {currentLetterIndex + 1} / {level.letters.length}
						</span>
						<span className="progress-percentage">{Math.round(progressPercentage)}%</span>
					</div>
					<div className="progress-bar">
						<div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
					</div>
					<div className="letters-trail">
						{level.letters.map((letter, index) => (
							<div key={letter} className={`letter-bubble ${index < currentLetterIndex ? "completed" : index === currentLetterIndex ? "current" : "locked"}`}>
								{index < currentLetterIndex ? "✓" : letter}
							</div>
						))}
					</div>
				</div>

				<div className="target-card">
					<span className="target-label">Tunjukkan Huruf:</span>
					<span className="target-letter-display">{currentLetter}</span>
					<p className="target-hint">{level.tips && level.tips[0] ? level.tips[0] : "Tahan posisi 2 detik"}</p>
				</div>

				{isCameraOn && (
					<VideoDisplay ref={videoRef} targetLetter={currentLetter} currentPrediction={prediction} confidence={confidence} onSuccess={handleLetterSuccess} showGuide={true} onToggleCamera={toggleCamera} facingMode={facingMode} />
				)}
			</div>

			{showLetterSuccess && (
				<div className="letter-success-overlay">
					<div className="letter-success-card">
						<div className="success-icon">✅</div>
						<h2 className="success-title">Berhasil!</h2>
						<p className="success-message">
							Huruf <strong>{completedLetter}</strong> selesai!
						</p>
					</div>
				</div>
			)}
			{showLevelComplete && <FeedbackOverlay isVisible={showLevelComplete} stars={levelStats.stars} xpEarned={levelStats.xp} completionTime={levelStats.time} onClose={handleCloseLevelComplete} />}
		</div>
	);
}

export default LevelPlayPage;
