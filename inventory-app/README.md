# Inventory Management System (React JS)

Inventory manager built with React + Vite.

## Features
- **Add** products (name, SKU, category, quantity, price, supplier) with validation and a duplicate-SKU check
- **Search** by name, SKU or supplier
- **Delete** products (asks for confirmation first)
- **Edit / Update** any product
- **+ / −** buttons to change stock quickly
- **Filter** by category and stock status (low stock / out of stock)
- **Sort** by name, quantity or price
- **Dashboard stats**: total products, total units, inventory value, low-stock count
- **Stock badges**: In stock / Low stock (≤ 5) / Out of stock
- **Export CSV** download
- **Data is saved** in the browser's localStorage, so it stays after a refresh

## Run it
```bash
cd inventory-app
npm install
npm run dev
```
Then open http://localhost:5173

Screenshots are in `../screenshots/`.
