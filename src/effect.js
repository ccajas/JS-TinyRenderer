
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
	var z = m.floor((vs_in[2] / 2 + 0.5) * 32768);

	return [x, y, z];
}

// Flat shading effect, blue pixels

DefaultEffect.prototype.fragment = function(ps_in, color)
{
	color[0] = 0xff0000;
	color[0] = this.texture.sample(null, [ps_in[0], ps_in[1]]);

	return false;
}
