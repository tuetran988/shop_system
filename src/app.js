const express = require("express");
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");
require('dotenv').config();
const app = express();

// init middlewares
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());

//init database
require('./dbs/init.mongodb')
const { checkOverLoad } = require('./helpers/check.connect')
checkOverLoad()
//init routes

app.get("/", (req, res, next) => {
  const string = "tuetrancao";
  return res.status(200).json({
    msg: "oke",
    data: string.repeat(10000),
  });
});
//handling error

module.exports = app;
