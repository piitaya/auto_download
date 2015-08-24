
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
  sassMiddleware = require('node-sass-middleware');
  
var app = module.exports = express();


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
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));

var API = {};
API.movieDB = require('./routes/api/moviedb');
API.tasks = require('./routes/api/tasks');

var env = process.env.NODE_ENV || 'development';

// development only
if (env === 'development') {
  app.use(errorHandler());
}

// production only
if (env === 'production') {
  // TODO
}

app.use('/styles', sassMiddleware({
    /* Options */
    src: __dirname + '/public/style/sass',
    dest: __dirname + '/public/style/css',
    debug: true,
    outputStyle: 'compressed'
}));
/**
 * Routes
 */

// serve index and view partials
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// Task API
app.get('/api/tasks/', API.tasks.listTasks);
app.post('/api/tasks/resume', API.tasks.resumeTasks);
app.post('/api/tasks/pause', API.tasks.pauseTasks);


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

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);


/**
 * Start Server
 */

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
  console.log('srcPath is ' + __dirname + '/public/style/sass');
  console.log('destPath is ' + __dirname + '/public/style/css');
});
