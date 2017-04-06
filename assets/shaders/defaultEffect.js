
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
			var world = [vs_in[0][0], vs_in[0][1], vs_in[0][2], 1];
			var uv = vs_in[1];
			var normal = vs_in[2];
			var ratio = this.scr_h / this.scr_w;

			var nx, ny, nz;

			// Rotate vertex and normal
			var mat_w = this.m_world;
			var rt = Matrix.mul(mat_w, world);

			// Transform vertex to screen space

			var x = m.floor((rt[0] / 2 + 0.5 / ratio) * this.scr_w * ratio); 
			var y = m.floor((rt[1] / 2 + 0.75) * this.scr_h);
			var z = m.floor((rt[2] / 2 + 0.5) * 65536);

			return [[x, y, z], vs_in[1], normal, this.r];
		},

		fragment: function(ps_in, color)
		{
			var ambient = 0.65;
			var light = [];
			var spcolor = [0.2, 0.25, 0.35];

			// Sample diffuse and normal textures
			var t = this.texture.sample(null, ps_in[0]);
			var nt = ps_in[1];//this.texture_nrm.sample(null, ps_in[0]);

			// Set normal
			var nl = Vec3.normalize(this.l);
			var nnt = Vec3.normalize([nt[0], nt[1], nt[2]]);
			var intensity = m.max(Vec3.dot(nnt, nl), 0);

			// Using Blinn reflection model
			var view = this.cam;
  			var r = Vec3.reflect(nl, nnt); // reflected light
  			var spec = m.pow(m.max(Vec3.dot(r, view), 0), 10) * 10;

			light[0] = intensity + ambient + spec * spcolor[0];
			light[1] = intensity + ambient + spec * spcolor[1];
			light[2] = intensity + ambient + spec * spcolor[2];

			// Output color	
			color[0] = m.min(t[0] * light[0], 255);
			color[1] = m.min(t[1] * light[1], 255);
			color[2] = m.min(t[2] * light[2], 255);

			return true;
		}
	}

	return DefaultEffect;

})();
