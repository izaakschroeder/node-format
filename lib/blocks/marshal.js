
var 
	Block = require('../block'),
	util = require('util');

/**
 *
 *
 *
 */
function Marshal(type, flags) {
	Block.call(this);
	this.type = type;
	this.flags = Marshal.normalizeFlags(type, flags);
}
util.inherits(Marshal, Block);

/**
 *
 *
 *
 */
Marshal.normalizeFlags = function(type, flags) {
	switch(type) {
	case Number:
		if (typeof flags === "string")
			return { field: flags }
		else if (typeof flags === "object")
			return flags;
		else
			return { field: "Z" }
	case String:
		if (typeof flags === "string")
			return { encoding: flags }
		else if (typeof flags === "object")
			return flags;
		else
			return { encoding: "utf8" };
	default:
		return flags;
	}
}

/**
 *
 *
 *
 */
function getByte(bytes, i, littleEndian) {
	return bytes[(littleEndian ? bytes.length - i - 1 : i)];
}

function lpad(padString, length) {
	var str = this;
	while (str.length < length)
		str = padString + str;
	return str;
}

function bpad() {
	return lpad.call(this, "0", 8)
}

/**
 *
 *
 *
 */
function getIEEE754(ebits, fbits, bytes, littleEndian) {

	// Bytes to bits
	var str = "";
	for (var i = 0; i < bytes.length; ++i) 
		str += bpad.call(getByte(bytes, i, littleEndian).toString(2))

	// Unpack sign, exponent, fraction
	var bias = (1 << (ebits - 1)) - 1;
	var s = parseInt(str.substring(0, 1), 2) ? -1 : 1;
	var e = parseInt(str.substring(1, 1 + ebits), 2);
	var f = parseInt(str.substring(1 + ebits), 2);

	// Produce number
	if (e === (1 << ebits) - 1) 
		return f !== 0 ? NaN : s * Infinity;
	else if (e > 0) 
		return s * Math.pow(2, e - bias) * (1 + f / Math.pow(2, fbits));
	else if (f !== 0) 
		return s * Math.pow(2, -(bias-1)) * (f / Math.pow(2, fbits));
	else 
		return s * 0;
	
}

/**
 *
 *
 *
 */
function getUint(bytes, littleEndian) {
	var len = bytes.length, bits = len*8, sum = 0;
	for (var i = 0; i < len;  ++i) {
		var b = getByte(bytes, i, littleEndian);
		sum += b * Math.pow(2, bits - ((i+1)*8))
	}
	return sum;
}

/**
 *
 *
 *
 */
function getInt(bytes, littleEndian) {
	var len = bytes.length, b = getUint(bytes, littleEndian);
	return b > Math.pow(2, len*8-1) - 1 ? b - Math.pow(2, len*8) : b;
}

/**
 *
 *
 *
 */
function getUtf8(bytes) {
	var 
		result = "",
		i= 0,
		c = c1 = c2 = 0;

	// Perform byte-order check.
	if(bytes.length >= 3 && (bytes[0] & 0xef) == 0xef && (bytes[1] & 0xbb) == 0xbb && (bytes[2] & 0xbf) == 0xbf ) 
	// Hmm byte stream has a BOM at the start, we'll skip this.
		i= 3;

	while( i < bytes.length ) {
		c = bytes[i] & 0xff;
		if( c < 128 ) {
			result+= String.fromCharCode(c);
			i++;
		}
		else if( (c > 191) && (c < 224) ) {
			if ( i+1 >= bytes.length )
				return Error("Un-expected encoding error, UTF-8 stream truncated, or incorrect");
			c2 = bytes[i+1]&0xff;
			result += String.fromCharCode( ((c&31)<<6) | (c2&63) );
			i+=2;
		}
		else {
			if( i+2 >= bytes.length  || i+1 >= bytes.length )
				return Error("Un-expected encoding error, UTF-8 stream truncated, or incorrect");
			c2 = bytes[i+1] & 0xff;
			c3 = bytes[i+2] & 0xff;
			result += String.fromCharCode( ((c&15)<<12) | ((c2&63)<<6) | (c3&63) );
			i+=3;
		}
	}
	return result;
}

/**
 *
 *
 *
 */
function getAscii(bytes) {
	var result = "";
	for (var i = 0; i < bytes.length; ++i) {
		var c = bytes[i]
		if( c < 128 ) {
			result += String.fromCharCode(c);
			i++;
		}
	}
	return result;
}

/**
 *
 *
 *
 */
