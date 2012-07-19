

module.exports = {

	buffer: function(bytes) {
		return new Uint8Buffer(bytes);
	},


	concat: function() {
		var total = 0, last = 0, out;

		for(var i = 0; i < arguments.length; ++i)
			total += arguments[i].byteLength;

		out = new Uint8Array(total);

		for (var i = 0; i < arguments.length; last = arguments[i].byteLength, ++i) 
			out.set( new Uint8Array( arguments[i] ), last );
		return out;
	},

	encode: function() {
		var littleEndian = endianness === "little";
		view.setInt8(0, data, littleEndian);
		view.setUint8(0, data, littleEndian);
		view.setInt16(0, data, littleEndian);
		view.setUint16(0, data, littleEndian);
		view.setInt32(0, data, littleEndian);
		view.setUint32(0, data, littleEndian);
		view.setFloat32(0, data, littleEndian);
		view.setFloat64(0, data, littleEndian);
	},

	decode: function() {
		var littleEndian = endianness === "little"
		view.getInt8(0, littleEndian);
		view.getUint8(0, littleEndian);
		view.getInt16(0, littleEndian);
		view.getUint16(0, littleEndian);
		view.getInt32(0, littleEndian);
		view.getUint32(0, littleEndian);
		view.getFloat32(0, littleEndian);
		view.getFloat64(0, littleEndian);
	},

	handles: function(input) {
		return (typeof DataView !== "undefined") && (input instanceof ArrayBuffer);
	},

	reader: function(buffer) {
		var offset = 0;
		buffer = new Uint8Array(buffer);
		return {
			read: function(bytes, callback) {
				if (offset+bytes > buffer.length)
					return callback("underflow");
				var last = offset;
				offset += bytes;
				callback(undefined, buffer.subarray(last, offset));
			}
		}
	},

	writer: function(buffer) {
		var offset = 0;
		buffer = new Uint8Array(buffer)
		return {
			write: function(bytes, callback) {
				if (offset+bytes.length > buffer.length)
					return callback("overflow");
				buffer.set(bytes, offset);
				offset += bytes.length;
				callback();
			}
		}
	}
}
