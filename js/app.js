(() => {
  const CART_KEY = "bloom-cart";
  const $ = (sel) => document.querySelector(sel);
  const formatPrice = (n) => "Rs " + n.toLocaleString("en-PK");

  // ---------- Cart state (saved in localStorage) ----------
  let cart = loadCart();

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // storage unavailable (private mode) — cart still works for this visit
    }
  }

  function findProduct(id) {
    return PRODUCTS.find((p) => p.id === Number(id));
  }

  function cartTotal() {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const p = findProduct(id);
      return p ? sum + p.price * qty : sum;
    }, 0);
  }

  function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    saveCart();
    renderCart();
    showToast(`${findProduct(id).name} added to cart`);
  }

  function setQty(id, qty) {
    if (qty <= 0) delete cart[id];
    else cart[id] = qty;
    saveCart();
    renderCart();
  }

  // ---------- Rendering ----------
  function renderCategories() {
    const select = $("#category");
    [...new Set(PRODUCTS.map((p) => p.category))].forEach((c) => {
      select.add(new Option(c, c));
    });
  }

  function renderProducts() {
    const term = $("#search").value.trim().toLowerCase();
    const category = $("#category").value;
    const list = PRODUCTS.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term))
    );

    $("#product-grid").innerHTML = list
      .map(
        (p) => `
        <article class="card">
          <div class="card-img" aria-hidden="true">${p.emoji}</div>
          <div class="card-body">
            <span class="tag">${p.category}</span>
            <h3>${p.name}</h3>
            <p>${p.description}</p>
            <div class="card-foot">
              <span class="price">${formatPrice(p.price)}</span>
              <button class="btn small" data-add="${p.id}">Add to cart</button>
            </div>
          </div>
        </article>`
      )
      .join("");
    $("#empty-msg").hidden = list.length > 0;
  }

  function renderCart() {
    const entries = Object.entries(cart).filter(([id]) => findProduct(id));
    const count = entries.reduce((n, [, qty]) => n + qty, 0);

    $("#cart-count").textContent = count;
    $("#cart-empty").hidden = entries.length > 0;
    $("#checkout-btn").disabled = entries.length === 0;
    $("#cart-total").textContent = formatPrice(cartTotal());

    $("#cart-items").innerHTML = entries
      .map(([id, qty]) => {
        const p = findProduct(id);
        return `
        <li class="cart-item">
          <span class="cart-emoji">${p.emoji}</span>
          <div class="cart-info">
            <strong>${p.name}</strong>
            <span>${formatPrice(p.price)}</span>
          </div>
          <div class="qty">
            <button class="icon-btn" data-dec="${id}" aria-label="Decrease">−</button>
            <span>${qty}</span>
            <button class="icon-btn" data-inc="${id}" aria-label="Increase">+</button>
          </div>
        </li>`;
      })
      .join("");
  }

  // ---------- Cart drawer ----------
  function openCart() {
    $("#cart").classList.add("open");
    $("#cart").setAttribute("aria-hidden", "false");
    $("#overlay").hidden = false;
  }

  function closeCart() {
    $("#cart").classList.remove("open");
    $("#cart").setAttribute("aria-hidden", "true");
    $("#overlay").hidden = true;
  }

  let toastTimer;
  function showToast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2000);
  }

  // ---------- Events ----------
  $("#product-grid").addEventListener("click", (e) => {
    const id = e.target.dataset.add;
    if (id) addToCart(id);
  });

  $("#cart-items").addEventListener("click", (e) => {
    const { inc, dec } = e.target.dataset;
    if (inc) setQty(inc, cart[inc] + 1);
    if (dec) setQty(dec, cart[dec] - 1);
  });

  $("#search").addEventListener("input", renderProducts);
  $("#category").addEventListener("change", renderProducts);
  $("#cart-open").addEventListener("click", openCart);
  $("#cart-close").addEventListener("click", closeCart);
  $("#overlay").addEventListener("click", closeCart);

  $("#checkout-btn").addEventListener("click", () => {
    $("#checkout-total").textContent = formatPrice(cartTotal());
    closeCart();
    $("#checkout").showModal();
  });

  $("#checkout-cancel").addEventListener("click", () => $("#checkout").close());

  $("#checkout-form").addEventListener("submit", (e) => {
    // No backend yet: log the order and clear the cart.
    const order = {
      customer: Object.fromEntries(new FormData(e.target)),
      items: { ...cart },
      total: cartTotal(),
    };
    console.log("New order:", order);
    cart = {};
    saveCart();
    renderCart();
    e.target.reset();
    showToast("Thank you! Your order has been placed.");
  });

  // ---------- Init ----------
  $("#year").textContent = new Date().getFullYear();
  renderCategories();
  renderProducts();
  renderCart();
})();
