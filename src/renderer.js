
function drawInit()
{
	var canvas = document.getElementById('render');
	var model = Object.create(OBJmodel);

	if (canvas.getContext)
	{
		var ctx = canvas.getContext('2d');
		var draw = drawFunc(model, ctx);

		// Test load model
		model.load("obj/head.obj", draw);
	}
	else
	{
		console.error("Canvas context not supported!");
	}
}

// Draw model called in deferred request

function drawFunc(model, ctx)
{
	var draw = function()
	{
		var img = Object.create(Img);
		img.init(ctx)

		console.log("Canvas loaded");

		var th = 0;

		//var intervalID = window.setInterval(function()
		{
			// "Clear" canvas to black
			img.clear(0x0);

			start = new Date();

			const cos_th = Math.cos(th);
			const sin_th = Math.sin(th);

			for (var i = 0; i < 100; i++)
			{
				// A few lines
				img.line(13, 20, 80, 40, 0xffffff);
				img.line(20, 13, 40, 80, 0xffffff);
		
				for (var f = 0; f < model.faces.length; f++)
				{
					var face = model.faces[f];

					/*for (var v = 0; v < 3; v++) 
					{
						var v0 = model.verts[face[v] - 1]; 
						var v1 = model.verts[face[(v+1)%3] - 1];
						var x0 = v0[1];
						var y0 = v0[0];
						var x1 = v1[1];
						var y1 = v1[0];

						// Rotate it!
						y0 = y0 * cos_th - v0[2] * sin_th;
						y1 = y1 * cos_th - v1[2] * sin_th;

						x0 = Math.floor((x0 / 2 + 0.5) * img.h); 
						y0 = Math.floor((y0 / 2 + 0.5) * img.w); 
						x1 = Math.floor((x1 / 2 + 0.5) * img.h); 
						y1 = Math.floor((y1 / 2 + 0.5) * img.w); 

						img.line(x0, y0, x1, y1, 0xffffff);
					}*/

					var v = [];
					v[0] = model.verts[face[0] - 1]; 
					v[1] = model.verts[face[1] - 1];
					v[2] = model.verts[face[2] - 1];

					for (var j = 0; j < 3; j++)
					{
						var x = Math.floor((v[j][0] / 2 + 0.5) * img.h); 
						var y = Math.floor((v[j][1] / 2 + 0.5) * img.w);

						v[j] = [x, y];
					}

					img.triangle(v, 0xffffff);
				}
			}

			img.triangle([[20, 20], [33, 150], [160, 160]], 0xffffff77);

			end = new Date();
			var execTime = "Execution took "+ (end.getTime() - start.getTime()) +" ms";

			// Finally put image data onto canvas
			img.flush();

			document.getElementById('info').innerHTML = execTime;
			//console.log(execTime);

			th += 0.01;

		}//, 100);
	}

	return draw;
}

// Image drawing utility functions

var Img = new Object();

// Img properties

Img.ctx = null;
Img.imgData = null;
Img.util = null;

// Initialize image

Img.init = function(ctx)
{
	this.ctx = ctx;
	this.util = Object.create(Util);
	this.calls = 0;
	var bufWidth = ctx.canvas.clientWidth;

	// Get next highest 2^pow for width
	this.log2width = 1;
	while (bufWidth >>= 1) this.log2width++;

	bufWidth = 1 << this.log2width;
	this.w = ctx.canvas.clientWidth;
	this.h = ctx.canvas.clientHeight;

	// create buffers for data manipulation

	this.imgData = ctx.createImageData(bufWidth, this.h);
	this.buf = new ArrayBuffer(this.imgData.data.length);

	this.buf8 = new Uint8ClampedArray(this.buf);
	this.buf32 = new Uint32Array(this.buf);
}

// Clear canvas

Img.clear = function(color)
{
	const len = this.buf32.length;
	for (var i = 0; i < len; i++)
		this.buf32[i] = color + 0xff000000;
}

// Set a pixel

Img.set = function(x, y, color)
{
	const index = ((this.h - y) << this.log2width) + x;
	this.buf32[index] = color + 0xff000000;
}

// Get a pixel

Img.get = function(x, y)
{
	const index = ((this.h - y) << this.log2width) + x;
	return this.buf32[index];
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
	const derror = Math.abs(dy / dx);
	
	var error = 0;
	var y = y0; 

	for (var x = x0; x <= x1; x++) 
	{
		if (steep)
			this.set(x, y, color)
		else
			this.set(y, x, color)

		error += derror;

		if (error > 0.5) { 
			y += (y1 > y0) ? 1 : -1; 
			error--;
		} 
	}

	// Increment draw calls
	this.calls += (x1 - x0 + 1);
}

// Draw a triangle from 2D points

Img.triangle = function(points, color) 
{ 
	const bbox = this.util.findBbox(points, [this.w, this.h]);

	var pts = 0;
	var point = [-1, -1];
	for (point[0] = bbox[0][0]; point[0] <= bbox[1][0]; point[0]++) 
	{ 
		for (point[1] = bbox[0][1]; point[1] <= bbox[1][1]; point[1]++) 
		{
			var bc_screen = this.util.barycentric(points, point);

			// Pixel is outside of barycentric coords
			if (bc_screen[0] < 0 || bc_screen[1] < 0 || bc_screen[2] < 0) 
				continue;

			this.set(point[0], point[1], color); 
			this.calls++;
		}
	}
}

// Put image data on the canvas

Img.flush = function()
{
	this.imgData.data.set(this.buf8);
	this.ctx.putImageData(this.imgData, 0, 0);

	console.log("Pixel draw calls: "+ this.calls);
	this.calls = 0;
}
