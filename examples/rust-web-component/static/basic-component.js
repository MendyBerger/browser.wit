import { idlProxy } from '../../imports.js';
import { poll as poll$1 } from '../../poll.js';
const { CreatedElement,
  CssStyleDeclaration,
  DefineElementResult,
  Document,
  DocumentFragment,
  Element,
  HtmlElement,
  Node,
  ShadowRoot,
  Window,
  getWindow } = idlProxy;
const { Pollable,
  poll } = poll$1;

const asyncifyModules = [];
let asyncifyPromise;
let asyncifyResolved;

async function asyncifyInstantiate(module, imports) {
  const instance = await instantiateCore(module, imports);
  const memory = instance.exports.memory || (imports && imports.env && imports.env.memory);
  const realloc = instance.exports.cabi_realloc || instance.exports.cabi_export_realloc;
  
  if (instance.exports.asyncify_get_state && memory) {
    let address;
    if (realloc) {
      address = realloc(0, 0, 4, 1024);
      new Int32Array(memory.buffer, address).set([address + 8, address + 1024]);
    } else {
      address = 16;
      new Int32Array(memory.buffer, address).set([address + 8, address + 1024]);
    }
    
    asyncifyModules.push({ instance, memory, address });
  }
  
  return instance;
}

function asyncifyState() {
  return asyncifyModules[0]?.instance.exports.asyncify_get_state();
}

function asyncifyAssertNoneState() {
  let state = asyncifyState();
  if (state !== 0) {
    throw new Error(`reentrancy not supported, expected asyncify state '0' but found '${state}'`);
  }
}

function asyncifyWrapExport(fn) {
  return async (...args) => {
    if (asyncifyModules.length === 0) {
      throw new Error(`none of the Wasm modules were processed with wasm-opt asyncify`);
    }
    asyncifyAssertNoneState();
    
    let result = fn(...args);
    
    while (asyncifyState() === 1) {
      asyncifyModules.forEach(({ instance }) => {
        instance.exports.asyncify_stop_unwind();
      });
      
      asyncifyResolved = await asyncifyPromise;
      asyncifyPromise = undefined;
      asyncifyAssertNoneState();
      
      asyncifyModules.forEach(({ instance, address }) => {
        instance.exports.asyncify_start_rewind(address);
      });
      
      result = fn(...args);
    }
    
    asyncifyAssertNoneState();
    
    return result;
  };
}

function asyncifyWrapImport(fn) {
  return (...args) => {
    if (asyncifyState() === 2) {
      asyncifyModules.forEach(({ instance }) => {
        instance.exports.asyncify_stop_rewind();
      });
      
      const ret = asyncifyResolved;
      asyncifyResolved = undefined;
      return ret;
    }
    asyncifyAssertNoneState();
    let value = fn(...args);
    
    asyncifyModules.forEach(({ instance, address }) => {
      instance.exports.asyncify_start_unwind(address);
    });
    
    asyncifyPromise = value;
  };
}

const base64Compile = str => WebAssembly.compile(Uint8Array.from(atob(str), b => b.charCodeAt(0)));

let curResourceBorrows = [];

let dv = new DataView(new ArrayBuffer());
const dataView = mem => dv.buffer === mem.buffer ? dv : dv = new DataView(mem.buffer);

const fetchCompile = url => fetch(url).then(WebAssembly.compileStreaming);

const handleTables = [];

const instantiateCore = WebAssembly.instantiate;

const T_FLAG = 1 << 30;

function rscTableCreateOwn (table, rep) {
  const free = table[0] & ~T_FLAG;
  if (free === 0) {
    table.push(0);
    table.push(rep | T_FLAG);
    return (table.length >> 1) - 1;
  }
  table[0] = table[free << 1];
  table[free << 1] = 0;
  table[(free << 1) + 1] = rep | T_FLAG;
  return free;
}

function rscTableRemove (table, handle) {
  const scope = table[handle << 1];
  const val = table[(handle << 1) + 1];
  const own = (val & T_FLAG) !== 0;
  const rep = val & ~T_FLAG;
  if (val === 0 || (scope & T_FLAG) !== 0) throw new TypeError('Invalid handle');
  table[handle << 1] = table[0] | T_FLAG;
  table[0] = handle | T_FLAG;
  return { rep, scope, own };
}

const symbolCabiDispose = Symbol.for('cabiDispose');

const symbolRscHandle = Symbol('handle');

const symbolRscRep = Symbol.for('cabiRep');

const symbolDispose = Symbol.dispose || Symbol.for('dispose');

function throwInvalidBool() {
  throw new TypeError('invalid variant discriminant for bool');
}

const utf8Decoder = new TextDecoder();

const utf8Encoder = new TextEncoder();

