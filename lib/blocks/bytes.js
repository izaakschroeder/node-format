
var 
	Block = require('../block'),
	util = require('util');

/**
 *
 *
 *
 */
function BytesBlock(length, flags) {
	Block.call(this, true);
	this.length = length;
	this.flags = flags;
}
util.inherits(BytesBlock, Block);

/**
 *
 *
 *
 */
BytesBlock.prototype.read = function(context, flags, callback) {
	var self = this;
	
	context.stream.read(this.length, function(err, bytes) {
		if (err)
			return callback(err);
		callback(undefined, { data: bytes })
	})
}

/**
 *
 *
 *
 */
BytesBlock.prototype.write = function(context, flags, callback) {
	if (typeof flags.data === "undefined")
		callback("No data!");

	if (flags.data.length > this.length) {
		callback("overflow");
	}
	else if (flags.data.length < this.length) {



		var padding = context.backend.buffer(this.length - flags.data.length);
		if (context.getOption("endianness") === "little") {
			context.stream.write(padding, function(err) {
				if (err)
					return callback(err);
				context.stream.write(flags.data, callback);
			})
			
		}
		else {
			context.stream.write(flags.data, function(err) {
				if (err)
					return callback(err);
				context.stream.write(padding, callback)
			});
			
		}
	}
	else {
		context.stream.write(flags.data, callback);
	}

	
}

/**
 *
 *
 *
 */
BytesBlock.prototype.toString = function() {
	return "<Bytes "+this.length+">";
}

/**
 *
 *
 *
 */
exports.bytes = function(bytes) {
	return this.pass(new BytesBlock(bytes), { length: bytes });
}