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
const axios = require("axios");

//SERVER
const express = require("express");
const app = express();
let port = process.env.PORT || 4000;

//MIDDLEWARE
app.use(express.json());
app.use(cors(corsOptions));

//DATABASE
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "muditdahiya.com",
  database: "mudit_online",
  password: process.env.PGPASS,
  port: 5432,
});

pool.connect();

//REQUESTS
app.get("/", (req, res) => {
  res.send("Root of API server");
});

app.post("/updateDemographic", async (req, res) => {
  const ip = req.body.ip;
  const locationResponse = await axios.get(
    `https://api.ip2location.io/?key=${process.env.LOCATION_API_KEY}&ip=${ip}`
  );
  const country = locationResponse.data.country_name;
  //update table using sql
  pool.query(
    `INSERT INTO demographic (country, count) VALUES ('${country}', 1) ON CONFLICT (country) DO UPDATE SET count = demographic.count + 1;`
  );
  res.send(country);
});

app.get("/countryCount", async (req, res) => {
  const countries = await pool.query(
    "SELECT * FROM demographic ORDER BY count DESC;"
  );
  res.send(countries.rows);
});

//START SERVER
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
