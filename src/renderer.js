
function drawInit()
{
	var canvas = document.getElementById('render');

	if (canvas.getContext)
	{
		var ctx = canvas.getContext('2d');

		img = Object.create(Img);
		img.init(ctx);

		// "Clear" canvas to black
		img.clear();
		console.log("canvas loaded");

		// Draw a point
		img.set(52, 141, 255, 0, 0);

		start = new Date();

		for (var i = 0; i < 1000000; i++)
		{
			// A line?
			img.line(13, 20, 80, 40, 255, 255, 255);
			img.line(20, 13, 40, 80, 255, 0, 0);
			img.line(80, 40, 13, 20, 255, 0, 0);
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

	console.log(this);

	// create a new batch of pixels with the same dimensions as the image
    this.imgData = ctx.createImageData(this.w, this.h);

	// Translate and flip canvas vertically to have the origin at the bottom left
	ctx.translate(0, this.h);
	ctx.scale(1, -1);
}

// Clear canvas

Img.clear = function(color)
{
	const len = this.imgData.data.length;
	for (var i = 0; i < len; i += 4)
		this.imgData.data[i + 3] = 255;	
}

// Set a pixel

Img.set = function(x, y, r, g, b)
{
	const index = ((y << this.log2width) + x) << 2;
	this.imgData.data[index] = r;
    this.imgData.data[index + 1] = g;
    this.imgData.data[index + 2] = b;
    this.imgData.data[index + 3] = 255;

    // Increment draw calls
    this.calls++;
}

// Draw a line

Img.line = function(x0, y0, x1, y1, r, g, b) 
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
			this.set(x, y, r, g, b)
		else
			this.set(y, x, r, g, b)

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
    request.open("GET", file, false);

    request.onload = function() 
	{
        if(request.status === 200 || request.status == 0)
        {
            var response = rawFile.responseText;
            console.log(response);
        }
    }
    request.send(null);
}

