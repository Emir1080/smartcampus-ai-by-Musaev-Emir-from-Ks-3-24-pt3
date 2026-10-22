requireLogin(); renderNav("analytics.html");
const list = findAnomalies();
document.getElementById("tbody").innerHTML = list.map(a => `<tr>
  <td>${a.room}</td><td>${a.reason}</td>
  <td><span class="badge ${a.risk}">${statusLabel[a.risk]}</span></td><td>${a.rec}</td></tr>`).join("")
  || `<tr><td colspan="4">Аномалий не обнаружено</td></tr>`;

const sel = document.getElementById("roomSel");
sel.innerHTML = db.rooms.map(r => `<option>${r.id}</option>`).join("");
let chart;
function drawChart() {
  const r = db.rooms.find(x => x.id === sel.value);
  const labels = [...r.tempHistory.map((_, i) => "−" + (r.tempHistory.length - i)), "сейчас"];
  if (chart) chart.destroy();
  chart = new Chart(document.getElementById("tempChart"), {
    type: "line",
    data: { labels, datasets: [{ label: "Температура, °C", borderColor: "#b07d12", tension: .3, data: [...r.tempHistory, r.temperature] }] }
  });
}
sel.addEventListener("input", drawChart); drawChart();