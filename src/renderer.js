
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
	return function()
	{
		var img = Object.create(Img);
		img.init(ctx)

		console.log("Canvas loaded");

		// "Clear" canvas to black
		img.clear(0x0);

		start = new Date();

		for (var i = 0; i < 100; i++)
		{
			// A few lines
			img.line(13, 20, 80, 40, 0xffffff);
			img.line(20, 13, 40, 80, 0xffffff);
	
			for (var f = 0; f < model.faces.length; f++)
			{
				var face = model.faces[f];

				for (var v = 0; v < 3; v++) 
				{
					var v0 = model.verts[face[v] - 1]; 
					var v1 = model.verts[face[(v+1)%3] - 1]; 

					var x0 = Math.floor((v0[1] / 2 + 0.5) * img.h); 
					var y0 = Math.floor((v0[0] / 2 + 0.5) * img.w); 
					var x1 = Math.floor((v1[1] / 2 + 0.5) * img.h); 
					var y1 = Math.floor((v1[0] / 2 + 0.5) * img.w); 

					img.line(x0, y0, x1, y1, 0xffffff); 
				}
			}
		}

		end = new Date();
		var execTime = "Execution took "+ (end.getTime() - start.getTime()) +" ms";

		// Finally put image data onto canvas
		img.flush();

		document.getElementById('info').innerHTML = execTime;
		console.log(execTime);
	}
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

	// Translate and flip canvas vertically to have the origin at the bottom left
	ctx.translate(0, this.h);
	ctx.scale(1, -1);
}

// Clear canvas

Img.clear = function(color)
{
	const len = this.buf32.length;
	for (var i = 0; i < len; i++)
		this.buf32[i] = color + (255 << 24);
}

// Set a pixel

Img.set = function(x, y, color)
{
	y = this.h - y;
	const index = (y << this.log2width) + x;
	this.buf32[index] = (color << 8) + 255;
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

// Put image data on the canvas

Img.flush = function()
{
	this.imgData.data.set(this.buf8);
	this.ctx.putImageData(this.imgData, 0, 0);
	console.log("Pixel draw calls: "+ this.calls);
}
