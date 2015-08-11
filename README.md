# Kickstarter

## Documentation

* [Getting Started](docs/getting-started.md) - How to get going with Kickstarter
* [CLI documentation](docs/CLI.md) - Learn how to call tasks and use compilers

## Usage

Use the kickstarter by launching this command

```sh
$ kickstarter
```

## Configuration

* Launch `kickstarter init` to configure the project using the kickstarter.

## Tests

* Launch the following command :
``sh
$ mocha
``


For a complete HTML report, add parameters :
```sh
$ mocha --reporter mocha-html-reporter |  \  
  cat node_modules/mocha-html-reporter/docs/head.html - node_modules/mocha-html-reporter/docs/tail.html \  
  > kickstarter.spec.html
```

## Changelog

To see what has changed and the kickstarter roadmap, see the [CHANGELOG](docs/CHANGELOG.md).

## FAQ

Most frequently asked questions are described here : [FAQ](docs/faq.md)
