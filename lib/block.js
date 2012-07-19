
/**
 *
 *
 *
 */
function Block(pivot) {
	this.next = null;
	this.previous = null;
	this.pivot = pivot || false;
	this.chainOptions = { };
}

/**
 *
 *
 *
 */
Block.prototype.format = function() {
	var node = this;
	while (node.previous && (node = node.previous));
	return node;
}

Block.prototype.clone = function() {
	throw new Error();
}

/**
 *
 *
 *
 */
Block.prototype.read = function(context, flags, callback) {
	callback("Calling read on plain block!");
}

/**
 *
 *
 *
 */
Block.prototype.write = function(context, flags, callback) {
	callback("Calling write on plain block!");
}

/**
 *
 *
 *
 */
Block.prototype.pass = function(block, chainOptions) {
	block.previous = this;
	this.next = block;

	if (!block.pivot)
		for (var k in this.chainOptions)
			block.chainOptions[k] = this.chainOptions[k];

	for (var k in chainOptions)
		block.chainOptions[k] = chainOptions[k];

	return block;
}

module.exports = Block;