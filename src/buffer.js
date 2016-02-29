
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

		// Per-frame vertex data
		this.points = new Int32Array(3);
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
					this.set(x, y, color);
					this.zbuf[index] = 0;
				}
		},

		// Set a pixel

		set: function(x, y, color)
		{
			var c = (color[0] & 0xff) | ((color[1] & 0xff) << 8) | ((color[2] & 0xff) << 16);
			this.buf32[y * this.w + x] = c | 0xff000000;
		},

		// Get a pixel

		get: function(x, y)
		{
			return this.buf32[y * this.w + x];
		},

		// Draw a triangle from 2D points

		drawTriangle: function(verts, effect) 
		{
			var points = [verts[0][0], verts[1][0], verts[2][0]];
			var texUV  = [verts[0][1], verts[1][1], verts[2][1]];
			var norm   = [verts[0][2], verts[1][2], verts[2][2]];

			// Create bounding box
			var boxMin = [this.w + 1, this.h + 1], boxMax = [-1, -1];
			var self = this;

			// Find X and Y dimensions for each
			for (var i = 0; i < points.length; i++)
			{
				for (var j = 0; j < 2; j++) 
				{
					boxMin[j] = m.min(points[i][j], boxMin[j]);
					boxMax[j] = m.max(points[i][j], boxMax[j]);
				}
			}

			// Skip triangles that don't appear on the screen
			if (boxMin[0] > this.w || boxMax[0] < 0 || boxMin[1] > this.h || boxMax[1] < 0)
				return;

			// Limit box dimensions to edges of the screen to avoid render glitches
			if (boxMin[0] < 0)      boxMin[0] = 0;
			if (boxMax[0] > this.w) boxMax[0] = this.w;

			var uv = [];
			var bc = [];

			// Triangle setup
			var a01 = points[0][1] - points[1][1], b01 = points[1][0] - points[0][0];
			var a12 = points[1][1] - points[2][1], b12 = points[2][0] - points[1][0];
			var a20 = points[2][1] - points[0][1], b20 = points[0][0] - points[2][0];

			var c01 = points[1][1] - points[0][1];
			var c12 = points[2][1] - points[1][1];

			//| b01 b12 |
			//| c01 c12 |

			// Parallelogram area from determinant (inverse)
			var area2inv = 1 / ((b01 * c12) - (b12 * c01));

			// Get orientation to see where the triangle is facing
			var edge_w0 = orient2d(points[1], points[2], boxMin);
			var edge_w1 = orient2d(points[2], points[0], boxMin);
			var edge_w2 = orient2d(points[0], points[1], boxMin);

			var color = [0, 0, 0];
			var u, v, nx, ny, nz;
			var z;

			for (var py = boxMin[1]; py <= boxMax[1]; py++)  
			{
				// Coordinates at start of row
				var w = [edge_w0, edge_w1, edge_w2];

				for (var px = boxMin[0]; px <= boxMax[0]; px++) 
				{
					this.pixels++;	

					// Check if pixel is outsde of barycentric coords
					if ((w[0] | w[1] | w[2]) > 0)
					{
						// Get normalized barycentric coordinates
						bc[0] = w[0] * area2inv;
						bc[1] = w[1] * area2inv;
						bc[2] = w[2] * area2inv;

						// Get pixel depth
						for (var i = 0, z = 0; i < 3; i++) 
							z += points[i][2] * bc[i];

						// Get buffer index and run fragment shader
						var index = py * this.w + px;
						
						if (this.zbuf[index] < z)
						{
							var nx, ny, nz;

							// Calculate tex and normal coords
							uv[0] = bc[0] * texUV[0][0] + bc[1] * texUV[1][0] + bc[2] * texUV[2][0];
							uv[1] = bc[0] * texUV[0][1] + bc[1] * texUV[1][1] + bc[2] * texUV[2][1];

							nx = bc[0] * norm[0][0] + bc[1] * norm[1][0] + bc[2] * norm[2][0];
							ny = bc[0] * norm[0][1] + bc[1] * norm[1][1] + bc[2] * norm[2][1];
							nz = bc[0] * norm[0][2] + bc[1] * norm[1][2] + bc[2] * norm[2][2];

							var discard = effect.fragment([uv, [nx, ny, nz], verts[0][3]], color);

							if (!discard)
							{
								var d = z >> 8;
								this.zbuf[index] = z;
								this.set(px, py, color); 
								this.calls++;
							}
						}
					}

					// Step right
					w[0] += a12;
					w[1] += a20;
					w[2] += a01;
				}

				// One row step
				edge_w0 += b12;
				edge_w1 += b20;
				edge_w2 += b01;
			}
		},

		// Put image data on the canvas

		draw: function()
		{
			this.imgData.data.set(this.buf8);
			this.ctx.putImageData(this.imgData, 0, 0);
		},

		// Post-processing (temporary, mostly SSAO)

		postProc: function()
		{
			for (var y = 0; y < this.h; y++)
				for (var x = 0; x < this.w; x++) 
				{
					// Calculate ray vectors
					var rays = [];

					for (var a = 0; a < m.PI * 2-1e-4; a += m.PI / (m.random() * (6 - 3) + 3))
						rays.push([m.sin(a), m.cos(a)]);			

					// Get buffer index
					var index = y * this.w + x;
					if (this.zbuf[index] < 1e-5) continue;

					var total = 0;
					for (var i = 0; i < rays.length; i++) 
					{
						total += m.PI / 2 - m.atan(max_elevation_angle(
							this.zbuf, index, [x, y], [this.w, this.h], rays[i], this.w));
					}
					total /= (m.PI / 2) * rays.length;
					total *= 1.05;
					if (total > 1) total = 1;

					var c = 0xffffff;//this.get(x, y);

					var r = ((c) & 0xff) * total;
					var g = ((c >> 8) & 0xff) * total;
					var b = ((c >> 16) & 0xff) * total;

					this.set(x, y, [r, g, b]);
					this.calls++;
				};
		}
	}

	return Buffer;

})();