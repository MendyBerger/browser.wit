export namespace WasiSocketsTcp {
  export { TcpSocket };
}
import type { Network } from './wasi-sockets-network.js';
export { Network };
import type { IpSocketAddress } from './wasi-sockets-network.js';
export { IpSocketAddress };
import type { ErrorCode } from './wasi-sockets-network.js';
export { ErrorCode };
import type { InputStream } from './wasi-io-streams.js';
export { InputStream };
import type { OutputStream } from './wasi-io-streams.js';
export { OutputStream };
import type { IpAddressFamily } from './wasi-sockets-network.js';
export { IpAddressFamily };
import type { Duration } from './wasi-clocks-monotonic-clock.js';
export { Duration };
import type { Pollable } from './wasi-io-poll.js';
export { Pollable };
/**
 * # Variants
 * 
 * ## `"receive"`
 * 
 * ## `"send"`
 * 
 * ## `"both"`
 */
export type ShutdownType = 'receive' | 'send' | 'both';

export class TcpSocket {
  startBind(network: Network, localAddress: IpSocketAddress): void;
  finishBind(): void;
  startConnect(network: Network, remoteAddress: IpSocketAddress): void;
  finishConnect(): [InputStream, OutputStream];
  startListen(): void;
  finishListen(): void;
  accept(): [TcpSocket, InputStream, OutputStream];
  localAddress(): IpSocketAddress;
  remoteAddress(): IpSocketAddress;
  isListening(): boolean;
  addressFamily(): IpAddressFamily;
  setListenBacklogSize(value: bigint): void;
  keepAliveEnabled(): boolean;
  setKeepAliveEnabled(value: boolean): void;
  keepAliveIdleTime(): Duration;
  setKeepAliveIdleTime(value: Duration): void;
  keepAliveInterval(): Duration;
  setKeepAliveInterval(value: Duration): void;
  keepAliveCount(): number;
  setKeepAliveCount(value: number): void;
  hopLimit(): number;
  setHopLimit(value: number): void;
  receiveBufferSize(): bigint;
  setReceiveBufferSize(value: bigint): void;
  sendBufferSize(): bigint;
  setSendBufferSize(value: bigint): void;
  subscribe(): Pollable;
  shutdown(shutdownType: ShutdownType): void;
}
