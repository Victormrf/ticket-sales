import express from "express";
import jwt from "jsonwebtoken";
import { Database } from "./database";
import { authRoutes } from "./controller/auth-controller";
import { partnerRoutes } from "./controller/partner-controller";
import { customerRoutes } from "./controller/customer-controller";
import { eventRoutes } from "./controller/events-controller";
import { UserService } from "./services/user-service";

const app = express();

app.use(express.json());

const unprotectedRoutes = [
  { method: "POST", path: "/auth/login" },
  { method: "POST", path: "/customers/register" },
  { method: "POST", path: "/partners/register" },
  { method: "GET", path: "/events" },
];

app.use(async (req, res, next) => {
  const isUnprotectedRoute = unprotectedRoutes.some(
    (route) => route.method == req.method && req.path.startsWith(route.path)
  );

  if (isUnprotectedRoute) {
    return next();
  }

  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }
  try {
    const payload = jwt.verify(token, "123456") as {
      id: number;
      email: string;
    };
    const userService = new UserService();
    const user = await userService.findById(payload.id);
    if (!user) {
      res.status(401).json({ message: "Failed to authenticate token" });
      return;
    }
    req.user = user as { id: number; email: string };
    next();
  } catch (error) {
    res.status(401).json({ message: "Failed to authenticate token" });
  }
});

app.use("/auth", authRoutes);
app.use("/partners", partnerRoutes);
app.use("/customers", customerRoutes);
app.use("/events", eventRoutes);

app.listen(3000, async () => {
  const connection = Database.getInstance();
  await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
  await connection.execute("TRUNCATE TABLE events");
  await connection.execute("TRUNCATE TABLE customers");
  await connection.execute("TRUNCATE TABLE partners");
  await connection.execute("TRUNCATE TABLE users");
  await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
  console.log("Server is running in http://localhost:3000");
});
