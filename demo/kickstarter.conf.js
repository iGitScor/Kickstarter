// Kickstarter configuration
// Generated on Wed Jul 29 2015 13:10:11 GMT+0000 (UTC)

module.exports = function (config) {
  return {

    // Base path that will be used to resolve all patterns
    basePath: '',


    // Project type
    project: 'plain-project',


    // Instanciate server
    server: true,


    // Server main folder
    serverPath: 'public',


    // Twig compilation
    twig: true,


    // Twig to compile
    twigsource: [
      'sources/full/views/*.twig'
    ],


    // Twig compilation dist folder
    twigdist: 'public',


    // Content type
    // possible values: yml || json || no
    content: 'yml',


    // Content path
    contentPath: 'sources/full/content',


    // Validate HTML templates
    html: true,


    // HTML folder(s)
    htmlPath: [
      'public/*.html'
    ],


    // JS compilation
    js: true,


    // JS sources
    jssource: [
      'sources/full/scripts/*.js'
    ],


    // JS dist folder
    jsdist: 'public/js',


    // JS main sources (to be lint)
    jsApplication: [
      'sources/full/scripts/*.js'
    ],


    // Optimize images
    images: true,


    // Images to optimize
    imagessource: [
      'sources/full/images/*.*'
    ],


    // images dist folder
    imagesdist: 'public/img',


    // preprocess matching files before serving them to the browser
    csspreprocessors: 'less',


    // preprocess matching files sources
    csspreprocessorssource: [
      'sources/full/less/*.less'
    ],


    // preprocess dist folder
    csspreprocessorsdist: 'public/css',


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO
  };
};