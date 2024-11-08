export namespace WasiIoPoll {
  export { Pollable };
  export async function poll(in_: Array<Pollable>): Promise<Uint32Array>;
}

export class Pollable {
  ready(): boolean;
  async block(): Promise<void>;
}
