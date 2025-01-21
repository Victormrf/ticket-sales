import express from "express";

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

app.post("/partners", (req, res) => {
  const { name, email, password, company_name } = req.body;
});

app.post("/customers", (req, res) => {
  const { name, email, password, company_name } = req.body;
});

app.listen(3000, () => {
  console.log("Server is running in http://localhost:3000");
});
