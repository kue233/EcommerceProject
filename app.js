const express = require("express");
const app = express();
const path = require("path");
require("dotenv").config();
const routes = require("./routes")
// var hbs = require('express-handlebars');
const hbs = require('hbs');

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  next();
});

// view engine setup
// app.engine('hbs', hbs.engine({
//   extname: 'hbs',
//   defaultLayout: 'layout',
//   layoutsDir: __dirname + '/views/layouts/'
// }))
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'hbs');

app.use(routes);
app.use(express.static(path.join(__dirname, "/public")));
//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function (req, res) {
  res.status(404).send('404 NOT FOUND', 404);
});

module.exports = app;