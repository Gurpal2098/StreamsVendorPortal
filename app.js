var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dotenv = require('dotenv');
const cors = require('cors');

var indexRouter = require('./routes/index');
var vendorRouter = require('./routes/vendor');
var loginRouter = require("./routes/login");
var financeRouter = require("./routes/finance");
var staffRouter = require("./routes/staff");
var contractRouter = require("./routes/contract")
var billRouter = require("./routes/bill");
var termsRouter = require("./routes/terms");
var subsidiaryRouter = require("./routes/subsidiary");
var countryRouter = require("./routes/country");
var stateRouter = require("./routes/state");
var cityRouter = require("./routes/city");


var app = express();
app.use(cors());


// swagger config
const swaggerUi = require("swagger-ui-express"),
  swaggerDoc = require("./swagger.json");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/vendor', vendorRouter);
app.use('/login', loginRouter);
app.use('/finance', financeRouter);
app.use('/staff', staffRouter);
app.use('/contract', contractRouter);
app.use('/bill', billRouter);
app.use('/terms', termsRouter);
app.use('/subsidiary', subsidiaryRouter);
app.use('/country', countryRouter);
app.use('/state', stateRouter);
app.use('/city', cityRouter);

// setting up swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// catch 404 and forward to error handler

app.get("*", (req, res) => {
  res.send(`<h1>Invalid URL</h1>`);
});

app.use((req, res, next) => {
  next(createError(404));
});


// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