let utf8EncodedLen = 0;
function utf8Encode(s, realloc, memory) {
  if (typeof s !== 'string') throw new TypeError('expected a string');
  if (s.length === 0) {
    utf8EncodedLen = 0;
    return 1;
  }
  let buf = utf8Encoder.encode(s);
  let ptr = realloc(0, 0, 1, buf.length);
  new Uint8Array(memory.buffer).set(buf, ptr);
  utf8EncodedLen = buf.length;
  return ptr;
}


let exports0;
const handleTable2 = [T_FLAG, 0];
const captureTable2= new Map();
let captureCnt2 = 0;
handleTables[2] = handleTable2;
const handleTable3 = [T_FLAG, 0];
const captureTable3= new Map();
let captureCnt3 = 0;
handleTables[3] = handleTable3;

function trampoline2(arg0) {
  var handle1 = arg0;
  var rep2 = handleTable2[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable2.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(HtmlElement.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  const ret = rsc0.asElement();
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = null;
  }
  curResourceBorrows = [];
  if (!(ret instanceof Element)) {
    throw new TypeError('Resource error: Not a valid "Element" resource.');
  }
  var handle3 = ret[symbolRscHandle];
  if (!handle3) {
    const rep = ret[symbolRscRep] || ++captureCnt3;
    captureTable3.set(rep, ret);
    handle3 = rscTableCreateOwn(handleTable3, rep);
  }
  return handle3;
}
const handleTable1 = [T_FLAG, 0];
const captureTable1= new Map();
let captureCnt1 = 0;
handleTables[1] = handleTable1;

function trampoline3(arg0) {
  var handle1 = arg0;
  var rep2 = handleTable2[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable2.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(HtmlElement.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  const ret = rsc0.style();
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = null;
  }
  curResourceBorrows = [];
  if (!(ret instanceof CssStyleDeclaration)) {
    throw new TypeError('Resource error: Not a valid "CssStyleDeclaration" resource.');
  }
  var handle3 = ret[symbolRscHandle];
  if (!handle3) {
    const rep = ret[symbolRscRep] || ++captureCnt1;
    captureTable1.set(rep, ret);
    handle3 = rscTableCreateOwn(handleTable1, rep);
  }
  return handle3;
}
const handleTable0 = [T_FLAG, 0];
const captureTable0= new Map();
let captureCnt0 = 0;
handleTables[0] = handleTable0;

function trampoline4(arg0) {
  var handle1 = arg0;
  var rep2 = handleTable2[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable2.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(HtmlElement.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  const ret = rsc0.onclickSubscribe();
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = null;
  }
  curResourceBorrows = [];
  if (!(ret instanceof Pollable)) {
    throw new TypeError('Resource error: Not a valid "Pollable" resource.');
  }
  var handle3 = ret[symbolRscHandle];
  if (!handle3) {
    const rep = ret[symbolRscRep] || ++captureCnt0;
    captureTable0.set(rep, ret);
    handle3 = rscTableCreateOwn(handleTable0, rep);
  }
  return handle3;
}
const handleTable4 = [T_FLAG, 0];
const captureTable4= new Map();
let captureCnt4 = 0;
handleTables[4] = handleTable4;

function trampoline5(arg0, arg1) {
  var handle1 = arg0;
  var rep2 = handleTable4[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable4.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(Node.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  var handle4 = arg1;
  var rep5 = handleTable4[(handle4 << 1) + 1] & ~T_FLAG;
  var rsc3 = captureTable4.get(rep5);
  if (!rsc3) {
    rsc3 = Object.create(Node.prototype);
    Object.defineProperty(rsc3, symbolRscHandle, { writable: true, value: handle4});
    Object.defineProperty(rsc3, symbolRscRep, { writable: true, value: rep5});
  }
  curResourceBorrows.push(rsc3);
  const ret = rsc0.appendChild(rsc3);
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = null;
  }
  curResourceBorrows = [];
  if (!(ret instanceof Node)) {
    throw new TypeError('Resource error: Not a valid "Node" resource.');
  }
  var handle6 = ret[symbolRscHandle];
  if (!handle6) {
    const rep = ret[symbolRscRep] || ++captureCnt4;
    captureTable4.set(rep, ret);
    handle6 = rscTableCreateOwn(handleTable4, rep);
  }
  return handle6;
}

function trampoline6(arg0) {
  var handle1 = arg0;
  var rep2 = handleTable3[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable3.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(Element.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  const ret = rsc0.asNode();
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = null;
  }
  curResourceBorrows = [];
  if (!(ret instanceof Node)) {
    throw new TypeError('Resource error: Not a valid "Node" resource.');
  }
  var handle3 = ret[symbolRscHandle];
  if (!handle3) {
    const rep = ret[symbolRscRep] || ++captureCnt4;
    captureTable4.set(rep, ret);
    handle3 = rscTableCreateOwn(handleTable4, rep);
  }
  return handle3;
}

function trampoline7(arg0) {
  var handle1 = arg0;
  var rep2 = handleTable3[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable3.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(Element.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  const ret = rsc0.asHtmlElement();
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = null;
  }
  curResourceBorrows = [];
  if (!(ret instanceof HtmlElement)) {
    throw new TypeError('Resource error: Not a valid "HtmlElement" resource.');
  }
  var handle3 = ret[symbolRscHandle];
  if (!handle3) {
    const rep = ret[symbolRscRep] || ++captureCnt2;
    captureTable2.set(rep, ret);
    handle3 = rscTableCreateOwn(handleTable2, rep);
  }
  return handle3;
}
const handleTable8 = [T_FLAG, 0];
const captureTable8= new Map();
let captureCnt8 = 0;
handleTables[8] = handleTable8;

function trampoline8(arg0, arg1) {
  var handle1 = arg0;
  var rep2 = handleTable3[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable3.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(Element.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  let enum3;
  switch (arg1) {
    case 0: {
      enum3 = 'open';
      break;
    }
    case 1: {
      enum3 = 'closed';
      break;
    }
    default: {
      throw new TypeError('invalid discriminant specified for ShadowRootMode');
    }
  }
  const ret = rsc0.attachShadow({
    mode: enum3,
  });
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = null;
  }
  curResourceBorrows = [];
  if (!(ret instanceof ShadowRoot)) {
    throw new TypeError('Resource error: Not a valid "ShadowRoot" resource.');
  }
  var handle4 = ret[symbolRscHandle];
  if (!handle4) {
    const rep = ret[symbolRscRep] || ++captureCnt8;
    captureTable8.set(rep, ret);
    handle4 = rscTableCreateOwn(handleTable8, rep);
  }
  return handle4;
}
const handleTable9 = [T_FLAG, 0];
const captureTable9= new Map();
let captureCnt9 = 0;
handleTables[9] = handleTable9;

function trampoline9(arg0) {
  var handle1 = arg0;
  var rep2 = handleTable9[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable9.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(DocumentFragment.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  const ret = rsc0.asNode();
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = null;
  }
  curResourceBorrows = [];
  if (!(ret instanceof Node)) {
    throw new TypeError('Resource error: Not a valid "Node" resource.');
  }
  var handle3 = ret[symbolRscHandle];
  if (!handle3) {
    const rep = ret[symbolRscRep] || ++captureCnt4;
    captureTable4.set(rep, ret);
    handle3 = rscTableCreateOwn(handleTable4, rep);
  }
  return handle3;
}

function trampoline10(arg0) {
  var handle1 = arg0;
  var rep2 = handleTable8[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable8.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(ShadowRoot.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  const ret = rsc0.asDocumentFragment();
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = null;
  }
  curResourceBorrows = [];
  if (!(ret instanceof DocumentFragment)) {
    throw new TypeError('Resource error: Not a valid "DocumentFragment" resource.');
  }
  var handle3 = ret[symbolRscHandle];
  if (!handle3) {
    const rep = ret[symbolRscRep] || ++captureCnt9;
    captureTable9.set(rep, ret);
    handle3 = rscTableCreateOwn(handleTable9, rep);
  }
  return handle3;
}
const handleTable5 = [T_FLAG, 0];
const captureTable5= new Map();
let captureCnt5 = 0;
handleTables[5] = handleTable5;

function trampoline11() {
  const ret = getWindow();
  if (!(ret instanceof Window)) {
    throw new TypeError('Resource error: Not a valid "Window" resource.');
  }
  var handle0 = ret[symbolRscHandle];
  if (!handle0) {
    const rep = ret[symbolRscRep] || ++captureCnt5;
    captureTable5.set(rep, ret);
    handle0 = rscTableCreateOwn(handleTable5, rep);
  }
  return handle0;
}
const handleTable7 = [T_FLAG, 0];
const captureTable7= new Map();
let captureCnt7 = 0;
handleTables[7] = handleTable7;

function trampoline12(arg0) {
  var handle1 = arg0;
  var rep2 = handleTable7[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable7.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(DefineElementResult.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  const ret = rsc0.constructorSubscribe();
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = null;
  }
  curResourceBorrows = [];
  if (!(ret instanceof Pollable)) {
    throw new TypeError('Resource error: Not a valid "Pollable" resource.');
  }
  var handle3 = ret[symbolRscHandle];
  if (!handle3) {
    const rep = ret[symbolRscRep] || ++captureCnt0;
    captureTable0.set(rep, ret);
    handle3 = rscTableCreateOwn(handleTable0, rep);
  }
  return handle3;
}
const handleTable10 = [T_FLAG, 0];
const captureTable10= new Map();
let captureCnt10 = 0;
handleTables[10] = handleTable10;

function trampoline13(arg0) {
  var handle1 = arg0;
  var rep2 = handleTable10[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable10.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(CreatedElement.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  const ret = rsc0.connectedCallbackSubscribe();
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = null;
  }
  curResourceBorrows = [];
  if (!(ret instanceof Pollable)) {
    throw new TypeError('Resource error: Not a valid "Pollable" resource.');
  }
  var handle3 = ret[symbolRscHandle];
  if (!handle3) {
    const rep = ret[symbolRscRep] || ++captureCnt0;
    captureTable0.set(rep, ret);
    handle3 = rscTableCreateOwn(handleTable0, rep);
  }
  return handle3;
}

function trampoline14(arg0) {
  var handle1 = arg0;
  var rep2 = handleTable10[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable10.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(CreatedElement.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  const ret = rsc0.attributeChangedCallbackSubscribe();
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = null;
  }
  curResourceBorrows = [];
  if (!(ret instanceof Pollable)) {
    throw new TypeError('Resource error: Not a valid "Pollable" resource.');
  }
  var handle3 = ret[symbolRscHandle];
  if (!handle3) {
    const rep = ret[symbolRscRep] || ++captureCnt0;
    captureTable0.set(rep, ret);
    handle3 = rscTableCreateOwn(handleTable0, rep);
  }
  return handle3;
}

function trampoline15(arg0) {
  var handle1 = arg0;
  var rep2 = handleTable10[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable10.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(CreatedElement.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  const ret = rsc0.getElement();
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = null;
  }
  curResourceBorrows = [];
  if (!(ret instanceof HtmlElement)) {
    throw new TypeError('Resource error: Not a valid "HtmlElement" resource.');
  }
  var handle3 = ret[symbolRscHandle];
  if (!handle3) {
    const rep = ret[symbolRscRep] || ++captureCnt2;
    captureTable2.set(rep, ret);
    handle3 = rscTableCreateOwn(handleTable2, rep);
  }
  return handle3;
}
let exports1;
let memory0;
let realloc0;

const trampoline24 = asyncifyWrapImport(async function(arg0, arg1, arg2) {
  var len3 = arg1;
  var base3 = arg0;
  var result3 = [];
  for (let i = 0; i < len3; i++) {
    const base = base3 + i * 4;
    var handle1 = dataView(memory0).getInt32(base + 0, true);
    var rep2 = handleTable0[(handle1 << 1) + 1] & ~T_FLAG;
    var rsc0 = captureTable0.get(rep2);
    if (!rsc0) {
      rsc0 = Object.create(Pollable.prototype);
      Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
      Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
    }
    curResourceBorrows.push(rsc0);
    result3.push(rsc0);
  }
  const ret = await poll(result3);
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = null;
  }
  curResourceBorrows = [];
  var val4 = ret;
  var len4 = val4.length;
  var ptr4 = realloc0(0, 0, 4, len4 * 4);
  var src4 = new Uint8Array(val4.buffer, val4.byteOffset, len4 * 4);
  (new Uint8Array(memory0.buffer, ptr4, len4 * 4)).set(src4);
  dataView(memory0).setInt32(arg2 + 4, len4, true);
  dataView(memory0).setInt32(arg2 + 0, ptr4, true);
});

function trampoline25(arg0, arg1, arg2, arg3) {
  var handle1 = arg0;
  var rep2 = handleTable1[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable1.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(CssStyleDeclaration.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  var ptr3 = arg1;
  var len3 = arg2;
  var result3 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr3, len3));
  const ret = rsc0.getPropertyValue(result3);
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = null;
  }
  curResourceBorrows = [];
  var ptr4 = utf8Encode(ret, realloc0, memory0);
  var len4 = utf8EncodedLen;
  dataView(memory0).setInt32(arg3 + 4, len4, true);
  dataView(memory0).setInt32(arg3 + 0, ptr4, true);
}

function trampoline26(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
  var handle1 = arg0;
  var rep2 = handleTable1[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable1.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(CssStyleDeclaration.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  var ptr3 = arg1;
  var len3 = arg2;
  var result3 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr3, len3));
  var ptr4 = arg3;
  var len4 = arg4;
  var result4 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr4, len4));
  let variant6;
  switch (arg5) {
    case 0: {
      variant6 = undefined;
      break;
    }
    case 1: {
      var ptr5 = arg6;
      var len5 = arg7;
      var result5 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr5, len5));
      variant6 = result5;
      break;
    }
    default: {
      throw new TypeError('invalid variant discriminant for option');
    }
  }
  rsc0.setProperty(result3, result4, variant6);
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = null;
  }
  curResourceBorrows = [];
}

function trampoline27(arg0, arg1, arg2) {
  var handle1 = arg0;
  var rep2 = handleTable4[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable4.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(Node.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  var ptr3 = arg1;
  var len3 = arg2;
  var result3 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr3, len3));
  rsc0.setTextContent(result3);
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = null;
  }
  curResourceBorrows = [];
}
const handleTable6 = [T_FLAG, 0];
const captureTable6= new Map();
let captureCnt6 = 0;
handleTables[6] = handleTable6;

function trampoline28(arg0, arg1) {
  var handle1 = arg0;
  var rep2 = handleTable5[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable5.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(Window.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  const ret = rsc0.document();
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = null;
  }
  curResourceBorrows = [];
  var variant4 = ret;
  if (variant4 === null || variant4=== undefined) {
    dataView(memory0).setInt8(arg1 + 0, 0, true);
  } else {
    const e = variant4;
    dataView(memory0).setInt8(arg1 + 0, 1, true);
    if (!(e instanceof Document)) {
      throw new TypeError('Resource error: Not a valid "Document" resource.');
    }
    var handle3 = e[symbolRscHandle];
    if (!handle3) {
      const rep = e[symbolRscRep] || ++captureCnt6;
      captureTable6.set(rep, e);
      handle3 = rscTableCreateOwn(handleTable6, rep);
    }
    dataView(memory0).setInt32(arg1 + 4, handle3, true);
  }
}

function trampoline29(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
  var handle1 = arg0;
  var rep2 = handleTable5[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable5.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(Window.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  var ptr3 = arg1;
  var len3 = arg2;
  var result3 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr3, len3));
  let variant5;
  switch (arg3) {
    case 0: {
      variant5 = undefined;
      break;
    }
    case 1: {
      var ptr4 = arg4;
      var len4 = arg5;
      var result4 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr4, len4));
      variant5 = result4;
      break;
    }
    default: {
      throw new TypeError('invalid variant discriminant for option');
    }
  }
  var len7 = arg7;
  var base7 = arg6;
  var result7 = [];
  for (let i = 0; i < len7; i++) {
    const base = base7 + i * 8;
    var ptr6 = dataView(memory0).getInt32(base + 0, true);
    var len6 = dataView(memory0).getInt32(base + 4, true);
    var result6 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr6, len6));
    result7.push(result6);
  }
  var bool8 = arg8;
  const ret = rsc0.defineElement(result3, {
    superclass: variant5,
    observedAttributes: result7,
    formAssociated: bool8 == 0 ? false : (bool8 == 1 ? true : throwInvalidBool()),
  });
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = null;
  }
  curResourceBorrows = [];
  if (!(ret instanceof DefineElementResult)) {
    throw new TypeError('Resource error: Not a valid "DefineElementResult" resource.');
  }
  var handle9 = ret[symbolRscHandle];
  if (!handle9) {
    const rep = ret[symbolRscRep] || ++captureCnt7;
    captureTable7.set(rep, ret);
    handle9 = rscTableCreateOwn(handleTable7, rep);
  }
  return handle9;
}

function trampoline30(arg0, arg1, arg2) {
  var handle1 = arg0;
  var rep2 = handleTable3[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable3.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(Element.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  var ptr3 = arg1;
  var len3 = arg2;
  var result3 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr3, len3));
  rsc0.setId(result3);
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = null;
  }
  curResourceBorrows = [];
}

