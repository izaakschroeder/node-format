

var 
	Stream = require('stream').Stream,
	util = require('util');

function BufferedReader() {
	Stream.call(this);
	this.writable = true;
	this.buffers = [ ];
	this.callbacks = [ ];
	this.position = 0;
	this.readHead = 0;
	this.bufferOffset = 0;
	this.virtualPosition = 0;
}
util.inherits(BufferedReader, Stream);

BufferedReader.prototype.write = function(data) {
	this.buffers.push(data);
	this.readHead += data.length;
	this.processCallbacks();
}

BufferedReader.prototype.processCallbacks = function() {
	this.callbacks.forEach(function(callback) {

		var neededBuffers = [ ], remove = -1, neededLength = callback.length;

		//If the callback wants data we don't have yet
		if (callback.position + callback.length > this.readHead)
			//Bail
			return;

		if (this.position > callback.position )
			return;

		//Loop through all our buffers, starting with oldest first
		for (var i = 0; i < this.buffers.length; ++i) {
			//Get the buffer
			var buffer = this.buffers[i];
			
			//Calculate how much of the buffer we need to use
			var end = Math.min(this.bufferOffset + neededLength, buffer.length);
			//Get the part of the buffer we're interested in
			var part = buffer.slice(this.bufferOffset, end);
			//Add to how much data we've actually read from the buffers
			this.position += part.length;
			//Remove the block we've read from how much we need
			neededLength -= part.length;
			//Add it to the list of buffers to send to the callback
			neededBuffers.push(part)
			//Update our position in that individual buffer
			this.bufferOffset = end;

			//If we haven't used up the buffer
			if (this.bufferOffset <= buffer.length)
				//We're done
				break;
			
			//Set the index of the last buffer we used completely
			remove = i;

			//Otherwise reset the buffer pointer and get the next buffer
			this.bufferOffset = 0;
		}


		//Remove all the buffers we just used
		if (remove >= 0)
			this.buffers.splice(0, remove);

		if (neededBuffers.length === 1)
			callback.callback(undefined, neededBuffers[0]);
		else
			callback.callback(undefined, Buffer.concat(neededBuffers));

	}, this)
}

BufferedReader.prototype.use = function(units, callback) {
	
	if (typeof callback !== "function")
		throw new TypeError("Must pass valid callback function!");
	if (units < 0)
		return callback("Units to read must be greater than or equal to 0.");
	if (units === 0)
		return callback(undefined, new Buffer(0));
	this.callbacks.push({
		callback: callback,
		position: this.virtualPosition,
		length: units
	});
	this.virtualPosition += units;
	this.processCallbacks();
	return this;
}

BufferedReader.prototype.end = function() {
	this.emit("end");
}




module.exports = {
	
	handles: function(buffer) {
		return buffer instanceof Stream;
	},

	buffer: function(bytes) {
		return new Buffer(bytes);
	},

	reader: function(buffer) {
		var b = new BufferedReader();
		buffer.pipe(b);
		return {
			read: function(bytes, callback) {
				b.use(bytes, callback)
			}
		}
	},

	writer: function(buffer) {
		return {
			write: function(bytes, callback) {
				buffer.write(bytes);
			}
		}
	}

}