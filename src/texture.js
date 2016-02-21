// Texture object

Texture = (function()
{
	function Texture(src, data, buf)
	{
		this.texData = data;
		this.buf32 = buf;
		this.source = src;

		this.sample = function(state, uv)
		{
			var data = this.texData.data;

			const x = m.round(uv[0] * this.texData.width);
			const y = m.round(uv[1] * this.texData.height);

			// Get starting index of texture data sample
			i = ((this.texData.height - y) * this.texData.width + x);
			smp = this.buf32[i];

			return [smp & 0xff, (smp >> 8) & 0xff, (smp >> 16) & 0xff, (smp >> 24) & 0xff];
		}
	}

	// Create a new texture from an image

	Texture.load = function(img)
	{
		texCanvas = document.createElement('canvas');
		ctx = texCanvas.getContext('2d');

		texCanvas.width = img.width;
		texCanvas.height = img.height;
	
		ctx.drawImage(img, 0, 0);
		img.style.display = 'none';

		var texData = ctx.getImageData(0, 0, img.width, img.height);

		var buf = new ArrayBuffer(texData.data.length);
		var buf32 = new Uint32Array(buf);

		// Set the buffer data

		for (var i = 0; i < buf32.length; i++)
		{
			var data = texData.data;
			var j = i << 2;
			buf32[i] = 
				data[j] | data[j + 1] << 8 | data[j + 2] << 16 | data[j + 3] << 24;
		}

		return new Texture(img.src, texData, buf32);
	}

	return Texture;

})();