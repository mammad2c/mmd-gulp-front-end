// node modules
const gulp = require("gulp");
const gulpSourcemaps = require("gulp-sourcemaps");
const gulpSass = require("gulp-sass");
const gulpConcat = require("gulp-concat");
const gulpOrder = require("gulp-order");
const gulpNunjucksRender = require("gulp-nunjucks-render");
const gulpInject = require("gulp-inject");
const del = require("del");
const browserSync = require("browser-sync").create();
const gulpPostcss = require("gulp-postcss");
const cssnano = require("cssnano");
const autoprefixer = require("autoprefixer");
const gulpRev = require("gulp-rev");
const gulpUglify = require("gulp-uglify");
const gulpHtmlmin = require("gulp-htmlmin");
const gulpChanged = require("gulp-changed");

// custom files
const {
  src,
  dist,
  srcPath,
  distPath,
  cssFilesOrder,
  jsFilesOrder,
  outputFilename,
  htmlminOptions
} = require("./config");

const isProduction = process.env.NODE_ENV === "production";

const transformDistFilePath = filePath => {
  return filePath.replace(`/${dist}`, "");
};

const copyStaticAssets = (source, destination) =>
  gulp
    .src(source)
    .pipe(gulpChanged(destination))
    .pipe(gulp.dest(destination));

const cssTask = () => {
  const stream = gulp.src(srcPath.css);

  if (isProduction) {
    return stream
      .pipe(gulpOrder(cssFilesOrder))
      .pipe(gulpConcat(`${outputFilename}.css`))
      .pipe(gulpPostcss([autoprefixer(), cssnano()]))
      .pipe(gulpRev())
      .pipe(gulp.dest(distPath.css));
  }

  return stream
    .pipe(gulpSourcemaps.init({ loadMaps: true }))
    .pipe(gulpOrder(cssFilesOrder))
    .pipe(gulpConcat(`${outputFilename}.css`))
    .pipe(gulpSourcemaps.write("."))
    .pipe(gulp.dest(distPath.css))
    .pipe(browserSync.stream());
};

const sassTask = () => {
  const stream = gulp.src(srcPath.sass);

  if (isProduction) {
    return stream.pipe(gulpSass()).pipe(gulp.dest(srcPath.sassOutput));
  }

  return stream
    .pipe(gulpSourcemaps.init())
    .pipe(gulpSass())
    .pipe(gulpSourcemaps.write("."))
    .pipe(gulp.dest(srcPath.sassOutput))
    .pipe(browserSync.stream());
};

const jsTask = () => {
  const stream = gulp.src(srcPath.js);

  if (isProduction) {
    return stream
      .pipe(gulpOrder(jsFilesOrder))
      .pipe(gulpConcat(`${outputFilename}.js`))
      .pipe(gulpUglify())
      .pipe(gulpRev())
      .pipe(gulp.dest(distPath.js));
  }

  return stream
    .pipe(gulpSourcemaps.init())
    .pipe(gulpOrder(jsFilesOrder))
    .pipe(gulpConcat(`${outputFilename}.js`))
    .pipe(gulpSourcemaps.write("."))
    .pipe(gulp.dest(distPath.js));
};

const htmlTask = () => {
  const css = gulp.src(`${distPath.css}**/*.css`);
  const js = gulp.src(`${distPath.js}**/*.js`);

  const stream = gulp
    .src(srcPath.html)
    .pipe(
      gulpNunjucksRender({
        path: srcPath.layout
      })
    )
    .pipe(
      gulpInject(css, {
        transform: function(filePath) {
          return `<link rel="stylesheet"  href="${transformDistFilePath(
            filePath
          )}" />`;
        }
      })
    )
    .pipe(
      gulpInject(js, {
        transform: function(filePath) {
          return `<script src="${transformDistFilePath(filePath)}"></script>`;
        }
      })
    );

  if (isProduction) {
    return stream.pipe(gulpHtmlmin(htmlminOptions)).pipe(gulp.dest(dist));
  }

  return stream.pipe(gulp.dest(dist));
};

const fontsTask = () => copyStaticAssets(srcPath.fonts, distPath.fonts);

const imagesTask = () => copyStaticAssets(srcPath.images, distPath.images);

const videosTask = () => copyStaticAssets(srcPath.videos, distPath.videos);

const cleanTask = () => {
  return del([dist, srcPath.sassOutput]);
};

const watchTask = () => {
  browserSync.init({
    server: {
      baseDir: dist
    }
  });

  gulp.watch(`${src}sass/**/*.scss`, sassTask);
  gulp.watch(srcPath.css, cssTask);
  gulp.watch(srcPath.fonts, fontsTask);
  gulp.watch(srcPath.images, imagesTask);
  gulp.watch(srcPath.videos, videosTask);
  gulp.watch(srcPath.js, () => {
    jsTask();
    browserSync.reload();
  });
  gulp.watch(srcPath.html, () => {
    htmlTask();
    browserSync.reload();
  });
};

const defaultTasks = (
  tasks = cb => {
    cb();
  }
) =>
  gulp.series(
    cleanTask,
    gulp.parallel(fontsTask, imagesTask, videosTask),
    sassTask,
    gulp.parallel(cssTask, jsTask),
    htmlTask,
    tasks
  );

if (isProduction) {
  exports.default = defaultTasks();
} else {
  exports.default = defaultTasks(watchTask);
}
