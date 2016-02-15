
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
		model.load("obj/diablo3/diablo3.obj", modelReady(model, canvas));
	}
	else
	{
		console.error("Canvas context not supported!");
	}
}).call(this);

// Display render link

function modelReady(model, canvas)
{
	return function()
	{
		console.log('ready to render!');

		// Create texture and effects
		var effect = new DefaultEffect;
		var texture = Object.create(Texture);

		// Preload textures
		texture.load('obj/diablo3/diablo3_pose_diffuse.png');

		// Set context
		var ctx = canvas.getContext('2d');
		var el = doc.getElementById('render_start');

		el.style.display = 'block';
		el.onclick = function() 
		{ 
			console.log('Begin render!'); 

			var img = Buffer(ctx, canvas.width, canvas.height);

			// Set shader parameters
			effect.setParameters({
				scr_w: img.w,
				scr_h: img.h,
				texture: texture
			});

			drawImage(model, img, effect);
		}
	}
}

// Draw model called in deferred request

function drawImage(model, img, effect)
{
	start = new Date();
	console.log(new Date().getTime() - start.getTime() +"ms Drawing triangles");

	// Transform geometry to screen space
	for (var f = 0; f < model.faces.length; f++)
	{
		var face = model.faces[f];
		var vs_out = [];

		for (var j = 0; j < 3; j++)
		{
			var v = model.verts[face[j][0]];
			var t = model.texcoords[face[j][1]];

			// world coords are transformed, tex coords are unchanged
			v = effect.vertex(v);
			vs_out.push([v, t]);
		}
		// Draw triangle
		img.triangle(vs_out, effect);
	}

	console.log(new Date().getTime() - start.getTime() +"ms Post-processing");

	// Output first render to buffer
	img.drawBuffer();

	// Scan line by line
	img.draw();
}