function trampoline31(arg0, arg1) {
  var handle1 = arg0;
  var rep2 = handleTable3[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable3.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(Element.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  const ret = rsc0.shadowRoot();
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = null;
  }
  curResourceBorrows = [];
  var variant4 = ret;
  if (variant4 === null || variant4=== undefined) {
    dataView(memory0).setInt8(arg1 + 0, 0, true);
  } else {
    const e = variant4;
    dataView(memory0).setInt8(arg1 + 0, 1, true);
    if (!(e instanceof ShadowRoot)) {
      throw new TypeError('Resource error: Not a valid "ShadowRoot" resource.');
    }
    var handle3 = e[symbolRscHandle];
    if (!handle3) {
      const rep = e[symbolRscRep] || ++captureCnt8;
      captureTable8.set(rep, e);
      handle3 = rscTableCreateOwn(handleTable8, rep);
    }
    dataView(memory0).setInt32(arg1 + 4, handle3, true);
  }
}

function trampoline32(arg0, arg1, arg2, arg3) {
  var handle1 = arg0;
  var rep2 = handleTable9[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable9.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(DocumentFragment.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  var ptr3 = arg1;
  var len3 = arg2;
  var result3 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr3, len3));
  const ret = rsc0.querySelector(result3);
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = null;
  }
  curResourceBorrows = [];
  var variant5 = ret;
  if (variant5 === null || variant5=== undefined) {
    dataView(memory0).setInt8(arg3 + 0, 0, true);
  } else {
    const e = variant5;
    dataView(memory0).setInt8(arg3 + 0, 1, true);
    if (!(e instanceof Element)) {
      throw new TypeError('Resource error: Not a valid "Element" resource.');
    }
    var handle4 = e[symbolRscHandle];
    if (!handle4) {
      const rep = e[symbolRscRep] || ++captureCnt3;
      captureTable3.set(rep, e);
      handle4 = rscTableCreateOwn(handleTable3, rep);
    }
    dataView(memory0).setInt32(arg3 + 4, handle4, true);
  }
}

