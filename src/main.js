
// Main function

(function() 
{
	// Shorthand
	m = Math;
	doc = document;
	f32x4 = Float32Array;

	// Globals
	model = null, img = null, effect = null, startProfile = null;
	vertex = null;
	theta = 0;
	frames = 0;

	// Set canvas
	var canvas = doc.getElementById('render');
	model = Object.create(OBJmodel);

	var content = new Content();
	console.dir(content);

	if (canvas.getContext)
		content.load('Model')('assets/obj/diablo3/diablo3.obj');
		//model.load("obj/diablo3/diablo3.obj", modelReady(model, canvas));
	else
		console.error("Canvas context not supported!");

	// Display render

	function modelReady(model, canvas)
	{
		return function()
		{
			console.log('ready to render!');

			// Create texture and effects
			effect = new DefaultEffect();
			var texture = new Texture('obj/diablo3/diablo3_pose_diffuse.png');

			// Set context
			var ctx = canvas.getContext('2d');
			var el = doc.getElementById('render_start');

			el.style.display = 'block';
			el.onclick = function() 
			{ 
				console.log('Begin render!'); 

				img = new Buffer(ctx, canvas.width, canvas.height);

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

		//img.postProc();
		img.draw();

		theta += (0.001 * (new Date().getTime() - start.getTime()));

		var execTime = "Frame took "+ (new Date().getTime() - start.getTime()) +" ms";
		var calls = "Pixels drawn/found "+ img.calls +'/'+ img.pixels;
		doc.getElementById('info').innerHTML = execTime +'<br/>'+ calls;

		// Reset stats
		img.calls = 0;
		img.pixels = 0;

		requestAnimationFrame(function() {
			drawImage();
		});
	}

}).call(this);
