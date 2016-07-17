var gulp 	  = require('gulp');
var cleanCSS  = require('gulp-clean-css');
var sass 	  = require('gulp-ruby-sass');
var webserver = require('gulp-webserver');

// Default task
gulp.task('default', ['sass', 'clean-css', 'webserver', 'watch']);

// Sass Task - Use to create sass task
gulp.task('sass', function() {
    sass('assets/scss/**/*.scss')
        .on('error', sass.logError)
        .pipe(gulp.dest('assets/css/'));
});

// Clean CSS Task
gulp.task('clean-css', function() {
	return gulp.src('assets/css/*.css')
	.pipe(cleanCSS({compatibility: 'ie8'}))
	.pipe(gulp.dest('assets/css/'));
});

// Webserver task - Use to start a local webserver
gulp.task('webserver', function() {
	gulp.src('./')
	.pipe(webserver({
		fallback: 'index.html',
		livereload: true,
		open: true,
		directoryListing: {
			enable: true,
			path: 'app'
		}
	}));
});

// Watch task - Use to watch change in your files and execute other tasks
gulp.task('watch', function() {
	gulp.watch(['assets/scss/**/*.scss'], ['sass']);
	gulp.watch(['assets/css/**/*.css'], ['clean-css']);
});