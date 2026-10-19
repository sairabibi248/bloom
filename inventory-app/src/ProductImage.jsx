import { CATEGORIES } from './data.js';

export default function ProductImage({ item, size = 'md' }) {
  const color = CATEGORIES.find((c) => c.name === item.category)?.color ?? '#ffe8d6';
  return (
    <div className={`product-image ${size}`} style={{ background: color }}>
      {item.image ? <img src={item.image} alt={item.name} /> : <span>{item.emoji}</span>}
    </div>
  );
}
