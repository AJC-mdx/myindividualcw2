const express = require("express");
const http = require("http");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

//--middlewear--//

//logger
app.use(function (request, response, next) {
  console.log("incoming request for " + request.url);
  console.log("Request Date: " + new Date());
  next();
});

//static file middlewear
var path = require("path");
var fs = require("fs");

app.use(function (req, res, next) {
  var filePath = path.join(__dirname, "static", req.url);
  fs.stat(filePath, function (err, fileInfo) {
    if (err) {
      next();
      return;
    }
    if (fileInfo.isFile()) res.sendFile(filePath);
    else next();
  });
});

//--connect to mongodb--//
const MongoClient = require("mongodb").MongoClient;

let db;
MongoClient.connect(
  "mongodb+srv://mongodbmdx:nomoredb@cw2-cluster.rimee.mongodb.net/lessons-app?retryWrites=true&w=majority",
  (err, client) => {
    db = client.db("lessons-app");
  }
);