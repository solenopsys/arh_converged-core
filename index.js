// src/converged/constants.ts
const __DEV__=false;
var $ = Symbol;
var $meta = $();
var $component = $();
var $class = $();
var $reactive = $();
var $map = $();
var $internal = $();
var prefix = "http://www.w3.org/";
var NS = {
  svg: prefix + "2000/svg",
  math: prefix + "1998/Math/MathML",
  html: prefix + "1999/xhtml",
  xlink: prefix + "1999/xlink"
};

// src/converged/utils.ts
var markComponent = function(fn) {
  fn[$component] = null;
  return fn;
};
var markReactive = function(fn) {
  fn[$reactive] = null;
  return fn;
};
var weakStore = function() {
  const store = new WeakMap;
  const set = store.set.bind(store);
  const get = store.get.bind(store);
  const has = store.has.bind(store);
  return {
    store,
    get: (obj, defaults = undefined) => {
      const o = get(obj);
      if (o)
        return o;
      if (defaults !== undefined) {
        defaults = defaults();
        set(obj, defaults);
        return defaults;
      }
    },
    set,
    has
  };
};
var microtask = queueMicrotask;
var emit = (node, eventName, data = { bubbles: true, cancelable: true, composed: true }) => node.dispatchEvent(new CustomEvent(eventName, data));
var getValue = (value) => {
  while (typeof value === "function")
    value = value();
  return value;
};
var withValue = (value, fn) => isFunction(value) ? effect(() => {
  fn(getValue(value));
}) : fn(value);
var isComponent = (value) => isFunction(value) && ($component in value);
var isNotNullObject = (value) => value !== null && typeof value === "object";
var isNullUndefined = (value) => value === undefined || value === null;
var isComponentable = (value) => !isReactive(value) && (isFunction(value) || !isArray(value) && isNotNullObject(value) && !value.then);
var empty = Object.create.bind(null, null);
var entries = Object.entries;
var isArray = Array.isArray;
var toArray = Array.from;
var isFunction = (value) => typeof value === "function";
var flat = (arr) => arr.length === 1 ? arr[0] : arr;
var freeze = Object.freeze;
var isReactive = (value) => isFunction(value) && ($reactive in value);
var stringify = JSON.stringify;
var iterator = Symbol.iterator;

// converged-signals/src/bubble-reactivity/constants.ts
var STATE_CLEAN = 0;
var STATE_CHECK = 1;
var STATE_DIRTY = 2;
var STATE_DISPOSED = 3;

// converged-signals/src/bubble-reactivity/error.ts
class NotReadyError extends Error {
  constructor() {
    super(...arguments);
  }
}

// converged-signals/src/bubble-reactivity/flags.ts
var ERROR_OFFSET = 0;
var ERROR_BIT = 1 << ERROR_OFFSET;
var ERROR = Symbol(__DEV__ ? "ERROR" : 0);
var LOADING_OFFSET = 1;
var LOADING_BIT = 1 << LOADING_OFFSET;
var LOADING = Symbol(__DEV__ ? "LOADING" : 0);
var DEFAULT_FLAGS = ERROR_BIT;

// converged-signals/src/bubble-reactivity/owner.ts
function setCurrentOwner(owner) {
  const out = currentOwner;
  currentOwner = owner;
  return out;
}
function getOwner() {
  return currentOwner;
}
function onCleanup(disposable) {
  if (!currentOwner)
    return;
  const node = currentOwner;
  if (!node._disposal) {
    node._disposal = disposable;
  } else if (Array.isArray(node._disposal)) {
    node._disposal.push(disposable);
  } else {
    node._disposal = [node._disposal, disposable];
  }
}
function lookup(owner, key) {
  if (!owner)
    return;
  let current = owner;
  let value;
  while (current) {
    value = current._context?.[key];
    if (value !== undefined)
      return value;
    current = current._parent;
  }
}
function handleError(owner, error) {
  const handler = lookup(owner, HANDLER);
  if (!handler)
    throw error;
  try {
    const coercedError = error instanceof Error ? error : Error(JSON.stringify(error));
    handler(coercedError);
  } catch (error2) {
    handleError(owner._parent, error2);
  }
}
var HANDLER = Symbol(__DEV__ ? "ERROR_HANDLER" : 0);
var currentOwner = null;

class Owner {
  _parent = null;
  _nextSibling = null;
  _prevSibling = null;
  _state = STATE_CLEAN;
  _disposal = null;
  _context = null;
  constructor(signal = false) {
    if (currentOwner && !signal)
      currentOwner.append(this);
  }
  append(owner) {
    owner._parent = this;
    owner._prevSibling = this;
    if (this._nextSibling)
      this._nextSibling._prevSibling = owner;
    owner._nextSibling = this._nextSibling;
    this._nextSibling = owner;
  }
  dispose(self = true) {
    if (this._state === STATE_DISPOSED)
      return;
    let current = this._nextSibling;
    while (current && current._parent === this) {
      current.dispose(true);
      current = current._nextSibling;
    }
    const head = self ? this._prevSibling : this;
    if (self)
      this._disposeNode();
    else if (current)
      current._prevSibling = this._prevSibling;
    if (head)
      head._nextSibling = current;
  }
  _disposeNode() {
    if (this._nextSibling)
      this._nextSibling._prevSibling = this._prevSibling;
    this._parent = null;
    this._prevSibling = null;
    this._context = null;
    this._state = STATE_DISPOSED;
    this.emptyDisposal();
  }
  emptyDisposal() {
    if (!this._disposal)
      return;
    if (Array.isArray(this._disposal)) {
      for (let i = 0;i < this._disposal.length; i++) {
        const callable = this._disposal[i];
        callable.call(callable);
      }
    } else {
      this._disposal.call(this._disposal);
    }
    this._disposal = null;
  }
}

