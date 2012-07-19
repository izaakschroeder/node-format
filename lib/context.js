



/**
 *
 *
 *
 */
function Context(stream, backend, data) {
	this.data = data || { };
	this.stream = stream;
	this.backend = backend;
	this.configuration = { 
		endianness: "little"
	};
}

/**
 *
 *
 *
 */
Context.prototype.getOption = function(name) {
	return this.configuration[name];
}

/**
 *
 *
 *
 */
Context.prototype.setOption = function(name, value) {
	this.configuration[name] = value;
}

/**
 *
 *
 *
 */
Context.prototype.get = function(name) {
	return this.data[name];
}

/**
 *
 *
 *
 */
Context.prototype.set = function(name, value) {
	if (typeof this.data[name] !== "undefined")
		throw new Error("Value "+name+" is already set!");
	this.data[name] = value;
	return this;
}

/**
 *
 *
 *
 */
Context.prototype.fork = function(data) {
	return new Context(this.stream, this.backend, data);
}

/**
 *
 *
 *
 */
module.exports = Context;