// src/pages/ArticleDetailPage.js
import React from "react";
import { useParams, Link } from "react-router-dom";
import { articles } from "../data/articles";
import "./ArticleDetailPage.css"; // Kita akan buat file CSS ini

function ArticleDetailPage() {
  const { slug } = useParams();
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="artikel-not-found">
        <h2>Artikel tidak ditemukan</h2>
        <Link to="/artikel">Kembali ke daftar artikel</Link>
      </div>
    );
  }

  return (
    <div className="article-detail-page">
      <div
        className="article-detail-header"
        style={{ backgroundImage: `url(${article.imageUrl})` }}
      >
        <div className="overlay"></div>
        <div className="header-content">
          <span className="article-category">{article.category}</span>
          <h1>{article.title}</h1>
        </div>
      </div>
      <div className="article-content-wrapper">
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        <Link to="/artikel" className="back-link">
          &larr; Kembali ke Semua Artikel
        </Link>
      </div>
    </div>
  );
}

export default ArticleDetailPage;
