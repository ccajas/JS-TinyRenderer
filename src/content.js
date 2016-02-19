
// Content management functions

Content = (function()
{
	function Content() { }

	// General AJAX request function

	function request(file)
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

	function loadOBJ(file, func)
	{
		var success = function(response)
		{
			var lines = response.split('\n');
			OBJmodel.parse(lines);

			if (func != null)
				func();
		}

		var error = function(response)
		{
			console.error("request failed!");	
		}

		request(file).then(success, error);
	}

	var _priv = 'private test';

	// Entry point for loading content

	Content.prototype =
	{
		load: function(contentType)
		{
			return function(file, func)
			{
				func = (typeof func !== 'undefined') ? func : null;
				switch (contentType)
				{
					case 'Model':
						console.log('loaded a model file!', _priv);
						return loadOBJ(file, func);
						break;
					case 'Texture':
						return loadTexture(file, func);
						break;
				}
			}
		}
	}

	return Content;

})();