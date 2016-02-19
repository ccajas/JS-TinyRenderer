
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

			var rt = [];
			var nx, ny, nz;

			// Rotate vertex and normal

			nx = normal[0] * m.cos(this.r) - normal[2] * m.sin(this.r);
			nz = normal[0] * m.sin(this.r) + normal[2] * m.cos(this.r);
			ny = normal[1];

			rt[0] = world[0] * m.cos(this.r) - world[2] * m.sin(this.r);
			rt[1] = world[0] * m.sin(this.r) + world[2] * m.cos(this.r);

			// Transform vertex to screen space

			var x = m.floor((rt[0] / 2 + 0.5 / ratio) * this.scr_w * ratio); 
			var y = m.floor((world[1] / 2 + 0.5) * this.scr_h);
			var z = m.floor((rt[1] / 2 + 0.5) * 65536);

			return [[x, y, z], vs_in[1], [nx, ny, nz], [x, y, z]];
		},

		fragment: function(ps_in, color)
		{
			var n = ps_in[1];
			var ambient = 0.15;
			var intensity = Vec3.dot(n, Vec3.normalize([0, 1, 1]));
			var t = [255, 255, 255]//this.texture.sample(null, ps_in[0]);

			// Using Blinn for perofrmance over correctness
			var cam = [0, 0, 2];
			var l = [0.5, -1, -1];
			var world = ps_in[2];
			var view = Vec3.normalize([cam[0] - world[0], cam[1] - world[1], cam[2] - world[2]]);

  			var r = Vec3.reflect(Vec3.normalize(l), n); // reflected light
  			var spec = m.pow(m.max(Vec3.dot(r, view), 0), 100) * 200; // Last # is specular power

			intensity = m.max(intensity, 0) * (1-ambient) + ambient + spec;
				
			// Output color	
			color[0] = m.min(t[0] * intensity, 255);
			color[1] = m.min(t[1] * intensity, 255);
			color[2] = m.min(t[2] * intensity, 255);

			return false;
		}
	}

	return DefaultEffect;

})();