Marshal.prototype.decode = function(context, bytes) {
	var littleEndian = context.getOption("endianness") === "little";

	switch(this.type) {
	case Number:
		switch(this.flags.field) {
		case "Z":
			return getInt(bytes, littleEndian);
		case "N":
			return getUint(bytes, littleEndian);
			
		case "R":
			switch(bytes.length) {
			case 4:
				return getIEEE754(8, 23, bytes, littleEndian);
			case 8:
				return getIEEE754(11, 52, bytes, littleEndian);
			default:
				return unsupported();
			}
		default:
			return unsupported();
		}
	case String:
		switch(this.flags.encoding) {
		case "utf8":
			return getUtf8(bytes);
		case "ascii":
			return getAscii(bytes);
		default:
			return unsupported();
		}
		break;
	case Boolean:
		for (var i = 0; i<bytes.length; ++i)
			if (bytes[i])
				return true;
		return false;
	default:
		return unsupported();
	}

}

/**
 *
 *
 *
 */
function setByte(bytes, i, data, littleEndian) {
	bytes[(littleEndian ? bytes.length - i - 1 : i)] = data;
}

/**
 *
 *
 *
 */
function lengthUtf8(data) {
	var insertBOM = false;
	return unescape(encodeURIComponent(data)).length + (insertBOM ? 3:0);
}

/**
 *
 *
 *
 */
function setUtf8(bytes, data) {
	var insertBOM = false, i = 0, len = unescape(encodeURIComponent(data)).length;

	if (insertBOM) {
		len += 3;
	}

	if (len > data.length)
		return new Error("overflow");

	if(insertBOM) {
		bytes[i++] = 0xef;
		bytes[i++] = 0xbb;
		bytes[i++] = 0xbf;
	}

	for (var n = 0; n < data.length; n++) {

		var c = data.charCodeAt(n);

		if (c < 128) {
			bytes[i++]= c;
		}
		else if((c > 127) && (c < 2048)) {
			bytes[i++] = (c >> 6) | 192;
			bytes[i++] = (c & 63) | 128;
		}
		else {
			bytes[i++] = (c >> 12) | 224;
			bytes[i++] = ((c >> 6) & 63) | 128;
			bytes[i++] = (c & 63) | 128;
		}

	}

	return bytes;
}

function lengthAscii(data) {
	return data.length;
}

/**
 *
 *
 *
 */
function setAscii(bytes, data) {
	if (data.length > bytes.length)
		return new Error("overflow");
	for (var n = 0; n < data.length; n++) {
		var c = data.charCodeAt(n);
		bytes[n] = c & 0xFF;
	}
	return bytes;
}

function lengthInt(data) {
	data = data < 0 ? Math.abs(data) : data + 1;
	return Math.ceil((Math.log(data)/Math.log(2) + 1)/8);
}

/**
 *
 *
 *
 */
function setInt(bytes, data, littleEndian) {
	
	var limit = Math.pow(2, bytes.length*8 - 1);
	
	if (data < 0) {
		data += Math.pow(2, bytes.length*8);
		if (data <= limit)
			return new Error("overflow");
	}
	else {
		
		if (data >= limit)
			return new Error("overflow")
	}

	return setUint(bytes, data, littleEndian);
}

function lengthUint(data) {
	if (data < 0)
		return new Error("out of range")
	return Math.ceil(Math.log(data)/Math.log(2)/8);
}

/**
 *
 *
 *
 */
function setUint(bytes, data, littleEndian) {
	var out = [ ], current = data;

	if (data < 0)
		return new Error("out of range");

	do {
		var b = current % 256;
		out.push(b);
		current = (current - b) / 256;
	} while (current);

	if (out.length > bytes.length)
		return new Error("overflow");

	var offset = bytes.length - out.length, i = 0;;

	for (; i < offset; ++i)
		setByte(bytes, i, 0, littleEndian);
	for (; i < bytes.length; ++i)
		setByte(bytes, i, out[out.length - 1 - i + offset], littleEndian)
	
	return bytes;
}

function lengthIEEE754(ebits, fbits) {
	return Math.ceil((ebits + fbits)/8);
}

/**
 *
 *
 *
 */
