export namespace WasiSocketsIpNameLookup {
  export { ResolveAddressStream };
  export function resolveAddresses(network: Network, name: string): ResolveAddressStream;
}
import type { IpAddress } from './wasi-sockets-network.js';
export { IpAddress };
import type { ErrorCode } from './wasi-sockets-network.js';
export { ErrorCode };
import type { Pollable } from './wasi-io-poll.js';
export { Pollable };
import type { Network } from './wasi-sockets-network.js';
export { Network };

export class ResolveAddressStream {
  resolveNextAddress(): IpAddress | undefined;
  subscribe(): Pollable;
}
