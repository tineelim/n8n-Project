/* Data-driven portfolio template
 * - Loads ./content.json
 * - Renders hero, about, videos, graphics, brands
 * - Click-to-play embeds for YouTube, Vimeo, Google Drive
 */

const qs = (s, r=document) => r.querySelector(s);
const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));

async function loadContent() {
  try {
    const res = await fetch('./content.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('content.json not found');
    const data = await res.json();
    renderSite(data);
  } catch (err) {
    console.error(err);
    qs('#about-bio').textContent = 'Unable to load content.json. Place one next to index.html.';
  }
}

function renderSite(data) {
  const site = data.site || {};
  const about = data.about || {};
  const videos = Array.isArray(data.videos) ? data.videos : [];
  const graphics = Array.isArray(data.graphics) ? data.graphics : [];
  const brands = Array.isArray(data.brands) ? data.brands : [];

  // Header / hero
  qs('#site-avatar').src = site.avatar || 'https://placehold.co/200x200?text=Avatar';
  qs('#site-cover').src = site.cover || 'https://placehold.co/1200x360?text=Cover';
  qs('#site-brand').textContent = site.brand || 'Your Name';
  qs('#site-brand-footer').textContent = site.brand || 'Your Name';
  document.title = (site.brand ? site.brand + ' — Portfolio' : 'Portfolio');

  // Taglines with Typed.js (if available)
  const taglines = site.taglines && site.taglines.length ? site.taglines : ['Video Editor & Motion Designer.'];
  const tagEl = qs('#typed-tagline');
  if (window.Typed) {
    new Typed('#typed-tagline', {
      strings: taglines,
      typeSpeed: 35, backSpeed: 12, backDelay: 1400, loop: true, smartBackspace: true
    });
  } else {
    tagEl.textContent = taglines.join(' • ');
  }

  // Socials
  const s = site.socials || {};
  setHref('#link-instagram', s.instagram);
  setHref('#link-youtube', s.youtube);
  setHref('#link-behance', s.behance);
  setHref('#link-website', s.website);

  // About
  qs('#about-bio').textContent = (about.bio || '').trim() || 'Add your short bio in content.json → about.bio';

  // Videos
  const videoGrid = qs('#video-grid');
  videos.forEach(v => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.cat = v.cat || 'video';
    card.dataset.url = v.url || '';
    card.innerHTML = `
      <div class="thumb">
        <span>Video</span>
      </div>
      <div class="play-btn">
        <button aria-label="Play">Play ▶</button>
      </div>
    `;
    card.querySelector('.play-btn button').addEventListener('click', () => {
      const embed = getEmbedUrl(card.dataset.url);
      if (!embed) return;
      card.innerHTML = \`
        <iframe
          src="\${embed}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          referrerpolicy="strict-origin-when-cross-origin"
          style="width:100%;height:100%;border:0;aspect-ratio:16/9"
        ></iframe>\`;
    });
    videoGrid.appendChild(card);
  });

  // Graphics
  const gGrid = qs('#graphics-grid');
  graphics.forEach(g => {
    const card = document.createElement('div');
    card.className = 'card';
    const img = document.createElement('img');
    img.src = g.src || '';
    img.alt = g.alt || 'Graphic';
    img.className = 'thumb';
    card.appendChild(img);
    if (g.caption) {
      const cap = document.createElement('div');
      cap.className = 'caption';
      cap.textContent = g.caption;
      card.appendChild(cap);
    }
    gGrid.appendChild(card);
  });

  // Brands
  const bGrid = qs('#brands-grid');
  brands.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Brand';
    bGrid.appendChild(img);
  });

  // Year
  qs('#year').textContent = new Date().getFullYear();
}

function setHref(sel, href) {
  const a = qs(sel);
  if (!href) { a.style.display = 'none'; return; }
  a.href = href;
  a.style.display = '';
}

// ---- Embeds (no autoplay unless user clicks Play) ----
function getYouTubeId(rawUrl) {
  try {
    const u = new URL(rawUrl);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return u.pathname.split('/')[1] || '';
    if (host.endsWith('youtube.com')) {
      if (u.pathname.startsWith('/watch')) return u.searchParams.get('v') || '';
      if (u.pathname.startsWith('/embed/')) return u.pathname.split('/')[2] || '';
      if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2] || '';
    }
  } catch {}
  const m = String(rawUrl).match(/[?&]v=([\w-]{6,})|youtu\.be\/([\w-]{6,})|\/embed\/([\w-]{6,})|\/shorts\/([\w-]{6,})/);
  return m ? (m[1] || m[2] || m[3] || m[4] || '') : '';
}

function getEmbedUrl(url) {
  if (!url) return '';

  if (/youtube\.com|youtu\.be/.test(url)) {
    const id = getYouTubeId(url);
    if (!id) return '';
    const params = new URLSearchParams({
      playsinline: '1',
      rel: '0',
      modestbranding: '1'
    });
    return \`https://www.youtube.com/embed/\${id}?\${params.toString()}\`;
  }

  if (/vimeo\.com/.test(url)) {
    const m = url.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/);
    const id = m?.[1];
    if (!id) return '';
    const params = new URLSearchParams({ dnt: '1', title: '0', byline: '0', portrait: '0' });
    return \`https://player.vimeo.com/video/\${id}?\${params.toString()}\`;
  }

  if (/drive\.google\.com/.test(url)) {
    const id = url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1];
    return id ? \`https://drive.google.com/file/d/\${id}/preview\` : '';
  }

  return '';
}

document.addEventListener('DOMContentLoaded', loadContent);
