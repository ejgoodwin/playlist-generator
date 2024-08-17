import express from "express";
var app = express();
app.get("/", function (req, res) {
  res.send("Hello World!");
});
app.get("/test", function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  // Request methods you wish to allow: "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  res.setHeader("Access-Control-Allow-Methods", "GET");
  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  results = "hello everybody!";
  res.json(results);
  // Pass to next layer of middleware
  next();
});

app.listen(3010, function () {
  console.log("Example app listening on port 3010!");
});
