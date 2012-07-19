
var ArrayBackend = require('./array');


/**
 *
 *
 * http://stackoverflow.com/questions/1240408/reading-bytes-from-a-javascript-string
 */
function stringToBytes(str) {
	var ch, st, re = [];
	for (var i = 0; i < str.length; i++ ) {
		ch = str.charCodeAt(i); // get char 
		st = []; // set up "stack"
		do {
			st.push( ch & 0xFF ); // push byte to stack
			ch = ch >> 8; // shift value down by 1 byte
		} while ( ch );
		// add stack contents to result
		// done because chars have "wrong" endianness
		re = re.concat( st.reverse() );
	}
	// return an array of bytes
	return re;
}

/**
 *
 *
 *
 */
function bytesToString() {
	var out = "";
	for (var i = 0; i < bytes.length; ++i)
		out += String.fromCharCode(bytes[i]);
	return out;
}

module.exports = {

	handles: function(input) {
		return (typeof input === "string") || (input instanceof String);
	},
	
	reader: function(buffer) {
		return ArrayBackend.reader(stringToBytes(buffer))
	},


	writer: function(buffer) {
		var writer = ArrayBackend.writer([]);
		return {
			write: function(bytes, callback) {
				writer.write(bytes, callback)
			}
		}
	}
}
