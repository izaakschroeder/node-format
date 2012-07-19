
module.exports = {
	handles: function(input) {
		return Array.isArray(input);
	},

	buffer: function(bytes) {
		return new Array(bytes);
	},

	concat: function() {
		var first = arguments[0];
		return Array.prototype.concat.apply(first, Array.prototype.slice.call(arguments, 1));
	},

	reader: function(buffer) {
		var offset = 0;
		return {
			read: function(bytes, callback) {
				if (offset+bytes > buffer.length)
					return callback("underflow");
				
				var out = buffer.slice(offset, offset+bytes);
				offset += bytes;
				callback(undefined, out);
			}
		}
	},

	writer: function(buffer) {
		var offset = 0;
		return {
			write: function(bytes, callback) {
				if (offset + bytes.length > buffer.length)
					return callback("overflow");
				Array.prototype.splice.bind(buffer, offset, bytes.length).apply(buffer, bytes);
				offset += bytes.length;
				callback();
			}
		}
	}

}

