# JS TinyRenderer
A small software renderer written in JavaScript. (Now with SIMD support!*)

It is based off Dmitry's [TinyRenderer](https://github.com/ssloy/tinyrenderer), using the same concepts and goal of keeping 
the application small while still retaining the core features of a software renderer. Currently fits in less than 10k of code! I'll try to keep it small.

## How it works

JS TinyRenderer emulates the basic steps of a hardware renderer, by reading geometric data from an array source, transforming triangle vertices to screen space, and rasterization of those triangles. It does this using the HTML5 Canvas element to represent the backbuffer, using only the ImageData interface and pixel setting/getting functions to render an image. No built-in Canvas functions for drawing lines or shapes are used. Of course, WebGL is not used either.

As this is a software renderer, the entire application is CPU bound, but there is a lot of potential to add more features. It is currently a single threaded application, and might be difficult to add multithreading support due to the language, but it's something I would still consider.

## Current Features

##### Renderer
* Triangle drawing using barycentric coordinates
* 3D transformations
* Z-buffer for depth checking
* Custom shader support with external scripts
* Screen-space effects (SSAO included as an example)

##### Misc
* Content loading and management
..* Shaders (JavaScript)
..* Models (.obj)
..* Textures (Canvas supported types)

##### Todo
* Render to Texture
* Perspective view camera
* Anti-aliasing using edge detection
* Support multiple materials

## Installing

[Grunt](http://gruntjs.com/getting-started) is required to build the application.
The Package.json and Gruntfile already provide the build setup. Just run these commands in the repo folder:

```
npm install grunt --save-dev
npm install grunt-contrib-watch --save-dev
npm install grunt-contrib-uglify --save-dev
```

Run `grunt watch` to start watching the changes in the source code, which will bundle the files and `uglify` the code when a file is saved.

*Participating browsers only. Download [Firefox Nightly](https://nightly.mozilla.org/) to get the benefits of SIMD!
