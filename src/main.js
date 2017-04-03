(function() 
{
	// Shorthand
	
	m = Math;
	doc = document;
	f32a = Float32Array;
	f64a = Float64Array;

	//simdSupported = false;// typeof SIMD !== 'undefined'
	//simdEnabled = false;

	// Main function

	Renderer = (function() 
	{
		function Renderer() { }

		Renderer.prototype = 
		{
			// Draw model called in deferred request

			drawGeometry: function(buffer)
			{
				// Transform geometry to screen space
				
				for (var f = 0; f < model.f.length; f++)
				{
					var vs_out = [];
					
					for (var j = 0; j < 3; j++)
						vs_out.push(effect.vertex(model.vert(f, j)));

					this.drawTriangle(buffer, vs_out, effect);
				}
			},

			// Draw a triangle from screen space points

			drawTriangle: function(buf, verts, effect) 
			{
				var pts   = [verts[0][0], verts[1][0], verts[2][0]];
				var texUV = [verts[0][1], verts[1][1], verts[2][1]];
				var norm  = [verts[0][2], verts[1][2], verts[2][2]];

				// Create bounding box
				var boxMin = [buf.w + 1, buf.h + 1], boxMax = [-1, -1];

				// Find X and Y dimensions for each
				for (var i = 0; i < pts.length; i++)
					for (var j = 0; j < 2; j++) 
					{
						boxMin[j] = m.min(pts[i][j], boxMin[j]);
						boxMax[j] = m.max(pts[i][j], boxMax[j]);
					}

				// Skip triangles that don't appear on the screen
				if (boxMin[0] > buf.w || boxMax[0] < 0 || boxMin[1] > buf.h || boxMax[1] < 0)
					return;

				// Limit box dimensions to edges of the screen to avoid render glitches
				if (boxMin[0] < 0)      boxMin[0] = 0;
				if (boxMax[0] > buf.w) boxMax[0] = buf.w;

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
						buf.pixels++;	
						
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
							var index = py * buf.w + px;
							
							if (buf.zbuf[index] < z)
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
									buf.zbuf[index] = z;
									buf.set(index, color); 
									buf.calls++;
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
			}
		}

		return Renderer;

	})();

})();
