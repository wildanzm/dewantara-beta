// src/context/GameContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

/**
 * USER PROGRESS SCHEMA (Persisted in LocalStorage)
 * {
 *   xp: number,              // Total experience points
 *   streak: number,          // Daily login streak count
 *   lastLoginDate: string,   // ISO date string for streak tracking
 *   levelProgress: {
 *     [levelId]: {
 *       stars: number,       // 0-3 stars earned
 *       isUnlocked: boolean, // Whether level is accessible
 *       isCompleted: boolean,// Whether level has been completed
 *       bestTime: number,    // Best completion time in seconds
 *       attempts: number     // Number of times attempted
 *     }
 *   }
 * }
 */

const STORAGE_KEY = "dewantara_user_progress";
const DEFAULT_PROGRESS = {
	xp: 0,
	streak: 0,
	lastLoginDate: null,
	levelProgress: {
		"level-1": {
			// A-E letters (starter level - always unlocked)
			stars: 0,
			isUnlocked: true,
			isCompleted: false,
			bestTime: null,
			attempts: 0,
		},
		"level-2": {
			// F-J letters
			stars: 0,
			isUnlocked: false,
			isCompleted: false,
			bestTime: null,
			attempts: 0,
		},
		"level-3": {
			// K-O letters
			stars: 0,
			isUnlocked: false,
			isCompleted: false,
			bestTime: null,
			attempts: 0,
		},
		"level-4": {
			// P-T letters
			stars: 0,
			isUnlocked: false,
			isCompleted: false,
			bestTime: null,
			attempts: 0,
		},
		"level-5": {
			// U-Z letters
			stars: 0,
			isUnlocked: false,
			isCompleted: false,
			bestTime: null,
			attempts: 0,
		},
	},
};

const GameContext = createContext();

/**
 * Custom hook to use the GameContext
 * @throws {Error} If used outside of GameProvider
 */
export const useGame = () => {
	const context = useContext(GameContext);
	if (!context) {
		throw new Error("useGame must be used within a GameProvider");
	}
	return context;
};

/**
 * GameProvider Component
 * Manages global game state with automatic localStorage persistence
 */
