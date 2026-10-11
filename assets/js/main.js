(() => {
  'use strict';
  const controls = document.querySelector('.publication-controls');
  const filters = [...document.querySelectorAll('[data-filter]')];
  const papers = [...document.querySelectorAll('.publication-item')];
  const search = document.querySelector('#publication-search');
  const resetSearch = document.querySelector('#reset-search');
  const status = document.querySelector('#publication-status');
  const empty = document.querySelector('.empty-state');

  if (controls && search && papers.length && resetSearch && status && empty) {
    let activeFilter = 'all';

    function filterPapers() {
      const terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      let count = 0;
      for (const paper of papers) {
        const matches = (activeFilter === 'all' || paper.dataset.category === activeFilter) && terms.every(term => paper.dataset.search.includes(term));
        paper.hidden = !matches;
        if (matches) count++;
      }
      filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === activeFilter)));
      status.textContent = `${count} ${count === 1 ? 'publication' : 'publications'}${count === papers.length ? '' : ` of ${papers.length}`}`;
      empty.hidden = count !== 0;
    }

    function resetFilters() {
      activeFilter = 'all';
      search.value = '';
      filterPapers();
    }

    filters.forEach(button => button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      filterPapers();
    }));
    search.addEventListener('input', filterPapers);
    resetSearch.addEventListener('click', () => { resetFilters(); search.focus(); });
    controls.hidden = false;
    status.hidden = false;
    filterPapers();

    // Publication links reveal their paper, even with a filter active.
    function revealLinkedPaper(hash) {
      if (!hash.startsWith('#pub-')) return;
      const target = document.getElementById(hash.slice(1));
      if (target?.hidden) resetFilters();
    }
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href^="#pub-"]');
      if (link) revealLinkedPaper(link.getAttribute('href'));
    });
    window.addEventListener('hashchange', () => {
      revealLinkedPaper(window.location.hash);
      const target = document.getElementById(window.location.hash.slice(1));
      if (target?.classList.contains('publication-item')) target.scrollIntoView({ block: 'start' });
    });
    revealLinkedPaper(window.location.hash);
  }

  // A small visual sketch of multimodal haptic feedback.
  const playground = document.querySelector('.playground');
  if (playground) {
    const modes = [
      { id: 'vibrotactile', label: 'Vibrotactile', caption: 'Touch has patterns.' },
      { id: 'thermal', label: 'Thermal', caption: 'Touch has temperature.' },
      { id: 'kinesthetic', label: 'Kinesthetic', caption: 'Touch has motion.' }
    ];
    const chips = [...playground.querySelectorAll('[data-haptic]')];
    let modeIndex = 0;
    let pulseTimer;
    function showMode(index) {
      modeIndex = index;
      const mode = modes[index];
      playground.dataset.mode = mode.id;
      chips.forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.haptic === mode.id)));
      document.querySelector('#haptic-label').textContent = mode.label;
      document.querySelector('#haptic-caption').textContent = mode.caption;
      clearTimeout(pulseTimer);
      playground.classList.remove('is-pulsing');
      void playground.offsetWidth;
      playground.classList.add('is-pulsing');
      pulseTimer = setTimeout(() => playground.classList.remove('is-pulsing'), 900);
    }
    playground.querySelector('.touch-button').addEventListener('click', () => showMode((modeIndex + 1) % modes.length));
    chips.forEach(chip => chip.addEventListener('click', () => showMode(modes.findIndex(mode => mode.id === chip.dataset.haptic))));
  }

  const links = [...document.querySelectorAll('.section-nav a[href^="#"]')];
  if ('IntersectionObserver' in window) {
    const visible = new Map();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => visible.set(entry.target.id, entry.isIntersecting));
      const current = [...links].reverse().find(link => visible.get(link.hash.slice(1)));
      if (!current) return;
      links.forEach(link => link === current ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'));
    }, { rootMargin: '-5% 0px -55% 0px', threshold: 0 });
    links.forEach(link => { const section = document.getElementById(link.hash.slice(1)); if (section) observer.observe(section); });
  }
})();
