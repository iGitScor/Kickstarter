# Kickstarter

## Documentation

* [Getting Started](docs/getting-started.md) - How to get going with Kickstarter
* [CLI documentation](docs/CLI.md) - Learn how to call tasks and use compilers

## Configuration

* Update the gulpfile.js file and modify config.url variable with an absolute URL to launch `gulp test-pagespeed` task and its sub-tasks.

## FAQ

Most frequently asked questions are described here.
You can find other questions here : [FAQ](docs/faq.md)

### Gulp script does not work ?

If gulp scripts fail, check if gulp is installed globally by launching `gulp help` command.

**Solution** : See the CLI documentation for alternatives. Scripts have to be executed with npm in this case.

### Less files are not automatically compiled ?

Yes. But only if you execute the command `gulp watch`, otherwise you must execute `gulp compile` manually.

### Pagespeed scripts fail ?

They only fail if the configuration is not settled.
Edit your gulpfile.js file and specify config.url.