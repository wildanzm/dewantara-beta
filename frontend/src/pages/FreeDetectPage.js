// src/pages/FreeDetectPage.js
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import VideoDisplay from "../components/VideoDisplay";
import config from "../config";
import "./LevelPlayPage.css"; // Reuse existing styles

/**
 * FreeDetectPage - Free Detection Mode for Practice
 * Optimized for bandwidth with resizing and compression
 */
function FreeDetectPage() {
	const navigate = useNavigate();

	// Camera & WebSocket refs
	const videoRef = useRef(null);
	const socketRef = useRef(null);
	const streamRef = useRef(null);
	const intervalRef = useRef(null);
	const reconnectTimeoutRef = useRef(null);

	// State
	const [facingMode, setFacingMode] = useState("user");
	const [prediction, setPrediction] = useState("-");
	const [confidence, setConfidence] = useState(0);
	const [isConnecting, setIsConnecting] = useState(false);

	// Start camera on mount
	useEffect(() => {
		startCamera();

		return () => {
			cleanup();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	/**
	 * Complete cleanup - stop all resources
	 */
	const cleanup = () => {
		// Clear interval
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}

		// Clear reconnect timeout
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current);
			reconnectTimeoutRef.current = null;
		}

		// Close WebSocket
		if (socketRef.current) {
			socketRef.current.onclose = null; // Prevent auto-reconnect
			socketRef.current.close();
			socketRef.current = null;
		}

		// Stop media tracks
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop());
			streamRef.current = null;
		}
	};

	/**
	 * Start camera and establish WebSocket connection
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

			// Connect WebSocket with auto-reconnect
			connectWebSocket();

			Swal.fire({
				icon: "success",
				title: "Kamera Aktif!",
				text: "Mulai praktik BISINDO sesukamu",
				timer: 1500,
				showConfirmButton: false,
			});
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
	 * Establish WebSocket connection with auto-reconnect
	 */
	const connectWebSocket = () => {
		if (isConnecting || socketRef.current?.readyState === WebSocket.OPEN) {
			return;
		}

		setIsConnecting(true);

		try {
			const socket = new WebSocket(config.WS_URL);
			socketRef.current = socket;

			socket.onopen = () => {
				console.log("WebSocket connected");
				setIsConnecting(false);

				// Start sending frames
				if (!intervalRef.current) {
					intervalRef.current = setInterval(sendFrame, 400); // ~2.5 FPS for bandwidth efficiency
				}
			};

			socket.onmessage = (event) => {
				try {
					// Try parsing as JSON first (for welcome packet)
					const data = JSON.parse(event.data);
					if (data.status === "connected") {
						console.log("WebSocket handshake complete:", data.message);
						return;
					}
					setPrediction(data.prediction || "-");
					setConfidence(data.confidence || 0);
				} catch (error) {
					// Plain text response (prediction result)
					setPrediction(event.data);
					setConfidence(0.9); // Assume high confidence
				}
			};

			socket.onclose = () => {
				console.log("WebSocket closed. Attempting reconnect...");
				setIsConnecting(false);

				// Clear sending interval
				if (intervalRef.current) {
					clearInterval(intervalRef.current);
					intervalRef.current = null;
				}

				// Auto-reconnect after 3 seconds
				reconnectTimeoutRef.current = setTimeout(() => {
					connectWebSocket();
				}, 3000);
			};

			socket.onerror = (error) => {
				console.error("WebSocket error:", error);
				setIsConnecting(false);
			};
		} catch (error) {
			console.error("WebSocket creation error:", error);
			setIsConnecting(false);

			// Retry after 3 seconds
			reconnectTimeoutRef.current = setTimeout(() => {
				connectWebSocket();
			}, 3000);
		}
	};

	/**
	 * Send optimized video frame to backend
	 * Bandwidth Optimization: Resize to 480px width + JPEG compression
	 */
	const sendFrame = () => {
		if (videoRef.current && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
			const video = videoRef.current;
			const canvas = document.createElement("canvas");

			// Resize Strategy: Width=480px, maintain aspect ratio
			const targetWidth = 480;
			const aspectRatio = video.videoHeight / video.videoWidth;
			canvas.width = targetWidth;
			canvas.height = Math.floor(targetWidth * aspectRatio);

			const ctx = canvas.getContext("2d");
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

			// Compression: JPEG at 0.7 quality for bandwidth efficiency
			canvas.toBlob(
				(blob) => {
					if (blob && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
						socketRef.current.send(blob);
					}
				},
				"image/jpeg",
				0.7, // 70% quality - sweet spot for performance vs accuracy
			);
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
	 * Handle back button
	 */
	const handleBack = () => {
		Swal.fire({
			title: "Keluar dari Mode Praktek?",
			text: "Progress tidak akan disimpan",
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Ya, Keluar",
			cancelButtonText: "Batal",
			confirmButtonColor: "#e63946",
		}).then((result) => {
			if (result.isConfirmed) {
				cleanup();
				navigate("/belajar");
			}
		});
	};

	return (
		<div className="level-play-page">
			{/* Header */}
			<div className="play-header">
				<button className="back-button" onClick={handleBack}>
					← Kembali
				</button>
				<div className="level-info">
					<h1 className="level-title">Mode Praktek Bebas</h1>
					<p className="level-subtitle">Latihan BISINDO tanpa batasan</p>
				</div>
			</div>

			{/* Main Content */}
			<div className="play-content">
				{/* Video Display with Prediction Footer */}
				<VideoDisplay ref={videoRef} currentPrediction={prediction} confidence={confidence} showGuide={true} onToggleCamera={toggleCamera} facingMode={facingMode} className="free-detect-video" />

				{/* Connection Status */}
				{isConnecting && (
					<div className="connection-status">
						<span className="status-dot pulsing"></span>
						Menghubungkan ke server AI...
					</div>
				)}
			</div>
		</div>
	);
}

export default FreeDetectPage;
