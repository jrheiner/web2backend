const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const helmet = require('helmet');
const config = require('./config/config.json');

const indexRouter = require('./routes/index');
const postRouter = require('./routes/posts.routes');
const commentRouter = require('./routes/comments.routes');
const userRouter = require('./routes/user.routes');

const app = express();

app.use(logger('dev'));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/user', userRouter);

// TODO implement general error handling
app.use(function(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send({error: true, message: 'User not logged in!'});
  }
});

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};
mongoose.connect(config.mongoDB, mongooseOptions)
    .then(() => {
      console.log(`Connected to the database ${config.mongoDB}`);
    })
    .catch((err) => {
      console.log(`Cannot connect to the database! ${err}`);
      process.exit();
    });

module.exports = app;
