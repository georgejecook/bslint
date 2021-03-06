# bslint - BrighterScript Lint

`bslint` is a [BrighterScript](https://github.com/rokucommunity/brighterscript) 
plugin offring additional insights on your Roku BrightScript code.

## Installation

You need Node 10+ and `npm` or `yarn`:

```bash
# if you don't have a package.json
npm init -y

# install modules
npm install brighterscript @rokucommunity/bslint
```

Add the plugin to your `bsconfig.json` file in the root of your project, 
or create a minimal file like that:

```json
{
    "plugins": [ "@rokucommunity/bslint" ]
}
```

### Command line interface (CLI)

The `bslint` command will run the BrighterScript compiler without publishing
step, only outputing the diagnostics.

*Note: the CLI can be used without adding the `bslint` plugin.*

```bash
npx bslint --help

# lint with default options
npx bslint
```

or add a `npm` script in `package.json`, e.g.:

```json
{
    ...
    "scripts": {
        "lint": "bslint"
    }
    ...
}
```
and call `npm run lint`.

## Rules

Linting rules can be set in a `bslint.json` file in the root of your project.

Default rules:

```json
{
    "rules": {
        "assign-all-paths": "error",
        "unsafe-path-loop": "error",
        "unsafe-iterators": "error",
        "unreachable-code": "info",
        "consistent-return": "error"
    }
}
```

Valid values for the rules severity are: `error | warn | info | off`.

Rules:

- `assign-all-paths`: a variable is not assigned in all the possible code paths,
    ```brightscript
    if a then
        b = 'something'
    end if
    print b ' error
    ```
- `unsafe-path-loop`: loops are considered as unsafe code paths: assignment in a
  loop may not happen.
    ```brightscript
    for i = 0 to n
        b = "something"
    end if
    print b ' b may not have been assigned
    ```
- `unsafe-iterators`: loop iterator variable should not be used outside a loop
    ```brightscript
    for i = 0 to n
        b = "something"
    end if
    print i ' value could be invalid
    ```
- `unreachable-code`: inform of unreachable code
    ```brightscript
    return
    print "is unreachable"
    ```
- `consistent-return`: verifies consistency of `sub`/`function` returned values 
  (missing return, missing value, returned value while function is `as void`,...)

