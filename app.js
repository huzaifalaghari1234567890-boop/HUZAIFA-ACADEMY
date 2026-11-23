/**
 * HUZAIFA ACADEMY - MULTI-PAGE APPLICATION ENGINE
 * Supports: index.html (Home), studio.html (Player), documentaries.html (Catalog),
 * wheel.html (Roulette), and about.html (About & Community).
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  const state = {
    theme: localStorage.getItem('huzaifa_theme') || 'dark',
    soundEnabled: localStorage.getItem('huzaifa_sound') !== 'false',
    currentCategory: 'all',
    searchQuery: '',
    currentSort: 'newest',
    currentStudioVideoId: getQueryParam('v') || '2QiTjhlRGss',
    watchLaterList: JSON.parse(localStorage.getItem('huzaifa_watch_later') || '[]'),
    filteredVideos: [...VIDEOS_DATA],
    theaterActive: false
  };

  // Common Header & Nav Elements
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  const themeToggleMobile = document.getElementById('theme-toggle-mobile');
  const themeIconMobile = document.getElementById('theme-icon-mobile');
  const themeTextMobile = document.getElementById('theme-text-mobile');
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundIcon = document.getElementById('sound-icon');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavClose = document.getElementById('mobile-nav-close');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  const toastContainer = document.getElementById('toast-container');

  // Studio Player Page Elements (studio.html)
  const studioIframeWrap = document.getElementById('studio-iframe-wrap');
  const studioTitle = document.getElementById('studio-now-playing-title');
  const studioCategory = document.getElementById('studio-category-badge');
  const studioDuration = document.getElementById('studio-duration-text');
  const studioViews = document.getElementById('studio-views-text');
  const studioSynopsis = document.getElementById('studio-synopsis-text');
  const studioYoutubeLink = document.getElementById('studio-youtube-link');
  const studioCommentLink = document.getElementById('studio-comment-link');
  const studioShareBtn = document.getElementById('studio-share-btn');
  const studioTheaterBtn = document.getElementById('studio-theater-btn');
  const studioQueueList = document.getElementById('studio-queue-list');
  const cinemaStageSection = document.getElementById('cinema-stage');

  // Catalog Page Elements (documentaries.html & index.html)
  const videoGrid = document.getElementById('video-grid');
  const resultsCount = document.getElementById('results-count');
  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const sortSelect = document.getElementById('sort-select');
  const categoryPillsContainer = document.getElementById('category-pills');

  // Mystery Wheel Elements (wheel.html)
  const rouletteBtn = document.getElementById('roulette-btn');
  const rouletteDisplay = document.getElementById('roulette-display');

  // =========================================================================
  // INITIALIZATION
  // =========================================================================
  function init() {
    initTheme();
    initSound();
    initMobileNav();
    initScrollEffects();
    initNewsletter();

    // Page-specific modules (conditionally loaded)
    if (document.getElementById('hero-canvas')) initConstellationCanvas();
    if (document.getElementById('typewriter-text')) initTypewriter();
    if (document.getElementById('featured-spotlight-card')) renderFeaturedSpotlight();
    if (studioIframeWrap) initStudioStage();
    if (videoGrid) {
      renderCategoryPills();
      applyFilterAndSort();
    }
    if (rouletteBtn) initRoulette();
    animateStatCounters();
  }

  // =========================================================================
  // UTILITY: QUERY PARAMETER READER
  // =========================================================================
  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  // =========================================================================
  // WEB AUDIO SYNTHESIZER
  // =========================================================================
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playClickSound() {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (_) {}
  }

  function playChimeSound() {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.35);
      });
    } catch (_) {}
  }

  function initSound() {
    updateSoundUI();
    soundToggleBtn?.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      localStorage.setItem('huzaifa_sound', state.soundEnabled);
      updateSoundUI();
      if (state.soundEnabled) {
        playChimeSound();
        showToast('Sound effects enabled 🔊', 'fa-volume-high');
      } else {
        showToast('Sound effects muted 🔇', 'fa-volume-xmark');
      }
    });
  }

  function updateSoundUI() {
    if (!soundIcon || !soundToggleBtn) return;
    if (state.soundEnabled) {
      soundIcon.className = 'fa-solid fa-volume-high';
      soundToggleBtn.title = 'Sound Effects: ON (Click to Mute)';
    } else {
      soundIcon.className = 'fa-solid fa-volume-xmark';
      soundToggleBtn.title = 'Sound Effects: OFF (Click to Enable)';
    }
  }

  // =========================================================================
  // THEME SWITCHER
  // =========================================================================
  function initTheme() {
    applyTheme(state.theme, false);
    themeToggleBtn?.addEventListener('click', toggleTheme);
    themeToggleMobile?.addEventListener('click', toggleTheme);
  }

  function toggleTheme() {
    playClickSound();
    const nextTheme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme, true);
  }

  function applyTheme(theme, showFeedback = false) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('huzaifa_theme', theme);

    if (theme === 'light') {
      if (themeIcon) themeIcon.className = 'fa-solid fa-moon';
      if (themeToggleBtn) themeToggleBtn.title = 'Switch to Dark Mode';
      if (themeIconMobile) themeIconMobile.className = 'fa-solid fa-moon';
      if (themeTextMobile) themeTextMobile.textContent = 'Dark Mode';
      if (showFeedback) showToast('Daylight Theme activated ☀️', 'fa-sun');
    } else {
      if (themeIcon) themeIcon.className = 'fa-solid fa-sun';
      if (themeToggleBtn) themeToggleBtn.title = 'Switch to Light Mode';
      if (themeIconMobile) themeIconMobile.className = 'fa-solid fa-sun';
      if (themeTextMobile) themeTextMobile.textContent = 'Light Mode';
      if (showFeedback) showToast('Cinematic Dark Theme activated 🌙', 'fa-moon');
    }
  }

  // =========================================================================
  // HERO CONSTELLATION CANVAS (INDEX.HTML)
  // =========================================================================
  function initConstellationCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles = [];
    const particleCount = Math.min(45, Math.floor((width * height) / 19000));
    const mouse = { x: null, y: null, maxDistance: 120 };

    window.addEventListener('resize', () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    });

    window.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.maxDistance) {
            const force = (mouse.maxDistance - dist) / mouse.maxDistance;
            this.x -= (dx / dist) * force * 1.5;
            this.y -= (dy / dist) * force * 1.5;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = state.theme === 'light' ? 'rgba(2, 132, 199, 0.45)' : 'rgba(0, 242, 254, 0.5)';
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    function animate() {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 105) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const alpha = 1 - dist / 105;
            ctx.strokeStyle = state.theme === 'light'
              ? `rgba(2, 132, 199, ${alpha * 0.2})`
              : `rgba(0, 242, 254, ${alpha * 0.22})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    }

    animate();
  }

  // =========================================================================
  // TYPEWRITER ANIMATION (HERO TAGLINE CYCLER)
  // =========================================================================
  function initTypewriter() {
    const el = document.getElementById('typewriter-text');
    if (!el) return;

    const phrases = [
      '5,000-Year Stonehenge Enigma',
      'The Great Pyramid Construction Secrets',
      'MH370 Flight Disappearance',
      'Apollo 11 Moon Landing Alarm',
      'Chernobyl Ghost City Secrets',
      'Prehistoric Dinosaurs 165M Years',
      'Bizarre Blind Ocean Creatures',
      'Titanic Unsinkable Ship Tragedy'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 80;

    function type() {
      const current = phrases[phraseIndex];

      if (isDeleting) {
        el.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 35;
      } else {
        el.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 75;
      }

      if (!isDeleting && charIndex === current.length) {
        typingSpeed = 2200;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 350;
      }

      setTimeout(type, typingSpeed);
    }

    type();
  }

  // =========================================================================
  // CINEMA STUDIO PLAYER (STUDIO.HTML) - DIRECT YOUTUBE VIEWS
  // =========================================================================
  function initStudioStage() {
    renderStudioQueue();
    loadStudioVideo(state.currentStudioVideoId, false);

    studioShareBtn?.addEventListener('click', () => {
      const video = VIDEOS_DATA.find(v => v.id === state.currentStudioVideoId);
      if (video) shareVideo(video);
    });

    studioTheaterBtn?.addEventListener('click', toggleTheaterMode);
  }

  function loadStudioVideo(videoId, autoPlay = true) {
    const video = VIDEOS_DATA.find(v => v.id === videoId);
    if (!video || !studioIframeWrap) return;

    state.currentStudioVideoId = videoId;

    // Official YouTube iframe embed with origin and JS API enabled
    const origin = encodeURIComponent(window.location.origin || 'http://localhost');
    const playParam = autoPlay ? 'autoplay=1&' : '';
    const embedUrl = `https://www.youtube-nocookie.com/embed/${video.id}?${playParam}enablejsapi=1&origin=${origin}&rel=0&modestbranding=1`;

    studioIframeWrap.innerHTML = `
      <iframe 
        src="${embedUrl}" 
        title="${escapeHtml(video.title)}" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        allowfullscreen>
      </iframe>
    `;

    if (studioTitle) studioTitle.textContent = video.title;
    if (studioCategory) studioCategory.textContent = video.categoryLabel;
    if (studioDuration) studioDuration.innerHTML = `<i class="fa-regular fa-clock"></i> ${video.duration}`;
    if (studioViews) studioViews.innerHTML = `<i class="fa-solid fa-eye"></i> ${video.viewsFormatted}`;
    if (studioSynopsis) studioSynopsis.textContent = video.synopsis;

    if (studioYoutubeLink) studioYoutubeLink.href = `https://www.youtube.com/watch?v=${video.id}`;
    if (studioCommentLink) studioCommentLink.href = `https://www.youtube.com/watch?v=${video.id}#comments`;

    // Highlight active item in queue
    document.querySelectorAll('.queue-item').forEach(item => {
      if (item.getAttribute('data-id') === videoId) {
        item.classList.add('active');
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        item.classList.remove('active');
      }
    });

    // Update URL parameter without reload
    const newUrl = `${window.location.pathname}?v=${videoId}`;
    window.history.replaceState({ path: newUrl }, '', newUrl);
  }

  function renderStudioQueue() {
    if (!studioQueueList) return;
    studioQueueList.innerHTML = '';

    VIDEOS_DATA.forEach(video => {
      const item = document.createElement('div');
      item.className = `queue-item ${video.id === state.currentStudioVideoId ? 'active' : ''}`;
      item.setAttribute('data-id', video.id);

      item.innerHTML = `
        <div class="queue-thumb">
          <img src="${video.thumbnail}" alt="${escapeHtml(video.title)}">
          <div class="queue-item-playing-icon" style="${video.id === state.currentStudioVideoId ? 'display:flex;' : 'display:none;'}">
            <i class="fa-solid fa-circle-play"></i>
          </div>
        </div>
        <div class="queue-info">
          <h5 class="queue-title">${escapeHtml(video.title)}</h5>
          <div class="queue-meta">
            <span><i class="fa-regular fa-clock"></i> ${video.duration}</span>
            <span><i class="fa-solid fa-eye"></i> ${video.viewsFormatted}</span>
          </div>
        </div>
      `;

      item.addEventListener('click', () => {
        playClickSound();
        loadStudioVideo(video.id, true);
        showToast(`Now Streaming: "${video.title}"`, 'fa-circle-play');
      });

      studioQueueList.appendChild(item);
    });
  }

  function toggleTheaterMode() {
    playClickSound();
    state.theaterActive = !state.theaterActive;
    if (state.theaterActive) {
      document.body.classList.add('theater-mode-active');
      cinemaStageSection?.classList.add('theater-highlight');
      if (studioTheaterBtn) {
        studioTheaterBtn.innerHTML = '<i class="fa-solid fa-lightbulb"></i> Normal Lights';
        studioTheaterBtn.style.borderColor = 'var(--accent-gold)';
        studioTheaterBtn.style.color = 'var(--accent-gold)';
      }
      showToast('Theater Lights Dimmed 🎬', 'fa-lightbulb');
    } else {
      document.body.classList.remove('theater-mode-active');
      cinemaStageSection?.classList.remove('theater-highlight');
      if (studioTheaterBtn) {
        studioTheaterBtn.innerHTML = '<i class="fa-regular fa-lightbulb"></i> Theater Lights';
        studioTheaterBtn.style.borderColor = '';
        studioTheaterBtn.style.color = '';
      }
    }
  }

  // =========================================================================
  // FEATURED SPOTLIGHT CARD (INDEX.HTML)
  // =========================================================================
  function renderFeaturedSpotlight() {
    const spotlightCard = document.getElementById('featured-spotlight-card');
    if (!spotlightCard) return;

    const featured = VIDEOS_DATA.find(v => v.isFeatured) || VIDEOS_DATA[0];

    spotlightCard.innerHTML = `
      <div class="spotlight-header">
        <span class="spotlight-badge">
          <span class="pulse-dot"></span>
          Featured Documentary
        </span>
        <span style="font-size: 0.8rem; color: var(--secondary); font-weight: 700;">
          <i class="fa-solid fa-sparkles"></i> 1080p Full HD
        </span>
      </div>

      <div class="spotlight-thumb-wrap" id="spotlight-thumb-action">
        <img src="${featured.thumbnailHd}" alt="${featured.title}" class="spotlight-thumb" onerror="this.src='${featured.thumbnail}'">
        <div class="spotlight-play-btn" title="Watch in Studio Player">
          <i class="fa-solid fa-play"></i>
        </div>
        <span class="spotlight-duration"><i class="fa-regular fa-clock"></i> ${featured.duration}</span>
      </div>

      <div class="spotlight-info">
        <h3 class="spotlight-title">${featured.title}</h3>
        <p class="spotlight-desc">${featured.synopsis}</p>
        
        <div class="spotlight-footer">
          <div style="display:flex; align-items:center; gap:12px;">
            <span><i class="fa-solid fa-eye"></i> ${featured.viewsFormatted}</span>
            <span><i class="fa-solid fa-calendar-days"></i> ${featured.timeAgo}</span>
          </div>
          <a href="studio.html?v=${featured.id}" class="spotlight-watch-action">
            <span>Play in Studio</span>
            <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </div>
    `;

    document.getElementById('spotlight-thumb-action')?.addEventListener('click', () => {
      window.location.href = `studio.html?v=${featured.id}`;
    });
  }

  // =========================================================================
  // CATEGORY PILLS (DOCUMENTARIES.HTML)
  // =========================================================================
  function renderCategoryPills() {
    if (!categoryPillsContainer) return;
    categoryPillsContainer.innerHTML = '';

    CATEGORIES.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `cat-pill ${cat.id === state.currentCategory ? 'active' : ''}`;
      btn.setAttribute('data-category', cat.id);
      btn.innerHTML = `
        <i class="fa-solid ${cat.icon}"></i>
        <span>${cat.name}</span>
        <span class="cat-badge-count">${getCategoryCount(cat.id)}</span>
      `;

      btn.addEventListener('click', () => {
        playClickSound();
        document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        state.currentCategory = cat.id;
        applyFilterAndSort();
      });

      categoryPillsContainer.appendChild(btn);
    });
  }

  function getCategoryCount(catId) {
    if (catId === 'all') return VIDEOS_DATA.length;
    return VIDEOS_DATA.filter(v => v.category === catId).length;
  }

  // =========================================================================
  // FILTER & SORT ENGINE
  // =========================================================================
  function applyFilterAndSort() {
    let result = [...VIDEOS_DATA];

    if (state.currentCategory !== 'all') {
      result = result.filter(v => v.category === state.currentCategory);
    }

    if (state.searchQuery.trim() !== '') {
      const q = state.searchQuery.toLowerCase().trim();
      result = result.filter(v => 
        v.title.toLowerCase().includes(q) ||
        v.synopsis.toLowerCase().includes(q) ||
        v.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    switch (state.currentSort) {
      case 'newest':
        break;
      case 'views':
        result.sort((a, b) => b.views - a.views);
        break;
      case 'duration-desc':
        result.sort((a, b) => b.durationSec - a.durationSec);
        break;
      case 'duration-asc':
        result.sort((a, b) => a.durationSec - b.durationSec);
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    state.filteredVideos = result;
    renderVideoGrid();
  }

  // =========================================================================
  // RENDER VIDEO GRID (DOCUMENTARIES.HTML)
  // =========================================================================
  function renderVideoGrid() {
    if (!videoGrid) return;
    videoGrid.innerHTML = '';

    if (resultsCount) {
      resultsCount.textContent = `Showing ${state.filteredVideos.length} of ${VIDEOS_DATA.length} Documentaries`;
    }

    if (state.filteredVideos.length === 0) {
      videoGrid.innerHTML = `
        <div class="no-results">
          <i class="fa-solid fa-compass"></i>
          <h3>No Documentaries Found</h3>
          <p>We couldn't find any videos matching "${escapeHtml(state.searchQuery)}". Try resetting your filters.</p>
          <button class="btn-secondary" id="reset-filters-btn">
            <i class="fa-solid fa-rotate-left"></i> Reset Search & Filters
          </button>
        </div>
      `;
      document.getElementById('reset-filters-btn')?.addEventListener('click', () => {
        playClickSound();
        state.searchQuery = '';
        state.currentCategory = 'all';
        if (searchInput) searchInput.value = '';
        if (searchClearBtn) searchClearBtn.classList.remove('visible');
        renderCategoryPills();
        applyFilterAndSort();
      });
      return;
    }

    state.filteredVideos.forEach(video => {
      const isSaved = state.watchLaterList.includes(video.id);
      const card = document.createElement('article');
      card.className = 'video-card';
      card.setAttribute('data-id', video.id);

      card.innerHTML = `
        <div class="card-glare"></div>
        <div class="card-thumb-wrap" data-action="play-studio">
          <img src="${video.thumbnailHd}" alt="${escapeHtml(video.title)}" class="card-thumb-img" loading="lazy" onerror="this.src='${video.thumbnail}'">
          <div class="card-play-overlay">
            <div class="card-play-icon">
              <i class="fa-solid fa-play"></i>
            </div>
          </div>
          <span class="card-badge-top ${video.badge.includes('POPULAR') ? 'badge-popular' : video.badge.includes('PREMIERE') ? 'badge-featured' : ''}">
            ${video.badge}
          </span>
          <span class="card-duration-badge">
            <i class="fa-regular fa-clock"></i> ${video.duration}
          </span>
        </div>

        <div class="card-body">
          <div class="card-meta-row">
            <span class="card-cat-tag"><i class="fa-solid fa-tag"></i> ${video.categoryLabel}</span>
            <span class="meta-dot"></span>
            <span><i class="fa-solid fa-eye"></i> ${video.viewsFormatted}</span>
            <span class="meta-dot"></span>
            <span>${video.timeAgo}</span>
          </div>

          <h3 class="card-title" data-action="play-studio" title="${escapeHtml(video.title)}">
            ${escapeHtml(video.title)}
          </h3>

          <p class="card-synopsis">
            ${escapeHtml(video.synopsis)}
          </p>

          <div class="card-tags">
            ${video.tags.slice(0, 3).map(t => `<span class="tag-pill">#${escapeHtml(t)}</span>`).join('')}
          </div>

          <div class="card-footer">
            <a href="studio.html?v=${video.id}" class="btn-card-watch">
              <i class="fa-solid fa-play"></i> Watch in Studio
            </a>
            <div class="card-action-icons">
              <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank" rel="noopener noreferrer" class="icon-btn" title="Open in YouTube">
                <i class="fa-brands fa-youtube" style="color: #ff0033;"></i>
              </a>
              <button class="icon-btn ${isSaved ? 'saved' : ''}" data-action="bookmark" title="${isSaved ? 'Remove from Watch Later' : 'Save to Watch Later'}">
                <i class="fa-${isSaved ? 'solid' : 'regular'} fa-bookmark"></i>
              </button>
              <button class="icon-btn" data-action="share" title="Share Video">
                <i class="fa-solid fa-share-nodes"></i>
              </button>
            </div>
          </div>
        </div>
      `;

      // 3D Tilt Interaction
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
        card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });

      // Click Events
      card.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('[data-action]');
        if (!targetBtn) return;
        const action = targetBtn.getAttribute('data-action');

        if (action === 'play-studio') {
          window.location.href = `studio.html?v=${video.id}`;
        } else if (action === 'bookmark') {
          playClickSound();
          toggleWatchLater(video.id, targetBtn);
        } else if (action === 'share') {
          playClickSound();
          shareVideo(video);
        }
      });

      videoGrid.appendChild(card);
    });
  }

  // =========================================================================
  // WATCH LATER / BOOKMARK SYSTEM
  // =========================================================================
  function toggleWatchLater(videoId, btnElement) {
    const index = state.watchLaterList.indexOf(videoId);
    let message = '';

    if (index === -1) {
      state.watchLaterList.push(videoId);
      message = 'Saved to your Watch Later list!';
      if (btnElement) {
        btnElement.classList.add('saved');
        btnElement.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
      }
    } else {
      state.watchLaterList.splice(index, 1);
      message = 'Removed from Watch Later';
      if (btnElement) {
        btnElement.classList.remove('saved');
        btnElement.innerHTML = '<i class="fa-regular fa-bookmark"></i>';
      }
    }

    localStorage.setItem('huzaifa_watch_later', JSON.stringify(state.watchLaterList));
    showToast(message, 'fa-bookmark');
  }

  // =========================================================================
  // SHARE VIDEO LOGIC
  // =========================================================================
  function shareVideo(video) {
    const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: `Watch "${video.title}" on Huzaifa Academy YouTube Channel:`,
        url: videoUrl
      }).catch(() => copyToClipboard(videoUrl));
    } else {
      copyToClipboard(videoUrl);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Video link copied to clipboard!', 'fa-link');
    }).catch(() => {
      prompt('Copy this link:', text);
    });
  }

  // =========================================================================
  // MYSTERY ROULETTE (WHEEL.HTML)
  // =========================================================================
  function initRoulette() {
    if (!rouletteBtn || !rouletteDisplay) return;

    rouletteBtn.addEventListener('click', () => {
      playClickSound();
      rouletteBtn.disabled = true;
      rouletteDisplay.innerHTML = `
        <div class="roulette-placeholder">
          <i class="fa-solid fa-spinner fa-spin" style="font-size: 3rem; color: var(--secondary);"></i>
          <h4 style="margin-top: 14px; font-size: 1.2rem;">Searching Enigmas...</h4>
          <p style="font-size: 0.88rem; color: var(--text-muted);">Consulting the Huzaifa Academy world archives</p>
        </div>
      `;

      setTimeout(() => {
        playChimeSound();
        const randomIndex = Math.floor(Math.random() * VIDEOS_DATA.length);
        const picked = VIDEOS_DATA[randomIndex];

        rouletteDisplay.innerHTML = `
          <div style="display: flex; gap: 18px; align-items: center;">
            <div style="width: 140px; aspect-ratio: 16/9; border-radius: var(--radius-sm); overflow: hidden; flex-shrink: 0;">
              <img src="${picked.thumbnail}" alt="${escapeHtml(picked.title)}" style="width:100%; height:100%; object-fit: cover;">
            </div>
            <div>
              <span style="font-size: 0.75rem; color: var(--secondary); font-weight: 700; text-transform: uppercase;">
                ${picked.categoryLabel} • ${picked.duration}
              </span>
              <h4 style="font-size: 1.05rem; margin: 4px 0 6px; color: var(--heading-color);">${picked.title}</h4>
              <p style="font-size: 0.82rem; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${picked.synopsis}
              </p>
            </div>
          </div>
          <div style="display: flex; gap: 12px; margin-top: 14px;">
            <a href="studio.html?v=${picked.id}" class="btn-primary" style="padding: 10px 20px; font-size: 0.88rem;">
              <i class="fa-solid fa-play"></i> Watch in Studio Player
            </a>
            <button class="btn-secondary" style="padding: 10px 18px; font-size: 0.88rem;" id="roulette-spin-again">
              <i class="fa-solid fa-shuffle"></i> Spin Another
            </button>
          </div>
        `;

        document.getElementById('roulette-spin-again')?.addEventListener('click', () => {
          rouletteBtn.click();
        });

        rouletteBtn.disabled = false;
        showToast(`Mystery Unlocked: ${picked.categoryLabel}!`, 'fa-dice');
      }, 700);
    });
  }

  // =========================================================================
  // SEARCH & SORT EVENT HANDLERS
  // =========================================================================
  searchInput?.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    if (state.searchQuery.length > 0) {
      searchClearBtn?.classList.add('visible');
    } else {
      searchClearBtn?.classList.remove('visible');
    }
    applyFilterAndSort();
  });

  searchClearBtn?.addEventListener('click', () => {
    playClickSound();
    searchInput.value = '';
    state.searchQuery = '';
    searchClearBtn.classList.remove('visible');
    applyFilterAndSort();
  });

  sortSelect?.addEventListener('change', (e) => {
    playClickSound();
    state.currentSort = e.target.value;
    applyFilterAndSort();
  });

  // =========================================================================
  // SCROLL & NAVBAR DYNAMICS
  // =========================================================================
  function initScrollEffects() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        navbar?.classList.add('scrolled');
      } else {
        navbar?.classList.remove('scrolled');
      }
    });
  }

  // =========================================================================
  // MOBILE NAVIGATION
  // =========================================================================
  function initMobileNav() {
    const openMenu = () => {
      playClickSound();
      mobileNav?.classList.add('open');
      drawerBackdrop?.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      mobileNav?.classList.remove('open');
      drawerBackdrop?.classList.remove('active');
      document.body.style.overflow = '';
    };

    menuToggle?.addEventListener('click', openMenu);
    mobileNavClose?.addEventListener('click', closeMenu);
    drawerBackdrop?.addEventListener('click', closeMenu);

    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // =========================================================================
  // NEWSLETTER & SUBSCRIBER NOTIFICATION
  // =========================================================================
  function initNewsletter() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletter-email');
      const email = emailInput?.value.trim();

      if (email && email.includes('@')) {
        playChimeSound();
        showToast('Welcome to Huzaifa Academy! You will receive premiere alerts.', 'fa-bell');
        emailInput.value = '';
      }
    });
  }

  // =========================================================================
  // STAT COUNTER ANIMATION
  // =========================================================================
  function animateStatCounters() {
    const statCards = document.querySelectorAll('.stat-number[data-count]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'), 10);
          const suffix = el.getAttribute('data-suffix') || '';
          let count = 0;
          const speed = Math.ceil(target / 40);

          const timer = setInterval(() => {
            count += speed;
            if (count >= target) {
              el.textContent = target.toLocaleString() + suffix;
              clearInterval(timer);
            } else {
              el.textContent = count.toLocaleString() + suffix;
            }
          }, 30);

          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    statCards.forEach(card => observer.observe(card));
  }

  // =========================================================================
  // TOAST NOTIFICATIONS
  // =========================================================================
  function showToast(message, iconClass = 'fa-circle-check') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid ${iconClass}" style="color: var(--secondary);"></i> <span>${escapeHtml(message)}</span>`;

    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Start engine
  init();
});
