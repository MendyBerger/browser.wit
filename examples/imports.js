const INNER = Symbol("inner");
const IS_PROXY = Symbol("isProxy");

function reMap(name) {
    const map = {
        "HtmlElement": "HTMLElement",
    }
    return map[name] || name;
}

export const global = proxy(window);
window.getWindow = function() {return proxy(window)};

function proxy(target, fake = {}) {
    let origTarget = target;
    return new Proxy(fake, {
        get: function (target, prop, receiver) {
            prop = reMap(prop);

            if (prop === INNER) {
                return origTarget
            }
            if (prop === IS_PROXY) {
                return true
            }

            if (prop.toString().startsWith("as")) {
                return function () {
                    return this
                }
            }

            let res = Reflect.get(origTarget, prop);
            return maybeProxy(res);
        },
        apply: (target, thisArg, args) => {
            let res = Reflect.apply(origTarget, proxyInner(thisArg), args.map(a =>  a[IS_PROXY] ? proxyInner(a) : a));
            if (typeof res === "object" ) {
                return proxy(res)
            } else {
                return res;
            }
        },
        getPrototypeOf: (target) => {
            return Reflect.getPrototypeOf(origTarget);
        },
        construct(target, argArray, newTarget) {
            return maybeProxy(Reflect.construct(origTarget, argArray, newTarget));
        },
        defineProperty(target, property, attributes) {
            return maybeProxy(Reflect.defineProperty(origTarget, property, attributes));
        },
        deleteProperty(target, p) {
            return maybeProxy(Reflect.deleteProperty(origTarget, p));
        },
        getOwnPropertyDescriptor(target, p) {
            return (Reflect.getOwnPropertyDescriptor(origTarget, p));
        },
        has(target, p) {
            return maybeProxy(Reflect.has(origTarget, p));
        },
        isExtensible(target) {
            return maybeProxy(Reflect.isExtensible(origTarget));
        },
        ownKeys(target) {
            return maybeProxy(Reflect.ownKeys(origTarget));
        },
        preventExtensions(target) {
            return maybeProxy(Reflect.preventExtensions(origTarget));
        },
        set(target, p, newValue, receiver) {
            return maybeProxy(Reflect.set(origTarget, p, newValue, receiver));
        },
        setPrototypeOf(target, v) {
            return maybeProxy(Reflect.setPrototypeOf(origTarget, v));
        },
    });
}

function maybeProxy(res) {
    if (typeof res === "function") {
        return proxy(res, function() {});
    } else if (typeof res === "object" && res !== null) {
        return () => {
            return proxy(res)
        }
    } else {
        return res;
    }
}

function proxyInner(proxy) {
    if (proxy)
        return proxy[INNER];
    else
        return proxy;
}
