
var 
	Block = require('../block'),
	util = require('util');

/**
 *
 *
 *
 */
function AccumulateBlock(callback) {
	Block.call(this);
	this.callback = callback;
}
util.inherits(AccumulateBlock, Block);

/**
 *
 *
 *
 */
AccumulateBlock.prototype.read = function() {

}

/**
 *
 *
 *
 */
AccumulateBlock.prototype.write = function() {

}

exports.accumulate = function(callback) {
	return this.pass(new AccumulateBlock(callback));
}