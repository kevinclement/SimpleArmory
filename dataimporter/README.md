# SimpleArmory data importer

This is a Python library to retrieve WoW data from different sources, and
import it in the SimpleArmory database.

It is highly recommended to run this script regularly, especially after
modifying the database manually, as this will reformat/sort the JSON and ensure
that the imported data is correct to an extent.


## Usage

**Requirements**: Ensure that the `aiohttp` library is installed on your
system, as it is used to fetch data from the different providers.

The simplest way to run the data importer is from the root of the SimpleArmory
repository:

    python3 -m dataimporter

This will try to update all the database (achievements, mounts, pets, realms
and toys). Alternatively, it is possible to only update some specific type of
data:

    python3 -m dataimporter --fixers achievements,pets,toys

It is also possible to change the build of WoW that is used to retrieve the
data, by specifying `--build`, with various degrees of precision:

    python3 -m dataimporter --build 9.1
    python3 -m dataimporter --build 9.1.0
    python3 -m dataimporter --build 9.1.0.40120

The data importer will use the most recent build beginning with the given
build argument. If no argument is given, it always takes the most recent build.

## Debug
VSCode has a launch.json setup so that you can set breakpoints and then run the tool from the command line to attach to it and step through.  

1) Make sure you have debugpy module installed.
```
pip3 install debugpy
```

2) Set a breakpoint inside VSCode in the module you're looking to debug or inside main.

3) Run the command with appropriate importer and debugging.
```
python3 -m debugpy --listen 5678 --wait-for-client -m dataimporter --build 10.2.0.52649 --fixer mounts
```

4) From inside VSCode, click on 'Run and Debug' command on sidebar, and then "Start Debugging" for the "Python:Attach" configuration.
