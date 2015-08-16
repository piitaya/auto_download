var request = require('request-promise');

var config = require('config');
var Syno = require('syno');
var MovieDB = require('moviedb');

var mdb = MovieDB(config.get('MovieDB.api.key'));
var syno = new Syno({
    // Requests protocol : 'http' or 'https' (default: http)
    protocol: config.get('Synology.host.protocol'),
    // DSM host : ip, domain name (default: localhost)
    host: config.get('Synology.host.url'),
    // DSM port : port number (default: 5000)
    port: config.get('Synology.host.port'),
    // DSM User account (required)
    account: config.get('Synology.account.user'),
    // DSM User password (required)
    passwd: config.get('Synology.account.password'),
});
/*
 * Serve JSON to our AngularJS client
 */

exports.name = function (req, res) {
	res.json({
		name: 'Bob'
	});
};

exports.login = function (req, res) {

};

exports.listTasks = function (req, res) {
	syno.dl.listTasks({additional: "detail,transfer"}, function(error, response) {
        res.contentType('json');
		res.send(
			response
		);
	});
};

exports.pauseTasks = function (req, res) {
    syno.dl.pauseTasks({id: req.body.id}, function(error, response) {
        res.contentType('json');
        res.send(
            response
        );
    });
};

exports.resumeTasks = function (req, res) {
    console.log(req.body);
    syno.dl.resumeTasks({id: req.body.id}, function(error, response) {
        res.contentType('json');
        res.send(
            response
        );
    });
};

exports.searchMovie = function (req, res) {
    mdb.searchMovie({query: req.query.term, language: "en"}, function(error, response){
        res.contentType('json');
        var movies = [];
        for (var i in response.results) {
            var result = response.results[i];
            var movie = {
                id: result.id,
                name: result.original_title,
                image: result.poster_path
            };
            movies.push(movie);
        }
        res.send(
            {results: movies}
        );
    });
};

exports.searchTv = function (req, res) {
    console.log(req.query);
    mdb.searchTv({query: req.query.term, language: "en"}, function(error, response){
        res.contentType('json');
        var tvs = [];
        for (var i in response.results) {
            var result = response.results[i];
            var tv = {
                id: result.id,
                name: result.original_name,
                image: result.poster_path
            };
            tvs.push(tv);
        }
        res.send(
            {results: tvs}
        );
    });
};

exports.getMovieInfo = function (req, res) {
    mdb.movieInfo({id: req.query.id, language: "en"}, function(error, response){
        res.contentType('json');
        res.send(
            response
        );
    });
};

exports.getTvInfo = function (req, res) {
    mdb.tvInfo({id: req.query.id, language: "en"}, function(error, response){
        res.contentType('json');
        res.send(
            response
        );
    });
};

exports.getTvSeasonInfo = function (req, res) {
    mdb.tvSeasonInfo({id: req.query.id, season_number: req.query.season_number, language: "en"}, function(error, response){
        res.contentType('json');
        res.send(
            response
        );
    });
};

exports.getSeasons = function (req, res) {
    mdb.tvInfo({id: req.query.id, language: "en"}, function(error, response) {
        res.contentType('json');
        var seasons = [];
        for (var i in response.seasons) {
            var result = response.seasons[i];
            var season = {
                season_number: result.season_number,
                episode_count: result.episode_count,
                air_date: result.air_date
            };
            seasons.push(season);
        }
        res.send(
            {seasons: seasons}
        );
    });
};

exports.getEpisodes = function (req, res) {
    mdb.tvSeasonInfo({id: req.query.id, season_number: req.query.season_number, language: "en"}, function(error, response) {
    res.contentType('json');
        var episodes = [];
        for (var i in response.episodes) {
            var result = response.episodes[i];
            var episode = {
                episode_number: result.episode_number,
                air_date: result.air_date,
                name: result.name
            };
            episodes.push(episode);
        }
        res.send(
            {episodes: episodes}
        );
    });
};