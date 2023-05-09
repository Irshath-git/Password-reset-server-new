const mongoose = require("mongoose");

const conn = mongoose
  .connect(process.env.ATLAS_URI)
  .then((db) => {
    console.log("Database Connected Succesfully");
    return db;
  })
  .catch((error) => {
    console.log(error);
  });

module.exports = conn;
