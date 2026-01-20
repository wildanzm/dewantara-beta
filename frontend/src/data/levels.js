// src/data/levels.js
/**
 * Static Level Configuration for DEWANTARA Adventure Game
 * Each level represents a set of sign language letters to learn
 */

export const LEVELS = [
	{
		id: "level-1",
		title: "Pulau Awal",
		subtitle: "Huruf A - E",
		description: "Pelajari huruf dasar BISINDO dari A sampai E",
		letters: ["A", "B", "C", "D", "E"],
		difficulty: "easy",
		theme: "island",
		color: "#4CAF50", // Green
		icon: "🌴",
		requiredStarsToUnlock: 0, // Always unlocked
		xpReward: 100,
		order: 1,
		tips: ["Pastikan tanganmu terlihat jelas di kamera", "Tahan posisi tangan minimal 2 detik", "Gunakan pencahayaan yang cukup"],
		funFact: "Huruf A dalam BISINDO dibentuk dengan mengepalkan tangan dan jempol di samping!",
	},
	{
		id: "level-2",
		title: "Hutan Misteri",
		subtitle: "Huruf F - J",
		description: "Jelajahi hutan dan kuasai huruf F sampai J",
		letters: ["F", "G", "H", "I", "J"],
		difficulty: "easy",
		theme: "forest",
		color: "#8BC34A", // Light Green
		icon: "🌲",
		requiredStarsToUnlock: 3, // Need all stars from level 1
		xpReward: 150,
		order: 2,
		tips: ["Huruf F dan G bentuknya mirip, perhatikan posisi jari", "Jaga jarak tangan dari kamera sekitar 30-50cm", "Berlatihlah perlahan sebelum memulai ujian"],
		funFact: "Huruf I adalah salah satu yang termudah - hanya angkat jari kelingking!",
	},
	{
		id: "level-3",
		title: "Gunung Tantangan",
		subtitle: "Huruf K - O",
		description: "Daki gunung dan taklukkan huruf K sampai O",
		letters: ["K", "L", "M", "N", "O"],
		difficulty: "medium",
		theme: "mountain",
		color: "#FF9800", // Orange
		icon: "⛰️",
		requiredStarsToUnlock: 6, // Need at least 6 stars total
		xpReward: 200,
		order: 3,
		tips: ["Huruf M, N mirip - bedanya di jumlah jari yang dilipat", "Level ini lebih sulit, jangan terburu-buru", "Ulangi tutorial jika perlu"],
		funFact: "Huruf K dibentuk dengan dua jari membentuk huruf V yang diputar!",
	},
	{
		id: "level-4",
		title: "Lembah Petir",
		subtitle: "Huruf P - T",
		description: "Lewati lembah berbahaya dengan huruf P sampai T",
		letters: ["P", "Q", "R", "S", "T"],
		difficulty: "medium",
		theme: "valley",
		color: "#9C27B0", // Purple
		icon: "⚡",
		requiredStarsToUnlock: 9, // Need 9 stars total
		xpReward: 250,
		order: 4,
		tips: ["Huruf P dan Q memerlukan orientasi tangan yang tepat", "Pastikan sudut tangan sesuai dengan contoh", "Gunakan latar belakang polos untuk hasil terbaik"],
		funFact: 'Huruf T mirip dengan "thumbs up" tapi dengan posisi berbeda!',
	},
	{
		id: "level-5",
		title: "Puncak Kejayaan",
		subtitle: "Huruf U - Z",
		description: "Raih puncak dengan menguasai huruf U sampai Z",
		letters: ["U", "V", "W", "X", "Y", "Z"],
		difficulty: "hard",
		theme: "peak",
		color: "#F44336", // Red
		icon: "🏆",
		requiredStarsToUnlock: 12, // Need 12 stars total
		xpReward: 300,
		order: 5,
		tips: ["Ini level terakhir - berikan yang terbaik!", "Huruf V dan W sering membingungkan", "Latih semua huruf sebelumnya untuk review"],
		funFact: "Selamat! Setelah level ini kamu menguasai semua 26 huruf BISINDO alphabet!",
	},
];

/**
 * Get level by ID
 * @param {string} levelId - The level identifier
 * @returns {object|undefined} Level data
 */
export const getLevelById = (levelId) => {
	return LEVELS.find((level) => level.id === levelId);
};

/**
 * Get levels by difficulty
 * @param {string} difficulty - easy, medium, or hard
 * @returns {array} Array of levels
 */
export const getLevelsByDifficulty = (difficulty) => {
	return LEVELS.filter((level) => level.difficulty === difficulty);
};

/**
 * Get next level
 * @param {string} currentLevelId - Current level ID
 * @returns {object|null} Next level or null if last level
 */
export const getNextLevel = (currentLevelId) => {
	const currentIndex = LEVELS.findIndex((level) => level.id === currentLevelId);
	if (currentIndex === -1 || currentIndex === LEVELS.length - 1) {
		return null;
	}
	return LEVELS[currentIndex + 1];
};

/**
 * Get previous level
 * @param {string} currentLevelId - Current level ID
 * @returns {object|null} Previous level or null if first level
 */
export const getPreviousLevel = (currentLevelId) => {
	const currentIndex = LEVELS.findIndex((level) => level.id === currentLevelId);
	if (currentIndex <= 0) {
		return null;
	}
	return LEVELS[currentIndex - 1];
};

/**
 * Calculate stars based on performance (time-based only)
 * @param {number} completionTime - Total time in seconds
 * @param {number} mistakes - Number of mistakes made (not used, kept for compatibility)
 * @param {number} avgLetterTime - Average time per letter
 * @param {number} totalLetters - Total number of letters
 * @returns {number} Stars earned (1-3)
 */
export const calculateStars = (completionTime, mistakes = 0, avgLetterTime = 0, totalLetters = 5) => {
	// Time thresholds in minutes (converted to seconds)
	// ≤10 minutes = 3 stars
	// ≤15 minutes = 2 stars (10 + 5)
	// >15 minutes = 1 star
	const threeStarTime = 10 * 60; // 10 minutes in seconds
	const twoStarTime = 15 * 60; // 15 minutes in seconds

	// 3 stars: Excellent time (≤10 minutes)
	if (completionTime <= threeStarTime) {
		return 3;
	}

	// 2 stars: Good time (≤15 minutes)
	if (completionTime <= twoStarTime) {
		return 2;
	}

	// 1 star: Completed the level (always rewarding!)
	return 1;
};

/**
 * Get all letters in order
 * @returns {string[]} All letters A-Z
 */
export const getAllLetters = () => {
	return LEVELS.flatMap((level) => level.letters);
};

/**
 * Get level progress summary
 * @param {object} levelProgress - Progress object from GameContext
 * @returns {object} Summary statistics
 */
export const getLevelProgressSummary = (levelProgress) => {
	const totalLevels = LEVELS.length;
	const completedLevels = Object.values(levelProgress).filter((lp) => lp.isCompleted).length;
	const totalStars = Object.values(levelProgress).reduce((sum, lp) => sum + (lp.stars || 0), 0);
	const maxStars = totalLevels * 3;

	return {
		totalLevels,
		completedLevels,
		totalStars,
		maxStars,
		completionPercentage: Math.round((completedLevels / totalLevels) * 100),
		starPercentage: Math.round((totalStars / maxStars) * 100),
	};
};

export default LEVELS;
