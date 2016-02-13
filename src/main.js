
// Shorthand

var m = Math;
var doc = document;

// Main function

(function() 
{
	var canvas = doc.getElementById('render');
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

// Display render link

function modelReady(model, canvas)
{
	var displayButton = function()
	{
		console.log('ready to render!');

		// Set context
		var ctx = canvas.getContext('2d');
		var el = doc.getElementById('render_start');

		el.style.display = 'block';
		el.onclick = function() 
		{ 
			console.log('Begin render!'); 

			var img = Object.create(Buffer);
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
	//img.clear(0);
	/* */

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

	// Output first render to buffer
	img.drawBuffer();

	// Scan line by line
	img.draw();
}