// converged-signals/src/bubble-reactivity/core.ts
var loadingState = function(node) {
  const prevOwner = setCurrentOwner(node._parent);
  const options = __DEV__ ? { name: node._name ? `loading ${node._name}` : "loading" } : undefined;
  const s = new Computation(undefined, () => {
    track(node);
    node._updateIfNecessary();
    return !!(node._stateFlags & LOADING_BIT);
  }, options);
  s._handlerMask = ERROR_BIT | LOADING_BIT;
  setCurrentOwner(prevOwner);
  return s;
};
var errorState = function(node) {
  const prevOwner = setCurrentOwner(node._parent);
  const options = __DEV__ ? { name: node._name ? `error ${node._name}` : "error" } : undefined;
  const s = new Computation(undefined, () => {
    track(node);
    node._updateIfNecessary();
    return !!(node._stateFlags & ERROR_BIT);
  }, options);
  s._handlerMask = ERROR_BIT;
  setCurrentOwner(prevOwner);
  return s;
};
var track = function(computation) {
  if (currentObserver) {
    if (!newSources && currentObserver._sources && currentObserver._sources[newSourcesIndex] === computation) {
      newSourcesIndex++;
    } else if (!newSources)
      newSources = [computation];
    else if (computation !== newSources[newSources.length - 1]) {
      newSources.push(computation);
    }
  }
};
function update(node) {
  const prevSources = newSources;
  const prevSourcesIndex = newSourcesIndex;
  const prevFlags = newFlags;
  newSources = null;
  newSourcesIndex = 0;
  newFlags = 0;
  try {
    node.dispose(false);
    node.emptyDisposal();
    const result = compute(node, node._compute, node);
    node.write(result, newFlags);
  } catch (error2) {
    node._setError(error2);
  } finally {
    if (newSources) {
      if (node._sources)
        removeSourceObservers(node, newSourcesIndex);
      if (node._sources && newSourcesIndex > 0) {
        node._sources.length = newSourcesIndex + newSources.length;
        for (let i = 0;i < newSources.length; i++) {
          node._sources[newSourcesIndex + i] = newSources[i];
        }
      } else {
        node._sources = newSources;
      }
      let source;
      for (let i = newSourcesIndex;i < node._sources.length; i++) {
        source = node._sources[i];
        if (!source._observers)
          source._observers = [node];
        else
          source._observers.push(node);
      }
    } else if (node._sources && newSourcesIndex < node._sources.length) {
      removeSourceObservers(node, newSourcesIndex);
      node._sources.length = newSourcesIndex;
    }
    newSources = prevSources;
    newSourcesIndex = prevSourcesIndex;
    newFlags = prevFlags;
    node._state = STATE_CLEAN;
  }
}
var removeSourceObservers = function(node, index) {
  let source;
  let swap;
  for (let i = index;i < node._sources.length; i++) {
    source = node._sources[i];
    if (source._observers) {
      swap = source._observers.indexOf(node);
      source._observers[swap] = source._observers[source._observers.length - 1];
      source._observers.pop();
    }
  }
};
function isEqual(a, b) {
  return a === b;
}
function untrack(fn) {
  if (currentObserver === null)
    return fn();
  return compute(getOwner(), fn, null);
}
function compute(owner2, compute2, observer) {
  const prevOwner = setCurrentOwner(owner2);
  const prevObserver = currentObserver;
  const prevMask = currentMask;
  currentObserver = observer;
  currentMask = observer?._handlerMask ?? DEFAULT_FLAGS;
  try {
    return compute2(observer ? observer._value : undefined);
  } catch (e) {
    if (!(e instanceof NotReadyError)) {
      throw e;
    } else {
      return observer._value;
    }
  } finally {
    setCurrentOwner(prevOwner);
    currentObserver = prevObserver;
    currentMask = prevMask;
  }
}
var currentObserver = null;
var currentMask = DEFAULT_FLAGS;
var newSources = null;
var newSourcesIndex = 0;
var newFlags = 0;
var UNCHANGED = Symbol(__DEV__ ? "unchanged" : 0);

class Computation extends Owner {
  _sources = null;
  _observers = null;
  _value;
  _compute;
  _name;
  _equals = isEqual;
  _stateFlags = 0;
  _handlerMask = DEFAULT_FLAGS;
  _error = null;
  _loading = null;
  constructor(initialValue, compute2, options) {
    super(compute2 === null);
    this._compute = compute2;
    this._state = compute2 ? STATE_DIRTY : STATE_CLEAN;
    this._value = initialValue;
    if (__DEV__)
      this._name = options?.name ?? (this._compute ? "computed" : "signal");
    if (options?.equals !== undefined)
      this._equals = options.equals;
  }
  _read() {
    if (this._compute)
      this._updateIfNecessary();
    track(this);
    newFlags |= this._stateFlags & ~currentMask;
    if (this._stateFlags & ERROR_BIT) {
      throw this._value;
    } else {
      return this._value;
    }
  }
  read() {
    return this._read();
  }
  wait() {
    if (this.loading()) {
      throw new NotReadyError;
    }
    return this._read();
  }
  loading() {
    if (this._loading === null) {
      this._loading = loadingState(this);
    }
    return this._loading.read();
  }
  error() {
    if (this._error === null) {
      this._error = errorState(this);
    }
    return this._error.read();
  }
  write(value, flags2 = 0) {
    const valueChanged = value !== UNCHANGED && (!!(flags2 & ERROR_BIT) || this._equals === false || !this._equals(this._value, value));
    if (valueChanged)
      this._value = value;
    const changedFlagsMask = this._stateFlags ^ flags2;
    const changedFlags = changedFlagsMask & flags2;
    this._stateFlags = flags2;
    if (this._observers) {
      for (let i = 0;i < this._observers.length; i++) {
        if (valueChanged) {
          this._observers[i]._notify(STATE_DIRTY);
        } else if (changedFlagsMask) {
          this._observers[i]._notifyFlags(changedFlagsMask, changedFlags);
        }
      }
    }
    return this._value;
  }
  _notify(state) {
    if (this._state >= state)
      return;
    this._state = state;
    if (this._observers) {
      for (let i = 0;i < this._observers.length; i++) {
        this._observers[i]._notify(STATE_CHECK);
      }
    }
  }
  _notifyFlags(mask, newFlags2) {
    if (this._state >= STATE_DIRTY)
      return;
    if (mask & this._handlerMask) {
      this._notify(STATE_DIRTY);
      return;
    }
    if (this._state >= STATE_CHECK)
      return;
    const prevFlags = this._stateFlags & mask;
    const deltaFlags = prevFlags ^ newFlags2;
    if (newFlags2 === prevFlags) {
    } else if (deltaFlags & prevFlags & mask) {
      this._notify(STATE_CHECK);
    } else {
      this._stateFlags ^= deltaFlags;
      if (this._observers) {
        for (let i = 0;i < this._observers.length; i++) {
          this._observers[i]._notifyFlags(mask, newFlags2);
        }
      }
    }
  }
  _setError(error2) {
    this.write(error2, this._stateFlags | ERROR_BIT);
  }
  _updateIfNecessary() {
    if (this._state === STATE_DISPOSED) {
      throw new Error("Tried to read a disposed computation");
    }
    if (this._state === STATE_CLEAN) {
      return;
    }
    let observerFlags = 0;
    if (this._state === STATE_CHECK) {
      for (let i = 0;i < this._sources.length; i++) {
        this._sources[i]._updateIfNecessary();
        observerFlags |= this._sources[i]._stateFlags;
        if (this._state === STATE_DIRTY) {
          break;
        }
      }
    }
    if (this._state === STATE_DIRTY) {
      update(this);
    } else {
      this.write(UNCHANGED, observerFlags);
      this._state = STATE_CLEAN;
    }
  }
  _disposeNode() {
    if (this._state === STATE_DISPOSED)
      return;
    if (this._sources)
      removeSourceObservers(this, 0);
    super._disposeNode();
  }
}

