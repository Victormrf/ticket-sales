import { Database } from "../database";
import * as mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import { UserModel } from "../models/user-model";

export class CustomerService {
  async register(
    name: string,
    email: string,
    password: string,
    address: string,
    phone: string
  ) {
    const connection = Database.getInstance();
    const createdAt = new Date();
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userModel = await UserModel.create({
      name,
      email,
      password: hashedPassword,
    });
    const userId = userModel.id;
    const [partnerResult] = await connection.execute<mysql.ResultSetHeader>(
      "INSERT INTO customers (user_id, address, phone, created_at) VALUES (?, ?, ?, ?)",
      [userId, address, phone, createdAt]
    );

    return {
      id: partnerResult.insertId,
      name,
      userId,
      address,
      phone,
      createdAt,
    };
  }
}
