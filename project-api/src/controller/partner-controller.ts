import { Router } from "express";
import { createConnection } from "../database";
import * as mysql from "mysql2/promise";
import bcrypt from "bcrypt";

export const partnerRoutes = Router();

partnerRoutes.post("/register", async (req, res) => {
  const { name, email, password, company_name } = req.body;

  const connection = await createConnection();

  try {
    const createdAt = new Date();
    const hashedPassword = bcrypt.hashSync(password, 10);
    const [userResult] = await connection.execute<mysql.ResultSetHeader>(
      "INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, createdAt]
    );
    const userId = userResult.insertId;
    const [partnerResult] = await connection.execute<mysql.ResultSetHeader>(
      "INSERT INTO partners (user_id, company_name, created_at) VALUES (?, ?, ?)",
      [userId, company_name, createdAt]
    );

    res.status(201).json({
      id: partnerResult.insertId,
      name,
      userId,
      company_name,
      createdAt,
    });
  } finally {
    connection.end();
  }
});

partnerRoutes.post("/events", async (req, res) => {
  const { name, description, date, location } = req.body;
  const userId = req.user!.id;
  const connection = await createConnection();
  try {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM partners WHERE user_id = ?",
      [userId]
    );
    const partner = rows.length ? rows[0] : null;

    if (!partner) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }
    const eventDate = new Date(date);
    const createdAt = new Date();

    const [eventResult] = await connection.execute<mysql.ResultSetHeader>(
      "INSERT INTO events (name, description, date, location, created_at, partner_id) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description, eventDate, location, createdAt, partner.id]
    );
    res.status(201).json({
      id: eventResult.insertId,
      name,
      description,
      date: eventDate,
      location,
      created_at: createdAt,
      partner_id: partner.id,
    });
  } finally {
    await connection.end();
  }
});

partnerRoutes.get("/events", async (req, res) => {
  const userId = req.user!.id;
  const connection = await createConnection();
  try {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM partners WHERE user_id = ?",
      [userId]
    );
    const partner = rows.length ? rows[0] : null;

    if (!partner) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM events WHERE partner_id = ?",
      [partner.id]
    );
    res.json(eventRows);
  } finally {
    await connection.end();
  }
});

partnerRoutes.get("/events/:eventId", (req, res) => {
  const { eventId } = req.params;
  console.log(eventId);
  res.send();
});
