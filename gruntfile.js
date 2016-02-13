
module.exports = function(grunt) 
{
	grunt.initConfig(
	{
		cwd: process.cwd(),
		pkg: grunt.file.readJSON('package.json'),

		uglify: 
		{
			options: {
				banner: '/*! <%= pkg.name %> - ver. <%= pkg.version %> */\r\n',
				compress: { drop_console: true }
			},

			js: {
				files: { 'renderer.js': [
					'src/objmodel.js',
					'src/buffer.js',
					'src/util.js',
					'src/main.js'
				]}
			}
		},

		watch: {
			first: {
				files: ['src/*.js'],
				tasks: ['uglify']
			}
		}
	});

	grunt.registerTask('watch', ['watch:first']); 

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
};