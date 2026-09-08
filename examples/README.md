# Examples

## Setup env:

#### install wasm-tools
```shell
cargo install wasm-tools
```

#### install jco
Version 1.32 or newer, for WASI 0.3 support.
```shell
npm install -g @bytecodealliance/jco@latest
```

## Available examples
- rust_counter

The go, python, dotnet and moonbit examples are not ported to the WASI 0.3 interfaces
yet. They still poll `wasi:io` pollables, which the generated wit no longer has, and
their toolchains do not support component model async streams. Their instructions below
are kept for when they can be brought back.

## How the browser apis look now

Two shapes changed with WASI 0.3:

- An event handler attribute is a stream of events. `element.onclick()` hands back a
  `stream<event>` to read from, in place of the old `onclick-subscribe` pollable.
- A method that returned a `Promise` in WebIDL is an `async func`, so it is awaited in
  the guest language rather than blocking.

The world's `start` is an `async func` too, which is what lets a guest await those
streams directly instead of driving a poll loop.


## Compile Example to Component

### `cd` into the example directory
```shell
cd examples/[example]
```

### Rust
Compile the example
```shell
cargo build --release --target wasm32-unknown-unknown
wasm-tools component new ./target/wasm32-unknown-unknown/release/[example].wasm -o ./component.wasm
```

### Go

Install [tiny-go](https://tinygo.org/)

Generate types from wit
```shell
go get go.bytecodealliance.org/cmd/wit-bindgen-go
go run go.bytecodealliance.org/cmd/wit-bindgen-go generate -o internal/ ./wit
```

Compile the example
<!-- TODO: enable once we remove the go-specific world ```shell
tinygo build --target=wasip2 --no-debug -o component.wasm --wit-package ./wit --wit-world browser main.go
``` -->
```shell
tinygo build --target=wasip2 --no-debug -o component.wasm --wit-package ./wit --wit-world go-example-world main.go
```

### Python
Generate types from wit
```shell
componentize-py --wit-path ../../wit --world browser bindings .
```

Compile the example
```shell
componentize-py --wit-path ../../wit --world browser componentize app -o component.wasm
```

### C#/.NET
Compile the example
```shell
dotnet build --configuration Release
cp bin/Release/net10.0/wasi-wasm/native/dotnet_counter.wasm ./component.wasm
```

### MoonBit
Generate types from wit

Note: this will override the existing example code.
```shell
wit-bindgen moonbit ../../wit --world browser
```

Compile the example
```shell
moon build --target wasm
wasm-tools component embed ../../wit target/wasm/release/build/gen/gen.wasm -o target/gen.wasm --world browser  --encoding utf16
wasm-tools component new target/gen.wasm -o component.wasm
```

## Make the Component Browser Ready
<!-- TODO: remove `--map` for webidl once jco has working built in webidl support. -->
The component imports nothing but `webidl:browser/global`, so the only mapping left is
the one pointing at the browser glue.
```shell
jco transpile --no-nodejs-compat ./component.wasm -o static --map 'webidl:browser/global=../../webidl.js#idlProxy'
```

## Serve the example
Then serve the `examples` directory with an http server.
E.g. the python http server:
```shell
cd ../
python -m http.server
```

### View the example
Point your browser to `http://localhost:[PORT]/?example=[example]`
