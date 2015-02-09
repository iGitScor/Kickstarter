## Kickstarter CLI

### Tasks

Tasks can be executed by running `gulp <task> <othertask>`. Just running `gulp` will execute the installation task.
To know the list of available tasks, you can run the following command `gulp help`

If gulp is not installed globally, you can run scripts with npm by replacing gulp by `npm run gulp`

### Description

|Command|Description|Alternative|
|-----:|:-----------|-----:|
|`gulp default` (or `gulp`)| Install useful packages|`npm run gulp`|
|`gulp help`|Display the list of available commands|`npm run gulp help`|
|`gulp compile`|Compile less files in public/less folder|`npm run gulp compile`|
|`gulp dist`|Install bower packages and install assets (fontawesome)|`npm run gulp dist`|
|`gulp install`|Re-Install kickstarter libraries|`npm run gulp install`|
|`gulp test`|Test pagespeed for mobile and desktop and test csslint, jslint|`npm run gulp test`|
|`gulp watch`|Launch the develoment environment|`npm run gulp watch`|
