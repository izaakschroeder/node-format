
exports.magic = function(what) {
	if (Array.isArray(what))
		return this.bytes(what.length).expect(what);
	switch(typeof what) {
	case "string":
		return this.bytes(what.length).marshal(String).expect(what)
	default:
		throw new TypeError();
	}
	
}