
var 
	Block = require('../block'),
	util = require('util');

/**
 *
 *
 *
 */
function BitsBlock(length, flags) {
	Block.call(this, true);
	this.length = length;
	this.flags = flags;

	if (typeof length !== "number")
		throw new TypeError("Length must be a number!");
}
util.inherits(BitsBlock, Block);

function lpad(padString, length) {
	var str = this;
	while (str.length < length)
		str = padString + str;
	return str;
}

function bpad() {
	return lpad.call(this, "0", 8)
}

function bstr(n) {
	return bpad.call(n.toString(2))
}

/**
 *
 *
 *
 */
BitsBlock.prototype.read = function(context, flags, callback) {
	
	var 
		self = this,
		carry = flags && flags.carry || undefined,
		length = this.length,
		remaining = length,
		bytes = Math.ceil(length / 8),
		bitPosition = flags && flags.bitPosition || 0,
		readBytes = Math.ceil((bitPosition+length)/8) - (bitPosition > 0 ? 1 : 0),
		holder = context.backend.buffer(bytes),
		currentHolder = 0,
		shift = ((Math.ceil(length / 8)*8) - (length + bitPosition)),
		lastByte = 0;

	if (typeof carry !== "undefined") 
		process(carry)



	function process(current) {
		var 
			length = Math.min(8, remaining),
			bitsRead = Math.min(length, 8 - bitPosition),
			value = current & (0xFF >>> bitPosition) & (0xFF << Math.max(0, 8 - bitPosition - length));

		if (shift > 0) {
			holder[currentHolder] |= value >>> shift;
			if (currentHolder+1 < holder.length) 
				holder[currentHolder+1] |= value << (8 - shift) & 0xFF
		}
		else if (shift < 0) {
			holder[currentHolder] |= value << -shift;
			if (currentHolder - 1 >= 0)
				holder[currentHolder-1] |=  value >>> (8 + shift)
		}
		else {
			holder[currentHolder] = value;
		}

		currentHolder++;
		
		remaining -= bitsRead;
		bitPosition = (bitPosition + bitsRead) % 8;
		
		lastByte = current;

		if (remaining <= 0)
			done();
	}

	function done() {

		if (bitPosition !== 0) 
			carry = lastByte;
		else 
			carry = undefined;

		callback(undefined, { bitPosition: bitPosition, carry: carry, data: holder })
	}

	
	bitPosition = 0;
	
	context.stream.read(readBytes, function(err, data) {
		if (err)
			return callback(err);

		for (var i = 0; i<data.length; ++i)
			process(data[i])
	})
}

/**
 *
 *
 *
 */
BitsBlock.prototype.write = function(context, flags, callback) {

	var 
		length = this.length,
		data = flags && flags.data,
		carry = flags.carry || 0,
		bitPosition = flags.bitPosition || 0,
		shift = (8 - length % 8) % 8,
		bytesToWrite = Math.floor((bitPosition + this.length)/8),
		bytes = context.backend.buffer(bytesToWrite),
		bitsRemaining = length;

	if (!data)
		return callback("no data!");

	bytes[0] = carry || 0;

	for (var i = 0; i < bytes.length; ++i) {
		var 
			bitsToCopy = Math.min(8, bitsRemaining),
			bitsCopied = Math.min(bitsToCopy, 8 - bitPosition),
			first = ((data[i] || 0) & (0xFF >>> shift )) << shift,
			next = ((data[i+1] || 0) & (0xFF << ( 8 - shift ))) >>> (8 - shift),
			chunk = first | next,
			piece = (chunk & (0xFF << (8 - bitsToCopy))) >>> bitPosition;

		
		bytes[i] |= piece;
		

		if (bitPosition + bitsCopied >= 8) {
			carry = (chunk & (0xFF >> bitsCopied )) << (bitsCopied);
			bitsCopied += ( bitsToCopy - bitsCopied  );
			if (i + 1 < bytes.length)
				bytes[i+1] |= carry;
		}
		else {
			carry = bytes[i];
		}

		bitPosition = (bitPosition + bitsCopied) % 8;
		
		bitsRemaining -= bitsCopied;

	}

	if (i < data.length) {
		carry |= ((data[i] || 0) & (0xFF >>> shift )) << shift >> bitPosition;
		bitPosition += (8 - shift);
	}

	if (bytesToWrite > 0) {
		context.stream.write(bytes, function(err) {
			if (err)
				callback(err);
			callback(undefined, { bitPosition: bitPosition, carry: carry })
		})
	}
	else {
		callback(undefined, { bitPosition: bitPosition, carry: carry })
	}

}

/**
 *
 *
 *
 */
BitsBlock.prototype.toString = function() {
	return "<Bits "+this.length+">";
}

/**
 *
 *
 *
 */
exports.bits = function(bits) {
	return this.pass(new BitsBlock(bits), { length: Math.ceil(bits/8) });
}