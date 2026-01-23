
(() => {
  "use strict";

  /****************************************************************
   * Royalty Plaza Holdings — Marketplace App Logic
   * - Search / filter / sort
   * - Cart modal + persistence
   * - Export cart JSON
   * - Demo checkout + newsletter
   ****************************************************************/

  /****************************************************************
   * 1) PRODUCT CATALOG (EDIT HERE)
   ****************************************************************/
  const PRODUCTS = [
    {
      id: "book-retire-strong",
      name: "Keep More, Retire Strong (Book)",
      category: "books",
      tags: ["retirement", "personal finance", "wealth"],
      price: 9.99,
      featured: true,
      createdAt: "2026-01-10",
      blurb: "A practical guide to keeping more of your money and building a resilient retirement plan."
    },
    {
      id: "tmpl-budget-system",
      name: "Personal Budget System (Template Pack)",
      category: "templates",
      tags: ["budget", "excel", "planning"],
      price: 14.0,
      featured: true,
      createdAt: "2026-01-12",
      blurb: "Plug-and-play monthly budget, cashflow tracker, and goal dashboard templates."
    },
    {
      id: "tool-tax-starter",
      name: "Tax Starter Toolkit (Mini Calculator)",
      category: "tools",
      tags: ["tax", "calculator", "nigeria"],
      price: 19.0,
      featured: true,
      createdAt: "2026-01-14",
      blurb: "A lightweight tax toolkit scaffold you can extend into a full tax engine (demo package)."
    },
    {
      id: "bundle-wealth-pack",
      name: "Wealth Builder Bundle (Bundle)",
      category: "bundles",
      tags: ["bundle", "value", "finance"],
      price: 39.0,
      featured: true,
      createdAt: "2026-01-18",
      blurb: "Books + templates + checklists packaged for fast execution and better outcomes."
    },
    {
      id: "tmpl-business-plan",
      name: "Business Plan Framework (Template)",
      category: "templates",
      tags: ["business", "plan", "strategy"],
      price: 24.0,
      featured: false,
      createdAt: "2026-01-20",
      blurb: "A structured business plan template for fast investor-ready documentation."
    },
    {
      id: "tool-checklists",
      name: "Execution Checklists Library (Toolkit)",
      category: "tools",
      tags: ["checklists", "systems", "productivity"],
      price: 12.0,
      featured: false,
      createdAt: "2026-01-21",
      blurb: "Operational checklists for repeatable delivery—reduce missed steps and rework."
    }
  ];

  /****************************************************************
   * 2) STORAGE + STATE
   ****************************************************************/
  const LS_KEY = "rph_cart_v1";
  const LS_UI = "rph_ui_v1";

  let cart = loadCart();
  let denseUI = loadUI();

  /****************************************************************
   * 3) DOM HOOKS
   ****************************************************************/
  const el = {
    grid: byId("grid"),
    q: byId("q"),
    category: byId("category"),
    sort: byId("sort"),
    resultsTitle: byId("resultsTitle"),
    resultsMeta: byId("resultsMeta"),
    resultsCount: byId("resultsCount"),
    kpiProducts: byId("kpiProducts"),
    cartCount: byId("cartCount"),

    overlay: byId("overlay"),
    btnCart: byId("btnCart"),
    btnClose: byId("btnClose"),
    cartList: byId("cartList"),
    subTotal: byId("subTotal"),
    btnClear: byId("btnClear"),
    btnContinue: byId("btnContinue"),
    checkoutForm: byId("checkoutForm"),
    btnExportCart: byId("btnExportCart"),

    btnBrowse: byId("btnBrowse"),
    btnSeeBundles: byId("btnSeeBundles"),
    btnHowItWorks: byId("btnHowItWorks"),
    btnTheme: byId("btnTheme"),

    year: byId("year"),
    toast: byId("toast"),

    btnSubscribe: byId("btnSubscribe"),
    nlEmail: byId("nlEmail"),
    nlStatus: byId("nlStatus")
  };

  // Required element check
  const REQUIRED = [
    "grid","q","category","sort","resultsTitle","resultsMeta","resultsCount","kpiProducts","cartCount",
    "overlay","btnCart","btnClose","cartList","subTotal","btnClear","btnContinue","checkoutForm","btnExportCart",
    "btnBrowse","btnSeeBundles","btnHowItWorks","btnTheme","year","toast","btnSubscribe","nlEmail","nlStatus"
  ];
  for (const k of REQUIRED) {
    if (!el[k]) throw new Error(`Missing required element: #${k}`);
  }

  /****************************************************************
   * 4) INIT
   ****************************************************************/
  el.year.textContent = String(new Date().getFullYear());
  el.kpiProducts.textContent = String(PRODUCTS.length);

  applyDensity();
  wireNavPills();
  wireEvents();

  render();
  updateCartBadge();

  /****************************************************************
   * 5) EVENTS
   ****************************************************************/
  function wireEvents() {
    el.q.addEventListener("input", render);

    el.category.addEventListener("change", () => {
      syncPillsToCategory(el.category.value);
      render();
    });

    el.sort.addEventListener("change", render);

    el.btnCart.addEventListener("click", openCart);
    el.btnClose.addEventListener("click", closeCart);

    el.overlay.addEventListener("click", (e) => {
      if (e.target === el.overlay) closeCart();
    });

    el.btnClear.addEventListener("click", () => {
      cart = {};
      saveCart(cart);
      updateCartBadge();
      renderCart();
      showToast("Cart cleared.");
    });

    el.btnContinue.addEventListener("click", closeCart);

    el.checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const items = cartToItems();
      if (!items.length) return showToast("Your cart is empty.");

      showToast("Demo checkout complete. Next: Stripe/Paystack + secure downloads.");
      cart = {};
      saveCart(cart);
      updateCartBadge();
      renderCart();
      closeCart();
    });

    el.btnExportCart.addEventListener("click", exportCartJSON);

    el.btnBrowse.addEventListener("click", () => {
      el.grid.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    el.btnSeeBundles.addEventListener("click", () => {
      el.category.value = "bundles";
      el.category.dispatchEvent(new Event("change"));
      el.grid.scrollIntoView({ behavior: "smooth", block: "start" });
      showToast("Showing Bundles.");
    });

    el.btnHowItWorks.addEventListener("click", () => {
      showToast("How it works: Choose product → Add to cart → Checkout (demo). Next: payments + delivery.");
    });

    el.btnTheme.addEventListener("click", () => {
      denseUI = !denseUI;
      saveUI(denseUI);
      applyDensity();
      showToast(denseUI ? "Compact layout enabled." : "Comfort layout enabled.");
    });

    el.btnSubscribe.addEventListener("click", () => {
      const v = (el.nlEmail.value || "").trim();
      if (!v || !v.includes("@")) {
        el.nlStatus.textContent = "Please enter a valid email address.";
        return;
      }
      el.nlStatus.textContent = "Subscribed (demo). Next: connect Mailchimp/ConvertKit.";
      el.nlEmail.value = "";
      showToast("Subscription saved (demo).");
    });
  }

  /****************************************************************
   * 6) RENDER
   ****************************************************************/
  function render() {
    const query = (el.q.value || "").trim().toLowerCase();
    const cat = el.category.value;

    const catLabel = cat === "all"
      ? "Featured Products"
      : (cat.charAt(0).toUpperCase() + cat.slice(1));

    el.resultsTitle.textContent = catLabel;
    el.resultsMeta.textContent = "Showing curated placeholders. Replace with your real products as you finalize them.";

    let list = PRODUCTS.slice();

    if (cat !== "all") list = list.filter(p => p.category === cat);

    if (query) {
      list = list.filter(p => {
        const hay = [p.name, p.category, (p.tags || []).join(" "), p.blurb].join(" ").toLowerCase();
        return hay.includes(query);
      });
    }

    const s = el.sort.value;
    if (s === "price_asc") list.sort((a, b) => a.price - b.price);
    else if (s === "price_desc") list.sort((a, b) => b.price - a.price);
    else if (s === "newest") list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (s === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else {
      // featured first, then newest
      list.sort((a, b) => {
        if (!!b.featured !== !!a.featured) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    el.resultsCount.textContent = `${list.length} item${list.length === 1 ? "" : "s"}`;

    el.grid.innerHTML = "";
    list.forEach(p => el.grid.appendChild(productCard(p)));

    updateCartBadge();
  }

  function productCard(p) {
    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <div class="thumb" aria-hidden="true"></div>
      <div class="content">
        <div class="title">
          <span>${escapeHtml(p.name)}</span>
          <span class="chip">${escapeHtml(p.category.toUpperCase())}</span>
        </div>
        <div class="desc">${escapeHtml(p.blurb || "")}</div>
        <div class="row">
          <div>
            <div class="price">${money(p.price)}</div>
            <div class="small">${(p.tags || []).slice(0, 3).map(t => "#" + t).join(" ")}</div>
          </div>
          <div class="btnRow">
            <button class="btn sm" data-action="details">Details</button>
            <button class="btn sm primary" data-action="add">Add</button>
          </div>
        </div>
      </div>
    `;

    card.querySelector('[data-action="add"]').addEventListener("click", () => {
      addToCart(p.id, 1);
      showToast(`Added: ${p.name}`);
    });

    card.querySelector('[data-action="details"]').addEventListener("click", () => {
      const tags = (p.tags || []).map(t => "#" + t).join(" ");
      showToast(`${p.name} — ${money(p.price)} • ${tags || "No tags"}`);
    });

    return card;
  }

  /****************************************************************
   * 7) CART
   ****************************************************************/
  function openCart() {
    el.overlay.classList.add("open");
    el.overlay.setAttribute("aria-hidden", "false");
    renderCart();
  }

  function closeCart() {
    el.overlay.classList.remove("open");
    el.overlay.setAttribute("aria-hidden", "true");
  }

  function addToCart(productId, qtyDelta) {
    const cur = Number(cart[productId] || 0);
    const next = Math.max(0, cur + Number(qtyDelta || 0));
    if (next === 0) delete cart[productId];
    else cart[productId] = next;

    saveCart(cart);
    updateCartBadge();
  }

  function cartToItems() {
    return Object.entries(cart)
      .map(([id, qty]) => {
        const product = PRODUCTS.find(p => p.id === id);
        if (!product) return null;
        return { product, qty: Number(qty) };
      })
      .filter(Boolean);
  }

  function calcSubtotal() {
    return cartToItems().reduce((sum, x) => sum + x.qty * x.product.price, 0);
  }

  function renderCart() {
    const items = cartToItems();

    if (!items.length) {
      el.cartList.innerHTML = `<div class="muted">Your cart is empty. Add a product to start.</div>`;
      el.subTotal.textContent = money(0);
      return;
    }

    el.cartList.innerHTML = "";

    for (const { product, qty } of items) {
      const row = document.createElement("div");
      row.className = "cartItem";

      row.innerHTML = `
        <div class="left">
          <div class="name">${escapeHtml(product.name)}</div>
          <div class="meta">${escapeHtml(product.category.toUpperCase())} • ${money(product.price)} each</div>
        </div>
        <div class="right">
          <div class="qtyRow">
            <button class="qtyBtn" data-act="dec" title="Decrease">−</button>
            <div class="qtyVal">${qty}</div>
            <button class="qtyBtn" data-act="inc" title="Increase">+</button>
          </div>
          <div class="meta">Line: <strong style="color:rgba(242,209,132,.95)">${money(qty * product.price)}</strong></div>
          <div class="dangerLink" data-act="rm">Remove</div>
        </div>
      `;

      row.querySelector('[data-act="dec"]').addEventListener("click", () => {
        addToCart(product.id, -1);
        renderCart();
      });
      row.querySelector('[data-act="inc"]').addEventListener("click", () => {
        addToCart(product.id, +1);
        renderCart();
      });
      row.querySelector('[data-act="rm"]').addEventListener("click", () => {
        delete cart[product.id];
        saveCart(cart);
        updateCartBadge();
        renderCart();
      });

      el.cartList.appendChild(row);
    }

    el.subTotal.textContent = money(calcSubtotal());
  }

  function updateCartBadge() {
    const n = Object.values(cart).reduce((a, b) => a + Number(b), 0);
    el.cartCount.textContent = String(n);
    el.cartCount.style.display = n > 0 ? "inline-block" : "none";
  }

  /****************************************************************
   * 8) EXPORT CART JSON
   ****************************************************************/
  function exportCartJSON() {
    const payload = {
      brand: "Royalty Plaza Holdings",
      exportedAt: new Date().toISOString(),
      items: cartToItems().map(x => ({
        id: x.product.id,
        name: x.product.name,
        qty: x.qty,
        unitPrice: x.product.price,
        lineTotal: round2(x.qty * x.product.price)
      })),
      subtotal: round2(calcSubtotal())
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "royalty-plaza-cart.json";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
    showToast("Cart exported.");
  }

  /****************************************************************
   * 9) UI: DENSITY TOGGLE
   ****************************************************************/
  function applyDensity() {
    // matches CSS variables in index.html
    document.documentElement.style.setProperty("--radius", denseUI ? "16px" : "20px");
    document.documentElement.style.setProperty("--radius2", denseUI ? "22px" : "28px");
  }

  /****************************************************************
   * 10) NAV PILLS (OPTIONAL)
   ****************************************************************/
  function wireNavPills() {
    const pills = document.querySelectorAll(".pill[data-filter]");
    if (!pills.length) return;

    pills.forEach(p => {
      p.addEventListener("click", () => {
        pills.forEach(x => x.classList.remove("active"));
        p.classList.add("active");
        const f = p.getAttribute("data-filter");
        el.category.value = f;
        el.category.dispatchEvent(new Event("change"));
      });
    });
  }

  function syncPillsToCategory(value) {
    const pills = document.querySelectorAll(".pill[data-filter]");
    if (!pills.length) return;
    pills.forEach(x => x.classList.toggle("active", x.getAttribute("data-filter") === value));
  }

  /****************************************************************
   * 11) LOCAL STORAGE
   ****************************************************************/
  function loadCart() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function saveCart(c) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(c));
    } catch {
      // ignore
    }
  }

  function loadUI() {
    try {
      const raw = localStorage.getItem(LS_UI);
      return raw ? JSON.parse(raw) : false;
    } catch {
      return false;
    }
  }

  function saveUI(v) {
    try {
      localStorage.setItem(LS_UI, JSON.stringify(!!v));
    } catch {
      // ignore
    }
  }

  /****************************************************************
   * 12) UTILITIES
   ****************************************************************/
  function byId(id) {
    return document.getElementById(id);
  }

  function money(n) {
    const v = Number(n || 0);
    return v.toLocaleString(undefined, { style: "currency", currency: "USD" });
  }

  function round2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }

  function showToast(msg) {
    el.toast.textContent = String(msg || "");
    el.toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.toast.classList.remove("show"), 3200);
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
