export namespace WasiFilesystemTypes {
  export { Descriptor };
  export { DirectoryEntryStream };
  export function filesystemErrorCode(err: Error): ErrorCode | undefined;
}
export type Filesize = bigint;
import type { InputStream } from './wasi-io-streams.js';
export { InputStream };
/**
 * # Variants
 * 
 * ## `"access"`
 * 
 * ## `"would-block"`
 * 
 * ## `"already"`
 * 
 * ## `"bad-descriptor"`
 * 
 * ## `"busy"`
 * 
 * ## `"deadlock"`
 * 
 * ## `"quota"`
 * 
 * ## `"exist"`
 * 
 * ## `"file-too-large"`
 * 
 * ## `"illegal-byte-sequence"`
 * 
 * ## `"in-progress"`
 * 
 * ## `"interrupted"`
 * 
 * ## `"invalid"`
 * 
 * ## `"io"`
 * 
 * ## `"is-directory"`
 * 
 * ## `"loop"`
 * 
 * ## `"too-many-links"`
 * 
 * ## `"message-size"`
 * 
 * ## `"name-too-long"`
 * 
 * ## `"no-device"`
 * 
 * ## `"no-entry"`
 * 
 * ## `"no-lock"`
 * 
 * ## `"insufficient-memory"`
 * 
 * ## `"insufficient-space"`
 * 
 * ## `"not-directory"`
 * 
 * ## `"not-empty"`
 * 
 * ## `"not-recoverable"`
 * 
 * ## `"unsupported"`
 * 
 * ## `"no-tty"`
 * 
 * ## `"no-such-device"`
 * 
 * ## `"overflow"`
 * 
 * ## `"not-permitted"`
 * 
 * ## `"pipe"`
 * 
 * ## `"read-only"`
 * 
 * ## `"invalid-seek"`
 * 
 * ## `"text-file-busy"`
 * 
 * ## `"cross-device"`
 */
export type ErrorCode = 'access' | 'would-block' | 'already' | 'bad-descriptor' | 'busy' | 'deadlock' | 'quota' | 'exist' | 'file-too-large' | 'illegal-byte-sequence' | 'in-progress' | 'interrupted' | 'invalid' | 'io' | 'is-directory' | 'loop' | 'too-many-links' | 'message-size' | 'name-too-long' | 'no-device' | 'no-entry' | 'no-lock' | 'insufficient-memory' | 'insufficient-space' | 'not-directory' | 'not-empty' | 'not-recoverable' | 'unsupported' | 'no-tty' | 'no-such-device' | 'overflow' | 'not-permitted' | 'pipe' | 'read-only' | 'invalid-seek' | 'text-file-busy' | 'cross-device';
import type { OutputStream } from './wasi-io-streams.js';
export { OutputStream };
/**
 * # Variants
 * 
 * ## `"normal"`
 * 
 * ## `"sequential"`
 * 
 * ## `"random"`
 * 
 * ## `"will-need"`
 * 
 * ## `"dont-need"`
 * 
 * ## `"no-reuse"`
 */
export type Advice = 'normal' | 'sequential' | 'random' | 'will-need' | 'dont-need' | 'no-reuse';
export interface DescriptorFlags {
  read?: boolean,
  write?: boolean,
  fileIntegritySync?: boolean,
  dataIntegritySync?: boolean,
  requestedWriteSync?: boolean,
  mutateDirectory?: boolean,
}
/**
 * # Variants
 * 
 * ## `"unknown"`
 * 
 * ## `"block-device"`
 * 
 * ## `"character-device"`
 * 
 * ## `"directory"`
 * 
 * ## `"fifo"`
 * 
 * ## `"symbolic-link"`
 * 
 * ## `"regular-file"`
 * 
 * ## `"socket"`
 */
export type DescriptorType = 'unknown' | 'block-device' | 'character-device' | 'directory' | 'fifo' | 'symbolic-link' | 'regular-file' | 'socket';
import type { Datetime } from './wasi-clocks-wall-clock.js';
export { Datetime };
export type NewTimestamp = NewTimestampNoChange | NewTimestampNow | NewTimestampTimestamp;
export interface NewTimestampNoChange {
  tag: 'no-change',
}
export interface NewTimestampNow {
  tag: 'now',
}
export interface NewTimestampTimestamp {
  tag: 'timestamp',
  val: Datetime,
}
export type LinkCount = bigint;
export interface DescriptorStat {
  type: DescriptorType,
  linkCount: LinkCount,
  size: Filesize,
  dataAccessTimestamp?: Datetime,
  dataModificationTimestamp?: Datetime,
  statusChangeTimestamp?: Datetime,
}
export interface PathFlags {
  symlinkFollow?: boolean,
}
export interface OpenFlags {
  create?: boolean,
  directory?: boolean,
  exclusive?: boolean,
  truncate?: boolean,
}
export interface MetadataHashValue {
  lower: bigint,
  upper: bigint,
}
export interface DirectoryEntry {
  type: DescriptorType,
  name: string,
}
import type { Error } from './wasi-io-streams.js';
export { Error };

export class Descriptor {
  readViaStream(offset: Filesize): InputStream;
  writeViaStream(offset: Filesize): OutputStream;
  appendViaStream(): OutputStream;
  advise(offset: Filesize, length: Filesize, advice: Advice): void;
  syncData(): void;
  getFlags(): DescriptorFlags;
  getType(): DescriptorType;
  setSize(size: Filesize): void;
  setTimes(dataAccessTimestamp: NewTimestamp, dataModificationTimestamp: NewTimestamp): void;
  read(length: Filesize, offset: Filesize): [Uint8Array, boolean];
  write(buffer: Uint8Array, offset: Filesize): Filesize;
  readDirectory(): DirectoryEntryStream;
  sync(): void;
  createDirectoryAt(path: string): void;
  stat(): DescriptorStat;
  statAt(pathFlags: PathFlags, path: string): DescriptorStat;
  setTimesAt(pathFlags: PathFlags, path: string, dataAccessTimestamp: NewTimestamp, dataModificationTimestamp: NewTimestamp): void;
  linkAt(oldPathFlags: PathFlags, oldPath: string, newDescriptor: Descriptor, newPath: string): void;
  openAt(pathFlags: PathFlags, path: string, openFlags: OpenFlags, flags: DescriptorFlags): Descriptor;
  readlinkAt(path: string): string;
  removeDirectoryAt(path: string): void;
  renameAt(oldPath: string, newDescriptor: Descriptor, newPath: string): void;
  symlinkAt(oldPath: string, newPath: string): void;
  unlinkFileAt(path: string): void;
  isSameObject(other: Descriptor): boolean;
  metadataHash(): MetadataHashValue;
  metadataHashAt(pathFlags: PathFlags, path: string): MetadataHashValue;
}

export class DirectoryEntryStream {
  readDirectoryEntry(): DirectoryEntry | undefined;
}
