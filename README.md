# Restaurant/Cafe Landing Template (V3 — Images per item + Scroll reveal)

New in V3:
- Menu cards support per-item images (edit `data/menu.json` → `image`)
- Scroll reveal animations using IntersectionObserver (no libraries)

## Edit content
- `data/site.json` : brand info, hero/gallery paths, links
- `data/menu.json` : menu items (name, category, price, desc, badges, image path)

## Images
Put images here:
- `assets/images/hero.jpg`
- `assets/images/gallery-1.jpg` ... `gallery-4.jpg`
- `assets/images/menu/<item>.jpg` (or update paths in `menu.json`)

## Deploy
Vercel: Framework Other • Build Command None • Output Directory .
Netlify: Build command empty • Publish directory .

Local preview: use VSCode “Live Server”.
