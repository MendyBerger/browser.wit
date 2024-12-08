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


## Compile Example to Component

### Rust
`cd` into the example directory
```shell
cd examples/[example]
```

Compile the example
```shell
cargo build --release --target wasm32-unknown-unknown
wasm-tools component new ./target/wasm32-unknown-unknown/release/[example].wasm -o ./component.wasm
```

## Make the Component Browser Ready
```shell
jco transpile --async-mode asyncify --default-async-imports --default-async-exports --no-nodejs-compat ./component.wasm -o static --map 'webidl-temp:browser/global=../../imports.js#idlProxy' --map 'wasi:io/poll=../../poll.js#poll' --async-exports "start"
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
