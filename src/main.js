(function() 
{
	// Shorthand
	
	m = Math;
	doc = document;
	f32a = Float32Array;

	// Main function

	Renderer = (function() 
	{
		function Renderer() { }

		// Internal variables

		var buffer, effect, model;
		var theta = 0;

		// Draw model called in deferred request

		drawImage = function()
		{
			buffer.clear([255, 255, 255]);
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
				buffer.triangle(vs_out, effect);
			}

			//img.postProc();
			buffer.draw();

			theta += (0.001 * (new Date().getTime() - start.getTime()));

			var execTime = "Frame took "+ (new Date().getTime() - start.getTime()) +" ms";
			var calls = "Pixels drawn/found "+ buffer.calls +'/'+ buffer.pixels;
			doc.getElementById('info').innerHTML = execTime +'<br/>'+ calls;

			// Reset stats
			buffer.calls = 0;
			buffer.pixels = 0;

			requestAnimationFrame(function() {
				drawImage();
			});
		}

		// Renderer object

		Renderer.prototype =
		{
			// Display render button

			modelReady: function(content, canvas)
			{
				var self = this;
				console.log('ready to render!');

				return function()
				{
					model = content.model;

					// Create texture and effects
					effect = new DefaultEffect();
					var texture = content.model_diff;

					// Set context
					var ctx = canvas.getContext('2d');
					var el = doc.getElementById('render_start');

					buffer = new Buffer(ctx, canvas.width, canvas.height);

					// Set shader parameters
					effect.setParameters({
						scr_w: buffer.w,
						scr_h: buffer.h,
						texture: texture
					});			

					el.style.display = 'block';
					el.onclick = function() 
					{ 
						console.log('Begin render!'); 
						startProfile = new Date();

						drawImage();
					}
				}
			},
		}

		return Renderer;

	})();

})();
