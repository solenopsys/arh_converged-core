// src/converged/uitls/constants.ts
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

// src/converged/uitls/utils.ts
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
var groupBy = Object.groupBy;
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
function untrack2(fn) {
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
var $RAW = Symbol(__DEV__ ? "STORE_RAW" : 0);
var $TRACK = Symbol(__DEV__ ? "STORE_TRACK" : 0);
var $PROXY = Symbol(__DEV__ ? "STORE_PROXY" : 0);
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
      console.log("RENDER EFFECT CONTEXT", newValue);
      untrack(() => {
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
  createRenderEffect(() => fn(), fn);
};
var effect = (fn) => {
  createEffect(fn);
};
var cleanup = (fn) => {
  onCleanup(fn);
  return fn;
};
var untrack = (fn) => untrack2(fn);
var withOwner = () => {
  const owner5 = getOwner();
  return (fn) => runWithOwner(owner5, fn);
};
var owner5 = getOwner;

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

// src/converged/props/lifecycles.ts
var setRef = (node, name, value, props) => value(node);
var setOnMount = (node, name, value, props) => {
  console.log("ON MOUNT");
  onMount([value, node]);
};
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

// src/converged/uitls/elements.ts
var bind = (fn) => document[fn].bind(document);
var createElement = bind("createElement");
var createElementNS = bind("createElementNS");
var createTextNode = bind("createTextNode");
var adoptedStyleSheets = document.adoptedStyleSheets;

// src/converged/renderer/manipulate.ts
function toHTMLFragment(children2) {
  const fragment = new DocumentFragment;
  createChildren(fragment, children2);
  return fragment;
}
function context(defaultValue) {
  console.log("CONTEXT DEFAULT: ", defaultValue);
  const ctx = Context(defaultValue);
  ctx.Provider = (props2) => ctx(props2.value, () => toHTML(props2.children));
  return ctx;
}
function nodeCleanup(node) {
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
}
function createNode(node, props2) {
  assignProps(node, props2);
  createChildren(node, props2.children);
  return node;
}
function insertNode(parent, node, relative) {
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
}
function createTag(tagName, props2) {
  console.log("CREATE TAG", tagName);
  const ns = props2.xmlns || NS[tagName];
  const nsContext = useXMLNS();
  if (ns && ns !== nsContext) {
    return useXMLNS(ns, () => createNode(createElementNS(ns, tagName), props2));
  }
  if (nsContext && tagName === "foreignObject") {
    return useXMLNS(NS.html, () => createNode(createElementNS(nsContext, tagName), props2));
  }
  return createNode(nsContext ? createElementNS(nsContext, tagName) : createElement(tagName), props2);
}
var useXMLNS = context();
var toHTML = (children2) => flat(toHTMLFragment(children2).childNodes);
var { get: nodeCleanupStore } = weakStore();
var createPlaceholder = (parent, text, relative) => insertNode(parent, createTextNode(""), relative);

// src/converged/renderer/children.ts
function createChildren(parent, child, relative) {
  switch (typeof child) {
    case "string":
    case "number": {
      return insertNode(parent, createTextNode(child), relative);
    }
    case "function": {
      return functionHandler(parent, child, relative);
    }
    case "object": {
      return objectHandler(parent, child, relative);
    }
    case "undefined": {
      return null;
    }
    default: {
      return insertNode(parent, createTextNode(child.toString()), relative);
    }
  }
}
var objectHandler = function(parent, child, relative) {
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
};
var functionHandler = function(parent, child, relative) {
  if (isComponent(child)) {
    return createChildren(parent, child(), relative);
  }
  let node;
  if ($map in child) {
    const effect4 = () => {
      node = child((child2) => {
        console.log("CHILDREN: ", child2);
        const begin = createPlaceholder(parent, null, true);
        const end = createPlaceholder(parent, null, true);
        return [begin, createChildren(end, child2, true), end];
      });
    };
    renderEffect(effect4);
    return node;
  }
  parent = createPlaceholder(parent, null, relative);
  renderEffect(() => {
  });
  return [node, parent];
};

// src/converged/renderer/factory.ts
function Factory(value) {
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
        component = (props2 = defaultProps) => untrack(() => {
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
      component = (props2 = defaultProps) => untrack(() => value(props2));
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
}
var Components = new Map;
var WeakComponents = new WeakMap;
var defaultProps = freeze(empty());

// src/converged/renderer/renderer.ts
function render(children3, parent, options = empty()) {
  const dispose = root((dispose2) => {
    insert(children3, parent, options);
    return dispose2;
  });
  cleanup(dispose);
  return dispose;
}
var insert = function(children3, parent, options = empty()) {
  if (options.clear && parent)
    parent.textContent = "";
  return createChildren(parent || document.body, isComponentable(children3) ? Factory(children3) : children3, options.relative);
};

// src/mycomp.tsx
function MyComponent1(props2) {
  return Component(Fragment, {
    children: Component("div", {
      style: "border:1px;",
      children: "  OK2"
    }, undefined, false, undefined, this)
  }, undefined, false, undefined, this);
}
function MyComponent(props2) {
  const [count, setCount] = signal(0);
  effect(() => {
    console.log("The count is now", count());
  });
  return Component("div", {
    style: "border:1px;",
    children: [
      Component("div", {
        children: "Create div"
      }, undefined, false, undefined, this),
      Component("table", {
        children: Component("td", {
          children: "ok10"
        }, undefined, false, undefined, this)
      }, undefined, false, undefined, this),
      Component("button", {
        onClick: () => setCount(count() + 1),
        children: [
          "Click Me ",
          count()
        ]
      }, undefined, true, undefined, this),
      Component(MyComponent1, {}, undefined, false, undefined, this)
    ]
  }, undefined, true, undefined, this);
}

// src/converged/renderer/component.ts
function Component(value, props2 = undefined) {
  if (value === Fragment) {
    return props2.children;
  }
  Object.freeze(props2);
  return props2 === undefined ? Factory(value) : markComponent(Factory(value).bind(null, props2));
}
var Fragment = () => {
};

// src/index.tsx
render(MyComponent, document.querySelector("body"));
