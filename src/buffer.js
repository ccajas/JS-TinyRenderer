
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
		// Draw a triangle from 2D pts

		drawTriangle: function(verts, effect) 
		{
			var pts   = [verts[0][0], verts[1][0], verts[2][0]];
			var texUV = [verts[0][1], verts[1][1], verts[2][1]];
			var norm  = [verts[0][2], verts[1][2], verts[2][2]];

			// Create bounding box
			var boxMin = [this.w + 1, this.h + 1], boxMax = [-1, -1];

			// Find X and Y dimensions for each
			for (var i = 0; i < pts.length; i++)
				for (var j = 0; j < 2; j++) 
				{
					boxMin[j] = m.min(pts[i][j], boxMin[j]);
					boxMax[j] = m.max(pts[i][j], boxMax[j]);
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
			var a01 = pts[0][1] - pts[1][1], b01 = pts[1][0] - pts[0][0];
			var a12 = pts[1][1] - pts[2][1], b12 = pts[2][0] - pts[1][0];
			var a20 = pts[2][1] - pts[0][1], b20 = pts[0][0] - pts[2][0];

			var c01 = pts[1][1] - pts[0][1];
			var c12 = pts[2][1] - pts[1][1];

			//| b01 b12 |
			//| c01 c12 |

			// Parallelogram area from determinant (inverse)
			var area2inv = 1 / ((b01 * c12) - (b12 * c01));

			// Get orientation to see where the triangle is facing
			var edge_w0 = orient2d(pts[1], pts[2], boxMin);
			var edge_w1 = orient2d(pts[2], pts[0], boxMin);
			var edge_w2 = orient2d(pts[0], pts[1], boxMin);

			var color = [0, 0, 0];
			var nx, ny, nz;
			var z;

			for (var py = boxMin[1]; py++ <= boxMax[1];)  
			{
				// Coordinates at start of row
				var w = [edge_w0, edge_w1, edge_w2];

				for (var px = boxMin[0]; px++ <= boxMax[0];) 
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
						for (var i = 0, z = 0; i < 3;) 
							z += pts[i][2] * bc[i++];

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

							var discard = effect.fragment([uv, [nx, ny, nz]], color);

							if (!discard)
							{
								this.zbuf[index] = z;
								this.set(index, color); 
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