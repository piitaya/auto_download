var mongoose = require('mongoose');  
var Schema = mongoose.Schema;

var fileSchema = new Schema({  
  name: String,
  taskId: String,
  type: String,
  tvshow: String,
  season: String,
  episode: String
});

var File = mongoose.model('File', fileSchema);

module.exports = File;