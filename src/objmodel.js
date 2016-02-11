
// OBJ Model functions

var OBJmodel = new Object();

OBJmodel.verts = [];
OBJmodel.faces = [];

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

	self.request(file)
	.then(function(response)
	{
		var lines = response.split('\n');
		self.parse(lines);
		func();
	}, 
	function (e) {
		// handle errors
		console.error("request failed!");
	});
}

OBJmodel.parse = function(lines)
{
	// Read each line
	for (var i = 0; i < lines.length; i++)
	{
		// Find vertex positions
		if (lines[i].indexOf('v ') == 0)
		{
			var coords = lines[i].split(' ').splice(1, 3);
			this.verts.push(coords);
		}

		// Find face indices
		if (lines[i].indexOf('f ') == 0)
		{
			var indices = lines[i].split(' ').splice(1, 3);
			
			for (var j = 0; j < 3; j++)
				indices[j] = indices[j].split('/')[0];

			this.faces.push(indices);
		}
	}

	console.log('total verts: '+ this.verts.length);
	console.log('total faces: '+ this.faces.length);
}