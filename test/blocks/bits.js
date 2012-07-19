
var
	Format = require('../../format');

module.exports = {
	basic: {
		
		setUp: function(done) {
			this.format = Format.create()
				.bits(3).as(0)
				.bits(7).as(1)
				.bits(1).as(2)
				.bits(5).as(3)
				.bits(16).as(4)
				.bits(1).as(5)
				.bits(18).as(6)
				.bits(5).as(7)
				.end();
			
			//Raw input/output data
			//    0        1       2       3       4         5       6
			//11011110 01110100 00101110 00111111 10101010 01010100 11011101 
			//
			//  0       1     2    3             4           5              6           7
			//[110][11110 01][1][10100] [00101110 00111111] [1][0101010 01010100 110][11101] 
			this.data = [ 0xDE, 0x74, 0x2E, 0x3F, 0xAA, 0x54, 0xDD ];
			
			//Object target
			this.target = [
				[0x06], //00000110
				[0x79], //01111001
				[0x01], //00000001
				[0x14], //00010100
				[0x2E, 0x3F], //00101110 00111111
				[0x01], //0000001
				[0x01, 0x52, 0xA6], //00000001 01010010 10100110
				[0x1D] //00011101
			];

			done();
		},
		
		read: function(test) {
			var target = this.target;
			Format.read(this.format, this.data, function(err, object) {
				
				//Check for no error
				test.strictEqual(err, undefined);

				for (var i in target)
					for (var j = 0; j < target[i].length; ++j)
						test.strictEqual(object[i][j], target[i][j], "Byte "+j+" of property "+i);
				
				//Finish the test
				test.done();
			})
		},

		write: function(test) {
			var data = this.data, output = new Array(data.length);
			Format.write(this.format, output, this.target, function(err) {
				test.strictEqual(err, undefined);
				for(var i = 0; i<output.length; ++i)
					test.strictEqual(output[i], data[i], "Checking byte "+i)
				test.done();
			})
		}
	}
	
}