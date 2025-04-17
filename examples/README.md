# Examples

## Setup env:

#### install wasm-tools
```shell
cargo install wasm-tools
```

#### install jco
```shell
npm install -g @bytecodealliance/jco
```

## Available Rust examples
- rust_counter
- go_counter


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

## Make the Component Browser Ready
<!-- TODO: remove `--map` for pollable and webidl once jco has working built in pollable and webidl support. -->
```shell
jco transpile --async-mode jspi --no-nodejs-compat ./component.wasm -o static --async-exports "start" --async-wasi-imports --async-wasi-exports --map 'wasi:io/poll=../../poll.js#poll' --map 'webidl:browser/global=../../webidl.js#idlProxy' --map 'wasi:filesystem/*=https://cdn.jsdelivr.net/npm/@bytecodealliance/preview2-shim/lib/browser/filesystem.js#*' --map 'wasi:clocks/*=https://cdn.jsdelivr.net/npm/@bytecodealliance/preview2-shim/lib/browser/clocks.js#*' --map 'wasi:io/*=https://cdn.jsdelivr.net/npm/@bytecodealliance/preview2-shim/lib/browser/io.js#*' --map 'wasi:random/*=https://cdn.jsdelivr.net/npm/@bytecodealliance/preview2-shim/lib/browser/random.js#*' --map 'wasi:cli/*=https://cdn.jsdelivr.net/npm/@bytecodealliance/preview2-shim/lib/browser/cli.js#*'
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
