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
- python_counter
- dotnet_counter
- moonbit_counter


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
<!-- TODO: remove `--map` for pollable and webidl once jco has working built in pollable and webidl support. -->
```shell
jco transpile --async-mode jspi --no-nodejs-compat ./component.wasm -o static --async-exports "start" --async-wasi-imports --async-wasi-exports --map 'wasi:io/poll=../../poll.js#poll' --map 'webidl:browser/global=../../webidl.js#idlProxy' --map 'wasi:filesystem/*=https://cdn.jsdelivr.net/npm/@bytecodealliance/preview2-shim/lib/browser/filesystem.js#*' --map 'wasi:clocks/*=https://cdn.jsdelivr.net/npm/@bytecodealliance/preview2-shim/lib/browser/clocks.js#*' --map 'wasi:io/*=https://cdn.jsdelivr.net/npm/@bytecodealliance/preview2-shim/lib/browser/io.js#*' --map 'wasi:random/*=https://cdn.jsdelivr.net/npm/@bytecodealliance/preview2-shim/lib/browser/random.js#*' --map 'wasi:cli/*=https://cdn.jsdelivr.net/npm/@bytecodealliance/preview2-shim/lib/browser/cli.js#*' --map 'wasi:sockets/*=https://cdn.jsdelivr.net/npm/@bytecodealliance/preview2-shim/lib/browser/sockets.js#*'
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
