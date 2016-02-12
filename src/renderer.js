
function drawInit()
{
	var canvas = document.getElementById('render');
	var model = Object.create(OBJmodel);

	if (canvas.getContext)
	{
		// Test load model
		model.load("obj/dragon.obj", modelReady(model, canvas));
	}
	else
	{
		console.error("Canvas context not supported!");
	}
}

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
			drawImage(model, ctx);
		}
	}

	return displayButton;
}

// Draw model called in deferred request

function drawImage(model, ctx)
{
	var img = Object.create(Img);
	img.init(ctx);

	console.log("Canvas loaded");

	var th = 0;
	console.log("Crunching triangles");

	//var intervalID = window.setInterval(function()
	{
		// "Clear" canvas to black
		img.clear(0x0);

		start = new Date();

		const cos_th = Math.cos(th);
		const sin_th = Math.sin(th);

		var ratio = img.h / img.w;

		//for (var i = 0; i < 100; i++)
		{	
			for (var f = 0; f < model.faces.length; f++)
			{
				var face = model.faces[f];

				var world_coords = [];
				var screen_coords = [];

				for (var j = 0; j < 3; j++)
				{
					var v = model.verts[face[j][0] - 1];
					var x = Math.floor((v[0] / 2 + 0.5 / ratio) * img.w * ratio); 
					var y = Math.floor((v[1] / 2 + 0.5) * img.h);
					var z = Math.floor((v[2] / 2 + 0.5) * 32768);

					screen_coords.push([x, y, z]);
					world_coords.push(v);
				}

				var n = cross(
					vecSub(world_coords[2], world_coords[0]), 
					vecSub(world_coords[1], world_coords[0])
				);

				var intensity = dot(normalize(n), [0, 0, -1]);
				var color = 255 * intensity;

				if (intensity > 0)
					img.triangle(screen_coords, color + (color << 8) + (color << 16));
			}
		}

		//img.postProc();

		// Finally put image data onto canvas
		img.flush();

		// Then do post-processing
		//window.setTimeout(img.postProc, 2000);

		end = new Date();
		var execTime = "Execution took "+ (end.getTime() - start.getTime()) +" ms";
		var calls = "Pixel draw calls: "+ img.calls;

		document.getElementById('info').innerHTML = execTime +'<br/>'+ calls;
		console.log(execTime +'. '+ calls);
		img.calls = 0;

		th += 0.01;

	}//, 100);
}

// Image drawing functions

var Img = new Object();

// Img properties

Img.ctx = null;
Img.imgData = null;

// Initialize image

Img.init = function(ctx)
{
	this.ctx = ctx;
	this.calls = 0;
	var bufWidth = ctx.canvas.clientWidth;

	// Get next highest 2^pow for width
	this.log2w = 1;
	while (bufWidth >>= 1) this.log2w++;

	bufWidth = 1 << this.log2w;
	this.w = ctx.canvas.clientWidth;
	this.h = ctx.canvas.clientHeight;

	// create buffers for data manipulation

	this.imgData = ctx.createImageData(bufWidth, this.h);
	this.buf = new ArrayBuffer(this.imgData.data.length);

	this.buf8 = new Uint8ClampedArray(this.buf);
	this.buf32 = new Uint32Array(this.buf);

	// Z buffer
	this.zbuffer = new Uint32Array(this.imgData.data.length);
}

// Clear canvas

Img.clear = function(color)
{
	const len = this.buf32.length;
	for (var i = 0; i < len; i++)
		this.buf32[i] = color + 0xff000000;
}

// Get pixel index

Img.index = function(x, y)
{
	return ((this.h - y) << this.log2w) + x;
}

// Set a pixel

Img.set = function(x, y, color)
{
	this.buf32[this.index(x, y)] = color + 0xff000000;
}

// Get a pixel

Img.get = function(x, y)
{
	return this.buf32[this.index(x, y)];
}

// Draw a line

Img.line = function(x0, y0, x1, y1, color) 
{ 
	var steep = false;

	if (Math.abs(x0 - x1) < Math.abs(y0 - y1)) 
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
	const derror = Math.abs(dy / dx) << 1;
	
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
}

// Draw a triangle from 2D points

Img.triangle = function(points, color) 
{ 
	const bbox = findBbox(points, [this.w, this.h]);

	// Skip triangles that don't appear on the screen
	if (bbox[0][0] > this.w || bbox[1][0] < 0 || bbox[0][1] > this.h || bbox[1][1] < 0)
		return;

	var p = [-1, -1, 0];
	for (p[0] = bbox[0][0]; p[0] <= bbox[1][0]; p[0]++)  
		for (p[1] = bbox[0][1]; p[1] <= bbox[1][1]; p[1]++) 
		{
			var b_coords = barycentric(points, p);

			// Pixel is outside of barycentric coords
			if (b_coords[0] < 0 || b_coords[1] < 0 || b_coords[2] < 0) 
				continue;

			// Get pixel depth
			p[2] = 0;
			for (var i=0; i<3; i++) 
				p[2] += points[i][2] * b_coords[i];

			// Get buffer index
			var index = this.index(p[0], p[1]);// ((this.h - p[1]) << this.log2w) + p[0];
			
			if (this.zbuffer[index] < p[2])
			{
				this.zbuffer[index] = p[2];
				var d = p[2] / 127;	
				this.set(p[0], p[1], color);// d + (d << 8) + (d << 16)); 
				this.calls++;
			}
		}
}

// Post-processing (mostly SSAO)

Img.postProc = function()
{
	for (var y = 0; y < this.h; y++) {
		for (var x = 0; x < this.w; x++) {

			// Get buffer index
			var index = this.index(x, y);
			if (this.zbuffer[index] < 1e-5) continue;

			var total = 0;
			for (var a = 0; a < Math.PI * 2-1e-4; a += Math.PI / 8) 
			{
				total += Math.PI / 2 - max_elevation_angle(
					this.zbuffer, index, [x, y], [this.w, this.h], [Math.sin(a), Math.cos(a)], this.log2w);
			}
			total /= (Math.PI / 2) * 14;
			//total = Math.pow(total, 1.5);
			var c = this.get(x, y) & 0xff;

			this.set(x, y, (c * total) + ((c * total) << 8) + ((c * total) << 16));
			this.calls++;
		}
	}
}

// Put image data on the canvas

Img.flush = function()
{
	this.imgData.data.set(this.buf8);
	this.ctx.putImageData(this.imgData, 0, 0);
}
