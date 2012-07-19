
var 
	async = require('async'),
	Block = require('../block'),
	util = require('util');

/**
 *
 *
 *
 */
function ExpectBlock(expectation, flags) {
	Block.call(this);
	this.expectations = [ ExpectBlock.normalize(expectation, flags) ];
	this.default = expectation || flags.default;
}
util.inherits(ExpectBlock, Block);

/**
 *
 *
 *
 */
ExpectBlock.prototype.or = function(expectation, flags) {
	this.expectations.push( ExpectBlock.normalize(expectation, flags) );
	return this;
}

ExpectBlock.normalize = function(expectation) {
	if (Array.isArray(expectation)) {
		var bytes = expectation.map(function(b) {
			switch(typeof b) {
			case "number":
				return b & 0xFF;
			case "string":
				return b.charCodeAt(0);
			default:
				throw new TypeError();
			}
		})
		return function(bytes, data, callback) {
			if (data.length !== bytes.length)
				return callback(undefined, false);
			for (var i = 0; i < bytes.length; ++i)
				if (bytes[i] !== data[i])
					return callback(undefined, false);
			return callback(undefined, true);
		}.bind(undefined, bytes);
	}
	
	switch(typeof expectation) {
	case "function":
		return expectation;
	case "number":
	case "string":
	case "boolean":
		return function(data, callback) {
			callback(undefined, data === expectation);
		}
	default:
		throw new TypeError();
	}
}

ExpectBlock.prototype.process = function(context, flags, callback) {
	var self = this;
	
	async.map(this.expectations, function(item, callback) {
		item(flags.data, callback);
	}, function(err, results) {
		
		if (err)
			return callback(err);
		
		var success = results.some(function(i) {
			return i === true;
		});

		if (success)
			return callback();
		else
			return callback("expectation failed!");
	})	
}

/**
 *
 *
 *
 */
ExpectBlock.prototype.write = function(context, flags, callback) {
	//If there is no data explicity passed in the user has most likely
	//not aliased the data and thus it's likely some kind of "magic"
	//value which we can just check against
	var data = typeof flags.data !== "undefined" ? flags.data : this.default;
	//Run the usual
	this.process(context, flags, callback);
}

/**
 *
 *
 *
 */
ExpectBlock.prototype.read =  function(context, flags, callback) {
	if (!flags.data)
		return callback("No data given!");
	this.process(context, flags, callback)
}

/**
 *
 *
 *
 */
ExpectBlock.prototype.toString = function() {
	return "<Expect "+this.expectations+">";
}

/**
 *
 *
 *
 */
exports.expect = function(what, flags) {
	return this.pass(new ExpectBlock(what, flags));
}
