const gulp 			= require('gulp'),
	$ 				= require('gulp-load-plugins')(),
	pkg 			= require('./package.json'),
	banner 			= require('gulp-banner'),
	cssnano 		= require('cssnano'),
	cssMqpacker 	= require('css-mqpacker'),
	autoprefixer 	= require('autoprefixer'),
	named 			= require('vinyl-named'),
	webpack 		= require('webpack-stream'),
	webserver 		= require('gulp-webserver');

const paths = {
	js: 'src/scripts/**/*.js',
	scss: 'src/styles/**/*.scss',
	css: 'src/css/*.css',
	webpack: 'src/scripts/*.js'
};

// Default comment
const comment = '/*\n' +
	' * Theme Name: <%= pkg.name %>\n' +
	' * Author: <%= pkg.author %>\n' +
	' * Author URI: <%= pkg.homepage %>\n' +
	' * Description: <%= pkg.description %>\n' +
	' * Version: <%= pkg.version %>\n' +
	'*/\n\n';

gulp.task('styles', () => {
	return gulp.src(paths.scss)
		.pipe($.plumber())
		.pipe($.sass({
			errLogToConsole: true,
			outputStyle: 'compressed',
			includePaths: ['src/styles']
		}).on('error', $.sass.logError))
		.pipe($.postcss([
			cssMqpacker({
				sort: true
			}),
			cssnano({
				autoprefixer: false,
				reduceIdents: false
			})
		]))
		.pipe($.postcss([
			autoprefixer()
		]))
		.pipe(banner(comment, {
			pkg: pkg
		}))
		.pipe($.sourcemaps.write('.'))
		.pipe(gulp.dest('./'))
		.pipe($.rename(file => file.basename = file.basename.replace('.min', '')))
		.pipe(gulp.dest('./'))
});

gulp.task('scripts', () => {
	return gulp.src(paths.webpack)
		.pipe($.plumber())
		.pipe(named())
		.pipe(webpack({
			output: {
				filename: '[name].min.js'
			},

			resolve: {
				modules: ['src/scripts', 'node_modules']
			},

			plugins: [
				new webpack.webpack.DefinePlugin({
					VERSION: JSON.stringify(pkg.version)
				}),

				new webpack.webpack.BannerPlugin('Build Version: ' + pkg.version),

				new webpack.webpack.optimize.UglifyJsPlugin({
					minimize: true,
					compress: {
						warnings: false
					}
				})
			]
		}))
		.pipe(gulp.dest('build/'))
});

// Webserver task - Use to start a local webserver
gulp.task('webserver', () => {
	gulp.src('./')
		.pipe(webserver({
			livereload: true,
			open: true,
			directoryListing: {
				enable: true,
				path: './'
			}
		}));
});

// Default task
gulp.task('default', ['styles', 'scripts', 'webserver', 'watch']);

// Watch task - Use to watch change in your files and execute other tasks
gulp.task('watch', () => {
	gulp.watch([paths.js], ['scripts']);
	gulp.watch([paths.scss], ['styles']);
});