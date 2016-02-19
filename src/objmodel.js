
// OBJ Model functions

OBJmodel = (function()
{
	function OBJmodel() { }

	// OBJ properties

	OBJmodel.prototype =
	{
		verts:[],
		faces: [],
		normals: [],
		texcoords: [],
	}

	OBJmodel.parse = function(lines)
	{
		var splitLine = function(i) { return lines[i].split(' ').splice(1, 3); }

		// Read each line
		for (var i = 0; i < lines.length; i++)
		{
			// Find vertex positions
			switch (lines[i].substr(0, 2))
			{
				case 'v ':
					this.prototype.verts.push(new f32x4(splitLine(i)));
					break;

				// Find vertex normals
				case 'vn':
					this.prototype.normals.push(new f32x4(splitLine(i)));
					break;

				// Find texture coordinates
				case 'vt':
					this.prototype.texcoords.push(new f32x4(splitLine(i)));
					break;

				// Find face indices
				case 'f ':
					var indices = splitLine(i);
					
					for (var j = 0; j < 3; j++)
						indices[j] = indices[j].split('/').map(function(i) {
							return parseInt(i - 1);
						});

					this.prototype.faces.push(indices);
					break;
			}
		}

		console.log('total verts: '+ this.prototype.verts.length);
		console.log('total normals: '+ this.prototype.normals.length);
		console.log('total faces: '+ this.prototype.faces.length);

		return this.prototype;
	}

	return OBJmodel;

})();
