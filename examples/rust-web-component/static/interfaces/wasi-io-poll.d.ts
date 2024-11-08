export namespace WasiIoPoll {
  export async function poll(in_: Array<Pollable>): Promise<Uint32Array>;
  export { Pollable };
}

export class Pollable {
}
