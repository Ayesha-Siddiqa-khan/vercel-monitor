import { seedResourceLimits, getOrCreateUser } from "../src/db/seed";

async function main() {
  console.log("Seeding resource limits...");
  await seedResourceLimits();
  console.log("Resource limits seeded.");

  const email = process.env.SEED_USER_EMAIL || "admin@limitlens.app";
  console.log(`Creating/updating user: ${email}`);
  const user = await getOrCreateUser(email, "Admin User");
  console.log(`User: ${user.id} (${user.email})`);

  console.log("Seed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
