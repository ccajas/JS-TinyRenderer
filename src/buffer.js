
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
		pixelVal: 0,

		nextline: h,
		bufWidth: w,	
	};

	// Clear canvas

	th.clear = function(color)
	{
		const len = th.buf32.length;
		for (var i = 0; i < len; i++)
			th.buf32[i] = color + 0xff000000;
	}

	// Get pixel index

	th.index = function(x, y)
	{
		return ((th.h - y) << th.log2w) + x;
	}

	// Set a pixel

	th.set = function(x, y, color)
	{
		th.buf32[th.index(x, y)] = color + 0xff000000;
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

		var tu = texcoords.map(function(t) { return t[0]; });
		var tv = texcoords.map(function(t) { return t[1]; });
		//console.log(points);

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

		var z = 0;
		for (var y = boxMin[1]; y <= boxMax[1]; y++)  
			for (var x = boxMin[0]; x <= boxMax[0]; x++) 
			{
				th.pixelVal++;
				//console.log(points);
				var b_coords = barycentric(points, [x, y, z]);

				// Pixel is outside of barycentric coords
				if (b_coords[0] < 0 || b_coords[1] < 0 || b_coords[2] < 0) 
					continue;

				// Calculate tex coords
				var u = dot(b_coords, tu);
				var v = dot(b_coords, tv);

				// Get pixel depth
				z = 0;
				for (var i=0; i<3; i++) 
					z += points[i][2] * b_coords[i];

				// Get buffer index and run fragment shader
				var index = th.index(x, y);
				var color = [0];
				var discard = effect.fragment([u, v], color);
				
				if (th.zbuf[index] < z && !discard)
				{
					//var d = z >> 8;
					th.zbuf[index] = z;	
					th.set(x, y, color[0]);// d | (d << 8) | (d << 16)); 
					th.calls++;
				}
			}
	},

	th.draw = function()
	{
		var self = th;

		// Done animating
		if (self.nextline < 0)
		{
			console.log("Done!");

			// Output info to the page
			end = new Date();
			var execTime = "Execution took "+ (end.getTime() - start.getTime()) +" ms";
			var calls = "Pixel draw calls/visited: "+ th.calls +"/"+ th.pixelVal;

			doc.getElementById('info').innerHTML = execTime +'<br/>'+ calls;
			console.log(execTime +'. '+ calls);

			return;
		}

    	requestAnimationFrame(function(){
    		self.draw();
		});

    	th.postProc(self.nextline);
   		th.drawBuffer();

		self.nextline -= 32;
	},

	// Post-processing (temporary, mostly SSAO)

	th.postProc = function(nextline)
	{
		// Calculate ray vectors
		var rays = [];
		for (var a = 0; a < m.PI * 2-1e-4; a += m.PI / 5)
			rays.push([m.sin(a), m.cos(a)]);

		for (var y = nextline; y > nextline - 32; y--)
			for (var x = 0; x < th.w; x++) 
			{
				// Get buffer index
				var index = th.index(x, y);
				if (th.zbuf[index] < 1e-5) continue;

				var total = 0;
				for (var i = 0; i < rays.length; i++) 
				{
					total += m.PI / 2 - m.atan(max_elevation_angle(
						th.zbuf, index, [x, y], [th.w, th.h], rays[i], th.log2w));
				}
				total /= (m.PI / 2) * 10;
				var c = total * (this.get(x, y) & 0xff);

				th.set(x, y, c | (c << 8) | (c << 16));
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
