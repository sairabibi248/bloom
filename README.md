# bloom

An e-commerce web application built for **Bloom** — an online store for fresh flowers, plants and gifts.

## Features

- Product catalog with search and category filter
- Shopping cart (saved in the browser, survives page reloads)
- Quantity controls and live cart total
- Checkout form (cash on delivery / bank transfer)
- Responsive design for mobile and desktop

## Project structure

```
bloom/
├── index.html        # Main page
├── css/style.css     # Styles
└── js/
    ├── products.js   # Product catalog — edit this to change products
    └── app.js        # Cart, filtering and checkout logic
```

## Run locally

No install needed. Open `index.html` in your browser, or start a small local server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Add or edit products

Open `js/products.js` and edit the `PRODUCTS` list. Each product has an `id`, `name`, `category`, `price` (in Rs), `emoji` and `description`.

## Deploy for free (GitHub Pages)

1. Go to the repository **Settings → Pages**
2. Under **Source**, choose the `main` branch and `/ (root)` folder
3. Save. The site will be live at `https://<your-username>.github.io/bloom/`

## Next steps

- Real product photos instead of emoji placeholders
- A backend (e.g. Node.js/Express + database) to store orders
- Online payments (e.g. Stripe, JazzCash, Easypaisa)
- User accounts and order history
