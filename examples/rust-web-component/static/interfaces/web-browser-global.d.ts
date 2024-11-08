export namespace WebBrowserGlobal {
  export { CssStyleDeclaration };
  export { HtmlElement };
  export { Node };
  export { Window };
  export { Element };
  export { DocumentFragment };
  export { ShadowRoot };
  export { Document };
  export { DefineElementResult };
  export { CreatedElement };
  export function getWindow(): Window;
}
import type { Pollable } from './wasi-io-poll.js';
export { Pollable };
export interface DefineElementOptions {
  superclass?: string,
  observedAttributes: Array<string>,
  formAssociated: boolean,
}
/**
 * # Variants
 * 
 * ## `"open"`
 * 
 * ## `"closed"`
 */
export type ShadowRootMode = 'open' | 'closed';
export interface ShadowRootInit {
  mode: ShadowRootMode,
}
export interface ElementCreationOptions {
  is?: string,
  pseudo?: string,
}
export type ElementCreationOptionsOrString = ElementCreationOptionsOrStringElementCreationOptions | ElementCreationOptionsOrStringString;
export interface ElementCreationOptionsOrStringElementCreationOptions {
  tag: 'element-creation-options',
  val: ElementCreationOptions,
}
export interface ElementCreationOptionsOrStringString {
  tag: 'string',
  val: string,
}
export interface AttributeChanged {
  name: string,
  oldValue?: string,
  newValue?: string,
  namespaceUrl?: string,
}

export class CreatedElement {
  connectedCallbackSubscribe(): Pollable;
  attributeChangedCallbackSubscribe(): Pollable;
  attributeChangedCallbackGet(): AttributeChanged | undefined;
  getElement(): HtmlElement;
}

export class CssStyleDeclaration {
  getPropertyValue(property: string): string;
  setProperty(property: string, value: string, priority: string | undefined): void;
}

export class DefineElementResult {
  constructorSubscribe(): Pollable;
  constructorGet(): CreatedElement | undefined;
}

export class Document {
  createElement(localName: string, options: ElementCreationOptionsOrString | undefined): Element;
}

export class DocumentFragment {
  asNode(): Node;
  querySelector(selectors: string): Element | undefined;
}

export class Element {
  asNode(): Node;
  asHtmlElement(): HtmlElement;
  setId(id: string): void;
  attachShadow(shadowRootInitDict: ShadowRootInit): ShadowRoot;
  shadowRoot(): ShadowRoot | undefined;
}

export class HtmlElement {
  asElement(): Element;
  style(): CssStyleDeclaration;
  onclickSubscribe(): Pollable;
}

export class Node {
  setTextContent(textContent: string): void;
  appendChild(node: Node): Node;
}

export class ShadowRoot {
  asDocumentFragment(): DocumentFragment;
}

export class Window {
  document(): Document | undefined;
  defineElement(name: string, options: DefineElementOptions): DefineElementResult;
}
