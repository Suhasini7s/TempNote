// Get the dropdown menus
const creatorDropdown = document.getElementById('creatorDropdown');
const readerDropdown = document.getElementById('readerDropdown');

// Get the dropdown toggle links
const creatorToggle = document.getElementById('creatorToggle');
const readerToggle = document.getElementById('readerToggle');

// Add event listeners to toggle links
creatorToggle.addEventListener('click', (e) => {
  e.preventDefault();
  // Toggle the creator submenu
  creatorDropdown.classList.toggle('show');
  // Hide reader submenu if it's open
  readerDropdown.classList.remove('show');
});

readerToggle.addEventListener('click', (e) => {
  e.preventDefault();
  // Toggle the reader submenu
  readerDropdown.classList.toggle('show');
  // Hide creator submenu if it's open
  creatorDropdown.classList.remove('show');
});
