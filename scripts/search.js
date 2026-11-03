// Search page: starts Pagefind's search box and runs any ?q= term from the header search.
window.addEventListener('DOMContentLoaded', () => {
  const box = document.getElementById('search');
  if (!box) return;
  if (typeof PagefindUI === 'undefined') {
    box.innerHTML = '<p class="search-note">Search is built when the site is published, so it is not available when this page is opened straight from a folder.</p>';
    return;
  }
  const ui = new PagefindUI({ element: '#search', showSubResults: true, showImages: false });
  const q = new URLSearchParams(window.location.search).get('q');
  if (q) ui.triggerSearch(q);
});