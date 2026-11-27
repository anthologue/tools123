// Light/dark theme toggle, shared by every page.
// The theme is stored as data-theme="light" or "dark" on the <html> element.
// A small script in each page's <head> applies the saved choice before the page
// is drawn, so there is no flash of the wrong theme. Light is the default.

(function () {
  var STORAGE_KEY = 'theme';
  var root = document.documentElement;
  var button = document.getElementById('theme-toggle');
  if (!button) return;

  function currentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function updateButton() {
    var isDark = currentTheme() === 'dark';
    button.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    button.textContent = isDark ? 'Light theme' : 'Dark theme';
  }

  button.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    // Remembering the choice is a convenience; the page still works if storage is blocked.
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {}
    updateButton();
  });

  updateButton();
})();