function setIEEE754(ebits, fbits, bytes, v, littleEndian) {

	var bias = (1 << (ebits - 1)) - 1;

	// Compute sign, exponent, fraction
	var s, e, f;
	if (isNaN(v)) {
		e = (1 << bias) - 1; f = 1; s = 0;
	}
	else if (v === Infinity || v === -Infinity) {
		e = (1 << bias) - 1; f = 0; s = (v < 0) ? 1 : 0;
	}
	else if (v === 0) {
		e = 0; f = 0; s = (1 / v === -Infinity) ? 1 : 0;
	}
	else {
		s = v < 0;
		v = Math.abs(v);

		if (v >= Math.pow(2, 1 - bias)) {
			var ln = Math.min(Math.floor(Math.log(v) / Math.LN2), bias);
			e = ln + bias;
			f = v * Math.pow(2, fbits - ln) - Math.pow(2, fbits);
		}
		else {
			e = 0;
			f = v / Math.pow(2, 1 - bias - fbits);
		}
	}

	// Pack sign, exponent, fraction
	var i, bits = [];
	for (i = fbits; i; i -= 1) { bits.push(f % 2 ? 1 : 0); f = Math.floor(f / 2); }
	for (i = ebits; i; i -= 1) { bits.push(e % 2 ? 1 : 0); e = Math.floor(e / 2); }
	bits.push(s ? 1 : 0);
	bits.reverse();
	var str = bits.join('');

	// Bits to bytes
	i = 0;
	while (str.length) {
		setByte(bytes, i++, parseInt(str.substring(0, 8), 2), littleEndian);
		str = str.substring(8);
	}

	return bytes;
}

Marshal.prototype.guessLength = function(context, data) {
	switch(this.type) {
	case Number:
		if (typeof data !== "number")
			return TypeError();

		switch(this.flags.field) {
		case "Z":
			return lengthInt(data);
		case "N":
			return lengthUint(data);
		case "R":
			//switch(bytes.length) {
			//case 4:
				return lengthIEEE754(8, 23, data);
			//case 8:
			//	return lengthIEEE754(11, 52, data);
			//default:
			//	return unsupported();
			//}
		default:
			return unsupported();
		}
		break;	
	
	case String:
		
		if (typeof data !== "string")
			return TypeError();

		switch(this.flags.encoding) {
		case "utf8":
			return lengthUtf8(data);
		case "ascii":
			return lengthAscii(data);
		default:
			return unsupported();
		}
		break;
	
	case Boolean:
		return 1;
	default:
		return unsupported();
	}
}


/**
 *
 *
 *
 */
Marshal.prototype.encode = function(context, bytes, data) {
	var littleEndian = context.getOption("endianness") === "little";

	switch(this.type) {
	
	case Number:
		
		if (typeof data !== "number")
			return TypeError();

		switch(this.flags.field) {
		case "Z":
			return setInt(bytes, data, littleEndian);
		case "N":
			return setUint(bytes, data, littleEndian);
		case "R":
			switch(bytes.length) {
			case 4:
				return setIEEE754(8, 23, bytes, data, littleEndian);
			case 8:
				return setIEEE754(11, 52, bytes, data, littleEndian);
			default:
				return unsupported();
			}
		default:
			return unsupported();
		}
		break;	
	
	case String:
		
		if (typeof data !== "string")
			return TypeError();

		switch(this.flags.encoding) {
		case "utf8":
			return setUtf8(bytes, data);
		case "ascii":
			return setAscii(bytes, data);
		default:
			return unsupported();
		}
		break;
	
	case Boolean:
		if (typeof data !== "boolean")
			return TypeError();

		for (var i = 0; i<bytes.length; ++i)
			bytes[i] = 0;
		return bytes[bytes.length - 1] = data ? 1 : 0;
	default:
		return unsupported();
	}
}




/**
 *
 *
 *
 */
Marshal.prototype.read = function(context, flags, callback) {
	if (!flags.data)
		return callback("No data given!");
	
	var data = this.decode(context, flags.data)

	if (data instanceof Error)
		return callback(data);

	return callback(undefined, { data: data })
}

/**
 *
 *
 *
 */
Marshal.prototype.write = function(context, flags, callback) {
	if (!flags.data)
		return callback("No data given!");
	
	var length = this.chainOptions.length;

	if (!length)
		length = this.guessLength(context, flags.data);

	if (length instanceof Error)
		return callback(length);

	var 
		buffer = context.backend.buffer(length),
		result = this.encode(context, buffer, flags.data)


	if (result instanceof Error)
		return callback(result);


	return callback(undefined, { data: buffer })
}

/**
 *
 *
 *
 */
Marshal.prototype.toString = function() {
	return "<Marshal "+this.type.name+">";
}

/**
 *
 *
 *
 */
exports.marshal = function(type, flags) {
	return this.pass(new Marshal(type, flags));
}