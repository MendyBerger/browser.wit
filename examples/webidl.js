function isPromise(value) {
    return value instanceof Promise || (typeof value === 'object' && value !== null && typeof value.then === 'function');
}

// An async iterable of `eventName` events on `target`, which is what jco lowers into a
// wit `stream<event>`. The listener is attached now rather than on the first read, so
// events arriving before the component gets round to reading are queued, not lost.
function eventStream(target, eventName, wrap) {
    const queued = [];
    let pending;
    const listener = event => {
        if (pending) {
            const resolve = pending;
            pending = undefined;
            resolve({ value: wrap(event), done: false });
        } else {
            queued.push(event);
        }
    };
    target.addEventListener(eventName, listener);

    return {
        [Symbol.asyncIterator]() {
            return {
                next() {
                    if (queued.length > 0) {
                        return Promise.resolve({ value: wrap(queued.shift()), done: false });
                    }
                    return new Promise(resolve => { pending = resolve; });
                },
                return() {
                    target.removeEventListener(eventName, listener);
                    return Promise.resolve({ value: undefined, done: true });
                },
            };
        },
    };
}

var idlProxy;
globalThisIdlProxy()
function globalThisIdlProxy () {
    if (idlProxy) return idlProxy;
    const innerSymbol = Symbol('inner');
    const isProxySymbol = Symbol('isProxy');
    const uppercaseRegex = /html|Html|dom|Dom|Css|Svg|Url|Vtt|Cdata/g;
    const globalNames = ['Window', 'WorkerGlobalScope'];
    // The only `on<event>` attributes that are not `EventHandler` in WebIDL, so the only
    // ones wit gives a handler object rather than a stream of events.
    const nonStreamHandlers = ['onerror', 'onbeforeunload'];
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
                // Event handler attributes are `on<event>: func() -> stream<event>` in
                // wit, so jco only reads these names to call the getter. Returning an
                // async iterable of the events gives it the stream it expects.
                if (/^on[a-z]+$/.test(prop) && !nonStreamHandlers.includes(prop) && typeof origTarget.addEventListener === 'function') {
                    const eventName = prop.slice(2);
                    return () => eventStream(origTarget, eventName, proxy);
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
                // A method that returns a promise is `async func` in wit, and jco awaits
                // it. Proxying the promise itself would hand back an unproxied result, so
                // proxy what it resolves to instead.
                if (isPromise(res)) return res.then(value => typeof value === 'object' && value !== null ? proxy(value) : value);
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
        // A promise-valued attribute is a `future<T>` in wit; jco takes a promise for it.
        if (isPromise(res))
            return () => res.then(value => typeof value === 'object' && value !== null ? proxy(value) : value);
        if (typeof res === 'object' && res !== null)
            return () => proxy(res);
        return res;
    }
    const proxyInner = proxy => proxy ? proxy[innerSymbol] : proxy;
    return (idlProxy = proxy(globalThis));
};

export { idlProxy };
