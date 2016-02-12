
(function() 
{
	var canvas = document.getElementById('render');
	var model = Object.create(OBJmodel);

	if (canvas.getContext)
	{
		// Test load model
		model.load("obj/diablo3.obj", modelReady(model, canvas));
	}
	else
	{
		console.error("Canvas context not supported!");
	}
}).call(this);

// Shorthand

var m = Math;

// Display render link

function modelReady(model, canvas)
{
	var displayButton = function()
	{
		console.log('ready to render!');

		// Set context
		var ctx = canvas.getContext('2d');
		var el = document.getElementById('render_start');

		el.style.display = 'block';
		el.onclick = function() 
		{ 
			console.log('Begin render!'); 

			var img = Object.create(Img);
			img.init(ctx, canvas.width, canvas.height);

			drawImage(model, img);
		}
	}

	return displayButton;
}

// Draw model called in deferred request

function drawImage(model, img)
{
	// "Clear" canvas to black
	//img.clear(0x0);
	/*
	setTimeout(function() {
        requestAnimationFrame(function() { 
        	drawImage(model, img);
        });
        // Drawing code goes here
    }, 1000 / 30);*/

	start = new Date();

	var ratio = img.h / img.w;

	// Coordinates for model rendering
	var world_coords = [];
	var screen_coords = [];

	// Transform geometry to screen space
	console.log(new Date().getTime() - start.getTime() +"ms Crunching triangles");

	for (var f = 0; f < model.faces.length; f++)
	{
		var face = model.faces[f];

		for (var j = 0; j < 3; j++)
		{
			var v = model.verts[face[j][0]];
			var x = m.floor((v[0] / 2 + 0.5 / ratio) * img.w * ratio); 
			var y = m.floor((v[1] / 2 + 0.5) * img.h);
			var z = m.floor((v[2] / 2 + 0.5) * 32768);

			screen_coords.push([x, y, z]);
			world_coords.push(v);
		}
	}

	// Draw the triangles
	console.log(new Date().getTime() - start.getTime() +"ms Drawing triangles");

	for (var i = 0; i < world_coords.length; i+= 3)
	{
		// Calculate normal
		var n = cross(
			vecSub(world_coords[i+2], world_coords[i]), 
			vecSub(world_coords[i+1], world_coords[i])
		);

		// Light intensity
		var intensity = dot(normalize(n), [0, 0, -1]);
		var color = 255 * intensity;
		var screen = [screen_coords[i], screen_coords[i+1], screen_coords[i+2]];

		if (intensity > 0)
			img.triangle(screen, color | (color << 8) | (color << 16));
	}

	console.log(new Date().getTime() - start.getTime() +"ms Post-processing");
	img.postProc();

	// Finally put image data onto canvas
	img.flush();

	// Output info to the page
	end = new Date();
	var execTime = "Execution took "+ (end.getTime() - start.getTime()) +" ms";
	var calls = "Pixel draw calls/visited: "+ img.calls +"/"+ img.pixelVal;

	document.getElementById('info').innerHTML = execTime +'<br/>'+ calls;
	console.log(execTime +'. '+ calls);

	img.calls = 0;
	img.pixelVal = 0;
}

// Image drawing functions

var Img =
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
		var bufWidth = ctx.canvas.clientWidth;

		// Get next highest 2^pow for width
		this.log2w = 1;
		while (bufWidth >>= 1) this.log2w++;

		bufWidth = 1 << this.log2w;
		this.w = w;
		this.h = h;

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

	triangle: function(points, color) 
	{ 
		// Create bounding box
		var boxMin = [this.w + 1, this.h + 1];
		var boxMax = [-1, -1];

		// Find X and Y dimensions for each
		for (var i = 0; i < points.length; i++)
		{
			for (var j = 0; j < 2; j++) 
			{
				boxMin[j] = m.min(points[i][j], boxMin[j]);
				boxMax[j] = m.max(points[i][j], boxMax[j]);
			}
		}

		const bbox = [boxMin, boxMax];

		// Skip triangles that don't appear on the screen
		if (bbox[0][0] > this.w || bbox[1][0] < 0 || bbox[0][1] > this.h || bbox[1][1] < 0)
			return;

		var z = 0;
		for (var y = bbox[0][1]; y <= bbox[1][1]; y++)  
			for (var x = bbox[0][0]; x <= bbox[1][0]; x++) 
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

				// Get buffer index
				var index = this.index(x, y);
				
				if (this.zbuf[index] < z)
				{
					var d = z >> 8;
					this.zbuf[index] = z;	
					this.set(x, y, d | (d << 8) | (d << 16)); 
					//this.calls++;
				}
			}
	},

	// Post-processing (mostly SSAO)

	postProc: function()
	{
		for (var y = 0; y < this.h; y++)
			for (var x = 0; x < this.w; x++) 
			{
				// Get buffer index
				var index = this.index(x, y);
				if (this.zbuf[index] < 1e-5) continue;

				var total = 0;
				for (var a = 0; a < m.PI * 2-1e-4; a += m.PI / 12) 
				{
					total += m.PI / 2 - max_elevation_angle(
						this.zbuf, index, [x, y], [this.w, this.h], [m.sin(a), m.cos(a)], this.log2w);
				}
				total /= (m.PI / 2) * 24;
				var c = 255 * total;// this.get(x, y) & 0xff;

				this.set(x, y, c | (c << 8) | (c << 16));
				this.calls++;
			}
	},

	// Put image data on the canvas

	flush: function()
	{
		this.imgData.data.set(this.buf8);
		this.ctx.putImageData(this.imgData, 0, 0);
	}
}
