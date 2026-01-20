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

/**
 * LevelPlayPage - The main gameplay screen
 * Guides user through each letter in a level with camera detection
 */
function LevelPlayPage() {
	const { levelId } = useParams();
	const navigate = useNavigate();
	const { completeLevel, incrementAttempts } = useGame();

	// Level data
	const level = getLevelById(levelId);

	// Camera & WebSocket
	const videoRef = useRef(null);
	const socketRef = useRef(null);
	const streamRef = useRef(null);
	const intervalRef = useRef(null);

	// Game state
	const [isCameraOn, setIsCameraOn] = useState(false);
	const [facingMode, setFacingMode] = useState("user"); // "user" for front, "environment" for back
	const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
	const [prediction, setPrediction] = useState("-");
	const [confidence, setConfidence] = useState(0);
	const [showFeedback, setShowFeedback] = useState(false);
	const [showLevelComplete, setShowLevelComplete] = useState(false);
	const [levelStats, setLevelStats] = useState({ stars: 0, xp: 0, time: 0 });
	const [showLetterSuccess, setShowLetterSuccess] = useState(false);
	const [completedLetter, setCompletedLetter] = useState("");
	const [levelStartTime, setLevelStartTime] = useState(null);
	const [letterStartTime, setLetterStartTime] = useState(null);
	const [letterCompletionTimes, setLetterCompletionTimes] = useState([]);
	const [mistakes, setMistakes] = useState(0);

	// Redirect if level not found
	useEffect(() => {
		if (!level) {
			Swal.fire({
				icon: "error",
				title: "Level tidak ditemukan",
				text: "Level yang kamu cari tidak ada.",
				confirmButtonText: "Kembali ke Peta",
			}).then(() => {
				navigate("/belajar");
			});
		}
	}, [level, navigate]);

	// Start camera on mount
	useEffect(() => {
		if (level) {
			startCamera();
			incrementAttempts(levelId);
		}

		return () => {
			stopCamera();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [levelId]);

	/**
	 * Start camera and WebSocket connection
	 */
	const startCamera = async () => {
		Swal.fire({
			title: "Memulai Kamera...",
			html: "Sedang menginisialisasi AI Model dan Kamera",
			allowOutsideClick: false,
			allowEscapeKey: false,
			didOpen: () => {
				Swal.showLoading();
			},
		});

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: facingMode },
				audio: false,
			});

			streamRef.current = stream;
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
			}

			setIsCameraOn(true);

			// Connect WebSocket
			socketRef.current = new WebSocket(config.WS_URL);

			socketRef.current.onopen = () => {
				Swal.fire({
					icon: "success",
					title: "Kamera Aktif!",
					text: "Mulai tunjukkan huruf BISINDO",
					timer: 1500,
					showConfirmButton: false,
				}).then(() => {
					// Start level timer after modal closes
					setLevelStartTime(Date.now());
					setLetterStartTime(Date.now());
				});

				// Start sending frames
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
					setPrediction(event.data);
					setConfidence(0.9); // Assume high confidence for plain text
				}
			};

			socketRef.current.onclose = () => {
				if (intervalRef.current) {
					clearInterval(intervalRef.current);
					intervalRef.current = null;
				}
			};

			socketRef.current.onerror = (error) => {
				console.error("WebSocket error:", error);
				Swal.fire({
					icon: "error",
					title: "Koneksi Gagal",
					text: "Tidak dapat terhubung ke server AI. Pastikan backend berjalan.",
					confirmButtonText: "Kembali",
				}).then(() => {
					navigate("/belajar");
				});
			};
		} catch (error) {
			console.error("Camera error:", error);
			Swal.fire({
				icon: "error",
				title: "Kamera Gagal",
				text: "Tidak dapat mengakses kamera. Pastikan izin diberikan.",
				confirmButtonText: "Kembali",
			}).then(() => {
				navigate("/belajar");
			});
		}
	};

	/**
	 * Toggle between front and back camera
	 */
	const toggleCamera = async () => {
		const newFacingMode = facingMode === "user" ? "environment" : "user";
		setFacingMode(newFacingMode);

		// Stop current stream
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop());
		}

		// Start new stream with new facing mode
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: newFacingMode },
				audio: false,
			});

			streamRef.current = stream;
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
			}
		} catch (error) {
			console.error("Camera switch error:", error);
			Swal.fire({
				icon: "error",
				title: "Gagal Mengganti Kamera",
				text: "Tidak dapat mengganti kamera. Pastikan perangkat Anda memiliki kamera depan dan belakang.",
				timer: 2000,
				showConfirmButton: false,
			});
			// Revert to previous facing mode
			setFacingMode(facingMode);
		}
	};

	/**
	 * Stop camera and cleanup
	 */
	const stopCamera = () => {
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop());
		}
		if (socketRef.current) {
			socketRef.current.close();
		}
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}
	};

	/**
	 * Send video frame to backend
	 */
	const sendFrame = () => {
		if (videoRef.current && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
			const canvas = document.createElement("canvas");
			canvas.width = videoRef.current.videoWidth;
			canvas.height = videoRef.current.videoHeight;
			const ctx = canvas.getContext("2d");

			ctx.scale(-1, 1);
			ctx.drawImage(videoRef.current, -canvas.width, 0, canvas.width, canvas.height);

			canvas.toBlob(
				(blob) => {
					if (blob && socketRef.current.readyState === WebSocket.OPEN) {
						socketRef.current.send(blob);
					}
				},
				"image/jpeg",
				0.8,
			);
		}
	};

	/**
	 * Handle level completion
	 */
	const handleLevelComplete = useCallback(() => {
		const completionTime = levelStartTime ? Math.floor((Date.now() - levelStartTime) / 1000) : 0;
		const avgLetterTime = letterCompletionTimes.length > 0 ? letterCompletionTimes.reduce((a, b) => a + b, 0) / letterCompletionTimes.length : 0;

		// Calculate stars (no mistakes penalty, only time-based)
		const stars = calculateStars(completionTime, 0, avgLetterTime, level.letters.length);
		const xpReward = stars * 50; // 50 XP per star

		// Stop camera
		stopCamera();

		// Save stats for overlay
		setLevelStats({ stars, xp: xpReward, time: completionTime });

		// Update game context
		completeLevel(levelId, stars, completionTime);

		// Show level complete overlay
		setShowLevelComplete(true);
	}, [levelStartTime, letterCompletionTimes, level.letters.length, completeLevel, levelId, stopCamera]);

	/**
	 * Handle successful letter completion
	 */
	const handleLetterSuccess = useCallback(
		(letter) => {
			// Track letter completion time
			if (letterStartTime) {
				const letterTime = (Date.now() - letterStartTime) / 1000;
				setLetterCompletionTimes((prev) => [...prev, letterTime]);
			}

			// Show success modal
			setCompletedLetter(letter);
			setShowLetterSuccess(true);

			// Auto-advance after brief delay
			setTimeout(() => {
				setShowLetterSuccess(false);
				if (currentLetterIndex < level.letters.length - 1) {
					// Move to next letter
					setCurrentLetterIndex((prev) => prev + 1);
					setLetterStartTime(Date.now()); // Reset timer for next letter
				} else {
					// Level complete!
					handleLevelComplete();
				}
			}, 1200);
		},
		[currentLetterIndex, level, letterStartTime, handleLevelComplete],
	);

	/**
	 * Navigate back to map
	 */
	const handleBackToMap = () => {
		stopCamera();
		navigate("/belajar");
	};

	/**
	 * Close level complete modal and return to map
	 */
	const handleCloseLevelComplete = () => {
		setShowLevelComplete(false);
		navigate("/belajar");
	};

	if (!level) return null;

	const currentLetter = level.letters[currentLetterIndex];
	const progressPercentage = ((currentLetterIndex + 1) / level.letters.length) * 100;

	return (
		<div className="level-play-page">
			{/* Header */}
			<div className="play-header">
				<button className="back-button" onClick={handleBackToMap}>
					← Kembali ke Peta
				</button>
				<div className="level-info">
					<h2 className="level-title">
						{level.icon} {level.title}
					</h2>
					<p className="level-subtitle">{level.subtitle}</p>
				</div>
			</div>

			{/* Main Content */}
			<div className="play-content">
				{/* Progress Section */}
				<div className="progress-section">
					<div className="progress-header">
						<span className="progress-text">
							Huruf {currentLetterIndex + 1} dari {level.letters.length}
						</span>
						<span className="progress-percentage">{Math.round(progressPercentage)}%</span>
					</div>
					<div className="progress-bar">
						<div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
					</div>

					{/* Completed Letters Trail */}
					<div className="letters-trail">
						{level.letters.map((letter, index) => (
							<div key={letter} className={`letter-bubble ${index < currentLetterIndex ? "completed" : index === currentLetterIndex ? "current" : "locked"}`}>
								{index < currentLetterIndex ? "✓" : letter}
							</div>
						))}
					</div>
				</div>

				{/* Target Letter Card */}
				<div className="target-card">
					<span className="target-label">Tunjukkan Huruf:</span>
					<span className="target-letter-display">{currentLetter}</span>
					<p className="target-hint">{level.tips && level.tips[0] ? level.tips[0] : "Tahan posisi selama 2 detik"}</p>
				</div>

				{/* Video Display */}
				{isCameraOn && (
					<VideoDisplay ref={videoRef} targetLetter={currentLetter} currentPrediction={prediction} confidence={confidence} onSuccess={handleLetterSuccess} showGuide={true} onToggleCamera={toggleCamera} facingMode={facingMode} />
				)}
			</div>
			{/* Letter Success Modal */}
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
			{/* Level Complete Overlay */}
			{showLevelComplete && <FeedbackOverlay isVisible={showLevelComplete} stars={levelStats.stars} xpEarned={levelStats.xp} completionTime={levelStats.time} onClose={handleCloseLevelComplete} />}
		</div>
	);
}

export default LevelPlayPage;
