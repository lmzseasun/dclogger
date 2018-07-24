var fs = require('fs');
var util = require('util');
var path = require('path');
var mkdirp = require('mkdirp');
var stream = require('readable-stream');
var format = require('date-format');
var LOG_ROLL_PATTERN = 'yyyy-MM-dd_hhmmss';
var ROLL_INTERVAL = 1000 * 60 * 5;

module.exports = DcRollingFileStream;

function DcRollingFileStream(filePath, options, rollMilisec) {
	if (!filePath) {
		throw new Error('You must specify a filePath');
	}
	this.filePath = filePath;
	this.options = options || {};
	this.options.encoding = this.options.encoding || 'utf8';
	this.options.mode = this.options.mode || parseInt('0644', 8);
	this.options.flags = this.options.flags || 'a';	
	this.rollMilisec = this.rollMilisec || ROLL_INTERVAL;
	this.now = new Date();;
	DcRollingFileStream.super_.call(this);
	this.openTheStream();
}
util.inherits(DcRollingFileStream, stream.Writable);

DcRollingFileStream.prototype._writeTheChunk = function(chunk, encoding, callback) {
	try {
		if (!this.theStream.write(chunk, encoding)) {
			this.theStream.once('drain',callback);
		} else {
			process.nextTick(callback);
		}
	} catch (err) {
		if (callback) {
			callback(err);
		}
	}
};

DcRollingFileStream.prototype._write = function(chunk, encoding, callback) {
	if (this.shouldRoll()) {
		this.roll(this.filePath, this._writeTheChunk.bind(this, chunk, encoding, callback));
	} else {
		this._writeTheChunk(chunk, encoding, callback);
	}
};

DcRollingFileStream.prototype.openTheStream = function(callback) {	
	var that = this;
	this.theStream = fs.createWriteStream(this.filePath, this.options);
	this.theStream.on('error', function(err) {
		that.emit('error', err);
	});
	if (callback) {
		this.theStream.on("open", callback);
	}
};

DcRollingFileStream.prototype.closeTheStream = function(callback) {
	this.theStream.end(callback);
};

DcRollingFileStream.prototype.shouldRoll = function() {
	var that = this;
	var fileNameObject = path.parse(this.filePath);
	
	function justTheseFiles(item) {
		return item.startsWith(fileNameObject.name + '_');
	}
	
	function findLastFileTimeIfExists() {
		var files = fs.readdirSync(path.dirname(that.filePath));
		var filesToProcess = files.filter(justTheseFiles).sort();
		if (filesToProcess.length > 0) {
			return fs.statSync(path.join(fileNameObject.dir, filesToProcess[filesToProcess.length - 1])).mtime;
		} else if (fs.existsSync(that.filePath)){
			return fs.statSync(that.filePath).birthtime;
		} else {
			return that.now;
		}
	}
	
	var lastFileTime = findLastFileTimeIfExists();
	if (fs.existsSync(this.filePath) && fs.statSync(this.filePath).size > 0 && (new Date()).getTime() > (lastFileTime.getTime() + this.rollMilisec)) {
		return true;
	}
	return false;
};

DcRollingFileStream.prototype.roll = function(filePath, callback) {
	var that = this;
	var filePost = format.asString(LOG_ROLL_PATTERN, new Date());
	var fileNameObject = path.parse(this.filePath);
	var rollFileName = path.join(fileNameObject.dir, fileNameObject.name + '_' + filePost + fileNameObject.ext);
	
	this.closeTheStream(deleteAnyExistingFile.bind(null, 
		renameTheCurrentFile.bind(null,
			this.openTheStream.bind(this, callback))));
	
	function deleteAnyExistingFile(cb) {
	    //on windows, you can get a EEXIST error if you rename a file to an existing file
	    //so, we'll try to delete the file we're renaming to first
	    fs.unlink(rollFileName, function (err) {
	    	//ignore err: if we could not delete, it's most likely that it doesn't exist
	    	cb();
	    });
	}
	
	function renameTheCurrentFile(cb) {
	    fs.rename(filePath, rollFileName, cb);
	}
};

DcRollingFileStream.prototype.end = function(chunk, encoding, callback) {
	var self = this;
	stream.Writable.prototype.end.call(self, function() {
	    self.theStream.end(chunk, encoding, function(err) {
	    	if (callback) {
	    		callback(err);
	    	}
	    });
    });
};
