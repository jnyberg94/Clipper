import Database from '@tauri-apps/plugin-sql';

// Initialize the database (creates if doesn't exist)
//const db = await Database.load('sqlite:mydatabase.db');

export async function loadDatabase() {
  const db = await Database.load('sqlite:mydatabase.db');
  console.log('database', db)
  return db
}

// // Create a table
// await db.execute(`
//   CREATE TABLE IF NOT EXISTS users (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT NOT NULL,
//     email TEXT NOT NULL
//   )
// `);

// // Insert data
// await db.execute(
//   'INSERT INTO users (name, email) VALUES (?, ?)',
//   ['John Doe', 'john@example.com']
// );

// // Query data
// const result = await db.select('SELECT * FROM users');
// console.log(result);