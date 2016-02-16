// Texture object

Texture = (function()
{
	var tx =
	{
		texData: null,
		buf32: null,
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

			var buf = new ArrayBuffer(tx.texData.data.length);
			tx.buf32 = new Uint32Array(buf);

			// Set the buffer data

			for (var i = 0; i < tx.buf32.length; i++)
			{
				var data = tx.texData.data;
				var j = i << 2;
				tx.buf32[i] = data[j] | data[j + 1] << 8 | data[j + 2] << 16 | data[j + 3] << 24;
			}
		}	
	}

	tx.sample = function(state, uv)
	{
		var data = tx.texData.data;

		const x = m.floor(uv[0] * tx.texData.width);
		const y = m.floor(uv[1] * tx.texData.height);

		// Get starting index of texture data sample
		i = ((tx.texData.height - y) * tx.texData.width + x);
		smp = tx.buf32[i];

		return new Uint8Array([smp, (smp >> 8), (smp >> 16), (smp >> 24)]);
	}

	return tx;

})();