
// Effect object implementation

var Effect = 
{
	// Vertex and fragment shaders
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

// Default shader effect

var DefaultEffect = function() { };

DefaultEffect.prototype = Object.create(Effect);

// Conversion to screen space

DefaultEffect.prototype.vertex = function(vs_in)
{
	var ratio = this.scr_h / this.scr_w;

	var x = m.floor((vs_in[0] / 2 + 0.5 / ratio) * this.scr_w * ratio); 
	var y = m.floor((vs_in[1] / 2 + 0.5) * this.scr_h);
	var z = m.floor((vs_in[2] / 2 + 0.5) * 65536);

	return [x, y, z];
}

// Flat shading effect, blue pixels

DefaultEffect.prototype.fragment = function(ps_in, color)
{
	var n = ps_in[1];
	var ambient = 0.15;
	var intensity = n[2];//dot(ps_in[1], [0, 0, 1]);*/
	var t = this.texture.sample(null, ps_in[0]);
	//var l = [0, 0, 1];

	//ref = normalize((dot(n, l) * 2) - l);   // reflected light
    //spec = m.pow(m.max(ref[2], 0), -1);

	intensity = (m.max(intensity, 0) * (1-ambient)) + ambient;
			
	color[0] = 255;//(t & 0xff) * intensity;
	color[1] = 255;//((t >> 8) & 0xff) * intensity;
	color[2] = 255;//((t >> 16) & 0xff) * intensity;

	return false;
}
