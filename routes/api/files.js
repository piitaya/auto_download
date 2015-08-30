var File = require(__base + '/model/files');

exports.create = function (req, res) {
    res.contentType('json');
    var newFile = File({
        src: req.body.src,
        dest: req.body.dest,
        taskId: req.body.taskId
    });
    newFile.save().then(function(file) {
        res.send({
            success: true,
            file: file
        });
    },
    function(err) {
        res.send({
            success: false,
            error: err
        });
    });
};

exports.delete = function (req, res) {
    File.findByIdAndRemove(req.params.file_id).then(function() {
        res.send({
            success: true,
        });
    }, function(err) {
        res.send({
            success: false,
            error: err
        });
    });
};

exports.get = function (req, res) {
    res.contentType('json');
    File.findById(req.params.file_id).then(function(file) {
        res.send({
            success: true,
            file: file
        });
    }, function(err) {
        res.send({
            success: false,
            error: err
        });
    });
};

exports.getAll = function (req, res) {
    res.contentType('json');
    File.find().then(function(files) {
        res.send({
            success: true,
            files: files
        });
    }, function(err) {
        res.send({
            success: false,
            error: err
        });
    });
};