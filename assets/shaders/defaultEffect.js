
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
		// You could consider these as shader uniforms

		cam: [0, 0, 1],
		l: [1, -0.15, 0],
		ambient: 0.35,
		spcolor: [0.2, 0.225, 0.375],

		vertex: function(vs_in)
		{
			var world = [vs_in[0][0], vs_in[0][1], vs_in[0][2], 1];
			var uv = vs_in[1];
			var normal = vs_in[2];
			var ratio = this.scr_h / this.scr_w;

			//var nx, ny, nz;

			// Rotate vertex and normal
			var mat_w = this.m_world;
			var rt = Matrix.mul(mat_w, world);

			// Transform vertex to screen space

			var x = ((rt[0] * 0.5 + 0.5 / ratio) * this.scr_w * ratio)|0; 
			var y = ((rt[1] * 0.5 + 0.97) * this.scr_h)|0;
			var z = ((rt[2] * 0.5 + 0.5) * 65536)|0;

			return [[x, y, z], vs_in[1], normal];
		},

		fragment: function(ps_in, color)
		{
			var light = [];

			// Sample diffuse and normal textures
			var t = [235, 235, 235];//this.texture.sample(null, ps_in[0]);
			var nt = ps_in[1];//this.texture_nrm.sample(null, ps_in[0]);

			// Set normal
			var nl = Vec3.normalize(this.l);
			var nnt = Vec3.normalize([nt[0], nt[1], nt[2]]);
			var intensity = m.max(Vec3.dot(nnt, nl), 0);

			// Using Blinn reflection model
  			var r = Vec3.reflect(nl, nnt); // reflected light
  			var spec = m.max(Vec3.dot(r, this.cam), 0);
  			spec *= spec * spec * 2;
  			if (spec > 1) spec = 1;

			light[0] = intensity + this.ambient + spec * this.spcolor[0];
			light[1] = intensity + this.ambient + spec * this.spcolor[1];
			light[2] = intensity + this.ambient + spec * this.spcolor[2];

			// Output color	
			color[0] = m.min(t[0] * light[0], 255);
			color[1] = m.min(t[1] * light[1], 255);
			color[2] = m.min(t[2] * light[2], 255);

			return true;
		}
	}

	return DefaultEffect;

})();
