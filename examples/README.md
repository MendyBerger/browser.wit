# Examples

### Setup env:

##### install jco
```shell
npm install -g @bytecodealliance/jco
```

##### install wasm-tools
```shell
cargo install wasm-tools
```


### Available Rust examples
- basic


### compile a Rust example
```shell
cd examples/rust-[example]
cargo build --release --target wasm32-unknown-unknown
wasm-tools component new ./target/wasm32-unknown-unknown/release/[example].wasm -o ./target/[example]-component.wasm
jco transpile --async-mode asyncify --default-async-imports --default-async-exports --no-nodejs-compat ./target/[example]-component.wasm -o static --map 'webidl-temp:browser/global=../../imports.js#idlProxy' --map 'wasi:io/poll=../../poll.js#poll' --async-exports "start"
```

### Server the example
Then serve the `examples` directory with an http server.
E.g. the python http server:
```shell
cd ../
python -m http.server
```

### View the example
Point your browser to `http://localhost:[PORT]/[example]`
