(function() 
{
	// Globals
	startProfile = null;
	frames = 0;

	// Application entry point

	App = (function()
	{
		// Internal variables
		theta = m.PI;
		ctx = null;
		simdToggle = document.getElementById('simd-toggle');

		function App()
		{
			//this.renderer = null;			
			this.init();
		}

		App.prototype =
		{
			init: function()
			{
				// Set canvas
				var canvas = doc.getElementById('render');

				content = new ContentManager();

				if (canvas.getContext)
				{
					content.load('Model')('assets/models/diablo3/diablo3.obj', 'model');
					//content.load('Model')('assets/models/head/head.obj', 'test');
					content.load('Texture')('assets/models/diablo3/diablo3_pose_nm.png', 'model_nrm');
					content.load('Texture')('assets/models/diablo3/diablo3_pose_diffuse.png', 'model_diff');

					content.load('Effect')('assets/shaders/defaultEffect.js');

					// Call update after content is loaded
					content.finishedLoading(this.ready(canvas));
				}
				else
					console.error("Canvas context not supported!");
			},

			// Display render button

			ready: function(canvas)
			{
				var self = this;
				console.log('ready to render!');

				if (simdSupported)
				{
					simdToggle.value = 'SIMD is on!';	
					simdToggle.disabled  = false;
					simdToggle.style.background = '#07f';
					simdToggle.style.color = '#fff';
				}

				return function(content)
				{
					model = content.model;

					// Create texture and effects
					effect = new DefaultEffect();
					var texture = content.model_diff;
					var texture_nrm = content.model_nrm;

					// Set context
					ctx = canvas.getContext('2d');
					var el = document.getElementById('render-start');

					buffer = new Buffer(ctx, canvas.width, canvas.height);
					self.renderer = new Renderer(content);

					// Font setup
					ctx.fillStyle = '#888';
					ctx.font = '16px Helvetica';

					// Set shader parameters
					effect.setParameters({
						scr_w: buffer.w,
						scr_h: buffer.h,
						texture: texture,
						texture_nrm: texture_nrm
					});

					// Begin render button
					el.disabled = false;
					el.value = 'Render';
					el.onclick = function() 
					{
						console.log('Begin render!'); 
						startProfile = new Date();
						self.update(self.renderer);
					}

					// Toggle SIMD button (supported browsers only)
					simdToggle.onclick = function()
					{
						simdEnabled = !simdEnabled;
						simdToggle.value = 'SIMD is ' + (simdEnabled ? 'on!' : 'off!');
						simdToggle.style.background = simdEnabled ? '#07f' : '#ddd';
						simdToggle.style.color      = simdEnabled ? '#fff' : '#333';
					}
				}
			},

			// Update loop

			update: function(renderer)
			{
				var self = this;

				// Set up effect params
				start = new Date();
				var quat = Quaternion.fromEuler(0, theta, 0);
				var rotate = Matrix.rotation(Quaternion.fromEuler(0, theta, 0));
				var scale = Matrix.scale(1, 1, 1);

				var world = Matrix.mul(scale, rotate);

				effect.setParameters({
					m_world: world
				});

				// Render
				renderer.drawImage();

				// Update rotation angle
				theta += m.max((0.001 * (new Date().getTime() - start.getTime())), 1/60);

				// Display stats
				var execTime = "Frame time: "+ (new Date().getTime() - start.getTime()) +" ms";
				var calls = "Pixels drawn/searched "+ buffer.calls +'/'+ buffer.pixels;

				ctx.fillText(execTime, 4, buffer.h - 26);
				ctx.fillText(calls, 4, buffer.h - 8);

				// Reset stats
				buffer.calls = 0;
				buffer.pixels = 0;

				requestAnimationFrame(function() {
					self.update(renderer);
				});
			}
		}

		return App;

	})();

	// Start the application
	var app = new App();

}).call(this);