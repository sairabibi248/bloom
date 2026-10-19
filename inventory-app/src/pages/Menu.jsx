import { useMemo, useState } from 'react';
import { CATEGORIES, daysLeft, formatPrice } from '../data.js';
import ProductImage from '../ProductImage.jsx';

export default function Menu({ items }) {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  // Customers only see items that are not expired and are not raw ingredients.
  const menuItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((i) => i.category !== 'Ingredients')
      .filter((i) => (daysLeft(i.expiry) ?? 0) >= 0)
      .filter((i) => category === 'All' || i.category === category)
      .filter((i) => !q || i.name.toLowerCase().includes(q));
  }, [items, category, search]);

  return (
    <main className="page">
      <div className="page-head">
        <h1>Our Menu</h1>
        <p className="muted">Freshly baked today. Grab them before they're gone!</p>
      </div>

      <div className="menu-controls">
        <input className="search" placeholder="🔍 Search the menu..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="chips">
          <button className={category === 'All' ? 'chip active' : 'chip'} onClick={() => setCategory('All')}>🍽 All</button>
          {CATEGORIES.filter((c) => c.name !== 'Ingredients').map((c) => (
            <button key={c.name} className={category === c.name ? 'chip active' : 'chip'} onClick={() => setCategory(c.name)}>
              {c.emoji} {c.name}
            </button>
          ))}
        </div>
      </div>

      {menuItems.length === 0 ? (
        <p className="empty">🥲 Nothing here right now.</p>
      ) : (
        <div className="menu-grid">
          {menuItems.map((item) => (
            <div key={item.id} className={'menu-card' + (item.quantity === 0 ? ' soldout' : '')}>
              <ProductImage item={item} size="lg" />
              {item.quantity === 0 && <span className="ribbon">Sold out</span>}
              <div className="menu-card-body">
                <h3>{item.name}</h3>
                <p className="muted small">{item.category} · {item.quantity > 0 ? `${item.quantity} ${item.unit} available` : 'Back tomorrow'}</p>
                <div className="menu-card-foot">
                  <b className="price">{formatPrice(item.price)}</b>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
