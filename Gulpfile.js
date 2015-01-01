var gulp       = require('gulp'),
    uglify     = require('gulp-uglify'),
    concat     = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps');

gulp.task('default', function() {
	gulp.src('src/*')
		.pipe(concat('webm-fingerprint.js'))
		.pipe(gulp.dest('build'));
	gulp.src('src/*')
		.pipe(concat('webm-fingerprint.min.js'))
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('build'));
});