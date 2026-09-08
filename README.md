### browser.wit
The goal of this project is allow web assembly components to interact with standard browser apis. We do this generating WIT interfaces from the [Web IDL](https://webidl.spec.whatwg.org/) standard which describes all of the apis supported by modern Web browsers.

## Running the converter

```
cd generate
cargo run
```

This will create a new version of `wit/web.wit` by running [web2idl](https://github.com/wasi-gfx/webidl2wit) against the idl files in `webidl`

The generated interfaces use the WASI 0.3 async primitives. An event handler attribute
becomes a `stream<event>` to read from, and a WebIDL `Promise` becomes an `async func`,
so nothing depends on `wasi:io` pollables any more.

Some of what the converter emits cannot be kept: WebIDL overloads collapse onto one wit
name, wit has no empty records, and a few items break individual language bindings.
`generate` comments those out on the way through and says why, so regenerating is
reproducible rather than something to patch up by hand afterwards.

## Examples

In the `examples` directory, there is a simple counter example implemented as a web assembly component interacting with browser apis using these interfaces in multiple languages. Only the Rust one runs against the WASI 0.3 interfaces so far; the rest are waiting on their toolchains. See the [examples README](examples/README.md) for instructions on building and running them.
