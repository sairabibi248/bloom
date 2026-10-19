import { useEffect, useState } from 'react';
import { STORAGE_KEY, SALES_KEY, SAMPLE_ITEMS, load, save } from './data.js';
import Home from './pages/Home.jsx';
import Menu from './pages/Menu.jsx';
import Inventory from './pages/Inventory.jsx';

const PAGES = [
  { id: 'home', label: 'Home' },
  { id: 'menu', label: 'Menu' },
  { id: 'inventory', label: 'Inventory' },
];

const pageFromHash = () => {
  const id = window.location.hash.replace('#/', '');
  return PAGES.some((p) => p.id === id) ? id : 'home';
};

export default function App() {
  const [page, setPage] = useState(pageFromHash);
  const [items, setItems] = useState(() => load(STORAGE_KEY, SAMPLE_ITEMS));
  const [sales, setSales] = useState(() => load(SALES_KEY, []));
  const [toast, setToast] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => save(STORAGE_KEY, items), [items]);
  useEffect(() => save(SALES_KEY, sales), [sales]);

  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const go = (id) => {
    window.location.hash = '#/' + id;
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  };

  const shared = { items, setItems, sales, setSales, setToast, go };

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <button className="brand" onClick={() => go('home')}>🍩 Sweet Crumbs</button>
          <button className="burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">☰</button>
          <div className={'nav-links' + (menuOpen ? ' open' : '')}>
            {PAGES.map((p) => (
              <button key={p.id} className={page === p.id ? 'active' : ''} onClick={() => go(p.id)}>{p.label}</button>
            ))}
          </div>
        </div>
      </nav>

      {page === 'home' && <Home {...shared} />}
      {page === 'menu' && <Menu {...shared} />}
      {page === 'inventory' && <Inventory {...shared} />}

      <footer className="footer">
        <div>🍩 <b>Sweet Crumbs Bakery</b> · Baked fresh every morning</div>
        <div className="muted">📍 Main Boulevard, Lahore · ☎ 0300-1234567 · Open 8am – 11pm</div>
      </footer>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
