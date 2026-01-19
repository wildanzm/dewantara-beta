// src/components/gamification/AdventureMap.js
import React from "react";
import { useGame } from "../../context/GameContext";
import LEVELS from "../../data/levels";
import LevelNode from "./LevelNode";
import "./AdventureMap.css";

/**
 * AdventureMap Component
 * Displays the vertical scrollable island map with level nodes
 */
const AdventureMap = () => {
	const { levelProgress, xp, streak, getTotalStars } = useGame();

	return (
		<div className="adventure-map">
			{/* Header Stats */}
			<div className="map-header">
				<div className="stat-card">
					<span className="stat-icon">⭐</span>
					<div className="stat-info">
						<span className="stat-label">Total Bintang</span>
						<span className="stat-value">{getTotalStars()}/15</span>
					</div>
				</div>
				<div className="stat-card">
					<span className="stat-icon">🔥</span>
					<div className="stat-info">
						<span className="stat-label">Streak</span>
						<span className="stat-value">{streak} hari</span>
					</div>
				</div>
				<div className="stat-card">
					<span className="stat-icon">✨</span>
					<div className="stat-info">
						<span className="stat-label">XP</span>
						<span className="stat-value">{xp}</span>
					</div>
				</div>
			</div>

			{/* Scrollable Map Path */}
			<div className="map-scroll-container">
				<div className="map-path">
					{LEVELS.map((level, index) => {
						const progress = levelProgress[level.id];
						const isLocked = !progress?.isUnlocked;
						const isCompleted = progress?.isCompleted;
						const stars = progress?.stars || 0;

						return <LevelNode key={level.id} level={level} isLocked={isLocked} isCompleted={isCompleted} stars={stars} isEven={index % 2 === 0} />;
					})}
				</div>
			</div>
		</div>
	);
};

export default AdventureMap;
