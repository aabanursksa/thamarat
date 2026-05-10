import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = dirname(fileURLToPath(import.meta.url));

function start(name, cwd, port) {
  const p = spawn("npx", ["vite", "--host"], {
    stdio: ["ignore", "pipe", "inherit"],
    shell: true,
    cwd: join(root, cwd),
    env: { ...process.env, PORT: String(port) },
  });
  p.on("error", (e) => console.log(`${name} error:`, e.message));
  return p;
}

console.log("Starting all services...\n");

const api = spawn("npx", ["tsx", "src/index.ts"], {
  stdio: "inherit",
  shell: true,
  cwd: join(root, "apps/api"),
});

const admin = start("Admin", "apps/admin", 5173);
const client = start("Client", "apps/client", 5174);

console.log("✅ API       → http://localhost:4000");
console.log("✅ Admin     → http://localhost:5173");
console.log("✅ Customer  → http://localhost:5174");
console.log("\nPress Ctrl+C to stop all services");
