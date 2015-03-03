# Kickstarter FAQ

### Gulp script does not work ?

If gulp scripts fail, check if gulp is installed globally by launching `gulp help` command.

**Solution** : Install gulp globally `npm install gulp -g`.

### Less files are not automatically compiled ?

Yes they are, but only if you execute the command `gulp watch`, otherwise you must execute `gulp compile` manually.

### Pagespeed scripts fail ?

These scripts only fail if the configuration is not settled.
Edit your project configuration file and specify config.url or launch the configuration command.

### When using npm, when using gulp ?

Always use gulp scripts directly if gulp is installed globally. npm is only used to install packages.