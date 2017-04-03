// Texture object

Texture = (function()
{
	function Texture(src, data)
	{
		this.source = src;
		this.texData = data;

		this.sample = function(state, uv)
		{
			var u = uv[0];
			var v = uv[1];
			if (u < 0) u = 1 + u;
			if (v < 0) v = 1 + v;

			// Get starting index of texture data sample
			var idx = ((this.texData.height - 
				(v * this.texData.height)|0) * this.texData.width + 
				(u * this.texData.width)|0)  * 4;

			return [
				this.texData.data[idx], 
				this.texData.data[idx + 1], 
				this.texData.data[idx + 2], 
				this.texData.data[idx + 3]
			];
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

		// Set the buffer data
		var texData = ctx.getImageData(0, 0, img.width, img.height);

		return new Texture(img.src, texData);
	}

	return Texture;

})();