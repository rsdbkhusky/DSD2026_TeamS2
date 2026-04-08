(function () {
  try {
    if (localStorage.getItem('dsd2026-theme') === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch (e) { /* ignore */ }
})();
