const gulp 			= require('gulp'),
	$ 				= require('gulp-load-plugins')(),
	pkg 			= require('./package.json'),
	banner 			= require('gulp-banner'),
	cssnano 		= require('cssnano'),
	cssMqpacker 	= require('css-mqpacker'),
	autoprefixer 	= require('autoprefixer'),
	named 			= require('vinyl-named'),
	connect 		= require('gulp-connect-php'),
	browserSync 	= require('browser-sync'),
	webpack 		= require('webpack-stream');

const paths = {
	js: 'src/scripts/**/*.js',
	scss: 'src/styles/**/*.scss',
	css: 'src/css/*.css',
	php: './*.php',
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
		.pipe(browserSync.stream());
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

			module: {
				loaders: [
					{
						test: /\.js$/,
						use: 'babel-loader',
						exclude: /node_modules/
					}
				]
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
		.pipe(browserSync.stream());
});

// Connect and start a local php server using gulp-connect-php
gulp.task('connect-sync', () => {
	connect.server({}, () => {
		browserSync({
			proxy: '127.0.0.1:8000'
		});
	});

	gulp.watch(paths.php).on('change', () => {
		browserSync.reload();
	});
});

// Default task
gulp.task('default', ['styles', 'scripts', 'connect-sync', 'watch']);

// Watch task - Use to watch change in your files and execute other tasks
gulp.task('watch', ['styles', 'scripts'], () => {
	gulp.watch([paths.js], ['scripts']);
	gulp.watch([paths.scss], ['styles']);
});