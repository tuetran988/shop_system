const express = require("express");
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");
require("dotenv").config();
const cors = require("cors");
const app = express();
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
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

// cors
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});
//

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
    stack: error.stack,
    message: error.message || "Internal server error",
  });
});

module.exports = app;
