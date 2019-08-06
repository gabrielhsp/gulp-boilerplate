const gulp 			= require('gulp'),
	$ 				= require('gulp-load-plugins')(),
	pkg 			= require('./package.json'),
	banner 			= require('gulp-banner'),
	cssnano 		= require('cssnano'),
	cssMqpacker 	= require('css-mqpacker'),
	faustaoErrou 	= require('gulp-faustao-errou'),
	autoprefixer 	= require('autoprefixer'),
	named 			= require('vinyl-named'),
	connect 		= require('gulp-connect-php'),
	browserSync 	= require('browser-sync'),
	webpack 		= require('webpack-stream'),
	windowsLocalServer = 'http://localhost:8082/estudos/',
	isWindowsEnv 	= process.env.NODE_ENV && process.env.NODE_ENV === 'windows',
	isProductionEnv = process.env.NODE_ENV && process.env.NODE_ENV === 'production';

const paths = {
	icons: 'src/icons/**/*.svg',
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

gulp.task('icons', () => {
	const fontName = 'font-name';

	return gulp.src(paths.icons)
		.pipe($.iconfontCss({
			fontName,
			path: './src/icons/template.scss',
			targetPath: '../styles/helpers/_icons.scss',
			fontPath: './build',
		}))
		.pipe($.iconfont({
			fontName,
			normalize: true,
			fontHeight: 1000,
			centerHorizontally: true,
			formats: ['ttf', 'eot', 'woff', 'svg', 'woff2'],
			prependUnicode: false
		}))
		.pipe(gulp.dest('./src/fonts/'));
});

gulp.task('styles', () => {
	return gulp.src(paths.scss)
		.pipe($.plumber({ errorHandler: (err) => faustaoErrou.errou(err) }))
		.pipe($.sass({
			errLogToConsole: true,
			outputStyle: 'compressed',
			includePaths: ['src/styles', 'node_modules/tiny-slider/src/', 'node_modules/input-range-scss/', 'node_modules/glightbox/src/postcss/']
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
		.pipe($.plumber({ errorHandler: (err) => faustaoErrou.errou(err) }))
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
							loader: 'babel-loader?cacheDirectory'
						}
					}
				]
			},

			devtool: isProductionEnv ? '' : 'source-map',

			optimization: {
				minimize: !!isProductionEnv
			}
		}))
		.pipe(gulp.dest('build/scripts'))
		.pipe(browserSync.stream());
});

// Connect and start a local php server using gulp-connect-php
gulp.task('connect-sync', () => {
	connect.server({}, () => {
		browserSync({
			proxy: isWindowsEnv ? windowsLocalServer : '127.0.0.1:8000'
		});
	});

	gulp.watch(paths.php).on('change', () => browserSync.reload());
});

// Default task
gulp.task('default', ['styles', 'scripts', 'connect-sync', 'watch']);

// Watch task - Use to watch change in your files and execute other tasks
gulp.task('watch', ['styles', 'scripts'], () => {
	gulp.watch([paths.js], ['scripts']);
	gulp.watch([paths.scss], ['styles']);
});