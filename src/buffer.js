
// Image drawing functions

var Buffer =
{
	// Img properties

	ctx: null,
	imgData: null,

	// Initialize image

	init: function(ctx, w, h)
	{
		this.ctx = ctx;
		this.calls = 0;
		this.pixelVal = 0;

		this.w = w;
		this.h = h;
		this.nextline = h;

		// Get next highest 2^pow for width
		this.log2w = 1;
		var bufWidth = w;
		while (bufWidth >>= 1) this.log2w++;

		var bufWidth = 1 << this.log2w;

		// create buffers for data manipulation

		this.imgData = ctx.createImageData(bufWidth, this.h);
		this.buf = new ArrayBuffer(this.imgData.data.length);
		this.buf8 = new Uint8ClampedArray(this.buf);
		this.buf32 = new Uint32Array(this.buf);
		this.zbuf = new Uint32Array(this.imgData.data.length);
	},

	// Clear canvas

	clear: function(color)
	{
		const len = this.buf32.length;
		for (var i = 0; i < len; i++)
			this.buf32[i] = color + 0xff000000;
	},

	// Get pixel index

	index: function(x, y)
	{
		return ((this.h - y) << this.log2w) + x;
	},

	// Set a pixel

	set: function(x, y, color)
	{
		this.buf32[this.index(x, y)] = color + 0xff000000;
	},

	// Get a pixel

	get: function(x, y)
	{
		return this.buf32[this.index(x, y)];
	},

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

	triangle: function(points, effect) 
	{
		// Create bounding box
		var boxMin = [this.w + 1, this.h + 1], boxMax = [-1, -1];

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

		var z = 0;
		for (var y = boxMin[1]; y <= boxMax[1]; y++)  
			for (var x = boxMin[0]; x <= boxMax[0]; x++) 
			{
				this.pixelVal++;
				var b_coords = barycentric(points, [x, y, z]);

				// Pixel is outside of barycentric coords
				if (b_coords[0] < 0 || b_coords[1] < 0 || b_coords[2] < 0) 
					continue;

				// Get pixel depth
				z = 0;
				for (var i=0; i<3; i++) 
					z += points[i][2] * b_coords[i];

				// Get buffer index and run fragment shader
				var index = this.index(x, y);
				var color = [0];
				var discard = effect.fragment(b_coords, color);
				
				if (this.zbuf[index] < z && !discard)
				{
					var d = z >> 8;
					this.zbuf[index] = z;	
					this.set(x, y, color[0]);// d | (d << 8) | (d << 16)); 
					this.calls++;
				}
			}
	},

	draw: function()
	{
		var self = this;

		// Done animating
		if (self.nextline < 0)
		{
			console.log("Done!");

			// Output info to the page
			end = new Date();
			var execTime = "Execution took "+ (end.getTime() - start.getTime()) +" ms";
			var calls = "Pixel draw calls/visited: "+ this.calls +"/"+ this.pixelVal;

			doc.getElementById('info').innerHTML = execTime +'<br/>'+ calls;
			console.log(execTime +'. '+ calls);

			// test invert button
/*
			var img = new Image();
			img.src = 'obj/rhino.jpg';
			img.onload = function()
			{
				self.ctx.drawImage(img, 0, 0);
  				img.style.display = 'none';

  				var imgData = self.ctx.getImageData(0, 0, self.w, self.h);
  				var data = imgData.data;

  				document.getElementById('invertbtn')
					.addEventListener('click', function() 
					{
						invert(self.ctx, data); 
						self.ctx.putImageData(imgData, 0, 0);
					});
			};
*/
			return;
		}

    	requestAnimationFrame(function(){
    		self.draw();
		});

    	this.postProc(self.nextline);
   		this.drawBuffer();

		self.nextline -= 32;
	},

	// Post-processing (mostly SSAO)

	postProc: function(nextline)
	{
		// Calculate ray vectors
		var rays = [];
		for (var a = 0; a < m.PI * 2-1e-4; a += m.PI / 5)
			rays.push([m.sin(a), m.cos(a)]);

		for (var y = nextline; y > nextline - 32; y--)
			for (var x = 0; x < this.w; x++) 
			{
				// Get buffer index
				var index = this.index(x, y);
				if (this.zbuf[index] < 1e-5) continue;

				var total = 0;
				for (var i = 0; i < rays.length; i++) 
				{
					total += m.PI / 2 - m.atan(max_elevation_angle(
						this.zbuf, index, [x, y], [this.w, this.h], rays[i], this.log2w));
				}
				total /= (m.PI / 2) * 10;
				var c = 255 * total;// this.get(x, y) & 0xff;

				this.set(x, y, c | (c << 8) | (c << 16));
				this.calls++;
			};
	},

	// Put image data on the canvas

	drawBuffer: function()
	{
		this.imgData.data.set(this.buf8);
		this.ctx.putImageData(this.imgData, 0, 0);
	}
}

// Invert image test

var invert = function(ctx, data) 
{
	for (var i = 0; i < data.length; i += 4) 
	{
		data[i]     = 255 - data[i];     // red
		data[i + 1] = 255 - data[i + 1]; // green
		data[i + 2] = 255 - data[i + 2]; // blue
	}
};
