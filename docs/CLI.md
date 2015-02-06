## Kickstarter CLI

### Tasks

Tasks can be executed by running `gulp <task> <othertask>`. Just running `gulp` will execute the installation task.
To know the list of available tasks, you can run the following command `gulp help`

### Description

|Command|Description|
|-----:|:-----------|
|`gulp default` (or `gulp`)| Install useful packages|
|`gulp help`|Display the list of available commands|
|`gulp compile`|Compile less files in public/less folder|
|`gulp dist`|Install bower packages and install assets (fontawesome)|
|`gulp install`|Re-Install kickstarter libraries|
|`gulp test`|Test pagespeed for mobile and desktop and test csslint, jslint|
|`gulp watch`|Launch the develoment environment|
