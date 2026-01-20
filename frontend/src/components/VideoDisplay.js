// src/components/VideoDisplay.js
import React, { forwardRef, useState, useEffect, useRef } from "react";
import "./VideoDisplay.css";

/**
 * Modern VideoDisplay Component with Hold Detection Logic
 *
 * Features:
 * - Clean card UI with rounded corners
 * - SVG guide box overlay for hand placement
 * - Hold detection (2 seconds at confidence > 0.8)
 * - Visual progress ring showing hold progress
 * - Supports targetLetter matching
 */
const VideoDisplay = forwardRef(({ targetLetter = null, currentPrediction = "-", confidence = 0, onSuccess, showGuide = true, className = "", onToggleCamera, facingMode = "user" }, ref) => {
	const [holdProgress, setHoldProgress] = useState(0);
	const holdTimerRef = useRef(null);
	const successTriggeredRef = useRef(false);
	const HOLD_DURATION = 2000; // 2 seconds in milliseconds
	const CONFIDENCE_THRESHOLD = 0.8;

	/**
	 * Hold Detection Logic
	 * Triggers onSuccess when user holds correct sign for 2 seconds
	 */
	useEffect(() => {
		// Check if we should start/continue holding
		const isCorrectPrediction = targetLetter && currentPrediction === targetLetter && confidence > CONFIDENCE_THRESHOLD;

		if (isCorrectPrediction) {
			// Start or continue holding
			if (!holdTimerRef.current && !successTriggeredRef.current) {
				const startTime = Date.now();

				holdTimerRef.current = setInterval(() => {
					const elapsed = Date.now() - startTime;
					const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);

					setHoldProgress(progress);

					if (progress >= 100 && !successTriggeredRef.current) {
						// Success! Held for 2 seconds - trigger once
						successTriggeredRef.current = true;
						clearInterval(holdTimerRef.current);
						holdTimerRef.current = null;
						setHoldProgress(100);

						// Call onSuccess immediately when 100% reached
						if (onSuccess) {
							onSuccess(targetLetter);
						}
					}
				}, 50); // Update every 50ms for smooth animation
			}
		} else {
			// Wrong prediction or low confidence - reset
			if (holdTimerRef.current) {
				clearInterval(holdTimerRef.current);
				holdTimerRef.current = null;
			}
			setHoldProgress(0);
			successTriggeredRef.current = false;
		}

		// Cleanup on unmount
		return () => {
			if (holdTimerRef.current) {
				clearInterval(holdTimerRef.current);
				holdTimerRef.current = null;
			}
		};
	}, [currentPrediction, targetLetter, confidence, onSuccess]);

	return (
		<div className={`video-display-card ${className}`}>
			{/* Video Container */}
			<div className="video-wrapper">
				<video ref={ref} id="webcam" autoPlay playsInline muted style={{ transform: "scaleX(-1)" }} />

				{/* SVG Guide Box Overlay */}
				{showGuide && (
					<svg className="guide-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
						<rect x="20" y="15" width="60" height="70" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.5" strokeDasharray="4 2" rx="3" />
						<text x="50" y="12" textAnchor="middle" fill="rgba(255, 255, 255, 0.9)" fontSize="4" fontWeight="600">
							Posisikan tangan di sini
						</text>
					</svg>
				)}

				{/* Hold Progress Ring */}
				{targetLetter && holdProgress > 0 && (
					<div className="hold-progress-container">
						<svg className="progress-ring" width="120" height="120">
							<circle className="progress-ring-bg" cx="60" cy="60" r="54" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="6" />
							<circle
								className="progress-ring-fill"
								cx="60"
								cy="60"
								r="54"
								fill="none"
								stroke="#F59E0B"
								strokeWidth="6"
								strokeLinecap="round"
								strokeDasharray={`${2 * Math.PI * 54}`}
								strokeDashoffset={`${2 * Math.PI * 54 * (1 - holdProgress / 100)}`}
								transform="rotate(-90 60 60)"
							/>
						</svg>
						<div className="progress-text">
							<span className="progress-percentage">{Math.round(holdProgress)}%</span>
							<span className="progress-label">Tahan!</span>
						</div>
					</div>
				)}
			</div>

			{/* Prediction Indicator */}
			{currentPrediction !== "-" && (
				<div className={`prediction-badge ${targetLetter && currentPrediction === targetLetter && confidence > CONFIDENCE_THRESHOLD ? "correct" : "detecting"}`}>
					<span className="prediction-letter">{currentPrediction}</span>
					<span className="confidence-value">{Math.round(confidence * 100)}%</span>
				</div>
			)}

			{/* Status Bar */}
			<div className="video-status-bar">
				{targetLetter && (
					<div className="target-indicator">
						<span className="target-label">Target:</span>
						<span className="target-letter">{targetLetter}</span>
					</div>
				)}
				{onToggleCamera && (
					<button className="camera-switch-btn" onClick={onToggleCamera} title="Ganti Kamera">
						<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
							<path d="M432,144H373c-3,0-6.72-1.94-9.62-5L337.44,98.06a15.52,15.52,0,0,0-1.37-1.85C327.11,85.76,315,80,302,80H210c-13,0-25.11,5.76-34.07,16.21a15.52,15.52,0,0,0-1.37,1.85l-25.94,41c-2.22,2.42-5.34,5-8.62,5v-8a16,16,0,0,0-16-16H100a16,16,0,0,0-16,16v8H80a48.05,48.05,0,0,0-48,48V384a48.05,48.05,0,0,0,48,48H432a48.05,48.05,0,0,0,48-48V192A48.05,48.05,0,0,0,432,144ZM316.84,346.3a96.06,96.06,0,0,1-155.66-59.18,16,16,0,0,1-16.49-26.43l20-20a16,16,0,0,1,22.62,0l20,20A16,16,0,0,1,196,288a17.31,17.31,0,0,1-2-.14,64.07,64.07,0,0,0,102.66,33.63,16,16,0,1,1,20.21,24.81Zm50.47-63-20,20a16,16,0,0,1-22.62,0l-20-20a16,16,0,0,1,13.09-27.2A64,64,0,0,0,215,222.64,16,16,0,1,1,194.61,198a96,96,0,0,1,156,59,16,16,0,0,1,16.72,26.35Z" />
						</svg>
					</button>
				)}
			</div>
		</div>
	);
});

VideoDisplay.displayName = "VideoDisplay";

export default VideoDisplay;
