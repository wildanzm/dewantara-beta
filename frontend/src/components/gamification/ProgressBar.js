// src/components/gamification/ProgressBar.js
import React from "react";
import { useGame } from "../../context/GameContext";
import "./ProgressBar.css";

/**
 * ProgressBar Component
 * Displays user's overall progress (can be used in Navbar or other places)
 */
const ProgressBar = () => {
	const { getProgressPercentage, getTotalStars, xp } = useGame();
	const percentage = getProgressPercentage();
	const totalStars = getTotalStars();

	return (
		<div className="progress-bar-container">
			<div className="progress-info">
				<span className="progress-label">Progres: {percentage}%</span>
				<span className="progress-stats">
					⭐ {totalStars}/15 | ✨ {xp} XP
				</span>
			</div>
			<div className="progress-bar">
				<div className="progress-fill" style={{ width: `${percentage}%` }}>
					{percentage > 10 && <span className="progress-text">{percentage}%</span>}
				</div>
			</div>
		</div>
	);
};

export default ProgressBar;
