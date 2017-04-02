
// Buffer drawing functions

Buffer = (function()
{
	function Buffer(ctx, w, h)
	{
		this.ctx = ctx;
		this.w = w;
		this.h = h;

		this.calls = 0;
		this.pixels = 0;

		// create buffers for data manipulation
		this.imgData = ctx.createImageData(this.w, this.h);

		this.buf = new ArrayBuffer(this.imgData.data.length);
		this.buf8 = new Uint8ClampedArray(this.buf);
		this.buf32 = new Uint32Array(this.buf);

		// Z-buffer
		this.zbuf = new Uint32Array(this.imgData.data.length);
	}

	Buffer.prototype =
	{
		// Clear canvas

		clear: function(color)
		{
			for (var y = 0; y <= this.h; y++)
				for (var x = 0; x < this.w; x++)
				{
					var index = y * this.w + x;	
					this.set(index, color);
					this.zbuf[index] = 0;
				}
		},

		// Set a pixel

		set: function(index, color)
		{
			var c = (color[0] & 255) | ((color[1] & 255) << 8) | ((color[2] & 255) << 16);
			this.buf32[index] = c | 0xff000000;
		},

		// Get a pixel
/*
		get: function(x, y)
		{
			return this.buf32[y * this.w + x];
		},
*/
		// Put image data on the canvas

		draw: function()
		{
			this.imgData.data.set(this.buf8);
			this.ctx.putImageData(this.imgData, 0, 0);
		},

		// Post-processing (temporary, mostly SSAO)

		postProc: function()
		{
			// Calculate ray vectors
			var rays = [];
			var pi2 = m.PI * .5;

			for (var a = 0; a < m.PI * 2-1e-4; a += m.PI * 0.1111)
				rays.push([m.sin(a), m.cos(a)]);	

			var rlength = rays.length;

			for (var y = 0; y < this.h; y++)
				for (var x = 0; x < this.w; x++) 
				{
					// Get buffer index
					var index = y * this.w + x;
					if (this.zbuf[index] < 1e-5) continue;

					var total = 0;
					for (var i = 0; i < rlength; i++) 
					{
						total += pi2 - m.atan(max_elevation_angle(
							this.zbuf, index, [x, y], [this.w, this.h], rays[i]));
					}
					total /= pi2 * rlength;
					//if (total > 1) total = 1;

					var c = this.buf32[index];//this.get(x, y);

					var r = ((c) & 0xff) * total;
					var g = ((c >> 8) & 0xff) * total;
					var b = ((c >> 16) & 0xff) * total;

					this.set(index, [r, g, b]);
					this.calls++;
				};
		}
	}

	return Buffer;

})();