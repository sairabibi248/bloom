import { useMemo, useState } from 'react';
import {
  CATEGORIES, EMOJI_CHOICES, UNITS, LOW_STOCK_LIMIT, EXPIRY_WARNING_DAYS,
  formatPrice, todayKey, daysLeft, freshness, stockStatus, resizeImage,
} from '../data.js';
import ProductImage from '../ProductImage.jsx';

const EMPTY_FORM = { name: '', emoji: '🎂', image: '', category: 'Cakes', quantity: '', unit: 'pcs', price: '', expiry: '' };

export default function Inventory({ items, setItems, sales, setSales, setToast }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [view, setView] = useState('grid');

  const todaySales = sales.filter((s) => s.date === todayKey());

  const stats = useMemo(() => ({
    totalProducts: items.length,
    stockValue: items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    todayRevenue: todaySales.reduce((sum, s) => sum + s.total, 0),
    todayUnits: todaySales.reduce((sum, s) => sum + s.qty, 0),
    lowStock: items.filter((i) => i.quantity <= LOW_STOCK_LIMIT).length,
    expiring: items.filter((i) => {
      const d = daysLeft(i.expiry);
      return d !== null && d <= EXPIRY_WARNING_DAYS;
    }).length,
  }), [items, todaySales]);

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((i) => !q || i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q))
      .filter((i) => categoryFilter === 'All' || i.category === categoryFilter)
      .filter((i) => {
        const d = daysLeft(i.expiry);
        if (statusFilter === 'Low') return i.quantity > 0 && i.quantity <= LOW_STOCK_LIMIT;
        if (statusFilter === 'Out') return i.quantity === 0;
        if (statusFilter === 'Expiring') return d !== null && d >= 0 && d <= EXPIRY_WARNING_DAYS;
        if (statusFilter === 'Expired') return d !== null && d < 0;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'qty-asc') return a.quantity - b.quantity;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'expiry') return (daysLeft(a.expiry) ?? Infinity) - (daysLeft(b.expiry) ?? Infinity);
        return 0;
      });
  }, [items, search, categoryFilter, statusFilter, sortBy]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setForm({ ...form, image: await resizeImage(file) });
    } catch {
      setError('Could not read that image. Try a JPG or PNG.');
    }
    e.target.value = '';
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const quantity = Number(form.quantity);
    const price = Number(form.price);

    if (!name || form.quantity === '' || form.price === '') {
      setError('Name, quantity and price are required.');
      return;
    }
    if (quantity < 0 || price < 0) {
      setError('Quantity and price cannot be negative.');
      return;
    }
    if (items.some((i) => i.name.toLowerCase() === name.toLowerCase() && i.id !== editingId)) {
      setError(`"${name}" is already in the bakery.`);
      return;
    }

    const item = { name, emoji: form.emoji, image: form.image, category: form.category, quantity, unit: form.unit, price, expiry: form.expiry };
    if (editingId) {
      setItems(items.map((i) => (i.id === editingId ? { ...i, ...item } : i)));
      setToast(`${form.emoji} ${name} updated`);
    } else {
      setItems([{ id: Date.now(), ...item }, ...items]);
      setToast(`${form.emoji} ${name} added to the shelf`);
    }
    resetForm();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({ ...EMPTY_FORM, ...item, quantity: String(item.quantity), price: String(item.price) });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (item) => {
    if (!window.confirm(`Remove "${item.name}" from the bakery?`)) return;
    setItems(items.filter((i) => i.id !== item.id));
    if (editingId === item.id) resetForm();
    setToast(`${item.emoji} ${item.name} removed`);
  };

  const sell = (item) => {
    if (item.quantity === 0) return;
    setItems(items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i)));
    setSales([{
      id: Date.now(), itemName: item.name, emoji: item.emoji, qty: 1, total: item.price, date: todayKey(),
      time: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }),
    }, ...sales].slice(0, 200));
    setToast(`${item.emoji} Sold 1 ${item.name} · ${formatPrice(item.price)}`);
  };

  const restock = (item, amount) => {
    setItems(items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + amount } : i)));
    setToast(`${item.emoji} +${amount} ${item.name} baked`);
  };

  const exportCsv = () => {
    const header = ['Name', 'Category', 'Quantity', 'Unit', 'Price', 'Expiry'];
    const rows = items.map((i) => [i.name, i.category, i.quantity, i.unit, i.price, i.expiry]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bakery-inventory.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="page">
      <div className="page-head row-between">
        <div>
          <h1>Inventory</h1>
          <p className="muted">Fresh stock, expiry dates and today's sales, all in one place</p>
        </div>
        <button className="btn secondary" onClick={exportCsv}>⬇ Export CSV</button>
      </div>

      <section className="stats">
        <div className="stat"><span>🍰 Products</span><strong>{stats.totalProducts}</strong></div>
        <div className="stat"><span>💰 Stock Value</span><strong>{formatPrice(stats.stockValue)}</strong></div>
        <div className="stat green"><span>🧾 Today's Sales</span><strong>{formatPrice(stats.todayRevenue)}</strong><small>{stats.todayUnits} items sold</small></div>
        <div className="stat amber"><span>📉 Low / Sold Out</span><strong>{stats.lowStock}</strong></div>
        <div className="stat red"><span>⏰ Expiring / Expired</span><strong>{stats.expiring}</strong></div>
      </section>

      <div className="layout">
        <aside className="side">
          <form className="card form" onSubmit={handleSubmit}>
            <h2>{editingId ? '✏️ Edit Item' : '🧑‍🍳 Add Bakery Item'}</h2>
            <label>Item Name*<input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Blueberry Muffin" /></label>

            <div className="field">
              <span>Photo</span>
              <div className="upload">
                <ProductImage item={form} size="sm" />
                <label className="btn small upload-btn">
                  📷 Upload photo
                  <input type="file" accept="image/*" onChange={handleImage} hidden />
                </label>
                {form.image && <button type="button" className="link danger" onClick={() => setForm({ ...form, image: '' })}>Remove</button>}
              </div>
            </div>

            {!form.image && (
              <div className="field">
                <span>Or pick an icon</span>
                <div className="emoji-picker">
                  {EMOJI_CHOICES.map((e) => (
                    <button type="button" key={e} className={form.emoji === e ? 'selected' : ''} onClick={() => setForm({ ...form, emoji: e })}>{e}</button>
                  ))}
                </div>
              </div>
            )}

            <label>Category
              <select name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>)}
              </select>
            </label>
            <div className="row">
              <label>Quantity*<input name="quantity" type="number" min="0" step="any" value={form.quantity} onChange={handleChange} /></label>
              <label>Unit
                <select name="unit" value={form.unit} onChange={handleChange}>
                  {UNITS.map((u) => <option key={u}>{u}</option>)}
                </select>
              </label>
            </div>
            <div className="row">
              <label>Price (Rs)*<input name="price" type="number" min="0" value={form.price} onChange={handleChange} /></label>
              <label>Best Before<input name="expiry" type="date" value={form.expiry} onChange={handleChange} /></label>
            </div>
            {error && <p className="error">{error}</p>}
            <div className="row">
              <button className="btn primary" type="submit">{editingId ? 'Update Item' : 'Add to Shelf'}</button>
              {editingId && <button className="btn secondary" type="button" onClick={resetForm}>Cancel</button>}
            </div>
          </form>

          <div className="card sales">
            <h2>🧾 Today's Sales</h2>
            {todaySales.length === 0 ? (
              <p className="muted">No sales yet today. Press <b>Sell</b> on an item.</p>
            ) : (
              <ul>
                {todaySales.slice(0, 8).map((s) => (
                  <li key={s.id}>
                    <span>{s.emoji} {s.itemName}</span>
                    <span className="muted">{s.time}</span>
                    <b>{formatPrice(s.total)}</b>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <section className="card list">
          <div className="chips">
            <button className={categoryFilter === 'All' ? 'chip active' : 'chip'} onClick={() => setCategoryFilter('All')}>🍽 All</button>
            {CATEGORIES.map((c) => (
              <button key={c.name} className={categoryFilter === c.name ? 'chip active' : 'chip'} onClick={() => setCategoryFilter(c.name)}>
                {c.emoji} {c.name}
              </button>
            ))}
          </div>

          <div className="toolbar">
            <input className="search" placeholder="🔍 Search cakes, breads, cookies..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All items</option>
              <option value="Low">Low stock</option>
              <option value="Out">Sold out</option>
              <option value="Expiring">Expiring soon</option>
              <option value="Expired">Expired</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Sort: Name</option>
              <option value="expiry">Expiry: Soonest first</option>
              <option value="qty-asc">Stock: Lowest first</option>
              <option value="price-desc">Price: Highest first</option>
            </select>
            <div className="view-toggle">
              <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-label="Card view">▦</button>
              <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')} aria-label="Table view">☰</button>
            </div>
          </div>

          <p className="count">Showing {visibleItems.length} of {items.length} items</p>

          {visibleItems.length === 0 ? (
            <p className="empty">🥲 No bakery items found.</p>
          ) : view === 'grid' ? (
            <div className="grid">
              {visibleItems.map((item) => {
                const stock = stockStatus(item.quantity);
                const fresh = freshness(item.expiry);
                return (
                  <div key={item.id} className={'product' + (editingId === item.id ? ' editing' : '') + (item.quantity === 0 ? ' soldout' : '')}>
                    <ProductImage item={item} />
                    <div className="product-name">{item.name}</div>
                    <div className="muted small">{item.category}</div>
                    <div className="product-price">{formatPrice(item.price)}</div>
                    <div className="badges">
                      <span className={stock.className}>{stock.label}</span>
                      <span className={fresh.className}>{fresh.label}</span>
                    </div>
                    <div className="product-qty"><b>{item.quantity}</b> {item.unit} left</div>
                    <div className="product-actions">
                      <button className="btn small sell" disabled={item.quantity === 0} onClick={() => sell(item)}>Sell</button>
                      <button className="btn small" onClick={() => restock(item, 6)}>+6 Bake</button>
                    </div>
                    <div className="product-actions">
                      <button className="link" onClick={() => handleEdit(item)}>Edit</button>
                      <button className="link danger" onClick={() => handleDelete(item)}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Item</th><th>Category</th><th>Stock</th><th>Price</th><th>Freshness</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {visibleItems.map((item) => {
                    const stock = stockStatus(item.quantity);
                    const fresh = freshness(item.expiry);
                    return (
                      <tr key={item.id} className={editingId === item.id ? 'editing' : ''}>
                        <td><div className="cell-item"><ProductImage item={item} size="xs" /><b>{item.name}</b></div></td>
                        <td>{item.category}</td>
                        <td>{item.quantity} {item.unit} <span className={stock.className}>{stock.label}</span></td>
                        <td>{formatPrice(item.price)}</td>
                        <td><span className={fresh.className}>{fresh.label}</span></td>
                        <td>
                          <div className="actions">
                            <button className="btn small sell" disabled={item.quantity === 0} onClick={() => sell(item)}>Sell</button>
                            <button className="btn small" onClick={() => restock(item, 6)}>+6</button>
                            <button className="btn small" onClick={() => handleEdit(item)}>Edit</button>
                            <button className="btn small danger" onClick={() => handleDelete(item)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
