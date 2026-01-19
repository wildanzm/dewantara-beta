// src/pages/BelajarPage.js
import React from "react";
import { AdventureMap } from "../components/gamification";
import "./BelajarPage.css";

/**
 * BelajarPage - Main learning hub showing the Adventure Map
 * Users select levels from here to start gameplay
 */
function BelajarPage() {
	return (
		<div className="belajar-page-modern">
			<div className="page-header">
				<h1 className="page-title">Petualangan Belajar BISINDO</h1>
				<p className="page-subtitle">Mari mulai petualangan belajar bahasa isyarat!</p>
			</div>
			<AdventureMap />
		</div>
	);
}

export default BelajarPage;
