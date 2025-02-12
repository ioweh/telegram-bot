var express = require("express");
var http = require("http");
var path = require("path");
require("dotenv").config();
var routes = require("./routes/index");
var { startLogger } = require("../logger");

const PORT = process.env.REACT_APP_PORT;

var app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../build")));

app.use(express.json());
app.use("/", routes);

startLogger();

var server = http.createServer(app);
server.listen(PORT);
server.on("listening", function () {
  console.log("listening on port " + PORT);
});

module.exports = app;
