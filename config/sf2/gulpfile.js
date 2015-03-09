/*************************************************************
 *************************************************************
 * Gulp dependencies
 */
var gulp = require('gulp');
/*************************************************************
 *************************************************************/

/*************************************************************
 *************************************************************
 * Project setup
 */
var lib         = require('../../lib/kickstarter.js');
// Retrieve project configuration and specifications
var config      = lib.getConfiguration();
/*************************************************************
 *************************************************************/

gulp.task('watch', function () {
  console.log("Watch task for Symfony2 projects");
  // gulp.watch(lib.getSrc(config.sources, 'htmlPath', '/*.html'), ['test-validation-html']);
});
