export const STORAGE_KEY = 'bakery-items-v2';
export const SALES_KEY = 'bakery-sales';
export const LOW_STOCK_LIMIT = 5;
export const EXPIRY_WARNING_DAYS = 2;

// Drop your own photo at public/images/donuts.png and it is used instead of the illustration.
export const HERO_PHOTO = '/images/donuts.png';
export const HERO_FALLBACK = '/images/donuts.svg';

export const CATEGORIES = [
  { name: 'Cakes', emoji: '🎂', color: '#ffd6e0' },
  { name: 'Pastries', emoji: '🥐', color: '#ffe8c7' },
  { name: 'Breads', emoji: '🍞', color: '#f6e1c6' },
  { name: 'Cookies', emoji: '🍪', color: '#f3dcc8' },
  { name: 'Desserts', emoji: '🧁', color: '#e9dcff' },
  { name: 'Beverages', emoji: '☕', color: '#e2d3c8' },
  { name: 'Ingredients', emoji: '🧈', color: '#fff3c4' },
];
export const EMOJI_CHOICES = ['🎂', '🍰', '🧁', '🥐', '🥖', '🍞', '🥯', '🍩', '🍪', '🥧', '🍫', '☕', '🧋', '🥛', '🧈', '🥚', '🌾', '🍓'];
export const UNITS = ['pcs', 'slices', 'kg', 'boxes', 'cups', 'dozen'];

const daysFromToday = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const img = (name) => `/images/${name}.svg`;

export const SAMPLE_ITEMS = [
  { id: 1, name: 'Chocolate Fudge Cake', emoji: '🎂', image: img('chocolate-fudge-cake'), category: 'Cakes', quantity: 6, unit: 'pcs', price: 2800, expiry: daysFromToday(3), featured: true },
  { id: 2, name: 'Sprinkle Donut', emoji: '🍩', image: img('sprinkle-donut'), category: 'Pastries', quantity: 30, unit: 'pcs', price: 160, expiry: daysFromToday(2), featured: true },
  { id: 3, name: 'Red Velvet Cupcake', emoji: '🧁', image: img('red-velvet-cupcake'), category: 'Desserts', quantity: 24, unit: 'pcs', price: 250, expiry: daysFromToday(2), featured: true },
  { id: 4, name: 'Strawberry Cheesecake', emoji: '🍰', image: img('cheesecake'), category: 'Cakes', quantity: 10, unit: 'slices', price: 420, expiry: daysFromToday(2), featured: true },
  { id: 5, name: 'Butter Croissant', emoji: '🥐', image: img('butter-croissant'), category: 'Pastries', quantity: 4, unit: 'pcs', price: 180, expiry: daysFromToday(1) },
  { id: 6, name: 'French Baguette', emoji: '🥖', image: img('french-baguette'), category: 'Breads', quantity: 0, unit: 'pcs', price: 220, expiry: daysFromToday(1) },
  { id: 7, name: 'Glazed Donut', emoji: '🍩', image: img('glazed-donut'), category: 'Pastries', quantity: 18, unit: 'pcs', price: 150, expiry: daysFromToday(-1) },
  { id: 8, name: 'Blueberry Muffin', emoji: '🧁', image: img('blueberry-muffin'), category: 'Desserts', quantity: 12, unit: 'pcs', price: 300, expiry: daysFromToday(3) },
  { id: 9, name: 'Fudge Brownie', emoji: '🍫', image: img('chocolate-brownie'), category: 'Desserts', quantity: 5, unit: 'pcs', price: 280, expiry: daysFromToday(4) },
  { id: 10, name: 'Choco Chip Cookies', emoji: '🍪', image: img('choco-chip-cookies'), category: 'Cookies', quantity: 15, unit: 'boxes', price: 450, expiry: daysFromToday(14) },
  { id: 11, name: 'Cappuccino', emoji: '☕', image: img('cappuccino'), category: 'Beverages', quantity: 40, unit: 'cups', price: 350, expiry: '' },
  { id: 12, name: 'Unsalted Butter', emoji: '🧈', image: img('unsalted-butter'), category: 'Ingredients', quantity: 3, unit: 'kg', price: 1600, expiry: daysFromToday(20) },
  { id: 13, name: 'All-Purpose Flour', emoji: '🌾', image: img('all-purpose-flour'), category: 'Ingredients', quantity: 25, unit: 'kg', price: 140, expiry: daysFromToday(90) },
];

export const formatPrice = (n) => 'Rs ' + Number(n).toLocaleString('en-PK');
export const todayKey = () => new Date().toISOString().slice(0, 10);

export function load(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable or full; keep working in memory
  }
}

export function daysLeft(expiry) {
  if (!expiry) return null;
  const ms = new Date(expiry + 'T00:00:00') - new Date(todayKey() + 'T00:00:00');
  return Math.round(ms / 86400000);
}

export function freshness(expiry) {
  const d = daysLeft(expiry);
  if (d === null) return { label: 'No expiry', className: 'badge neutral' };
  if (d < 0) return { label: 'Expired', className: 'badge out' };
  if (d === 0) return { label: 'Expires today', className: 'badge low' };
  if (d <= EXPIRY_WARNING_DAYS) return { label: `${d} day${d > 1 ? 's' : ''} left`, className: 'badge low' };
  return { label: `Fresh · ${d} days`, className: 'badge ok' };
}

export function stockStatus(qty) {
  if (qty === 0) return { label: 'Sold out', className: 'badge out' };
  if (qty <= LOW_STOCK_LIMIT) return { label: 'Low stock', className: 'badge low' };
  return { label: 'In stock', className: 'badge ok' };
}

// Shrinks an uploaded photo so it fits comfortably in localStorage.
export function resizeImage(file, maxSize = 360) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
