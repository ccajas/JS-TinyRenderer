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
		if (simdSupported)
		{
			// Function aliases
			add = SIMD.Float32x4.add;
			sub = SIMD.Float32x4.sub;
			mul = SIMD.Float32x4.mul;
			splat = SIMD.Float32x4.splat;
			store = SIMD.Float32x4.store;

			// Temp buffer for triangle calculations
			tbuf = new f32a(48);

			simdEnabled = true;
			var simdToggle = doc.getElementById('simd_toggle');
			simdToggle.innerText = 'SIMD is on!';	
			simdToggle.disabled  = false;

			doc.getElementById('top_info').insertAdjacentHTML('beforeend', 
				'<span class="midblue">&nbsp;SIMD optimized!</span>');
		}

		function Renderer(content) 
		{ 
			//this.buffer = buffer;
			//this.content = content;
		}

		Renderer.prototype = 
		{
			// Set the current effect for rendering

			setEffect: function(effect)
			{
				this.effect = effect;
			},

			// Draw model called in deferred request

			drawImage: function()
			{
				buffer.clear([0, 0, 0]);

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

						// world coords are transformed, tex coords are unchanged
						var vs_in = [v, vt, vn];
						var vs = effect.vertex(vs_in);

						vs_out.push(vs);
					}
					// Draw the triangle to the buffer
					if (!simdSupported || !simdEnabled)
						buffer.drawTriangle(vs_out, effect);
					else
						buffer.drawTriangleSIMD(vs_out, effect, tbuf);
				}

				buffer.draw();
			}
		}

		return Renderer;

	})();

})();
