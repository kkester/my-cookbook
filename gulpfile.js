'use strict';

var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify-es').default;
var imagemin = require('gulp-imagemin');
var cp = require('child_process');

gulp.task('hugo-build', function() {
    return cp.exec('npm run hugo-build');
});

gulp.task('minify-html', function () {
    return gulp.src('public/**/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
            removeComments: true,
            useShortDoctype: true,
        }))
        .pipe(gulp.dest('./public'));
});

gulp.task('minify-css', function () {
    return gulp.src('public/**/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('./public'));
});

gulp.task('minify-js', function() {
    return gulp.src('public/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./public'));
});

gulp.task('minify-images', function () {
    return gulp.src('public/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./public'));
});

gulp.task('preBuildIndex', function() {
    return cp.exec('npm run preBuildIndex');
});

gulp.task('build', gulp.series('hugo-build',
    gulp.parallel('minify-css', 'minify-images', 'minify-js', 'preBuildIndex'), function asyncComplete (done) {
        done();
    }
));