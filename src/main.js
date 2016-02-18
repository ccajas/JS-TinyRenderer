
// Main function

(function() 
{
	// Shorthand

	m = Math;
	doc = document;
	log = console.log.bind(console);
	f64 = Float64Array;

	// Globals

	model = null;
	img = null;
	effect = null;
	theta = 0;
	frames = 0;
	startProfile = null;

	// Set canvas

	var canvas = doc.getElementById('render');
	model = Object.create(OBJmodel);

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
		log('ready to render!');

		// Create texture and effects
		effect = new DefaultEffect();
		var texture = new Texture('obj/diablo3/diablo3_pose_diffuse.png');
		log('module', effect);

		// Set context
		var ctx = canvas.getContext('2d');
		var el = doc.getElementById('render_start');

		el.style.display = 'block';
		el.onclick = function() 
		{ 
			log('Begin render!'); 

			img = Buffer(ctx, canvas.width, canvas.height);

			// Set shader parameters
			effect.setParameters({
				scr_w: img.w,
				scr_h: img.h,
				texture: texture
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

	theta += 0.1;

	// Profile 50 frames
	if(++frames >= 50)
	{
		var timespan = new Date().getTime() - startProfile.getTime();
		log('50 frames- Avg. render time: '+ timespan / 50 +'ms'+
			' Avg. FPS: '+ (50000 / timespan).toFixed(3));

		frames = 0;
		startProfile = new Date();
	}

	// Scan line by line
	//img.draw();

	var execTime = "Frame took "+ (new Date().getTime() - start.getTime()) +" ms";
	var calls = "Pixels drawn/found "+ img.calls +'/'+ img.pixels;
	doc.getElementById('info').innerHTML = execTime +'<br/>'+ calls;

	// Output first render to buffer
	img.drawBuffer();
	img.calls = 0;
	img.pixels = 0;

	requestAnimationFrame(function() {
		drawImage();
	});
}