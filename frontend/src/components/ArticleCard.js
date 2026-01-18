// src/components/ArticleCard.js
import React from "react";
import { Link } from "react-router-dom";

function ArticleCard({ article }) {
  return (
    <Link to={`/artikel/${article.slug}`} className="article-card">
      <div className="card-image-container">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="card-image"
        />
      </div>
      <div className="card-content">
        <span className="card-category">{article.category}</span>
        <h3 className="card-title">{article.title}</h3>
        <p className="card-excerpt">{article.excerpt}</p>
        <div className="card-read-more">
          Baca Selengkapnya <span>&rarr;</span>
        </div>
      </div>
    </Link>
  );
}

export default ArticleCard;
