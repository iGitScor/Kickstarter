## Kickstarter CLI

### Tasks

Tasks can be executed by running `kickstarter start --tasks=<task>,<otherTask>`. Just running `kickstarter` will display help.
To know the list of available tasks, you can run the following command `kickstarter help`

If gulp is not installed globally, install it globally `npm install -g gulp`

### Description

* Main commands

|Command|Description|
|-----:|:-----------|
|`kickstarter init`|Configure and install the kickstarter|
|`kickstarter start`|Use the kickstarter|

* Other commands

|Command|Description|
|-----:|:-----------|
|`default`|Compile files and optimize images. Then launch the development environment|
|`help`|Display the list of available commands|
|`compile`|Compile less files in public/less folder (or sass files) and compile javascripts|
|`configuration`|Check if the kickstarter is ready to use, configure the project|
|`installation`|Re-Install kickstarter libraries|
|`test`|Test pagespeed for mobile and desktop and test csslint, jslint and W3C html standards|
|`watch`|Default task described above|

* Sub tasks

Sub tasks could be executed manually but it's not the good way to use the kickstarter