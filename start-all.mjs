import { spawn } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = dirname(fileURLToPath(import.meta.url));

function start(name, cmd, args, cwd) {
  const p = spawn(cmd, args, { stdio: "inherit", shell: true, cwd: join(root, cwd) });
  p.on("error", (e) => console.log(`[${name}] Error:`, e.message));
  p.on("exit", (code) => console.log(`[${name}] Exited with code ${code}`));
  return p;
}

console.log("🚀 Starting Restaurant Management System...\n");

// Start API
start("API", "npx", ["tsx", "src/index.ts"], "apps/api");

// Give API a moment to start
setTimeout(() => {
  // Start Admin Dashboard
  start("Admin", "npx", ["vite", "--host"], "apps/admin");
  
  // Start Customer Frontend
  start("Client", "npx", ["vite", "--host", "--port", "5174"], "apps/client");

  console.log("\n✅ API       → http://localhost:4000");
  console.log("✅ Admin     → http://localhost:5173");
  console.log("✅ Customer  → http://localhost:5174");
  console.log("\nPress Ctrl+C to stop all services");
}, 3000);
