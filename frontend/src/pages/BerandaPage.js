// src/pages/BerandaPage.js
import React from "react";
import { Link } from "react-router-dom";
import "./BerandaPage.css";
// Pastikan path ke ilustrasi Anda sudah benar
import heroIllustration from "../assets/images/gambar.png";

function BerandaPage() {
	return (
		<div className="beranda-wrapper new-design">
			{/* HERO SECTION - DEWANTARA */}
			<section className="hero-section">
				{/* Elemen Dekoratif SVG */}
				<div className="hero-bg-shape hero-bg-shape-1"></div>
				<div className="hero-bg-shape hero-bg-shape-2"></div>
				<div className="hero-bg-shape hero-bg-shape-3"></div>

				<div className="beranda-container">
					<div className="hero-content">
						<h1 className="animate-fade-in-up">DEWANTARA</h1>
						<h2 className="hero-subhead animate-fade-in-up delay-1">Deteksi Wajah dan Tangan Alfabet Real-Time untuk Anak Tunarungu</h2>
						<p className="hero-description animate-fade-in-up delay-2">Mendukung pendidikan inklusif di wilayah jauh dari SLB. Solusi berbasis AI untuk literasi mandiri dan komunikasi tanpa hambatan.</p>
						<div className="animate-fade-in-up delay-3">
							<Link to="/belajar" className="hero-button">
								Mulai Deteksi &rarr;
							</Link>
						</div>
					</div>

					<div className="hero-image animate-scale-in">
						<img src={heroIllustration} alt="Anak-anak belajar bahasa isyarat dengan teknologi" />
					</div>
				</div>
			</section>

			{/* FEATURES SECTION - Based on Proposal */}
			<section className="features-section">
				<div className="beranda-container">
					<h2 className="section-title animate-fade-in-up">Mengapa DEWANTARA?</h2>
					<p className="section-subtitle animate-fade-in-up delay-1">Teknologi AI untuk Pendidikan Inklusif Berkualitas</p>

					<div className="features-grid">
						{/* Card 1: Pendidikan Inklusif */}
						<div className="feature-card animate-fade-in-up delay-2">
							<div className="feature-icon">
								<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
									<circle cx="9" cy="7" r="4"></circle>
									<path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
									<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
								</svg>
							</div>
							<h3>Pendidikan Inklusif</h3>
							<p>Menjangkau anak tunarungu di wilayah terpencil yang jauh dari SLB. Akses literasi untuk semua.</p>
						</div>

						{/* Card 2: Teknologi AI Real-Time */}
						<div className="feature-card animate-fade-in-up delay-3">
							<div className="feature-icon">
								<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
									<path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
								</svg>
							</div>
							<h3>Teknologi AI Real-Time</h3>
							<p>Deteksi alfabet bahasa isyarat secara otomatis dengan MediaPipe dan Random Forest. Feedback instan untuk pembelajaran mandiri.</p>
						</div>

						{/* Card 3: Akses Gratis & Mandiri */}
						<div className="feature-card animate-fade-in-up delay-4">
							<div className="feature-icon">
								<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
									<path d="M12 2v10l8.66 5"></path>
								</svg>
							</div>
							<h3>Akses Gratis & Mandiri</h3>
							<p>Tanpa biaya, mudah digunakan, dan dapat diakses kapan saja. Memberdayakan pembelajaran mandiri dengan antarmuka ramah anak.</p>
						</div>
					</div>
				</div>
			</section>

			{/* IMPACT SECTION */}
			<section className="impact-section">
				<div className="beranda-container">
					<div className="impact-content">
						<h2 className="animate-fade-in-up">Mendukung SDG 4 & 10</h2>
						<p className="animate-fade-in-up delay-1">
							DEWANTARA berkontribusi pada <strong>Sustainable Development Goals</strong>
							untuk Pendidikan Berkualitas (SDG 4) dan Pengurangan Ketimpangan (SDG 10). Kami percaya setiap anak berhak mendapat akses pendidikan yang setara.
						</p>
						<div className="impact-stats animate-fade-in-up delay-2">
							<div className="stat-item">
								<h3>100%</h3>
								<p>Gratis untuk Semua</p>
							</div>
							<div className="stat-item">
								<h3>Real-Time</h3>
								<p>Deteksi Instan</p>
							</div>
							<div className="stat-item">
								<h3>Inklusif</h3>
								<p>Jangkauan Luas</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA SECTION */}
			<section className="cta-section">
				<div className="beranda-container">
					<div className="cta-content animate-fade-in-up">
						<h2>Siap Memulai Perjalanan Belajar?</h2>
						<p>Bergabunglah dengan gerakan pendidikan inklusif untuk masa depan yang lebih baik.</p>
						<Link to="/belajar" className="cta-button-large">
							Mulai Deteksi Sekarang &rarr;
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}

export default BerandaPage;
