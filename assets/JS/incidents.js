requireLogin(); renderNav("incidents.html");
document.getElementById("room").innerHTML = db.rooms.map(r => `<option>${r.id}</option>`).join("");

function draw() {
  document.getElementById("tbody").innerHTML = db.incidents.map(i => `<tr>
    <td>${i.title}<div class="muted">${i.comment || ""}</div></td><td>${i.room}</td>
    <td><span class="badge ${i.priority === "high" ? "critical" : i.priority === "medium" ? "warning" : "normal"}">${prioLabel[i.priority]}</span></td>
    <td>${i.assignee}</td>
    <td><select onchange="setStatus(${i.id}, this.value)">
      ${Object.keys(incStatusLabel).map(k => `<option value="${k}" ${k === i.status ? "selected" : ""}>${incStatusLabel[k]}</option>`).join("")}
    </select></td>
    <td><button onclick="removeInc(${i.id})">Удалить</button></td></tr>`).join("")
    || `<tr><td colspan="6">Инцидентов нет. Добавьте первый выше.</td></tr>`;
}
function setStatus(id, v) { db.incidents.find(i => i.id === id).status = v; saveData(db); }
function removeInc(id) { db.incidents = db.incidents.filter(i => i.id !== id); saveData(db); draw(); }
function addInc() {
  const title = document.getElementById("title").value.trim();
  if (!title) { alert("Введите название инцидента"); return; }
  db.incidents.push({
    id: Date.now(), title, room: document.getElementById("room").value,
    priority: document.getElementById("priority").value, status: "open",
    assignee: document.getElementById("assignee").value, comment: document.getElementById("comment").value
  });
  saveData(db);
  document.getElementById("title").value = ""; document.getElementById("comment").value = "";
  draw();
}
draw();