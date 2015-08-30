
/**
 * Module dependencies
 */

var express = require('express'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  errorHandler = require('errorhandler'),
  morgan = require('morgan'),
  routes = require('./routes'),
  http = require('http'),
  path = require('path'),
  cookieParser = require('cookie-parser'),
  sassMiddleware = require('node-sass-middleware'),
  db = require('./model/db');
var app = module.exports = express();

global.__base = __dirname + '/';

/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(methodOverride());
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));

var API = {};
API.movieDB = require('./routes/api/moviedb');
API.tasks = require('./routes/api/tasks');
API.files = require('./routes/api/files');
var cron = require('./routes/cron');

app.use(
  sassMiddleware({
    src: __dirname + '/sass',
    dest: __dirname + '/public/css',
    debug: true,
    outputStyle: 'compressed',
    prefix: "/css"
  })
);


app.use(express.static(path.join(__dirname, 'public')));

/**
 * Environnements
 */

var env = process.env.NODE_ENV || 'development';

// development only
if (env === 'development') {
  app.use(errorHandler());
}

// production only
if (env === 'production') {
  // TODO
}

/**
 * Routes
 */

app.post('/cron/folder', cron.createFolder);
// serve index and view partials
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// Task API
app.get('/api/tasks/', API.tasks.getAll);
app.post('/api/tasks/resume', API.tasks.resume);
app.post('/api/tasks/pause', API.tasks.pause);
app.post('/api/tasks', API.tasks.create);

//// Movie DB
// Search API
app.get('/api/movie/search', API.movieDB.searchMovie);
app.get('/api/tv/search', API.movieDB.searchTv);

// Info API
app.get('/api/movie/info', API.movieDB.getMovieInfo);
app.get('/api/tv/info', API.movieDB.getTvInfo);
app.get('/api/tv/season/info', API.movieDB.getTvSeasonInfo);

app.get('/api/tv/seasons', API.movieDB.getSeasons);
app.get('/api/tv/episodes', API.movieDB.getEpisodes);

// File API
app.get('/api/files', API.files.getAll);
app.post('/api/files', API.files.create);
app.get('/api/files/:file_id', API.files.get);
//app.put('/api/files/:file_id', API.files.update);
app.delete('/api/files/:file_id', API.files.delete);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

var schedule = require('node-schedule');

var rule = new schedule.RecurrenceRule();
var j = schedule.scheduleJob('* * * * *', function(){
    cron.process();
});

/**
 * Start Server
 */

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
