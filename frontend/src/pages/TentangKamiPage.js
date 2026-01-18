// src/pages/TentangKamiPage.js
import React from "react";
import "./TentangKamiPage.css";

function TentangKamiPage() {
	return (
		<div className="tentang-kami-page">
			{/* Bagian Header */}
			<section className="tentang-header">
				<h1>Tentang DEWANTARA</h1>
				<p>DEWANTARA lahir dari keyakinan bahwa teknologi dapat menjadi jembatan untuk pendidikan inklusif dan komunikasi yang lebih baik bagi anak tunarungu.</p>
			</section>

			{/* Bagian Visi & Misi */}
			<section className="visi-misi-section">
				<div className="visi-misi-container">
					<div className="visi-misi-item">
						<div className="item-icon">
							<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
								<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
								<circle cx="12" cy="12" r="3"></circle>
							</svg>
						</div>
						<h3>Visi Kami</h3>
						<p>
							Menciptakan dunia di mana setiap anak, termasuk yang tunarungu di wilayah terpencil, dapat mengakses pendidikan berkualitas melalui teknologi AI. Mendukung <strong>SDG 4 (Quality Education)</strong> dan{" "}
							<strong>SDG 10 (Reduced Inequalities)</strong> untuk masa depan yang lebih inklusif.
						</p>
					</div>
					<div className="visi-misi-item">
						<div className="item-icon">
							<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
								<polyline points="9 11 12 14 22 4"></polyline>
								<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
							</svg>
						</div>
						<h3>Misi Kami</h3>
						<ul>
							<li>Menyediakan platform deteksi alfabet bahasa isyarat real-time yang gratis dan mudah diakses.</li>
							<li>Menggunakan AI (MediaPipe & Random Forest) untuk memberikan umpan balik pembelajaran instan.</li>
							<li>Menjangkau anak tunarungu di wilayah terpencil.</li>
							<li>Meningkatkan literasi dan komunikasi untuk mengatasi hambatan pendidikan inklusif.</li>
						</ul>
					</div>
				</div>
			</section>

			{/* BAGIAN BARU: Masalah yang Dihadapi */}
			<section className="problems-section">
				<div className="problems-container">
					<h2>Masalah yang Kami Atasi</h2>
					<p className="problems-subtitle">DEWANTARA hadir untuk mengatasi tantangan nyata dalam pendidikan anak tunarungu</p>
					<div className="problems-grid">
						<div className="problem-card">
							<div className="problem-icon">
								<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
									<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
								</svg>
							</div>
							<h4>Literasi Terbatas</h4>
							<p>Anak tunarungu di wilayah terpencil kesulitan mengakses materi pembelajaran bahasa isyarat yang berkualitas.</p>
						</div>

						<div className="problem-card">
							<div className="problem-icon">
								<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
									<polyline points="9 22 9 12 15 12 15 22"></polyline>
								</svg>
							</div>
							<h4>Jarak dari SLB</h4>
							<p>Daerah yang jauh dari Sekolah Luar Biasa (SLB), membatasi akses pendidikan khusus.</p>
						</div>

						<div className="problem-card">
							<div className="problem-icon">
								<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
								</svg>
							</div>
							<h4>Hambatan Komunikasi</h4>
							<p>Kurangnya pengetahuan bahasa isyarat menciptakan kesenjangan komunikasi antara anak tunarungu dan lingkungan sekitar.</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}

export default TentangKamiPage;
