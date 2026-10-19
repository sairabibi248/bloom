# 🍩 Sweet Crumbs Bakery: Inventory Management System (React JS)

A bakery website and inventory manager built with React + Vite.

## Pages
- **Home**: hero banner with donut illustration, shop-by-category tiles, today's favourites, features
- **Menu**: customer-facing menu with product pictures, category filter and search (expired items and raw ingredients are hidden; sold-out items get a ribbon)
- **Inventory**: the admin dashboard

## Inventory features
- **Add / Edit / Delete** bakery items (name, photo or icon, category, quantity, unit, price, best-before date)
- **Upload a product photo**: it is resized automatically and saved in the browser
- **Search**, category chips, status filter (low stock, sold out, expiring soon, expired) and sorting
- **Sell** button lowers stock and records the sale, and **+6 Bake** restocks
- **Stats**: products, stock value, today's sales revenue, low-stock and expiring counts
- **Freshness badges** based on the expiry date
- **Card view / table view** toggle
- **Export CSV**
- All data is saved in `localStorage`

## Images
Product illustrations are SVG files in `public/images/`.
To use your own photo on the home page, save it as `public/images/donuts.png` and it replaces the illustration automatically.
To change a product's picture, use **Edit → Upload photo** on the Inventory page.

## Run it
```bash
cd inventory-app
npm install
npm run dev
```
Then open http://localhost:5173

Screenshots are in `../screenshots/`.