function trampoline33(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
  var handle1 = arg0;
  var rep2 = handleTable6[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable6.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(Document.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  var ptr3 = arg1;
  var len3 = arg2;
  var result3 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr3, len3));
  let variant10;
  switch (arg3) {
    case 0: {
      variant10 = undefined;
      break;
    }
    case 1: {
      let variant9;
      switch (arg4) {
        case 0: {
          let variant5;
          switch (arg5) {
            case 0: {
              variant5 = undefined;
              break;
            }
            case 1: {
              var ptr4 = arg6;
              var len4 = arg7;
              var result4 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr4, len4));
              variant5 = result4;
              break;
            }
            default: {
              throw new TypeError('invalid variant discriminant for option');
            }
          }
          let variant7;
          switch (arg8) {
            case 0: {
              variant7 = undefined;
              break;
            }
            case 1: {
              var ptr6 = arg9;
              var len6 = arg10;
              var result6 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr6, len6));
              variant7 = result6;
              break;
            }
            default: {
              throw new TypeError('invalid variant discriminant for option');
            }
          }
          variant9= {
            tag: 'element-creation-options',
            val: {
              is: variant5,
              pseudo: variant7,
            }
          };
          break;
        }
        case 1: {
          var ptr8 = arg5;
          var len8 = arg6;
          var result8 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr8, len8));
          variant9= {
            tag: 'string',
            val: result8
          };
          break;
        }
        default: {
          throw new TypeError('invalid variant discriminant for ElementCreationOptionsOrString');
        }
      }
      variant10 = variant9;
      break;
    }
    default: {
      throw new TypeError('invalid variant discriminant for option');
    }
  }
  const ret = rsc0.createElement(result3, variant10);
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = null;
  }
  curResourceBorrows = [];
  if (!(ret instanceof Element)) {
    throw new TypeError('Resource error: Not a valid "Element" resource.');
  }
  var handle11 = ret[symbolRscHandle];
  if (!handle11) {
    const rep = ret[symbolRscRep] || ++captureCnt3;
    captureTable3.set(rep, ret);
    handle11 = rscTableCreateOwn(handleTable3, rep);
  }
  return handle11;
}

