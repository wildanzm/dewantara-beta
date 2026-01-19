// src/components/gamification/FeedbackOverlay.js
import React, { useEffect, useState } from "react";
import "./FeedbackOverlay.css";

/**
 * FeedbackOverlay Component
 * Shows animated feedback when user wins a level
 */
const FeedbackOverlay = ({ isVisible, stars, xpEarned, completionTime, onClose }) => {
	const [showConfetti, setShowConfetti] = useState(false);

	useEffect(() => {
		if (isVisible) {
			setShowConfetti(true);
			// Auto close after 5 seconds
			const timer = setTimeout(() => {
				onClose();
			}, 5000);
			return () => clearTimeout(timer);
		} else {
			setShowConfetti(false);
		}
	}, [isVisible, onClose]);

	if (!isVisible) return null;

	return (
		<div className="feedback-overlay">
			{/* Confetti Effect */}
			{showConfetti && (
				<div className="confetti-container">
					{[...Array(50)].map((_, i) => (
						<div
							key={i}
							className="confetti"
							style={{
								left: `${Math.random() * 100}%`,
								animationDelay: `${Math.random() * 3}s`,
								backgroundColor: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A"][Math.floor(Math.random() * 5)],
							}}
						/>
					))}
				</div>
			)}

			{/* Success Card */}
			<div className="feedback-card">
				<div className="feedback-icon">🎉</div>
				<h2 className="feedback-title">Level Selesai!</h2>

				{/* Stars Display */}
				<div className="feedback-stars">
					{[1, 2, 3].map((starIndex) => (
						<span
							key={starIndex}
							className={`feedback-star ${starIndex <= stars ? "earned" : "empty"}`}
							style={{
								animationDelay: `${starIndex * 0.2}s`,
							}}>
							{starIndex <= stars ? "⭐" : "☆"}
						</span>
					))}
				</div>

				{/* Stats */}
				<div className="feedback-stats">
					<div className="stat-item">
						<span className="stat-label">XP Didapat</span>
						<span className="stat-value">+{xpEarned} ✨</span>
					</div>
					<div className="stat-item">
						<span className="stat-label">Waktu</span>
						<span className="stat-value">{completionTime}s ⏱️</span>
					</div>
				</div>

				{/* Performance Message */}
				<p className="feedback-message">
					{stars === 3 && "🏆 Sempurna! Kamu luar biasa!"}
					{stars === 2 && "👏 Bagus sekali! Coba lagi untuk 3 bintang!"}
					{stars === 1 && "👍 Selamat! Terus berlatih!"}
				</p>

				{/* Close Button */}
				<button className="feedback-button" onClick={onClose}>
					Lanjut Petualangan →
				</button>
			</div>
		</div>
	);
};

export default FeedbackOverlay;
