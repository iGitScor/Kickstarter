### Gulp script does not work ?

If gulp scripts fail, check if gulp is installed globally by launching `gulp help` command
**Solution** : See the CLI documentation for alternatives. Scripts have to be executed with npm in this case.

### Less files are not automatically compiled ?

Yes. But only if you execute the command `gulp watch`, otherwise you must execute `gulp compile` manually.

### Pagespeed scripts fail ?

They only fail if the configuration is not settled.
Edit your gulpfile.js file and specify config.url.