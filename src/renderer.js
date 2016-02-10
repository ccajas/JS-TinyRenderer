
function drawInit()
{
	var canvas = document.getElementById('render');

	if (canvas.getContext)
	{
		var ctx = canvas.getContext('2d');
		var img = Object.create(Img);
		var model = Object.create(OBJmodel);

		img.init(ctx);
		console.log("canvas loaded");

		// "Clear" canvas to black
		img.clear();

		// Test load model
		model.load("obj/head.obj");

		// Draw a point
		img.set(52, 141, 0xffffff);

		start = new Date();

		for (var i = 0; i < 1000000; i++)
		{
			// A few lines
			img.line(13, 20, 80, 40, 0xffffff);
			img.line(20, 13, 40, 80, 0xff0000);
			img.line(80, 40, 13, 20, 0xff0000);
		}

		end = new Date();
		var execTime = "Execution took "+ (end.getTime() - start.getTime()) +" ms";

		// Finally put image data onto canvas
		img.flush();

		document.getElementById('info').innerHTML = execTime;
		console.log(execTime);
	}
	else
	{
		console.error("Canvas context not supported!");
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

	this.w = 1 << this.log2width;
	this.h = ctx.canvas.clientHeight;

	// create buffers for data manipulation

	this.imgData = ctx.createImageData(this.w, this.h);
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
		this.buf32[i] = 0xff000000;
}

// Set a pixel

Img.set = function(x, y, c)
{
	const index = (y << this.log2width) + x;
	this.buf32[index] = (c << 8) + 255;

	// Increment draw calls
	this.calls++;
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
}

// Put image data on the canvas

Img.flush = function()
{
	this.imgData.data.set(this.buf8);
	this.ctx.putImageData(this.imgData, 0, 0);
	console.log("Pixel draw calls: "+ this.calls);
}

// Utility functions

var Util = new Object();

// OBJ Model functions

var OBJmodel = new Object();

OBJmodel.load = function(file)
{
	var request = new XMLHttpRequest();
	request.open("GET", file, true);

	request.onload = function() 
	{
		if(request.status === 200 || request.status == 0)
		{
			var response = request.responseText;
			//console.log(response);
		}
	}
	request.send(null);
}

