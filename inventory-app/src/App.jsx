import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'inventory-items';
const LOW_STOCK_LIMIT = 5;
const CATEGORIES = ['Electronics', 'Grocery', 'Clothing', 'Stationery', 'Furniture', 'Other'];

const SAMPLE_ITEMS = [
  { id: 1, name: 'Wireless Mouse', sku: 'EL-1001', category: 'Electronics', quantity: 25, price: 1200, supplier: 'TechHub' },
  { id: 2, name: 'USB-C Cable', sku: 'EL-1002', category: 'Electronics', quantity: 3, price: 450, supplier: 'TechHub' },
  { id: 3, name: 'Basmati Rice 5kg', sku: 'GR-2001', category: 'Grocery', quantity: 40, price: 1800, supplier: 'Al-Noor Traders' },
  { id: 4, name: 'Cotton T-Shirt', sku: 'CL-3001', category: 'Clothing', quantity: 0, price: 900, supplier: 'Fashion Point' },
  { id: 5, name: 'A4 Paper Ream', sku: 'ST-4001', category: 'Stationery', quantity: 12, price: 1100, supplier: 'Office Mart' },
  { id: 6, name: 'Office Chair', sku: 'FU-5001', category: 'Furniture', quantity: 4, price: 15500, supplier: 'Comfort Seats' },
];

const EMPTY_FORM = { name: '', sku: '', category: CATEGORIES[0], quantity: '', price: '', supplier: '' };

const formatPrice = (n) => 'Rs ' + Number(n).toLocaleString('en-PK');

function loadItems() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : SAMPLE_ITEMS;
  } catch {
    return SAMPLE_ITEMS;
  }
}

function stockStatus(qty) {
  if (qty === 0) return { label: 'Out of stock', className: 'badge out' };
  if (qty <= LOW_STOCK_LIMIT) return { label: 'Low stock', className: 'badge low' };
  return { label: 'In stock', className: 'badge ok' };
}

export default function App() {
  const [items, setItems] = useState(loadItems);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [toast, setToast] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable; keep working in memory
    }
  }, [items]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const stats = useMemo(() => ({
    totalProducts: items.length,
    totalUnits: items.reduce((sum, i) => sum + i.quantity, 0),
    totalValue: items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    lowStock: items.filter((i) => i.quantity <= LOW_STOCK_LIMIT).length,
  }), [items]);

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((i) =>
        !q ||
        i.name.toLowerCase().includes(q) ||
        i.sku.toLowerCase().includes(q) ||
        i.supplier.toLowerCase().includes(q)
      )
      .filter((i) => categoryFilter === 'All' || i.category === categoryFilter)
      .filter((i) => {
        if (stockFilter === 'Low') return i.quantity > 0 && i.quantity <= LOW_STOCK_LIMIT;
        if (stockFilter === 'Out') return i.quantity === 0;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'qty-asc') return a.quantity - b.quantity;
        if (sortBy === 'qty-desc') return b.quantity - a.quantity;
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
      });
  }, [items, search, categoryFilter, stockFilter, sortBy]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const sku = form.sku.trim().toUpperCase();
    const quantity = Number(form.quantity);
    const price = Number(form.price);

    if (!name || !sku || form.quantity === '' || form.price === '') {
      setError('Name, SKU, quantity and price are required.');
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 0 || price < 0) {
      setError('Quantity must be a whole number and price cannot be negative.');
      return;
    }
    if (items.some((i) => i.sku === sku && i.id !== editingId)) {
      setError(`SKU "${sku}" already exists.`);
      return;
    }

    const item = { name, sku, category: form.category, quantity, price, supplier: form.supplier.trim() };
    if (editingId) {
      setItems(items.map((i) => (i.id === editingId ? { ...i, ...item } : i)));
      setToast(`"${name}" updated`);
    } else {
      setItems([{ id: Date.now(), ...item }, ...items]);
      setToast(`"${name}" added`);
    }
    resetForm();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({ ...item, quantity: String(item.quantity), price: String(item.price) });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    setItems(items.filter((i) => i.id !== item.id));
    if (editingId === item.id) resetForm();
    setToast(`"${item.name}" deleted`);
  };

  const adjustStock = (id, delta) => {
    setItems(items.map((i) => (i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)));
  };

  const exportCsv = () => {
    const header = ['Name', 'SKU', 'Category', 'Quantity', 'Price', 'Supplier'];
    const rows = items.map((i) => [i.name, i.sku, i.category, i.quantity, i.price, i.supplier]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>📦 Inventory Manager</h1>
          <p className="subtitle">Track products, stock levels and inventory value</p>
        </div>
        <button className="btn secondary" onClick={exportCsv}>⬇ Export CSV</button>
      </header>

      <section className="stats">
        <div className="stat"><span>Total Products</span><strong>{stats.totalProducts}</strong></div>
        <div className="stat"><span>Total Units</span><strong>{stats.totalUnits}</strong></div>
        <div className="stat"><span>Inventory Value</span><strong>{formatPrice(stats.totalValue)}</strong></div>
        <div className="stat warn"><span>Low / Out of Stock</span><strong>{stats.lowStock}</strong></div>
      </section>

      <div className="layout">
        <form className="card form" onSubmit={handleSubmit}>
          <h2>{editingId ? '✏️ Edit Product' : '➕ Add Product'}</h2>
          <label>Product Name*<input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Wireless Mouse" /></label>
          <label>SKU*<input name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. EL-1003" /></label>
          <label>Category
            <select name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <div className="row">
            <label>Quantity*<input name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} /></label>
            <label>Price (Rs)*<input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} /></label>
          </div>
          <label>Supplier<input name="supplier" value={form.supplier} onChange={handleChange} placeholder="e.g. TechHub" /></label>
          {error && <p className="error">{error}</p>}
          <div className="row">
            <button className="btn primary" type="submit">{editingId ? 'Update' : 'Add Product'}</button>
            {editingId && <button className="btn secondary" type="button" onClick={resetForm}>Cancel</button>}
          </div>
        </form>

        <section className="card list">
          <div className="toolbar">
            <input
              className="search"
              placeholder="🔍 Search by name, SKU or supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="All">All categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
              <option value="All">All stock</option>
              <option value="Low">Low stock</option>
              <option value="Out">Out of stock</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Sort: Name</option>
              <option value="qty-asc">Qty: Low → High</option>
              <option value="qty-desc">Qty: High → Low</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>

          <p className="count">Showing {visibleItems.length} of {items.length} products</p>

          {visibleItems.length === 0 ? (
            <p className="empty">No products found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th><th>Category</th><th>Stock</th><th>Price</th><th>Value</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.map((item) => {
                    const status = stockStatus(item.quantity);
                    return (
                      <tr key={item.id} className={editingId === item.id ? 'editing' : ''}>
                        <td>
                          <div className="name">{item.name}</div>
                          <div className="meta">{item.sku}{item.supplier && ` · ${item.supplier}`}</div>
                        </td>
                        <td>{item.category}</td>
                        <td>
                          <div className="stepper">
                            <button onClick={() => adjustStock(item.id, -1)} aria-label="Decrease">−</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => adjustStock(item.id, 1)} aria-label="Increase">+</button>
                          </div>
                        </td>
                        <td>{formatPrice(item.price)}</td>
                        <td>{formatPrice(item.quantity * item.price)}</td>
                        <td><span className={status.className}>{status.label}</span></td>
                        <td>
                          <div className="actions">
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

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
