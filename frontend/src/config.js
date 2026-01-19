// src/config.js
/**
 * Environment Configuration for DEWANTARA
 * Automatically detects environment and provides appropriate API endpoints
 */

const isProduction = window.location.protocol === "https:";
const isDevelopment = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Configuration object
const config = {
	// API Base URLs
	API_BASE_URL: isDevelopment ? "http://localhost:8000" : "https://api.dewantara.cloud",

	// WebSocket URL
	WS_URL: isDevelopment ? "ws://localhost:8000/ws" : "wss://api.dewantara.cloud/ws",

	// Environment flags
	isDevelopment,
	isProduction,

	// App Info
	APP_NAME: "DEWANTARA",
	APP_VERSION: "2.0.0",

	// Feature flags
	ENABLE_LOGGING: isDevelopment,
	ENABLE_ANALYTICS: isProduction,
};

// Log configuration in development
if (config.ENABLE_LOGGING) {
	console.log("🔧 DEWANTARA Config:", {
		Environment: isDevelopment ? "Development" : "Production",
		API: config.API_BASE_URL,
		WebSocket: config.WS_URL,
	});
}

export default config;
