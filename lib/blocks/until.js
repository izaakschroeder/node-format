
var 
	Block = require('../block'),
	util = require('util');

function UntilBlock(condition) {
	Block.call(this, true);
	this.condition = condition;
}
util.inherits(UntilBlock, Block);


UntilBlock.prototype.read = function(context, flags, callback) {
	callback();
}

UntilBlock.prototype.write = function(context, flags, callback) {
	callback();
}

exports.until = function(condition) {
	return this.pass(new UntilBlock(condition))
}