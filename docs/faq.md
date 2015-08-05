# Kickstarter FAQ

### Gulp script does not work ?

If gulp scripts fail, check if gulp is installed globally by launching `kickstarter help` command.

**Solution** : Install gulp globally `npm install gulp -g`.

### Less files are not automatically compiled ?

Yes they are, but only if you execute the command `kickstarter start [--tasks=watch]`, otherwise you must execute `kickstarter start --tasks=compile` manually.

### When using npm, when using gulp ?

Always use gulp scripts directly if gulp is installed globally. npm is only used to install packages.