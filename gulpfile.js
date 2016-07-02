var gulp 	 = require('gulp');
var connect  = require('gulp-connect-multi')();
var cleanCSS = require('gulp-clean-css');
var sass 	 = require('gulp-ruby-sass');

// Default task
gulp.task('default', ['sass', 'clean-css', 'server', 'watch']);

// Sass Task - Use to create sass task
gulp.task('sass', function() {
    sass('assets/scss/**/*.scss')
        .on('error', sass.logError)
        .pipe(gulp.dest('assets/css/'))
        .pipe(connect.reload());
});

// Clean CSS Task
gulp.task('clean-css', function() {
	return gulp.src('assets/css/*.css')
	.pipe(cleanCSS({compatibility: 'ie8'}))
	.pipe(gulp.dest('assets/css/'))
	.pipe(connect.reload());
});

// Connect Task - Use to create a server with livereload
gulp.task('server', connect.server({
	root: ['build'],
	port: 9000,
	livereload: true,
	directoryListing: true,
	open: {
		browser: 'chrome'
	}
}));

// Watch task - Use to watch change in your files and execute other tasks
gulp.task('watch', function() {
	gulp.watch(['assets/scss/**/*.scss'], ['sass']);
	gulp.watch(['assets/css/**/*.css'], ['clean-css']);
});