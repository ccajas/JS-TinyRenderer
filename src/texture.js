// Texture object

Texture = (function()
{
	function Texture(src)
	{
		this.texData = null;
		this.buf32 = null;
		this.source = src;

		this.load();
	}

	Texture.prototype =
	{
		load: function()
		{
			img = new Image();
			img.src = this.source;

			var self = this;

			img.onload = function() 
			{
				texCanvas = document.createElement('canvas');
				ctx = texCanvas.getContext('2d');

				texCanvas.width = img.width;
				texCanvas.height = img.height;
			
				ctx.drawImage(img, 0, 0);
				img.style.display = 'none';

				self.texData = ctx.getImageData(0, 0, img.width, img.height);

				var buf = new ArrayBuffer(self.texData.data.length);
				self.buf32 = new Uint32Array(buf);

				// Set the buffer data

				for (var i = 0; i < self.buf32.length; i++)
				{
					var data = self.texData.data;
					var j = i << 2;
					self.buf32[i] = 
						data[j] | data[j + 1] << 8 | data[j + 2] << 16 | data[j + 3] << 24;
				}
			}
		},

		sample: function(state, uv)
		{
			var data = this.texData.data;

			const x = m.floor(uv[0] * this.texData.width);
			const y = m.floor(uv[1] * this.texData.height);

			// Get starting index of texture data sample
			i = ((this.texData.height - y) * this.texData.width + x);
			smp = this.buf32[i];

			return new Uint8Array([smp, (smp >> 8), (smp >> 16), (smp >> 24)]);
		}
	}

	return Texture;

})();