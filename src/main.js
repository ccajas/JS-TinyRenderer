(function() 
{
	// Shorthand
	
	m = Math;
	doc = document;
	f32a = Float32Array;
	f64a = Float64Array;

	simdSupported = typeof SIMD !== 'undefined'
	simdEnabled = false;

	// Main function

	Renderer = (function() 
	{
		function Renderer() { }

		// Internal variables

		var buffer, effect, model;
		var theta = m.PI;

		if (simdSupported)
		{
			// Function aliases
			add = SIMD.Float32x4.add;
			mul = SIMD.Float32x4.mul;
			splat = SIMD.Float32x4.splat;
			store = SIMD.Float32x4.store;

			// Temp buffer for triangle calculations
			tbuf = new f32a(48);

			simdEnabled = true;
			doc.getElementById('top_info').insertAdjacentHTML('beforeend', 
				'<span class="midblue">&nbsp;SIMD optimized!</span>');
		}

		// Draw model called in deferred request

		drawImage = function()
		{
			buffer.clear([0, 0, 0]);
			start = new Date();
			var count = 1;

			effect.setParameters({
				r: theta
			});

			// Transform geometry to screen space
			for (var f = 0; f < model.faces.length; f++)
			{
				var vs_out = [];
				var face = model.faces[f];

				for (var j = 0; j < 3; j++)
				{
					var v = model.verts[face[j][0]];
					var vt = (model.texcoords.length > 0) ? model.texcoords[face[j][1]] : [0, 0];
					var vn = (model.normals.length > 0)   ? model.normals[face[j][2]]   : [1, 0, 0];

					// Calculate tangent and bitangent
					//var dv1 = [v[1][0] - v[0][0], v[1][1] - v[0][1], v[1][2] - v[0][2]];
					//var dv2 = [v[2][0] - v[0][0], v[2][1] - v[0][1], v[2][2] - v[0][2]];

					// world coords are transformed, tex coords are unchanged
					var vs_in = [v, vt, vn];
					var out = effect.vertex(vs_in);

					vs_out.push(out);
				}
				// Draw the triangle to the buffer
				if (!simdSupported || !simdEnabled)
					buffer.drawTriangle(vs_out, effect, count++);
				else
					buffer.drawTriangleSIMD(vs_out, effect, tbuf);
			}

			//img.postProc();
			buffer.draw();

			theta += m.max((0.001 * (new Date().getTime() - start.getTime())), 1/60);

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

			ready: function(canvas)
			{
				var self = this;
				console.log('ready to render!');

				return function(content)
				{
					model = content.model;

					// Create texture and effects
					effect = new DefaultEffect();
					var texture = content.model_diff;
					var texture_nrm = content.model_nrm;

					// Set context
					var ctx = canvas.getContext('2d');
					var el = doc.getElementById('render_start');
					var simdToggle = doc.getElementById('simd_toggle');

					buffer = new Buffer(ctx, canvas.width, canvas.height);

					// Set shader parameters
					effect.setParameters({
						scr_w: buffer.w,
						scr_h: buffer.h,
						texture: texture,
						texture_nrm: texture_nrm
					});

					// Begin render button
					el.style.display = 'block';
					el.onclick = function() 
					{ 
						console.log('Begin render!'); 
						startProfile = new Date();
						drawImage();
					}

					// Toggle SIMD button (supported browsers only)
					simdToggle.innerText = 'SIMD is on!';
					simdToggle.onclick = function()
					{
						if (simdSupported)
						{
							simdEnabled = !simdEnabled;
							simdToggle.innerText = 'SIMD is ' +
								((simdEnabled) ? 'on!' : 'off!');
						}
					}
				}
			},
		}

		return Renderer;

	})();

})();
