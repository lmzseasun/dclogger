var fs = require('fs');
var os = require('os');
var uuid = require('node-uuid');
var util = require('util');
var path = require('path');
var mkdirp = require('mkdirp');
var stream = require('readable-stream');
var format = require('date-format');
var LOG_ROLL_PATTERN = 'yyyy-MM-dd_hhmmss';
var DAY_FORMAT = 'yyyy-MM-dd';
var ROLL_INTERVAL = 1000 * 60 * 5;
var ROLL_SIZE = 40 * 1024 * 1024;
var EOL = os.EOL || '\n';

module.exports = DcRollingFileStream;

function DcRollingFileStream(appId, options) {
	if (!appId) {
		throw new Error('You must specify a appId');
	}
	this.appId = appId;
	var options = options || {};
	this.fileOptions = {};
	this.fileOptions.encoding = options.encoding || 'utf8';
	this.fileOptions.mode = options.mode || parseInt('0644', 8);
	this.fileOptions.flags = options.flags || 'a';	
	this.rollMilisec = options.rollMilisec || ROLL_INTERVAL;
	this.rollSize = options.rollSize || ROLL_SIZE;
	this.dataRoot = options.dataRoot || '/data/dclogger';
	this.dateUuid = {};
	this.openTheStream();
};

DcRollingFileStream.prototype.openTheStream = function(callback) {
	var now = new Date();
	var logDateString = format(DAY_FORMAT, now);	
	mkdirp.sync(this.dataRoot);
	var subDir = this.dataRoot + '/' + logDateString + '/' + this.appId;
	mkdirp.sync(subDir);
	var fileName = this._getRollingFileName(now);
	this.theStream = fs.createWriteStream(subDir + '/' + fileName, this.fileOptions);
	if (callback) {
		this.theStream.on("open", callback);
	}
};

DcRollingFileStream.prototype.write = function(logInfo) {
	function replacer(key, value) {
		if (typeof value === 'string' && (value === '' || value === null)) {
			return undefined;
		}
		return value;
	}
	
	var that = this;
	var chunk = JSON.stringify(logInfo, replacer) + EOL;
	if (this.shouldRoll()) {
		this.theStream.end(this.openTheStream( () => {
			that.openTheStream(() => {
				that.write(logInfo);
			});
		}));
	} else {		
		this.theStream.write(chunk, this.fileOptions.encoding);
	}
};

DcRollingFileStream.prototype._getRollingFileName = function(time) {
	var that = this;
	var dateStr = format(DAY_FORMAT, time);
	function findUuidIfExists() {
		var uuidStr = that.dateUuid[dateStr];
		if (!uuidStr) {
			uuidStr = uuid.v4();
			that.dateUuid[dateStr] = uuidStr;
		}
		return uuidStr;
	}
	var logFileTimeString = format.asString(LOG_ROLL_PATTERN, time);
	var uuidStr = findUuidIfExists();
	return 'dclogger_nodejs.' + logFileTimeString + '_' + this.appId + '_' + uuidStr + '.log';
};

DcRollingFileStream.prototype.shouldRoll = function() {
	var that = this;
	var logDateString = format(DAY_FORMAT, new Date());
	var fileNameObject = path.parse(this.theStream.path);
	var fileNameArray = fileNameObject.name.split('_');
	var uuid = fileNameArray[4];
	var fileDateString = fileNameArray[1].replace('nodejs.', '');
	
	function justTheseFiles(item) {
		return item.endsWith(uuid + fileNameObject.ext);
	}
	
	function findLastFileTimeIfExists() {
		var files = fs.readdirSync(fileNameObject.dir);
		var filesToProcess = files.filter(justTheseFiles).sort();
		if (filesToProcess.length > 1) {
			return fs.statSync(path.join(fileNameObject.dir, filesToProcess[filesToProcess.length - 1])).mtime;
		} else if (fs.existsSync(that.theStream.path)){
			return fs.statSync(that.theStream.path).birthtime;
		} else {
			return that.now;
		}
	}
	
	if (logDateString === fileDateString) {
		var lastFileTime = findLastFileTimeIfExists();
		if (fs.existsSync(this.theStream.path) && fs.statSync(this.theStream.path).size > 0 && ((new Date()).getTime() > (lastFileTime.getTime() + this.rollMilisec) || fs.statSync(this.theStream.path).size > 20 * 1024 * 1024)) {
			return true;
		}
		return false;
	} else {
		return true;
	}
};