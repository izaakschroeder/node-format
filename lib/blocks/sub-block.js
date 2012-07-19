
var 
	Block = require('../block'),
	util = require('util');

function SubBlock(subBlock) {
	Block.call(this, true);
	if (subBlock instanceof Block === false)
		throw new TypeError("Must give block object!");
	this.subBlock = subBlock.format();
}
util.inherits(SubBlock, Block);

/**
 *
 *
 *
 */
SubBlock.prototype.read = function(stream, context, flags) {

}

/**
 *
 *
 *
 */
SubBlock.prototype.write = function(stream, context, flags) {

}
/**
 *
 *
 *
 */
SubBlock.prototype.toString = function() {
	return "<Block\n"+this.subBlock.toString()+"\n>";
}

/**
 *
 *
 *
 */
exports.block = function(callback) {
	return this.pass(new SubBlock(callback));
}