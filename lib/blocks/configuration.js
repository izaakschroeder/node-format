
var 
	Block = require('../block'),
	util = require('util');

/**
 *
 *
 *
 */
function ConfigurationBlock(options) {
	Block.call(this, true);
	this.options = options;
}
util.inherits(ConfigurationBlock, Block);

/**
 *
 *
 *
 */
ConfigurationBlock.prototype.configure = function(context) {
	for (var key in this.options)
		context.setOption(key, this.options[key]);
}

/**
 *
 *
 *
 */
ConfigurationBlock.prototype.read = function(context, flags, callback) {
	this.configure(context);
	callback(null, null);
}

/**
 *
 *
 *
 */
ConfigurationBlock.prototype.write = function(context, flags, callback) {
	this.configure(context);
	callback(null, null);
}

/**
 *
 *
 *
 */
ConfigurationBlock.prototype.toString = function() {
	return "<Configure>";
}

/**
 *
 *
 *
 */
exports.configure = function(options) {
	return this.pass(new ConfigurationBlock(options));
}