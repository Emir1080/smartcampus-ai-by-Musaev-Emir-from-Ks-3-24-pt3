requireLogin(); renderNav("devices.html");
function draw() {
  const q = document.getElementById("q").value.toLowerCase();
  const s = document.getElementById("status").value;
  const rows = db.devices.filter(d => (d.id + d.room + d.type).toLowerCase().includes(q) && (!s || d.status === s));
  document.getElementById("tbody").innerHTML = rows.map(d => `<tr>
    <td>${d.id}</td><td>${d.room}</td><td>${d.type}</td>
    <td><span class="badge ${d.status === "online" ? "normal" : "critical"}">${d.status}</span></td>
    <td>${d.value} ${d.unit}</td><td>${d.updatedAt}</td></tr>`).join("")
    || `<tr><td colspan="6">Ничего не найдено</td></tr>`;
}
["q", "status"].forEach(id => document.getElementById(id).addEventListener("input", draw));
draw();