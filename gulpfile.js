const gulp 			= require('gulp'),
	$ 				= require('gulp-load-plugins')(),
	pkg 			= require('./package.json'),
	banner 			= require('gulp-banner'),
	cssnano 		= require('cssnano'),
	cssMqpacker 	= require('css-mqpacker'),
	autoprefixer 	= require('autoprefixer'),
	named 			= require('vinyl-named'),
	browserSync 	= require('browser-sync'),
	webpack 		= require('webpack-stream'),
	isProductionEnv = process.env.NODE_ENV && process.env.NODE_ENV === 'production';

const paths = {
	js: 'src/scripts/**/*.js',
	scss: 'src/styles/**/*.scss',
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
			outputStyle: isProductionEnv ? 'compressed' : 'nested',
			includePaths: ['src/styles', 'node_modules/']
		}).on('error', $.sass.logError))
		.pipe(isProductionEnv ? $.postcss([
			autoprefixer(),
			cssMqpacker({
				sort: true
			}),
			cssnano({
				autoprefixer: false,
				reduceIdents: false
			})
		]) : $.util.noop())
		.pipe(banner(comment, {
			pkg: pkg
		}))
		.pipe(isProductionEnv ? $.util.noop() : $.sourcemaps.write('.'))
		.pipe(gulp.dest('./build/css/'))
		.pipe(browserSync.stream());
});

gulp.task('scripts', () => {
	return gulp.src(paths.webpack)
		.pipe($.plumber())
		.pipe(named())
		.pipe(webpack({
			mode: isProductionEnv ? 'production' : 'development',

			output: {
				filename: '[name].min.js'
			},

			resolve: {
				modules: ['src/scripts', 'node_modules']
			},

			module: {
				rules: [
					{
						test: /\.js$/,
						exclude: /node_modules/,
						use: {
							loader: 'babel-loader?cacheDirectory',
							options: {
								presets: ['@babel/preset-env', '@babel/preset-react'],
								plugins: ['@babel/plugin-proposal-class-properties']
							}
						}
					}
				]
			},

			devtool: isProductionEnv ? '' : 'source-map',

			optimization: {
				minimize: !!isProductionEnv
			}
		}))
		.pipe(gulp.dest('build/scripts/'))
		.pipe(browserSync.stream());
});


gulp.task('connect-sync', () => {
	browserSync.init({
		server: { baseDir: './build/' }
	})
});

// Default task
gulp.task('default', ['styles', 'scripts', 'connect-sync', 'watch']);

// Watch task - Use to watch change in your files and execute other tasks
gulp.task('watch', ['styles', 'scripts'], () => {
	gulp.watch([paths.js], ['scripts']);
	gulp.watch([paths.scss], ['styles']);
});