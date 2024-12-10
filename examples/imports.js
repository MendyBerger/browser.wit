import { Pollable } from "./poll.js"

var idlProxy;
globalThisIdlProxy()
function globalThisIdlProxy () {
    if (idlProxy) return idlProxy;
    const innerSymbol = Symbol('inner');
    const isProxySymbol = Symbol('isProxy');
    const uppercaseRegex = /html|Html|dom|Dom|Css|Svg|Url|Vtt|Cdata/g;
    const globalNames = ['Window', 'WorkerGlobalScope'];
    function proxy(target, fake = {}) {
        const origTarget = target;
        return new Proxy(fake, {
            get: (_, prop, receiver) => {
                if (prop === innerSymbol) return origTarget;
                if (prop === isProxySymbol) return true;
                if (typeof prop !== 'string') return maybeProxy(Reflect.get(origTarget, prop));
                if (origTarget === globalThis && prop.startsWith('get') && globalNames.includes(prop.slice(3))) {
                    return () => receiver;
                }
                prop = prop.replaceAll(uppercaseRegex, x => x.toUpperCase());
                if (prop.startsWith('set') && origTarget[prop] === undefined) return val => Reflect.set(origTarget, `${prop[3].toLowerCase()}${prop.slice(4)}`, val);
                if (prop.startsWith('as')) return () => receiver;
                if (prop.startsWith('on') && prop.endsWith("Subscribe")) {
                    let eventName = prop.slice(2, -9);
                    return maybeProxy(() => {
                        const pollable = new Pollable();
                        origTarget.addEventListener(eventName, () => {
                            pollable.resolve();
                        });
                        return pollable;
                    })
                };
                const res = Reflect.get(origTarget, prop);
                if (res === undefined && prop[0].toUpperCase() === prop[0]) {
                    const propValue = globalThis[`${prop[0].toLowerCase()}${prop.slice(1)}`];
                    if (propValue)
                        return Object.getPrototypeOf(propValue).constructor;
                    // return Object.getPrototypeOf(globalThis[prop]);
                }
                return maybeProxy(res);
            },
            apply: (_, thisArg, args) => {
                if (args.length === 1 && Array.isArray(args[0]) && origTarget.length === 0) args = args[0];
                const res = Reflect.apply(origTarget, proxyInner(thisArg), args.map(a =>  (a && a[isProxySymbol]) ? proxyInner(a) : a));
                return typeof res === 'object' ? proxy(res) : res;
            },
            getPrototypeOf: _ => {
                return Reflect.getPrototypeOf(origTarget)
            },
            construct: (_, argArray, newTarget) => {
                return maybeProxy(Reflect.construct(origTarget, argArray, newTarget))
            },
            defineProperty: (_, property, attributes) => maybeProxy(Reflect.defineProperty(origTarget, property, attributes)),
            deleteProperty: (_, p) => maybeProxy(Reflect.deleteProperty(origTarget, p)),
            getOwnPropertyDescriptor: (_, p) => {
                return Reflect.getOwnPropertyDescriptor(origTarget, p)
            },
            has: (_, p) => maybeProxy(Reflect.has(origTarget, p)),
            isExtensible: (_) => maybeProxy(Reflect.isExtensible(origTarget)),
            ownKeys: _ => maybeProxy(Reflect.ownKeys(origTarget)),
            preventExtensions: _ => maybeProxy(Reflect.preventExtensions(origTarget)),
            set: (_, p, newValue, receiver) => maybeProxy(Reflect.set(origTarget, p, newValue, receiver)),
            setPrototypeOf: (_, v) => maybeProxy(Reflect.setPrototypeOf(origTarget, v)),
        });
    }
    function maybeProxy(res) {
        if (typeof res === 'function')
            return proxy(res, () => {});
        if (typeof res === 'object' && res !== null)
            return () => proxy(res);
        return res;
    }
    const proxyInner = proxy => proxy ? proxy[innerSymbol] : proxy;
    return (idlProxy = proxy(globalThis));
};

export { idlProxy };
