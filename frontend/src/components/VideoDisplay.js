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
const VideoDisplay = forwardRef(({ targetLetter = null, currentPrediction = "-", confidence = 0, onSuccess, showGuide = true, className = "" }, ref) => {
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
			</div>
		</div>
	);
});

VideoDisplay.displayName = "VideoDisplay";

export default VideoDisplay;
