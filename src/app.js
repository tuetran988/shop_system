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

//INIT DATABASE
require('./dbs/init.mongodb')
// const { checkOverLoad } = require('./helpers/check.connect')
// checkOverLoad()


//INIT ROUTES
app.use('/',require('./routes'))

//handling error

module.exports = app;
