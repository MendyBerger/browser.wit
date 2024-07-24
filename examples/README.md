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
jco transpile ./target/[example]-component.wasm -o static --map 'webidl:browser/global=../../imports.js#global'
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
