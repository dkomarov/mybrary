if (process.env.NODE_ENV !== 'production') { // set by default by Node
  require('dotenv').config({path: '.env'})
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const morgan = require('morgan');

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "development" || "production";
const port = process.env.PORT;
const host = process.env.HOST;
const live = process.env.LIVE;
const debug = require('debug');

const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')
const bookRouter = require('./routes/books')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views') // __dirname is cwd, views are server-rendered views
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static('public')) // client-side files
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false}))

const mongoose = require('mongoose')

if (env != 'production') {
  mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true})
} else {
  mongoose.connect('mongodb+srv://user2:'+process.env.MONGO_ATLAS+'@cluster0-cxz4x.mongodb.net/mybrary?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true})
}


const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to MongoDB'))

app.use('/', indexRouter)
app.use('/authors', authorRouter)
app.use('/books', bookRouter)

app.use(morgan('dev'));

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

var server = app.listen(port, function(){
  if (env != 'production') {
    console.log(`\nServer is running in ${env}. To connect, go to: http://${host}\n`);
  } else {
    console.log(`\nServer is running in ${env}. To connect, go to: https://${live}\n`);
  }
})

server.on('error', onError);
server.on('listening', onListening);