// converged-signals/src/store.ts
var __DEV__2 = false;
var $RAW = Symbol(__DEV__2 ? "STORE_RAW" : 0);
var $TRACK = Symbol(__DEV__2 ? "STORE_TRACK" : 0);
var $PROXY = Symbol(__DEV__2 ? "STORE_PROXY" : 0);
var PROXIES = new WeakMap;
var NODES = [new WeakMap, new WeakMap];
// converged-signals/src/effect.ts
var flushEffects = function() {
  scheduledEffects = true;
  queueMicrotask(runEffects);
};
var runTop = function(node) {
  const ancestors = [];
  for (let current = node;current !== null; current = current._parent) {
    if (current._state !== STATE_CLEAN) {
      ancestors.push(current);
    }
  }
  for (let i = ancestors.length - 1;i >= 0; i--) {
    if (ancestors[i]._state !== STATE_DISPOSED)
      ancestors[i]._updateIfNecessary();
  }
};
var runEffects = function() {
  if (!effects.length) {
    scheduledEffects = false;
    return;
  }
  runningEffects = true;
  try {
    for (let i = 0;i < renderEffects.length; i++) {
      if (renderEffects[i]._state !== STATE_CLEAN) {
        renderEffects[i]._updateIfNecessary();
      }
    }
    for (let i = 0;i < renderEffects.length; i++) {
      if (renderEffects[i].modified) {
        renderEffects[i].effect(renderEffects[i]._value);
        renderEffects[i].modified = false;
      }
    }
    for (let i = 0;i < effects.length; i++) {
      if (effects[i]._state !== STATE_CLEAN) {
        runTop(effects[i]);
      }
    }
  } finally {
    effects = [];
    scheduledEffects = false;
    runningEffects = false;
  }
};
var scheduledEffects = false;
var runningEffects = false;
var renderEffects = [];
var effects = [];

class Effect extends Computation {
  constructor(initialValue, compute2, options) {
    super(initialValue, compute2, options);
    this._updateIfNecessary();
  }
  _notify(state) {
    if (this._state >= state)
      return;
    if (this._state === STATE_CLEAN) {
      effects.push(this);
      if (!scheduledEffects)
        flushEffects();
    }
    this._state = state;
  }
  write(value) {
    this._value = value;
    return value;
  }
  _setError(error2) {
    handleError(this, error2);
  }
}

class RenderEffect extends Computation {
  effect;
  modified = false;
  constructor(compute2, effect2, options) {
    super(undefined, compute2, options);
    this.effect = effect2;
    renderEffects.push(this);
  }
  _notify(state) {
    if (this._state >= state)
      return;
    if (this._state === STATE_CLEAN) {
      renderEffects.push(this);
      if (!scheduledEffects)
        flushEffects();
    }
    this._state = state;
  }
  write(value) {
    this._value = value;
    this.modified = true;
    return value;
  }
  _setError(error2) {
    handleError(this, error2);
  }
}

// converged-signals/src/reactivity.ts
function createSignal(initialValue, options) {
  const node = new Computation(initialValue, null, options);
  return [
    () => node.read(),
    (v) => {
      if (typeof v === "function")
        return node.write(v(node._value));
      else
        return node.write(v);
    }
  ];
}
function createEffect(effect3, initialValue, options) {
  new Effect(initialValue, effect3, __DEV__ ? { name: options?.name ?? "effect" } : undefined);
}
function createRenderEffect(compute2, effect3, options) {
  new RenderEffect(compute2, effect3, __DEV__ ? { name: options?.name ?? "effect" } : undefined);
}
function createRoot(init) {
  const owner4 = new Owner;
  return compute(owner4, !init.length ? init : () => init(() => owner4.dispose()), null);
}
function runWithOwner(owner4, run) {
  try {
    return compute(owner4, run, null);
  } catch (error2) {
    handleError(owner4, error2);
    return;
  }
}
// src/converged/solid.ts
function Context(defaultValue) {
  const id = Symbol();
  const context = { id, defaultValue };
  function Context2(newValue, fn) {
    let res;
    renderEffect(() => {
      untrack2(() => {
        const owner5 = getOwner();
        owner5.context = {
          ...owner5.context,
          [id]: newValue
        };
        if (fn)
          res = fn();
      });
    });
    return res;
  }
  return Context2;
}
var signal = (initialValue, options) => {
  const r = createSignal(initialValue, options);
  markReactive(r[0]);
  return r;
};
var root = (fn) => createRoot((dispose) => fn(dispose));
var renderEffect = (fn) => {
  const comp = () => {
  };
  createRenderEffect(comp, fn);
};
var effect = (fn) => {
  createEffect(fn);
};
var cleanup = (fn) => {
  onCleanup(fn);
  return fn;
};
var untrack2 = (fn) => untrack(fn);
var withOwner = () => {
  const owner5 = getOwner();
  return (fn) => runWithOwner(owner5, fn);
};
var owner5 = getOwner;

// src/converged/scheduler.ts
var reset = function() {
  queue = [[], [], []];
  added = false;
};
var add = function(priority, fn) {
  enqueue();
  queue[priority].push(fn);
};
var enqueue = function() {
  if (!added) {
    added = true;
    microtask2(run);
  }
};
var run = function() {
  const q = queue;
  reset();
  for (const fns of q) {
    for (const fn of fns) {
      call(fn);
    }
  }
  for (const fn of finally_) {
    call(fn);
  }
};
var call = (fn, ...args) => isArray(fn) ? fn[0](...args, ...fn.slice(1)) : fn(...args);
var microtask2 = queueMicrotask;
var added;
var queue;
var finally_ = [];
reset();
var onMount = (fn) => add(0, fn);
var ready = (fn) => add(1, fn);

