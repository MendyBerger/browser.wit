### browser.wit
The goal of this project is allow web assembly components to interact with standard browser apis. We do this generating WIT interfaces from the [Web IDL](https://webidl.spec.whatwg.org/) standard which describes all of the apis supported by modern Web browsers.

## Running the converter

```
cd generate
cargo run
```

This will create a new version of `wit/web.wit` by running [web2idl](https://github.com/wasi-gfx/webidl2wit) against the idl files in `webidl`

## Examples

In the `examples` directory, there is a simple counter example implemented as a web assembly component interacting with browser apis using these interfaces in multiple languages. See the [examples README](examples/README.md) for instructions on building and running them.
