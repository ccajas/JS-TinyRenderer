
// Default shader effect

var Effect = 
{
	// Conversion to screen space
	vertex: function(vs_in)
	{
		var ratio = this.scr_h / this.scr_w;

		var x = m.floor((vs_in[0] / 2 + 0.5 / ratio) * this.scr_w * ratio); 
		var y = m.floor((vs_in[1] / 2 + 0.5) * this.scr_h);
		var z = m.floor((vs_in[2] / 2 + 0.5) * 32768);

		return [x, y, z];
	},

	// Flat shading effect, blue pixels
	fragment: function(bar, color)
	{
		color[0] = 0xff0000;
		return false;
	}
};

// Map uniform values to effect

var setUniforms = function(effect, uniforms)
{
	Object.keys(uniforms).map(function(key) 
	{
		effect[key] = uniforms[key];
	});
}