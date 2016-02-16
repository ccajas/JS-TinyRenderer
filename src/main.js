
// Shorthand

var m = Math;
var doc = document;

// Main function

(function() 
{
	var canvas = doc.getElementById('render');
	model = Object.create(OBJmodel);

	if (canvas.getContext)
	{
		//JSON.parse(response).then(null, null);

		// Test load model
		model.load("obj/diablo3/diablo3.obj", modelReady(model, canvas));
	}
	else
	{
		console.error("Canvas context not supported!");
	}
}).call(this);

var model, img, effect;
var theta = 0;
var frames = 0;
var startProfile;

// Display render link

function modelReady(model, canvas)
{
	return function()
	{
		console.log('ready to render!');

		// Create texture and effects
		effect = new DefaultEffect;
		Texture.load('obj/diablo3/diablo3_pose_diffuse.png');

		// Set context
		var ctx = canvas.getContext('2d');
		var el = doc.getElementById('render_start');

		el.style.display = 'block';
		el.onclick = function() 
		{ 
			console.log('Begin render!'); 

			img = Buffer(ctx, canvas.width, canvas.height);

			// Set shader parameters
			effect.setParameters({
				scr_w: img.w,
				scr_h: img.h,
				texture: Texture
			});

			startProfile = new Date();

			drawImage();
		}
	}
}

// Draw model called in deferred request

function drawImage()
{
	img.clear([255, 255, 255]);

	start = new Date();
	//console.log(new Date().getTime() - start.getTime() +"ms Drawing triangles");

	effect.setParameters({
		r: theta
	});

	// Transform geometry to screen space
	for (var f = 0; f < model.faces.length; f++)
	{
		var face = model.faces[f];
		var vs_out = [];

		for (var j = 0; j < 3; j++)
		{
			var v = model.verts[face[j][0]];
			var vt = (model.texcoords.length > 0) ? model.texcoords[face[j][1]] : [0, 0];
			var vn = (model.normals.length > 0)   ? model.normals[face[j][2]]   : [1, 0, 0];

			// world coords are transformed, tex coords are unchanged
			var vs_in = [v, vt, vn];
			var out = effect.vertex(vs_in);
			vs_out.push(out);
		}

		// Draw triangle
		img.triangle(vs_out, effect);
	}

	var execTime = "Frame took "+ (new Date().getTime() - start.getTime()) +" ms";
	var calls = "Pixels drawn/found "+ img.calls +'/'+ img.pixels;
	doc.getElementById('info').innerHTML = execTime +'<br/>'+ calls;

	// Output first render to buffer
	img.drawBuffer();
	img.calls = 0;
	img.pixels = 0;

	theta += 0.1;

	// Profile 100 frames
	if(++frames >= 100)
	{
		var timespan = new Date().getTime() - startProfile.getTime();
		console.log('100 frames- Avg. render time: '+ timespan / 100 +'ms'+
			' Avg. FPS: '+ (100000 / timespan).toFixed(3));

		frames = 0;
		startProfile = new Date();
	}

	requestAnimationFrame(function() {
		drawImage();
	});

	// Scan line by line
	//img.draw();
}