// src/converged/props/proxy.ts
var proxies = [];
var hasProxy = { value: false };
var proxy = (name, value) => {
  const prop = {
    name,
    value
  };
  for (const proxyFn of proxies) {
    proxyFn(prop);
  }
  return prop;
};

// src/converged/props/plugin.ts
var plugins = empty();
var pluginsNS = empty();
var propsPlugin = (propName, fn, runOnMicrotask = true) => {
  plugin(plugins, propName, fn, runOnMicrotask);
};
var propsPluginNS = (NSName, fn, runOnMicrotask = true) => {
  plugin(pluginsNS, NSName, fn, runOnMicrotask);
};
var plugin = (plugins2, name, fn, runOnMicrotask) => {
  plugins2[name] = !runOnMicrotask ? fn : (...args) => {
    const owned = withOwner();
    microtask(() => owned(() => fn(...args)));
  };
};

// src/converged/props/style.ts
var setNodeStyle = function(style, value) {
  if (isNotNullObject(value)) {
    for (const [name, _value] of entries(value))
      setStyleValue(style, name, _value);
    return;
  }
  const type = typeof value;
  if (type === "string") {
    style.cssText = value;
    return;
  }
  if (type === "function") {
    effect(() => {
      setNodeStyle(style, getValue(value));
    });
    return;
  }
};
var setStyle = (node, name, value, props) => setNodeStyle(node.style, value);
var setStyleNS = (node, name, value, props, localName, ns) => setNodeStyle(node.style, isNotNullObject(value) ? value : { [localName]: value });
var setVarNS = (node, name, value, props, localName, ns) => setNodeStyle(node.style, { ["--" + localName]: value });
var setStyleValue = (style, name, value) => withValue(value, (value2) => _setStyleValue(style, name, value2));
var _setStyleValue = (style, name, value) => isNullUndefined(value) ? style.removeProperty(name) : style.setProperty(name, value);

// src/converged/props/class.ts
var setClassList = function(classList, value) {
  switch (typeof value) {
    case "string": {
      _setClassListValue(classList, value, true);
      break;
    }
    case "object": {
      for (const [name, _value] of entries(value))
        setClassListValue(classList, name, _value);
      break;
    }
    case "function": {
      effect(() => {
        setClassList(classList, getValue(value));
      });
      break;
    }
  }
};
var setClass = (node, name, value, props) => setClassList(node.classList, value);
var setClassNS = (node, name, value, props, localName, ns) => isNotNullObject(value) ? setClassList(node.classList, value) : setClassListValue(node.classList, localName, value);
var setClassListValue = (classList, name, value) => withValue(value, (value2) => _setClassListValue(classList, name, value2));
var _setClassListValue = (classList, name, value) => !value ? classList.remove(name) : classList.add(...name.trim().split(/\s+/));

// src/converged/props/property.ts
function _setProperty(node, name, value) {
  if (isNullUndefined(value)) {
    node[name] = null;
  } else {
    node[name] = value;
  }
  if (name === "value") {
    emit(node, "input");
    emit(node, "change");
  }
}
var setPropertyNS = (node, name, value, props, localName, ns) => setProperty(node, localName, value);
var setProperty = (node, name, value) => withValue(value, (value2) => _setProperty(node, name, value2));

// src/converged/props/attribute.ts
function _setAttribute(node, name, value, ns) {
  if (isNullUndefined(value)) {
    ns && NS[ns] ? node.removeAttributeNS(NS[ns], name) : node.removeAttribute(name);
  } else {
    ns && NS[ns] ? node.setAttributeNS(NS[ns], name, value) : node.setAttribute(name, value);
  }
}
var setAttributeNS = (node, name, value, props, localName, ns) => setAttribute(node, localName, value);
var setAttribute = (node, name, value, ns) => withValue(value, (value2) => _setAttribute(node, name, value2, ns));

// src/converged/props/bool.ts
var setBoolNS = (node, name, value, props, localName, ns) => setBool(node, localName, value);
var setBool = (node, name, value) => withValue(value, (value2) => _setBool(node, name, value2));
var _setBool = (node, name, value) => !value ? node.removeAttribute(name) : node.setAttribute(name, "");

// src/converged/props/lifecycles.ts
var setRef = (node, name, value, props) => value(node);
var setOnMount = (node, name, value, props) => onMount([value, node]);
var setUnmount = (node, name, value, props) => cleanup(() => value(node));

// src/converged/props/event.ts
function eventName(name) {
  if (name in EventNames) {
    return EventNames[name];
  }
  if (name.startsWith("on") && window[name.toLowerCase()] !== undefined) {
    EventNames[name] = name.slice(2).toLowerCase();
  } else {
    EventNames[name] = null;
  }
  return EventNames[name];
}
function addEventListener(node, type, handler, external = true) {
  node.addEventListener(type, handler, isFunction(handler) ? null : handler);
  cleanup(() => {
    removeEventListener(node, type, handler, false);
  });
  if (external) {
    return () => removeEventListener(node, type, handler);
  }
}
function removeEventListener(node, type, handler, external = true) {
  node.removeEventListener(type, handler);
  if (external) {
    return () => addEventListener(node, type, handler);
  }
}
var setEventNS = (node, name, value, props, localName, ns) => addEventListener(node, localName, value, false);
var EventNames = empty();

// src/converged/props/unknown.ts
var setanyProp = (node, name, value, ns) => withValue(value, (value2) => _setanyProp(node, name, value2, ns));
var _setanyProp = (node, name, value, ns) => {
  if (isNotNullObject(value)) {
    _setProperty(node, name, value);
  } else if (typeof value === "boolean" && !name.includes("-")) {
    _setProperty(node, name, value);
  } else {
    _setAttribute(node, name, value, ns);
    isNullUndefined(value) && _setProperty(node, name, value);
  }
};

