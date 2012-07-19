
var 
	fs = require('fs'),
	async = require('async'),
	Context = require('./lib/context'),
	Block = require('./lib/block'),
	util = require('util');

var backends = [ ]

var dir = __dirname+"/lib/blocks";
fs.readdirSync(dir).forEach(function(block) {
	if (!/.js$/.exec(block))
		return;
	var item = require(dir+"/"+block);
	for (var key in item) {
		Object.defineProperty(Block.prototype, key, {
			value: item[key]
		})
	}
})

var dir = __dirname+"/lib/backends";
fs.readdirSync(dir).forEach(function(block) {
	if (!/.js$/.exec(block))
		return;
	var item = require(dir+"/"+block);
	backends.push(item);
})

function Format() {
	Block.call(this);
}
util.inherits(Format, Block);

Format.prototype.readOrdering = function() {
	var node = this.next, out = [ ];
	while (node) {
		out.push(node);
		node = node.next;
	}
	return out;
}

Format.prototype.writeOrdering = function() {
	var node = this.next, out = [ ];
	while (node) {
		var buffer = [ ];
		do {
			buffer.push(node);
		} while((node = node.next) && !node.pivot);
		//console.log("Got buffer: "+buffer.join(", "))
		buffer.reverse();

		out = out.concat(buffer);
	}
	return out;
}

function prepareChain(nodes, run, context) {
	var chain = nodes.map(function(node) {
			return function(oldFlags, callback) {
				node[run](context, oldFlags, function(err, newFlags) {
					//TODO: Check for pause/resume/etc.
					var flags = { };
					if (!node.pivot)
						for (var i in oldFlags)
							flags[i] = oldFlags[i];
					for (var i in newFlags)
						flags[i] = newFlags[i];
					callback(err, flags)
				});
			} 
		});

	chain[0] = chain[0].bind(undefined, null);
	return chain;
}

Format.prototype.read = function(context, flags, callback) {
	var chain = prepareChain(this.readOrdering(), "read", context);
	async.waterfall(chain, callback);
}

Format.prototype.write = function(context, flags, callback) {
	var chain = prepareChain(this.writeOrdering(), "write", context)
	async.waterfall(chain, callback);
}



Format.prototype.toString = function() {
	return "<Format>";
}

function formatize(node) {
	return node.format();
}


function electBackend(buffer) {
	//Find all possible backends to handle data
	var useable = backends.filter(function(backend) {
		return backend.handles(buffer);
	});

	//If nothing can handle it
	if (useable.length === 0)
		//Bail
		return new Error("Nothing to handle input data format.");

	//Pick the first backend
	//FIXME: If there is more than one, should there be an error?
	return useable[0];
}

module.exports = {
	
	create: function() {
		return new Format();
	},

	extract: formatize,
	
	read: function(format, buffer, callback) {

		if (typeof callback !== "function")
			throw new TypeError();

		var backend = electBackend(buffer);

		if (backend instanceof Error)
			return callback(backend);

		//Pick out the format
		format = formatize(format);

		if (format instanceof Error)
			return callback(format);

		var context = new Context(backend.reader(buffer), backend);

		format.read(context, null, function(err) {
			callback(err, !err ? context.data : undefined);
		});

	},
	write: function(format, buffer, data, callback) {
		
		if (typeof callback !== "function")
			throw new TypeError();

		var backend = electBackend(buffer);

		if (backend instanceof Error)
			return callback(backend);

		//Pick out the format
		format = formatize(format);

		if (format instanceof Error)
			return callback(format);

		var context = new Context(backend.writer(buffer), backend, data);

		format.write(context, null, callback);

	}
};