// Texture object

function Texture(src)
{
	var tx =
	{
		texData: null,
		sampled: false,
		source: ''
	}

	tx.load = function(src)
	{
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
			tx.texData = ctx.getImageData(0, 0, img.width, img.height);

			console.log(tx.texData);
		}	
	}

	tx.sample = function(state, uv)
	{
		var data = tx.texData.data;

		const x = m.floor(uv[0] * tx.texData.width);
		const y = m.floor(uv[1] * tx.texData.height);

		// Get starting index of texture data sample
		i = ((tx.texData.height - y) * tx.texData.width + x) << 2;

		return data[i] | data[i + 1] << 8 | data[i + 2] << 16 | data[i + 3] << 24;
	}

	tx.load(src);
	return tx;
}