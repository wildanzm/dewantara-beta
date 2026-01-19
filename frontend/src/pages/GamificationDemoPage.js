// src/pages/GamificationDemoPage.js
import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import { AdventureMap, FeedbackOverlay, ProgressBar } from "../components/gamification";
import "./GamificationDemoPage.css";

/**
 * Demo page to test gamification components
 * This is for development/testing only
 */
const GamificationDemoPage = () => {
	const { xp, streak, levelProgress, completeLevel, addXP, resetProgress, getTotalStars, getProgressPercentage } = useGame();

	const [showFeedback, setShowFeedback] = useState(false);
	const [feedbackData, setFeedbackData] = useState({
		stars: 3,
		xpEarned: 150,
		completionTime: 42,
	});

	const handleTestComplete = (levelId, stars) => {
		const xpReward = stars * 50;
		const time = Math.floor(Math.random() * 60) + 20;

		completeLevel(levelId, stars, time);

		setFeedbackData({
			stars,
			xpEarned: xpReward,
			completionTime: time,
		});
		setShowFeedback(true);
	};

	const handleTestAddXP = () => {
		addXP(50);
	};

	return (
		<div className="demo-page">
			{/* Control Panel */}
			<div className="demo-controls">
				<h2>🎮 Gamification Demo Controls</h2>

				<div className="demo-section">
					<h3>Current Stats</h3>
					<div className="stat-grid">
						<div className="stat-box">
							<span className="stat-icon">✨</span>
							<span className="stat-text">XP: {xp}</span>
						</div>
						<div className="stat-box">
							<span className="stat-icon">⭐</span>
							<span className="stat-text">Stars: {getTotalStars()}/15</span>
						</div>
						<div className="stat-box">
							<span className="stat-icon">🔥</span>
							<span className="stat-text">Streak: {streak} days</span>
						</div>
						<div className="stat-box">
							<span className="stat-icon">📊</span>
							<span className="stat-text">Progress: {getProgressPercentage()}%</span>
						</div>
					</div>
				</div>

				<div className="demo-section">
					<h3>Test Actions</h3>
					<div className="button-group">
						<button onClick={() => handleTestComplete("level-1", 3)}>Complete Level 1 (3⭐)</button>
						<button onClick={() => handleTestComplete("level-1", 2)}>Complete Level 1 (2⭐)</button>
						<button onClick={() => handleTestComplete("level-2", 3)}>Complete Level 2 (3⭐)</button>
						<button onClick={() => handleTestComplete("level-3", 1)}>Complete Level 3 (1⭐)</button>
					</div>
					<div className="button-group">
						<button onClick={handleTestAddXP} className="secondary">
							Add 50 XP
						</button>
						<button onClick={() => setShowFeedback(true)} className="secondary">
							Show Feedback Overlay
						</button>
						<button
							onClick={() => {
								if (window.confirm("Reset all progress?")) {
									resetProgress();
								}
							}}
							className="danger">
							Reset Progress
						</button>
					</div>
				</div>

				<div className="demo-section">
					<h3>Progress Bar Component</h3>
					<ProgressBar />
				</div>

				<div className="demo-section">
					<h3>Level Progress Details</h3>
					<div className="level-progress-list">
						{Object.entries(levelProgress).map(([levelId, progress]) => (
							<div key={levelId} className="progress-item">
								<span className="level-id">{levelId}</span>
								<span className={`status ${progress.isUnlocked ? "unlocked" : "locked"}`}>{progress.isUnlocked ? "🔓" : "🔒"}</span>
								<span className="stars">
									{"⭐".repeat(progress.stars)}
									{"☆".repeat(3 - progress.stars)}
								</span>
								<span className="attempts">Attempts: {progress.attempts}</span>
								{progress.bestTime && <span className="best-time">Best: {progress.bestTime}s</span>}
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Adventure Map Preview */}
			<div className="demo-map">
				<h2>🗺️ Adventure Map</h2>
				<AdventureMap />
			</div>

			{/* Feedback Overlay */}
			<FeedbackOverlay isVisible={showFeedback} stars={feedbackData.stars} xpEarned={feedbackData.xpEarned} completionTime={feedbackData.completionTime} onClose={() => setShowFeedback(false)} />
		</div>
	);
};

export default GamificationDemoPage;
