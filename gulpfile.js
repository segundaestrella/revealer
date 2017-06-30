var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var mainBowerFiles = require('main-bower-files');
var removeLines = require('gulp-remove-lines');
var clean = require('gulp-clean');
var print = require('gulp-print');


gulp.task('cleanTmp', function () {
    return gulp.src('tmp', {read: false})
        .pipe(clean());
});

gulp.task('cleanDist', function () {
    return gulp.src('dist', {read: false})
        .pipe(clean());
});

gulp.task('copyHtml',function(){
  gulp.src('src/index.html')
  .pipe(gulp.dest('dist'));
})

gulp.task('3rdpart',function(){
  gulp.src(mainBowerFiles())
  .pipe(gulp.dest('dist/vendor'));
})

gulp.task('javascript', function() {
  gulp.src('src/*.js')

    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(concat('all.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('tmp')).pipe(removeLines({'filters': [
      /sourceMappingURL/
    ]}))
    .pipe(gulp.dest('dist'));
});

gulp.task('default',[ '3rdpart','copyHtml','javascript']);
gulp.task('clean',[ 'cleanTmp','cleanDist']);
