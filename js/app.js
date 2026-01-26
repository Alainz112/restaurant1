// Loads data/site.json and data/menu.json then renders UI.
// Edit content via JSON files (no code changes needed).

const fmt = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

function waLink(number, text) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

function badgePill(text) {
  const span = document.createElement("span");
  span.className = "rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-200";
  span.textContent = text;
  return span;
}

(async function init() {
  const [siteRes, menuRes] = await Promise.all([
    fetch("data/site.json"),
    fetch("data/menu.json")
  ]);

  const site = await siteRes.json();
  const MENU = await menuRes.json();

  // Year
  document.getElementById("year").textContent = new Date().getFullYear();

  // Brand & text
  document.title = `${site.brandName} — Restaurant/Cafe`;
  document.querySelector('meta[name="description"]').setAttribute("content", site.description || "Landing page restoran/cafe.");

  document.getElementById("brandNameTop").textContent = site.brandName;
  document.getElementById("brandNameAbout").textContent = site.brandName;
  document.getElementById("brandNameFooter").textContent = site.brandName;

  document.getElementById("tagline").textContent = site.tagline;
  document.getElementById("desc").textContent = site.description;

  document.getElementById("hoursPill").lastChild.textContent = ` ${site.hours}`;
  document.getElementById("address").textContent = site.address;
  document.getElementById("hours").textContent = site.hours;

  // Hero background
  const heroBg = document.getElementById("heroBg");
  heroBg.className = heroBg.className + ` bg-[url('${site.heroImage}')]`;

  // Map
  document.getElementById("mapFrame").src = site.mapEmbedUrl;

  // Contact
  document.getElementById("waText").textContent = site.whatsappDisplay;
  document.getElementById("igText").textContent = site.instagram;
  document.getElementById("emailText").textContent = site.email;

  // CTA buttons
  document.getElementById("whatsappCta").href = waLink(site.whatsappNumber, `Halo ${site.brandName}! Mau tanya jam buka & reservasi.`);
  document.getElementById("whatsappCta2").href = waLink(site.whatsappNumber, `Halo ${site.brandName}! Mau reservasi meja.`);
  document.getElementById("pdfMenuLink").href = site.pdfMenuUrl || "#";

  // Gallery
  const galleryGrid = document.getElementById("galleryGrid");
  (site.galleryImages || []).forEach((src, idx) => {
    const img = document.createElement("img");
    img.className = "h-44 w-full rounded-2xl object-cover border border-white/10";
    img.alt = `Gallery ${idx + 1}`;
    img.src = src;
    galleryGrid.appendChild(img);
  });

  // Menu rendering
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
      btn.className = `rounded-full px-4 py-2 text-sm border transition
        ${activeCat === cat ? "bg-white text-zinc-950 border-white" : "bg-white/5 text-zinc-200 border-white/10 hover:bg-white/10"}`;
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
      empty.className = "col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-zinc-300";
      empty.textContent = "Tidak ada menu yang cocok. Coba kata kunci lain.";
      grid.appendChild(empty);
      return;
    }

    items.forEach(item => {
      const card = document.createElement("button");
      card.className = "text-left rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition";
      card.onclick = () => openModal(item);

      const top = document.createElement("div");
      top.className = "flex items-start justify-between gap-3";

      const left = document.createElement("div");
      const name = document.createElement("div");
      name.className = "text-lg font-semibold text-white";
      name.textContent = item.name;

      const desc = document.createElement("div");
      desc.className = "mt-1 text-sm text-zinc-300";
      desc.textContent = item.desc || "";

      left.appendChild(name);
      left.appendChild(desc);

      const price = document.createElement("div");
      price.className = "shrink-0 text-sm font-semibold text-white";
      price.textContent = fmt.format(item.price);

      top.appendChild(left);
      top.appendChild(price);

      const badges = document.createElement("div");
      badges.className = "mt-3 flex flex-wrap gap-2";
      (item.badges || []).filter(Boolean).forEach(b => badges.appendChild(badgePill(b)));

      const cat = document.createElement("div");
      cat.className = "mt-3 text-xs text-zinc-400";
      cat.textContent = item.category;

      card.appendChild(top);
      card.appendChild(badges);
      card.appendChild(cat);
      grid.appendChild(card);
    });
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

    const badges = document.getElementById("modalBadges");
    badges.innerHTML = "";
    (item.badges || []).filter(Boolean).forEach(b => badges.appendChild(badgePill(b)));

    const orderBtn = document.getElementById("modalOrder");
    orderBtn.href = waLink(site.whatsappNumber, `Halo ${site.brandName}! Saya mau pesan: ${item.name}. Bisa info ketersediaan?`);
  }

  function closeModal() {
    document.body.classList.remove("modal-open");
    overlay.classList.add("hidden");
    overlay.classList.remove("flex");
  }

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  // Search
  search.addEventListener("input", (e) => { query = e.target.value; renderMenu(); });

  renderChips();
  renderMenu();
})().catch(err => {
  console.error(err);
  const grid = document.getElementById("menuGrid");
  if (grid) {
    grid.innerHTML = `<div class="col-span-full rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
      Gagal load data JSON. Kalau kamu buka file ini langsung (double click), coba pakai Live Server (VSCode) atau deploy ke Netlify/Vercel.
    </div>`;
  }
});
