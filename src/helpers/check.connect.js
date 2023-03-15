const mongoose = require("mongoose");

//count connect

const countConnected = () => {
  const numConnection = mongoose.connections.length;
  console.log(`Number of connection ::::::::::::: ${numConnection}`);
};

module.exports = {
  countConnected,
};
