const express = require("express");
const os = require("os");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.get("/stats", (req, res) => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  const cpus = os.cpus();
  const cpu = cpus[0];
  const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
  const idle = cpu.times.idle;
  const cpuUsage = (((total - idle) / total) * 100).toFixed(2);

  res.json({
    cpu: cpuUsage,
    totalMem: (totalMem / 1024 / 1024).toFixed(0),
    usedMem: (usedMem / 1024 / 1024).toFixed(0),
    uptime: (os.uptime() / 3600).toFixed(2),
    time: new Date().toLocaleString(),
  });
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});