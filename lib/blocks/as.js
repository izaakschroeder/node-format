
var 
	Block = require('../block'),
	util = require('util');

/**
 *
 *
 *
 */
function As(name) {
	Block.call(this);
	this.name = name;
}
util.inherits(As, Block);

/**
 *
 *
 *
 */
As.prototype.read = function(context, flags, callback) {
	if (!flags.data)
		return callback("No data given!");
	context.set(this.name, flags.data);
	callback();
}

/**
 *
 *
 *
 */
As.prototype.write = function(context, flags, callback) {
	var data = context.get(this.name);
	if (typeof data === "undefined")
		return callback("No such property!");
	callback(undefined, { data: data })
}

/**
 *
 *
 *
 */
As.prototype.toString = function() {
	return "<As "+this.name+">";
}

/**
 *
 *
 *
 */
exports.as = function(name) {
	return this.pass(new As(name))
}