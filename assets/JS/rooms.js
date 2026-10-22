requireLogin(); renderNav("rooms.html");
const bSel = document.getElementById("building");
[...new Set(db.rooms.map(r => r.building))].forEach(b => bSel.innerHTML += `<option>${b}</option>`);
function draw() {
  const q = document.getElementById("q").value.toLowerCase();
  const b = bSel.value, s = document.getElementById("status").value;
  const rows = db.rooms.filter(r =>
    (r.id + r.type).toLowerCase().includes(q) &&
    (!b || r.building === b) && (!s || roomStatus(r) === s));
  document.getElementById("tbody").innerHTML = rows.map(r => `<tr>
    <td>${r.id}</td><td>${r.building}</td><td>${r.floor}</td><td>${r.type}</td>
    <td>${r.temperature} °C</td><td>${r.co2} ppm</td><td>${r.occupancy}</td>
    <td><span class="badge ${roomStatus(r)}">${statusLabel[roomStatus(r)]}</span></td></tr>`).join("")
    || `<tr><td colspan="8">Ничего не найдено</td></tr>`;
}
["q", "building", "status"].forEach(id => document.getElementById(id).addEventListener("input", draw));
draw();