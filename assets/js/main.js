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
        const matches = (activeFilter === 'all' || paper.dataset.group === activeFilter) && terms.every(term => paper.dataset.search.includes(term));
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

})();
