requireLogin(); renderNav("dashboard.html");
const online = db.devices.filter(d => d.status === "online").length;
const openInc = db.incidents.filter(i => i.status !== "closed").length;
const energy = db.rooms.reduce((s, r) => s + r.energy, 0).toFixed(1);
const okRooms = db.rooms.filter(r => roomStatus(r) === "normal").length;

document.getElementById("kpi").innerHTML = [
  ["Помещения в норме", `${okRooms}/${db.rooms.length}`],
  ["Устройства online", `${online}/${db.devices.length}`],
  ["Открытые инциденты", openInc],
  ["Энергия сейчас", energy + " kWh"]
].map(k => `<div class="card"><div class="muted">${k[0]}</div><div class="big">${k[1]}</div></div>`).join("");

const buildings = [...new Set(db.rooms.map(r => r.building))];
new Chart(document.getElementById("energyChart"), {
  type: "bar",
  data: { labels: buildings, datasets: [{ label: "kWh", backgroundColor: "#55662a",
    data: buildings.map(b => +db.rooms.filter(r => r.building === b).reduce((s, r) => s + r.energy, 0).toFixed(1)) }] },
  options: { plugins: { legend: { display: false } } }
});
new Chart(document.getElementById("co2Chart"), {
  type: "line",
  data: { labels: db.rooms.map(r => r.id), datasets: [{ label: "CO₂, ppm", borderColor: "#b07d12", data: db.rooms.map(r => r.co2), tension: .3 }] }
});

const notes = getNotifications();
document.getElementById("notes").innerHTML = notes.length
  ? notes.map(n => `<li class="${n.risk}">${n.text}</li>`).join("")
  : "<li>Предупреждений нет</li>";