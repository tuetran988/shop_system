const mongoose = require("mongoose");
const os = require('os')
const process = require('process')

const _SECONDS = 5000

//count connect
const countConnected = () => {
  const numConnection = mongoose.connections.length;
  console.log(`Number of connection ::::::::::::: ${numConnection}`);
};

//check overload connect => dieu chinh so luong ket noi phu hop
const checkOverLoad = () => {
  setInterval(() => {
    const numConnection = mongoose.connections.length; //so luong connection
    const numCores = os.cpus().length; //so luowng core trong may tinh
    const memoryUsage = process.memoryUsage().rss; // phuong thuc lay memory da su dung
    // gia su moi core chiu duoc 5 connection cua mongodb
    const maxConnections = numCores * 5;
    //gia su neu so connect qua so max connection thi phai bao
    
    console.log(`Activated connection ${numConnection}`)
    console.log(`Memory usage:::: ${memoryUsage / 1024 / 1024} MB`)
    
    if (numConnection > maxConnections) {
      console.log(`Connection overload detected`)
      //notify.send(......)
    }
  }, _SECONDS); //Monitor every 5 second
};

module.exports = {
  countConnected,
  checkOverLoad
};
