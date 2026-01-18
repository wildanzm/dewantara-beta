// src/components/Navbar.js
import React, { useState, useEffect } from "react"; // <-- Impor useEffect
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";
import siteLogo from "../assets/images/LOGO-D.png";

function Navbar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false); // <-- STATE BARU untuk melacak scroll

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	// --- LOGIKA BARU UNTUK DETEKSI SCROLL ---
	useEffect(() => {
		const handleScroll = () => {
			// Jika posisi scroll vertikal lebih dari 10px, set isScrolled menjadi true
			if (window.scrollY > 10) {
				setIsScrolled(true);
			} else {
				setIsScrolled(false);
			}
		};

		// Tambahkan event listener saat komponen pertama kali dirender
		window.addEventListener("scroll", handleScroll);

		// Hapus event listener saat komponen dilepas (penting untuk performa)
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []); // Array kosong berarti efek ini hanya berjalan sekali (saat mount dan unmount)
	// --- AKHIR DARI LOGIKA BARU ---

	return (
		// Tambahkan class 'scrolled' secara dinamis berdasarkan state
		<nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
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
