
module.exports = function(grunt) 
{
	grunt.initConfig(
	{
		cwd: process.cwd(),
		pkg: grunt.file.readJSON('package.json'),

		uglify: 
		{
			options: {
				banner: '/*! <%= pkg.name %> - ver. <%= pkg.version %> */\r\n'
				//compress: { drop_console: true }
			},

			js: {
				files: { 'renderer.js': [
					'src/renderer.js'
				]}
			}
		},

		watch: {
			first: {
				files: ['src/renderer.js'],
				tasks: ['uglify']
			}
		}
	});

	grunt.registerTask('watch', ['watch:first']); 

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
};