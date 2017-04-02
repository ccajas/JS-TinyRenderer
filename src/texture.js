// Texture object

Texture = (function()
{
	function Texture(src, data)
	{
		this.source = src;
		this.texData = data;

		this.sample = function(state, uv)
		{
			// Get starting index of texture data sample
			var idx = ((this.texData.height - 
				m.ceil(uv[1] * this.texData.height)) * this.texData.width + 
				m.ceil(uv[0] * this.texData.width))  * 4;

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