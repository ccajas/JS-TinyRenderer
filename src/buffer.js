
// Image drawing functions

function Buffer(ctx, w, h)
{
	// Buffer properties

	var th = 
	{
		ctx: ctx,
		w: w,
		h: h,

		calls: 0,
		pixels: 0,

		nextline: h,
		bufWidth: w,    
	};

	// Clear canvas

	th.clear = function(color)
	{
		for (var y = 0; y <= th.h; y++)
			for (var x = 0; x < th.bufWidth; x++)
			{
				var index = th.index(x, y);	
				th.set(x, y, color);
				th.zbuf[index] = 0;
			}
	}

	// Get pixel index

	th.index = function(x, y)
	{
		return ((th.h - y) << th.log2w) + x;
	}

	// Set a pixel

	th.set = function(x, y, color)
	{
		var c = color[0] | (color[1] << 8) | (color[2] << 16);
		th.buf32[th.index(x, y)] = c | 0xff000000;
	}

	// Get a pixel

	th.get = function(x, y)
	{
		return th.buf32[th.index(x, y)];
	}

	// Draw a line
	/*
	line: function(x0, y0, x1, y1, color) 
	{ 
		var steep = false;

		if (m.abs(x0 - x1) < m.abs(y0 - y1)) 
		{
			// if the line is steep, transpose the image 
			y0 = [x0, x0 = y0][0];
			y1 = [x1, x1 = y1][0];
			steep = true;
		}

		// Make line left to right
		if (x0 > x1)
		{
			x1 = [x0, x0 = x1][0];
			y1 = [y0, y0 = y1][0];      
		}

		const dx = x1 - x0;
		const dy = y1 - y0;
		const derror = m.abs(dy / dx) << 1;
		
		var error = 0;
		var y = y0; 

		for (var x = x0; x <= x1; x++) 
		{
			if (steep)
				this.set(x, y, color)
			else
				this.set(y, x, color)

			error += derror;

			if (error > 1) { 
				y += (y1 > y0) ? 1 : -1; 
				error-= 2;
			} 
		}

		// Increment draw calls
		this.calls += (x1 - x0 + 1);
	},*/

	// Draw a triangle from 2D points

	th.triangle = function(verts, effect) 
	{
		var points = [verts[0][0], verts[1][0], verts[2][0]];
		var texcoords = [verts[0][1], verts[1][1], verts[2][1]];
		var normals = [verts[0][2], verts[1][2], verts[2][2]];

		// Create bounding box
		var boxMin = [th.w + 1, th.h + 1], boxMax = [-1, -1];

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
		if (boxMin[0] > th.w || boxMax[0] < 0 || boxMin[1] > th.h || boxMax[1] < 0)
			return;

		// Triangle setup
		var a01 = points[0][1] - points[1][1], b01 = points[1][0] - points[0][0];
		var a12 = points[1][1] - points[2][1], b12 = points[2][0] - points[1][0];
		var a20 = points[2][1] - points[0][1], b20 = points[0][0] - points[2][0];

		// Get orientation to see where the triangle is facing
		var edge_w0 = orient2d(points[1], points[2], boxMin);
		var edge_w1 = orient2d(points[2], points[0], boxMin);
		var edge_w2 = orient2d(points[0], points[1], boxMin);

		var color = [0, 0, 0];
		var u, v, nx, ny, nz;
		var z = 0;

		for (var py = boxMin[1]; py <= boxMax[1]; py++)  
		{
			// Barycentric coordinates at start of row
			var w0 = edge_w0;
			var w1 = edge_w1;
			var w2 = edge_w2;

			for (var px = boxMin[0]; px <= boxMax[0]; px++) 
			{
				th.pixels++;

				// Step right
				w0 += a12;
				w1 += a20;
				w2 += a01;		

				// Pixel is inside of barycentric coords
				if (w0 < a12 || w1 < a20 || w2 < a01)
					continue;

				// Get buffer index and run fragment shader
				var index = th.index(px, py);
				var b_coords = barycentric(points, [px, py, z]);

				// Get pixel depth
				z = 0;
				for (var i=0; i<3; i++) 
					z += points[i][2] * b_coords[i];
				
				if (th.zbuf[index] < z)
				{
					// Calculate tex and normal coords
					u = dot(b_coords, [texcoords[0][0], texcoords[1][0], texcoords[2][0]]);
					v = dot(b_coords, [texcoords[0][1], texcoords[1][1], texcoords[2][1]]);

					nx = dot(b_coords, [normals[0][0], normals[1][0], normals[2][0]]);
					ny = dot(b_coords, [normals[0][1], normals[1][1], normals[2][1]]);
					nz = dot(b_coords, [normals[0][2], normals[1][2], normals[2][2]]);

					var discard = effect.fragment([[u, v], [ny, nx, nz]], color);

					if (!discard)
					{
						var d = z >> 9;
						th.zbuf[index] = z;
						th.set(px, py, color); 
						th.calls++;
					}
				}
			}

			// One row step
			edge_w0 += b12;
			edge_w1 += b20;
			edge_w2 += b01;
		}
	},

	th.draw = function()
	{
		var self = th;

		// Done animating
		if (self.nextline < 0)
			return;

		th.postProc(self.nextline);
		th.drawBuffer();

		//self.nextline -= 32;
	},

	// Post-processing (temporary, mostly SSAO)

	th.postProc = function(nextline)
	{
		for (var y = nextline; y > nextline - 272; y--)
			for (var x = 0; x < th.w; x++) 
			{
				// Calculate ray vectors
				var rays = [];

				for (var a = 0; a < m.PI * 2-1e-4; a += m.PI / (m.random() * (5 - 2) + 2))
					rays.push([m.sin(a), m.cos(a)]);			

				// Get buffer index
				var index = th.index(x, y);
				if (th.zbuf[index] < 1e-5) continue;

				var total = 0;
				for (var i = 0; i < rays.length; i++) 
				{
					total += m.PI / 2 - m.atan(max_elevation_angle(
						th.zbuf, index, [x, y], [th.w, th.h], rays[i], th.log2w));
				}
				total /= (m.PI / 2) * rays.length;
				//total = m.pow(total, 5) * 10;
				//if (total > 1) total = 1;

				var c = 0xffffff;//this.get(x, y);

				var r = (c & 0xff) * total;
				var g = ((c >> 8) & 0xff) * total;
				var b = ((c >> 16) & 0xff) * total;

				th.set(x, y, [r, g, b]);
				th.calls++;
			};
	},

	// Put image data on the canvas

	th.drawBuffer = function()
	{
		th.imgData.data.set(th.buf8);
		th.ctx.putImageData(th.imgData, 0, 0);
	}

	// Get next highest 2^pow for buffer width

	th.log2w = 1;
	while (th.bufWidth >>= 1) th.log2w++;
	th.bufWidth = 1 << th.log2w;

	// create buffers for data manipulation

	th.imgData = ctx.createImageData(th.bufWidth, th.h);

	th.buf = new ArrayBuffer(th.imgData.data.length);
	th.buf8 = new Uint8ClampedArray(th.buf);
	th.buf32 = new Uint32Array(th.buf);
	th.zbuf = new Uint32Array(th.imgData.data.length);

	return th;
}

