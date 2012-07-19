
module.exports = {
	encode: function(buffer, options, data) {

		var type = options.type, flags = Block.normalizeFlags(options.flags);

		switch(type) {
		case Number:
			var field = flags.field;
			switch(buffer.length) {
			case 1:
				switch(field) {
				case "Z":
					return data.writeInt8(data, 0);
				case "N":
					return data.writeUInt8(data, 0);
				default:
					return unsupported;
				};
			case 2:
				switch(field) {
				case "Z":
					if (endianness === "little")
						return data.writeInt16LE(data, 0);
					else
						return data.writeInt16BE(data, 0);
				case "N":
					if (endianness === "little")
						return data.writeUInt16LE(data, 0);
					else
						return data.writeUInt16BE(data, 0);
				default:
					return unsupported;
				}
				
				
			case 4:
				switch(field) {
				case "Z":
					if (endianness === "little")
						return data.writeInt32LE(data, 0);
					else
						return data.writeInt32BE(data, 0);
				case "N":
					if (endianness === "little")
						return data.writeUInt32LE(data, 0);
					else
						return data.writeUInt32BE(data, 0);
				case "R":
					if (endianness === "little")
						return data.writeFloatLE(data, 0);
					else
						return data.writeFloatBE(data, 0);
				default:
					return unsupported;
				}
				
			case 8:
				switch(field) {
				case "R":
					if (endianness === "little")
						return data.writeDoubleLE(data, 0);
					else
						return data.writeDoubleBE(data, 0);
				default:
					return unsupported;
				}
			}
		case String:
			return data.toString("utf8");
		case Boolean:
			return data.readUInt8(0) !== 0;
		default:
			return unsupported;
		}
	},

	decode:  function(buffer, options) {

		var type = options.type, flags = Block.normalizeFlags(options.flags);
		
		switch(type) {
		case Number:
			var field = flags.field;
			switch(buffer.length) {
			case 1:
				switch(field) {
				case "Z":
					return data.readInt8(0);
				case "N":
					return data.readUInt8(0);
				default:
					return unsupported;
				};
			case 2:
				switch(field) {
				case "Z":
					if (endianness === "little")
						return data.readInt16LE(0);
					else
						return data.readInt16BE(0);
				case "N":
					if (endianness === "little")
						return data.readUInt16LE(0);
					else
						return data.readUInt16BE(0);
				default:
					return unsupported;
				}
				
				
			case 4:
				switch(field) {
				case "Z":
					if (endianness === "little")
						return data.readInt32LE(0);
					else
						return data.readInt32BE(0);
				case "N":
					if (endianness === "little")
						return data.readUInt32LE(0);
					else
						return data.readUInt32BE(0);
				case "R":
					if (endianness === "little")
						return data.readFloatLE(0);
					else
						return data.readFloatBE(0);
				default:
					return unsupported;
				}
				
			case 8:
				switch(field) {
				case "R":
					if (endianness === "little")
						return data.readDoubleLE(0);
					else
						return data.readDoubleBE(0);
				default:
					return unsupported;
				}
			}
		case String:
			return data.toString("utf8");
		case Boolean:
			return data.readUInt8(0) !== 0;
		default:
			return unsupported;
		}
	},

	buffer: function(bytes) {
		return new Buffer(bytes);
	},
	
	concat: function() {
		return Buffer.concat(arguments);
	},
	
	handles: function(input) {
		return (typeof Buffer !== "undefined") && (input instanceof Buffer);
	},


	reader: function(buffer) {
		var offset = 0;
		return {
			read: function(bytes, callback) {
				if (offset + bytes > buffer.length)
					return callback("underflow");
				var last = offset;
				offset += bytes;
				callback(undefined, buffer.slice(last, offset));
			},
			end: function(callback) {
				
			}
		}
	},

	writer: function(buffer) {
		var offset = 0;
		return {
			write: function(bytes, callback) {
				if (offset + bytes.length > buffer.length)
					return callback("overflow");
				for (var i = 0; i < bytes.length; ++i, ++offset)
					buffer[offset] = bytes[i];
				callback()
			},
			end: function(callback) {
				callback(buffer);
			}
		}
	}
}
