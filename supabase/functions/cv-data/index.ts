import { corsHeaders } from "./cors.ts";
import { createClient } from "./supabase.ts";
import express from "npm:express@4.18.2";
import cors from "npm:cors@latest";
const port = 3000;

//For CV-Password Brute Force Protection
const MAX_ATTEMPTS = 3;
const BLOCK_TIME = 5 * 60 * 1000;

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));

app.use(express.json());

app.get("/create", (req, res) => {
  res.send("Hello World!");
});

app.get("/update", (req, res) => {
  res.send("Hello World!");
});

app.get("/delete", (req, res) => {
  res.send("Hello World!");
});

app.get("/duplicate", (req, res) => {
  res.send("Hello World!");
});

app.get("/get", (req, res) => {
  res.send("Hello World!");
});

app.get("/get-all", (req, res) => {
  res.send("Hello World!");
});

app.post("/hello-world", (req, res) => {
  const { name } = req.body;
  res.send(`Hello ${name}!`);
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
