// src/pages/BelajarPage.js
import React, { useState, useRef, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import useWindowSize from "../hooks/useWindowSize";
import "./BelajarPage.css";
import VideoDisplay from "../components/VIdeoDisplay";
import Controls from "../components/Controls";
import Tabs from "../components/Tabs";
import FreeDetectPane from "../components/FreeDetectPane";
import ExamPane from "../components/ExamPane";
import DictionaryPane from "../components/DictionaryPane";
import InstructionModal from "../components/InstructionModal";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function BelajarPage() {
	const [isCameraOn, setIsCameraOn] = useState(false); //state untuk status kamera
	const [prediction, setPrediction] = useState("-"); //hasil prediksi dari backend
	const [activePane, setActivePane] = useState("free-detect");
	const [currentInstructionChar, setCurrentInstructionChar] = useState("?");
	const [feedback, setFeedback] = useState({
		message: "Menunggu jawaban...",
		className: "feedback-text",
	});
	const [showInstructions, setShowInstructions] = useState(false); // State untuk modal

	const videoRef = useRef(null);
	const socketRef = useRef(null);
	const streamRef = useRef(null);
	const intervalRef = useRef(null);
	const nextQuestionTimerRef = useRef(null);
	const latestState = useRef({});
	latestState.current = { activePane, currentInstructionChar, feedback }; // Simpan state terbaru di ref

	const { width } = useWindowSize();
	const isMobile = width <= 768;

	// --- Fungsi-fungsi ---
	const startCamera = async () => {
		// Show loading popup
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
				video: true,
				audio: false,
			});
			streamRef.current = stream;
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
			}
			setIsCameraOn(true);
			// Panggil generateNewQuestion hanya jika memang di mode ujian
			if (latestState.current.activePane === "exam") {
				generateNewQuestion();
			}
			socketRef.current = new WebSocket(
				// "wss://bisindo-react-v2-production.up.railway.app/ws"
				"ws://localhost:8000/ws"
			);
			socketRef.current.onopen = () => {
				console.log("WebSocket terhubung.");
				// Close loading and show success
				Swal.fire({
					icon: "success",
					title: "Kamera Aktif!",
					text: "AI Model siap mendeteksi",
					timer: 1500,
					showConfirmButton: false,
				});
				if (!intervalRef.current) {
					intervalRef.current = setInterval(sendFrame, 400);
				}
			};
			socketRef.current.onmessage = (event) => {
				const receivedPrediction = event.data;
				// Gunakan state terbaru dari ref di dalam callback
				const { activePane: currentPane, currentInstructionChar: instruction, feedback: currentFeedback } = latestState.current;
				if (currentPane === "exam") {
					checkAnswer(receivedPrediction, instruction, currentFeedback);
				} else {
					setPrediction(receivedPrediction); // Update state prediksi
				}
			};
			socketRef.current.onclose = () => {
				console.log("WebSocket terputus.");
				// Hentikan interval saat koneksi ditutup
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
					text: "Tidak dapat terhubung ke server. Pastikan server backend berjalan.",
					confirmButtonColor: "#B6252A",
				});
				stopCamera(); // Hentikan kamera jika ada error koneksi
			};
		} catch (err) {
			console.error("Error mengakses kamera:", err);
			Swal.fire({
				icon: "error",
				title: "Kamera Tidak Tersedia",
				text: "Tidak dapat mengakses kamera. Pastikan Anda memberikan izin akses kamera.",
				confirmButtonColor: "#B6252A",
			});
		}
	};

	const stopCamera = useCallback(() => {
		// Bungkusssss pake useCallback
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop());
			streamRef.current = null;
		}
		if (videoRef.current) {
			videoRef.current.srcObject = null;
		}
		setIsCameraOn(false);
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		if (socketRef.current) {
			socketRef.current.close();
			socketRef.current = null;
		}
		if (nextQuestionTimerRef.current) {
			clearTimeout(nextQuestionTimerRef.current);
			nextQuestionTimerRef.current = null;
		}
		setPrediction("-");
		resetExamState();
	}, []); // Tambahkan dependency array kosongggg

	const sendFrame = () => {
		// jang mastikeun semua referensi valid sebelum mengirim frame
		if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN || !videoRef.current || videoRef.current.paused || videoRef.current.ended || videoRef.current.readyState < 3) {
			return;
		}
		const canvas = document.createElement("canvas");
		canvas.width = videoRef.current.videoWidth;
		canvas.height = videoRef.current.videoHeight;
		const context = canvas.getContext("2d");
		context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
		canvas.toBlob(
			(blob) => {
				// Periksa deui koneksi sebelum mengirim
				if (blob && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
					socketRef.current.send(blob);
				}
			},
			"image/jpeg",
			0.5
		);
	};

	const generateNewQuestion = () => {
		if (nextQuestionTimerRef.current) clearTimeout(nextQuestionTimerRef.current);
		const randomIndex = Math.floor(Math.random() * ALPHABET.length);
		const newChar = ALPHABET[randomIndex];
		setCurrentInstructionChar(newChar);
		setFeedback({ message: "Menunggu jawaban...", className: "feedback-text" });
	};

	const checkAnswer = (predictedChar, currentInstruction, currentFeedback) => {
		// Gunakan state langsung jika memungkinkan, fallback ke ref jika perlu
		const instruction = currentInstruction || latestState.current.currentInstructionChar;
		const feedbackState = currentFeedback || latestState.current.feedback;

		if (feedbackState.className === "feedback-text correct") return;
		if (!instruction || instruction === "?") return;
		if (predictedChar === "Tidak Terdeteksi") return;

		if (predictedChar.toUpperCase() === instruction.toUpperCase()) {
			setFeedback({ message: "Benar!", className: "feedback-text correct" });
			nextQuestionTimerRef.current = setTimeout(() => {
				generateNewQuestion();
			}, 1500);
		} else {
			setFeedback({
				message: "Salah, coba lagi.",
				className: "feedback-text incorrect",
			});
		}
	};

	const resetExamState = () => {
		setCurrentInstructionChar("?");
		setFeedback({ message: "Menunggu jawaban...", className: "feedback-text" });
	};

	const handleTabSwitch = (pane) => {
		// Hanya stop kamera di desktop saat pindah ke kamus
		if (pane === "dictionary" && isCameraOn && !isMobile) {
			stopCamera();
		}
		setActivePane(pane);
		// Jika beralih ke mode ujian saat kamera sudah nyala
		if (pane === "exam" && isCameraOn) {
			generateNewQuestion();
		} else if (activePane === "exam" && pane !== "exam") {
			// Reset jika beralih DARI mode ujian
			resetExamState();
		}
	};

	//  Hooks
	useEffect(() => {
		// Cleanup effect utama saat komponen dilepas
		return () => {
			stopCamera(); // Pastikan kamera dan koneksi berhenti saat pindah halaman
		};
	}, [stopCamera]); // Hanya dijalankan sekali saat mount dan unmount

	// Hook untuk menampilkan instruksi di mobile saat pertama kali buka
	useEffect(() => {
		if (isMobile) {
			setShowInstructions(true);
			// Hapus penyimpanan ke sessionStorage
			// sessionStorage.setItem('hasSeenLearnInstructions', 'true');
		} else {
			// Opsional: Pastikan modal tidak muncul jika beralih dari mobile ke desktop
			setShowInstructions(false);
		}
	}, [isMobile]);

	// Fungsi untuk menutup modal
	const handleCloseInstructions = () => {
		setShowInstructions(false);
	};

	// --- Render ---

	// Tampilan khusus MOBILE
	if (isMobile) {
		return (
			<div className={`belajar-mobile-wrapper ${activePane === "dictionary" ? "dictionary-mode" : ""}`}>
				{showInstructions && <InstructionModal onClose={handleCloseInstructions} />}

				{activePane !== "dictionary" ? (
					<>
						{/* 1. Kontainer untuk Tabs (paling atas) */}
						<div className="mobile-tabs-container">
							<Tabs activePane={activePane} onTabSwitch={handleTabSwitch} />
						</div>

						{/* 2. Kontainer untuk Tombol Kamera */}
						<div className="mobile-controls-container">
							<Controls onStart={startCamera} onStop={stopCamera} isCameraOn={isCameraOn} />
						</div>

						{/* 3. Area Tampilan Utama (Video + Hasil) */}
						<div className="mobile-display-unit">
							<div className="video-panel-mobile">
								<VideoDisplay ref={videoRef} />
							</div>
							<div className="info-pane-mobile">
								{activePane === "free-detect" && <FreeDetectPane prediction={prediction} />}
								{activePane === "exam" && <ExamPane instructionChar={currentInstructionChar} feedback={feedback} onNextQuestion={generateNewQuestion} isCameraOn={isCameraOn} />}
							</div>
						</div>
					</>
				) : (
					// Tampilan Kamus
					<div className="dictionary-pane-mobile">
						<Tabs activePane={activePane} onTabSwitch={handleTabSwitch} />
						<DictionaryPane />
					</div>
				)}
			</div>
		);
	}

	// Tampilan khusus DESKTOP (Struktur Asli)
	return (
		<div className={`belajar-workspace ${activePane === "dictionary" ? "dictionary-mode" : ""}`}>
			<div className="video-panel">
				<VideoDisplay ref={videoRef} />
			</div>
			<div className="control-panel">
				<div className="control-panel-header">
					<h2>Ruang Belajar Abjad Interaktif</h2>
					<p>Nyalakan kamera dan pilih mode untuk memulai sesi belajar Anda.</p>
				</div>
				<Controls onStart={startCamera} onStop={stopCamera} isCameraOn={isCameraOn} />
				<Tabs activePane={activePane} onTabSwitch={handleTabSwitch} />
				{/* Konten kamus di desktop */}
				{activePane === "dictionary" && (
					<div className="dictionary-pane-desktop-wrapper">
						<DictionaryPane />
					</div>
				)}
			</div>
			{/* Panel Hasil hanya ditampilkan jika bukan mode kamus */}
			{activePane !== "dictionary" && (
				<div className="info-pane">
					{activePane === "free-detect" && <FreeDetectPane prediction={prediction} />}
					{activePane === "exam" && <ExamPane instructionChar={currentInstructionChar} feedback={feedback} onNextQuestion={generateNewQuestion} isCameraOn={isCameraOn} />}
				</div>
			)}
		</div>
	);
}

export default BelajarPage;
