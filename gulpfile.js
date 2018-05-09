const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const mocha = require('gulp-mocha');

gulp.task('default', ['build']);

gulp.task('build', () => {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('dist'));
});

gulp.task('test', ['build'], () =>
    gulp.src(['test/**/*.js'], { read: false })
        .pipe(mocha({ reporter: 'nyan' }))
);
