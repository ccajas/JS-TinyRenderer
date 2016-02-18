// Effect object implementation

Effect = (function()
{
	function Effect() {}

	// Vertex and fragment shaders
	Effect.prototype = 
	{
		vertex: function(vs_in) { },

		fragment: function(ps_in, color) { },

		// Map parameters to effect

		setParameters: function(params)
		{
			var self = this;
			Object.keys(params).map(function(key) 
			{
				self[key] = params[key];
			});
		}
	}

	return Effect;

})();

// Default shader effect

DefaultEffect = (function()
{
	function DefaultEffect() 
	{ 
		this.setParameters = Effect.prototype.setParameters;
	}

	// Conversion to screen space, vs_in contains vertex and normal info

	DefaultEffect.prototype =
	{
		vertex: function(vs_in)
		{
			var world = vs_in[0];
			var normal = vs_in[2];
			var ratio = this.scr_h / this.scr_w;

			// Rotate vertex and normal

			var nx = normal[0] * m.cos(this.r) - normal[2] * m.sin(this.r);
			var nz = normal[0] * m.sin(this.r) + normal[2] * m.cos(this.r);
			var ny = normal[1];

			var rt = [];
			rt[0] = world[0] * m.cos(this.r) - world[2] * m.sin(this.r);
			rt[1] = world[0] * m.sin(this.r) + world[2] * m.cos(this.r);

			// Transform vertex to screen space

			var x = m.floor((rt[0] / 2 + 0.5 / ratio) * this.scr_w * ratio); 
			var y = m.floor((world[1] / 2 + 0.5) * this.scr_h);
			var z = m.floor((rt[1] / 2 + 0.5) * 65536);

			return [[x, y, z], vs_in[1], [nx, ny, nz]];
		},

		fragment: function(ps_in, color)
		{
			var n = ps_in[1];
			var ambient = 0.15;
			var intensity = Vec3.dot(n, [0, 0, 1]);
			var t = this.texture.sample(null, ps_in[0]);
			//var l = [0, 0, 1];

			//ref = normalize((dot(n, l) * 2) - l);   // reflected light
			//spec = m.pow(m.max(ref[2], 0), -1);

			intensity = (m.max(intensity, 0) * (1-ambient)) + ambient;
				
			// Output color	
			color[0] = t[0] * intensity;
			color[1] = t[1] * intensity;
			color[2] = t[2] * intensity;

			return false;
		}
	}

	return DefaultEffect;

})();
