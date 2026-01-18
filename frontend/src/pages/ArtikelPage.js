// src/pages/ArtikelPage.js
import React from "react";
import { articles } from "../data/articles";
import ArticleCard from "../components/ArticleCard";
import { Link } from "react-router-dom"; // Impor Link
import "./ArtikelPage.css";

function ArtikelPage() {
  // Pisahkan artikel pertama sebagai featured article
  const featuredArticle = articles[0];
  // Ambil sisa artikelnya
  const otherArticles = articles.slice(1);

  return (
    <div className="artikel-page">
      <div className="artikel-header">
        <h1>Wawasan & Cerita</h1>
        <p>
          Jelajahi lebih dalam dunia Bahasa Isyarat Indonesia, budaya, dan
          komunitasnya.
        </p>
      </div>

      {/* --- Bagian Artikel Unggulan (BARU) --- */}
      {featuredArticle && (
        <section className="featured-article-section">
          <Link
            to={`/artikel/${featuredArticle.slug}`}
            className="featured-article-card"
          >
            <div className="featured-image-container">
              <img src={featuredArticle.imageUrl} alt={featuredArticle.title} />
            </div>
            <div className="featured-content">
              <span className="card-category">{featuredArticle.category}</span>
              <h2 className="featured-title">{featuredArticle.title}</h2>
              <p className="card-excerpt">{featuredArticle.excerpt}</p>
              <div className="card-read-more">
                Baca Selengkapnya <span>&rarr;</span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* --- Bagian Artikel Lainnya --- */}
      <section className="other-articles-section">
        <h3 className="section-divider-title">Artikel Lainnya</h3>
        <div className="artikel-grid">
          {otherArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default ArtikelPage;
