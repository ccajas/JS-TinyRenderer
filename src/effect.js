
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

	fragment: function(b_coords, color)
	{
		color[0] = 0xff0000;
		color[0] = this.texture.sample(null, [0.5, 0.5]);

		return false;
	},

	// Map uniform values to effect

	setParameters: function(uniforms)
	{
		var self = this;
		Object.keys(uniforms).map(function(key) 
		{
			self[key] = uniforms[key];
		});
	}
};

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

		x = 512;
		y = 512;
		i = (y * this.texData.width + x);

		return data[i] | data[i + 1] << 8 | data[i + 2] << 16 | data[i + 3] << 24;
	}
}