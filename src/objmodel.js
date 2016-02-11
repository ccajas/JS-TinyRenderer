
// OBJ Model functions

var OBJmodel = new Object();

OBJmodel.verts = [];
OBJmodel.faces = [];
OBJmodel.normals = [];

OBJmodel.request = function(file)
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
}

OBJmodel.load = function(file, func)
{
	var self = this;
	var success = function(response)
	{
		var lines = response.split('\n');
		self.parse(lines);
		func();
	}

	// handle errors
	var error = function(response)
	{
		console.error("request failed!");	
	}

	self.request(file).then(success, error);
}

OBJmodel.parse = function(lines)
{
	// Read each line
	for (var i = 0; i < lines.length; i++)
	{
		// Find vertex positions
		switch (lines[i].substr(0, 2))
		{
			case 'v ':
				this.verts.push(lines[i].split(' ').splice(1, 3));
				break;

			// Find vertex normals
			case 'vn':
				this.normals.push(lines[i].split(' ').splice(1, 3));
				break;

			// Find face indices
			case 'f ':
				var indices = lines[i].split(' ').splice(1, 3);
				
				for (var j = 0; j < 3; j++)
					indices[j] = indices[j].split('/');

				this.faces.push(indices);
				break;
		}
	}

	console.log('total verts: '+ this.verts.length);
	console.log('total faces: '+ this.faces.length);
}