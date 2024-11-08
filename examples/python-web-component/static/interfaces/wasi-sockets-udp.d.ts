export namespace WasiSocketsUdp {
  export { UdpSocket };
  export { IncomingDatagramStream };
  export { OutgoingDatagramStream };
}
import type { Network } from './wasi-sockets-network.js';
export { Network };
import type { IpSocketAddress } from './wasi-sockets-network.js';
export { IpSocketAddress };
import type { ErrorCode } from './wasi-sockets-network.js';
export { ErrorCode };
import type { IpAddressFamily } from './wasi-sockets-network.js';
export { IpAddressFamily };
import type { Pollable } from './wasi-io-poll.js';
export { Pollable };
export interface IncomingDatagram {
  data: Uint8Array,
  remoteAddress: IpSocketAddress,
}
export interface OutgoingDatagram {
  data: Uint8Array,
  remoteAddress?: IpSocketAddress,
}

export class IncomingDatagramStream {
  receive(maxResults: bigint): Array<IncomingDatagram>;
  subscribe(): Pollable;
}

export class OutgoingDatagramStream {
  checkSend(): bigint;
  send(datagrams: Array<OutgoingDatagram>): bigint;
  subscribe(): Pollable;
}

export class UdpSocket {
  startBind(network: Network, localAddress: IpSocketAddress): void;
  finishBind(): void;
  stream(remoteAddress: IpSocketAddress | undefined): [IncomingDatagramStream, OutgoingDatagramStream];
  localAddress(): IpSocketAddress;
  remoteAddress(): IpSocketAddress;
  addressFamily(): IpAddressFamily;
  unicastHopLimit(): number;
  setUnicastHopLimit(value: number): void;
  receiveBufferSize(): bigint;
  setReceiveBufferSize(value: bigint): void;
  sendBufferSize(): bigint;
  setSendBufferSize(value: bigint): void;
  subscribe(): Pollable;
}
