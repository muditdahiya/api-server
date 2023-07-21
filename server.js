//ENVIRONMENT VARIABLES
const dotenv = require("dotenv");
dotenv.config();

//PACKAGES
const cors = require("cors");
var corsOptions = {
  origin: "http://muditdahiya.com",
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

//SERVER
const express = require("express");
const app = express();
let port = process.env.PORT || 4000;

//MIDDLEWARE
app.use(express.json());
app.use(cors(corsOptions));

//DATABASE
const { Pool } = require("pg");
const res = require("express/lib/response");

const pool = new Pool({
  user: "postgres",
  host: "muditdahiya.com",
  database: "thought_serve",
  password: process.env.PGPASS,
  port: 5432,
});

pool.connect();

//REQUESTS

//START SERVER
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
