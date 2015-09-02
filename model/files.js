var mongoose = require('mongoose');  
var Schema = mongoose.Schema;

var fileSchema = new Schema({
  taskId: String,
  tv: {
  	name: String, 
  	season: Number, 
  	episode: Number, 
  	title: String
  },
  movie: {
  	title: String, 
  	year: Number
  },
  completed: Boolean
});

fileSchema.methods.getType = function () {
	if (this.tv && this.tv.title) {
		return 'tv'
	}
	else if (this.movie && this.movie.title) {
		return 'movie'
	}
	else {
		return 'other'
	}
}

var File = mongoose.model('File', fileSchema);

module.exports = File;