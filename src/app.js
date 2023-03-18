const express = require("express");
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");
require("dotenv").config();
const app = express();

// init middlewares
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
// body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//INIT DATABASE
require("./dbs/init.mongodb");
// const { checkOverLoad } = require('./helpers/check.connect')
// checkOverLoad()

//INIT ROUTES
app.use("/", require("./routes"));

//handling error
app.use((req, res, next) => {
  const error = new Error("NotFound");
  error.status = 404;
  next(error);
});
app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: error.message || "Internal server error",
  });
});

module.exports = app;