export const GameProvider = ({ children }) => {
	const [userProgress, setUserProgress] = useState(DEFAULT_PROGRESS);
	const [isLoading, setIsLoading] = useState(true);

	// ========== INITIALIZATION & PERSISTENCE ==========

	/**
	 * Load user progress from localStorage on mount
	 */
	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				// Merge with default to handle schema updates
				const merged = {
					...DEFAULT_PROGRESS,
					...parsed,
					levelProgress: {
						...DEFAULT_PROGRESS.levelProgress,
						...parsed.levelProgress,
					},
				};
				setUserProgress(merged);
				console.log("✅ User progress loaded from localStorage");
			} else {
				console.log("📝 No saved progress found, using defaults");
			}
		} catch (error) {
			console.error("❌ Error loading progress from localStorage:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	/**
	 * Save user progress to localStorage whenever it changes
	 */
	useEffect(() => {
		if (!isLoading) {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
				console.log("💾 Progress saved to localStorage");
			} catch (error) {
				console.error("❌ Error saving progress to localStorage:", error);
			}
		}
	}, [userProgress, isLoading]);

	/**
	 * Update streak on mount/daily
	 */
	useEffect(() => {
		if (!isLoading) {
			updateStreak();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading]);

	// ========== STREAK MANAGEMENT ==========

	/**
	 * Update streak based on last login date
	 */
	const updateStreak = useCallback(() => {
		const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
		const lastLogin = userProgress.lastLoginDate;

		if (!lastLogin) {
			// First time login
			setUserProgress((prev) => ({
				...prev,
				streak: 1,
				lastLoginDate: today,
			}));
		} else if (lastLogin !== today) {
			const lastDate = new Date(lastLogin);
			const currentDate = new Date(today);
			const diffTime = currentDate - lastDate;
			const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

			if (diffDays === 1) {
				// Consecutive day - increment streak
				setUserProgress((prev) => ({
					...prev,
					streak: prev.streak + 1,
					lastLoginDate: today,
				}));
			} else if (diffDays > 1) {
				// Streak broken - reset to 1
				setUserProgress((prev) => ({
					...prev,
					streak: 1,
					lastLoginDate: today,
				}));
			}
			// If diffDays === 0, same day - do nothing
		}
	}, [userProgress.lastLoginDate]);

	// ========== XP MANAGEMENT ==========

	/**
	 * Add XP to user's total
	 * @param {number} amount - XP amount to add
	 */
	const addXP = useCallback((amount) => {
		setUserProgress((prev) => ({
			...prev,
			xp: prev.xp + amount,
		}));
	}, []);

	// ========== LEVEL MANAGEMENT ==========

	/**
	 * Complete a level with star rating
	 * @param {string} levelId - The level identifier
	 * @param {number} stars - Stars earned (0-3)
	 * @param {number} completionTime - Time taken in seconds
	 */
	const completeLevel = useCallback((levelId, stars, completionTime) => {
		setUserProgress((prev) => {
			const currentLevel = prev.levelProgress[levelId];
			const newStars = Math.max(currentLevel?.stars || 0, stars);
			const newBestTime = currentLevel?.bestTime ? Math.min(currentLevel.bestTime, completionTime) : completionTime;

			// Calculate XP reward based on stars
			const xpReward = stars * 50; // 50 XP per star

			// Determine next level to unlock
			const levelNumber = parseInt(levelId.split("-")[1]);
			const nextLevelId = `level-${levelNumber + 1}`;

			return {
				...prev,
				xp: prev.xp + xpReward,
				levelProgress: {
					...prev.levelProgress,
					[levelId]: {
						...currentLevel,
						stars: newStars,
						isUnlocked: true,
						isCompleted: true,
						bestTime: newBestTime,
						attempts: (currentLevel?.attempts || 0) + 1,
					},
					// Unlock next level if exists
					...(prev.levelProgress[nextLevelId] && {
						[nextLevelId]: {
							...prev.levelProgress[nextLevelId],
							isUnlocked: true,
						},
					}),
				},
			};
		});
	}, []);

	/**
	 * Unlock a specific level
	 * @param {string} levelId - The level identifier
	 */
	const unlockLevel = useCallback((levelId) => {
		setUserProgress((prev) => ({
			...prev,
			levelProgress: {
				...prev.levelProgress,
				[levelId]: {
					...prev.levelProgress[levelId],
					isUnlocked: true,
				},
			},
		}));
	}, []);

	/**
	 * Increment attempt counter for a level
	 * @param {string} levelId - The level identifier
	 */
	const incrementAttempts = useCallback((levelId) => {
		setUserProgress((prev) => ({
			...prev,
			levelProgress: {
				...prev.levelProgress,
				[levelId]: {
					...prev.levelProgress[levelId],
					attempts: (prev.levelProgress[levelId]?.attempts || 0) + 1,
				},
			},
		}));
	}, []);

	// ========== UTILITY FUNCTIONS ==========

	/**
	 * Get unlocked levels array
	 * @returns {string[]} Array of unlocked level IDs
	 */
	const getUnlockedLevels = useCallback(() => {
		return Object.keys(userProgress.levelProgress).filter((levelId) => userProgress.levelProgress[levelId].isUnlocked);
	}, [userProgress.levelProgress]);

	/**
	 * Get total stars earned across all levels
	 * @returns {number} Total stars
	 */
	const getTotalStars = useCallback(() => {
		return Object.values(userProgress.levelProgress).reduce((total, level) => total + (level.stars || 0), 0);
	}, [userProgress.levelProgress]);

	/**
	 * Get progress percentage (completed levels / total levels)
	 * @returns {number} Percentage (0-100)
	 */
	const getProgressPercentage = useCallback(() => {
		const totalLevels = Object.keys(userProgress.levelProgress).length;
		const completedLevels = Object.values(userProgress.levelProgress).filter((level) => level.isCompleted).length;
		return Math.round((completedLevels / totalLevels) * 100);
	}, [userProgress.levelProgress]);

	/**
	 * Reset all progress (for testing or user request)
	 */
	const resetProgress = useCallback(() => {
		setUserProgress(DEFAULT_PROGRESS);
		localStorage.removeItem(STORAGE_KEY);
		console.log("🔄 Progress reset to default");
	}, []);

	// ========== CONTEXT VALUE ==========

	const value = {
		// State
		userProgress,
		isLoading,

		// Level Progress Getters
		levelProgress: userProgress.levelProgress,
		xp: userProgress.xp,
		streak: userProgress.streak,

		// Actions
		addXP,
		completeLevel,
		unlockLevel,
		incrementAttempts,
		updateStreak,

		// Utilities
		getUnlockedLevels,
		getTotalStars,
		getProgressPercentage,
		resetProgress,
	};

	if (isLoading) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
					fontSize: "1.5rem",
					color: "#666",
				}}>
				🎮 Loading Game Data...
			</div>
		);
	}

	return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export default GameContext;
