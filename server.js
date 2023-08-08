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
  //avoiding bots from US, allow only one increment in 30 minutes from USA
  if (country === "United States of America") {
    let lastTime = await pool.query(
      `SELECT update_time FROM demographic WHERE country = 'United States of America';`
    );
    lastTime = lastTime.rows[0].update_time;
    lastTime = `${lastTime.getUTCFullYear()}-${
      lastTime.getUTCMonth() + 1
    }-${lastTime.getUTCDate()} ${lastTime.getUTCHours()}:${lastTime.getUTCMinutes()}:${lastTime.getUTCSeconds()}`;
    let timeInMinutes = await pool.query(
      `SELECT 24*60*date_part('days', now() - '${lastTime}') + 60*date_part('hours', now() - '${lastTime}') + date_part('minutes', now() - '${lastTime}') as minutes;`
    );
    timeInMinutes = timeInMinutes.rows[0].minutes;
    if (timeInMinutes > 30) {
      await pool.query(
        `INSERT INTO demographic (country, count, update_time) VALUES ('${country}', 1, now()) ON CONFLICT (country) DO UPDATE SET count = demographic.count + 1, update_time = now();`
      );
    }
    //any other country registers all hits
  } else {
    await pool.query(
      `INSERT INTO demographic (country, count, update_time) VALUES ('${country}', 1, now()) ON CONFLICT (country) DO UPDATE SET count = demographic.count + 1, update_time = now();`
    );
  }

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
