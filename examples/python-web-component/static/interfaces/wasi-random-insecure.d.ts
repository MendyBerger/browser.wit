export namespace WasiRandomInsecure {
  export function getInsecureRandomBytes(len: bigint): Uint8Array;
  export function getInsecureRandomU64(): bigint;
}
