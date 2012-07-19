
var Format = require('../format');


module.exports = {

	packIndex: {

		setUp: function (done) {
			this.format = Format.create()
					.bytes(4).expect([ 37, 't', '0', 'c' ]).as("magic")
					.bytes(4).marshal(Number, "N").expect(2, 3).as("version")
					.iterate(255, Format.create().bytes(4).marshal(Number, "N")).as("fanout")
					.bytes(4).marshal(Number).as("objectCount")
					.iterate("objectCount", Format.create().bytes(20).marshal(String)).as("objects")
					.iterate("objectCount", Format.create().bytes(4)).as("checksums")
					.iterate("objectCount", Format.create()
						.bits(1).marshal(Boolean).as("isBig")
						.bits(31).marshal(Number, "N").as("offset")
					).as("offsets")
					.iterate(function(context) {
						return context.get("offsets").filter(function(item){ return item.isBig; })
					}, Format.create().bytes(8).marshal(Number, "N")).as("largeOffsets")
					.bytes(20).marshal(String).as("packChecksum")
				
				.end()
			done();
		},

		read: function(test) {
			var ordering = this.format.readOrdering();
			test.done();
		},

		write: function(test) {
			var ordering = this.format.writeOrdering();
			console.log(ordering.join("\n"))
			test.done();
		}

	}

}

