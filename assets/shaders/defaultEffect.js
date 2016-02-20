
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
		cam: [0, 0, 1],
		l: [1, -0.15, 0],

		vertex: function(vs_in)
		{
			var world = vs_in[0];
			var uv = vs_in[1];
			var normal = vs_in[2];
			var ratio = this.scr_h / this.scr_w;

			var rt = [];
			var nx, ny, nz;

			// Rotate vertex and normal
/*
			nx = normal[0] * m.cos(this.r) - normal[2] * m.sin(this.r);
			nz = normal[0] * m.sin(this.r) + normal[2] * m.cos(this.r);
			ny = normal[1];
*/
			rt[0] = world[0] * m.cos(this.r) - world[2] * m.sin(this.r);
			rt[1] = world[0] * m.sin(this.r) + world[2] * m.cos(this.r);

			// Transform vertex to screen space

			var x = m.floor((rt[0] / 2 + 0.5 / ratio) * this.scr_w * ratio); 
			var y = m.floor((world[1] / 2 + 0.5) * this.scr_h);
			var z = m.floor((rt[1] / 2 + 0.5) * 65536);

			return [[x, y, z], vs_in[1], normal, this.r];
		},

		fragment: function(ps_in, color)
		{
			//var n = Vec3.normalize(ps_in[1]);
			var r = ps_in[2];
			var ambient = 0.25;

			// Sample diffuse and normal textures
			var t = this.texture.sample(null, ps_in[0]);
			var nt = this.texture_nrm.sample(null, ps_in[0]);

			// Rotate normal
			nz = nt[2] * m.cos(0) - nt[0] * m.sin(0);
			nx = nt[2] * m.sin(0) + nt[0] * m.cos(0);
			ny = nt[1];

			nl = Vec3.normalize(this.l);
			nnt = Vec3.normalize([nx, ny, nz]);
			var intensity = Vec3.dot(nnt, nl);

			// Using Blinn reflection model
			var view = Vec3.normalize(this.cam);
  			var r = Vec3.reflect(nl, nnt); // reflected light
  			var spec = m.pow(m.max(Vec3.dot(r, view), 0), 8) * 5; // Last # is specular intensity

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
