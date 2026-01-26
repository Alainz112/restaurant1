// V4: Dark/Light toggle + menu images + scroll reveal. Edit content via JSON.
const fmt = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

function waLink(number, text) { return `https://wa.me/${number}?text=${encodeURIComponent(text)}`; }

function badgePill(text) {
  const span = document.createElement("span");
  span.className = "rounded-full bg-[#fbf7f1] px-2 py-1 text-xs font-semibold text-zinc-700 ring-1 ring-black/10 " +
                   "dark:bg-white/10 dark:text-zinc-200 dark:ring-white/10";
  span.textContent = text;
  return span;
}

function setTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  try { localStorage.setItem("theme", theme); } catch (e) {}
  updateThemeIcon();
}

function getSavedTheme() {
  try { return localStorage.getItem("theme"); } catch (e) { return null; }
}

function updateThemeIcon() {
  const icon = document.getElementById("themeIcon");
  if (!icon) return;
  const isDark = document.documentElement.classList.contains("dark");
  icon.textContent = isDark ? "☀️" : "🌙";
}

function setupThemeToggle(siteDefaultTheme) {
  const saved = getSavedTheme();
  if (saved !== "dark" && saved !== "light") {
    if (siteDefaultTheme === "dark" || siteDefaultTheme === "light") {
      document.documentElement.classList.toggle("dark", siteDefaultTheme === "dark");
    }
  } else {
    document.documentElement.classList.toggle("dark", saved === "dark");
  }
  updateThemeIcon();

  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "light" : "dark");
    });
  }
}

