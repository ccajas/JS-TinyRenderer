
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

		// Create texture and effects
		var effect = Object.create(Effect);
		var texture = Object.create(Texture);

		// Preload textures
		texture.load('obj/diablo3_pose_diffuse.png');

		// Set context
		var ctx = canvas.getContext('2d');
		var el = doc.getElementById('render_start');

		el.style.display = 'block';
		el.onclick = function() 
		{ 
			console.log('Begin render!'); 

			var img = Object.create(Buffer);
			img.init(ctx, canvas.width, canvas.height);

			// Set shader parameters
			effect.setParameters({
				scr_w: img.w,
				scr_h: img.h,
				texture: texture
			});

			drawImage(model, img, effect);
		}
	}

	return displayButton;
}

// Draw model called in deferred request

function drawImage(model, img, effect)
{
	start = new Date();
	console.log(new Date().getTime() - start.getTime() +"ms Crunching triangles");

	// Transform geometry to screen space
	for (var f = 0; f < model.faces.length; f++)
	{
		var face = model.faces[f];
		// Coordinates for model rendering
		//var world_coords = [];
		var screen_coords = [];

		for (var j = 0; j < 3; j++)
		{
			var v = model.verts[face[j][0]];
			screen_coords.push(effect.vertex(v));
		}
		// Draw triangle
		img.triangle(screen_coords, effect);
	}

	// Draw the triangles
	console.log(new Date().getTime() - start.getTime() +"ms Drawing triangles");
/*	
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
			img.triangle(screen, effect);//, color | (color << 8) | (color << 16));
	}
*/
	console.log(new Date().getTime() - start.getTime() +"ms Post-processing");

	// Output first render to buffer
	img.drawBuffer();

	// Scan line by line
	img.draw();
}