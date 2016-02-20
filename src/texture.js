// Texture object

Texture = (function()
{
	function Texture(src)
	{
		this.texData = null;
		this.buf32 = null;
		this.source = src;

		this.sample = function(state, uv)
		{
			var data = this.texData.data;

			//tex = new Int32Array(2);
			var x = m.floor(uv[0] * this.texData.width);
			var y = m.floor(uv[1] * this.texData.height);

			// Get starting index of texture data sample
			i = ((this.texData.height - y) * this.texData.width + x);
			smp = this.buf32[i];

			return [smp & 0xff, (smp >> 8) & 0xff, (smp >> 16) & 0xff, (smp >> 24) & 0xff];
		}
	}

	Texture.load = function(texture)
	{
		img = new Image();
		img.src = texture.source;

		img.onload = function() 
		{
			texCanvas = document.createElement('canvas');
			ctx = texCanvas.getContext('2d');

			texCanvas.width = img.width;
			texCanvas.height = img.height;
		
			ctx.drawImage(img, 0, 0);
			img.style.display = 'none';

			texture.texData = ctx.getImageData(0, 0, img.width, img.height);

			var buf = new ArrayBuffer(texture.texData.data.length);
			texture.buf32 = new Uint32Array(buf);

			// Set the buffer data

			for (var i = 0; i < texture.buf32.length; i++)
			{
				var data = texture.texData.data;
				var j = i << 2;
				texture.buf32[i] = 
					data[j] | data[j + 1] << 8 | data[j + 2] << 16 | data[j + 3] << 24;
			}
		}
	}

	return Texture;

})();