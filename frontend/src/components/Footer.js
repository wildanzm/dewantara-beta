// src/components/Footer.js
import React from "react";
import { Link } from "react-router-dom"; // Pastikan Link diimpor
import "./Footer.css"; // Kita akan merombak total file CSS ini

function Footer() {
	return (
		<footer className="footer">
			<div className="footer-container">
				{/* Kolom 1: Branding */}
				<div className="footer-col">
					<h3 className="footer-brand">DEWANTARA</h3>
					<p className="footer-tagline">Memberdayakan pendidikan inklusif untuk anak tunarungu melalui teknologi AI Real-Time.</p>
					<p className="footer-project-info">
						<strong>Social Project</strong>
						<br />
						<a href="https://innovillage.id" target="_blank" rel="noopener noreferrer">
							Innovillage 2025
						</a>{" "}
						-{" "}
						<a href="https://telkomuniversity.ac.id" target="_blank" rel="noopener noreferrer">
							Telkom University
						</a>
					</p>
				</div>

				{/* Kolom 2: Navigasi */}
				<div className="footer-col">
					<h4 className="footer-heading">Navigasi</h4>
					<ul className="footer-links">
						<li>
							<Link to="/">Beranda</Link>
						</li>
						<li>
							<Link to="/tentang-kami">Tentang Dewantara</Link>
						</li>
						<li>
							<Link to="/belajar">Mulai Belajar</Link>
						</li>
						<li>
							<Link to="/kamus">Kamus</Link>
						</li>
						<li>
							<Link to="/hubungi-kami">Hubungi</Link>
						</li>
					</ul>
				</div>

				{/* Kolom 3: Sosial Media */}
				<div className="footer-col">
					<h4 className="footer-heading">Terhubung Bersama Kami</h4>
					<div className="social-links">
						<a href="https://instagram.com" aria-label="Instagram">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
								<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
								<line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
							</svg>
						</a>
						<a href="https://instagram.com" aria-label="GitHub">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
							</svg>
						</a>
						<a href="https://instagram.com" aria-label="LinkedIn">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
								<rect x="2" y="9" width="4" height="12"></rect>
								<circle cx="4" cy="4" r="2"></circle>
							</svg>
						</a>
					</div>
				</div>
			</div>

			<div className="footer-divider"></div>

			<div className="footer-bottom">
				<p>&copy; 2025 Dewantara. Mendukung SDG 4 & 10 untuk Pendidikan Inklusif.</p>
			</div>
		</footer>
	);
}

export default Footer;
