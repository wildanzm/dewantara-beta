// src/components/gamification/LevelNode.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./LevelNode.css";

/**
 * LevelNode Component
 * Represents a single level on the adventure map
 */
const LevelNode = ({ level, isLocked, isCompleted, stars, isEven }) => {
	const navigate = useNavigate();

	const handleClick = () => {
		if (isLocked) {
			// Show locked message (could use a modal or toast)
			alert(`🔒 Level terkunci! Selesaikan level sebelumnya dengan ${level.requiredStarsToUnlock} bintang.`);
			return;
		}
		// Navigate to level gameplay
		navigate(`/play/${level.id}`);
	};

	const renderStars = () => {
		return (
			<div className="level-stars">
				{[1, 2, 3].map((starIndex) => (
					<span key={starIndex} className={`star ${starIndex <= stars ? "earned" : "empty"}`}>
						{starIndex <= stars ? "⭐" : "☆"}
					</span>
				))}
			</div>
		);
	};

	return (
		<div className={`level-node-container ${isEven ? "even" : "odd"}`}>
			<div className={`level-node ${isLocked ? "locked" : ""} ${isCompleted ? "completed" : ""}`} onClick={handleClick} style={{ borderColor: isLocked ? "#ccc" : level.color }}>
				{/* Lock Overlay */}
				{isLocked && (
					<div className="lock-overlay">
						<span className="lock-icon">🔒</span>
					</div>
				)}

				{/* Level Icon */}
				<div className="level-icon" style={{ backgroundColor: level.color }}>
					<span>{level.icon}</span>
				</div>

				{/* Level Info */}
				<div className="level-info">
					<h3 className="level-title">{level.title}</h3>
					<p className="level-subtitle">{level.subtitle}</p>
					<div className="level-letters">{level.letters.join(" • ")}</div>
				</div>

				{/* Stars (only show if unlocked) */}
				{!isLocked && renderStars()}

				{/* Completion Badge */}
				{isCompleted && (
					<div className="completion-badge">
						<span>✓</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default LevelNode;
