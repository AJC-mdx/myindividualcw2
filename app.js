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

//--rest api--//
app.param("collectionName", (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    return next();
  });
  
  app.get("/", (req, res, next) => {
    res.send("Select a collection, e.g., /collection/messages");
  });
  
  //GET request
  app.get("/collection/:collectionName", (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
      if (e) return next(e);
      res.send(results);
    });
  });
  
  //POST request
  app.post("/collection/:collectionName", (req, res, next) => {
    req.collection.insert(req.body, (e, results) => {
      if (e) return next(e);
      res.send(results.ops);
    });
  });
  
  const ObjectID = require("mongodb").ObjectID;
  app.get("/collection/:collectionName/:id", (req, res, next) => {
    req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
      if (e) return next(e);
      res.send(result);
    });
  });
  
  //PUT request
  app.put("/collection/:collectionName/:id", (req, res, next) => {
    req.collection.update(
      { _id: new ObjectID(req.params.id) },
      { $set: req.body },
      { safe: true, multi: false },
      (e, result) => {
        if (e) return next(e);
        res.send(result.result.n === 1 ? { msg: "success" } : { msg: "error" });
      }
    );
  });

  //middlewear error handler
app.use(function (req, res) {
    res.status(404);
    res.send("File not found!!");
  });