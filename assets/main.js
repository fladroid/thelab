function toggleTheme() {
  const isDark = document.documentElement.dataset.theme === 'dark';
  document.documentElement.dataset.theme = isDark ? '' : 'dark';
  document.getElementById('theme-btn').textContent = isDark ? 'Dark' : 'Light';
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

(function() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.documentElement.dataset.theme = 'dark';
    document.getElementById('theme-btn').textContent = 'Light';
  }
})();
