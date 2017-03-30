
// Content pipeline functions

ContentManager = (function()
{
	function Content() { }

	// Content request data and content loaded callback

	var requestsCompleted = 0;
	var requestsToComplete = 0;
	var contentLoadedCallback;

	// Storage for content

	var collection = { }

	// General AJAX request function, nothing extensive

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
		console.error("request failed!", response);	
	}

	// Add total completed content load requests

	function requestComplete() 
	{
		requestsCompleted++;

		if (requestsCompleted == requestsToComplete) 
		{
			console.info("All content is ready")
			contentLoadedCallback(collection);
		}
	};

	// Load OBJ model via AJAX

	function loadModel(file, modelname)
	{
		requestsToComplete++;
		var success = function(response)
		{
			if (modelname == null) return;

			var model = new Model();
			var lines = response.split('\n');

			Model.parseOBJ(lines, model);
			
			collection[modelname] = model;
			requestComplete();
		}

		return request(file).then(success, loadError);
	}

	// Load Texture image into off-screen canvas

	function loadTexture(file, texname)
	{
		requestsToComplete++;
		var success = function(response)
		{
			if (texname == null) return;

			var img = new Image();
			img.src = file;
			img.onload = function() 
			{
				var texture = Texture.load(img);
				collection[texname] = texture;
				requestComplete();
			}
		}

		return request(file).then(success, loadError);
	}

	// Load an effect from external JS file 

	function loadEffect(file, func)
	{
		requestsToComplete++;
		var effect = document.createElement('script');
		effect.src = file;
		effect.onload = function()
		{
			if (func != null) func();
			requestComplete();
		}

		document.head.appendChild(effect);	
	}

	// Entry point for loading content

	Content.prototype =
	{
		// Just one public method, for loading all content

		load: function(contentType)
		{
			return function(file, func)
			{
				func = (typeof func !== 'undefined') ? func : null;

				switch (contentType)
				{
					case 'Model':
						return loadModel(file, func);
						break;
					case 'Texture':
						return loadTexture(file, func);
						break;
					case 'Effect':
						return loadEffect(file, func);
						break;
				}
			}
		},

		// Accessor to content

		contentCollection: function()
		{
			return collection;
		},

		// Set up content loaded callback

		finishedLoading: function(callback) 
		{ 
			contentLoadedCallback = callback;
		}
	}

	return Content;

})();