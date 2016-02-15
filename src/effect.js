
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

// Texture object

var Texture =
{
	texData: null,
	sampled: false,
	source: '',

	load: function(src)
	{
		var self = this;
		img = new Image();
		img.src = src;

		img.onload = function() 
		{
			texCanvas = document.createElement('canvas');
			ctx = texCanvas.getContext('2d');

			texCanvas.width = img.width;
			texCanvas.height = img.height;
		
			ctx.drawImage(img, 0, 0);
			img.style.display = 'none';
			self.texData = ctx.getImageData(0, 0, img.width, img.height);

			console.log(self.texData);
		}	
	},

	sample: function(state, uv)
	{
		var data = this.texData.data;

		const x = m.floor(uv[0] * this.texData.width);
		const y = m.floor(uv[1] * this.texData.height);

		// Get starting index of texture data sample
		i = ((this.texData.height - y) * this.texData.width + x) << 2;

		return data[i] | data[i + 1] << 8 | data[i + 2] << 16 | data[i + 3] << 24;
	}
}