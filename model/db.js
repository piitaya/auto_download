var mongoose = require('mongoose');

var config = require('config');
var mongo = config.get('MongoDB');

mongoose.connect('mongodb://' + mongo.user + ':' + mongo.password + '@' + mongo.url + ':' + mongo.port);