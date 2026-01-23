// src/components/Navbar.js
import React, { useState, useEffect } from "react"; // <-- Impor useEffect
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";
import siteLogo from "../assets/images/LOGO-D.png";

function Navbar({ isCameraActive = false }) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);
	const [isVisible, setIsVisible] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	// --- LOGIKA SCROLL DETECTION ---
	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;

			// Set scrolled state
			if (currentScrollY > 10) {
				setIsScrolled(true);
			} else {
				setIsScrolled(false);
			}

			// Handle autohide when camera is active
			if (isCameraActive) {
				if (currentScrollY > lastScrollY && currentScrollY > 80) {
					// Scrolling down & past threshold - hide navbar
					setIsVisible(false);
				} else if (currentScrollY < lastScrollY) {
					// Scrolling up - show navbar
					setIsVisible(true);
				}
			} else {
				// Camera not active - always show navbar
				setIsVisible(true);
			}

			setLastScrollY(currentScrollY);
		};

		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [lastScrollY, isCameraActive]);

	// Auto-hide navbar when camera becomes active
	useEffect(() => {
		if (isCameraActive) {
			// Hide navbar immediately when camera is turned on
			const timer = setTimeout(() => {
				setIsVisible(false);
			}, 1000); // Small delay of 1 second

			return () => clearTimeout(timer);
		} else {
			// Show navbar when camera is turned off
			setIsVisible(true);
		}
	}, [isCameraActive]);
	// --- AKHIR LOGIKA SCROLL ---

	return (
		<nav className={`navbar ${isScrolled ? "scrolled" : ""} ${!isVisible ? "navbar-hidden" : ""}`}>
			<div className="navbar-container">
				<div className="navbar-left">
					<Link to="/" className="navbar-brand" onClick={() => setIsMenuOpen(false)}>
						<img src={siteLogo} alt="Dewantara Logo" className="navbar-logo" />
						<span>DEWANTARA</span> {/* Bungkus teks dengan span */}
					</Link>
				</div>

				<div className={`navbar-center ${isMenuOpen ? "active" : ""}`}>
					<NavLink to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
						Beranda
					</NavLink>
					<NavLink to="/tentang-kami" className="nav-link" onClick={() => setIsMenuOpen(false)}>
						Tentang Dewantara
					</NavLink>
					<NavLink to="/belajar" className="nav-link" onClick={() => setIsMenuOpen(false)}>
						Mulai Belajar
					</NavLink>
					<NavLink to="/gerakan-bebas" className="nav-link" onClick={() => setIsMenuOpen(false)}>
						Gerakan Bebas
					</NavLink>
					<NavLink to="/kamus" className="nav-link" onClick={() => setIsMenuOpen(false)}>
						Kamus
					</NavLink>
					<Link to="/hubungi-kami" className="mobile-cta" onClick={() => setIsMenuOpen(false)}>
						Hubungi
					</Link>
				</div>

				<div className="navbar-right">
					<Link to="/hubungi-kami" className="cta-button">
						Hubungi
					</Link>
					<button className={`hamburger ${isMenuOpen ? "active" : ""}`} onClick={toggleMenu} aria-label="Toggle menu">
						<span className="hamburger-bar"></span>
						<span className="hamburger-bar"></span>
						<span className="hamburger-bar"></span>
					</button>
				</div>
			</div>
		</nav>
	);
}

export default Navbar;
