export namespace WasiIoStreams {
  export { InputStream };
  export { OutputStream };
}
import type { Error } from './wasi-io-error.js';
export { Error };
export type StreamError = StreamErrorLastOperationFailed | StreamErrorClosed;
export interface StreamErrorLastOperationFailed {
  tag: 'last-operation-failed',
  val: Error,
}
export interface StreamErrorClosed {
  tag: 'closed',
}
import type { Pollable } from './wasi-io-poll.js';
export { Pollable };

export class InputStream {
  read(len: bigint): Uint8Array;
  async blockingRead(len: bigint): Promise<Uint8Array>;
  skip(len: bigint): bigint;
  async blockingSkip(len: bigint): Promise<bigint>;
  subscribe(): Pollable;
}

export class OutputStream {
  checkWrite(): bigint;
  write(contents: Uint8Array): void;
  async blockingWriteAndFlush(contents: Uint8Array): Promise<void>;
  flush(): void;
  async blockingFlush(): Promise<void>;
  subscribe(): Pollable;
  writeZeroes(len: bigint): void;
  async blockingWriteZeroesAndFlush(len: bigint): Promise<void>;
  splice(src: InputStream, len: bigint): bigint;
  async blockingSplice(src: InputStream, len: bigint): Promise<bigint>;
}
