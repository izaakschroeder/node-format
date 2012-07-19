
var
	Format = require('../../format');

function natural(n,e) {
	return Format.create()
		.configure({endianness: e})
		.bytes(n).marshal(Number, "N").as("test")
		.end();
}

function integer(n, e) {
	return Format.create()
		.configure({endianness: e})
		.bytes(n).marshal(Number, "Z").as("test")
		.end();
}

function real(n, e) {
	return Format.create()
		.configure({endianness: e})
		.bytes(n).marshal(Number, "R").as("test")
		.end();
}

module.exports = {
	
	padding: {
		be: function(test) {
			var format = natural(4, "big"), output = new Array(4);
			Format.write(format, output, { test: 0x01 }, function(err) {
				test.strictEqual(err, undefined);
				test.strictEqual(output[0], 0x00);
				test.strictEqual(output[1], 0x00);
				test.strictEqual(output[2], 0x00);
				test.strictEqual(output[3], 0x01);
				test.done()
			})
		},
		le: function(test) {
			var format = natural(4, "little"), output = new Array(4);
			Format.write(format, output, { test: 0x01 }, function(err) {
				test.strictEqual(err, undefined);
				test.strictEqual(output[0], 0x01);
				test.strictEqual(output[1], 0x00);
				test.strictEqual(output[2], 0x00);
				test.strictEqual(output[3], 0x00);
				test.done()
			})
		}
	},

	uint8be: {
		setUp: function(done) {
			this.format = natural(1, "big");
			done();
		},
		
		read: function(test) {
			Format.read(this.format, [ 0xF3 ], function(err, object) {
				test.strictEqual(err, undefined);
				test.strictEqual(object.test, 243);
				test.done()
			})
		},

		writeOk: function(test) {
			var output = new Array(1);
			Format.write(this.format, output, { test: 243 }, function(err) {
				test.strictEqual(err, undefined);
				test.strictEqual(output[0], 0xF3);
				test.done()
			})
		},

		writeFailOutOfRangeLower: function(test) {
			var output = new Array(1);
			Format.write(this.format, output, { test: -20 }, function(err) {
				test.notStrictEqual(err, undefined);
				test.done()
			})
		},

		writeFailOutOfRangeUpper: function(test) {
			var output = new Array(1);
			Format.write(this.format, output, { test: 264 }, function(err) {
				test.notStrictEqual(err, undefined);
				test.done()
			})
		},

		writeFailWrongType: function(test) {
			var output = new Array(1);
			Format.write(this.format, output, { test: "hello" }, function(err) {
				test.notStrictEqual(err, undefined);
				test.done()
			})
		}
	},
	
	int8be: {
		setUp: function(done) {
			this.format = integer(1, "big");
			done();
		},
		read: function(test) {
			Format.read(this.format, [ 0xF3 ], function(err, object) {
				test.strictEqual(err, undefined);
				test.strictEqual(object.test, -13);
				test.done()
			})
		},
		writeOk: function(test) {
			var output = new Array(1);
			Format.write(this.format, output, { test: -13 }, function(err) {
				test.strictEqual(err, undefined);
				test.strictEqual(output[0], 0xF3);
				test.done()
			})
		},

		writeFailOutOfRangeLower: function(test) {
			var output = new Array(1);
			Format.write(this.format, output, { test: -129 }, function(err) {
				test.notStrictEqual(err, undefined);
				test.done()
			})
		},

		writeFailOutOfRangeUpper: function(test) {
			var output = new Array(1);
			Format.write(this.format, output, { test: 128 }, function(err) {
				test.notStrictEqual(err, undefined);
				test.done()
			})
		},

		writeFailWrongType: function(test) {
			var output = new Array(1);
			Format.write(this.format, output, { test: "hello" }, function(err) {
				test.notStrictEqual(err, undefined);
				test.done()
			})
		}

	},
	uint16be: {
		setUp: function(done) {
			this.format = natural(2, "big");
			done();
		},
		read: function(test) {
			Format.read(this.format, [ 0xF3, 0xEE ], function(err, object) {
				test.strictEqual(err, undefined);
				test.strictEqual(object.test, 62446);
				test.done()
			})
		},
		writeOk: function(test) {
			var output = new Array(2);
			Format.write(this.format, output, { test: 62446 }, function(err, object) {
				test.strictEqual(err, undefined);
				test.strictEqual(output[0], 0xF3);
				test.strictEqual(output[1], 0xEE);
				test.done();
			})
		}
	},
	int16be: {
		setUp: function(done) {
			this.format = integer(2, "big");
			done();
		},
		read: function(test) {
			Format.read(this.format, [ 0xF3, 0xEE ], function(err, object) {
				test.strictEqual(err, undefined);
				test.strictEqual(object.test, -3090);
				test.done()
			})
		},
		writeOk: function(test) {
			var output = new Array(2);
			Format.write(this.format, output, { test: -3090 }, function(err, object) {
				test.strictEqual(err, undefined);
				test.strictEqual(output[0], 0xF3);
				test.strictEqual(output[1], 0xEE);
				test.done();
			})
		}
	},
	uint32be: {
		setUp: function(done) {
			this.format = natural(4, "big");
			done();
		},
		read: function(test) {
			Format.read(this.format, [ 0xF3, 0xEE, 0x43, 0xCA ], function(err, object) {
				test.strictEqual(err, undefined);
				test.strictEqual(object.test, 4092478410);
				test.done()
			})
		},
		write: function(test) {
			var output = new Array(4);
			Format.write(this.format, output, { test: 4092478410 }, function(err, object) {
				test.strictEqual(err, undefined);
				test.strictEqual(output[0], 0xF3);
				test.strictEqual(output[1], 0xEE);
				test.strictEqual(output[2], 0x43);
				test.strictEqual(output[3], 0xCA);
				test.done()
			})
		}
	},
	int32be: {
		setUp: function(done) {
			this.format = integer(4, "big");
			done();
		},
		read: function(test) {
			Format.read(this.format, [ 0xF3, 0xEE, 0x43, 0xCA ], function(err, object) {
				test.strictEqual(err, undefined);
				test.strictEqual(object.test, -202488886);
				test.done()
			})
		},
		write: function(test) {
			var output = new Array(4);
			Format.write(this.format, output, { test: -202488886 }, function(err, object) {
				test.strictEqual(err, undefined);
				test.strictEqual(output[0], 0xF3);
				test.strictEqual(output[1], 0xEE);
				test.strictEqual(output[2], 0x43);
				test.strictEqual(output[3], 0xCA);
				test.done()
			})
		}
	},
	uint64be: {
		setUp: function(done) {
			this.format = natural(8, "big");
			done();
		}
	},
	int64be: {
		setUp: function(done) {
			this.format = integer(8, "big");
			done()
		}
	},

	uint8le: {
		setUp: function(done) {
			this.format = natural(1, "little");
			done();
		},
		read: function(test) {
			Format.read(this.format, [ 0xF3 ], function(err, object) {
				test.strictEqual(err, undefined);
				test.strictEqual(object.test, 243);
				test.done()
			})
		}
	},
	int8le: {
		setUp: function(done) {
			this.format = integer(1, "little");
			done();
		},
		read: function(test) {
			Format.read(this.format, [ 0xF3 ], function(err, object) {
				test.strictEqual(err, undefined);
				test.strictEqual(object.test, -13);
				test.done()
			})
		}
	},
	uint16le: {
		setUp: function(done) {
			this.format = natural(2, "little");
			done();
		},
		read: function(test) {
			Format.read(this.format, [ 0xF3, 0xEE ], function(err, object) {
				test.strictEqual(err, undefined);
				test.strictEqual(object.test, 61171);
				test.done()
			})
		}
	},
	int16le: {
		setUp: function(done) {
			this.format = integer(2, "little");
			done();
		},
		read: function(test) {
			Format.read(this.format, [ 0xF3, 0xEE ], function(err, object) {
				test.strictEqual(err, undefined);
				test.strictEqual(object.test, -4365);
				test.done()
			})
		}
	},
	uint32le: {
		setUp: function(done) {
			this.format = natural(4, "little");
			done();
		},
		read: function(test) {
			Format.read(this.format, [ 0xF3, 0xEE, 0x43, 0xCA ], function(err, object) {
				test.strictEqual(err, undefined);
				test.strictEqual(object.test, 3393449715);
				test.done()
			})
		}
	},
	int32le: {
		setUp: function(done) {
			this.format = integer(4, "little");
			done();
		},
		read: function(test) {
			Format.read(this.format, [ 0xF3, 0xEE, 0x43, 0xCA ], function(err, object) {
				test.strictEqual(err, undefined);
				test.strictEqual(object.test, -901517581);
				test.done()
			})
		}
	},
	uint64le: {
		setUp: function(done) {
			this.format = natural(8, "little");
			done();
		}
	},
	int64le: {
		setUp: function(done) {
			this.format = integer(8, "little");
			done()
		}
	},

	float32be: {
		setUp: function(done) {
			this.format = real(4, "big");
			done();
		},
		read: function(test) {
			Format.read(this.format, [ 71, 149, 128, 186 ], function(err, object) {
				test.strictEqual(err, undefined);
				test.strictEqual(object.test, 76545.453125);
				test.done();
			});
		},
		write: function(test) {
			var output = new Array(4);
			Format.write(this.format, output, { test: 76545.453125 }, function(err, object) {
				test.strictEqual(err, undefined);
				test.strictEqual(output[0], 71);
				test.strictEqual(output[1], 149);
				test.strictEqual(output[2], 128);
				test.strictEqual(output[3], 186);
				test.done()
			})
		}
	},
	float64be: {
		setUp: function(done) {
			this.format = real(8, "big");
			done();
		},
		read: function(test) {
			Format.read(this.format, [ 192, 162, 2, 56, 219, 86, 254, 63 ], function(err, object) {
				test.strictEqual(err, undefined);
				test.strictEqual(object.test, -2305.11104843);
				test.done();
			});
		},
		write: function(test) {
			var output = new Array(8);
			Format.write(this.format, output, { test: -2305.11104843 }, function(err, object) {
				test.strictEqual(err, undefined);
				test.strictEqual(output[0], 192);
				test.strictEqual(output[1], 162);
				test.strictEqual(output[2], 2);
				test.strictEqual(output[3], 56);
				test.strictEqual(output[4], 219);
				test.strictEqual(output[5], 86);
				test.strictEqual(output[6], 254);
				test.strictEqual(output[7], 63);
				test.done();
			})
		}
	},

	float32le: {
		setUp: function(done) {
			this.format = real(4, "little");
			done();
		},
		read: function(test) {
			Format.read(this.format, [ 0xF3, 0xEE, 0x43, 0xCA ], function(err, object) {
				test.strictEqual(err, undefined);
				test.strictEqual(object.test, -3210172.75);
				test.done();
			});
		},
		write: function(test) {
			var output = new Array(4);
			Format.write(this.format, output, { test: -3210172.75 }, function(err, object) {
				test.strictEqual(err, undefined);
				test.strictEqual(output[0], 0xF3);
				test.strictEqual(output[1], 0xEE);
				test.strictEqual(output[2], 0x43);
				test.strictEqual(output[3], 0xCA);
				test.done()
			})
		}
	},
	float64le: {
		setUp: function(done) {
			this.format = real(8, "little");
			done();
		},
		read: function(test) {
			Format.read(this.format, [ 192, 162, 2, 56, 219, 86, 254, 63 ], function(err, object) {
				test.strictEqual(err, undefined);
				test.strictEqual(object.test, 1.8962051570799048);
				test.done();
			});
			
		},
		write: function(test) {
			var output = new Array(8);
			Format.write(this.format, output, { test: 1.8962051570799048 }, function(err, object) {
				test.strictEqual(err, undefined);
				test.strictEqual(output[0], 192);
				test.strictEqual(output[1], 162);
				test.strictEqual(output[2], 2);
				test.strictEqual(output[3], 56);
				test.strictEqual(output[4], 219);
				test.strictEqual(output[5], 86);
				test.strictEqual(output[6], 254);
				test.strictEqual(output[7], 63);
				test.done();
			})
		}
	}
}