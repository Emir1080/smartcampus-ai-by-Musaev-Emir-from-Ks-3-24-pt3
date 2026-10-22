// Учебные данные Smart Campus AI
const defaultRooms = [
  // id, корпус, этаж, тип, температура, CO2, энергия (kWh), людей
  ["120","Корпус A",1,"Компьютерный класс",24.3,780,3.6,18],
  ["303","Корпус A",1,"Лекционная",23.1,950,2.4,40],
  ["303","Корпус A",1,"Лаборатория",25.0,820,4.1,12],
  ["205","Корпус A",2,"Лекционная",24.8,1620,3.0,55],
  ["A-206","Корпус A",2,"Серверная",26.5,600,6.2,0],
  ["307","Корпус B",2,"Компьютерный класс",23.4,700,3.3,20],
  ["B-202","Корпус B",2,"Лаборатория",33.4,900,3.8,10],
  ["B-203","Корпус B",2,"Административное",22.7,650,1.2,4],
  ["B-304","Корпус B",3,"Лекционная",23.9,1100,2.7,35],
  ["C-301","Корпус C",3,"Лаборатория",24.1,740,4.0,0],
  ["305","Корпус C",3,"Компьютерный класс",23.0,690,6.8,0],
  ["C-303","Корпус C",3,"Административное",22.5,610,1.0,3]
];

// Детерминированная «история» показаний для расчёта z-score
function makeHistory(base, spread, seed) {
  return Array.from({ length: 8 }, (_, i) =>
    +(base + Math.sin(i * 2.3 + seed) * spread).toFixed(1));
}

const defaultData= {
  rooms: defaultRooms.map((r, i) => ({
    id: r[0], building: r[1], floor: r[2], type: r[3],
    temperature: r[4], co2: r[5], energy: r[6], occupancy: r[7],
    tempHistory: makeHistory(23, 0.4, i),
    co2History: makeHistory(750, 60, i).map(Math.round)
  })),
  devices: [],
  incidents: [
    { id: 1, title: "Высокий уровень CO2", room: "A-205", priority: "high", status: "open", assignee: "Инженер", comment: "Проверить вентиляцию" },
    { id: 2, title: "Перегрев в лаборатории", room: "B-202", priority: "high", status: "in_progress", assignee: "Инженер", comment: "" },
    { id: 3, title: "Не работает датчик", room: "C-301", priority: "low", status: "open", assignee: "Оператор", comment: "" }
  ]
};

// 20 устройств: датчик температуры в каждой комнате + CO2 в первых 8
defaultData.rooms.forEach((r, i) => {
  const code = r.id.replace("-", "");
  defaultData.devices.push({
    id: `TEMP-${code}-01`, room: r.id, type: "Temperature Sensor",
    status: i === 9 ? "offline" : "online", value: r.temperature, unit: "°C",
    updatedAt: "2026-10-21 09:" + String(10 + i).padStart(2, "0")
  });
  if (i < 8) defaultData.devices.push({
    id: `CO2-${code}-01`, room: r.id, type: "CO2 Sensor",
    status: i === 5 ? "offline" : "online", value: r.co2, unit: "ppm",
    updatedAt: "2026-10-21 09:" + String(20 + i).padStart(2, "0")
  });
});