// src/converged/props/index.ts
function assignProps(node, props) {
  const isCustomElement = node.localName && node.localName.includes("-");
  for (let [name, value] of entries(props)) {
    if (name === "children")
      continue;
    if (hasProxy.value) {
      const { name: proxyName, value: proxyValue } = proxy(name, value);
      name = proxyName;
      value = proxyValue;
    }
    if (plugins[name]) {
      plugins[name](node, name, value, props);
      continue;
    }
    let event2 = eventName(name);
    if (event2) {
      addEventListener(node, event2, value, false);
      continue;
    }
    if (name.includes(":")) {
      const [ns, localName] = name.split(":");
      if (pluginsNS[ns]) {
        pluginsNS[ns](node, name, value, props, localName, ns);
        continue;
      }
      event2 = eventName(ns);
      if (event2) {
        addEventListener(node, event2, value, false);
        continue;
      }
      isCustomElement ? _setProperty(node, name, value) : setanyProp(node, name, value, ns);
      continue;
    }
    isCustomElement ? _setProperty(node, name, value) : setanyProp(node, name, value);
  }
}
propsPlugin("style", setStyle, false);
propsPluginNS("style", setStyleNS, false);
propsPluginNS("var", setVarNS, false);
propsPlugin("class", setClass, false);
propsPluginNS("class", setClassNS, false);
propsPluginNS("prop", setPropertyNS, false);
propsPluginNS("attr", setAttributeNS, false);
propsPluginNS("bool", setBoolNS, false);
propsPlugin("onMount", setOnMount, false);
propsPluginNS("onMount", setOnMount, false);
propsPlugin("onUnmount", setUnmount, false);
propsPluginNS("onUnmount", setUnmount, false);
propsPlugin("ref", setRef, false);
propsPluginNS("ref", setRef, false);
propsPluginNS("on", setEventNS, false);
for (const item of ["value", "textContent", "innerText", "innerHTML"]) {
  propsPlugin(item, setProperty, false);
}

// src/converged/elements.ts
var bind = (fn) => document[fn].bind(document);
var createElement = bind("createElement");
var createElementNS = bind("createElementNS");
var createTextNode = bind("createTextNode");
var adoptedStyleSheets = document.adoptedStyleSheets;

// src/converged/renderer.ts
var Factory = function(value) {
  if (isComponent(value)) {
    return value;
  }
  let component = typeof value === "object" ? WeakComponents.get(value) : Components.get(value);
  if (component) {
    return component;
  }
  switch (typeof value) {
    case "string": {
      component = (props2 = defaultProps) => createTag(value, props2);
      break;
    }
    case "function": {
      if ($class in value) {
        component = (props2 = defaultProps) => untrack2(() => {
          const i = new value;
          i.ready && ready(i.ready.bind(i));
          i.cleanup && cleanup(i.cleanup.bind(i));
          return i.render(props2);
        });
        break;
      }
      if (isReactive(value)) {
        component = () => value;
        break;
      }
      component = (props2 = defaultProps) => untrack2(() => value(props2));
      break;
    }
    default: {
      if (value instanceof Node) {
        component = (props2 = defaultProps) => createNode(value, props2);
        break;
      }
      component = () => value;
      break;
    }
  }
  typeof value === "object" ? WeakComponents.set(value, component) : Components.set(value, component);
  return markComponent(component);
};
var createTag = function(tagName, props2) {
  const ns = props2.xmlns || NS[tagName];
  const nsContext = useXMLNS();
  if (ns && ns !== nsContext) {
    return useXMLNS(ns, () => createNode(createElementNS(ns, tagName), props2));
  }
  if (nsContext && tagName === "foreignObject") {
    return useXMLNS(NS.html, () => createNode(createElementNS(nsContext, tagName), props2));
  }
  return createNode(nsContext ? createElementNS(nsContext, tagName) : createElement(tagName), props2);
};
var createNode = function(node, props2) {
  assignProps(node, props2);
  createChildren(node, props2.children);
  return node;
};
var createChildren = function(parent, child, relative) {
  switch (typeof child) {
    case "string":
    case "number": {
      return insertNode(parent, createTextNode(child), relative);
    }
    case "function": {
      if (isComponent(child)) {
        return createChildren(parent, child(), relative);
      }
      let node;
      if ($map in child) {
        renderEffect(() => {
          node = child((child2) => {
            const begin = createPlaceholder(parent, null, true);
            const end = createPlaceholder(parent, null, true);
            return [begin, createChildren(end, child2, true), end];
          });
        });
        return node;
      }
      parent = createPlaceholder(parent, null, relative);
      renderEffect(() => {
        node = createChildren(parent, child(), true);
      });
      return [node, parent];
    }
    case "object": {
      if (isArray(child)) {
        if (child.length === 1) {
          return createChildren(parent, child[0], relative);
        }
        return child.map((child2) => createChildren(parent, child2, relative));
      }
      if (child instanceof Node) {
        if (child instanceof DocumentFragment) {
          return createChildren(parent, toArray(child.childNodes), relative);
        }
        return insertNode(parent, child, relative);
      }
      if (child === null) {
        return null;
      }
      if ("then" in child) {
        const [value, setValue] = signal(null);
        const owned = withOwner();
        const onResult = (r) => parent.isConnected && setValue(isFunction(r) ? owned(r) : r);
        child.then(onResult).catch(onResult);
        return createChildren(parent, value, relative);
      }
      if (iterator in child) {
        return createChildren(parent, toArray(child.values()), relative);
      }
      return createChildren(parent, "toString" in child ? child.toString() : stringify(child), relative);
    }
    case "undefined": {
      return null;
    }
    default: {
      return insertNode(parent, createTextNode(child.toString()), relative);
    }
  }
};
var insertNode = function(parent, node, relative) {
  if (parent === document.head) {
    const querySelector = parent.querySelector.bind(parent);
    const name = node.tagName;
    let prev;
    if (name === "TITLE") {
      prev = querySelector("title");
    } else if (name === "META") {
      prev = querySelector('meta[name="' + node.getAttribute("name") + '"]') || querySelector('meta[property="' + node.getAttribute("property") + '"]');
    } else if (name === "LINK" && node.rel === "canonical") {
      prev = querySelector('link[rel="canonical"]');
    }
    prev ? prev.replaceWith(node) : parent.appendChild(node);
  } else {
    relative ? parent.before(node) : parent.appendChild(node);
  }
  nodeCleanup(node);
  return node;
};
var nodeCleanup = function(node) {
  const own = owner5();
  if (own) {
    const nodes = nodeCleanupStore(own, () => []);
    if (nodes.length === 0) {
      cleanup(() => {
        for (const node2 of nodes.reverse()) {
          node2.remove();
        }
        nodes.length = 0;
      });
    }
    nodes.push(node);
  }
};
function render(children, parent, options = empty()) {
  const dispose = root((dispose2) => {
    insert(children, parent, options);
    return dispose2;
  });
  cleanup(dispose);
  return dispose;
}
var insert = function(children, parent, options = empty()) {
  if (options.clear && parent)
    parent.textContent = "";
  return createChildren(parent || document.body, isComponentable(children) ? Factory(children) : children, options.relative);
};
function toHTMLFragment(children) {
  const fragment = new DocumentFragment;
  createChildren(fragment, children);
  return fragment;
}
function context(defaultValue = undefined) {
  const ctx = Context(defaultValue);
  ctx.Provider = (props2) => ctx(props2.value, () => toHTML(props2.children));
  return ctx;
}
var Components = new Map;
var WeakComponents = new WeakMap;
var defaultProps = freeze(empty());
var useXMLNS = context();
var createPlaceholder = (parent, text, relative) => insertNode(parent, createTextNode(""), relative);
var { get: nodeCleanupStore } = weakStore();
var toHTML = (children) => flat(toHTMLFragment(children).childNodes);

