import { useState } from 'react';
import { CATEGORIES, HERO_PHOTO, HERO_FALLBACK, formatPrice } from '../data.js';
import ProductImage from '../ProductImage.jsx';

export default function Home({ items, go }) {
  const [heroSrc, setHeroSrc] = useState(HERO_PHOTO);
  const featured = items.filter((i) => i.featured && i.quantity > 0).slice(0, 4);
  const bestSellers = featured.length ? featured : items.filter((i) => i.quantity > 0).slice(0, 4);

  return (
    <main>
      <section className="hero">
        <div className="hero-text">
          <span className="pill">🔥 Fresh out of the oven</span>
          <h1>Life is sweeter<br />with <em>donuts</em> 🍩</h1>
          <p>Handmade cakes, fluffy donuts and warm croissants baked every morning with love. Order from our menu or manage the bakery's stock in one click.</p>
          <div className="hero-buttons">
            <button className="btn primary big" onClick={() => go('menu')}>View Menu</button>
            <button className="btn outline big" onClick={() => go('inventory')}>Manage Inventory</button>
          </div>
          <div className="hero-stats">
            <div><b>{items.length}+</b><span>Treats</span></div>
            <div><b>4.9★</b><span>Rating</span></div>
            <div><b>10k+</b><span>Happy customers</span></div>
          </div>
        </div>
        <div className="hero-art">
          <div className="blob" />
          <img
            src={heroSrc}
            alt="Pink and chocolate sprinkle donuts"
            onError={() => heroSrc !== HERO_FALLBACK && setHeroSrc(HERO_FALLBACK)}
          />
          <span className="float f1">🧁</span>
          <span className="float f2">🍪</span>
          <span className="float f3">🥐</span>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Shop by category</h2>
        <div className="category-tiles">
          {CATEGORIES.filter((c) => c.name !== 'Ingredients').map((c) => (
            <button key={c.name} className="tile" style={{ background: c.color }} onClick={() => go('menu')}>
              <span>{c.emoji}</span>{c.name}
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Today's favourites</h2>
        <div className="menu-grid">
          {bestSellers.map((item) => (
            <div key={item.id} className="menu-card">
              <ProductImage item={item} size="lg" />
              <div className="menu-card-body">
                <h3>{item.name}</h3>
                <p className="muted small">{item.category}</p>
                <div className="menu-card-foot">
                  <b className="price">{formatPrice(item.price)}</b>
                  <button className="btn small" onClick={() => go('menu')}>Order</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section features">
        <div className="feature"><span>🌾</span><h3>Fresh ingredients</h3><p>Real butter, farm eggs and no shortcuts.</p></div>
        <div className="feature"><span>👩‍🍳</span><h3>Baked daily</h3><p>Everything on the shelf was made this morning.</p></div>
        <div className="feature"><span>🛵</span><h3>Fast delivery</h3><p>Warm treats at your door within 30 minutes.</p></div>
      </section>
    </main>
  );
}
