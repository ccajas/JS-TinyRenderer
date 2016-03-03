(function() 
{
	// Shorthand
	
	m = Math;
	doc = document;
	f32a = Float32Array;
	f64a = Float64Array;

	simdSupported = false;// typeof SIMD !== 'undefined'
	simdEnabled = false;

	// Main function

	Renderer = (function() 
	{
		if (simdSupported)
		{
			simdEnabled = true;

			// Function aliases
			add = SIMD.Float32x4.add;
			sub = SIMD.Float32x4.sub;
			mul = SIMD.Float32x4.mul;
			splat = SIMD.Float32x4.splat;
			store = SIMD.Float32x4.store;

			// Temp buffer for triangle calculations
			tbuf = new f32a(48);
		}

		function Renderer() { }

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
				// Transform geometry to screen space
				for (var f = 0; f < model.faces.length; f++)
				{
					var vs_out = [];
					
					for (var j = 0; j < 3; j++)
						vs_out.push(effect.vertex(model.vert(f, j)));

					// Draw the triangle to the buffer
					if (!simdSupported || !simdEnabled)
						buffer.drawTriangle(vs_out, effect);
					else
						buffer.drawTriangleSIMD(vs_out, effect, tbuf);
				}
			}
		}

		return Renderer;

	})();

})();
