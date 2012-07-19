
var Format = require('../../format.js')

module.exports = {

	read: {
		setUp: function(done) {
			var target = this.target = [ 0x1, 0x2, 0x3, 0x4 ];
			this.format = Format.create()
				.bytes(this.target.length).as("blob")
				.end();
			this.verify = function(test, object) {
				for (var i = 0; i < target.length; ++i)
					test.strictEqual(object.blob[i], target[i])
			}
			done();
		},

		overflow: function(test) {
			var verify = this.verify;
			Format.read(this.format, [ 0x1, 0x2, 0x3, 0x4, 0x5, 0x6 ], function(err, object) {
				test.strictEqual(err, undefined);
				verify(test, object);
				test.done();
			})
		},

		exact: function(test) {
			var verify = this.verify;
			Format.read(this.format, [ 0x1, 0x2, 0x3, 0x4 ], function(err, object) {
				test.strictEqual(err, undefined);
				verify(test, object);
				test.done();
			})
		},

		underflow: function(test) {
			var verify = this.verify;
			Format.read(this.format, [ 0x1, 0x2 ], function(err, object) {
				test.notStrictEqual(err, undefined);
				test.done();
			})
		}
	},

	write: {
	
		setUp: function(done) {
			var target = this.target = [ 0x1, 0x2, 0x3, 0x4 ];
			var object = this.object = { blob: this.target };
			this.format = Format.create()
				.bytes(this.target.length).as("blob")
				.end();
			this.verify = function(test, buffer) {
				for (var i = 0; i < buffer.length; ++i)
					test.strictEqual(target[i], buffer[i])
			}
			done();
		},

		overflow: function(test) {
			var 
				verify = this.verify, 
				object = this.object,
				output = new Array(6)
			Format.write(this.format, output, object, function(err) {
				test.strictEqual(err, undefined);
				verify(test, output);
				test.done();
			})
		},

		exact: function(test) {
			var 
				verify = this.verify, 
				object = this.object,
				output = new Array(4);
			
			Format.write(this.format, output, object, function(err) {
				test.strictEqual(err, undefined);
				verify(test, output);
				test.done();
			})
		},

		underflow: function(test) {
			var 
				verify = this.verify,
				object = this.object,
				output = new Array(2);
			Format.write(this.format, output, object, function(err) {
				test.notStrictEqual(err, undefined);
				test.done();
			})
		}
	}

}