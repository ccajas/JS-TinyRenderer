
// Content pipeline functions

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

	function loadError(response)
	{
		console.error("request failed!");	
	}

	// Load OBJ model via AJAX

	function loadOBJ(file, func)
	{
		var success = function(response)
		{
			var lines = response.split('\n');
			OBJmodel.parse(lines);

			if (func != null) func();
		}

		request(file).then(success, loadError);
	}

	// Load an effect from external JS file 

	function loadEffect(file, func)
	{
		console.log('Effect');
		var effect = document.createElement('script');
		effect.src = file;
		effect.onload = function()
		{
			if (func != null) func();
		}

		document.head.appendChild(effect);	
	}

	// Entry point for loading content

	Content.prototype =
	{
		// Just one public function, for loading all content

		load: function(contentType)
		{
			return function(file, func)
			{
				func = (typeof func !== 'undefined') ? func : null;

				switch (contentType)
				{
					case 'Model':
						return loadOBJ(file, func);
						break;
					case 'Texture':
						return loadTexture(file, func);
						break;
					case 'Effect':
						return loadEffect(file, func);
						break;
				}
			}
		}
	}

	return Content;

})();