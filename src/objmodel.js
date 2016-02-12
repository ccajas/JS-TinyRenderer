
// OBJ Model functions

var OBJmodel = 
{
	// OBJ properties

	verts: [],
	faces: [],
	normals: [],

	request: function(file)
	{
		return new Promise(function(resolve, reject)
		{
			var xhr = new XMLHttpRequest();

			xhr.open("GET", file, true);
			xhr.onload = function() {
		      	if (xhr.status == 200) {
		        	resolve(xhr.response);
		      	}
		      	else {
		        	reject(Error(xhr.statusText));
		      	}
		    }
			xhr.onerror = reject;
			xhr.send(null);
		});
	},

	load: function(file, func)
	{
		var self = this;
		var success = function(response)
		{
			var lines = response.split('\n');
			self.parse(lines);
			func();
		}

		var error = function(response)
		{
			console.error("request failed!");	
		}

		self.request(file).then(success, error);
	},

	parse: function(lines)
	{
		var splitLine = function(lines, i) { return lines[i].split(' ').splice(1, 3); }

		// Read each line
		for (var i = 0; i < lines.length; i++)
		{
			// Find vertex positions
			switch (lines[i].substr(0, 2))
			{
				case 'v ':
					this.verts.push(splitLine(lines, i));
					break;

				// Find vertex normals
				case 'vn':
					this.normals.push(splitLine(lines, i));
					break;

				// Find face indices
				case 'f ':
					var indices = splitLine(lines, i);
					
					for (var j = 0; j < 3; j++)
						indices[j] = indices[j].split('/').map(function(i) {
							return parseInt(i - 1);
						});

					this.faces.push(indices);
					break;
			}
		}

		console.log('total verts: '+ this.verts.length);
		console.log('total normals: '+ this.normals.length);
		console.log('total faces: '+ this.faces.length);
	}
}