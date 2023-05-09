const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const mongodb = require("mongodb");

const app = express();

//using middlewares
app.use(express.json());
app.use(cors());

//using routes
app.use(require("./routes/routes"));

//including env file
require("dotenv").config({ path: "./config.env" });

//Defining port
const port = process.env.PORT || 4000;

//mongodb connection
const conn = require("./db/connection");

app.get("/hello", (req, res) => {
  res.send("Api Check");
});

conn
  .then((db) => {
    if (!db) return process.exit(1);

    //listen to the http server
    app.listen(port, () => {
      console.log(`Server is running on port : http://localhost:${port}`);
    });

    app.on("error", (error) => {
      console.log(`Failed to connect with HTTP server : ${error}`);
    });
  })
  .catch((error) => {
    console.log(`Connection Failed...!${error}`);
  });
