
// OBJ Model functions

var OBJmodel = 
{
	// OBJ properties

	verts:[],
	faces: [],
	normals: [],
	texcoords: [],

	parse: function(lines)
	{
		var splitLine = function(i) { return lines[i].split(' ').splice(1, 3); }

		// Read each line
		for (var i = 0; i < lines.length; i++)
		{
			// Find vertex positions
			switch (lines[i].substr(0, 2))
			{
				case 'v ':
					this.verts.push(new f32x4(splitLine(i)));
					break;

				// Find vertex normals
				case 'vn':
					this.normals.push(new f32x4(splitLine(i)));
					break;

				// Find texture coordinates
				case 'vt':
					this.texcoords.push(new f32x4(splitLine(i)));
					break;

				// Find face indices
				case 'f ':
					var indices = splitLine(i);
					
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
