import fs from "fs";
import path from "path";
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv"; 
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false }
});

async function runSeed() {
  const seedDir = path.join(process.cwd(), "sql", "seed");
  const files = fs.readdirSync(seedDir).filter(f => f.endsWith(".sql")).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(seedDir, file), "utf8");
    console.log(`Running ${file}...`);
    await pool.query(sql);
  }

  console.log(" All seed files executed.");
  await pool.end();
}

runSeed().catch(err => {
  console.error(" Seeding failed:", err);
  process.exit(1);
});
