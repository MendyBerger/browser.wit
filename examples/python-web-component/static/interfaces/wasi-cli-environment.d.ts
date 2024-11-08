export namespace WasiCliEnvironment {
  export function getEnvironment(): Array<[string, string]>;
  export function getArguments(): Array<string>;
  export function initialCwd(): string | undefined;
}
