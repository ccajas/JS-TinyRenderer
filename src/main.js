(function() 
{
	// Shorthand
	
	m = Math;
	doc = document;
	f32a = Float32Array;
	f64a = Float64Array;

	//simdSupported = false;// typeof SIMD !== 'undefined'
	//simdEnabled = false;

	// Main function

	Renderer = (function() 
	{
		function Renderer() { }

		Renderer.prototype = 
		{
			// Set the current effect for rendering

			setEffect: function(effect)
			{
				this.effect = effect;
			},

			// Draw model called in deferred request

			drawGeometry: function(buffer)
			{
				// Transform geometry to screen space
				for (var f = 0; f < model.f.length; f++)
				{
					var vs_out = [];
					
					for (var j = 0; j < 3; j++)
						vs_out.push(effect.vertex(model.vert(f, j)));

					buffer.drawTriangle(vs_out, effect);
				}
			}
		}

		return Renderer;

	})();

})();
