const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');


// const swaggerUI = require('swagger-ui-express');
// const swaggerDocument = require('./docs/openapi.json');

const app = express();

const options = require('./knexfile.js');
console.log(options);
const knex = require('knex')(options);
const cors = require('cors');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use((req, res, next) => {
  req.db = knex;
  next();
});

// app.use('/docs', swaggerUI.serve);
// app.get('/docs', swaggerUI.setup(swaggerDocument));
const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
app.use('/', indexRouter);
app.use('/user', userRouter);

app.get('/events', (req, res) => {
    console.log('Got /events');
    const userId = req.user.id; // from auth middleware (e.g. JWT, session)
    res.set({
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive'
    });
    res.flushHeaders();
  // Tell the client to retry every 10 seconds if connectivity is lost
    res.write('retry: 10000\n\n');
    if (!clients[userId]) clients[userId] = [];
    clients[userId].push(res);

    req.on('close', () => {
        clients[userId] = clients[userId].filter(r => r !== res);
        if (clients[userId].length === 0) delete clients[userId];
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;