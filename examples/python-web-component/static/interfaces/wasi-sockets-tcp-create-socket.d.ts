export namespace WasiSocketsTcpCreateSocket {
  export function createTcpSocket(addressFamily: IpAddressFamily): TcpSocket;
}
import type { IpAddressFamily } from './wasi-sockets-network.js';
export { IpAddressFamily };
import type { TcpSocket } from './wasi-sockets-tcp.js';
export { TcpSocket };
import type { ErrorCode } from './wasi-sockets-network.js';
export { ErrorCode };
