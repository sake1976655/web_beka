// server/server.js
const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg"); // PostgreSQL клиенті
const cors = require("cors");

const app = express();
const port = 3000;

// Ортақ middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Деректер базасына қосылу
const pool = new Pool({
  user: "postgres",      // өзіңіздің логиніңіз
  host: "localhost",
  database: "4jeli",     // деректер базасы аты
  password: "password",  // өзіңіздің пароліңіз
  port: 5432,
});

// -------------------- ROUTES --------------------

// Үй беті: барлық посттарды алу
app.get("/posts", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT posts.id, posts.title, posts.description, posts.content, users.username, posts.created_at FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Сервер қате");
  }
});

// Жаңа пост қосу
app.post("/posts", async (req, res) => {
  const { user_id, title, description, content } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO posts (user_id, title, description, content) VALUES ($1, $2, $3, $4) RETURNING *",
      [user_id, title, description, content]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Қате: пост қосылмады");
  }
});

// Пікір қосу
app.post("/comments", async (req, res) => {
  const { post_id, user_id, content } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *",
      [post_id, user_id, content]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Қате: пікір қосылмады");
  }
});

// Медиа файл қосу (сурет/бейне)
app.post("/media", async (req, res) => {
  const { post_id, user_id, file_url, type } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO media (post_id, user_id, file_url, type) VALUES ($1, $2, $3, $4) RETURNING *",
      [post_id, user_id, file_url, type]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Қате: медиа қосылмады");
  }
});

// Серверді іске қосу
app.listen(port, () => {
  console.log(`4 желі сервері http://localhost:${port} адресінде жұмыс істеп тұр`);
});
