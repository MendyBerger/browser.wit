export namespace WasiSocketsNetwork {
  export { Network };
}
export type Ipv4Address = [number, number, number, number];
export interface Ipv4SocketAddress {
  port: number,
  address: Ipv4Address,
}
export type Ipv6Address = [number, number, number, number, number, number, number, number];
export interface Ipv6SocketAddress {
  port: number,
  flowInfo: number,
  address: Ipv6Address,
  scopeId: number,
}
export type IpSocketAddress = IpSocketAddressIpv4 | IpSocketAddressIpv6;
export interface IpSocketAddressIpv4 {
  tag: 'ipv4',
  val: Ipv4SocketAddress,
}
export interface IpSocketAddressIpv6 {
  tag: 'ipv6',
  val: Ipv6SocketAddress,
}
/**
 * # Variants
 * 
 * ## `"unknown"`
 * 
 * ## `"access-denied"`
 * 
 * ## `"not-supported"`
 * 
 * ## `"invalid-argument"`
 * 
 * ## `"out-of-memory"`
 * 
 * ## `"timeout"`
 * 
 * ## `"concurrency-conflict"`
 * 
 * ## `"not-in-progress"`
 * 
 * ## `"would-block"`
 * 
 * ## `"invalid-state"`
 * 
 * ## `"new-socket-limit"`
 * 
 * ## `"address-not-bindable"`
 * 
 * ## `"address-in-use"`
 * 
 * ## `"remote-unreachable"`
 * 
 * ## `"connection-refused"`
 * 
 * ## `"connection-reset"`
 * 
 * ## `"connection-aborted"`
 * 
 * ## `"datagram-too-large"`
 * 
 * ## `"name-unresolvable"`
 * 
 * ## `"temporary-resolver-failure"`
 * 
 * ## `"permanent-resolver-failure"`
 */
export type ErrorCode = 'unknown' | 'access-denied' | 'not-supported' | 'invalid-argument' | 'out-of-memory' | 'timeout' | 'concurrency-conflict' | 'not-in-progress' | 'would-block' | 'invalid-state' | 'new-socket-limit' | 'address-not-bindable' | 'address-in-use' | 'remote-unreachable' | 'connection-refused' | 'connection-reset' | 'connection-aborted' | 'datagram-too-large' | 'name-unresolvable' | 'temporary-resolver-failure' | 'permanent-resolver-failure';
/**
 * # Variants
 * 
 * ## `"ipv4"`
 * 
 * ## `"ipv6"`
 */
export type IpAddressFamily = 'ipv4' | 'ipv6';
export type IpAddress = IpAddressIpv4 | IpAddressIpv6;
export interface IpAddressIpv4 {
  tag: 'ipv4',
  val: Ipv4Address,
}
export interface IpAddressIpv6 {
  tag: 'ipv6',
  val: Ipv6Address,
}

export class Network {
}
