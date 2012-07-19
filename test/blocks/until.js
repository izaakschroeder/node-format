
var 
	Format = require('../../format');

module.exports = {

	nullStrings: {

		setUp: function(done) {
			this.format = Format.create()
				.until(0).marshal(String).as("message")
				.end();
			done();
		},

		read: function(test) {
			Format.read(this.format, [ "h", "e", "l", "l", "o", 0 ], function(err, obj) {
				//test.strictEqual("hello", obj.message);
				test.done();
			})
		},

		writeSuccess: function(test) {
			var output = new Array(6);
			Format.write(this.format, output, { message: "hello" }, function(err) {
				test.done();
			})
		},

		writeFail: function(test) {
			var output = new Array(6);
			Format.write(this.format, output, { message: "hell\0" }, function(err) {
				test.done()
			})
		}

	},

	lines: {
		setUp: function(done) {
			done();
		},

		read: function(test) {
			test.done();
		}
	},

	bits: {
		setUp: function(done) {
			done();
		},

		read: function(test) {
			test.done();
		}
	}

}