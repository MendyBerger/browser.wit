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
<!-- TODO: remove `--map` for pollable and webidl once jco has working built in pollable and webidl support. -->
```shell
jco transpile --async-mode jspi --no-nodejs-compat ./component.wasm -o static --async-exports "start" --async-wasi-imports --async-wasi-exports --map 'wasi:io/poll=../../poll.js#poll' --map 'webidl:browser/global=../../webidl.js#idlProxy'
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