function trampoline34(arg0, arg1) {
  var handle1 = arg0;
  var rep2 = handleTable7[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable7.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(DefineElementResult.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  const ret = rsc0.constructorGet();
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = null;
  }
  curResourceBorrows = [];
  var variant4 = ret;
  if (variant4 === null || variant4=== undefined) {
    dataView(memory0).setInt8(arg1 + 0, 0, true);
  } else {
    const e = variant4;
    dataView(memory0).setInt8(arg1 + 0, 1, true);
    if (!(e instanceof CreatedElement)) {
      throw new TypeError('Resource error: Not a valid "CreatedElement" resource.');
    }
    var handle3 = e[symbolRscHandle];
    if (!handle3) {
      const rep = e[symbolRscRep] || ++captureCnt10;
      captureTable10.set(rep, e);
      handle3 = rscTableCreateOwn(handleTable10, rep);
    }
    dataView(memory0).setInt32(arg1 + 4, handle3, true);
  }
}

function trampoline35(arg0, arg1) {
  var handle1 = arg0;
  var rep2 = handleTable10[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable10.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(CreatedElement.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  const ret = rsc0.attributeChangedCallbackGet();
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = null;
  }
  curResourceBorrows = [];
  var variant11 = ret;
  if (variant11 === null || variant11=== undefined) {
    dataView(memory0).setInt8(arg1 + 0, 0, true);
  } else {
    const e = variant11;
    dataView(memory0).setInt8(arg1 + 0, 1, true);
    var {name: v3_0, oldValue: v3_1, newValue: v3_2, namespaceUrl: v3_3 } = e;
    var ptr4 = utf8Encode(v3_0, realloc0, memory0);
    var len4 = utf8EncodedLen;
    dataView(memory0).setInt32(arg1 + 8, len4, true);
    dataView(memory0).setInt32(arg1 + 4, ptr4, true);
    var variant6 = v3_1;
    if (variant6 === null || variant6=== undefined) {
      dataView(memory0).setInt8(arg1 + 12, 0, true);
    } else {
      const e = variant6;
      dataView(memory0).setInt8(arg1 + 12, 1, true);
      var ptr5 = utf8Encode(e, realloc0, memory0);
      var len5 = utf8EncodedLen;
      dataView(memory0).setInt32(arg1 + 20, len5, true);
      dataView(memory0).setInt32(arg1 + 16, ptr5, true);
    }
    var variant8 = v3_2;
    if (variant8 === null || variant8=== undefined) {
      dataView(memory0).setInt8(arg1 + 24, 0, true);
    } else {
      const e = variant8;
      dataView(memory0).setInt8(arg1 + 24, 1, true);
      var ptr7 = utf8Encode(e, realloc0, memory0);
      var len7 = utf8EncodedLen;
      dataView(memory0).setInt32(arg1 + 32, len7, true);
      dataView(memory0).setInt32(arg1 + 28, ptr7, true);
    }
    var variant10 = v3_3;
    if (variant10 === null || variant10=== undefined) {
      dataView(memory0).setInt8(arg1 + 36, 0, true);
    } else {
      const e = variant10;
      dataView(memory0).setInt8(arg1 + 36, 1, true);
      var ptr9 = utf8Encode(e, realloc0, memory0);
      var len9 = utf8EncodedLen;
      dataView(memory0).setInt32(arg1 + 44, len9, true);
      dataView(memory0).setInt32(arg1 + 40, ptr9, true);
    }
  }
}
let exports2;
let exports1Start;

async function start() {
  await exports1Start();
}
function trampoline0(handle) {
  const handleEntry = rscTableRemove(handleTable0, handle);
  if (handleEntry.own) {
    
    const rsc = captureTable0.get(handleEntry.rep);
    if (rsc) {
      if (rsc[symbolDispose]) rsc[symbolDispose]();
      captureTable0.delete(handleEntry.rep);
    } else if (Pollable[symbolCabiDispose]) {
      Pollable[symbolCabiDispose](handleEntry.rep);
    }
  }
}
function trampoline1(handle) {
  const handleEntry = rscTableRemove(handleTable10, handle);
  if (handleEntry.own) {
    
    const rsc = captureTable10.get(handleEntry.rep);
    if (rsc) {
      if (rsc[symbolDispose]) rsc[symbolDispose]();
      captureTable10.delete(handleEntry.rep);
    } else if (CreatedElement[symbolCabiDispose]) {
      CreatedElement[symbolCabiDispose](handleEntry.rep);
    }
  }
}
function trampoline16(handle) {
  const handleEntry = rscTableRemove(handleTable2, handle);
  if (handleEntry.own) {
    
    const rsc = captureTable2.get(handleEntry.rep);
    if (rsc) {
      if (rsc[symbolDispose]) rsc[symbolDispose]();
      captureTable2.delete(handleEntry.rep);
    } else if (HtmlElement[symbolCabiDispose]) {
      HtmlElement[symbolCabiDispose](handleEntry.rep);
    }
  }
}
function trampoline17(handle) {
  const handleEntry = rscTableRemove(handleTable6, handle);
  if (handleEntry.own) {
    
    const rsc = captureTable6.get(handleEntry.rep);
    if (rsc) {
      if (rsc[symbolDispose]) rsc[symbolDispose]();
      captureTable6.delete(handleEntry.rep);
    } else if (Document[symbolCabiDispose]) {
      Document[symbolCabiDispose](handleEntry.rep);
    }
  }
}
function trampoline18(handle) {
  const handleEntry = rscTableRemove(handleTable5, handle);
  if (handleEntry.own) {
    
    const rsc = captureTable5.get(handleEntry.rep);
    if (rsc) {
      if (rsc[symbolDispose]) rsc[symbolDispose]();
      captureTable5.delete(handleEntry.rep);
    } else if (Window[symbolCabiDispose]) {
      Window[symbolCabiDispose](handleEntry.rep);
    }
  }
}
function trampoline19(handle) {
  const handleEntry = rscTableRemove(handleTable3, handle);
  if (handleEntry.own) {
    
    const rsc = captureTable3.get(handleEntry.rep);
    if (rsc) {
      if (rsc[symbolDispose]) rsc[symbolDispose]();
      captureTable3.delete(handleEntry.rep);
    } else if (Element[symbolCabiDispose]) {
      Element[symbolCabiDispose](handleEntry.rep);
    }
  }
}
function trampoline20(handle) {
  const handleEntry = rscTableRemove(handleTable8, handle);
  if (handleEntry.own) {
    
    const rsc = captureTable8.get(handleEntry.rep);
    if (rsc) {
      if (rsc[symbolDispose]) rsc[symbolDispose]();
      captureTable8.delete(handleEntry.rep);
    } else if (ShadowRoot[symbolCabiDispose]) {
      ShadowRoot[symbolCabiDispose](handleEntry.rep);
    }
  }
}
function trampoline21(handle) {
  const handleEntry = rscTableRemove(handleTable4, handle);
  if (handleEntry.own) {
    
    const rsc = captureTable4.get(handleEntry.rep);
    if (rsc) {
      if (rsc[symbolDispose]) rsc[symbolDispose]();
      captureTable4.delete(handleEntry.rep);
    } else if (Node[symbolCabiDispose]) {
      Node[symbolCabiDispose](handleEntry.rep);
    }
  }
}
function trampoline22(handle) {
  const handleEntry = rscTableRemove(handleTable9, handle);
  if (handleEntry.own) {
    
    const rsc = captureTable9.get(handleEntry.rep);
    if (rsc) {
      if (rsc[symbolDispose]) rsc[symbolDispose]();
      captureTable9.delete(handleEntry.rep);
    } else if (DocumentFragment[symbolCabiDispose]) {
      DocumentFragment[symbolCabiDispose](handleEntry.rep);
    }
  }
}
function trampoline23(handle) {
  const handleEntry = rscTableRemove(handleTable1, handle);
  if (handleEntry.own) {
    
    const rsc = captureTable1.get(handleEntry.rep);
    if (rsc) {
      if (rsc[symbolDispose]) rsc[symbolDispose]();
      captureTable1.delete(handleEntry.rep);
    } else if (CssStyleDeclaration[symbolCabiDispose]) {
      CssStyleDeclaration[symbolCabiDispose](handleEntry.rep);
    }
  }
}

const $init = (() => {
  let gen = (function* init () {
    const module0 = fetchCompile(new URL('./basic-component.core.wasm', import.meta.url));
    const module1 = base64Compile('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');
    const module2 = base64Compile('AGFzbQEAAAABQAdgA39/fwBgBH9/f38AYAh/f39/f39/fwBgA39/fwBgAn9/AGAJf39/f39/f39/AX9gC39/f39/f39/f39/AX8CTg0AATAAAAABMQABAAEyAAIAATMAAwABNAAEAAE1AAUAATYAAwABNwAEAAE4AAEAATkABgACMTAABAACMTEABAAIJGltcG9ydHMBcAEMDAkSAQBBAAsMAAECAwQFBgcICQoLAC8JcHJvZHVjZXJzAQxwcm9jZXNzZWQtYnkBDXdpdC1jb21wb25lbnQHMC4yMTkuMQAcBG5hbWUAFRR3aXQtY29tcG9uZW50OmZpeHVwcw');
    ({ exports: exports0 } = yield asyncifyInstantiate(yield module1));
    ({ exports: exports1 } = yield asyncifyInstantiate(yield module0, {
      'wasi:io/poll@0.2.2': {
        '[resource-drop]pollable': trampoline0,
        poll: exports0['0'],
      },
      'web:browser/global': {
        '[method]created-element.attribute-changed-callback-get': exports0['11'],
        '[method]created-element.attribute-changed-callback-subscribe': trampoline14,
        '[method]created-element.connected-callback-subscribe': trampoline13,
        '[method]created-element.get-element': trampoline15,
        '[method]css-style-declaration.get-property-value': exports0['1'],
        '[method]css-style-declaration.set-property': exports0['2'],
        '[method]define-element-result.constructor-get': exports0['10'],
        '[method]define-element-result.constructor-subscribe': trampoline12,
        '[method]document-fragment.as-node': trampoline9,
        '[method]document-fragment.query-selector': exports0['8'],
        '[method]document.create-element': exports0['9'],
        '[method]element.as-html-element': trampoline7,
        '[method]element.as-node': trampoline6,
        '[method]element.attach-shadow': trampoline8,
        '[method]element.set-id': exports0['6'],
        '[method]element.shadow-root': exports0['7'],
        '[method]html-element.as-element': trampoline2,
        '[method]html-element.onclick-subscribe': trampoline4,
        '[method]html-element.style': trampoline3,
        '[method]node.append-child': trampoline5,
        '[method]node.set-text-content': exports0['3'],
        '[method]shadow-root.as-document-fragment': trampoline10,
        '[method]window.define-element': exports0['5'],
        '[method]window.document': exports0['4'],
        '[resource-drop]created-element': trampoline1,
        '[resource-drop]css-style-declaration': trampoline23,
        '[resource-drop]document': trampoline17,
        '[resource-drop]document-fragment': trampoline22,
        '[resource-drop]element': trampoline19,
        '[resource-drop]html-element': trampoline16,
        '[resource-drop]node': trampoline21,
        '[resource-drop]shadow-root': trampoline20,
        '[resource-drop]window': trampoline18,
        'get-window': trampoline11,
      },
    }));
    memory0 = exports1.memory;
    realloc0 = exports1.cabi_realloc;
    ({ exports: exports2 } = yield asyncifyInstantiate(yield module2, {
      '': {
        $imports: exports0.$imports,
        '0': trampoline24,
        '1': trampoline25,
        '10': trampoline34,
        '11': trampoline35,
        '2': trampoline26,
        '3': trampoline27,
        '4': trampoline28,
        '5': trampoline29,
        '6': trampoline30,
        '7': trampoline31,
        '8': trampoline32,
        '9': trampoline33,
      },
    }));
    exports1Start = asyncifyWrapExport(exports1.start);
  })();
  let promise, resolve, reject;
  function runNext (value) {
    try {
      let done;
      do {
        ({ value, done } = gen.next(value));
      } while (!(value instanceof Promise) && !done);
      if (done) {
        if (resolve) resolve(value);
        else return value;
      }
      if (!promise) promise = new Promise((_resolve, _reject) => (resolve = _resolve, reject = _reject));
      value.then(runNext, reject);
    }
    catch (e) {
      if (reject) reject(e);
      else throw e;
    }
  }
  const maybeSyncReturn = runNext(null);
  return promise || maybeSyncReturn;
})();

await $init;

export { start,  }