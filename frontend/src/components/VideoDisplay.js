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
const VideoDisplay = forwardRef(
	({ targetLetter = null, currentPrediction = "-", confidence = 0, onSuccess, showGuide = true, className = "", onToggleCamera, facingMode = "user", isCameraOn = false, onCameraToggle, isMirrored = false, onToggleMirror }, ref) => {
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
					<video ref={ref} id="webcam" autoPlay playsInline muted className={isMirrored ? "mirrored" : ""} />

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
					{/* Camera On/Off Toggle */}
					{onCameraToggle && (
						<button className={`camera-power-btn ${isCameraOn ? "on" : "off"}`} onClick={onCameraToggle} title={isCameraOn ? "Matikan Kamera" : "Nyalakan Kamera"}>
							{isCameraOn ? (
								<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path
										d="M12 16C13.6569 16 15 14.6569 15 13C15 11.3431 13.6569 10 12 10C10.3431 10 9 11.3431 9 13C9 14.6569 10.3431 16 12 16Z"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M3 16.8V9.2C3 8.0799 3 7.51984 3.21799 7.09202C3.40973 6.71569 3.71569 6.40973 4.09202 6.21799C4.51984 6 5.0799 6 6.2 6H7.25464C7.37758 6 7.43905 6 7.49576 5.9935C7.79166 5.95961 8.05705 5.79559 8.21969 5.54609C8.25086 5.49827 8.27836 5.44328 8.33333 5.33333C8.44329 5.11342 8.49827 5.00346 8.56062 4.90782C8.8859 4.40882 9.41668 4.08078 10.0085 4.01299C10.1219 4 10.2448 4 10.4907 4H13.5093C13.7552 4 13.8781 4 13.9915 4.01299C14.5833 4.08078 15.1141 4.40882 15.4394 4.90782C15.5017 5.00345 15.5567 5.11345 15.6667 5.33333C15.7216 5.44329 15.7491 5.49827 15.7803 5.54609C15.943 5.79559 16.2083 5.95961 16.5042 5.9935C16.561 6 16.6224 6 16.7454 6H17.8C18.9201 6 19.4802 6 19.908 6.21799C20.2843 6.40973 20.5903 6.71569 20.782 7.09202C21 7.51984 21 8.0799 21 9.2V16.8C21 17.9201 21 18.4802 20.782 18.908C20.5903 19.2843 20.2843 19.5903 19.908 19.782C19.4802 20 18.9201 20 17.8 20H6.2C5.0799 20 4.51984 20 4.09202 19.782C3.71569 19.5903 3.40973 19.2843 3.21799 18.908C3 18.4802 3 17.9201 3 16.8Z"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							) : (
								<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path
										d="M3 3L6.00007 6.00007M21 21L19.8455 19.8221M9.74194 4.06811C9.83646 4.04279 9.93334 4.02428 10.0319 4.01299C10.1453 4 10.2683 4 10.5141 4H13.5327C13.7786 4 13.9015 4 14.015 4.01299C14.6068 4.08078 15.1375 4.40882 15.4628 4.90782C15.5252 5.00345 15.5802 5.11345 15.6901 5.33333C15.7451 5.44329 15.7726 5.49827 15.8037 5.54609C15.9664 5.79559 16.2318 5.95961 16.5277 5.9935C16.5844 6 16.6459 6 16.7688 6H17.8234C18.9435 6 19.5036 6 19.9314 6.21799C20.3077 6.40973 20.6137 6.71569 20.8055 7.09202C21.0234 7.51984 21.0234 8.0799 21.0234 9.2V15.3496M19.8455 19.8221C19.4278 20 18.8702 20 17.8234 20H6.22344C5.10333 20 4.54328 20 4.11546 19.782C3.73913 19.5903 3.43317 19.2843 3.24142 18.908C3.02344 18.4802 3.02344 17.9201 3.02344 16.8V9.2C3.02344 8.0799 3.02344 7.51984 3.24142 7.09202C3.43317 6.71569 3.73913 6.40973 4.11546 6.21799C4.51385 6.015 5.0269 6.00103 6.00007 6.00007M19.8455 19.8221L14.5619 14.5619M14.5619 14.5619C14.0349 15.4243 13.0847 16 12 16C10.3431 16 9 14.6569 9 13C9 11.9153 9.57566 10.9651 10.4381 10.4381M14.5619 14.5619L10.4381 10.4381M10.4381 10.4381L6.00007 6.00007"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							)}
						</button>
					)}
					{targetLetter && isCameraOn && (
						<div className="target-indicator">
							<span className="target-label">Target:</span>
							<span className="target-letter">{targetLetter}</span>
						</div>
					)}
					{onToggleMirror && isCameraOn && (
						<button className="camera-mirror-btn" onClick={onToggleMirror} title={isMirrored ? "Nonaktifkan Mirror" : "Aktifkan Mirror"}>
							<svg fill="currentColor" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
								<g>
									<path d="M260.27,0h-8.532c-16.467,0-29.862,13.395-29.862,29.862v452.277c0,16.467,13.395,29.862,29.862,29.862h8.532 c16.467,0,29.862-13.395,29.862-29.862V29.862C290.132,13.395,276.737,0,260.27,0z M273.068,482.138 c0,7.056-5.742,12.798-12.798,12.798h-8.532c-7.056,0-12.798-5.742-12.798-12.798V29.862c0-7.056,5.742-12.798,12.798-12.798 h8.532c7.056,0,12.798,5.742,12.798,12.798V482.138z"></path>
									<path d="M198.115,68.452c-3.916-0.845-7.901,1.109-9.581,4.744L26.428,423.004c-1.229,2.645-1.015,5.725,0.546,8.174 c1.578,2.466,4.292,3.95,7.201,3.95h162.106c4.71,0,8.532-3.822,8.532-8.532V76.787C204.813,72.786,202.031,69.322,198.115,68.452 z M187.749,418.064H47.527l140.222-302.576V418.064z"></path>
									<path d="M485.572,423.012L323.466,73.204c-1.681-3.626-5.648-5.571-9.581-4.744c-3.908,0.862-6.689,4.326-6.689,8.327v349.808 c0,4.71,3.822,8.532,8.532,8.532h162.106c2.909,0,5.623-1.485,7.192-3.942C486.588,428.729,486.801,425.649,485.572,423.012z M324.26,418.064V115.488l140.222,302.576H324.26z"></path>
								</g>
							</svg>
						</button>
					)}
					{onToggleCamera && isCameraOn && (
						<button className="camera-switch-btn" onClick={onToggleCamera} title="Ganti Kamera">
							<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
								<path d="M432,144H373c-3,0-6.72-1.94-9.62-5L337.44,98.06a15.52,15.52,0,0,0-1.37-1.85C327.11,85.76,315,80,302,80H210c-13,0-25.11,5.76-34.07,16.21a15.52,15.52,0,0,0-1.37,1.85l-25.94,41c-2.22,2.42-5.34,5-8.62,5v-8a16,16,0,0,0-16-16H100a16,16,0,0,0-16,16v8H80a48.05,48.05,0,0,0-48,48V384a48.05,48.05,0,0,0,48,48H432a48.05,48.05,0,0,0,48-48V192A48.05,48.05,0,0,0,432,144ZM316.84,346.3a96.06,96.06,0,0,1-155.66-59.18,16,16,0,0,1-16.49-26.43l20-20a16,16,0,0,1,22.62,0l20,20A16,16,0,0,1,196,288a17.31,17.31,0,0,1-2-.14,64.07,64.07,0,0,0,102.66,33.63,16,16,0,1,1,20.21,24.81Zm50.47-63-20,20a16,16,0,0,1-22.62,0l-20-20a16,16,0,0,1,13.09-27.2A64,64,0,0,0,215,222.64,16,16,0,1,1,194.61,198a96,96,0,0,1,156,59,16,16,0,0,1,16.72,26.35Z" />
							</svg>
						</button>
					)}
				</div>
			</div>
		);
	},
);

VideoDisplay.displayName = "VideoDisplay";

export default VideoDisplay;
