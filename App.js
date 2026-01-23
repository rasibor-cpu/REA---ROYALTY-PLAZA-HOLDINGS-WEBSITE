(() => {
  "use strict";

  /****************************************************************
   * Royalty Plaza Holdings — Marketplace App Logic (v1.1)
   * Completed items (A, B, C, D):
   * A) Books link out to Amazon (KDP Select safe) instead of checkout
   * B) Bundles explicitly show “Includes” (book + templates + tools) and are KDP-safe
   * C) Product cards support cover thumbnails (coverUrl) with graceful fallback
   * D) Pricing ladder optimized (impulse → premium, .99 anchors, bundles discounted)
   ****************************************************************/

  /****************************************************************
   * 1) PRODUCT CATALOG (EDIT HERE)
   ****************************************************************/
  const PRODUCTS = [
    // ===== BOOKS (KDP Select: link to Amazon) =====
    {
      id: "book-money-basics-first-10-years",
      name: "Money Basics for Your First 10 Years of Work (Book)",
      category: "books",
      tags: ["early career", "first job", "money basics", "budgeting", "investing"],
      price: 9.99,
      featured: true,
      createdAt: "2026-01-15",
      blurb:
        "A practical guide for high-school leavers, fresh graduates, and early-career professionals who want a clear financial foundation from day one—earn, budget, save, and start investing safely without confusing jargon.",
      // Put your Amazon “View on Amazon” URL here (paste from KDP “View on Amazon”)
      amazonUrl: "https://www.amazon.com/dp/B0GGDF9B6W",
      // Optional: put your cover image URL here (see notes below)
      coverUrl: ""
    },
    {
      id: "book-keep-more-retire-strong",
      name: "Keep More, Retire Strong (Book)",
      category: "books",
      tags: ["retirement", "income protection", "wealth", "strategy"],
      price: 9.99,
      featured: true,
      createdAt: "2026-01-15",
      blurb:
        "A no-nonsense guide for working professionals who want to legally keep more of what they earn and build long-term financial security through disciplined decisions that compound over time.",
      amazonUrl: "https://www.amazon.com/dp/B0GGX92PNC",
      coverUrl: ""
    },

    // ===== TEMPLATES (instant utility) =====
    {
      id: "tmpl-personal-budget-cashflow-system",
      name: "Personal Budget & Cashflow System (Template Pack)",
      category: "templates",
      tags: ["budget", "cashflow", "planning", "excel"],
      price: 14.99,
      featured: true,
      createdAt: "2026-01-22",
      blurb:
        "A plug-and-play finance system that shows where your money goes, what’s leaking, and what to optimize—clear, simple, and built for daily use."
    },
    {
      id: "tmpl-net-worth-tracker",
      name: "Net-Worth Tracker & Financial Snapshot (Template)",
      category: "templates",
      tags: ["net worth", "tracking", "visibility", "goals"],
      price: 11.99,
      featured: false,
      createdAt: "2026-01-22",
      blurb:
        "A clean tracker that gives you a true snapshot of your financial position in minutes—assets, liabilities, and net-worth trend over time."
    },
    {
      id: "tmpl-business-plan-investor-ready",
      name: "Business Plan Framework (Investor-Ready Template)",
      category: "templates",
      tags: ["business", "planning", "strategy", "investors"],
      price: 24.99,
      featured: false,
      createdAt: "2026-01-22",
      blurb:
        "A structured business plan framework designed to produce clear, investor-ready documentation—ideal for founders, consultants, and operators."
    },

    // ===== TOOLS (lightweight, high perceived value) =====
    {
      id: "tool-taxiq-starter",
      name: "TaxIQ Starter Toolkit (Mini Calculator)",
      category: "tools",
      tags: ["tax", "calculator", "planning", "nigeria"],
      price: 19.99,
      featured: true,
      createdAt: "2026-01-22",
      blurb:
        "A lightweight tax-planning toolkit that helps you understand how income, deductions, and structure affect what you actually keep—built for extension."
    },
    {
      id: "tool-expense-leak-detector",
      name: "Expense Leak Detector (Diagnostic Tool)",
      category: "tools",
      tags: ["expenses", "optimization", "habits", "budget"],
      price: 9.99,
      featured: false,
      createdAt: "2026-01-22",
      blurb:
        "A fast diagnostic tool that highlights hidden spending leaks and patterns—perfect for professionals who earn well but feel financially stuck."
    },

    // ===== BUNDLES (KDP-safe value packs) =====
    // NOTE: We DO NOT sell the ebook file. We bundle “value-add” assets and link the book to Amazon.
    {
      id: "bundle-young-pro-starter-pack",
      name: "Young Professional Starter Pack (Bundle)",
      category: "bundles",
      tags: ["bundle", "early career", "value", "starter pack"],
      price: 29.99,
      featured: true,
      createdAt: "2026-01-22",
      blurb:
        "A high-value starter pack for early-career professionals—budgeting + tracking + leak detection, plus the recommended book (Amazon link).",
      includes: [
        "Personal Budget & Cashflow System (Template Pack)",
        "Net-Worth Tracker & Financial Snapshot (Template)",
        "Expense Leak Detector (Diagnostic Tool)",
        "Book: Money Basics for Your First 10 Years of Work (View on Amazon)"
      ]
    },
    {
      id: "bundle-mid-career-wealth-pack",
      name: "Mid-Career Wealth Pack (Bundle)",
      category: "bundles",
      tags: ["bundle", "wealth", "strategy", "protection"],
      price: 49.99,
      featured: true,
      createdAt: "2026-01-22",
      blurb:
        "Built for professionals in their highest-earning years—visibility + tax awareness + disciplined systems, plus the recommended book (Amazon link).",
      includes: [
        "Net-Worth Tracker & Financial Snapshot (Template)",
        "TaxIQ Starter Toolkit (Mini Calculator)",
        "Personal Budget & Cashflow System (Template Pack)",
        "Book: Keep More, Retire Strong (View on Amazon)"
      ]
    },
    {
      id: "bundle-business-strategy-pack",
      name: "Business & Strategy Pack (Bundle)",
      category: "bundles",
      tags: ["bundle", "business", "founders", "planning"],
      price: 59.99,
      featured: false,
      createdAt: "2026-01-22",
      blurb:
        "For founders and consultants—business planning framework + tax toolkit + financial visibility, packaged for execution speed.",
      includes: [
        "Business Plan Framework (Investor-Ready Template)",
        "TaxIQ Starter Toolkit (Mini Calculator)",
        "Net-Worth Tracker & Financial Snapshot (Template)"
      ]
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

    // Demo checkout: books do NOT appear in cart; only templates/tools/bundles
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
      showToast("How it works: Choose a product → Add to cart → Checkout. Books open Amazon (KDP-safe).");
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
    el.resultsMeta.textContent =
      "Books open Amazon (KDP-safe). Templates, tools, and bundles will be purchasable here once payments are connected.";

    let list = PRODUCTS.slice();

    if (cat !== "all") list = list.filter(p => p.category === cat);

    if (query) {
      list = list.filter(p => {
        const hay = [p.name, p.category, (p.tags || []).join(" "), p.blurb, (p.includes || []).join(" ")]
          .join(" ")
          .toLowerCase();
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

    const isBook = p.category === "books";
    const primaryLabel = isBook ? "View on Amazon" : "Add";
    const primaryDisabled = isBook && !p.amazonUrl;

    // Includes line (bundles)
    const includesLine = Array.isArray(p.includes) && p.includes.length
      ? `<div class="small" style="margin-top:6px; color:rgba(242,242,247,.68)">
           <strong style="color:rgba(242,209,132,.92)">Includes:</strong>
           ${escapeHtml(p.includes.slice(0, 3).join(" • "))}
           ${p.includes.length > 3 ? " …" : ""}
         </div>`
      : "";

    // Cover thumbnail (if provided)
    const coverHtml = p.coverUrl
      ? `<img src="${escapeAttr(p.coverUrl)}" alt="${escapeAttr(p.name)} cover" class="coverImg"
              onerror="this.remove()" />`
      : "";

    card.innerHTML = `
      <div class="thumb" aria-hidden="true">
        ${coverHtml}
      </div>
      <div class="content">
        <div class="title">
          <span>${escapeHtml(p.name)}</span>
          <span class="chip">${escapeHtml(p.category.toUpperCase())}</span>
        </div>
        <div class="desc">${escapeHtml(p.blurb || "")}</div>
        ${includesLine}
        <div class="row">
          <div>
            <div class="price">${money(p.price)}</div>
            <div class="small">${(p.tags || []).slice(0, 3).map(t => "#" + t).join(" ")}</div>
          </div>
          <div class="btnRow">
            <button class="btn sm" data-action="details">Details</button>
            <button class="btn sm primary" data-action="primary" ${primaryDisabled ? "disabled" : ""}>
              ${primaryLabel}
            </button>
          </div>
        </div>
      </div>
    `;

    // If we have a cover image, refine thumb styling in-place (no CSS file edits required)
    const img = card.querySelector(".coverImg");
    if (img) {
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      img.style.display = "block";
      img.style.borderBottom = "1px solid rgba(255,255,255,.06)";
      // remove dashed border overlay effect visually by lowering overlay
      // (the CSS uses :after; we can't remove it, but image will dominate)
    }

    card.querySelector('[data-action="details"]').addEventListener("click", () => {
      const tags = (p.tags || []).map(t => "#" + t).join(" ");
      if (Array.isArray(p.includes) && p.includes.length) {
        showToast(`${p.name} — ${money(p.price)} • Includes: ${p.includes.slice(0, 4).join("; ")}${p.includes.length > 4 ? "…" : ""}`);
      } else {
        showToast(`${p.name} — ${money(p.price)} • ${tags || "No tags"}`);
      }
    });

    card.querySelector('[data-action="primary"]').addEventListener("click", () => {
      if (isBook) {
        if (!p.amazonUrl) {
          showToast("Amazon link not set yet. Add amazonUrl for this book in app.js.");
          return;
        }
        // KDP Select safe: open Amazon
        window.open(p.amazonUrl, "_blank", "noopener,noreferrer");
        return;
      }

      addToCart(p.id, 1);
      showToast(`Added: ${p.name}`);
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

  // Books are never added to cart (KDP Select safe)
  function addToCart(productId, qtyDelta) {
    const product = PRODUCTS.find(x => x.id === productId);
    if (product && product.category === "books") {
      showToast("Books open Amazon (KDP-safe). They are not added to cart.");
      return;
    }

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
        // safety: exclude books if somehow present
        if (product.category === "books") return null;
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
      el.cartList.innerHTML = `<div class="muted">Your cart is empty. Add a template, tool, or bundle to start.</div>`;
      el.subTotal.textContent = money(0);
      return;
    }

    el.cartList.innerHTML = "";

    for (const { product, qty } of items) {
      const row = document.createElement("div");
      row.className = "cartItem";

      const includesMini = Array.isArray(product.includes) && product.includes.length
        ? `<div class="meta">Includes: ${escapeHtml(product.includes.slice(0, 3).join(" • "))}${product.includes.length > 3 ? " …" : ""}</div>`
        : "";

      row.innerHTML = `
        <div class="left">
          <div class="name">${escapeHtml(product.name)}</div>
          <div class="meta">${escapeHtml(product.category.toUpperCase())} • ${money(product.price)} each</div>
          ${includesMini}
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
    showToast._t = setTimeout(() => el.toast.classList.remove("show"), 3400);
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(s) {
    // safe for attribute context
    return escapeHtml(s).replaceAll("`", "&#096;");
  }
})();
