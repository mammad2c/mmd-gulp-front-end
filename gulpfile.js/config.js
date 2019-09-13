const src = "src/";

const dist = "dist/";

const outputFilename = "app";

const srcPath = {
  css: `${src}assets/css/**/*.css`,
  fonts: `${src}assets/fonts/**/*.*`,
  images: `${src}assets/images/**/*.*`,
  js: `${src}assets/js/**/*.js`,
  videos: `${src}assets/videos/**.*`,
  html: `${src}*.html`,
  layout: `${src}layout`,
  sass: `${src}sass/${outputFilename}.scss`,
  sassOutput: `${src}assets/css/sassOutput`
};

const distPath = {
  css: `${dist}assets/css/`,
  fonts: `${dist}assets/fonts/`,
  images: `${dist}assets/images/`,
  js: `${dist}assets/js/`,
  videos: `${dist}assets/videos/`
};

const cssFilesOrder = ["*.css", `${outputFilename}.css`];

const jsFilesOrder = ["*.js", `${outputFilename}.js`];

const htmlminOptions = {
  minifyCSS: true,
  minifyJS: true,
  collapseWhitespace: true,
  removeComments: true
};

module.exports = {
  src,
  dist,
  srcPath,
  distPath,
  outputFilename,
  cssFilesOrder,
  jsFilesOrder,
  htmlminOptions
};
