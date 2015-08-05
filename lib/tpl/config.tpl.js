// Kickstarter configuration
// Generated on %DATE%

module.exports = function (config) {
  return {

    // Base path that will be used to resolve all patterns
    basePath: '%BASE_PATH%',


    // Project type
    project: '%PROJECT%',


    // Instanciate server
    server: %SERVER%,


    // Server main folder
    serverPath: '%SERVERPATH%',


    // Twig compilation
    twig: %TWIG%,


    // Twig to compile
    twigsource: [%TWIGSRC%
    ],



    // Content type
    // possible values: yml || json || no
    content: '%CONTENT%',


    // Content path
    contentPath: '%CONTENTPATH%',


    // Twig compilation dist folder
    twigdist: '%TWIGDIST%',


    // Validate HTML templates
    html: %HTML%,


    // HTML folder(s)
    htmlPath: [%HTMLPATH%
    ],


    // JS compilation
    js: %JS%,


    // JS sources
    jssource: [%JSSRC%
    ],


    // JS dist folder
    jsdist: '%JSDIST%',


    // JS main sources (to be lint)
    jsApplication: [%JSAPP%
    ],


    // Optimize images
    images: %IMAGES%,


    // Images to optimize
    imagessource: [%IMAGESSRC%
    ],


    // images dist folder
    imagesdist: '%IMAGESDIST%',


    // preprocess matching files before serving them to the browser
    csspreprocessors: '%CSSPREPROCESSORS%',


    // preprocess matching files sources
    csspreprocessorssource: [%CSSPREPROCESSORSSRC%
    ],


    // preprocess dist folder
    csspreprocessorsdist: '%CSSPREPROCESSORSDIST%',


    // enable / disable colors in the output (logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO
  };
};