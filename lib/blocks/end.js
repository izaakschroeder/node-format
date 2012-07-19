
var 
	Block = require('../block'),
	util = require('util');

/**
 *
 *
 *
 */
function EndBlock() {
	Block.call(this, true);
}
util.inherits(EndBlock, Block);

/**
 *
 *
 *
 */
EndBlock.prototype.read = function(context, flags, callback) {
	callback();
}

/**
 *
 *
 *
 */
EndBlock.prototype.write = function(context, flags, callback) {
	callback();
}

/**
 *
 *
 *
 */
EndBlock.prototype.toString = function() {
	return "<End>";
}

/**
 *
 *
 *
 */
exports.end = function() {
	this.pass(new EndBlock());
	return this.format();
}