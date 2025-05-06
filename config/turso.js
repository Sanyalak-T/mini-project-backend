import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config();

export const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const connectTurso = async () => {
  // Ping Turso
  try {
    await db.execute("SELECT 1");
    // console.log("Checked successful communication with Turso database ✅");
  } catch (err) {
    // console.error("❌ Failed to connect to Turso:", err);
    process.exit(1);
  }
  // Initialize Turso tables
  await db.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
         tags TEXT, -- JSON-encoded array of strings
    is_pinned INTEGER DEFAULT 0, -- 0 = false, 1 = true
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER
    );
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL
    );
  `);
};

// const db = createClient({
//     url: process.env.TURSO_DB_URL,
//     authToken: process.env.TURSO_AUTH_TOKEN,
// });

// // Ping Turso
// try {
// await db.execute("SELECT 1");
// console.log("Checked successful communication with Turso database ✅");
// } catch (err) {
// console.error("❌ Failed to connect to Turso:", err);
// process.exit(1);
// }

// // Initialize the tables (users, notes)
// await db.execute(`
//     CREATE TABLE IF NOT EXISTS users (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT NOT NULL,
//     email TEXT UNIQUE NOT NULL
//     );
// `);
// await db.execute(`
//     CREATE TABLE IF NOT EXISTS notes (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     title TEXT NOT NULL,
//     content TEXT NOT NULL,
//     tags TEXT, --JSON-encoded array of strings
//     is_pinned INTEGER DEFAULT 0, -- 0 = false, 1 = true
//     create_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//     update_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//     user_id INTEGER
//     );
// `);

// create a user
// app.post("/users", async (req, res) => {
//     const { name, email } = req.body;

//     if(!name || !email) return res.status(400).send("Name and email are required");

//     const result = await db.execute({
//         sql: "INSERT INTO users (name, email) VALUES (?,?)",
//         args: [name, email],
//     });

//     res.status(201).json({
//         id: Number(result.lastInsertRowid),
//         name,
//         email,
//     });

// });

// create a note
// app.post("/notes", async (req, res) => {
//     const { title, content, tags = [], is_pinned = false, user_id } = req.body;

//     if(!user_id) {
//         return res.status(400).send("User ID is required");
//     }

//     const result = await db.execute({
//         sql: `
//             INSERT INTO notes (title, content, tags, is_pinned, user_id)
//             VALUES (?,?,?,?,?)
//         `,
//         args: [title, content, JSON.stringify(tags), is_pinned ? 1 : 0, user_id]
//     });

//     res.status(201).json({
//         id: Number((result).lastInsertRowid),
//         title,
//         content,
//         tags,
//         is_pinned,
//         user_id
//     })
// })

// get users

// app.get("/users", async (req, res) => {
//   const users = req.body;
//   const result = await db.execute({
//     sql: `SELECT name, email FROM users`,
//     args: users,
//   });

//   res.status(200).json({ result });
// });
