requireLogin(); renderNav("settings.html");
const s = getSettings();
document.getElementById("campus").value = s.campus;
document.getElementById("theme").value = s.theme;
function save() {
  saveSettings({ campus: document.getElementById("campus").value || "Smart Campus", theme: document.getElementById("theme").value });
  renderNav("settings.html");
}
function reset() {
  if (confirm("Сбросить все данные к исходным?")) { resetData(); location.reload(); }
}