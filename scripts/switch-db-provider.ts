import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const target = process.argv[2] || "sqlite";

const prismaDir = path.join(process.cwd(), "prisma");
const sqliteSchema = path.join(prismaDir, "schema.sqlite.prisma");
const postgresSchema = path.join(prismaDir, "schema.postgres.prisma");
const activeSchema = path.join(prismaDir, "schema.prisma");

if (target === "postgres") {
  console.log("🔄 Switching Prisma provider to PostgreSQL (Supabase)...");
  fs.copyFileSync(postgresSchema, activeSchema);
  console.log("✅ Active schema is now PostgreSQL. Remember to set DATABASE_URL to your Supabase connection string.");
} else {
  console.log("🔄 Switching Prisma provider to SQLite (Local Zero-Setup)...");
  fs.copyFileSync(sqliteSchema, activeSchema);
  console.log("✅ Active schema is now SQLite (file:./dev.db).");
}

try {
  console.log("⚙️ Running prisma generate...");
  execSync("npx prisma generate", { stdio: "inherit" });
  console.log("🚀 Prisma Client generated successfully!");
} catch (error) {
  console.error("❌ Failed to generate Prisma Client:", error);
  process.exit(1);
}
