const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const jasmine = require('gulp-jasmine');

const DEST_DIR = 'dist';

gulp.task('default', ['build']);

gulp.task('build', () =>
    tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest(DEST_DIR))
);

gulp.task('test', ['build'], () =>
    gulp.src('spec/**/*.spec.js')
        .pipe(jasmine({ verbose: true }))
);

gulp.task('watch', () =>
    gulp.watch('lib/**/*.ts', ['build'])
);
