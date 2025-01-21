import express from "express";
import * as mysql from "mysql2/promise";
import bcrypt from "bcrypt";

function createConnection() {
  return mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "tickets",
  });
}

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Hello world!" });
});

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  res.send();
});

app.post("/partners", async (req, res) => {
  const { name, email, password, company_name } = req.body;

  const connection = await createConnection();

  try {
    const createdAt = new Date();
    const hashedPassword = bcrypt.hashSync(password, 10);
    const [userResult] = await connection.execute<mysql.ResultSetHeader>(
      "INSERT INTO users (name, email, password, created_at)",
      [name, email, hashedPassword, createdAt]
    );
    const userId = userResult.insertId;
    const [partnerResult] = await connection.execute<mysql.ResultSetHeader>(
      "INSERT INTO partners (user_id, company_namer, created_at)",
      [userId, company_name, createdAt]
    );

    res
      .status(201)
      .json({ id: partnerResult.insertId, userId, company_name, createdAt });
  } finally {
    connection.end();
  }
});

app.post("/customers", (req, res) => {
  const { name, email, password, address, phone } = req.body;
});

app.post("/partners/events", (req, res) => {
  const { name, description, date, location } = req.body;
});

app.get("/partners/events", (req, res) => {});

app.get("/partners/events/:eventId", (req, res) => {
  const { eventId } = req.params;
  console.log(eventId);
  res.send();
});

app.get("/events", (req, res) => {});

app.get("/events/:eventId", (req, res) => {
  const { eventId } = req.params;
  console.log(eventId);
  res.send();
});

app.listen(3000, () => {
  console.log("Server is running in http://localhost:3000");
});
