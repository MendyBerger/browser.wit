export namespace Exports {
  export function init(appName: string, symbols: Symbols, stubWasi: boolean): void;
}
export interface Bundled {
  module: string,
  protocol: string,
  name: string,
}
export interface Function {
  protocol: string,
  name: string,
}
export interface Constructor {
  module: string,
  protocol: string,
}
export interface Static {
  module: string,
  protocol: string,
  name: string,
}
export type FunctionExport = FunctionExportBundled | FunctionExportFreestanding | FunctionExportConstructor | FunctionExportMethod | FunctionExportStatic;
export interface FunctionExportBundled {
  tag: 'bundled',
  val: Bundled,
}
export interface FunctionExportFreestanding {
  tag: 'freestanding',
  val: Function,
}
export interface FunctionExportConstructor {
  tag: 'constructor',
  val: Constructor,
}
export interface FunctionExportMethod {
  tag: 'method',
  val: string,
}
export interface FunctionExportStatic {
  tag: 'static',
  val: Static,
}
export interface Case {
  name: string,
  hasPayload: boolean,
}
export interface LocalResource {
  'new': number,
  rep: number,
  drop: number,
}
export interface RemoteResource {
  drop: number,
}
export interface Resource {
  local?: LocalResource,
  remote?: RemoteResource,
}
export type OwnedKind = OwnedKindRecord | OwnedKindVariant | OwnedKindEnum | OwnedKindFlags | OwnedKindResource;
export interface OwnedKindRecord {
  tag: 'record',
  val: Array<string>,
}
export interface OwnedKindVariant {
  tag: 'variant',
  val: Array<Case>,
}
export interface OwnedKindEnum {
  tag: 'enum',
  val: number,
}
export interface OwnedKindFlags {
  tag: 'flags',
  val: number,
}
export interface OwnedKindResource {
  tag: 'resource',
  val: Resource,
}
export interface OwnedType {
  kind: OwnedKind,
  'package': string,
  name: string,
}
export type Type = TypeOwned | TypeOption | TypeNestingOption | TypeResult | TypeTuple | TypeHandle;
export interface TypeOwned {
  tag: 'owned',
  val: OwnedType,
}
export interface TypeOption {
  tag: 'option',
}
export interface TypeNestingOption {
  tag: 'nesting-option',
}
export interface TypeResult {
  tag: 'result',
}
export interface TypeTuple {
  tag: 'tuple',
  val: number,
}
export interface TypeHandle {
  tag: 'handle',
}
export interface Symbols {
  typesPackage: string,
  exports: Array<FunctionExport>,
  types: Array<Type>,
}
