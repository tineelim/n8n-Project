const qs = (s, r=document) => r.querySelector(s);

async function loadContent() {
  try {
    const res = await fetch('./content.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('content.json not found');
    const data = await res.json();
    renderSite(data);
  } catch (err) {
    console.error(err);
    qs('#about-bio').textContent = 'Unable to load content.json.';
  }
}

function renderSite(data) {
  const site = data.site || {};
  const about = data.about || {};
  const videos = data.videos || [];
  const graphics = data.graphics || [];
  const brands = data.brands || [];

  qs('#site-avatar').src = site.avatar || 'https://placehold.co/200x200?text=Avatar';
  qs('#site-cover').src = site.cover || 'https://placehold.co/1200x360?text=Cover';
  qs('#site-brand').textContent = site.brand || 'Your Name';
  qs('#site-brand-footer').textContent = site.brand || 'Your Name';
  document.title = (site.brand ? site.brand + ' — Portfolio' : 'Portfolio');

  const taglines = site.taglines || ['Video Editor & Motion Designer.'];
  if (window.Typed) {
    new Typed('#typed-tagline', { strings: taglines, typeSpeed: 35, backSpeed: 12, loop: true });
  } else {
    qs('#typed-tagline').textContent = taglines.join(' • ');
  }

  const s = site.socials || {};
  setHref('#link-instagram', s.instagram);
  setHref('#link-youtube', s.youtube);
  setHref('#link-behance', s.behance);
  setHref('#link-website', s.website);

  qs('#about-bio').textContent = about.bio || 'No bio yet.';

  const videoGrid = qs('#video-grid');
  videos.forEach(v => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="thumb"><span>Video</span></div>
      <div class="play-btn"><button>Play ▶</button></div>
    `;
    card.querySelector('button').onclick = () => {
      const embed = getEmbedUrl(v.url);
      if (!embed) return;
      card.innerHTML = `<iframe src="${embed}" allowfullscreen style="width:100%;height:100%;border:0;aspect-ratio:16/9"></iframe>`;
    };
    videoGrid.appendChild(card);
  });

  const gGrid = qs('#graphics-grid');
  graphics.forEach(g => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<img src="${g.src}" alt="${g.alt || ''}" class="thumb"><div class="caption">${g.caption || ''}</div>`;
    gGrid.appendChild(card);
  });

  const bGrid = qs('#brands-grid');
  brands.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Brand';
    bGrid.appendChild(img);
  });

  qs('#year').textContent = new Date().getFullYear();
}

function setHref(sel, href) {
  const a = qs(sel);
  if (!href) a.style.display = 'none'; else a.href = href;
}

function getEmbedUrl(url) {
  if (/youtu\.be|youtube\.com/.test(url)) {
    const id = (url.match(/(youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/) || [])[2];
    return id ? `https://www.youtube.com/embed/${id}?playsinline=1&rel=0&modestbranding=1` : '';
  }
  if (/vimeo\.com/.test(url)) {
    const id = (url.match(/vimeo\.com\/(?:video\/)?(\d+)/) || [])[1];
    return id ? `https://player.vimeo.com/video/${id}?dnt=1` : '';
  }
  if (/drive\.google\.com/.test(url)) {
    const id = (url.match(/\/d\/([A-Za-z0-9_-]+)/) || [])[1];
    return id ? `https://drive.google.com/file/d/${id}/preview` : '';
  }
  return '';
}

document.addEventListener('DOMContentLoaded', loadContent);
