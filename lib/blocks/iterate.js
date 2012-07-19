
var 
	Block = require('../block'),
	async = require('async'),
	util = require('util');

/**
 *
 *
 *
 */
function IterateBlock(count, block) {
	Block.call(this, true);
	this.condition = IterateBlock.normalize(count);
	if (block instanceof Block === false)
		throw new TypeError("Block not given! Got "+block);
	this.subBlock = block.format();
}
util.inherits(IterateBlock, Block);

IterateBlock.normalize = function(condition) {
	switch(typeof condition) {
	case "number":
		return function(context) {
			var count = condition;
			return function() { return count-- > 0; }
		}
	case "string":
		return function(context) {
			var count = context.get(condition);
			return function() { return count-- > 0; }
		}
	case "function":
		return count;
	default:
		throw new TypeError();
	}
}

/**
 *
 *
 *
 */
IterateBlock.prototype.loop = function(context, each, callback) {
	async.whilst(this.condition(context), each, callback)
}

/**
 *
 *
 *
 */
IterateBlock.prototype.read = function(context, flags, callback) {
	var format = this.subBlock, items = [ ];
	this.loop(context, function(callback) {
		var child = context.fork();
		format.read(child, {}, function(err) {
			items.push(child.data);
			callback(err);
		});
	}, function(err) {
		callback(err, { data: items });
	});
}

/**
 *
 *
 *
 */
IterateBlock.prototype.write = function(context, flags, callback) {
	var format = this.subBlock, items = flags.data, i = 0;
	
	if (!Array.isArray(items))
		return callback("type error");
	
	this.loop(context, function(callback) {
		if (i >= items.length)
			return callback("overflow");
		format.write(context.fork(items[i++]), {}, callback);
	}, callback);
}

/**
 *
 *
 *
 */
IterateBlock.prototype.toString = function() {
	return "<Iterate>";
}

/**
 *
 *
 *
 */
exports.iterate = function(callback, block) {
	return this.pass(new IterateBlock(callback, block));
}