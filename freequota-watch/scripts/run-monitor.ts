import { runMonitor } from "../src/services/monitor";

async function main() {
  try {
    await runMonitor();
  } catch (err) {
    console.error("Monitor failed:", err);
    process.exit(1);
  }
  process.exit(0);
}

main();