function setupScrollReveal() {
  const els = Array.from(document.querySelectorAll(".reveal, .reveal-stagger"));
  if (!("IntersectionObserver" in window)) {
    els.forEach(el => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => io.observe(el));
}

(async function init() {
  const [siteRes, menuRes] = await Promise.all([fetch("data/site.json"), fetch("data/menu.json")]);
  const site = await siteRes.json();
  const MENU = await menuRes.json();

  setupThemeToggle(site.defaultTheme);

  document.getElementById("year").textContent = new Date().getFullYear();
  document.title = `${site.brandName} — Cafe & Brunch`;
  document.querySelector('meta[name="description"]').setAttribute("content", site.subheadline || "");

  document.getElementById("brandNameTop").textContent = site.brandName;
  document.getElementById("brandNameAbout").textContent = site.brandName;
  document.getElementById("brandNameFooter").textContent = site.brandName;

  document.getElementById("navCta").textContent = site.navCta || "Book a Table";
  const badgeEl = document.getElementById("badge");
  badgeEl.childNodes[2].textContent = ` ${site.badge || site.hours || ""}`;
  document.getElementById("headline").textContent = site.headline || "";
  document.getElementById("subheadline").textContent = site.subheadline || "";

  const heroBg = document.getElementById("heroBg");
  heroBg.className = heroBg.className + ` bg-[url('${site.heroImage}')]`;

  document.getElementById("address").textContent = site.address || "";
  document.getElementById("hours").textContent = site.hours || "";
  document.getElementById("mapFrame").src = site.mapEmbedUrl || "";

  document.getElementById("waText").textContent = site.whatsappDisplay || "";
  document.getElementById("igText").textContent = site.instagram || "";
  document.getElementById("emailText").textContent = site.email || "";

  document.getElementById("whatsappCta").href = waLink(site.whatsappNumber, `Hi ${site.brandName}! I'd like to ask about your menu and booking.`);
  document.getElementById("whatsappCta2").href = waLink(site.whatsappNumber, `Hi ${site.brandName}! I'd like to book a table.`);
  document.getElementById("pdfMenuLink").href = site.pdfMenuUrl || "#";

  // Gallery (reveal cards)
  const galleryGrid = document.getElementById("galleryGrid");
  (site.galleryImages || []).forEach((src, idx) => {
    const wrap = document.createElement("div");
    wrap.className = "reveal group overflow-hidden rounded-3xl bg-white ring-1 ring-black/10 transition dark:bg-zinc-900 dark:ring-white/10";
    const img = document.createElement("img");
    img.className = "h-44 w-full object-cover transition duration-300 group-hover:scale-[1.03]";
    img.alt = `Gallery ${idx + 1}`;
    img.loading = "lazy";
    img.src = src;
    wrap.appendChild(img);
    galleryGrid.appendChild(wrap);
  });

  // Menu
  const categories = ["All", ...Array.from(new Set(MENU.map(m => m.category)))];
  let activeCat = "All";
  let query = "";

  const chipsWrap = document.getElementById("categoryChips");
  const grid = document.getElementById("menuGrid");
  const search = document.getElementById("menuSearch");

  function filteredMenu() {
    return MENU.filter(m => {
      const okCat = activeCat === "All" ? true : m.category === activeCat;
      const q = query.trim().toLowerCase();
      const okQ = !q ? true : (m.name.toLowerCase().includes(q) || (m.desc || "").toLowerCase().includes(q));
      return okCat && okQ;
    });
  }

  function renderChips() {
    chipsWrap.innerHTML = "";
    categories.forEach(cat => {
      const btn = document.createElement("button");
      btn.className = `rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-black/10 transition
        ${activeCat === cat ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950" : "bg-white text-zinc-800 hover:bg-[#fbf7f1] dark:bg-white/10 dark:text-white dark:hover:bg-white/15"}`;
      btn.textContent = cat;
      btn.onclick = () => { activeCat = cat; renderMenu(); renderChips(); };
      chipsWrap.appendChild(btn);
    });
  }

  function renderMenu() {
    grid.innerHTML = "";
    const items = filteredMenu();

    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "col-span-full rounded-3xl bg-white p-6 ring-1 ring-black/10 text-zinc-700 dark:bg-zinc-900 dark:ring-white/10 dark:text-zinc-300";
      empty.textContent = "No menu items found. Try another keyword.";
      grid.appendChild(empty);
      return;
    }

    items.forEach(item => {
      const card = document.createElement("button");
      card.className = "reveal text-left overflow-hidden rounded-3xl bg-white ring-1 ring-black/10 transition hover:-translate-y-[1px] hover:shadow-sm dark:bg-zinc-900 dark:ring-white/10";
      card.onclick = () => openModal(item);

      const img = document.createElement("img");
      img.className = "h-40 w-full object-cover";
      img.alt = item.name;
      img.loading = "lazy";
      img.src = item.image || "";
      card.appendChild(img);

      const body = document.createElement("div");
      body.className = "p-5";

      const top = document.createElement("div");
      top.className = "flex items-start justify-between gap-3";

      const left = document.createElement("div");
      const name = document.createElement("div");
      name.className = "text-lg font-bold text-zinc-900 dark:text-white";
      name.textContent = item.name;

      const desc = document.createElement("div");
      desc.className = "mt-1 text-sm text-zinc-700 dark:text-zinc-300";
      desc.textContent = item.desc || "";

      left.appendChild(name);
      left.appendChild(desc);

      const price = document.createElement("div");
      price.className = "shrink-0 text-sm font-semibold text-zinc-900 dark:text-white";
      price.textContent = fmt.format(item.price);

      top.appendChild(left);
      top.appendChild(price);

      const badges = document.createElement("div");
      badges.className = "mt-3 flex flex-wrap gap-2";
      (item.badges || []).filter(Boolean).forEach(b => badges.appendChild(badgePill(b)));

      const cat = document.createElement("div");
      cat.className = "mt-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400";
      cat.textContent = item.category;

      body.appendChild(top);
      body.appendChild(badges);
      body.appendChild(cat);

      card.appendChild(body);
      grid.appendChild(card);
    });

    setupScrollReveal();
  }

  // Modal
  const overlay = document.getElementById("modalOverlay");
  const closeBtn = document.getElementById("modalClose");

  function openModal(item) {
    document.body.classList.add("modal-open");
    overlay.classList.remove("hidden");
    overlay.classList.add("flex");

    document.getElementById("modalTitle").textContent = item.name;
    document.getElementById("modalDesc").textContent = item.desc || "";
    document.getElementById("modalPrice").textContent = fmt.format(item.price);

    const modalImg = document.getElementById("modalImage");
    modalImg.src = item.image || "";
    modalImg.alt = item.name;

    const badges = document.getElementById("modalBadges");
    badges.innerHTML = "";
    (item.badges || []).filter(Boolean).forEach(b => badges.appendChild(badgePill(b)));

    document.getElementById("modalOrder").href = waLink(site.whatsappNumber, `Hi ${site.brandName}! I'd like to order: ${item.name}. Is it available?`);
  }

  function closeModal() {
    document.body.classList.remove("modal-open");
    overlay.classList.add("hidden");
    overlay.classList.remove("flex");
  }

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  search.addEventListener("input", (e) => { query = e.target.value; renderMenu(); });

  renderChips();
  renderMenu();

  setupScrollReveal();
})().catch(err => {
  console.error(err);
  const grid = document.getElementById("menuGrid");
  if (grid) {
    grid.innerHTML = `<div class="col-span-full rounded-3xl bg-white p-6 ring-1 ring-red-500/30 text-red-700">
      Failed to load JSON data. Use VSCode Live Server for local preview, or deploy to Netlify/Vercel.
    </div>`;
  }
});
