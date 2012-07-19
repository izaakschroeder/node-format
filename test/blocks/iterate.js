
var 
	Format = require('../../format');

module.exports = {
	fixed: {
		setUp: function(done) {
			this.data = [ 
				0x94, 0x75, 
				0x20, 0x36, 
				0x33, 0x07,
				0x00, 0xFF,
				0x3D, 0x40
			];
			this.object = {
				items: [
					{ item: 30100 },
					{ item: 13856 },
					{ item: 1843 },
					{ item: 65280 },
					{ item: 16445 },
				]
			}
			this.format = Format.create()
				.iterate(5, Format.create()
					.bytes(2).marshal(Number, "N").as("item").end()
				).as("items").end();
			done();
		},

		read: function(test) {
			var target = this.object;
			Format.read(this.format, this.data, function(err, object) {
				test.notStrictEqual(object.items, undefined)
				test.strictEqual(object.items.length, 5);
				for (var i = 0; i < object.items.length; ++i)
					test.strictEqual(target.items[i].item, object.items[i].item);
				test.done();
			})
		},

		write: function(test) {
			var target = this.data, buffer = new Array(target.length);
			Format.write(this.format, buffer, this.object, function(err) {
				test.strictEqual(err, undefined);
				for (var i = 0; i < buffer.length; ++i)
					test.strictEqual(buffer[i], target[i]);
				test.done();
			})
		}
	},

	variable: {
		setUp: function(done) {
			this.data = [
				0x03,
				0x01, 0x00,
				0x02, 0x00,
				0x03, 0x00
			];
			this.object = {
				count: 3,
				items: [
					{ item: 0x01 },
					{ item: 0x02 },
					{ item: 0x03 }
				]
			}
			this.format = Format.create()
				.bytes(1).marshal(Number, "N").as("count")
				.iterate("count", Format.create()
					.bytes(2).marshal(Number, "N").as("item")
				).as("items").end();
			done();
		},

		read: function(test) {
			var target = this.object;
			test.strictEqual(target.items.length, target.count);
			Format.read(this.format, this.data, function(err, object) {
				test.notStrictEqual(object.items, undefined)
				test.strictEqual(object.items.length, target.items.length);
				for (var i = 0; i < object.items.length; ++i)
					test.strictEqual(target.items[i].item, object.items[i].item);
				test.done();
			})
		},

		write: function(test) {
			var target = this.data, buffer = new Array(target.length);
			Format.write(this.format, buffer, this.object, function(err) {
				test.strictEqual(err, undefined);
				for (var i = 0; i < buffer.length; ++i)
					test.strictEqual(buffer[i], target[i]);
				test.done();
			})
		}
	},

	functional: {
		
	}
	
}