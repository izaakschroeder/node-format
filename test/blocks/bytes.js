
var
	Format = require('../../format');

module.exports = {
	basic: {
		setUp: function(done) {
			this.format = Format.create()
				.bytes(4).as(0)
				.bytes(1).as(1)
				.bytes(2).as(2)
				.end();
			this.data = [ 0xDE, 0x74, 0x2E, 0x3F, 0xAA, 0x54, 0xDD ];
			this.target = [
				[ 0xDE, 0x74, 0x2E, 0x3F ],
				[ 0xAA ],
				[ 0x54, 0xDD ]
			];
			done()
		},
		

		read: function(test) { 
			var target = this.target;
			Format.read(this.format, this.data, function(err, object) {
				//Check for no error
				test.strictEqual(err, undefined);
				for (var i in target)
					for (var j = 0; j < target[i].length; ++j)
						test.strictEqual(object[i][j], target[i][j])
				test.done();
			});

		},

		write: function(test) {
			var data = this.data, output = new Array(data.length);
			Format.write(this.format, output, this.target, function(err) {
				test.strictEqual(err, undefined);
				for(var i = 0; i<output.length; ++i)
					test.strictEqual(output[i], data[i]);
				test.done();
			})


		}
	}
}