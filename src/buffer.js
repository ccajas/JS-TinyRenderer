
// Image drawing functions

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

			var uv = new f32a(2);
			var bc = new f32a(3);

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
						z = 0;
						for (var i = 0; i < 3; i++) 
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

		// Draw triangles from 2D points (SIMD enabled)

		drawTriangleSIMD: function(verts, effect, tbuf) 
		{
			var pts    = [verts[0][0], verts[1][0], verts[2][0]];
			var texUV  = [verts[0][1], verts[1][1], verts[2][1]];
			var norm   = [verts[0][2], verts[1][2], verts[2][2]];

			// Create bounding box
			var boxMin = [this.w + 1, this.h + 1], boxMax = [-1, -1];
			var self = this;

			// Find X and Y dimensions for each
			for (var i = 0; i < pts.length; i++)
			{
				for (var j = 0; j < 2; j++) 
				{
					boxMin[j] = m.min(pts[i][j], boxMin[j]);
					boxMax[j] = m.max(pts[i][j], boxMax[j]);
				}
			}

			// Skip triangles that don't appear on the screen
			if (boxMin[0] > this.w || boxMax[0] < 0 || boxMin[1] > this.h || boxMax[1] < 0)
				return;

			// Triangle vector subtraction
			var pts1a = SIMD.Float32x4(pts[1][1], pts[2][1], pts[0][1], pts[2][0]);
			var pts2a = SIMD.Float32x4(pts[0][0], pts[1][0], pts[1][1], pts[2][1]);
			var pts1b = SIMD.Float32x4(pts[2][1], pts[0][1], pts[1][1], pts[1][0]);
			var pts2b = SIMD.Float32x4(pts[2][0], pts[0][0], pts[0][1], pts[1][1]);

			store(tbuf, 0, sub(pts1a, pts1b));
			store(tbuf, 4, sub(pts2a, pts2b));

			// Triangle setup
			var a4 = SIMD.Float32x4(tbuf[0], tbuf[1], tbuf[2], 0);
			var b4 = SIMD.Float32x4(tbuf[3], tbuf[4], tbuf[5], 0);

			var c01 = tbuf[6];
			var c12 = tbuf[7];

			var zcoords = SIMD.Float32x4(pts[0][2], pts[1][2], pts[2][2], 0);

			// Parallelogram area from determinant (inverse)
			var area2inv = 1 / 
				((pts[1][0] - pts[0][0]) * c12 -
				 (pts[2][0] - pts[1][0]) * c01);

			// Get orientation to see where the triangle is facing
			var edge4 = SIMD.Float32x4(
				orient2d(pts[1], pts[2], boxMin), 
				orient2d(pts[2], pts[0], boxMin), 
				orient2d(pts[0], pts[1], boxMin), -1);

			var zero4 = splat(0);
			var area4 = splat(area2inv);

			var color = [0, 0, 0];
			var z;

			// Texture and normals setup
			var tx0 = SIMD.Float32x4(texUV[0][0], texUV[1][0], texUV[2][0], 0);
			var tx1 = SIMD.Float32x4(texUV[0][1], texUV[1][1], texUV[2][1], 0);

			var nx = SIMD.Float32x4(norm[0][0], norm[1][0], norm[2][0], 0);
			var ny = SIMD.Float32x4(norm[0][1], norm[1][1], norm[2][1], 0);
			var nz = SIMD.Float32x4(norm[0][2], norm[1][2], norm[2][2], 0);

			for (var py = boxMin[1]; py <= boxMax[1]; py++)  
			{
				// Coordinates at start of row
				var w4 = edge4;

				for (var px = boxMin[0]; px <= boxMax[0]; px++) 
				{
					// Store triangle edge coords in position 4
					store(tbuf, 4, w4);
					this.pixels++;

					// Check if pixel is outsde of edge coords
					if ((tbuf[4] | tbuf[5] | tbuf[6]) > 0)
					{
						// Get normalized barycentric coordinates and z totals
						var bc = mul(w4, area4);
						store(tbuf, 0, bc);
						store(tbuf, 16, mul(zcoords, bc));

						// Get pixel depth
						z = 0;
						for (var i = 0; i < 3; i++) 
							z += tbuf[16+i];

						// Get buffer index and run fragment shader
						var index = py * this.w + px;
						
						if (this.zbuf[index] < z)
						{
							// Calculate tex and normal coords

							// Store interpolated coord components in positions 20 though 40
							store(tbuf, 20, mul(tx0, bc));
							store(tbuf, 24, mul(tx1, bc));

							store(tbuf, 28, mul(nx, bc));
							store(tbuf, 32, mul(ny, bc));
							store(tbuf, 36, mul(nz, bc));

							// Store products in new SIMD objects
							var ta = SIMD.Float32x4(tbuf[20], tbuf[24], tbuf[28], tbuf[32]);
							var tb = SIMD.Float32x4(tbuf[21], tbuf[25], tbuf[29], tbuf[33]);
							var tc = SIMD.Float32x4(tbuf[22], tbuf[26], tbuf[30], tbuf[34]);

							var td = SIMD.Float32x4(tbuf[36], 0, 0, 0);
							var te = SIMD.Float32x4(tbuf[37], 0, 0, 0);
							var tf = SIMD.Float32x4(tbuf[38], 0, 0, 0);

							// Re-use buffer to store totals
							tc = add(add(ta, tb), tc);
							tf = add(add(td, te), tf);

							store(tbuf, 20, tc);
							store(tbuf, 24, tf);

							// UV and normal coords
							var discard = effect.fragment([
								[tbuf[20], tbuf[21]],
								[tbuf[22], tbuf[23], tbuf[24]], verts[0][3]], color);

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
					w4 = add(w4, a4);
				}

				// One row step
				edge4 = add(edge4, b4);
			}
		},
/*
		// Post-processing (temporary, mostly SSAO)

		postProc: function()
		{
			for (var y = this.h; y > 0; y--)
				for (var x = 0; x < this.w; x++) 
				{
					// Calculate ray vectors
					var rays = [];

					for (var a = 0; a < m.PI * 2-1e-4; a += m.PI / (m.random() * (5 - 2) + 2))
						rays.push([m.sin(a), m.cos(a)]);			

					// Get buffer index
					var index = this.index(x, y);
					if (this.zbuf[index] < 1e-5) continue;

					var total = 0;
					for (var i = 0; i < rays.length; i++) 
					{
						total += m.PI / 2 - m.atan(max_elevation_angle(
							this.zbuf, index, [x, y], [this.w, this.h], rays[i], this.w));
					}
					total /= (m.PI / 2) * rays.length;
					//total = m.pow(total, 2) * 2;
					//if (total > 1) total = 1;

					var c = 0xffffff;//this.get(x, y);

					var r = (c & 0xff) * total;
					var g = ((c >> 8) & 0xff) * total;
					var b = ((c >> 16) & 0xff) * total;

					this.set(x, y, [r, g, b]);
					this.calls++;
				};
		},*/

		// Put image data on the canvas

		draw: function()
		{
			this.imgData.data.set(this.buf8);
			this.ctx.putImageData(this.imgData, 0, 0);
		}
	}

	return Buffer;

})();