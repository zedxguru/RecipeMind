// frontend/src/utils/theme.js

export function initTheme() {
  const saved = localStorage.getItem("theme");

  if (saved === "dark") {
    document.body.setAttribute("data-theme", "dark");
  } else {
    document.body.removeAttribute("data-theme");
  }
}

export function toggleTheme() {
  const current = document.body.getAttribute("data-theme");

  if (current === "dark") {
    document.body.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
  } else {
    document.body.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  }
}

export function getTheme() {
  return document.documentElement.getAttribute("data-theme") || "light";
}