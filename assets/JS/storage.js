// Хранение данных, вход, меню и общие функции
const KEY = "smartCampus";

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved) return saved;
  } catch (e) {}
  return JSON.parse(JSON.stringify(defaultData));
}
function saveData(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
function resetData() { localStorage.removeItem(KEY); }
const db = loadData();

// ---- Тема и настройки ----
function getSettings() {
  try { return JSON.parse(localStorage.getItem("scSettings")) || { theme: "light", campus: "Smart Campus" }; }
  catch (e) { return { theme: "light", campus: "Smart Campus" }; }
}
function saveSettings(s) { localStorage.setItem("scSettings", JSON.stringify(s)); applyTheme(); }
function applyTheme() { document.documentElement.dataset.theme = getSettings().theme; }
applyTheme();

// ---- Вход ----
function currentUser() { return localStorage.getItem("scUser"); }
function requireLogin() { if (!currentUser()) location.href = "index.html"; }
function logout() { localStorage.removeItem("scUser"); location.href = "index.html"; }

// ---- Меню ----
function renderNav(active) {
  const links = [
    ["dashboard.html", "Dashboard"], ["rooms.html", "Помещения"],
    ["devices.html", "Устройства"], ["incidents.html", "Инциденты"],
    ["analytics.html", "Analytics"], ["settings.html", "Настройки"]
  ];
  document.getElementById("nav").innerHTML =
    `<h2>${getSettings().campus}</h2><p class="muted">${currentUser()}</p>` +
    links.map(l => `<a href="${l[0]}" class="${l[0] === active ? "active" : ""}">${l[1]}</a>`).join("") +
    `<a href="#" onclick="logout()">Выйти</a>`;
}

// ---- Пороги и статусы ----
function roomStatus(r) {
  if (r.temperature >= 32 || r.co2 >= 1500) return "critical";
  if (r.temperature >= 28 || r.temperature < 18 || r.co2 >= 1000) return "warning";
  return "normal";
}
const statusLabel = { normal: "Норма", warning: "Внимание", critical: "Критично" };
const incStatusLabel = { open: "Открыт", in_progress: "В работе", closed: "Закрыт" };
const prioLabel = { low: "Низкий", medium: "Средний", high: "Высокий" };

// ---- AI: статистика ----
function mean(v) { return v.reduce((a, b) => a + b, 0) / v.length; }
function stdDev(v) {
  const m = mean(v);
  return Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / v.length);
}
function zScore(values, current) {
  const sd = stdDev(values);
  return sd === 0 ? 0 : Math.abs((current - mean(values)) / sd);
}
function getRecommendation(r) {
  if (r.co2 >= 1500) return "Критический CO2: включить вентиляцию и проверить аудиторию.";
  if (r.temperature >= 32) return "Перегрев: проверить кондиционер или систему вентиляции.";
  if (r.occupancy === 0 && r.energy > 4) return "В помещении нет людей, но энергопотребление высокое: отключить оборудование.";
  if (r.co2 >= 1000) return "Повышенный CO2: проветрить помещение.";
  return "Параметры в норме.";
}
// Аномалия: z-score > 2 и заметное абсолютное отклонение
function findAnomalies() {
  const out = [];
  db.rooms.forEach(r => {
    const zt = zScore(r.tempHistory, r.temperature);
    if (zt > 2 && Math.abs(r.temperature - mean(r.tempHistory)) >= 2)
      out.push({ room: r.id, reason: `Температура ${r.temperature} °C (обычно ≈ ${mean(r.tempHistory).toFixed(1)}), z = ${zt.toFixed(1)}`, risk: r.temperature >= 32 ? "critical" : "warning", rec: getRecommendation(r) });
    const zc = zScore(r.co2History, r.co2);
    if (zc > 2 && Math.abs(r.co2 - mean(r.co2History)) >= 200)
      out.push({ room: r.id, reason: `CO₂ ${r.co2} ppm (обычно ≈ ${Math.round(mean(r.co2History))}), z = ${zc.toFixed(1)}`, risk: r.co2 >= 1500 ? "critical" : "warning", rec: getRecommendation(r) });
    if (r.occupancy === 0 && r.energy > 4)
      out.push({ room: r.id, reason: `Нет людей, но потребление ${r.energy} kWh`, risk: "warning", rec: getRecommendation(r) });
  });
  return out;
}
function getNotifications() {
  const n = findAnomalies().map(a => ({ risk: a.risk, text: `${a.room}: ${a.reason}` }));
  db.devices.filter(d => d.status === "offline").forEach(d => n.push({ risk: "warning", text: `Датчик ${d.id} offline` }));
  return n;
}