// solidjs-example/reactive/signal.ts
function createSignal2(value, options) {
  options = options ? Object.assign({}, signalOptions, options) : signalOptions;
  const s = {
    value,
    observers: null,
    observerSlots: null,
    comparator: options.equals || undefined
  };
  if ("_SOLID_DEV_") {
    if (options.name)
      s.name = options.name;
    if (DevHooks.afterCreateSignal)
      DevHooks.afterCreateSignal(s);
    if (!options.internal)
      registerGraph(s);
  }
  const setter = (value2) => {
    if (typeof value2 === "function") {
      if (Transition && Transition.running && Transition.sources.has(s))
        value2 = value2(s.tValue);
      else
        value2 = value2(s.value);
    }
    return writeSignal(s, value2);
  };
  return [readSignal.bind(s), setter];
}
function createRenderEffect2(fn, value, options) {
  const c = createComputation(fn, value, false, STALE, options);
  if (Scheduler && Transition && Transition.running)
    Updates.push(c);
  else
    updateComputation(c);
}
function createMemo2(fn, value, options) {
  options = options ? Object.assign({}, signalOptions, options) : signalOptions;
  const c = createComputation(fn, value, true, 0, options);
  c.observers = null;
  c.observerSlots = null;
  c.comparator = options.equals || undefined;
  if (Scheduler && Transition && Transition.running) {
    c.tState = STALE;
    Updates.push(c);
  } else
    updateComputation(c);
  return readSignal.bind(c);
}
function untrack3(fn) {
  if (!ExternalSourceConfig && Listener === null)
    return fn();
  const listener = Listener;
  Listener = null;
  try {
    if (ExternalSourceConfig)
      return ExternalSourceConfig.untrack(fn);
    return fn();
  } finally {
    Listener = listener;
  }
}
function onCleanup2(fn) {
  if (Owner2 === null)
    console.warn("cleanups created outside a `createRoot` or `render` will never be run");
  else if (Owner2.cleanups === null)
    Owner2.cleanups = [fn];
  else
    Owner2.cleanups.push(fn);
  return fn;
}
function startTransition(fn) {
  if (Transition && Transition.running) {
    fn();
    return Transition.done;
  }
  const l = Listener;
  const o = Owner2;
  return Promise.resolve().then(() => {
    Listener = l;
    Owner2 = o;
    let t;
    if (Scheduler || SuspenseContext) {
      t = Transition || (Transition = {
        sources: new Set,
        effects: [],
        promises: new Set,
        disposed: new Set,
        queue: new Set,
        running: true
      });
      t.done || (t.done = new Promise((res) => t.resolve = res));
      t.running = true;
    }
    runUpdates(fn, false);
    Listener = Owner2 = null;
    return t ? t.done : undefined;
  });
}
function registerGraph(value) {
  if (!Owner2)
    return;
  if (Owner2.sourceMap)
    Owner2.sourceMap.push(value);
  else
    Owner2.sourceMap = [value];
  value.graph = Owner2;
}
function createContext(defaultValue, options) {
  const id = Symbol("context");
  return { id, Provider: createProvider(id, options), defaultValue };
}
function children(fn) {
  const children2 = createMemo2(fn);
  const memo = createMemo2(() => resolveChildren(children2()), undefined, { name: "children" });
  memo.toArray = () => {
    const c = memo();
    return Array.isArray(c) ? c : c != null ? [c] : [];
  };
  return memo;
}
function readSignal() {
  const runningTransition = Transition && Transition.running;
  if (this.sources && (runningTransition ? this.tState : this.state)) {
    if ((runningTransition ? this.tState : this.state) === STALE)
      updateComputation(this);
    else {
      const updates = Updates;
      Updates = null;
      runUpdates(() => lookUpstream(this), false);
      Updates = updates;
    }
  }
  if (Listener) {
    const sSlot = this.observers ? this.observers.length : 0;
    if (!Listener.sources) {
      Listener.sources = [this];
      Listener.sourceSlots = [sSlot];
    } else {
      Listener.sources.push(this);
      Listener.sourceSlots.push(sSlot);
    }
    if (!this.observers) {
      this.observers = [Listener];
      this.observerSlots = [Listener.sources.length - 1];
    } else {
      this.observers.push(Listener);
      this.observerSlots.push(Listener.sources.length - 1);
    }
  }
  if (runningTransition && Transition.sources.has(this))
    return this.tValue;
  return this.value;
}
function writeSignal(node, value, isComp) {
  let current = Transition && Transition.running && Transition.sources.has(node) ? node.tValue : node.value;
  if (!node.comparator || !node.comparator(current, value)) {
    if (Transition) {
      const TransitionRunning = Transition.running;
      if (TransitionRunning || !isComp && Transition.sources.has(node)) {
        Transition.sources.add(node);
        node.tValue = value;
      }
      if (!TransitionRunning)
        node.value = value;
    } else
      node.value = value;
    if (node.observers && node.observers.length) {
      runUpdates(() => {
        for (let i = 0;i < node.observers.length; i += 1) {
          const o = node.observers[i];
          const TransitionRunning = Transition && Transition.running;
          if (TransitionRunning && Transition.disposed.has(o))
            continue;
          if (TransitionRunning ? !o.tState : !o.state) {
            if (o.pure)
              Updates.push(o);
            else
              Effects.push(o);
            if (o.observers)
              markDownstream(o);
          }
          if (!TransitionRunning)
            o.state = STALE;
          else
            o.tState = STALE;
        }
        if (Updates.length > 1e6) {
          Updates = [];
          if ("_SOLID_DEV_")
            throw new Error("Potential Infinite Loop Detected.");
          throw new Error;
        }
      }, false);
    }
  }
  return value;
}
var updateComputation = function(node) {
  if (!node.fn)
    return;
  cleanNode(node);
  const time = ExecCount;
  runComputation(node, Transition && Transition.running && Transition.sources.has(node) ? node.tValue : node.value, time);
  if (Transition && !Transition.running && Transition.sources.has(node)) {
    queueMicrotask(() => {
      runUpdates(() => {
        Transition && (Transition.running = true);
        Listener = Owner2 = node;
        runComputation(node, node.tValue, time);
        Listener = Owner2 = null;
      }, false);
    });
  }
};
var runComputation = function(node, value, time) {
  let nextValue;
  const owner6 = Owner2, listener = Listener;
  Listener = Owner2 = node;
  try {
    nextValue = node.fn(value);
  } catch (err) {
    if (node.pure) {
      if (Transition && Transition.running) {
        node.tState = STALE;
        node.tOwned && node.tOwned.forEach(cleanNode);
        node.tOwned = undefined;
      } else {
        node.state = STALE;
        node.owned && node.owned.forEach(cleanNode);
        node.owned = null;
      }
    }
    node.updatedAt = time + 1;
    return handleError2(err);
  } finally {
    Listener = listener;
    Owner2 = owner6;
  }
  if (!node.updatedAt || node.updatedAt <= time) {
    if (node.updatedAt != null && "observers" in node) {
      writeSignal(node, nextValue, true);
    } else if (Transition && Transition.running && node.pure) {
      Transition.sources.add(node);
      node.tValue = nextValue;
    } else
      node.value = nextValue;
    node.updatedAt = time;
  }
};
var createComputation = function(fn, init, pure, state = STALE, options) {
  const c = {
    fn,
    state,
    updatedAt: null,
    owned: null,
    sources: null,
    sourceSlots: null,
    cleanups: null,
    value: init,
    owner: Owner2,
    context: Owner2 ? Owner2.context : null,
    pure
  };
  if (Transition && Transition.running) {
    c.state = 0;
    c.tState = state;
  }
  if (Owner2 === null)
    console.warn("computations created outside a `createRoot` or `render` will never be disposed");
  else if (Owner2 !== UNOWNED) {
    if (Transition && Transition.running && Owner2.pure) {
      if (!Owner2.tOwned)
        Owner2.tOwned = [c];
      else
        Owner2.tOwned.push(c);
    } else {
      if (!Owner2.owned)
        Owner2.owned = [c];
      else
        Owner2.owned.push(c);
    }
  }
  if (options && options.name)
    c.name = options.name;
  if (ExternalSourceConfig && c.fn) {
    const [track2, trigger] = createSignal2(undefined, { equals: false });
    const ordinary = ExternalSourceConfig.factory(c.fn, trigger);
    onCleanup2(() => ordinary.dispose());
    const triggerInTransition = () => startTransition(trigger).then(() => inTransition.dispose());
    const inTransition = ExternalSourceConfig.factory(c.fn, triggerInTransition);
    c.fn = (x) => {
      track2();
      return Transition && Transition.running ? inTransition.track(x) : ordinary.track(x);
    };
  }
  if ("_SOLID_DEV_")
    DevHooks.afterCreateOwner && DevHooks.afterCreateOwner(c);
  return c;
};
var runTop2 = function(node) {
  const runningTransition = Transition && Transition.running;
  if ((runningTransition ? node.tState : node.state) === 0)
    return;
  if ((runningTransition ? node.tState : node.state) === PENDING)
    return lookUpstream(node);
  if (node.suspense && untrack3(node.suspense.inFallback))
    return node.suspense.effects.push(node);
  const ancestors = [node];
  while ((node = node.owner) && (!node.updatedAt || node.updatedAt < ExecCount)) {
    if (runningTransition && Transition.disposed.has(node))
      return;
    if (runningTransition ? node.tState : node.state)
      ancestors.push(node);
  }
  for (let i = ancestors.length - 1;i >= 0; i--) {
    node = ancestors[i];
    if (runningTransition) {
      let top = node, prev = ancestors[i + 1];
      while ((top = top.owner) && top !== prev) {
        if (Transition.disposed.has(top))
          return;
      }
    }
    if ((runningTransition ? node.tState : node.state) === STALE) {
      updateComputation(node);
    } else if ((runningTransition ? node.tState : node.state) === PENDING) {
      const updates = Updates;
      Updates = null;
      runUpdates(() => lookUpstream(node, ancestors[0]), false);
      Updates = updates;
    }
  }
};
var runUpdates = function(fn, init) {
  if (Updates)
    return fn();
  let wait = false;
  if (!init)
    Updates = [];
  if (Effects)
    wait = true;
  else
    Effects = [];
  ExecCount++;
  try {
    const res = fn();
    completeUpdates(wait);
    return res;
  } catch (err) {
    if (!wait)
      Effects = null;
    Updates = null;
    handleError2(err);
  }
};
var completeUpdates = function(wait) {
  if (Updates) {
    if (Scheduler && Transition && Transition.running)
      scheduleQueue(Updates);
    else
      runQueue(Updates);
    Updates = null;
  }
  if (wait)
    return;
  let res;
  if (Transition) {
    if (!Transition.promises.size && !Transition.queue.size) {
      const sources = Transition.sources;
      const disposed = Transition.disposed;
      Effects.push.apply(Effects, Transition.effects);
      res = Transition.resolve;
      for (const e2 of Effects) {
        "tState" in e2 && (e2.state = e2.tState);
        delete e2.tState;
      }
      Transition = null;
      runUpdates(() => {
        for (const d of disposed)
          cleanNode(d);
        for (const v of sources) {
          v.value = v.tValue;
          if (v.owned) {
            for (let i = 0, len = v.owned.length;i < len; i++)
              cleanNode(v.owned[i]);
          }
          if (v.tOwned)
            v.owned = v.tOwned;
          delete v.tValue;
          delete v.tOwned;
          v.tState = 0;
        }
        setTransPending(false);
      }, false);
    } else if (Transition.running) {
      Transition.running = false;
      Transition.effects.push.apply(Transition.effects, Effects);
      Effects = null;
      setTransPending(true);
      return;
    }
  }
  const e = Effects;
  Effects = null;
  if (e.length)
    runUpdates(() => runEffects2(e), false);
  else if ("_SOLID_DEV_")
    DevHooks.afterUpdate && DevHooks.afterUpdate();
  if (res)
    res();
};
var runQueue = function(queue2) {
  for (let i = 0;i < queue2.length; i++)
    runTop2(queue2[i]);
};
var scheduleQueue = function(queue2) {
  for (let i = 0;i < queue2.length; i++) {
    const item = queue2[i];
    const tasks = Transition.queue;
    if (!tasks.has(item)) {
      tasks.add(item);
      Scheduler(() => {
        tasks.delete(item);
        runUpdates(() => {
          Transition.running = true;
          runTop2(item);
        }, false);
        Transition && (Transition.running = false);
      });
    }
  }
};
var lookUpstream = function(node, ignore) {
  const runningTransition = Transition && Transition.running;
  if (runningTransition)
    node.tState = 0;
  else
    node.state = 0;
  for (let i = 0;i < node.sources.length; i += 1) {
    const source = node.sources[i];
    if (source.sources) {
      const state = runningTransition ? source.tState : source.state;
      if (state === STALE) {
        if (source !== ignore && (!source.updatedAt || source.updatedAt < ExecCount))
          runTop2(source);
      } else if (state === PENDING)
        lookUpstream(source, ignore);
    }
  }
};
var markDownstream = function(node) {
  const runningTransition = Transition && Transition.running;
  for (let i = 0;i < node.observers.length; i += 1) {
    const o = node.observers[i];
    if (runningTransition ? !o.tState : !o.state) {
      if (runningTransition)
        o.tState = PENDING;
      else
        o.state = PENDING;
      if (o.pure)
        Updates.push(o);
      else
        Effects.push(o);
      o.observers && markDownstream(o);
    }
  }
};
var cleanNode = function(node) {
  let i;
  if (node.sources) {
    while (node.sources.length) {
      const source = node.sources.pop(), index = node.sourceSlots.pop(), obs = source.observers;
      if (obs && obs.length) {
        const n = obs.pop(), s = source.observerSlots.pop();
        if (index < obs.length) {
          n.sourceSlots[s] = index;
          obs[index] = n;
          source.observerSlots[index] = s;
        }
      }
    }
  }
  if (Transition && Transition.running && node.pure) {
    if (node.tOwned) {
      for (i = node.tOwned.length - 1;i >= 0; i--)
        cleanNode(node.tOwned[i]);
      delete node.tOwned;
    }
    reset2(node, true);
  } else if (node.owned) {
    for (i = node.owned.length - 1;i >= 0; i--)
      cleanNode(node.owned[i]);
    node.owned = null;
  }
  if (node.cleanups) {
    for (i = node.cleanups.length - 1;i >= 0; i--)
      node.cleanups[i]();
    node.cleanups = null;
  }
  if (Transition && Transition.running)
    node.tState = 0;
  else
    node.state = 0;
  delete node.sourceMap;
};
var reset2 = function(node, top) {
  if (!top) {
    node.tState = 0;
    Transition.disposed.add(node);
  }
  if (node.owned) {
    for (let i = 0;i < node.owned.length; i++)
      reset2(node.owned[i]);
  }
};
var castError = function(err) {
  if (err instanceof Error)
    return err;
  return new Error(typeof err === "string" ? err : "Unknown error", { cause: err });
};
var runErrors = function(err, fns, owner6) {
  try {
    for (const f of fns)
      f(err);
  } catch (e) {
    handleError2(e, owner6 && owner6.owner || null);
  }
};
var handleError2 = function(err, owner6 = Owner2) {
  const fns = ERROR2 && owner6 && owner6.context && owner6.context[ERROR2];
  const error2 = castError(err);
  if (!fns)
    throw error2;
  if (Effects)
    Effects.push({
      fn() {
        runErrors(error2, fns, owner6);
      },
      state: STALE
    });
  else
    runErrors(error2, fns, owner6);
};
var resolveChildren = function(children2) {
  if (typeof children2 === "function" && !children2.length)
    return resolveChildren(children2());
  if (Array.isArray(children2)) {
    const results = [];
    for (let i = 0;i < children2.length; i++) {
      const result = resolveChildren(children2[i]);
      Array.isArray(result) ? results.push.apply(results, result) : results.push(result);
    }
    return results;
  }
  return children2;
};
var createProvider = function(id, options) {
  return function provider(props2) {
    let res;
    createRenderEffect2(() => res = untrack3(() => {
      Owner2.context = { ...Owner2.context, [id]: props2.value };
      return children(() => props2.children);
    }), undefined, options);
    return res;
  };
};
var equalFn = (a, b) => a === b;
var $PROXY2 = Symbol("solid-proxy");
var $TRACK2 = Symbol("solid-track");
var $DEVCOMP = Symbol("solid-dev-component");
var signalOptions = { equals: equalFn };
var ERROR2 = null;
var runEffects2 = runQueue;
var STALE = 1;
var PENDING = 2;
var UNOWNED = {
  owned: null,
  cleanups: null,
  context: null,
  owner: null
};
var Owner2 = null;
var Transition = null;
var Scheduler = null;
var ExternalSourceConfig = null;
var Listener = null;
var Updates = null;
var Effects = null;
var ExecCount = 0;
var DevHooks = {
  afterUpdate: null,
  afterCreateOwner: null,
  afterCreateSignal: null
};
var [transPending, setTransPending] = createSignal2(false);
var SuspenseContext;
// solidjs-example/reactive/array.ts
var FALLBACK = Symbol("fallback");
// solidjs-example/render/Suspense.ts
var SuspenseListContext = createContext();
// src/mycomp.tsx
function MyComponent1(props2) {
  return jsx("div", {
    style: "border:1px;",
    children: "  OK2"
  }, undefined, false, undefined, this);
}
function MyComponent(props2) {
  const [count, setCount] = signal(0);
  createRenderEffect2(() => {
    console.log("The count is now", count());
  });
  return jsx("div", {
    style: "border:1px;",
    children: [
      jsx("div", {
        children: "Create div"
      }, undefined, false, undefined, this),
      jsx("table", {
        children: jsx("td", {
          children: "ok10"
        }, undefined, false, undefined, this)
      }, undefined, false, undefined, this),
      jsx("button", {
        onClick: () => setCount(count() + 1),
        children: [
          "Click Me ",
          count()
        ]
      }, undefined, true, undefined, this),
      jsx(MyComponent1, {}, undefined, false, undefined, this)
    ]
  }, undefined, true, undefined, this);
}

// src/converged/rendering/jsx.ts
function jsx(type, props2, p2, last, p4, owner6) {
  return { elementName: type, props: props2 };
}

// src/index.tsx
render(MyComponent, document.querySelector("body"));
