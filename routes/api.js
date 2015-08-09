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
    console.log(req.body)
    syno.dl.resumeTasks({id: req.body.id}, function(error, response) {
        res.contentType('json');
        console.log(error);
        console.log(response);
        res.send(
            response
        );
    });
};

exports.searchMovies = function (req, res) {
    console.log(req.query);
    mdb.searchMulti({query: req.query.term, language: "fr"}, function(error, response){
        var data = {
            movies: [],
            tvshows: []
        }
        for (var i in response.results) {

            if (response.results[i].media_type == "tv") {
                data.tvshows.push({
                    name: response.results[i].original_name,
                    image: response.results[i].poster_path,
                    date: response.results[i].first_air_date
                })
            }
            else if(response.results[i].media_type == "movie") {
                data.movies.push({
                    name: response.results[i].original_title,
                    image: response.results[i].poster_path,
                    release_date: response.results[i].first_air_date
                })
            }
        }
        res.send(
            data
        );
    });
};