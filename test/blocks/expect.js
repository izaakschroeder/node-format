
var 
	Format = require('../../format'),
	async = require('async');

module.exports = {
	strings: {

		setUp: function(done) {
			this.string = "hello world";
			this.format = Format.create()
				.bytes(this.string.length).marshal(String).expect(this.string).as("test")
				.end();
			done();
		},

		readOk: function(test) {
			var string = this.string;
			Format.read(this.format, string, function(err, object) {
				test.strictEqual(err, undefined);
				test.done();
			});

			
		},

		readFail: function(test) {
			Format.read(this.format, "h3llo world", function(err, object) {
				test.notStrictEqual(err, undefined);
				test.done();
			});
		},

		writeOk: function(test) {
			var output = new Buffer(this.string.length);
			Format.write(this.format, output, { test: this.string }, function(err) {
				test.strictEqual(err, undefined);
				test.done();
			})

			
		},

		writeFail: function(test) {
			var output = new Buffer(this.string.length);
			Format.write(this.format, output, { test: "h3llo world" }, function(err) {
				test.notStrictEqual(err, undefined);
				test.done();
			})
		}
	},
	
	multiple: {
		setUp: function(done) {
			this.format = Format.create()
				.bytes(1).marshal(Number, "N").expect(0x04).or(0x5E)
				.end();
			done();
		},
		readOk1: function(test) {
			
			Format.read(this.format, [0x04], function(err, object) {
				test.strictEqual(err, undefined);
				test.done();
			})
		},
		readOk2: function(test) {
			Format.read(this.format, [0x5E], function(err, object) {
				test.strictEqual(err, undefined);
				test.done();
			});
		},
		readFail: function(test) {
			Format.read(this.format, [0x55], function(err, object) {
				test.notStrictEqual(err, undefined);
				test.done();
			})
		}
	},
	
	bytes: {
		setUp: function(done) {
			this.format = Format.create()
				.bytes(3).expect([0xFE, "q", "\0"]).as("test")
				.end();
			done();
		},

		read: function(test) {
			Format.read(this.format, [0xFE, 0x71, 0], function(err, object) {
				test.strictEqual(err, undefined);
				test.done();
			});
		},

		writeFail: function(test) {
			var out = new Array(3)
			Format.write(this.format, out, { test: [0xFE, 0x71, 0x04] }, function(err, object) {
				test.notStrictEqual(err, undefined);
				test.done();
			});
		},

		writeOk: function(test) {
			var out = new Array(3)
			Format.write(this.format, out, { test: [0xFE, 0x71, 0x0] }, function(err, object) {
				test.strictEqual(err, undefined);
				test.done();
			});
		},
	},

	callbacks: {
		setUp: function(done) {
			this.format = Format.create()
				.bytes(1).expect(function(data, callback) {
					callback(undefined, data[0] === 5)
				})
				.end();
			done();
		},

		readOk: function(test) {
			Format.read(this.format, [0x05], function(err, object) {
				test.strictEqual(err, undefined);
				test.done();
			});
		},

		readFail: function(test) {
			Format.read(this.format, [0x04], function(err, object) {
				test.notStrictEqual(err, undefined);
				test.done();
			});
		},

		write: function(test) {
			test.done();
		}

	}
}