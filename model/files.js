var mongoose = require('mongoose');  

var fileSchema = new mongoose.Schema({  
  src: String,
  dest: String,
  taskId: String
});

mongoose.model('File', fileSchema);