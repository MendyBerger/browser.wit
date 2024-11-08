export namespace WasiSocketsUdpCreateSocket {
  export function createUdpSocket(addressFamily: IpAddressFamily): UdpSocket;
}
import type { IpAddressFamily } from './wasi-sockets-network.js';
export { IpAddressFamily };
import type { UdpSocket } from './wasi-sockets-udp.js';
export { UdpSocket };
import type { ErrorCode } from './wasi-sockets-network.js';
export { ErrorCode };
