
// Model functions

Model = (function()
{
	// OBJ properties

	function Model()
	{ 
		this.verts = [];
		this.faces = [];
		this.normals = [];
		this.texcoords = [];
	}

	Model.parseOBJ = function(lines, model)
	{
		var splitLine = function(i) { return lines[i].split(' ').splice(1, 3); }

		// Read each line
		for (var i = 0; i < lines.length; i++)
		{
			// Find vertex positions
			switch (lines[i].substr(0, 2))
			{
				case 'v ':
					model.verts.push(new f32a(splitLine(i)));
					break;

				// Find vertex normals
				case 'vn':
					model.normals.push(new f32a(splitLine(i)));
					break;

				// Find texture coordinates
				case 'vt':
					model.texcoords.push(new f32a(splitLine(i)));
					break;

				// Find face indices
				case 'f ':
					var indices = splitLine(i);
					
					for (var j = 0; j < 3; j++)
						indices[j] = indices[j].split('/').map(function(i) {
							return parseInt(i - 1);
						});

					model.faces.push(indices);
					break;
			}
		}

		console.log('total verts: '+ model.verts.length);
		console.log('total normals: '+ model.normals.length);
		console.log('total faces: '+ model.faces.length);
	}

	Model.prototype =
	{
		// Get vertex data from face

		vert: function(f_index, v)
		{
			var face = model.faces[f_index];
			var vert = model.verts[face[v][0]];
			var vt = (model.texcoords.length > 0) ? model.texcoords[face[v][1]] : [0, 0];
			var vn = (model.normals.length > 0)   ? model.normals[face[v][2]]   : [1, 0, 0];

			// Return vertex data
			return [vert, vt, vn];
		}
	}

	return Model;

})();
