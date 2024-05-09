(() => {
  // node_modules/alpinejs/dist/module.esm.js
  var flushPending = false;
  var flushing = false;
  var queue = [];
  var lastFlushedIndex = -1;
  function scheduler(callback) {
    queueJob(callback);
  }
  function queueJob(job) {
    if (!queue.includes(job)) queue.push(job);
    queueFlush();
  }
  function dequeueJob(job) {
    let index = queue.indexOf(job);
    if (index !== -1 && index > lastFlushedIndex) queue.splice(index, 1);
  }
  function queueFlush() {
    if (!flushing && !flushPending) {
      flushPending = true;
      queueMicrotask(flushJobs);
    }
  }
  function flushJobs() {
    flushPending = false;
    flushing = true;
    for (let i = 0; i < queue.length; i++) {
      queue[i]();
      lastFlushedIndex = i;
    }
    queue.length = 0;
    lastFlushedIndex = -1;
    flushing = false;
  }
  var reactive;
  var effect;
  var release;
  var raw;
  var shouldSchedule = true;
  function disableEffectScheduling(callback) {
    shouldSchedule = false;
    callback();
    shouldSchedule = true;
  }
  function setReactivityEngine(engine) {
    reactive = engine.reactive;
    release = engine.release;
    effect = (callback) =>
      engine.effect(callback, {
        scheduler: (task) => {
          if (shouldSchedule) {
            scheduler(task);
          } else {
            task();
          }
        },
      });
    raw = engine.raw;
  }
  function overrideEffect(override) {
    effect = override;
  }
  function elementBoundEffect(el) {
    let cleanup2 = () => {};
    let wrappedEffect = (callback) => {
      let effectReference = effect(callback);
      if (!el._x_effects) {
        el._x_effects = /* @__PURE__ */ new Set();
        el._x_runEffects = () => {
          el._x_effects.forEach((i) => i());
        };
      }
      el._x_effects.add(effectReference);
      cleanup2 = () => {
        if (effectReference === void 0) return;
        el._x_effects.delete(effectReference);
        release(effectReference);
      };
      return effectReference;
    };
    return [
      wrappedEffect,
      () => {
        cleanup2();
      },
    ];
  }
  function watch(getter, callback) {
    let firstTime = true;
    let oldValue;
    let effectReference = effect(() => {
      let value = getter();
      JSON.stringify(value);
      if (!firstTime) {
        queueMicrotask(() => {
          callback(value, oldValue);
          oldValue = value;
        });
      } else {
        oldValue = value;
      }
      firstTime = false;
    });
    return () => release(effectReference);
  }
  function dispatch(el, name, detail = {}) {
    el.dispatchEvent(
      new CustomEvent(name, {
        detail,
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
  }
  function walk(el, callback) {
    if (typeof ShadowRoot === 'function' && el instanceof ShadowRoot) {
      Array.from(el.children).forEach((el2) => walk(el2, callback));
      return;
    }
    let skip = false;
    callback(el, () => (skip = true));
    if (skip) return;
    let node = el.firstElementChild;
    while (node) {
      walk(node, callback, false);
      node = node.nextElementSibling;
    }
  }
  function warn(message, ...args) {
    console.warn(`Alpine Warning: ${message}`, ...args);
  }
  var started = false;
  function start() {
    if (started)
      warn(
        'Alpine has already been initialized on this page. Calling Alpine.start() more than once can cause problems.',
      );
    started = true;
    if (!document.body)
      warn(
        "Unable to initialize. Trying to load Alpine before `<body>` is available. Did you forget to add `defer` in Alpine's `<script>` tag?",
      );
    dispatch(document, 'alpine:init');
    dispatch(document, 'alpine:initializing');
    startObservingMutations();
    onElAdded((el) => initTree(el, walk));
    onElRemoved((el) => destroyTree(el));
    onAttributesAdded((el, attrs) => {
      directives(el, attrs).forEach((handle) => handle());
    });
    let outNestedComponents = (el) => !closestRoot(el.parentElement, true);
    Array.from(document.querySelectorAll(allSelectors().join(',')))
      .filter(outNestedComponents)
      .forEach((el) => {
        initTree(el);
      });
    dispatch(document, 'alpine:initialized');
  }
  var rootSelectorCallbacks = [];
  var initSelectorCallbacks = [];
  function rootSelectors() {
    return rootSelectorCallbacks.map((fn) => fn());
  }
  function allSelectors() {
    return rootSelectorCallbacks
      .concat(initSelectorCallbacks)
      .map((fn) => fn());
  }
  function addRootSelector(selectorCallback) {
    rootSelectorCallbacks.push(selectorCallback);
  }
  function addInitSelector(selectorCallback) {
    initSelectorCallbacks.push(selectorCallback);
  }
  function closestRoot(el, includeInitSelectors = false) {
    return findClosest(el, (element) => {
      const selectors = includeInitSelectors ? allSelectors() : rootSelectors();
      if (selectors.some((selector3) => element.matches(selector3)))
        return true;
    });
  }
  function findClosest(el, callback) {
    if (!el) return;
    if (callback(el)) return el;
    if (el._x_teleportBack) el = el._x_teleportBack;
    if (!el.parentElement) return;
    return findClosest(el.parentElement, callback);
  }
  function isRoot(el) {
    return rootSelectors().some((selector3) => el.matches(selector3));
  }
  var initInterceptors = [];
  function interceptInit(callback) {
    initInterceptors.push(callback);
  }
  function initTree(el, walker = walk, intercept = () => {}) {
    deferHandlingDirectives(() => {
      walker(el, (el2, skip) => {
        intercept(el2, skip);
        initInterceptors.forEach((i) => i(el2, skip));
        directives(el2, el2.attributes).forEach((handle) => handle());
        el2._x_ignore && skip();
      });
    });
  }
  function destroyTree(root, walker = walk) {
    walker(root, (el) => {
      cleanupAttributes(el);
      cleanupElement(el);
    });
  }
  var onAttributeAddeds = [];
  var onElRemoveds = [];
  var onElAddeds = [];
  function onElAdded(callback) {
    onElAddeds.push(callback);
  }
  function onElRemoved(el, callback) {
    if (typeof callback === 'function') {
      if (!el._x_cleanups) el._x_cleanups = [];
      el._x_cleanups.push(callback);
    } else {
      callback = el;
      onElRemoveds.push(callback);
    }
  }
  function onAttributesAdded(callback) {
    onAttributeAddeds.push(callback);
  }
  function onAttributeRemoved(el, name, callback) {
    if (!el._x_attributeCleanups) el._x_attributeCleanups = {};
    if (!el._x_attributeCleanups[name]) el._x_attributeCleanups[name] = [];
    el._x_attributeCleanups[name].push(callback);
  }
  function cleanupAttributes(el, names) {
    if (!el._x_attributeCleanups) return;
    Object.entries(el._x_attributeCleanups).forEach(([name, value]) => {
      if (names === void 0 || names.includes(name)) {
        value.forEach((i) => i());
        delete el._x_attributeCleanups[name];
      }
    });
  }
  function cleanupElement(el) {
    if (el._x_cleanups) {
      while (el._x_cleanups.length) el._x_cleanups.pop()();
    }
  }
  var observer = new MutationObserver(onMutate);
  var currentlyObserving = false;
  function startObservingMutations() {
    observer.observe(document, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeOldValue: true,
    });
    currentlyObserving = true;
  }
  function stopObservingMutations() {
    flushObserver();
    observer.disconnect();
    currentlyObserving = false;
  }
  var queuedMutations = [];
  function flushObserver() {
    let records = observer.takeRecords();
    queuedMutations.push(() => records.length > 0 && onMutate(records));
    let queueLengthWhenTriggered = queuedMutations.length;
    queueMicrotask(() => {
      if (queuedMutations.length === queueLengthWhenTriggered) {
        while (queuedMutations.length > 0) queuedMutations.shift()();
      }
    });
  }
  function mutateDom(callback) {
    if (!currentlyObserving) return callback();
    stopObservingMutations();
    let result = callback();
    startObservingMutations();
    return result;
  }
  var isCollecting = false;
  var deferredMutations = [];
  function deferMutations() {
    isCollecting = true;
  }
  function flushAndStopDeferringMutations() {
    isCollecting = false;
    onMutate(deferredMutations);
    deferredMutations = [];
  }
  function onMutate(mutations) {
    if (isCollecting) {
      deferredMutations = deferredMutations.concat(mutations);
      return;
    }
    let addedNodes = /* @__PURE__ */ new Set();
    let removedNodes = /* @__PURE__ */ new Set();
    let addedAttributes = /* @__PURE__ */ new Map();
    let removedAttributes = /* @__PURE__ */ new Map();
    for (let i = 0; i < mutations.length; i++) {
      if (mutations[i].target._x_ignoreMutationObserver) continue;
      if (mutations[i].type === 'childList') {
        mutations[i].addedNodes.forEach(
          (node) => node.nodeType === 1 && addedNodes.add(node),
        );
        mutations[i].removedNodes.forEach(
          (node) => node.nodeType === 1 && removedNodes.add(node),
        );
      }
      if (mutations[i].type === 'attributes') {
        let el = mutations[i].target;
        let name = mutations[i].attributeName;
        let oldValue = mutations[i].oldValue;
        let add2 = () => {
          if (!addedAttributes.has(el)) addedAttributes.set(el, []);
          addedAttributes.get(el).push({ name, value: el.getAttribute(name) });
        };
        let remove2 = () => {
          if (!removedAttributes.has(el)) removedAttributes.set(el, []);
          removedAttributes.get(el).push(name);
        };
        if (el.hasAttribute(name) && oldValue === null) {
          add2();
        } else if (el.hasAttribute(name)) {
          remove2();
          add2();
        } else {
          remove2();
        }
      }
    }
    removedAttributes.forEach((attrs, el) => {
      cleanupAttributes(el, attrs);
    });
    addedAttributes.forEach((attrs, el) => {
      onAttributeAddeds.forEach((i) => i(el, attrs));
    });
    for (let node of removedNodes) {
      if (addedNodes.has(node)) continue;
      onElRemoveds.forEach((i) => i(node));
      destroyTree(node);
    }
    addedNodes.forEach((node) => {
      node._x_ignoreSelf = true;
      node._x_ignore = true;
    });
    for (let node of addedNodes) {
      if (removedNodes.has(node)) continue;
      if (!node.isConnected) continue;
      delete node._x_ignoreSelf;
      delete node._x_ignore;
      onElAddeds.forEach((i) => i(node));
      node._x_ignore = true;
      node._x_ignoreSelf = true;
    }
    addedNodes.forEach((node) => {
      delete node._x_ignoreSelf;
      delete node._x_ignore;
    });
    addedNodes = null;
    removedNodes = null;
    addedAttributes = null;
    removedAttributes = null;
  }
  function scope(node) {
    return mergeProxies(closestDataStack(node));
  }
  function addScopeToNode(node, data2, referenceNode) {
    node._x_dataStack = [data2, ...closestDataStack(referenceNode || node)];
    return () => {
      node._x_dataStack = node._x_dataStack.filter((i) => i !== data2);
    };
  }
  function closestDataStack(node) {
    if (node._x_dataStack) return node._x_dataStack;
    if (typeof ShadowRoot === 'function' && node instanceof ShadowRoot) {
      return closestDataStack(node.host);
    }
    if (!node.parentNode) {
      return [];
    }
    return closestDataStack(node.parentNode);
  }
  function mergeProxies(objects) {
    return new Proxy({ objects }, mergeProxyTrap);
  }
  var mergeProxyTrap = {
    ownKeys({ objects }) {
      return Array.from(new Set(objects.flatMap((i) => Object.keys(i))));
    },
    has({ objects }, name) {
      if (name == Symbol.unscopables) return false;
      return objects.some(
        (obj) =>
          Object.prototype.hasOwnProperty.call(obj, name) ||
          Reflect.has(obj, name),
      );
    },
    get({ objects }, name, thisProxy) {
      if (name == 'toJSON') return collapseProxies;
      return Reflect.get(
        objects.find((obj) => Reflect.has(obj, name)) || {},
        name,
        thisProxy,
      );
    },
    set({ objects }, name, value, thisProxy) {
      const target =
        objects.find((obj) =>
          Object.prototype.hasOwnProperty.call(obj, name),
        ) || objects[objects.length - 1];
      const descriptor = Object.getOwnPropertyDescriptor(target, name);
      if (descriptor?.set && descriptor?.get)
        return Reflect.set(target, name, value, thisProxy);
      return Reflect.set(target, name, value);
    },
  };
  function collapseProxies() {
    let keys = Reflect.ownKeys(this);
    return keys.reduce((acc, key) => {
      acc[key] = Reflect.get(this, key);
      return acc;
    }, {});
  }
  function initInterceptors2(data2) {
    let isObject22 = (val) =>
      typeof val === 'object' && !Array.isArray(val) && val !== null;
    let recurse = (obj, basePath = '') => {
      Object.entries(Object.getOwnPropertyDescriptors(obj)).forEach(
        ([key, { value, enumerable }]) => {
          if (enumerable === false || value === void 0) return;
          if (typeof value === 'object' && value !== null && value.__v_skip)
            return;
          let path = basePath === '' ? key : `${basePath}.${key}`;
          if (
            typeof value === 'object' &&
            value !== null &&
            value._x_interceptor
          ) {
            obj[key] = value.initialize(data2, path, key);
          } else {
            if (
              isObject22(value) &&
              value !== obj &&
              !(value instanceof Element)
            ) {
              recurse(value, path);
            }
          }
        },
      );
    };
    return recurse(data2);
  }
  function interceptor(callback, mutateObj = () => {}) {
    let obj = {
      initialValue: void 0,
      _x_interceptor: true,
      initialize(data2, path, key) {
        return callback(
          this.initialValue,
          () => get(data2, path),
          (value) => set(data2, path, value),
          path,
          key,
        );
      },
    };
    mutateObj(obj);
    return (initialValue) => {
      if (
        typeof initialValue === 'object' &&
        initialValue !== null &&
        initialValue._x_interceptor
      ) {
        let initialize = obj.initialize.bind(obj);
        obj.initialize = (data2, path, key) => {
          let innerValue = initialValue.initialize(data2, path, key);
          obj.initialValue = innerValue;
          return initialize(data2, path, key);
        };
      } else {
        obj.initialValue = initialValue;
      }
      return obj;
    };
  }
  function get(obj, path) {
    return path.split('.').reduce((carry, segment) => carry[segment], obj);
  }
  function set(obj, path, value) {
    if (typeof path === 'string') path = path.split('.');
    if (path.length === 1) obj[path[0]] = value;
    else if (path.length === 0) throw error;
    else {
      if (obj[path[0]]) return set(obj[path[0]], path.slice(1), value);
      else {
        obj[path[0]] = {};
        return set(obj[path[0]], path.slice(1), value);
      }
    }
  }
  var magics = {};
  function magic(name, callback) {
    magics[name] = callback;
  }
  function injectMagics(obj, el) {
    Object.entries(magics).forEach(([name, callback]) => {
      let memoizedUtilities = null;
      function getUtilities() {
        if (memoizedUtilities) {
          return memoizedUtilities;
        } else {
          let [utilities, cleanup2] = getElementBoundUtilities(el);
          memoizedUtilities = { interceptor, ...utilities };
          onElRemoved(el, cleanup2);
          return memoizedUtilities;
        }
      }
      Object.defineProperty(obj, `$${name}`, {
        get() {
          return callback(el, getUtilities());
        },
        enumerable: false,
      });
    });
    return obj;
  }
  function tryCatch(el, expression, callback, ...args) {
    try {
      return callback(...args);
    } catch (e) {
      handleError(e, el, expression);
    }
  }
  function handleError(error2, el, expression = void 0) {
    error2 = Object.assign(error2 ?? { message: 'No error message given.' }, {
      el,
      expression,
    });
    console.warn(
      `Alpine Expression Error: ${error2.message}

${expression ? 'Expression: "' + expression + '"\n\n' : ''}`,
      el,
    );
    setTimeout(() => {
      throw error2;
    }, 0);
  }
  var shouldAutoEvaluateFunctions = true;
  function dontAutoEvaluateFunctions(callback) {
    let cache = shouldAutoEvaluateFunctions;
    shouldAutoEvaluateFunctions = false;
    let result = callback();
    shouldAutoEvaluateFunctions = cache;
    return result;
  }
  function evaluate(el, expression, extras = {}) {
    let result;
    evaluateLater(el, expression)((value) => (result = value), extras);
    return result;
  }
  function evaluateLater(...args) {
    return theEvaluatorFunction(...args);
  }
  var theEvaluatorFunction = normalEvaluator;
  function setEvaluator(newEvaluator) {
    theEvaluatorFunction = newEvaluator;
  }
  function normalEvaluator(el, expression) {
    let overriddenMagics = {};
    injectMagics(overriddenMagics, el);
    let dataStack = [overriddenMagics, ...closestDataStack(el)];
    let evaluator =
      typeof expression === 'function'
        ? generateEvaluatorFromFunction(dataStack, expression)
        : generateEvaluatorFromString(dataStack, expression, el);
    return tryCatch.bind(null, el, expression, evaluator);
  }
  function generateEvaluatorFromFunction(dataStack, func) {
    return (receiver = () => {}, { scope: scope2 = {}, params = [] } = {}) => {
      let result = func.apply(mergeProxies([scope2, ...dataStack]), params);
      runIfTypeOfFunction(receiver, result);
    };
  }
  var evaluatorMemo = {};
  function generateFunctionFromString(expression, el) {
    if (evaluatorMemo[expression]) {
      return evaluatorMemo[expression];
    }
    let AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    let rightSideSafeExpression =
      /^[\n\s]*if.*\(.*\)/.test(expression.trim()) ||
      /^(let|const)\s/.test(expression.trim())
        ? `(async()=>{ ${expression} })()`
        : expression;
    const safeAsyncFunction = () => {
      try {
        let func2 = new AsyncFunction(
          ['__self', 'scope'],
          `with (scope) { __self.result = ${rightSideSafeExpression} }; __self.finished = true; return __self.result;`,
        );
        Object.defineProperty(func2, 'name', {
          value: `[Alpine] ${expression}`,
        });
        return func2;
      } catch (error2) {
        handleError(error2, el, expression);
        return Promise.resolve();
      }
    };
    let func = safeAsyncFunction();
    evaluatorMemo[expression] = func;
    return func;
  }
  function generateEvaluatorFromString(dataStack, expression, el) {
    let func = generateFunctionFromString(expression, el);
    return (receiver = () => {}, { scope: scope2 = {}, params = [] } = {}) => {
      func.result = void 0;
      func.finished = false;
      let completeScope = mergeProxies([scope2, ...dataStack]);
      if (typeof func === 'function') {
        let promise = func(func, completeScope).catch((error2) =>
          handleError(error2, el, expression),
        );
        if (func.finished) {
          runIfTypeOfFunction(receiver, func.result, completeScope, params, el);
          func.result = void 0;
        } else {
          promise
            .then((result) => {
              runIfTypeOfFunction(receiver, result, completeScope, params, el);
            })
            .catch((error2) => handleError(error2, el, expression))
            .finally(() => (func.result = void 0));
        }
      }
    };
  }
  function runIfTypeOfFunction(receiver, value, scope2, params, el) {
    if (shouldAutoEvaluateFunctions && typeof value === 'function') {
      let result = value.apply(scope2, params);
      if (result instanceof Promise) {
        result
          .then((i) => runIfTypeOfFunction(receiver, i, scope2, params))
          .catch((error2) => handleError(error2, el, value));
      } else {
        receiver(result);
      }
    } else if (typeof value === 'object' && value instanceof Promise) {
      value.then((i) => receiver(i));
    } else {
      receiver(value);
    }
  }
  var prefixAsString = 'x-';
  function prefix(subject = '') {
    return prefixAsString + subject;
  }
  function setPrefix(newPrefix) {
    prefixAsString = newPrefix;
  }
  var directiveHandlers = {};
  function directive(name, callback) {
    directiveHandlers[name] = callback;
    return {
      before(directive2) {
        if (!directiveHandlers[directive2]) {
          console.warn(
            String.raw`Cannot find directive \`${directive2}\`. \`${name}\` will use the default order of execution`,
          );
          return;
        }
        const pos = directiveOrder.indexOf(directive2);
        directiveOrder.splice(
          pos >= 0 ? pos : directiveOrder.indexOf('DEFAULT'),
          0,
          name,
        );
      },
    };
  }
  function directives(el, attributes, originalAttributeOverride) {
    attributes = Array.from(attributes);
    if (el._x_virtualDirectives) {
      let vAttributes = Object.entries(el._x_virtualDirectives).map(
        ([name, value]) => ({ name, value }),
      );
      let staticAttributes = attributesOnly(vAttributes);
      vAttributes = vAttributes.map((attribute) => {
        if (staticAttributes.find((attr) => attr.name === attribute.name)) {
          return {
            name: `x-bind:${attribute.name}`,
            value: `"${attribute.value}"`,
          };
        }
        return attribute;
      });
      attributes = attributes.concat(vAttributes);
    }
    let transformedAttributeMap = {};
    let directives2 = attributes
      .map(
        toTransformedAttributes(
          (newName, oldName) => (transformedAttributeMap[newName] = oldName),
        ),
      )
      .filter(outNonAlpineAttributes)
      .map(
        toParsedDirectives(transformedAttributeMap, originalAttributeOverride),
      )
      .sort(byPriority);
    return directives2.map((directive2) => {
      return getDirectiveHandler(el, directive2);
    });
  }
  function attributesOnly(attributes) {
    return Array.from(attributes)
      .map(toTransformedAttributes())
      .filter((attr) => !outNonAlpineAttributes(attr));
  }
  var isDeferringHandlers = false;
  var directiveHandlerStacks = /* @__PURE__ */ new Map();
  var currentHandlerStackKey = Symbol();
  function deferHandlingDirectives(callback) {
    isDeferringHandlers = true;
    let key = Symbol();
    currentHandlerStackKey = key;
    directiveHandlerStacks.set(key, []);
    let flushHandlers = () => {
      while (directiveHandlerStacks.get(key).length)
        directiveHandlerStacks.get(key).shift()();
      directiveHandlerStacks.delete(key);
    };
    let stopDeferring = () => {
      isDeferringHandlers = false;
      flushHandlers();
    };
    callback(flushHandlers);
    stopDeferring();
  }
  function getElementBoundUtilities(el) {
    let cleanups = [];
    let cleanup2 = (callback) => cleanups.push(callback);
    let [effect3, cleanupEffect] = elementBoundEffect(el);
    cleanups.push(cleanupEffect);
    let utilities = {
      Alpine: alpine_default,
      effect: effect3,
      cleanup: cleanup2,
      evaluateLater: evaluateLater.bind(evaluateLater, el),
      evaluate: evaluate.bind(evaluate, el),
    };
    let doCleanup = () => cleanups.forEach((i) => i());
    return [utilities, doCleanup];
  }
  function getDirectiveHandler(el, directive2) {
    let noop3 = () => {};
    let handler4 = directiveHandlers[directive2.type] || noop3;
    let [utilities, cleanup2] = getElementBoundUtilities(el);
    onAttributeRemoved(el, directive2.original, cleanup2);
    let fullHandler = () => {
      if (el._x_ignore || el._x_ignoreSelf) return;
      handler4.inline && handler4.inline(el, directive2, utilities);
      handler4 = handler4.bind(handler4, el, directive2, utilities);
      isDeferringHandlers
        ? directiveHandlerStacks.get(currentHandlerStackKey).push(handler4)
        : handler4();
    };
    fullHandler.runCleanups = cleanup2;
    return fullHandler;
  }
  var startingWith =
    (subject, replacement) =>
    ({ name, value }) => {
      if (name.startsWith(subject)) name = name.replace(subject, replacement);
      return { name, value };
    };
  var into = (i) => i;
  function toTransformedAttributes(callback = () => {}) {
    return ({ name, value }) => {
      let { name: newName, value: newValue } = attributeTransformers.reduce(
        (carry, transform) => {
          return transform(carry);
        },
        { name, value },
      );
      if (newName !== name) callback(newName, name);
      return { name: newName, value: newValue };
    };
  }
  var attributeTransformers = [];
  function mapAttributes(callback) {
    attributeTransformers.push(callback);
  }
  function outNonAlpineAttributes({ name }) {
    return alpineAttributeRegex().test(name);
  }
  var alpineAttributeRegex = () => new RegExp(`^${prefixAsString}([^:^.]+)\\b`);
  function toParsedDirectives(
    transformedAttributeMap,
    originalAttributeOverride,
  ) {
    return ({ name, value }) => {
      let typeMatch = name.match(alpineAttributeRegex());
      let valueMatch = name.match(/:([a-zA-Z0-9\-_:]+)/);
      let modifiers = name.match(/\.[^.\]]+(?=[^\]]*$)/g) || [];
      let original =
        originalAttributeOverride || transformedAttributeMap[name] || name;
      return {
        type: typeMatch ? typeMatch[1] : null,
        value: valueMatch ? valueMatch[1] : null,
        modifiers: modifiers.map((i) => i.replace('.', '')),
        expression: value,
        original,
      };
    };
  }
  var DEFAULT = 'DEFAULT';
  var directiveOrder = [
    'ignore',
    'ref',
    'data',
    'id',
    'anchor',
    'bind',
    'init',
    'for',
    'model',
    'modelable',
    'transition',
    'show',
    'if',
    DEFAULT,
    'teleport',
  ];
  function byPriority(a, b) {
    let typeA = directiveOrder.indexOf(a.type) === -1 ? DEFAULT : a.type;
    let typeB = directiveOrder.indexOf(b.type) === -1 ? DEFAULT : b.type;
    return directiveOrder.indexOf(typeA) - directiveOrder.indexOf(typeB);
  }
  var tickStack = [];
  var isHolding = false;
  function nextTick(callback = () => {}) {
    queueMicrotask(() => {
      isHolding ||
        setTimeout(() => {
          releaseNextTicks();
        });
    });
    return new Promise((res) => {
      tickStack.push(() => {
        callback();
        res();
      });
    });
  }
  function releaseNextTicks() {
    isHolding = false;
    while (tickStack.length) tickStack.shift()();
  }
  function holdNextTicks() {
    isHolding = true;
  }
  function setClasses(el, value) {
    if (Array.isArray(value)) {
      return setClassesFromString(el, value.join(' '));
    } else if (typeof value === 'object' && value !== null) {
      return setClassesFromObject(el, value);
    } else if (typeof value === 'function') {
      return setClasses(el, value());
    }
    return setClassesFromString(el, value);
  }
  function setClassesFromString(el, classString) {
    let split = (classString2) => classString2.split(' ').filter(Boolean);
    let missingClasses = (classString2) =>
      classString2
        .split(' ')
        .filter((i) => !el.classList.contains(i))
        .filter(Boolean);
    let addClassesAndReturnUndo = (classes) => {
      el.classList.add(...classes);
      return () => {
        el.classList.remove(...classes);
      };
    };
    classString = classString === true ? (classString = '') : classString || '';
    return addClassesAndReturnUndo(missingClasses(classString));
  }
  function setClassesFromObject(el, classObject) {
    let split = (classString) => classString.split(' ').filter(Boolean);
    let forAdd = Object.entries(classObject)
      .flatMap(([classString, bool]) => (bool ? split(classString) : false))
      .filter(Boolean);
    let forRemove = Object.entries(classObject)
      .flatMap(([classString, bool]) => (!bool ? split(classString) : false))
      .filter(Boolean);
    let added = [];
    let removed = [];
    forRemove.forEach((i) => {
      if (el.classList.contains(i)) {
        el.classList.remove(i);
        removed.push(i);
      }
    });
    forAdd.forEach((i) => {
      if (!el.classList.contains(i)) {
        el.classList.add(i);
        added.push(i);
      }
    });
    return () => {
      removed.forEach((i) => el.classList.add(i));
      added.forEach((i) => el.classList.remove(i));
    };
  }
  function setStyles(el, value) {
    if (typeof value === 'object' && value !== null) {
      return setStylesFromObject(el, value);
    }
    return setStylesFromString(el, value);
  }
  function setStylesFromObject(el, value) {
    let previousStyles = {};
    Object.entries(value).forEach(([key, value2]) => {
      previousStyles[key] = el.style[key];
      if (!key.startsWith('--')) {
        key = kebabCase(key);
      }
      el.style.setProperty(key, value2);
    });
    setTimeout(() => {
      if (el.style.length === 0) {
        el.removeAttribute('style');
      }
    });
    return () => {
      setStyles(el, previousStyles);
    };
  }
  function setStylesFromString(el, value) {
    let cache = el.getAttribute('style', value);
    el.setAttribute('style', value);
    return () => {
      el.setAttribute('style', cache || '');
    };
  }
  function kebabCase(subject) {
    return subject.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
  function once(callback, fallback = () => {}) {
    let called = false;
    return function () {
      if (!called) {
        called = true;
        callback.apply(this, arguments);
      } else {
        fallback.apply(this, arguments);
      }
    };
  }
  directive(
    'transition',
    (el, { value, modifiers, expression }, { evaluate: evaluate2 }) => {
      if (typeof expression === 'function') expression = evaluate2(expression);
      if (expression === false) return;
      if (!expression || typeof expression === 'boolean') {
        registerTransitionsFromHelper(el, modifiers, value);
      } else {
        registerTransitionsFromClassString(el, expression, value);
      }
    },
  );
  function registerTransitionsFromClassString(el, classString, stage) {
    registerTransitionObject(el, setClasses, '');
    let directiveStorageMap = {
      enter: (classes) => {
        el._x_transition.enter.during = classes;
      },
      'enter-start': (classes) => {
        el._x_transition.enter.start = classes;
      },
      'enter-end': (classes) => {
        el._x_transition.enter.end = classes;
      },
      leave: (classes) => {
        el._x_transition.leave.during = classes;
      },
      'leave-start': (classes) => {
        el._x_transition.leave.start = classes;
      },
      'leave-end': (classes) => {
        el._x_transition.leave.end = classes;
      },
    };
    directiveStorageMap[stage](classString);
  }
  function registerTransitionsFromHelper(el, modifiers, stage) {
    registerTransitionObject(el, setStyles);
    let doesntSpecify =
      !modifiers.includes('in') && !modifiers.includes('out') && !stage;
    let transitioningIn =
      doesntSpecify || modifiers.includes('in') || ['enter'].includes(stage);
    let transitioningOut =
      doesntSpecify || modifiers.includes('out') || ['leave'].includes(stage);
    if (modifiers.includes('in') && !doesntSpecify) {
      modifiers = modifiers.filter(
        (i, index) => index < modifiers.indexOf('out'),
      );
    }
    if (modifiers.includes('out') && !doesntSpecify) {
      modifiers = modifiers.filter(
        (i, index) => index > modifiers.indexOf('out'),
      );
    }
    let wantsAll =
      !modifiers.includes('opacity') && !modifiers.includes('scale');
    let wantsOpacity = wantsAll || modifiers.includes('opacity');
    let wantsScale = wantsAll || modifiers.includes('scale');
    let opacityValue = wantsOpacity ? 0 : 1;
    let scaleValue = wantsScale
      ? modifierValue(modifiers, 'scale', 95) / 100
      : 1;
    let delay = modifierValue(modifiers, 'delay', 0) / 1e3;
    let origin = modifierValue(modifiers, 'origin', 'center');
    let property = 'opacity, transform';
    let durationIn = modifierValue(modifiers, 'duration', 150) / 1e3;
    let durationOut = modifierValue(modifiers, 'duration', 75) / 1e3;
    let easing = `cubic-bezier(0.4, 0.0, 0.2, 1)`;
    if (transitioningIn) {
      el._x_transition.enter.during = {
        transformOrigin: origin,
        transitionDelay: `${delay}s`,
        transitionProperty: property,
        transitionDuration: `${durationIn}s`,
        transitionTimingFunction: easing,
      };
      el._x_transition.enter.start = {
        opacity: opacityValue,
        transform: `scale(${scaleValue})`,
      };
      el._x_transition.enter.end = {
        opacity: 1,
        transform: `scale(1)`,
      };
    }
    if (transitioningOut) {
      el._x_transition.leave.during = {
        transformOrigin: origin,
        transitionDelay: `${delay}s`,
        transitionProperty: property,
        transitionDuration: `${durationOut}s`,
        transitionTimingFunction: easing,
      };
      el._x_transition.leave.start = {
        opacity: 1,
        transform: `scale(1)`,
      };
      el._x_transition.leave.end = {
        opacity: opacityValue,
        transform: `scale(${scaleValue})`,
      };
    }
  }
  function registerTransitionObject(el, setFunction, defaultValue = {}) {
    if (!el._x_transition)
      el._x_transition = {
        enter: { during: defaultValue, start: defaultValue, end: defaultValue },
        leave: { during: defaultValue, start: defaultValue, end: defaultValue },
        in(before2 = () => {}, after = () => {}) {
          transition(
            el,
            setFunction,
            {
              during: this.enter.during,
              start: this.enter.start,
              end: this.enter.end,
            },
            before2,
            after,
          );
        },
        out(before2 = () => {}, after = () => {}) {
          transition(
            el,
            setFunction,
            {
              during: this.leave.during,
              start: this.leave.start,
              end: this.leave.end,
            },
            before2,
            after,
          );
        },
      };
  }
  window.Element.prototype._x_toggleAndCascadeWithTransitions = function (
    el,
    value,
    show,
    hide,
  ) {
    const nextTick22 =
      document.visibilityState === 'visible'
        ? requestAnimationFrame
        : setTimeout;
    let clickAwayCompatibleShow = () => nextTick22(show);
    if (value) {
      if (
        el._x_transition &&
        (el._x_transition.enter || el._x_transition.leave)
      ) {
        el._x_transition.enter &&
        (Object.entries(el._x_transition.enter.during).length ||
          Object.entries(el._x_transition.enter.start).length ||
          Object.entries(el._x_transition.enter.end).length)
          ? el._x_transition.in(show)
          : clickAwayCompatibleShow();
      } else {
        el._x_transition
          ? el._x_transition.in(show)
          : clickAwayCompatibleShow();
      }
      return;
    }
    el._x_hidePromise = el._x_transition
      ? new Promise((resolve, reject) => {
          el._x_transition.out(
            () => {},
            () => resolve(hide),
          );
          el._x_transitioning &&
            el._x_transitioning.beforeCancel(() =>
              reject({ isFromCancelledTransition: true }),
            );
        })
      : Promise.resolve(hide);
    queueMicrotask(() => {
      let closest2 = closestHide(el);
      if (closest2) {
        if (!closest2._x_hideChildren) closest2._x_hideChildren = [];
        closest2._x_hideChildren.push(el);
      } else {
        nextTick22(() => {
          let hideAfterChildren = (el2) => {
            let carry = Promise.all([
              el2._x_hidePromise,
              ...(el2._x_hideChildren || []).map(hideAfterChildren),
            ]).then(([i]) => i());
            delete el2._x_hidePromise;
            delete el2._x_hideChildren;
            return carry;
          };
          hideAfterChildren(el).catch((e) => {
            if (!e.isFromCancelledTransition) throw e;
          });
        });
      }
    });
  };
  function closestHide(el) {
    let parent = el.parentNode;
    if (!parent) return;
    return parent._x_hidePromise ? parent : closestHide(parent);
  }
  function transition(
    el,
    setFunction,
    { during, start: start22, end } = {},
    before2 = () => {},
    after = () => {},
  ) {
    if (el._x_transitioning) el._x_transitioning.cancel();
    if (
      Object.keys(during).length === 0 &&
      Object.keys(start22).length === 0 &&
      Object.keys(end).length === 0
    ) {
      before2();
      after();
      return;
    }
    let undoStart, undoDuring, undoEnd;
    performTransition(el, {
      start() {
        undoStart = setFunction(el, start22);
      },
      during() {
        undoDuring = setFunction(el, during);
      },
      before: before2,
      end() {
        undoStart();
        undoEnd = setFunction(el, end);
      },
      after,
      cleanup() {
        undoDuring();
        undoEnd();
      },
    });
  }
  function performTransition(el, stages) {
    let interrupted, reachedBefore, reachedEnd;
    let finish2 = once(() => {
      mutateDom(() => {
        interrupted = true;
        if (!reachedBefore) stages.before();
        if (!reachedEnd) {
          stages.end();
          releaseNextTicks();
        }
        stages.after();
        if (el.isConnected) stages.cleanup();
        delete el._x_transitioning;
      });
    });
    el._x_transitioning = {
      beforeCancels: [],
      beforeCancel(callback) {
        this.beforeCancels.push(callback);
      },
      cancel: once(function () {
        while (this.beforeCancels.length) {
          this.beforeCancels.shift()();
        }
        finish2();
      }),
      finish: finish2,
    };
    mutateDom(() => {
      stages.start();
      stages.during();
    });
    holdNextTicks();
    requestAnimationFrame(() => {
      if (interrupted) return;
      let duration =
        Number(
          getComputedStyle(el)
            .transitionDuration.replace(/,.*/, '')
            .replace('s', ''),
        ) * 1e3;
      let delay =
        Number(
          getComputedStyle(el)
            .transitionDelay.replace(/,.*/, '')
            .replace('s', ''),
        ) * 1e3;
      if (duration === 0)
        duration =
          Number(getComputedStyle(el).animationDuration.replace('s', '')) * 1e3;
      mutateDom(() => {
        stages.before();
      });
      reachedBefore = true;
      requestAnimationFrame(() => {
        if (interrupted) return;
        mutateDom(() => {
          stages.end();
        });
        releaseNextTicks();
        setTimeout(el._x_transitioning.finish, duration + delay);
        reachedEnd = true;
      });
    });
  }
  function modifierValue(modifiers, key, fallback) {
    if (modifiers.indexOf(key) === -1) return fallback;
    const rawValue = modifiers[modifiers.indexOf(key) + 1];
    if (!rawValue) return fallback;
    if (key === 'scale') {
      if (isNaN(rawValue)) return fallback;
    }
    if (key === 'duration' || key === 'delay') {
      let match = rawValue.match(/([0-9]+)ms/);
      if (match) return match[1];
    }
    if (key === 'origin') {
      if (
        ['top', 'right', 'left', 'center', 'bottom'].includes(
          modifiers[modifiers.indexOf(key) + 2],
        )
      ) {
        return [rawValue, modifiers[modifiers.indexOf(key) + 2]].join(' ');
      }
    }
    return rawValue;
  }
  var isCloning = false;
  function skipDuringClone(callback, fallback = () => {}) {
    return (...args) => (isCloning ? fallback(...args) : callback(...args));
  }
  function onlyDuringClone(callback) {
    return (...args) => isCloning && callback(...args);
  }
  var interceptors = [];
  function interceptClone(callback) {
    interceptors.push(callback);
  }
  function cloneNode(from, to) {
    interceptors.forEach((i) => i(from, to));
    isCloning = true;
    dontRegisterReactiveSideEffects(() => {
      initTree(to, (el, callback) => {
        callback(el, () => {});
      });
    });
    isCloning = false;
  }
  var isCloningLegacy = false;
  function clone(oldEl, newEl) {
    if (!newEl._x_dataStack) newEl._x_dataStack = oldEl._x_dataStack;
    isCloning = true;
    isCloningLegacy = true;
    dontRegisterReactiveSideEffects(() => {
      cloneTree(newEl);
    });
    isCloning = false;
    isCloningLegacy = false;
  }
  function cloneTree(el) {
    let hasRunThroughFirstEl = false;
    let shallowWalker = (el2, callback) => {
      walk(el2, (el3, skip) => {
        if (hasRunThroughFirstEl && isRoot(el3)) return skip();
        hasRunThroughFirstEl = true;
        callback(el3, skip);
      });
    };
    initTree(el, shallowWalker);
  }
  function dontRegisterReactiveSideEffects(callback) {
    let cache = effect;
    overrideEffect((callback2, el) => {
      let storedEffect = cache(callback2);
      release(storedEffect);
      return () => {};
    });
    callback();
    overrideEffect(cache);
  }
  function bind(el, name, value, modifiers = []) {
    if (!el._x_bindings) el._x_bindings = reactive({});
    el._x_bindings[name] = value;
    name = modifiers.includes('camel') ? camelCase(name) : name;
    switch (name) {
      case 'value':
        bindInputValue(el, value);
        break;
      case 'style':
        bindStyles(el, value);
        break;
      case 'class':
        bindClasses(el, value);
        break;
      case 'selected':
      case 'checked':
        bindAttributeAndProperty(el, name, value);
        break;
      default:
        bindAttribute(el, name, value);
        break;
    }
  }
  function bindInputValue(el, value) {
    if (el.type === 'radio') {
      if (el.attributes.value === void 0) {
        el.value = value;
      }
      if (window.fromModel) {
        if (typeof value === 'boolean') {
          el.checked = safeParseBoolean(el.value) === value;
        } else {
          el.checked = checkedAttrLooseCompare(el.value, value);
        }
      }
    } else if (el.type === 'checkbox') {
      if (Number.isInteger(value)) {
        el.value = value;
      } else if (
        !Array.isArray(value) &&
        typeof value !== 'boolean' &&
        ![null, void 0].includes(value)
      ) {
        el.value = String(value);
      } else {
        if (Array.isArray(value)) {
          el.checked = value.some((val) =>
            checkedAttrLooseCompare(val, el.value),
          );
        } else {
          el.checked = !!value;
        }
      }
    } else if (el.tagName === 'SELECT') {
      updateSelect(el, value);
    } else {
      if (el.value === value) return;
      el.value = value === void 0 ? '' : value;
    }
  }
  function bindClasses(el, value) {
    if (el._x_undoAddedClasses) el._x_undoAddedClasses();
    el._x_undoAddedClasses = setClasses(el, value);
  }
  function bindStyles(el, value) {
    if (el._x_undoAddedStyles) el._x_undoAddedStyles();
    el._x_undoAddedStyles = setStyles(el, value);
  }
  function bindAttributeAndProperty(el, name, value) {
    bindAttribute(el, name, value);
    setPropertyIfChanged(el, name, value);
  }
  function bindAttribute(el, name, value) {
    if (
      [null, void 0, false].includes(value) &&
      attributeShouldntBePreservedIfFalsy(name)
    ) {
      el.removeAttribute(name);
    } else {
      if (isBooleanAttr(name)) value = name;
      setIfChanged(el, name, value);
    }
  }
  function setIfChanged(el, attrName, value) {
    if (el.getAttribute(attrName) != value) {
      el.setAttribute(attrName, value);
    }
  }
  function setPropertyIfChanged(el, propName, value) {
    if (el[propName] !== value) {
      el[propName] = value;
    }
  }
  function updateSelect(el, value) {
    const arrayWrappedValue = [].concat(value).map((value2) => {
      return value2 + '';
    });
    Array.from(el.options).forEach((option) => {
      option.selected = arrayWrappedValue.includes(option.value);
    });
  }
  function camelCase(subject) {
    return subject
      .toLowerCase()
      .replace(/-(\w)/g, (match, char) => char.toUpperCase());
  }
  function checkedAttrLooseCompare(valueA, valueB) {
    return valueA == valueB;
  }
  function safeParseBoolean(rawValue) {
    if ([1, '1', 'true', 'on', 'yes', true].includes(rawValue)) {
      return true;
    }
    if ([0, '0', 'false', 'off', 'no', false].includes(rawValue)) {
      return false;
    }
    return rawValue ? Boolean(rawValue) : null;
  }
  function isBooleanAttr(attrName) {
    const booleanAttributes = [
      'disabled',
      'checked',
      'required',
      'readonly',
      'open',
      'selected',
      'autofocus',
      'itemscope',
      'multiple',
      'novalidate',
      'allowfullscreen',
      'allowpaymentrequest',
      'formnovalidate',
      'autoplay',
      'controls',
      'loop',
      'muted',
      'playsinline',
      'default',
      'ismap',
      'reversed',
      'async',
      'defer',
      'nomodule',
    ];
    return booleanAttributes.includes(attrName);
  }
  function attributeShouldntBePreservedIfFalsy(name) {
    return ![
      'aria-pressed',
      'aria-checked',
      'aria-expanded',
      'aria-selected',
    ].includes(name);
  }
  function getBinding(el, name, fallback) {
    if (el._x_bindings && el._x_bindings[name] !== void 0)
      return el._x_bindings[name];
    return getAttributeBinding(el, name, fallback);
  }
  function extractProp(el, name, fallback, extract = true) {
    if (el._x_bindings && el._x_bindings[name] !== void 0)
      return el._x_bindings[name];
    if (el._x_inlineBindings && el._x_inlineBindings[name] !== void 0) {
      let binding = el._x_inlineBindings[name];
      binding.extract = extract;
      return dontAutoEvaluateFunctions(() => {
        return evaluate(el, binding.expression);
      });
    }
    return getAttributeBinding(el, name, fallback);
  }
  function getAttributeBinding(el, name, fallback) {
    let attr = el.getAttribute(name);
    if (attr === null)
      return typeof fallback === 'function' ? fallback() : fallback;
    if (attr === '') return true;
    if (isBooleanAttr(name)) {
      return !![name, 'true'].includes(attr);
    }
    return attr;
  }
  function debounce(func, wait) {
    var timeout;
    return function () {
      var context = this,
        args = arguments;
      var later = function () {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  function throttle(func, limit) {
    let inThrottle;
    return function () {
      let context = this,
        args = arguments;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
  function entangle(
    { get: outerGet, set: outerSet },
    { get: innerGet, set: innerSet },
  ) {
    let firstRun = true;
    let outerHash;
    let innerHash;
    let reference = effect(() => {
      let outer = outerGet();
      let inner = innerGet();
      if (firstRun) {
        innerSet(cloneIfObject(outer));
        firstRun = false;
      } else {
        let outerHashLatest = JSON.stringify(outer);
        let innerHashLatest = JSON.stringify(inner);
        if (outerHashLatest !== outerHash) {
          innerSet(cloneIfObject(outer));
        } else if (outerHashLatest !== innerHashLatest) {
          outerSet(cloneIfObject(inner));
        } else {
        }
      }
      outerHash = JSON.stringify(outerGet());
      innerHash = JSON.stringify(innerGet());
    });
    return () => {
      release(reference);
    };
  }
  function cloneIfObject(value) {
    return typeof value === 'object'
      ? JSON.parse(JSON.stringify(value))
      : value;
  }
  function plugin(callback) {
    let callbacks = Array.isArray(callback) ? callback : [callback];
    callbacks.forEach((i) => i(alpine_default));
  }
  var stores = {};
  var isReactive = false;
  function store(name, value) {
    if (!isReactive) {
      stores = reactive(stores);
      isReactive = true;
    }
    if (value === void 0) {
      return stores[name];
    }
    stores[name] = value;
    if (
      typeof value === 'object' &&
      value !== null &&
      value.hasOwnProperty('init') &&
      typeof value.init === 'function'
    ) {
      stores[name].init();
    }
    initInterceptors2(stores[name]);
  }
  function getStores() {
    return stores;
  }
  var binds = {};
  function bind2(name, bindings) {
    let getBindings =
      typeof bindings !== 'function' ? () => bindings : bindings;
    if (name instanceof Element) {
      return applyBindingsObject(name, getBindings());
    } else {
      binds[name] = getBindings;
    }
    return () => {};
  }
  function injectBindingProviders(obj) {
    Object.entries(binds).forEach(([name, callback]) => {
      Object.defineProperty(obj, name, {
        get() {
          return (...args) => {
            return callback(...args);
          };
        },
      });
    });
    return obj;
  }
  function applyBindingsObject(el, obj, original) {
    let cleanupRunners = [];
    while (cleanupRunners.length) cleanupRunners.pop()();
    let attributes = Object.entries(obj).map(([name, value]) => ({
      name,
      value,
    }));
    let staticAttributes = attributesOnly(attributes);
    attributes = attributes.map((attribute) => {
      if (staticAttributes.find((attr) => attr.name === attribute.name)) {
        return {
          name: `x-bind:${attribute.name}`,
          value: `"${attribute.value}"`,
        };
      }
      return attribute;
    });
    directives(el, attributes, original).map((handle) => {
      cleanupRunners.push(handle.runCleanups);
      handle();
    });
    return () => {
      while (cleanupRunners.length) cleanupRunners.pop()();
    };
  }
  var datas = {};
  function data(name, callback) {
    datas[name] = callback;
  }
  function injectDataProviders(obj, context) {
    Object.entries(datas).forEach(([name, callback]) => {
      Object.defineProperty(obj, name, {
        get() {
          return (...args) => {
            return callback.bind(context)(...args);
          };
        },
        enumerable: false,
      });
    });
    return obj;
  }
  var Alpine = {
    get reactive() {
      return reactive;
    },
    get release() {
      return release;
    },
    get effect() {
      return effect;
    },
    get raw() {
      return raw;
    },
    version: '3.13.8',
    flushAndStopDeferringMutations,
    dontAutoEvaluateFunctions,
    disableEffectScheduling,
    startObservingMutations,
    stopObservingMutations,
    setReactivityEngine,
    onAttributeRemoved,
    onAttributesAdded,
    closestDataStack,
    skipDuringClone,
    onlyDuringClone,
    addRootSelector,
    addInitSelector,
    interceptClone,
    addScopeToNode,
    deferMutations,
    mapAttributes,
    evaluateLater,
    interceptInit,
    setEvaluator,
    mergeProxies,
    extractProp,
    findClosest,
    onElRemoved,
    closestRoot,
    destroyTree,
    interceptor,
    transition,
    setStyles,
    mutateDom,
    directive,
    entangle,
    throttle,
    debounce,
    evaluate,
    initTree,
    nextTick,
    prefixed: prefix,
    prefix: setPrefix,
    plugin,
    magic,
    store,
    start,
    clone,
    cloneNode,
    bound: getBinding,
    $data: scope,
    watch,
    walk,
    data,
    bind: bind2,
  };
  var alpine_default = Alpine;
  function makeMap(str, expectsLowerCase) {
    const map = /* @__PURE__ */ Object.create(null);
    const list = str.split(',');
    for (let i = 0; i < list.length; i++) {
      map[list[i]] = true;
    }
    return expectsLowerCase
      ? (val) => !!map[val.toLowerCase()]
      : (val) => !!map[val];
  }
  var specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
  var isBooleanAttr2 = /* @__PURE__ */ makeMap(
    specialBooleanAttrs +
      `,async,autofocus,autoplay,controls,default,defer,disabled,hidden,loop,open,required,reversed,scoped,seamless,checked,muted,multiple,selected`,
  );
  var EMPTY_OBJ = true ? Object.freeze({}) : {};
  var EMPTY_ARR = true ? Object.freeze([]) : [];
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var hasOwn = (val, key) => hasOwnProperty.call(val, key);
  var isArray = Array.isArray;
  var isMap = (val) => toTypeString(val) === '[object Map]';
  var isString = (val) => typeof val === 'string';
  var isSymbol = (val) => typeof val === 'symbol';
  var isObject = (val) => val !== null && typeof val === 'object';
  var objectToString = Object.prototype.toString;
  var toTypeString = (value) => objectToString.call(value);
  var toRawType = (value) => {
    return toTypeString(value).slice(8, -1);
  };
  var isIntegerKey = (key) =>
    isString(key) &&
    key !== 'NaN' &&
    key[0] !== '-' &&
    '' + parseInt(key, 10) === key;
  var cacheStringFunction = (fn) => {
    const cache = /* @__PURE__ */ Object.create(null);
    return (str) => {
      const hit = cache[str];
      return hit || (cache[str] = fn(str));
    };
  };
  var camelizeRE = /-(\w)/g;
  var camelize = cacheStringFunction((str) => {
    return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''));
  });
  var hyphenateRE = /\B([A-Z])/g;
  var hyphenate = cacheStringFunction((str) =>
    str.replace(hyphenateRE, '-$1').toLowerCase(),
  );
  var capitalize = cacheStringFunction(
    (str) => str.charAt(0).toUpperCase() + str.slice(1),
  );
  var toHandlerKey = cacheStringFunction((str) =>
    str ? `on${capitalize(str)}` : ``,
  );
  var hasChanged = (value, oldValue) =>
    value !== oldValue && (value === value || oldValue === oldValue);
  var targetMap = /* @__PURE__ */ new WeakMap();
  var effectStack = [];
  var activeEffect;
  var ITERATE_KEY = Symbol(true ? 'iterate' : '');
  var MAP_KEY_ITERATE_KEY = Symbol(true ? 'Map key iterate' : '');
  function isEffect(fn) {
    return fn && fn._isEffect === true;
  }
  function effect2(fn, options = EMPTY_OBJ) {
    if (isEffect(fn)) {
      fn = fn.raw;
    }
    const effect3 = createReactiveEffect(fn, options);
    if (!options.lazy) {
      effect3();
    }
    return effect3;
  }
  function stop(effect3) {
    if (effect3.active) {
      cleanup(effect3);
      if (effect3.options.onStop) {
        effect3.options.onStop();
      }
      effect3.active = false;
    }
  }
  var uid = 0;
  function createReactiveEffect(fn, options) {
    const effect3 = function reactiveEffect() {
      if (!effect3.active) {
        return fn();
      }
      if (!effectStack.includes(effect3)) {
        cleanup(effect3);
        try {
          enableTracking();
          effectStack.push(effect3);
          activeEffect = effect3;
          return fn();
        } finally {
          effectStack.pop();
          resetTracking();
          activeEffect = effectStack[effectStack.length - 1];
        }
      }
    };
    effect3.id = uid++;
    effect3.allowRecurse = !!options.allowRecurse;
    effect3._isEffect = true;
    effect3.active = true;
    effect3.raw = fn;
    effect3.deps = [];
    effect3.options = options;
    return effect3;
  }
  function cleanup(effect3) {
    const { deps } = effect3;
    if (deps.length) {
      for (let i = 0; i < deps.length; i++) {
        deps[i].delete(effect3);
      }
      deps.length = 0;
    }
  }
  var shouldTrack = true;
  var trackStack = [];
  function pauseTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = false;
  }
  function enableTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = true;
  }
  function resetTracking() {
    const last = trackStack.pop();
    shouldTrack = last === void 0 ? true : last;
  }
  function track(target, type, key) {
    if (!shouldTrack || activeEffect === void 0) {
      return;
    }
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, (depsMap = /* @__PURE__ */ new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, (dep = /* @__PURE__ */ new Set()));
    }
    if (!dep.has(activeEffect)) {
      dep.add(activeEffect);
      activeEffect.deps.push(dep);
      if (activeEffect.options.onTrack) {
        activeEffect.options.onTrack({
          effect: activeEffect,
          target,
          type,
          key,
        });
      }
    }
  }
  function trigger(target, type, key, newValue, oldValue, oldTarget) {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
      return;
    }
    const effects = /* @__PURE__ */ new Set();
    const add2 = (effectsToAdd) => {
      if (effectsToAdd) {
        effectsToAdd.forEach((effect3) => {
          if (effect3 !== activeEffect || effect3.allowRecurse) {
            effects.add(effect3);
          }
        });
      }
    };
    if (type === 'clear') {
      depsMap.forEach(add2);
    } else if (key === 'length' && isArray(target)) {
      depsMap.forEach((dep, key2) => {
        if (key2 === 'length' || key2 >= newValue) {
          add2(dep);
        }
      });
    } else {
      if (key !== void 0) {
        add2(depsMap.get(key));
      }
      switch (type) {
        case 'add':
          if (!isArray(target)) {
            add2(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              add2(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          } else if (isIntegerKey(key)) {
            add2(depsMap.get('length'));
          }
          break;
        case 'delete':
          if (!isArray(target)) {
            add2(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              add2(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          }
          break;
        case 'set':
          if (isMap(target)) {
            add2(depsMap.get(ITERATE_KEY));
          }
          break;
      }
    }
    const run2 = (effect3) => {
      if (effect3.options.onTrigger) {
        effect3.options.onTrigger({
          effect: effect3,
          target,
          key,
          type,
          newValue,
          oldValue,
          oldTarget,
        });
      }
      if (effect3.options.scheduler) {
        effect3.options.scheduler(effect3);
      } else {
        effect3();
      }
    };
    effects.forEach(run2);
  }
  var isNonTrackableKeys = /* @__PURE__ */ makeMap(
    `__proto__,__v_isRef,__isVue`,
  );
  var builtInSymbols = new Set(
    Object.getOwnPropertyNames(Symbol)
      .map((key) => Symbol[key])
      .filter(isSymbol),
  );
  var get2 = /* @__PURE__ */ createGetter();
  var readonlyGet = /* @__PURE__ */ createGetter(true);
  var arrayInstrumentations = /* @__PURE__ */ createArrayInstrumentations();
  function createArrayInstrumentations() {
    const instrumentations = {};
    ['includes', 'indexOf', 'lastIndexOf'].forEach((key) => {
      instrumentations[key] = function (...args) {
        const arr = toRaw(this);
        for (let i = 0, l = this.length; i < l; i++) {
          track(arr, 'get', i + '');
        }
        const res = arr[key](...args);
        if (res === -1 || res === false) {
          return arr[key](...args.map(toRaw));
        } else {
          return res;
        }
      };
    });
    ['push', 'pop', 'shift', 'unshift', 'splice'].forEach((key) => {
      instrumentations[key] = function (...args) {
        pauseTracking();
        const res = toRaw(this)[key].apply(this, args);
        resetTracking();
        return res;
      };
    });
    return instrumentations;
  }
  function createGetter(isReadonly = false, shallow = false) {
    return function get3(target, key, receiver) {
      if (key === '__v_isReactive') {
        return !isReadonly;
      } else if (key === '__v_isReadonly') {
        return isReadonly;
      } else if (
        key === '__v_raw' &&
        receiver ===
          (isReadonly
            ? shallow
              ? shallowReadonlyMap
              : readonlyMap
            : shallow
            ? shallowReactiveMap
            : reactiveMap
          ).get(target)
      ) {
        return target;
      }
      const targetIsArray = isArray(target);
      if (!isReadonly && targetIsArray && hasOwn(arrayInstrumentations, key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }
      const res = Reflect.get(target, key, receiver);
      if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
        return res;
      }
      if (!isReadonly) {
        track(target, 'get', key);
      }
      if (shallow) {
        return res;
      }
      if (isRef(res)) {
        const shouldUnwrap = !targetIsArray || !isIntegerKey(key);
        return shouldUnwrap ? res.value : res;
      }
      if (isObject(res)) {
        return isReadonly ? readonly(res) : reactive2(res);
      }
      return res;
    };
  }
  var set2 = /* @__PURE__ */ createSetter();
  function createSetter(shallow = false) {
    return function set3(target, key, value, receiver) {
      let oldValue = target[key];
      if (!shallow) {
        value = toRaw(value);
        oldValue = toRaw(oldValue);
        if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
          oldValue.value = value;
          return true;
        }
      }
      const hadKey =
        isArray(target) && isIntegerKey(key)
          ? Number(key) < target.length
          : hasOwn(target, key);
      const result = Reflect.set(target, key, value, receiver);
      if (target === toRaw(receiver)) {
        if (!hadKey) {
          trigger(target, 'add', key, value);
        } else if (hasChanged(value, oldValue)) {
          trigger(target, 'set', key, value, oldValue);
        }
      }
      return result;
    };
  }
  function deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    const oldValue = target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, 'delete', key, void 0, oldValue);
    }
    return result;
  }
  function has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
      track(target, 'has', key);
    }
    return result;
  }
  function ownKeys(target) {
    track(target, 'iterate', isArray(target) ? 'length' : ITERATE_KEY);
    return Reflect.ownKeys(target);
  }
  var mutableHandlers = {
    get: get2,
    set: set2,
    deleteProperty,
    has,
    ownKeys,
  };
  var readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
      if (true) {
        console.warn(
          `Set operation on key "${String(key)}" failed: target is readonly.`,
          target,
        );
      }
      return true;
    },
    deleteProperty(target, key) {
      if (true) {
        console.warn(
          `Delete operation on key "${String(
            key,
          )}" failed: target is readonly.`,
          target,
        );
      }
      return true;
    },
  };
  var toReactive = (value) => (isObject(value) ? reactive2(value) : value);
  var toReadonly = (value) => (isObject(value) ? readonly(value) : value);
  var toShallow = (value) => value;
  var getProto = (v) => Reflect.getPrototypeOf(v);
  function get$1(target, key, isReadonly = false, isShallow = false) {
    target = target['__v_raw'];
    const rawTarget = toRaw(target);
    const rawKey = toRaw(key);
    if (key !== rawKey) {
      !isReadonly && track(rawTarget, 'get', key);
    }
    !isReadonly && track(rawTarget, 'get', rawKey);
    const { has: has2 } = getProto(rawTarget);
    const wrap3 = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
    if (has2.call(rawTarget, key)) {
      return wrap3(target.get(key));
    } else if (has2.call(rawTarget, rawKey)) {
      return wrap3(target.get(rawKey));
    } else if (target !== rawTarget) {
      target.get(key);
    }
  }
  function has$1(key, isReadonly = false) {
    const target = this['__v_raw'];
    const rawTarget = toRaw(target);
    const rawKey = toRaw(key);
    if (key !== rawKey) {
      !isReadonly && track(rawTarget, 'has', key);
    }
    !isReadonly && track(rawTarget, 'has', rawKey);
    return key === rawKey
      ? target.has(key)
      : target.has(key) || target.has(rawKey);
  }
  function size(target, isReadonly = false) {
    target = target['__v_raw'];
    !isReadonly && track(toRaw(target), 'iterate', ITERATE_KEY);
    return Reflect.get(target, 'size', target);
  }
  function add(value) {
    value = toRaw(value);
    const target = toRaw(this);
    const proto = getProto(target);
    const hadKey = proto.has.call(target, value);
    if (!hadKey) {
      target.add(value);
      trigger(target, 'add', value, value);
    }
    return this;
  }
  function set$1(key, value) {
    value = toRaw(value);
    const target = toRaw(this);
    const { has: has2, get: get3 } = getProto(target);
    let hadKey = has2.call(target, key);
    if (!hadKey) {
      key = toRaw(key);
      hadKey = has2.call(target, key);
    } else if (true) {
      checkIdentityKeys(target, has2, key);
    }
    const oldValue = get3.call(target, key);
    target.set(key, value);
    if (!hadKey) {
      trigger(target, 'add', key, value);
    } else if (hasChanged(value, oldValue)) {
      trigger(target, 'set', key, value, oldValue);
    }
    return this;
  }
  function deleteEntry(key) {
    const target = toRaw(this);
    const { has: has2, get: get3 } = getProto(target);
    let hadKey = has2.call(target, key);
    if (!hadKey) {
      key = toRaw(key);
      hadKey = has2.call(target, key);
    } else if (true) {
      checkIdentityKeys(target, has2, key);
    }
    const oldValue = get3 ? get3.call(target, key) : void 0;
    const result = target.delete(key);
    if (hadKey) {
      trigger(target, 'delete', key, void 0, oldValue);
    }
    return result;
  }
  function clear() {
    const target = toRaw(this);
    const hadItems = target.size !== 0;
    const oldTarget = true
      ? isMap(target)
        ? new Map(target)
        : new Set(target)
      : void 0;
    const result = target.clear();
    if (hadItems) {
      trigger(target, 'clear', void 0, void 0, oldTarget);
    }
    return result;
  }
  function createForEach(isReadonly, isShallow) {
    return function forEach2(callback, thisArg) {
      const observed = this;
      const target = observed['__v_raw'];
      const rawTarget = toRaw(target);
      const wrap3 = isShallow
        ? toShallow
        : isReadonly
        ? toReadonly
        : toReactive;
      !isReadonly && track(rawTarget, 'iterate', ITERATE_KEY);
      return target.forEach((value, key) => {
        return callback.call(thisArg, wrap3(value), wrap3(key), observed);
      });
    };
  }
  function createIterableMethod(method, isReadonly, isShallow) {
    return function (...args) {
      const target = this['__v_raw'];
      const rawTarget = toRaw(target);
      const targetIsMap = isMap(rawTarget);
      const isPair =
        method === 'entries' || (method === Symbol.iterator && targetIsMap);
      const isKeyOnly = method === 'keys' && targetIsMap;
      const innerIterator = target[method](...args);
      const wrap3 = isShallow
        ? toShallow
        : isReadonly
        ? toReadonly
        : toReactive;
      !isReadonly &&
        track(
          rawTarget,
          'iterate',
          isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY,
        );
      return {
        next() {
          const { value, done } = innerIterator.next();
          return done
            ? { value, done }
            : {
                value: isPair
                  ? [wrap3(value[0]), wrap3(value[1])]
                  : wrap3(value),
                done,
              };
        },
        [Symbol.iterator]() {
          return this;
        },
      };
    };
  }
  function createReadonlyMethod(type) {
    return function (...args) {
      if (true) {
        const key = args[0] ? `on key "${args[0]}" ` : ``;
        console.warn(
          `${capitalize(type)} operation ${key}failed: target is readonly.`,
          toRaw(this),
        );
      }
      return type === 'delete' ? false : this;
    };
  }
  function createInstrumentations() {
    const mutableInstrumentations2 = {
      get(key) {
        return get$1(this, key);
      },
      get size() {
        return size(this);
      },
      has: has$1,
      add,
      set: set$1,
      delete: deleteEntry,
      clear,
      forEach: createForEach(false, false),
    };
    const shallowInstrumentations2 = {
      get(key) {
        return get$1(this, key, false, true);
      },
      get size() {
        return size(this);
      },
      has: has$1,
      add,
      set: set$1,
      delete: deleteEntry,
      clear,
      forEach: createForEach(false, true),
    };
    const readonlyInstrumentations2 = {
      get(key) {
        return get$1(this, key, true);
      },
      get size() {
        return size(this, true);
      },
      has(key) {
        return has$1.call(this, key, true);
      },
      add: createReadonlyMethod('add'),
      set: createReadonlyMethod('set'),
      delete: createReadonlyMethod('delete'),
      clear: createReadonlyMethod('clear'),
      forEach: createForEach(true, false),
    };
    const shallowReadonlyInstrumentations2 = {
      get(key) {
        return get$1(this, key, true, true);
      },
      get size() {
        return size(this, true);
      },
      has(key) {
        return has$1.call(this, key, true);
      },
      add: createReadonlyMethod('add'),
      set: createReadonlyMethod('set'),
      delete: createReadonlyMethod('delete'),
      clear: createReadonlyMethod('clear'),
      forEach: createForEach(true, true),
    };
    const iteratorMethods = ['keys', 'values', 'entries', Symbol.iterator];
    iteratorMethods.forEach((method) => {
      mutableInstrumentations2[method] = createIterableMethod(
        method,
        false,
        false,
      );
      readonlyInstrumentations2[method] = createIterableMethod(
        method,
        true,
        false,
      );
      shallowInstrumentations2[method] = createIterableMethod(
        method,
        false,
        true,
      );
      shallowReadonlyInstrumentations2[method] = createIterableMethod(
        method,
        true,
        true,
      );
    });
    return [
      mutableInstrumentations2,
      readonlyInstrumentations2,
      shallowInstrumentations2,
      shallowReadonlyInstrumentations2,
    ];
  }
  var [
    mutableInstrumentations,
    readonlyInstrumentations,
    shallowInstrumentations,
    shallowReadonlyInstrumentations,
  ] = /* @__PURE__ */ createInstrumentations();
  function createInstrumentationGetter(isReadonly, shallow) {
    const instrumentations = shallow
      ? isReadonly
        ? shallowReadonlyInstrumentations
        : shallowInstrumentations
      : isReadonly
      ? readonlyInstrumentations
      : mutableInstrumentations;
    return (target, key, receiver) => {
      if (key === '__v_isReactive') {
        return !isReadonly;
      } else if (key === '__v_isReadonly') {
        return isReadonly;
      } else if (key === '__v_raw') {
        return target;
      }
      return Reflect.get(
        hasOwn(instrumentations, key) && key in target
          ? instrumentations
          : target,
        key,
        receiver,
      );
    };
  }
  var mutableCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(false, false),
  };
  var readonlyCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(true, false),
  };
  function checkIdentityKeys(target, has2, key) {
    const rawKey = toRaw(key);
    if (rawKey !== key && has2.call(target, rawKey)) {
      const type = toRawType(target);
      console.warn(
        `Reactive ${type} contains both the raw and reactive versions of the same object${
          type === `Map` ? ` as keys` : ``
        }, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`,
      );
    }
  }
  var reactiveMap = /* @__PURE__ */ new WeakMap();
  var shallowReactiveMap = /* @__PURE__ */ new WeakMap();
  var readonlyMap = /* @__PURE__ */ new WeakMap();
  var shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
  function targetTypeMap(rawType) {
    switch (rawType) {
      case 'Object':
      case 'Array':
        return 1;
      case 'Map':
      case 'Set':
      case 'WeakMap':
      case 'WeakSet':
        return 2;
      default:
        return 0;
    }
  }
  function getTargetType(value) {
    return value['__v_skip'] || !Object.isExtensible(value)
      ? 0
      : targetTypeMap(toRawType(value));
  }
  function reactive2(target) {
    if (target && target['__v_isReadonly']) {
      return target;
    }
    return createReactiveObject(
      target,
      false,
      mutableHandlers,
      mutableCollectionHandlers,
      reactiveMap,
    );
  }
  function readonly(target) {
    return createReactiveObject(
      target,
      true,
      readonlyHandlers,
      readonlyCollectionHandlers,
      readonlyMap,
    );
  }
  function createReactiveObject(
    target,
    isReadonly,
    baseHandlers,
    collectionHandlers,
    proxyMap,
  ) {
    if (!isObject(target)) {
      if (true) {
        console.warn(`value cannot be made reactive: ${String(target)}`);
      }
      return target;
    }
    if (target['__v_raw'] && !(isReadonly && target['__v_isReactive'])) {
      return target;
    }
    const existingProxy = proxyMap.get(target);
    if (existingProxy) {
      return existingProxy;
    }
    const targetType = getTargetType(target);
    if (targetType === 0) {
      return target;
    }
    const proxy = new Proxy(
      target,
      targetType === 2 ? collectionHandlers : baseHandlers,
    );
    proxyMap.set(target, proxy);
    return proxy;
  }
  function toRaw(observed) {
    return (observed && toRaw(observed['__v_raw'])) || observed;
  }
  function isRef(r) {
    return Boolean(r && r.__v_isRef === true);
  }
  magic('nextTick', () => nextTick);
  magic('dispatch', (el) => dispatch.bind(dispatch, el));
  magic(
    'watch',
    (el, { evaluateLater: evaluateLater2, cleanup: cleanup2 }) =>
      (key, callback) => {
        let evaluate2 = evaluateLater2(key);
        let getter = () => {
          let value;
          evaluate2((i) => (value = i));
          return value;
        };
        let unwatch = watch(getter, callback);
        cleanup2(unwatch);
      },
  );
  magic('store', getStores);
  magic('data', (el) => scope(el));
  magic('root', (el) => closestRoot(el));
  magic('refs', (el) => {
    if (el._x_refs_proxy) return el._x_refs_proxy;
    el._x_refs_proxy = mergeProxies(getArrayOfRefObject(el));
    return el._x_refs_proxy;
  });
  function getArrayOfRefObject(el) {
    let refObjects = [];
    findClosest(el, (i) => {
      if (i._x_refs) refObjects.push(i._x_refs);
    });
    return refObjects;
  }
  var globalIdMemo = {};
  function findAndIncrementId(name) {
    if (!globalIdMemo[name]) globalIdMemo[name] = 0;
    return ++globalIdMemo[name];
  }
  function closestIdRoot(el, name) {
    return findClosest(el, (element) => {
      if (element._x_ids && element._x_ids[name]) return true;
    });
  }
  function setIdRoot(el, name) {
    if (!el._x_ids) el._x_ids = {};
    if (!el._x_ids[name]) el._x_ids[name] = findAndIncrementId(name);
  }
  magic('id', (el, { cleanup: cleanup2 }) => (name, key = null) => {
    let cacheKey = `${name}${key ? `-${key}` : ''}`;
    return cacheIdByNameOnElement(el, cacheKey, cleanup2, () => {
      let root = closestIdRoot(el, name);
      let id = root ? root._x_ids[name] : findAndIncrementId(name);
      return key ? `${name}-${id}-${key}` : `${name}-${id}`;
    });
  });
  interceptClone((from, to) => {
    if (from._x_id) {
      to._x_id = from._x_id;
    }
  });
  function cacheIdByNameOnElement(el, cacheKey, cleanup2, callback) {
    if (!el._x_id) el._x_id = {};
    if (el._x_id[cacheKey]) return el._x_id[cacheKey];
    let output = callback();
    el._x_id[cacheKey] = output;
    cleanup2(() => {
      delete el._x_id[cacheKey];
    });
    return output;
  }
  magic('el', (el) => el);
  warnMissingPluginMagic('Focus', 'focus', 'focus');
  warnMissingPluginMagic('Persist', 'persist', 'persist');
  function warnMissingPluginMagic(name, magicName, slug) {
    magic(magicName, (el) =>
      warn(
        `You can't use [$${magicName}] without first installing the "${name}" plugin here: https://alpinejs.dev/plugins/${slug}`,
        el,
      ),
    );
  }
  directive(
    'modelable',
    (
      el,
      { expression },
      { effect: effect3, evaluateLater: evaluateLater2, cleanup: cleanup2 },
    ) => {
      let func = evaluateLater2(expression);
      let innerGet = () => {
        let result;
        func((i) => (result = i));
        return result;
      };
      let evaluateInnerSet = evaluateLater2(`${expression} = __placeholder`);
      let innerSet = (val) =>
        evaluateInnerSet(() => {}, { scope: { __placeholder: val } });
      let initialValue = innerGet();
      innerSet(initialValue);
      queueMicrotask(() => {
        if (!el._x_model) return;
        el._x_removeModelListeners['default']();
        let outerGet = el._x_model.get;
        let outerSet = el._x_model.set;
        let releaseEntanglement = entangle(
          {
            get() {
              return outerGet();
            },
            set(value) {
              outerSet(value);
            },
          },
          {
            get() {
              return innerGet();
            },
            set(value) {
              innerSet(value);
            },
          },
        );
        cleanup2(releaseEntanglement);
      });
    },
  );
  directive(
    'teleport',
    (el, { modifiers, expression }, { cleanup: cleanup2 }) => {
      if (el.tagName.toLowerCase() !== 'template')
        warn('x-teleport can only be used on a <template> tag', el);
      let target = getTarget(expression);
      let clone2 = el.content.cloneNode(true).firstElementChild;
      el._x_teleport = clone2;
      clone2._x_teleportBack = el;
      el.setAttribute('data-teleport-template', true);
      clone2.setAttribute('data-teleport-target', true);
      if (el._x_forwardEvents) {
        el._x_forwardEvents.forEach((eventName) => {
          clone2.addEventListener(eventName, (e) => {
            e.stopPropagation();
            el.dispatchEvent(new e.constructor(e.type, e));
          });
        });
      }
      addScopeToNode(clone2, {}, el);
      let placeInDom = (clone3, target2, modifiers2) => {
        if (modifiers2.includes('prepend')) {
          target2.parentNode.insertBefore(clone3, target2);
        } else if (modifiers2.includes('append')) {
          target2.parentNode.insertBefore(clone3, target2.nextSibling);
        } else {
          target2.appendChild(clone3);
        }
      };
      mutateDom(() => {
        placeInDom(clone2, target, modifiers);
        initTree(clone2);
        clone2._x_ignore = true;
      });
      el._x_teleportPutBack = () => {
        let target2 = getTarget(expression);
        mutateDom(() => {
          placeInDom(el._x_teleport, target2, modifiers);
        });
      };
      cleanup2(() => clone2.remove());
    },
  );
  var teleportContainerDuringClone = document.createElement('div');
  function getTarget(expression) {
    let target = skipDuringClone(
      () => {
        return document.querySelector(expression);
      },
      () => {
        return teleportContainerDuringClone;
      },
    )();
    if (!target)
      warn(`Cannot find x-teleport element for selector: "${expression}"`);
    return target;
  }
  var handler = () => {};
  handler.inline = (el, { modifiers }, { cleanup: cleanup2 }) => {
    modifiers.includes('self')
      ? (el._x_ignoreSelf = true)
      : (el._x_ignore = true);
    cleanup2(() => {
      modifiers.includes('self')
        ? delete el._x_ignoreSelf
        : delete el._x_ignore;
    });
  };
  directive('ignore', handler);
  directive(
    'effect',
    skipDuringClone((el, { expression }, { effect: effect3 }) => {
      effect3(evaluateLater(el, expression));
    }),
  );
  function on(el, event, modifiers, callback) {
    let listenerTarget = el;
    let handler4 = (e) => callback(e);
    let options = {};
    let wrapHandler = (callback2, wrapper) => (e) => wrapper(callback2, e);
    if (modifiers.includes('dot')) event = dotSyntax(event);
    if (modifiers.includes('camel')) event = camelCase2(event);
    if (modifiers.includes('passive')) options.passive = true;
    if (modifiers.includes('capture')) options.capture = true;
    if (modifiers.includes('window')) listenerTarget = window;
    if (modifiers.includes('document')) listenerTarget = document;
    if (modifiers.includes('debounce')) {
      let nextModifier =
        modifiers[modifiers.indexOf('debounce') + 1] || 'invalid-wait';
      let wait = isNumeric(nextModifier.split('ms')[0])
        ? Number(nextModifier.split('ms')[0])
        : 250;
      handler4 = debounce(handler4, wait);
    }
    if (modifiers.includes('throttle')) {
      let nextModifier =
        modifiers[modifiers.indexOf('throttle') + 1] || 'invalid-wait';
      let wait = isNumeric(nextModifier.split('ms')[0])
        ? Number(nextModifier.split('ms')[0])
        : 250;
      handler4 = throttle(handler4, wait);
    }
    if (modifiers.includes('prevent'))
      handler4 = wrapHandler(handler4, (next2, e) => {
        e.preventDefault();
        next2(e);
      });
    if (modifiers.includes('stop'))
      handler4 = wrapHandler(handler4, (next2, e) => {
        e.stopPropagation();
        next2(e);
      });
    if (modifiers.includes('self'))
      handler4 = wrapHandler(handler4, (next2, e) => {
        e.target === el && next2(e);
      });
    if (modifiers.includes('away') || modifiers.includes('outside')) {
      listenerTarget = document;
      handler4 = wrapHandler(handler4, (next2, e) => {
        if (el.contains(e.target)) return;
        if (e.target.isConnected === false) return;
        if (el.offsetWidth < 1 && el.offsetHeight < 1) return;
        if (el._x_isShown === false) return;
        next2(e);
      });
    }
    if (modifiers.includes('once')) {
      handler4 = wrapHandler(handler4, (next2, e) => {
        next2(e);
        listenerTarget.removeEventListener(event, handler4, options);
      });
    }
    handler4 = wrapHandler(handler4, (next2, e) => {
      if (isKeyEvent(event)) {
        if (isListeningForASpecificKeyThatHasntBeenPressed(e, modifiers)) {
          return;
        }
      }
      next2(e);
    });
    listenerTarget.addEventListener(event, handler4, options);
    return () => {
      listenerTarget.removeEventListener(event, handler4, options);
    };
  }
  function dotSyntax(subject) {
    return subject.replace(/-/g, '.');
  }
  function camelCase2(subject) {
    return subject
      .toLowerCase()
      .replace(/-(\w)/g, (match, char) => char.toUpperCase());
  }
  function isNumeric(subject) {
    return !Array.isArray(subject) && !isNaN(subject);
  }
  function kebabCase2(subject) {
    if ([' ', '_'].includes(subject)) return subject;
    return subject
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[_\s]/, '-')
      .toLowerCase();
  }
  function isKeyEvent(event) {
    return ['keydown', 'keyup'].includes(event);
  }
  function isListeningForASpecificKeyThatHasntBeenPressed(e, modifiers) {
    let keyModifiers = modifiers.filter((i) => {
      return ![
        'window',
        'document',
        'prevent',
        'stop',
        'once',
        'capture',
      ].includes(i);
    });
    if (keyModifiers.includes('debounce')) {
      let debounceIndex = keyModifiers.indexOf('debounce');
      keyModifiers.splice(
        debounceIndex,
        isNumeric(
          (keyModifiers[debounceIndex + 1] || 'invalid-wait').split('ms')[0],
        )
          ? 2
          : 1,
      );
    }
    if (keyModifiers.includes('throttle')) {
      let debounceIndex = keyModifiers.indexOf('throttle');
      keyModifiers.splice(
        debounceIndex,
        isNumeric(
          (keyModifiers[debounceIndex + 1] || 'invalid-wait').split('ms')[0],
        )
          ? 2
          : 1,
      );
    }
    if (keyModifiers.length === 0) return false;
    if (
      keyModifiers.length === 1 &&
      keyToModifiers(e.key).includes(keyModifiers[0])
    )
      return false;
    const systemKeyModifiers = ['ctrl', 'shift', 'alt', 'meta', 'cmd', 'super'];
    const selectedSystemKeyModifiers = systemKeyModifiers.filter((modifier) =>
      keyModifiers.includes(modifier),
    );
    keyModifiers = keyModifiers.filter(
      (i) => !selectedSystemKeyModifiers.includes(i),
    );
    if (selectedSystemKeyModifiers.length > 0) {
      const activelyPressedKeyModifiers = selectedSystemKeyModifiers.filter(
        (modifier) => {
          if (modifier === 'cmd' || modifier === 'super') modifier = 'meta';
          return e[`${modifier}Key`];
        },
      );
      if (
        activelyPressedKeyModifiers.length === selectedSystemKeyModifiers.length
      ) {
        if (keyToModifiers(e.key).includes(keyModifiers[0])) return false;
      }
    }
    return true;
  }
  function keyToModifiers(key) {
    if (!key) return [];
    key = kebabCase2(key);
    let modifierToKeyMap = {
      ctrl: 'control',
      slash: '/',
      space: ' ',
      spacebar: ' ',
      cmd: 'meta',
      esc: 'escape',
      up: 'arrow-up',
      down: 'arrow-down',
      left: 'arrow-left',
      right: 'arrow-right',
      period: '.',
      equal: '=',
      minus: '-',
      underscore: '_',
    };
    modifierToKeyMap[key] = key;
    return Object.keys(modifierToKeyMap)
      .map((modifier) => {
        if (modifierToKeyMap[modifier] === key) return modifier;
      })
      .filter((modifier) => modifier);
  }
  directive(
    'model',
    (el, { modifiers, expression }, { effect: effect3, cleanup: cleanup2 }) => {
      let scopeTarget = el;
      if (modifiers.includes('parent')) {
        scopeTarget = el.parentNode;
      }
      let evaluateGet = evaluateLater(scopeTarget, expression);
      let evaluateSet;
      if (typeof expression === 'string') {
        evaluateSet = evaluateLater(
          scopeTarget,
          `${expression} = __placeholder`,
        );
      } else if (
        typeof expression === 'function' &&
        typeof expression() === 'string'
      ) {
        evaluateSet = evaluateLater(
          scopeTarget,
          `${expression()} = __placeholder`,
        );
      } else {
        evaluateSet = () => {};
      }
      let getValue = () => {
        let result;
        evaluateGet((value) => (result = value));
        return isGetterSetter(result) ? result.get() : result;
      };
      let setValue = (value) => {
        let result;
        evaluateGet((value2) => (result = value2));
        if (isGetterSetter(result)) {
          result.set(value);
        } else {
          evaluateSet(() => {}, {
            scope: { __placeholder: value },
          });
        }
      };
      if (typeof expression === 'string' && el.type === 'radio') {
        mutateDom(() => {
          if (!el.hasAttribute('name')) el.setAttribute('name', expression);
        });
      }
      var event =
        el.tagName.toLowerCase() === 'select' ||
        ['checkbox', 'radio'].includes(el.type) ||
        modifiers.includes('lazy')
          ? 'change'
          : 'input';
      let removeListener = isCloning
        ? () => {}
        : on(el, event, modifiers, (e) => {
            setValue(getInputValue(el, modifiers, e, getValue()));
          });
      if (modifiers.includes('fill')) {
        if (
          [void 0, null, ''].includes(getValue()) ||
          (el.type === 'checkbox' && Array.isArray(getValue()))
        ) {
          setValue(getInputValue(el, modifiers, { target: el }, getValue()));
        }
      }
      if (!el._x_removeModelListeners) el._x_removeModelListeners = {};
      el._x_removeModelListeners['default'] = removeListener;
      cleanup2(() => el._x_removeModelListeners['default']());
      if (el.form) {
        let removeResetListener = on(el.form, 'reset', [], (e) => {
          nextTick(() => el._x_model && el._x_model.set(el.value));
        });
        cleanup2(() => removeResetListener());
      }
      el._x_model = {
        get() {
          return getValue();
        },
        set(value) {
          setValue(value);
        },
      };
      el._x_forceModelUpdate = (value) => {
        if (
          value === void 0 &&
          typeof expression === 'string' &&
          expression.match(/\./)
        )
          value = '';
        window.fromModel = true;
        mutateDom(() => bind(el, 'value', value));
        delete window.fromModel;
      };
      effect3(() => {
        let value = getValue();
        if (
          modifiers.includes('unintrusive') &&
          document.activeElement.isSameNode(el)
        )
          return;
        el._x_forceModelUpdate(value);
      });
    },
  );
  function getInputValue(el, modifiers, event, currentValue) {
    return mutateDom(() => {
      if (event instanceof CustomEvent && event.detail !== void 0)
        return event.detail !== null && event.detail !== void 0
          ? event.detail
          : event.target.value;
      else if (el.type === 'checkbox') {
        if (Array.isArray(currentValue)) {
          let newValue = null;
          if (modifiers.includes('number')) {
            newValue = safeParseNumber(event.target.value);
          } else if (modifiers.includes('boolean')) {
            newValue = safeParseBoolean(event.target.value);
          } else {
            newValue = event.target.value;
          }
          return event.target.checked
            ? currentValue.concat([newValue])
            : currentValue.filter(
                (el2) => !checkedAttrLooseCompare2(el2, newValue),
              );
        } else {
          return event.target.checked;
        }
      } else if (el.tagName.toLowerCase() === 'select' && el.multiple) {
        if (modifiers.includes('number')) {
          return Array.from(event.target.selectedOptions).map((option) => {
            let rawValue = option.value || option.text;
            return safeParseNumber(rawValue);
          });
        } else if (modifiers.includes('boolean')) {
          return Array.from(event.target.selectedOptions).map((option) => {
            let rawValue = option.value || option.text;
            return safeParseBoolean(rawValue);
          });
        }
        return Array.from(event.target.selectedOptions).map((option) => {
          return option.value || option.text;
        });
      } else {
        let newValue;
        if (el.type === 'radio') {
          if (event.target.checked) {
            newValue = event.target.value;
          } else {
            newValue = currentValue;
          }
        } else {
          newValue = event.target.value;
        }
        if (modifiers.includes('number')) {
          return safeParseNumber(newValue);
        } else if (modifiers.includes('boolean')) {
          return safeParseBoolean(newValue);
        } else if (modifiers.includes('trim')) {
          return newValue.trim();
        } else {
          return newValue;
        }
      }
    });
  }
  function safeParseNumber(rawValue) {
    let number = rawValue ? parseFloat(rawValue) : null;
    return isNumeric2(number) ? number : rawValue;
  }
  function checkedAttrLooseCompare2(valueA, valueB) {
    return valueA == valueB;
  }
  function isNumeric2(subject) {
    return !Array.isArray(subject) && !isNaN(subject);
  }
  function isGetterSetter(value) {
    return (
      value !== null &&
      typeof value === 'object' &&
      typeof value.get === 'function' &&
      typeof value.set === 'function'
    );
  }
  directive('cloak', (el) =>
    queueMicrotask(() => mutateDom(() => el.removeAttribute(prefix('cloak')))),
  );
  addInitSelector(() => `[${prefix('init')}]`);
  directive(
    'init',
    skipDuringClone((el, { expression }, { evaluate: evaluate2 }) => {
      if (typeof expression === 'string') {
        return !!expression.trim() && evaluate2(expression, {}, false);
      }
      return evaluate2(expression, {}, false);
    }),
  );
  directive(
    'text',
    (
      el,
      { expression },
      { effect: effect3, evaluateLater: evaluateLater2 },
    ) => {
      let evaluate2 = evaluateLater2(expression);
      effect3(() => {
        evaluate2((value) => {
          mutateDom(() => {
            el.textContent = value;
          });
        });
      });
    },
  );
  directive(
    'html',
    (
      el,
      { expression },
      { effect: effect3, evaluateLater: evaluateLater2 },
    ) => {
      let evaluate2 = evaluateLater2(expression);
      effect3(() => {
        evaluate2((value) => {
          mutateDom(() => {
            el.innerHTML = value;
            el._x_ignoreSelf = true;
            initTree(el);
            delete el._x_ignoreSelf;
          });
        });
      });
    },
  );
  mapAttributes(startingWith(':', into(prefix('bind:'))));
  var handler2 = (
    el,
    { value, modifiers, expression, original },
    { effect: effect3, cleanup: cleanup2 },
  ) => {
    if (!value) {
      let bindingProviders = {};
      injectBindingProviders(bindingProviders);
      let getBindings = evaluateLater(el, expression);
      getBindings(
        (bindings) => {
          applyBindingsObject(el, bindings, original);
        },
        { scope: bindingProviders },
      );
      return;
    }
    if (value === 'key') return storeKeyForXFor(el, expression);
    if (
      el._x_inlineBindings &&
      el._x_inlineBindings[value] &&
      el._x_inlineBindings[value].extract
    ) {
      return;
    }
    let evaluate2 = evaluateLater(el, expression);
    effect3(() =>
      evaluate2((result) => {
        if (
          result === void 0 &&
          typeof expression === 'string' &&
          expression.match(/\./)
        ) {
          result = '';
        }
        mutateDom(() => bind(el, value, result, modifiers));
      }),
    );
    cleanup2(() => {
      el._x_undoAddedClasses && el._x_undoAddedClasses();
      el._x_undoAddedStyles && el._x_undoAddedStyles();
    });
  };
  handler2.inline = (el, { value, modifiers, expression }) => {
    if (!value) return;
    if (!el._x_inlineBindings) el._x_inlineBindings = {};
    el._x_inlineBindings[value] = { expression, extract: false };
  };
  directive('bind', handler2);
  function storeKeyForXFor(el, expression) {
    el._x_keyExpression = expression;
  }
  addRootSelector(() => `[${prefix('data')}]`);
  directive('data', (el, { expression }, { cleanup: cleanup2 }) => {
    if (shouldSkipRegisteringDataDuringClone(el)) return;
    expression = expression === '' ? '{}' : expression;
    let magicContext = {};
    injectMagics(magicContext, el);
    let dataProviderContext = {};
    injectDataProviders(dataProviderContext, magicContext);
    let data2 = evaluate(el, expression, { scope: dataProviderContext });
    if (data2 === void 0 || data2 === true) data2 = {};
    injectMagics(data2, el);
    let reactiveData = reactive(data2);
    initInterceptors2(reactiveData);
    let undo = addScopeToNode(el, reactiveData);
    reactiveData['init'] && evaluate(el, reactiveData['init']);
    cleanup2(() => {
      reactiveData['destroy'] && evaluate(el, reactiveData['destroy']);
      undo();
    });
  });
  interceptClone((from, to) => {
    if (from._x_dataStack) {
      to._x_dataStack = from._x_dataStack;
      to.setAttribute('data-has-alpine-state', true);
    }
  });
  function shouldSkipRegisteringDataDuringClone(el) {
    if (!isCloning) return false;
    if (isCloningLegacy) return true;
    return el.hasAttribute('data-has-alpine-state');
  }
  directive('show', (el, { modifiers, expression }, { effect: effect3 }) => {
    let evaluate2 = evaluateLater(el, expression);
    if (!el._x_doHide)
      el._x_doHide = () => {
        mutateDom(() => {
          el.style.setProperty(
            'display',
            'none',
            modifiers.includes('important') ? 'important' : void 0,
          );
        });
      };
    if (!el._x_doShow)
      el._x_doShow = () => {
        mutateDom(() => {
          if (el.style.length === 1 && el.style.display === 'none') {
            el.removeAttribute('style');
          } else {
            el.style.removeProperty('display');
          }
        });
      };
    let hide = () => {
      el._x_doHide();
      el._x_isShown = false;
    };
    let show = () => {
      el._x_doShow();
      el._x_isShown = true;
    };
    let clickAwayCompatibleShow = () => setTimeout(show);
    let toggle = once(
      (value) => (value ? show() : hide()),
      (value) => {
        if (typeof el._x_toggleAndCascadeWithTransitions === 'function') {
          el._x_toggleAndCascadeWithTransitions(el, value, show, hide);
        } else {
          value ? clickAwayCompatibleShow() : hide();
        }
      },
    );
    let oldValue;
    let firstTime = true;
    effect3(() =>
      evaluate2((value) => {
        if (!firstTime && value === oldValue) return;
        if (modifiers.includes('immediate'))
          value ? clickAwayCompatibleShow() : hide();
        toggle(value);
        oldValue = value;
        firstTime = false;
      }),
    );
  });
  directive(
    'for',
    (el, { expression }, { effect: effect3, cleanup: cleanup2 }) => {
      let iteratorNames = parseForExpression(expression);
      let evaluateItems = evaluateLater(el, iteratorNames.items);
      let evaluateKey = evaluateLater(el, el._x_keyExpression || 'index');
      el._x_prevKeys = [];
      el._x_lookup = {};
      effect3(() => loop(el, iteratorNames, evaluateItems, evaluateKey));
      cleanup2(() => {
        Object.values(el._x_lookup).forEach((el2) => el2.remove());
        delete el._x_prevKeys;
        delete el._x_lookup;
      });
    },
  );
  function loop(el, iteratorNames, evaluateItems, evaluateKey) {
    let isObject22 = (i) => typeof i === 'object' && !Array.isArray(i);
    let templateEl = el;
    evaluateItems((items) => {
      if (isNumeric3(items) && items >= 0) {
        items = Array.from(Array(items).keys(), (i) => i + 1);
      }
      if (items === void 0) items = [];
      let lookup = el._x_lookup;
      let prevKeys = el._x_prevKeys;
      let scopes = [];
      let keys = [];
      if (isObject22(items)) {
        items = Object.entries(items).map(([key, value]) => {
          let scope2 = getIterationScopeVariables(
            iteratorNames,
            value,
            key,
            items,
          );
          evaluateKey(
            (value2) => {
              if (keys.includes(value2)) warn('Duplicate key on x-for', el);
              keys.push(value2);
            },
            { scope: { index: key, ...scope2 } },
          );
          scopes.push(scope2);
        });
      } else {
        for (let i = 0; i < items.length; i++) {
          let scope2 = getIterationScopeVariables(
            iteratorNames,
            items[i],
            i,
            items,
          );
          evaluateKey(
            (value) => {
              if (keys.includes(value)) warn('Duplicate key on x-for', el);
              keys.push(value);
            },
            { scope: { index: i, ...scope2 } },
          );
          scopes.push(scope2);
        }
      }
      let adds = [];
      let moves = [];
      let removes = [];
      let sames = [];
      for (let i = 0; i < prevKeys.length; i++) {
        let key = prevKeys[i];
        if (keys.indexOf(key) === -1) removes.push(key);
      }
      prevKeys = prevKeys.filter((key) => !removes.includes(key));
      let lastKey = 'template';
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let prevIndex = prevKeys.indexOf(key);
        if (prevIndex === -1) {
          prevKeys.splice(i, 0, key);
          adds.push([lastKey, i]);
        } else if (prevIndex !== i) {
          let keyInSpot = prevKeys.splice(i, 1)[0];
          let keyForSpot = prevKeys.splice(prevIndex - 1, 1)[0];
          prevKeys.splice(i, 0, keyForSpot);
          prevKeys.splice(prevIndex, 0, keyInSpot);
          moves.push([keyInSpot, keyForSpot]);
        } else {
          sames.push(key);
        }
        lastKey = key;
      }
      for (let i = 0; i < removes.length; i++) {
        let key = removes[i];
        if (!!lookup[key]._x_effects) {
          lookup[key]._x_effects.forEach(dequeueJob);
        }
        lookup[key].remove();
        lookup[key] = null;
        delete lookup[key];
      }
      for (let i = 0; i < moves.length; i++) {
        let [keyInSpot, keyForSpot] = moves[i];
        let elInSpot = lookup[keyInSpot];
        let elForSpot = lookup[keyForSpot];
        let marker = document.createElement('div');
        mutateDom(() => {
          if (!elForSpot)
            warn(
              `x-for ":key" is undefined or invalid`,
              templateEl,
              keyForSpot,
              lookup,
            );
          elForSpot.after(marker);
          elInSpot.after(elForSpot);
          elForSpot._x_currentIfEl && elForSpot.after(elForSpot._x_currentIfEl);
          marker.before(elInSpot);
          elInSpot._x_currentIfEl && elInSpot.after(elInSpot._x_currentIfEl);
          marker.remove();
        });
        elForSpot._x_refreshXForScope(scopes[keys.indexOf(keyForSpot)]);
      }
      for (let i = 0; i < adds.length; i++) {
        let [lastKey2, index] = adds[i];
        let lastEl = lastKey2 === 'template' ? templateEl : lookup[lastKey2];
        if (lastEl._x_currentIfEl) lastEl = lastEl._x_currentIfEl;
        let scope2 = scopes[index];
        let key = keys[index];
        let clone2 = document.importNode(
          templateEl.content,
          true,
        ).firstElementChild;
        let reactiveScope = reactive(scope2);
        addScopeToNode(clone2, reactiveScope, templateEl);
        clone2._x_refreshXForScope = (newScope) => {
          Object.entries(newScope).forEach(([key2, value]) => {
            reactiveScope[key2] = value;
          });
        };
        mutateDom(() => {
          lastEl.after(clone2);
          skipDuringClone(() => initTree(clone2))();
        });
        if (typeof key === 'object') {
          warn(
            'x-for key cannot be an object, it must be a string or an integer',
            templateEl,
          );
        }
        lookup[key] = clone2;
      }
      for (let i = 0; i < sames.length; i++) {
        lookup[sames[i]]._x_refreshXForScope(scopes[keys.indexOf(sames[i])]);
      }
      templateEl._x_prevKeys = keys;
    });
  }
  function parseForExpression(expression) {
    let forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
    let stripParensRE = /^\s*\(|\)\s*$/g;
    let forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;
    let inMatch = expression.match(forAliasRE);
    if (!inMatch) return;
    let res = {};
    res.items = inMatch[2].trim();
    let item = inMatch[1].replace(stripParensRE, '').trim();
    let iteratorMatch = item.match(forIteratorRE);
    if (iteratorMatch) {
      res.item = item.replace(forIteratorRE, '').trim();
      res.index = iteratorMatch[1].trim();
      if (iteratorMatch[2]) {
        res.collection = iteratorMatch[2].trim();
      }
    } else {
      res.item = item;
    }
    return res;
  }
  function getIterationScopeVariables(iteratorNames, item, index, items) {
    let scopeVariables = {};
    if (/^\[.*\]$/.test(iteratorNames.item) && Array.isArray(item)) {
      let names = iteratorNames.item
        .replace('[', '')
        .replace(']', '')
        .split(',')
        .map((i) => i.trim());
      names.forEach((name, i) => {
        scopeVariables[name] = item[i];
      });
    } else if (
      /^\{.*\}$/.test(iteratorNames.item) &&
      !Array.isArray(item) &&
      typeof item === 'object'
    ) {
      let names = iteratorNames.item
        .replace('{', '')
        .replace('}', '')
        .split(',')
        .map((i) => i.trim());
      names.forEach((name) => {
        scopeVariables[name] = item[name];
      });
    } else {
      scopeVariables[iteratorNames.item] = item;
    }
    if (iteratorNames.index) scopeVariables[iteratorNames.index] = index;
    if (iteratorNames.collection)
      scopeVariables[iteratorNames.collection] = items;
    return scopeVariables;
  }
  function isNumeric3(subject) {
    return !Array.isArray(subject) && !isNaN(subject);
  }
  function handler3() {}
  handler3.inline = (el, { expression }, { cleanup: cleanup2 }) => {
    let root = closestRoot(el);
    if (!root._x_refs) root._x_refs = {};
    root._x_refs[expression] = el;
    cleanup2(() => delete root._x_refs[expression]);
  };
  directive('ref', handler3);
  directive(
    'if',
    (el, { expression }, { effect: effect3, cleanup: cleanup2 }) => {
      if (el.tagName.toLowerCase() !== 'template')
        warn('x-if can only be used on a <template> tag', el);
      let evaluate2 = evaluateLater(el, expression);
      let show = () => {
        if (el._x_currentIfEl) return el._x_currentIfEl;
        let clone2 = el.content.cloneNode(true).firstElementChild;
        addScopeToNode(clone2, {}, el);
        mutateDom(() => {
          el.after(clone2);
          skipDuringClone(() => initTree(clone2))();
        });
        el._x_currentIfEl = clone2;
        el._x_undoIf = () => {
          walk(clone2, (node) => {
            if (!!node._x_effects) {
              node._x_effects.forEach(dequeueJob);
            }
          });
          clone2.remove();
          delete el._x_currentIfEl;
        };
        return clone2;
      };
      let hide = () => {
        if (!el._x_undoIf) return;
        el._x_undoIf();
        delete el._x_undoIf;
      };
      effect3(() =>
        evaluate2((value) => {
          value ? show() : hide();
        }),
      );
      cleanup2(() => el._x_undoIf && el._x_undoIf());
    },
  );
  directive('id', (el, { expression }, { evaluate: evaluate2 }) => {
    let names = evaluate2(expression);
    names.forEach((name) => setIdRoot(el, name));
  });
  interceptClone((from, to) => {
    if (from._x_ids) {
      to._x_ids = from._x_ids;
    }
  });
  mapAttributes(startingWith('@', into(prefix('on:'))));
  directive(
    'on',
    skipDuringClone(
      (el, { value, modifiers, expression }, { cleanup: cleanup2 }) => {
        let evaluate2 = expression ? evaluateLater(el, expression) : () => {};
        if (el.tagName.toLowerCase() === 'template') {
          if (!el._x_forwardEvents) el._x_forwardEvents = [];
          if (!el._x_forwardEvents.includes(value))
            el._x_forwardEvents.push(value);
        }
        let removeListener = on(el, value, modifiers, (e) => {
          evaluate2(() => {}, { scope: { $event: e }, params: [e] });
        });
        cleanup2(() => removeListener());
      },
    ),
  );
  warnMissingPluginDirective('Collapse', 'collapse', 'collapse');
  warnMissingPluginDirective('Intersect', 'intersect', 'intersect');
  warnMissingPluginDirective('Focus', 'trap', 'focus');
  warnMissingPluginDirective('Mask', 'mask', 'mask');
  function warnMissingPluginDirective(name, directiveName, slug) {
    directive(directiveName, (el) =>
      warn(
        `You can't use [x-${directiveName}] without first installing the "${name}" plugin here: https://alpinejs.dev/plugins/${slug}`,
        el,
      ),
    );
  }
  alpine_default.setEvaluator(normalEvaluator);
  alpine_default.setReactivityEngine({
    reactive: reactive2,
    effect: effect2,
    release: stop,
    raw: toRaw,
  });
  var src_default = alpine_default;
  var module_default = src_default;

  // node_modules/@alpinejs/intersect/dist/module.esm.js
  function src_default2(Alpine2) {
    Alpine2.directive(
      'intersect',
      Alpine2.skipDuringClone(
        (
          el,
          { value, expression, modifiers },
          { evaluateLater: evaluateLater2, cleanup: cleanup2 },
        ) => {
          let evaluate2 = evaluateLater2(expression);
          let options = {
            rootMargin: getRootMargin(modifiers),
            threshold: getThreshold(modifiers),
          };
          let observer2 = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting === (value === 'leave')) return;
              evaluate2();
              modifiers.includes('once') && observer2.disconnect();
            });
          }, options);
          observer2.observe(el);
          cleanup2(() => {
            observer2.disconnect();
          });
        },
      ),
    );
  }
  function getThreshold(modifiers) {
    if (modifiers.includes('full')) return 0.99;
    if (modifiers.includes('half')) return 0.5;
    if (!modifiers.includes('threshold')) return 0;
    let threshold = modifiers[modifiers.indexOf('threshold') + 1];
    if (threshold === '100') return 1;
    if (threshold === '0') return 0;
    return Number(`.${threshold}`);
  }
  function getLengthValue(rawValue) {
    let match = rawValue.match(/^(-?[0-9]+)(px|%)?$/);
    return match ? match[1] + (match[2] || 'px') : void 0;
  }
  function getRootMargin(modifiers) {
    const key = 'margin';
    const fallback = '0px 0px 0px 0px';
    const index = modifiers.indexOf(key);
    if (index === -1) return fallback;
    let values = [];
    for (let i = 1; i < 5; i++) {
      values.push(getLengthValue(modifiers[index + i] || ''));
    }
    values = values.filter((v) => v !== void 0);
    return values.length ? values.join(' ').trim() : fallback;
  }
  var module_default2 = src_default2;

  // src/js/cart.js
  window.cart = function () {};

  // node_modules/gsap/gsap-core.js
  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError(
        "this hasn't been initialised - super() hasn't been called",
      );
    }
    return self;
  }
  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }
  var _config = {
    autoSleep: 120,
    force3D: 'auto',
    nullTargetWarn: 1,
    units: {
      lineHeight: '',
    },
  };
  var _defaults = {
    duration: 0.5,
    overwrite: false,
    delay: 0,
  };
  var _suppressOverwrites;
  var _bigNum = 1e8;
  var _tinyNum = 1 / _bigNum;
  var _2PI = Math.PI * 2;
  var _HALF_PI = _2PI / 4;
  var _gsID = 0;
  var _sqrt = Math.sqrt;
  var _cos = Math.cos;
  var _sin = Math.sin;
  var _isString = function _isString2(value) {
    return typeof value === 'string';
  };
  var _isFunction = function _isFunction2(value) {
    return typeof value === 'function';
  };
  var _isNumber = function _isNumber2(value) {
    return typeof value === 'number';
  };
  var _isUndefined = function _isUndefined2(value) {
    return typeof value === 'undefined';
  };
  var _isObject = function _isObject2(value) {
    return typeof value === 'object';
  };
  var _isNotFalse = function _isNotFalse2(value) {
    return value !== false;
  };
  var _windowExists = function _windowExists2() {
    return typeof window !== 'undefined';
  };
  var _isFuncOrString = function _isFuncOrString2(value) {
    return _isFunction(value) || _isString(value);
  };
  var _isTypedArray =
    (typeof ArrayBuffer === 'function' && ArrayBuffer.isView) || function () {};
  var _isArray = Array.isArray;
  var _strictNumExp = /(?:-?\.?\d|\.)+/gi;
  var _numExp = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g;
  var _numWithUnitExp = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g;
  var _complexStringNumExp = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi;
  var _relExp = /[+-]=-?[.\d]+/;
  var _delimitedValueExp = /[^,'"\[\]\s]+/gi;
  var _unitExp = /[\d.+\-=]+(?:e[-+]\d*)*/i;
  var _globalTimeline;
  var _win;
  var _coreInitted;
  var _doc;
  var _globals = {};
  var _installScope = {};
  var _coreReady;
  var _install = function _install2(scope2) {
    return (_installScope = _merge(scope2, _globals)) && gsap;
  };
  var _missingPlugin = function _missingPlugin2(property, value) {
    return console.warn(
      'Invalid property',
      property,
      'set to',
      value,
      'Missing plugin? gsap.registerPlugin()',
    );
  };
  var _warn = function _warn2(message, suppress) {
    return !suppress && console.warn(message);
  };
  var _addGlobal = function _addGlobal2(name, obj) {
    return (
      (name &&
        (_globals[name] = obj) &&
        _installScope &&
        (_installScope[name] = obj)) ||
      _globals
    );
  };
  var _emptyFunc = function _emptyFunc2() {
    return 0;
  };
  var _reservedProps = {};
  var _lazyTweens = [];
  var _lazyLookup = {};
  var _lastRenderedFrame;
  var _plugins = {};
  var _effects = {};
  var _nextGCFrame = 30;
  var _harnessPlugins = [];
  var _callbackNames = '';
  var _harness = function _harness2(targets) {
    var target = targets[0],
      harnessPlugin,
      i;
    _isObject(target) || _isFunction(target) || (targets = [targets]);
    if (!(harnessPlugin = (target._gsap || {}).harness)) {
      i = _harnessPlugins.length;
      while (i-- && !_harnessPlugins[i].targetTest(target)) {}
      harnessPlugin = _harnessPlugins[i];
    }
    i = targets.length;
    while (i--) {
      (targets[i] &&
        (targets[i]._gsap ||
          (targets[i]._gsap = new GSCache(targets[i], harnessPlugin)))) ||
        targets.splice(i, 1);
    }
    return targets;
  };
  var _getCache = function _getCache2(target) {
    return target._gsap || _harness(toArray(target))[0]._gsap;
  };
  var _getProperty = function _getProperty2(target, property, v) {
    return (v = target[property]) && _isFunction(v)
      ? target[property]()
      : (_isUndefined(v) &&
          target.getAttribute &&
          target.getAttribute(property)) ||
          v;
  };
  var _forEachName = function _forEachName2(names, func) {
    return (names = names.split(',')).forEach(func) || names;
  };
  var _round = function _round2(value) {
    return Math.round(value * 1e5) / 1e5 || 0;
  };
  var _arrayContainsAny = function _arrayContainsAny2(toSearch, toFind) {
    var l = toFind.length,
      i = 0;
    for (; toSearch.indexOf(toFind[i]) < 0 && ++i < l; ) {}
    return i < l;
  };
  var _lazyRender = function _lazyRender2() {
    var l = _lazyTweens.length,
      a = _lazyTweens.slice(0),
      i,
      tween;
    _lazyLookup = {};
    _lazyTweens.length = 0;
    for (i = 0; i < l; i++) {
      tween = a[i];
      tween &&
        tween._lazy &&
        (tween.render(tween._lazy[0], tween._lazy[1], true)._lazy = 0);
    }
  };
  var _lazySafeRender = function _lazySafeRender2(
    animation,
    time,
    suppressEvents,
    force,
  ) {
    _lazyTweens.length && _lazyRender();
    animation.render(time, suppressEvents, force);
    _lazyTweens.length && _lazyRender();
  };
  var _numericIfPossible = function _numericIfPossible2(value) {
    var n = parseFloat(value);
    return (n || n === 0) && (value + '').match(_delimitedValueExp).length < 2
      ? n
      : _isString(value)
      ? value.trim()
      : value;
  };
  var _passThrough = function _passThrough2(p) {
    return p;
  };
  var _setDefaults = function _setDefaults2(obj, defaults2) {
    for (var p in defaults2) {
      p in obj || (obj[p] = defaults2[p]);
    }
    return obj;
  };
  var _setKeyframeDefaults = function _setKeyframeDefaults2(obj, defaults2) {
    for (var p in defaults2) {
      p in obj || p === 'duration' || p === 'ease' || (obj[p] = defaults2[p]);
    }
  };
  var _merge = function _merge2(base, toMerge) {
    for (var p in toMerge) {
      base[p] = toMerge[p];
    }
    return base;
  };
  var _mergeDeep = function _mergeDeep2(base, toMerge) {
    for (var p in toMerge) {
      p !== '__proto__' &&
        p !== 'constructor' &&
        p !== 'prototype' &&
        (base[p] = _isObject(toMerge[p])
          ? _mergeDeep2(base[p] || (base[p] = {}), toMerge[p])
          : toMerge[p]);
    }
    return base;
  };
  var _copyExcluding = function _copyExcluding2(obj, excluding) {
    var copy = {},
      p;
    for (p in obj) {
      p in excluding || (copy[p] = obj[p]);
    }
    return copy;
  };
  var _inheritDefaults = function _inheritDefaults2(vars) {
    var parent = vars.parent || _globalTimeline,
      func = vars.keyframes ? _setKeyframeDefaults : _setDefaults;
    if (_isNotFalse(vars.inherit)) {
      while (parent) {
        func(vars, parent.vars.defaults);
        parent = parent.parent || parent._dp;
      }
    }
    return vars;
  };
  var _arraysMatch = function _arraysMatch2(a1, a2) {
    var i = a1.length,
      match = i === a2.length;
    while (match && i-- && a1[i] === a2[i]) {}
    return i < 0;
  };
  var _addLinkedListItem = function _addLinkedListItem2(
    parent,
    child2,
    firstProp,
    lastProp,
    sortBy,
  ) {
    if (firstProp === void 0) {
      firstProp = '_first';
    }
    if (lastProp === void 0) {
      lastProp = '_last';
    }
    var prev = parent[lastProp],
      t;
    if (sortBy) {
      t = child2[sortBy];
      while (prev && prev[sortBy] > t) {
        prev = prev._prev;
      }
    }
    if (prev) {
      child2._next = prev._next;
      prev._next = child2;
    } else {
      child2._next = parent[firstProp];
      parent[firstProp] = child2;
    }
    if (child2._next) {
      child2._next._prev = child2;
    } else {
      parent[lastProp] = child2;
    }
    child2._prev = prev;
    child2.parent = child2._dp = parent;
    return child2;
  };
  var _removeLinkedListItem = function _removeLinkedListItem2(
    parent,
    child2,
    firstProp,
    lastProp,
  ) {
    if (firstProp === void 0) {
      firstProp = '_first';
    }
    if (lastProp === void 0) {
      lastProp = '_last';
    }
    var prev = child2._prev,
      next2 = child2._next;
    if (prev) {
      prev._next = next2;
    } else if (parent[firstProp] === child2) {
      parent[firstProp] = next2;
    }
    if (next2) {
      next2._prev = prev;
    } else if (parent[lastProp] === child2) {
      parent[lastProp] = prev;
    }
    child2._next = child2._prev = child2.parent = null;
  };
  var _removeFromParent = function _removeFromParent2(
    child2,
    onlyIfParentHasAutoRemove,
  ) {
    child2.parent &&
      (!onlyIfParentHasAutoRemove || child2.parent.autoRemoveChildren) &&
      child2.parent.remove(child2);
    child2._act = 0;
  };
  var _uncache = function _uncache2(animation, child2) {
    if (
      animation &&
      (!child2 || child2._end > animation._dur || child2._start < 0)
    ) {
      var a = animation;
      while (a) {
        a._dirty = 1;
        a = a.parent;
      }
    }
    return animation;
  };
  var _recacheAncestors = function _recacheAncestors2(animation) {
    var parent = animation.parent;
    while (parent && parent.parent) {
      parent._dirty = 1;
      parent.totalDuration();
      parent = parent.parent;
    }
    return animation;
  };
  var _hasNoPausedAncestors = function _hasNoPausedAncestors2(animation) {
    return (
      !animation || (animation._ts && _hasNoPausedAncestors2(animation.parent))
    );
  };
  var _elapsedCycleDuration = function _elapsedCycleDuration2(animation) {
    return animation._repeat
      ? _animationCycle(
          animation._tTime,
          (animation = animation.duration() + animation._rDelay),
        ) * animation
      : 0;
  };
  var _animationCycle = function _animationCycle2(tTime, cycleDuration) {
    var whole = Math.floor((tTime /= cycleDuration));
    return tTime && whole === tTime ? whole - 1 : whole;
  };
  var _parentToChildTotalTime = function _parentToChildTotalTime2(
    parentTime,
    child2,
  ) {
    return (
      (parentTime - child2._start) * child2._ts +
      (child2._ts >= 0
        ? 0
        : child2._dirty
        ? child2.totalDuration()
        : child2._tDur)
    );
  };
  var _setEnd = function _setEnd2(animation) {
    return (animation._end = _round(
      animation._start +
        (animation._tDur /
          Math.abs(animation._ts || animation._rts || _tinyNum) || 0),
    ));
  };
  var _alignPlayhead = function _alignPlayhead2(animation, totalTime) {
    var parent = animation._dp;
    if (parent && parent.smoothChildTiming && animation._ts) {
      animation._start = _round(
        parent._time -
          (animation._ts > 0
            ? totalTime / animation._ts
            : ((animation._dirty
                ? animation.totalDuration()
                : animation._tDur) -
                totalTime) /
              -animation._ts),
      );
      _setEnd(animation);
      parent._dirty || _uncache(parent, animation);
    }
    return animation;
  };
  var _postAddChecks = function _postAddChecks2(timeline2, child2) {
    var t;
    if (child2._time || (child2._initted && !child2._dur)) {
      t = _parentToChildTotalTime(timeline2.rawTime(), child2);
      if (
        !child2._dur ||
        _clamp(0, child2.totalDuration(), t) - child2._tTime > _tinyNum
      ) {
        child2.render(t, true);
      }
    }
    if (
      _uncache(timeline2, child2)._dp &&
      timeline2._initted &&
      timeline2._time >= timeline2._dur &&
      timeline2._ts
    ) {
      if (timeline2._dur < timeline2.duration()) {
        t = timeline2;
        while (t._dp) {
          t.rawTime() >= 0 && t.totalTime(t._tTime);
          t = t._dp;
        }
      }
      timeline2._zTime = -_tinyNum;
    }
  };
  var _addToTimeline = function _addToTimeline2(
    timeline2,
    child2,
    position,
    skipChecks,
  ) {
    child2.parent && _removeFromParent(child2);
    child2._start = _round(
      (_isNumber(position)
        ? position
        : position || timeline2 !== _globalTimeline
        ? _parsePosition(timeline2, position, child2)
        : timeline2._time) + child2._delay,
    );
    child2._end = _round(
      child2._start +
        (child2.totalDuration() / Math.abs(child2.timeScale()) || 0),
    );
    _addLinkedListItem(
      timeline2,
      child2,
      '_first',
      '_last',
      timeline2._sort ? '_start' : 0,
    );
    _isFromOrFromStart(child2) || (timeline2._recent = child2);
    skipChecks || _postAddChecks(timeline2, child2);
    return timeline2;
  };
  var _scrollTrigger = function _scrollTrigger2(animation, trigger2) {
    return (
      (_globals.ScrollTrigger || _missingPlugin('scrollTrigger', trigger2)) &&
      _globals.ScrollTrigger.create(trigger2, animation)
    );
  };
  var _attemptInitTween = function _attemptInitTween2(
    tween,
    totalTime,
    force,
    suppressEvents,
  ) {
    _initTween(tween, totalTime);
    if (!tween._initted) {
      return 1;
    }
    if (
      !force &&
      tween._pt &&
      ((tween._dur && tween.vars.lazy !== false) ||
        (!tween._dur && tween.vars.lazy)) &&
      _lastRenderedFrame !== _ticker.frame
    ) {
      _lazyTweens.push(tween);
      tween._lazy = [totalTime, suppressEvents];
      return 1;
    }
  };
  var _parentPlayheadIsBeforeStart = function _parentPlayheadIsBeforeStart2(
    _ref,
  ) {
    var parent = _ref.parent;
    return (
      parent &&
      parent._ts &&
      parent._initted &&
      !parent._lock &&
      (parent.rawTime() < 0 || _parentPlayheadIsBeforeStart2(parent))
    );
  };
  var _isFromOrFromStart = function _isFromOrFromStart2(_ref2) {
    var data2 = _ref2.data;
    return data2 === 'isFromStart' || data2 === 'isStart';
  };
  var _renderZeroDurationTween = function _renderZeroDurationTween2(
    tween,
    totalTime,
    suppressEvents,
    force,
  ) {
    var prevRatio = tween.ratio,
      ratio =
        totalTime < 0 ||
        (!totalTime &&
          ((!tween._start &&
            _parentPlayheadIsBeforeStart(tween) &&
            !(!tween._initted && _isFromOrFromStart(tween))) ||
            ((tween._ts < 0 || tween._dp._ts < 0) &&
              !_isFromOrFromStart(tween))))
          ? 0
          : 1,
      repeatDelay = tween._rDelay,
      tTime = 0,
      pt,
      iteration,
      prevIteration;
    if (repeatDelay && tween._repeat) {
      tTime = _clamp(0, tween._tDur, totalTime);
      iteration = _animationCycle(tTime, repeatDelay);
      prevIteration = _animationCycle(tween._tTime, repeatDelay);
      tween._yoyo && iteration & 1 && (ratio = 1 - ratio);
      if (iteration !== prevIteration) {
        prevRatio = 1 - ratio;
        tween.vars.repeatRefresh && tween._initted && tween.invalidate();
      }
    }
    if (
      ratio !== prevRatio ||
      force ||
      tween._zTime === _tinyNum ||
      (!totalTime && tween._zTime)
    ) {
      if (
        !tween._initted &&
        _attemptInitTween(tween, totalTime, force, suppressEvents)
      ) {
        return;
      }
      prevIteration = tween._zTime;
      tween._zTime = totalTime || (suppressEvents ? _tinyNum : 0);
      suppressEvents || (suppressEvents = totalTime && !prevIteration);
      tween.ratio = ratio;
      tween._from && (ratio = 1 - ratio);
      tween._time = 0;
      tween._tTime = tTime;
      pt = tween._pt;
      while (pt) {
        pt.r(ratio, pt.d);
        pt = pt._next;
      }
      tween._startAt &&
        totalTime < 0 &&
        tween._startAt.render(totalTime, true, true);
      tween._onUpdate && !suppressEvents && _callback(tween, 'onUpdate');
      tTime &&
        tween._repeat &&
        !suppressEvents &&
        tween.parent &&
        _callback(tween, 'onRepeat');
      if (
        (totalTime >= tween._tDur || totalTime < 0) &&
        tween.ratio === ratio
      ) {
        ratio && _removeFromParent(tween, 1);
        if (!suppressEvents) {
          _callback(tween, ratio ? 'onComplete' : 'onReverseComplete', true);
          tween._prom && tween._prom();
        }
      }
    } else if (!tween._zTime) {
      tween._zTime = totalTime;
    }
  };
  var _findNextPauseTween = function _findNextPauseTween2(
    animation,
    prevTime,
    time,
  ) {
    var child2;
    if (time > prevTime) {
      child2 = animation._first;
      while (child2 && child2._start <= time) {
        if (
          !child2._dur &&
          child2.data === 'isPause' &&
          child2._start > prevTime
        ) {
          return child2;
        }
        child2 = child2._next;
      }
    } else {
      child2 = animation._last;
      while (child2 && child2._start >= time) {
        if (
          !child2._dur &&
          child2.data === 'isPause' &&
          child2._start < prevTime
        ) {
          return child2;
        }
        child2 = child2._prev;
      }
    }
  };
  var _setDuration = function _setDuration2(
    animation,
    duration,
    skipUncache,
    leavePlayhead,
  ) {
    var repeat = animation._repeat,
      dur = _round(duration) || 0,
      totalProgress = animation._tTime / animation._tDur;
    totalProgress &&
      !leavePlayhead &&
      (animation._time *= dur / animation._dur);
    animation._dur = dur;
    animation._tDur = !repeat
      ? dur
      : repeat < 0
      ? 1e10
      : _round(dur * (repeat + 1) + animation._rDelay * repeat);
    totalProgress && !leavePlayhead
      ? _alignPlayhead(
          animation,
          (animation._tTime = animation._tDur * totalProgress),
        )
      : animation.parent && _setEnd(animation);
    skipUncache || _uncache(animation.parent, animation);
    return animation;
  };
  var _onUpdateTotalDuration = function _onUpdateTotalDuration2(animation) {
    return animation instanceof Timeline
      ? _uncache(animation)
      : _setDuration(animation, animation._dur);
  };
  var _zeroPosition = {
    _start: 0,
    endTime: _emptyFunc,
    totalDuration: _emptyFunc,
  };
  var _parsePosition = function _parsePosition2(
    animation,
    position,
    percentAnimation,
  ) {
    var labels = animation.labels,
      recent = animation._recent || _zeroPosition,
      clippedDuration =
        animation.duration() >= _bigNum
          ? recent.endTime(false)
          : animation._dur,
      i,
      offset,
      isPercent;
    if (_isString(position) && (isNaN(position) || position in labels)) {
      offset = position.charAt(0);
      isPercent = position.substr(-1) === '%';
      i = position.indexOf('=');
      if (offset === '<' || offset === '>') {
        i >= 0 && (position = position.replace(/=/, ''));
        return (
          (offset === '<'
            ? recent._start
            : recent.endTime(recent._repeat >= 0)) +
          (parseFloat(position.substr(1)) || 0) *
            (isPercent
              ? (i < 0 ? recent : percentAnimation).totalDuration() / 100
              : 1)
        );
      }
      if (i < 0) {
        position in labels || (labels[position] = clippedDuration);
        return labels[position];
      }
      offset = parseFloat(position.charAt(i - 1) + position.substr(i + 1));
      if (isPercent && percentAnimation) {
        offset =
          (offset / 100) *
          (_isArray(percentAnimation)
            ? percentAnimation[0]
            : percentAnimation
          ).totalDuration();
      }
      return i > 1
        ? _parsePosition2(
            animation,
            position.substr(0, i - 1),
            percentAnimation,
          ) + offset
        : clippedDuration + offset;
    }
    return position == null ? clippedDuration : +position;
  };
  var _createTweenType = function _createTweenType2(type, params, timeline2) {
    var isLegacy = _isNumber(params[1]),
      varsIndex = (isLegacy ? 2 : 1) + (type < 2 ? 0 : 1),
      vars = params[varsIndex],
      irVars,
      parent;
    isLegacy && (vars.duration = params[1]);
    vars.parent = timeline2;
    if (type) {
      irVars = vars;
      parent = timeline2;
      while (parent && !('immediateRender' in irVars)) {
        irVars = parent.vars.defaults || {};
        parent = _isNotFalse(parent.vars.inherit) && parent.parent;
      }
      vars.immediateRender = _isNotFalse(irVars.immediateRender);
      type < 2
        ? (vars.runBackwards = 1)
        : (vars.startAt = params[varsIndex - 1]);
    }
    return new Tween(params[0], vars, params[varsIndex + 1]);
  };
  var _conditionalReturn = function _conditionalReturn2(value, func) {
    return value || value === 0 ? func(value) : func;
  };
  var _clamp = function _clamp2(min2, max2, value) {
    return value < min2 ? min2 : value > max2 ? max2 : value;
  };
  var getUnit = function getUnit2(value) {
    if (typeof value !== 'string') {
      return '';
    }
    var v = _unitExp.exec(value);
    return v ? value.substr(v.index + v[0].length) : '';
  };
  var clamp = function clamp2(min2, max2, value) {
    return _conditionalReturn(value, function (v) {
      return _clamp(min2, max2, v);
    });
  };
  var _slice = [].slice;
  var _isArrayLike = function _isArrayLike2(value, nonEmpty) {
    return (
      value &&
      _isObject(value) &&
      'length' in value &&
      ((!nonEmpty && !value.length) ||
        (value.length - 1 in value && _isObject(value[0]))) &&
      !value.nodeType &&
      value !== _win
    );
  };
  var _flatten = function _flatten2(ar, leaveStrings, accumulator) {
    if (accumulator === void 0) {
      accumulator = [];
    }
    return (
      ar.forEach(function (value) {
        var _accumulator;
        return (_isString(value) && !leaveStrings) || _isArrayLike(value, 1)
          ? (_accumulator = accumulator).push.apply(
              _accumulator,
              toArray(value),
            )
          : accumulator.push(value);
      }) || accumulator
    );
  };
  var toArray = function toArray2(value, scope2, leaveStrings) {
    return _isString(value) && !leaveStrings && (_coreInitted || !_wake())
      ? _slice.call((scope2 || _doc).querySelectorAll(value), 0)
      : _isArray(value)
      ? _flatten(value, leaveStrings)
      : _isArrayLike(value)
      ? _slice.call(value, 0)
      : value
      ? [value]
      : [];
  };
  var selector = function selector2(value) {
    value = toArray(value)[0] || _warn('Invalid scope') || {};
    return function (v) {
      var el = value.current || value.nativeElement || value;
      return toArray(
        v,
        el.querySelectorAll
          ? el
          : el === value
          ? _warn('Invalid scope') || _doc.createElement('div')
          : value,
      );
    };
  };
  var shuffle = function shuffle2(a) {
    return a.sort(function () {
      return 0.5 - Math.random();
    });
  };
  var distribute = function distribute2(v) {
    if (_isFunction(v)) {
      return v;
    }
    var vars = _isObject(v)
        ? v
        : {
            each: v,
          },
      ease = _parseEase(vars.ease),
      from = vars.from || 0,
      base = parseFloat(vars.base) || 0,
      cache = {},
      isDecimal = from > 0 && from < 1,
      ratios = isNaN(from) || isDecimal,
      axis = vars.axis,
      ratioX = from,
      ratioY = from;
    if (_isString(from)) {
      ratioX = ratioY =
        {
          center: 0.5,
          edges: 0.5,
          end: 1,
        }[from] || 0;
    } else if (!isDecimal && ratios) {
      ratioX = from[0];
      ratioY = from[1];
    }
    return function (i, target, a) {
      var l = (a || vars).length,
        distances = cache[l],
        originX,
        originY,
        x,
        y,
        d,
        j,
        max2,
        min2,
        wrapAt;
      if (!distances) {
        wrapAt = vars.grid === 'auto' ? 0 : (vars.grid || [1, _bigNum])[1];
        if (!wrapAt) {
          max2 = -_bigNum;
          while (
            max2 < (max2 = a[wrapAt++].getBoundingClientRect().left) &&
            wrapAt < l
          ) {}
          wrapAt--;
        }
        distances = cache[l] = [];
        originX = ratios ? Math.min(wrapAt, l) * ratioX - 0.5 : from % wrapAt;
        originY = ratios ? (l * ratioY) / wrapAt - 0.5 : (from / wrapAt) | 0;
        max2 = 0;
        min2 = _bigNum;
        for (j = 0; j < l; j++) {
          x = (j % wrapAt) - originX;
          y = originY - ((j / wrapAt) | 0);
          distances[j] = d = !axis
            ? _sqrt(x * x + y * y)
            : Math.abs(axis === 'y' ? y : x);
          d > max2 && (max2 = d);
          d < min2 && (min2 = d);
        }
        from === 'random' && shuffle(distances);
        distances.max = max2 - min2;
        distances.min = min2;
        distances.v = l =
          (parseFloat(vars.amount) ||
            parseFloat(vars.each) *
              (wrapAt > l
                ? l - 1
                : !axis
                ? Math.max(wrapAt, l / wrapAt)
                : axis === 'y'
                ? l / wrapAt
                : wrapAt) ||
            0) * (from === 'edges' ? -1 : 1);
        distances.b = l < 0 ? base - l : base;
        distances.u = getUnit(vars.amount || vars.each) || 0;
        ease = ease && l < 0 ? _invertEase(ease) : ease;
      }
      l = (distances[i] - distances.min) / distances.max || 0;
      return (
        _round(distances.b + (ease ? ease(l) : l) * distances.v) + distances.u
      );
    };
  };
  var _roundModifier = function _roundModifier2(v) {
    var p = v < 1 ? Math.pow(10, (v + '').length - 2) : 1;
    return function (raw2) {
      var n = Math.round(parseFloat(raw2) / v) * v * p;
      return (n - (n % 1)) / p + (_isNumber(raw2) ? 0 : getUnit(raw2));
    };
  };
  var snap = function snap2(snapTo, value) {
    var isArray3 = _isArray(snapTo),
      radius,
      is2D;
    if (!isArray3 && _isObject(snapTo)) {
      radius = isArray3 = snapTo.radius || _bigNum;
      if (snapTo.values) {
        snapTo = toArray(snapTo.values);
        if ((is2D = !_isNumber(snapTo[0]))) {
          radius *= radius;
        }
      } else {
        snapTo = _roundModifier(snapTo.increment);
      }
    }
    return _conditionalReturn(
      value,
      !isArray3
        ? _roundModifier(snapTo)
        : _isFunction(snapTo)
        ? function (raw2) {
            is2D = snapTo(raw2);
            return Math.abs(is2D - raw2) <= radius ? is2D : raw2;
          }
        : function (raw2) {
            var x = parseFloat(is2D ? raw2.x : raw2),
              y = parseFloat(is2D ? raw2.y : 0),
              min2 = _bigNum,
              closest2 = 0,
              i = snapTo.length,
              dx,
              dy;
            while (i--) {
              if (is2D) {
                dx = snapTo[i].x - x;
                dy = snapTo[i].y - y;
                dx = dx * dx + dy * dy;
              } else {
                dx = Math.abs(snapTo[i] - x);
              }
              if (dx < min2) {
                min2 = dx;
                closest2 = i;
              }
            }
            closest2 = !radius || min2 <= radius ? snapTo[closest2] : raw2;
            return is2D || closest2 === raw2 || _isNumber(raw2)
              ? closest2
              : closest2 + getUnit(raw2);
          },
    );
  };
  var random = function random2(min2, max2, roundingIncrement, returnFunction) {
    return _conditionalReturn(
      _isArray(min2)
        ? !max2
        : roundingIncrement === true
        ? !!(roundingIncrement = 0)
        : !returnFunction,
      function () {
        return _isArray(min2)
          ? min2[~~(Math.random() * min2.length)]
          : (roundingIncrement = roundingIncrement || 1e-5) &&
              (returnFunction =
                roundingIncrement < 1
                  ? Math.pow(10, (roundingIncrement + '').length - 2)
                  : 1) &&
              Math.floor(
                Math.round(
                  (min2 -
                    roundingIncrement / 2 +
                    Math.random() * (max2 - min2 + roundingIncrement * 0.99)) /
                    roundingIncrement,
                ) *
                  roundingIncrement *
                  returnFunction,
              ) / returnFunction;
      },
    );
  };
  var pipe = function pipe2() {
    for (
      var _len = arguments.length, functions = new Array(_len), _key = 0;
      _key < _len;
      _key++
    ) {
      functions[_key] = arguments[_key];
    }
    return function (value) {
      return functions.reduce(function (v, f) {
        return f(v);
      }, value);
    };
  };
  var unitize = function unitize2(func, unit2) {
    return function (value) {
      return func(parseFloat(value)) + (unit2 || getUnit(value));
    };
  };
  var normalize = function normalize2(min2, max2, value) {
    return mapRange(min2, max2, 0, 1, value);
  };
  var _wrapArray = function _wrapArray2(a, wrapper, value) {
    return _conditionalReturn(value, function (index) {
      return a[~~wrapper(index)];
    });
  };
  var wrap = function wrap2(min2, max2, value) {
    var range = max2 - min2;
    return _isArray(min2)
      ? _wrapArray(min2, wrap2(0, min2.length), max2)
      : _conditionalReturn(value, function (value2) {
          return ((range + ((value2 - min2) % range)) % range) + min2;
        });
  };
  var wrapYoyo = function wrapYoyo2(min2, max2, value) {
    var range = max2 - min2,
      total = range * 2;
    return _isArray(min2)
      ? _wrapArray(min2, wrapYoyo2(0, min2.length - 1), max2)
      : _conditionalReturn(value, function (value2) {
          value2 = (total + ((value2 - min2) % total)) % total || 0;
          return min2 + (value2 > range ? total - value2 : value2);
        });
  };
  var _replaceRandom = function _replaceRandom2(value) {
    var prev = 0,
      s = '',
      i,
      nums,
      end,
      isArray3;
    while (~(i = value.indexOf('random(', prev))) {
      end = value.indexOf(')', i);
      isArray3 = value.charAt(i + 7) === '[';
      nums = value
        .substr(i + 7, end - i - 7)
        .match(isArray3 ? _delimitedValueExp : _strictNumExp);
      s +=
        value.substr(prev, i - prev) +
        random(
          isArray3 ? nums : +nums[0],
          isArray3 ? 0 : +nums[1],
          +nums[2] || 1e-5,
        );
      prev = end + 1;
    }
    return s + value.substr(prev, value.length - prev);
  };
  var mapRange = function mapRange2(inMin, inMax, outMin, outMax, value) {
    var inRange = inMax - inMin,
      outRange = outMax - outMin;
    return _conditionalReturn(value, function (value2) {
      return outMin + (((value2 - inMin) / inRange) * outRange || 0);
    });
  };
  var interpolate = function interpolate2(start3, end, progress, mutate) {
    var func = isNaN(start3 + end)
      ? 0
      : function (p2) {
          return (1 - p2) * start3 + p2 * end;
        };
    if (!func) {
      var isString3 = _isString(start3),
        master = {},
        p,
        i,
        interpolators,
        l,
        il;
      progress === true && (mutate = 1) && (progress = null);
      if (isString3) {
        start3 = {
          p: start3,
        };
        end = {
          p: end,
        };
      } else if (_isArray(start3) && !_isArray(end)) {
        interpolators = [];
        l = start3.length;
        il = l - 2;
        for (i = 1; i < l; i++) {
          interpolators.push(interpolate2(start3[i - 1], start3[i]));
        }
        l--;
        func = function func2(p2) {
          p2 *= l;
          var i2 = Math.min(il, ~~p2);
          return interpolators[i2](p2 - i2);
        };
        progress = end;
      } else if (!mutate) {
        start3 = _merge(_isArray(start3) ? [] : {}, start3);
      }
      if (!interpolators) {
        for (p in end) {
          _addPropTween.call(master, start3, p, 'get', end[p]);
        }
        func = function func2(p2) {
          return (
            _renderPropTweens(p2, master) || (isString3 ? start3.p : start3)
          );
        };
      }
    }
    return _conditionalReturn(progress, func);
  };
  var _getLabelInDirection = function _getLabelInDirection2(
    timeline2,
    fromTime,
    backward,
  ) {
    var labels = timeline2.labels,
      min2 = _bigNum,
      p,
      distance,
      label;
    for (p in labels) {
      distance = labels[p] - fromTime;
      if (
        distance < 0 === !!backward &&
        distance &&
        min2 > (distance = Math.abs(distance))
      ) {
        label = p;
        min2 = distance;
      }
    }
    return label;
  };
  var _callback = function _callback2(animation, type, executeLazyFirst) {
    var v = animation.vars,
      callback = v[type],
      params,
      scope2;
    if (!callback) {
      return;
    }
    params = v[type + 'Params'];
    scope2 = v.callbackScope || animation;
    executeLazyFirst && _lazyTweens.length && _lazyRender();
    return params ? callback.apply(scope2, params) : callback.call(scope2);
  };
  var _interrupt = function _interrupt2(animation) {
    _removeFromParent(animation);
    animation.scrollTrigger && animation.scrollTrigger.kill(false);
    animation.progress() < 1 && _callback(animation, 'onInterrupt');
    return animation;
  };
  var _quickTween;
  var _createPlugin = function _createPlugin2(config3) {
    config3 = (!config3.name && config3['default']) || config3;
    var name = config3.name,
      isFunc = _isFunction(config3),
      Plugin =
        name && !isFunc && config3.init
          ? function () {
              this._props = [];
            }
          : config3,
      instanceDefaults = {
        init: _emptyFunc,
        render: _renderPropTweens,
        add: _addPropTween,
        kill: _killPropTweensOf,
        modifier: _addPluginModifier,
        rawVars: 0,
      },
      statics = {
        targetTest: 0,
        get: 0,
        getSetter: _getSetter,
        aliases: {},
        register: 0,
      };
    _wake();
    if (config3 !== Plugin) {
      if (_plugins[name]) {
        return;
      }
      _setDefaults(
        Plugin,
        _setDefaults(_copyExcluding(config3, instanceDefaults), statics),
      );
      _merge(
        Plugin.prototype,
        _merge(instanceDefaults, _copyExcluding(config3, statics)),
      );
      _plugins[(Plugin.prop = name)] = Plugin;
      if (config3.targetTest) {
        _harnessPlugins.push(Plugin);
        _reservedProps[name] = 1;
      }
      name =
        (name === 'css'
          ? 'CSS'
          : name.charAt(0).toUpperCase() + name.substr(1)) + 'Plugin';
    }
    _addGlobal(name, Plugin);
    config3.register && config3.register(gsap, Plugin, PropTween);
  };
  var _255 = 255;
  var _colorLookup = {
    aqua: [0, _255, _255],
    lime: [0, _255, 0],
    silver: [192, 192, 192],
    black: [0, 0, 0],
    maroon: [128, 0, 0],
    teal: [0, 128, 128],
    blue: [0, 0, _255],
    navy: [0, 0, 128],
    white: [_255, _255, _255],
    olive: [128, 128, 0],
    yellow: [_255, _255, 0],
    orange: [_255, 165, 0],
    gray: [128, 128, 128],
    purple: [128, 0, 128],
    green: [0, 128, 0],
    red: [_255, 0, 0],
    pink: [_255, 192, 203],
    cyan: [0, _255, _255],
    transparent: [_255, _255, _255, 0],
  };
  var _hue = function _hue2(h, m1, m2) {
    h = h < 0 ? h + 1 : h > 1 ? h - 1 : h;
    return (
      ((h * 6 < 1
        ? m1 + (m2 - m1) * h * 6
        : h < 0.5
        ? m2
        : h * 3 < 2
        ? m1 + (m2 - m1) * (2 / 3 - h) * 6
        : m1) *
        _255 +
        0.5) |
      0
    );
  };
  var splitColor = function splitColor2(v, toHSL, forceAlpha) {
    var a = !v
        ? _colorLookup.black
        : _isNumber(v)
        ? [v >> 16, (v >> 8) & _255, v & _255]
        : 0,
      r,
      g,
      b,
      h,
      s,
      l,
      max2,
      min2,
      d,
      wasHSL;
    if (!a) {
      if (v.substr(-1) === ',') {
        v = v.substr(0, v.length - 1);
      }
      if (_colorLookup[v]) {
        a = _colorLookup[v];
      } else if (v.charAt(0) === '#') {
        if (v.length < 6) {
          r = v.charAt(1);
          g = v.charAt(2);
          b = v.charAt(3);
          v =
            '#' +
            r +
            r +
            g +
            g +
            b +
            b +
            (v.length === 5 ? v.charAt(4) + v.charAt(4) : '');
        }
        if (v.length === 9) {
          a = parseInt(v.substr(1, 6), 16);
          return [
            a >> 16,
            (a >> 8) & _255,
            a & _255,
            parseInt(v.substr(7), 16) / 255,
          ];
        }
        v = parseInt(v.substr(1), 16);
        a = [v >> 16, (v >> 8) & _255, v & _255];
      } else if (v.substr(0, 3) === 'hsl') {
        a = wasHSL = v.match(_strictNumExp);
        if (!toHSL) {
          h = (+a[0] % 360) / 360;
          s = +a[1] / 100;
          l = +a[2] / 100;
          g = l <= 0.5 ? l * (s + 1) : l + s - l * s;
          r = l * 2 - g;
          a.length > 3 && (a[3] *= 1);
          a[0] = _hue(h + 1 / 3, r, g);
          a[1] = _hue(h, r, g);
          a[2] = _hue(h - 1 / 3, r, g);
        } else if (~v.indexOf('=')) {
          a = v.match(_numExp);
          forceAlpha && a.length < 4 && (a[3] = 1);
          return a;
        }
      } else {
        a = v.match(_strictNumExp) || _colorLookup.transparent;
      }
      a = a.map(Number);
    }
    if (toHSL && !wasHSL) {
      r = a[0] / _255;
      g = a[1] / _255;
      b = a[2] / _255;
      max2 = Math.max(r, g, b);
      min2 = Math.min(r, g, b);
      l = (max2 + min2) / 2;
      if (max2 === min2) {
        h = s = 0;
      } else {
        d = max2 - min2;
        s = l > 0.5 ? d / (2 - max2 - min2) : d / (max2 + min2);
        h =
          max2 === r
            ? (g - b) / d + (g < b ? 6 : 0)
            : max2 === g
            ? (b - r) / d + 2
            : (r - g) / d + 4;
        h *= 60;
      }
      a[0] = ~~(h + 0.5);
      a[1] = ~~(s * 100 + 0.5);
      a[2] = ~~(l * 100 + 0.5);
    }
    forceAlpha && a.length < 4 && (a[3] = 1);
    return a;
  };
  var _colorOrderData = function _colorOrderData2(v) {
    var values = [],
      c = [],
      i = -1;
    v.split(_colorExp).forEach(function (v2) {
      var a = v2.match(_numWithUnitExp) || [];
      values.push.apply(values, a);
      c.push((i += a.length + 1));
    });
    values.c = c;
    return values;
  };
  var _formatColors = function _formatColors2(s, toHSL, orderMatchData) {
    var result = '',
      colors = (s + result).match(_colorExp),
      type = toHSL ? 'hsla(' : 'rgba(',
      i = 0,
      c,
      shell,
      d,
      l;
    if (!colors) {
      return s;
    }
    colors = colors.map(function (color) {
      return (
        (color = splitColor(color, toHSL, 1)) &&
        type +
          (toHSL
            ? color[0] + ',' + color[1] + '%,' + color[2] + '%,' + color[3]
            : color.join(',')) +
          ')'
      );
    });
    if (orderMatchData) {
      d = _colorOrderData(s);
      c = orderMatchData.c;
      if (c.join(result) !== d.c.join(result)) {
        shell = s.replace(_colorExp, '1').split(_numWithUnitExp);
        l = shell.length - 1;
        for (; i < l; i++) {
          result +=
            shell[i] +
            (~c.indexOf(i)
              ? colors.shift() || type + '0,0,0,0)'
              : (d.length
                  ? d
                  : colors.length
                  ? colors
                  : orderMatchData
                ).shift());
        }
      }
    }
    if (!shell) {
      shell = s.split(_colorExp);
      l = shell.length - 1;
      for (; i < l; i++) {
        result += shell[i] + colors[i];
      }
    }
    return result + shell[l];
  };
  var _colorExp = (function () {
    var s =
        '(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b',
      p;
    for (p in _colorLookup) {
      s += '|' + p + '\\b';
    }
    return new RegExp(s + ')', 'gi');
  })();
  var _hslExp = /hsl[a]?\(/;
  var _colorStringFilter = function _colorStringFilter2(a) {
    var combined = a.join(' '),
      toHSL;
    _colorExp.lastIndex = 0;
    if (_colorExp.test(combined)) {
      toHSL = _hslExp.test(combined);
      a[1] = _formatColors(a[1], toHSL);
      a[0] = _formatColors(a[0], toHSL, _colorOrderData(a[1]));
      return true;
    }
  };
  var _tickerActive;
  var _ticker = (function () {
    var _getTime2 = Date.now,
      _lagThreshold = 500,
      _adjustedLag = 33,
      _startTime = _getTime2(),
      _lastUpdate = _startTime,
      _gap = 1e3 / 240,
      _nextTime = _gap,
      _listeners = [],
      _id,
      _req,
      _raf,
      _self,
      _delta,
      _i,
      _tick = function _tick2(v) {
        var elapsed = _getTime2() - _lastUpdate,
          manual = v === true,
          overlap,
          dispatch2,
          time,
          frame;
        elapsed > _lagThreshold && (_startTime += elapsed - _adjustedLag);
        _lastUpdate += elapsed;
        time = _lastUpdate - _startTime;
        overlap = time - _nextTime;
        if (overlap > 0 || manual) {
          frame = ++_self.frame;
          _delta = time - _self.time * 1e3;
          _self.time = time = time / 1e3;
          _nextTime += overlap + (overlap >= _gap ? 4 : _gap - overlap);
          dispatch2 = 1;
        }
        manual || (_id = _req(_tick2));
        if (dispatch2) {
          for (_i = 0; _i < _listeners.length; _i++) {
            _listeners[_i](time, _delta, frame, v);
          }
        }
      };
    _self = {
      time: 0,
      frame: 0,
      tick: function tick() {
        _tick(true);
      },
      deltaRatio: function deltaRatio(fps) {
        return _delta / (1e3 / (fps || 60));
      },
      wake: function wake() {
        if (_coreReady) {
          if (!_coreInitted && _windowExists()) {
            _win = _coreInitted = window;
            _doc = _win.document || {};
            _globals.gsap = gsap;
            (_win.gsapVersions || (_win.gsapVersions = [])).push(gsap.version);
            _install(
              _installScope ||
                _win.GreenSockGlobals ||
                (!_win.gsap && _win) ||
                {},
            );
            _raf = _win.requestAnimationFrame;
          }
          _id && _self.sleep();
          _req =
            _raf ||
            function (f) {
              return setTimeout(f, (_nextTime - _self.time * 1e3 + 1) | 0);
            };
          _tickerActive = 1;
          _tick(2);
        }
      },
      sleep: function sleep() {
        (_raf ? _win.cancelAnimationFrame : clearTimeout)(_id);
        _tickerActive = 0;
        _req = _emptyFunc;
      },
      lagSmoothing: function lagSmoothing(threshold, adjustedLag) {
        _lagThreshold = threshold || 1 / _tinyNum;
        _adjustedLag = Math.min(adjustedLag, _lagThreshold, 0);
      },
      fps: function fps(_fps) {
        _gap = 1e3 / (_fps || 240);
        _nextTime = _self.time * 1e3 + _gap;
      },
      add: function add2(callback) {
        _listeners.indexOf(callback) < 0 && _listeners.push(callback);
        _wake();
      },
      remove: function remove2(callback) {
        var i;
        ~(i = _listeners.indexOf(callback)) &&
          _listeners.splice(i, 1) &&
          _i >= i &&
          _i--;
      },
      _listeners,
    };
    return _self;
  })();
  var _wake = function _wake2() {
    return !_tickerActive && _ticker.wake();
  };
  var _easeMap = {};
  var _customEaseExp = /^[\d.\-M][\d.\-,\s]/;
  var _quotesExp = /["']/g;
  var _parseObjectInString = function _parseObjectInString2(value) {
    var obj = {},
      split = value.substr(1, value.length - 3).split(':'),
      key = split[0],
      i = 1,
      l = split.length,
      index,
      val,
      parsedVal;
    for (; i < l; i++) {
      val = split[i];
      index = i !== l - 1 ? val.lastIndexOf(',') : val.length;
      parsedVal = val.substr(0, index);
      obj[key] = isNaN(parsedVal)
        ? parsedVal.replace(_quotesExp, '').trim()
        : +parsedVal;
      key = val.substr(index + 1).trim();
    }
    return obj;
  };
  var _valueInParentheses = function _valueInParentheses2(value) {
    var open = value.indexOf('(') + 1,
      close = value.indexOf(')'),
      nested = value.indexOf('(', open);
    return value.substring(
      open,
      ~nested && nested < close ? value.indexOf(')', close + 1) : close,
    );
  };
  var _configEaseFromString = function _configEaseFromString2(name) {
    var split = (name + '').split('('),
      ease = _easeMap[split[0]];
    return ease && split.length > 1 && ease.config
      ? ease.config.apply(
          null,
          ~name.indexOf('{')
            ? [_parseObjectInString(split[1])]
            : _valueInParentheses(name).split(',').map(_numericIfPossible),
        )
      : _easeMap._CE && _customEaseExp.test(name)
      ? _easeMap._CE('', name)
      : ease;
  };
  var _invertEase = function _invertEase2(ease) {
    return function (p) {
      return 1 - ease(1 - p);
    };
  };
  var _propagateYoyoEase = function _propagateYoyoEase2(timeline2, isYoyo) {
    var child2 = timeline2._first,
      ease;
    while (child2) {
      if (child2 instanceof Timeline) {
        _propagateYoyoEase2(child2, isYoyo);
      } else if (
        child2.vars.yoyoEase &&
        (!child2._yoyo || !child2._repeat) &&
        child2._yoyo !== isYoyo
      ) {
        if (child2.timeline) {
          _propagateYoyoEase2(child2.timeline, isYoyo);
        } else {
          ease = child2._ease;
          child2._ease = child2._yEase;
          child2._yEase = ease;
          child2._yoyo = isYoyo;
        }
      }
      child2 = child2._next;
    }
  };
  var _parseEase = function _parseEase2(ease, defaultEase) {
    return !ease
      ? defaultEase
      : (_isFunction(ease)
          ? ease
          : _easeMap[ease] || _configEaseFromString(ease)) || defaultEase;
  };
  var _insertEase = function _insertEase2(names, easeIn, easeOut, easeInOut) {
    if (easeOut === void 0) {
      easeOut = function easeOut2(p) {
        return 1 - easeIn(1 - p);
      };
    }
    if (easeInOut === void 0) {
      easeInOut = function easeInOut2(p) {
        return p < 0.5 ? easeIn(p * 2) / 2 : 1 - easeIn((1 - p) * 2) / 2;
      };
    }
    var ease = {
        easeIn,
        easeOut,
        easeInOut,
      },
      lowercaseName;
    _forEachName(names, function (name) {
      _easeMap[name] = _globals[name] = ease;
      _easeMap[(lowercaseName = name.toLowerCase())] = easeOut;
      for (var p in ease) {
        _easeMap[
          lowercaseName +
            (p === 'easeIn' ? '.in' : p === 'easeOut' ? '.out' : '.inOut')
        ] = _easeMap[name + '.' + p] = ease[p];
      }
    });
    return ease;
  };
  var _easeInOutFromOut = function _easeInOutFromOut2(easeOut) {
    return function (p) {
      return p < 0.5
        ? (1 - easeOut(1 - p * 2)) / 2
        : 0.5 + easeOut((p - 0.5) * 2) / 2;
    };
  };
  var _configElastic = function _configElastic2(type, amplitude, period) {
    var p1 = amplitude >= 1 ? amplitude : 1,
      p2 = (period || (type ? 0.3 : 0.45)) / (amplitude < 1 ? amplitude : 1),
      p3 = (p2 / _2PI) * (Math.asin(1 / p1) || 0),
      easeOut = function easeOut2(p) {
        return p === 1
          ? 1
          : p1 * Math.pow(2, -10 * p) * _sin((p - p3) * p2) + 1;
      },
      ease =
        type === 'out'
          ? easeOut
          : type === 'in'
          ? function (p) {
              return 1 - easeOut(1 - p);
            }
          : _easeInOutFromOut(easeOut);
    p2 = _2PI / p2;
    ease.config = function (amplitude2, period2) {
      return _configElastic2(type, amplitude2, period2);
    };
    return ease;
  };
  var _configBack = function _configBack2(type, overshoot) {
    if (overshoot === void 0) {
      overshoot = 1.70158;
    }
    var easeOut = function easeOut2(p) {
        return p ? --p * p * ((overshoot + 1) * p + overshoot) + 1 : 0;
      },
      ease =
        type === 'out'
          ? easeOut
          : type === 'in'
          ? function (p) {
              return 1 - easeOut(1 - p);
            }
          : _easeInOutFromOut(easeOut);
    ease.config = function (overshoot2) {
      return _configBack2(type, overshoot2);
    };
    return ease;
  };
  _forEachName('Linear,Quad,Cubic,Quart,Quint,Strong', function (name, i) {
    var power = i < 5 ? i + 1 : i;
    _insertEase(
      name + ',Power' + (power - 1),
      i
        ? function (p) {
            return Math.pow(p, power);
          }
        : function (p) {
            return p;
          },
      function (p) {
        return 1 - Math.pow(1 - p, power);
      },
      function (p) {
        return p < 0.5
          ? Math.pow(p * 2, power) / 2
          : 1 - Math.pow((1 - p) * 2, power) / 2;
      },
    );
  });
  _easeMap.Linear.easeNone = _easeMap.none = _easeMap.Linear.easeIn;
  _insertEase(
    'Elastic',
    _configElastic('in'),
    _configElastic('out'),
    _configElastic(),
  );
  (function (n, c) {
    var n1 = 1 / c,
      n2 = 2 * n1,
      n3 = 2.5 * n1,
      easeOut = function easeOut2(p) {
        return p < n1
          ? n * p * p
          : p < n2
          ? n * Math.pow(p - 1.5 / c, 2) + 0.75
          : p < n3
          ? n * (p -= 2.25 / c) * p + 0.9375
          : n * Math.pow(p - 2.625 / c, 2) + 0.984375;
      };
    _insertEase(
      'Bounce',
      function (p) {
        return 1 - easeOut(1 - p);
      },
      easeOut,
    );
  })(7.5625, 2.75);
  _insertEase('Expo', function (p) {
    return p ? Math.pow(2, 10 * (p - 1)) : 0;
  });
  _insertEase('Circ', function (p) {
    return -(_sqrt(1 - p * p) - 1);
  });
  _insertEase('Sine', function (p) {
    return p === 1 ? 1 : -_cos(p * _HALF_PI) + 1;
  });
  _insertEase('Back', _configBack('in'), _configBack('out'), _configBack());
  _easeMap.SteppedEase =
    _easeMap.steps =
    _globals.SteppedEase =
      {
        config: function config(steps, immediateStart) {
          if (steps === void 0) {
            steps = 1;
          }
          var p1 = 1 / steps,
            p2 = steps + (immediateStart ? 0 : 1),
            p3 = immediateStart ? 1 : 0,
            max2 = 1 - _tinyNum;
          return function (p) {
            return (((p2 * _clamp(0, max2, p)) | 0) + p3) * p1;
          };
        },
      };
  _defaults.ease = _easeMap['quad.out'];
  _forEachName(
    'onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt',
    function (name) {
      return (_callbackNames += name + ',' + name + 'Params,');
    },
  );
  var GSCache = function GSCache2(target, harness) {
    this.id = _gsID++;
    target._gsap = this;
    this.target = target;
    this.harness = harness;
    this.get = harness ? harness.get : _getProperty;
    this.set = harness ? harness.getSetter : _getSetter;
  };
  var Animation = /* @__PURE__ */ (function () {
    function Animation2(vars) {
      this.vars = vars;
      this._delay = +vars.delay || 0;
      if ((this._repeat = vars.repeat === Infinity ? -2 : vars.repeat || 0)) {
        this._rDelay = vars.repeatDelay || 0;
        this._yoyo = !!vars.yoyo || !!vars.yoyoEase;
      }
      this._ts = 1;
      _setDuration(this, +vars.duration, 1, 1);
      this.data = vars.data;
      _tickerActive || _ticker.wake();
    }
    var _proto = Animation2.prototype;
    _proto.delay = function delay(value) {
      if (value || value === 0) {
        this.parent &&
          this.parent.smoothChildTiming &&
          this.startTime(this._start + value - this._delay);
        this._delay = value;
        return this;
      }
      return this._delay;
    };
    _proto.duration = function duration(value) {
      return arguments.length
        ? this.totalDuration(
            this._repeat > 0
              ? value + (value + this._rDelay) * this._repeat
              : value,
          )
        : this.totalDuration() && this._dur;
    };
    _proto.totalDuration = function totalDuration(value) {
      if (!arguments.length) {
        return this._tDur;
      }
      this._dirty = 0;
      return _setDuration(
        this,
        this._repeat < 0
          ? value
          : (value - this._repeat * this._rDelay) / (this._repeat + 1),
      );
    };
    _proto.totalTime = function totalTime(_totalTime, suppressEvents) {
      _wake();
      if (!arguments.length) {
        return this._tTime;
      }
      var parent = this._dp;
      if (parent && parent.smoothChildTiming && this._ts) {
        _alignPlayhead(this, _totalTime);
        !parent._dp || parent.parent || _postAddChecks(parent, this);
        while (parent.parent) {
          if (
            parent.parent._time !==
            parent._start +
              (parent._ts >= 0
                ? parent._tTime / parent._ts
                : (parent.totalDuration() - parent._tTime) / -parent._ts)
          ) {
            parent.totalTime(parent._tTime, true);
          }
          parent = parent.parent;
        }
        if (
          !this.parent &&
          this._dp.autoRemoveChildren &&
          ((this._ts > 0 && _totalTime < this._tDur) ||
            (this._ts < 0 && _totalTime > 0) ||
            (!this._tDur && !_totalTime))
        ) {
          _addToTimeline(this._dp, this, this._start - this._delay);
        }
      }
      if (
        this._tTime !== _totalTime ||
        (!this._dur && !suppressEvents) ||
        (this._initted && Math.abs(this._zTime) === _tinyNum) ||
        (!_totalTime && !this._initted && (this.add || this._ptLookup))
      ) {
        this._ts || (this._pTime = _totalTime);
        _lazySafeRender(this, _totalTime, suppressEvents);
      }
      return this;
    };
    _proto.time = function time(value, suppressEvents) {
      return arguments.length
        ? this.totalTime(
            Math.min(
              this.totalDuration(),
              value + _elapsedCycleDuration(this),
            ) % this._dur || (value ? this._dur : 0),
            suppressEvents,
          )
        : this._time;
    };
    _proto.totalProgress = function totalProgress(value, suppressEvents) {
      return arguments.length
        ? this.totalTime(this.totalDuration() * value, suppressEvents)
        : this.totalDuration()
        ? Math.min(1, this._tTime / this._tDur)
        : this.ratio;
    };
    _proto.progress = function progress(value, suppressEvents) {
      return arguments.length
        ? this.totalTime(
            this.duration() *
              (this._yoyo && !(this.iteration() & 1) ? 1 - value : value) +
              _elapsedCycleDuration(this),
            suppressEvents,
          )
        : this.duration()
        ? Math.min(1, this._time / this._dur)
        : this.ratio;
    };
    _proto.iteration = function iteration(value, suppressEvents) {
      var cycleDuration = this.duration() + this._rDelay;
      return arguments.length
        ? this.totalTime(
            this._time + (value - 1) * cycleDuration,
            suppressEvents,
          )
        : this._repeat
        ? _animationCycle(this._tTime, cycleDuration) + 1
        : 1;
    };
    _proto.timeScale = function timeScale(value) {
      if (!arguments.length) {
        return this._rts === -_tinyNum ? 0 : this._rts;
      }
      if (this._rts === value) {
        return this;
      }
      var tTime =
        this.parent && this._ts
          ? _parentToChildTotalTime(this.parent._time, this)
          : this._tTime;
      this._rts = +value || 0;
      this._ts = this._ps || value === -_tinyNum ? 0 : this._rts;
      return _recacheAncestors(
        this.totalTime(_clamp(-this._delay, this._tDur, tTime), true),
      );
    };
    _proto.paused = function paused(value) {
      if (!arguments.length) {
        return this._ps;
      }
      if (this._ps !== value) {
        this._ps = value;
        if (value) {
          this._pTime = this._tTime || Math.max(-this._delay, this.rawTime());
          this._ts = this._act = 0;
        } else {
          _wake();
          this._ts = this._rts;
          this.totalTime(
            this.parent && !this.parent.smoothChildTiming
              ? this.rawTime()
              : this._tTime || this._pTime,
            this.progress() === 1 &&
              (this._tTime -= _tinyNum) &&
              Math.abs(this._zTime) !== _tinyNum,
          );
        }
      }
      return this;
    };
    _proto.startTime = function startTime(value) {
      if (arguments.length) {
        this._start = value;
        var parent = this.parent || this._dp;
        parent &&
          (parent._sort || !this.parent) &&
          _addToTimeline(parent, this, value - this._delay);
        return this;
      }
      return this._start;
    };
    _proto.endTime = function endTime(includeRepeats) {
      return (
        this._start +
        (_isNotFalse(includeRepeats) ? this.totalDuration() : this.duration()) /
          Math.abs(this._ts)
      );
    };
    _proto.rawTime = function rawTime(wrapRepeats) {
      var parent = this.parent || this._dp;
      return !parent
        ? this._tTime
        : wrapRepeats &&
          (!this._ts ||
            (this._repeat && this._time && this.totalProgress() < 1))
        ? this._tTime % (this._dur + this._rDelay)
        : !this._ts
        ? this._tTime
        : _parentToChildTotalTime(parent.rawTime(wrapRepeats), this);
    };
    _proto.globalTime = function globalTime(rawTime) {
      var animation = this,
        time = arguments.length ? rawTime : animation.rawTime();
      while (animation) {
        time = animation._start + time / (animation._ts || 1);
        animation = animation._dp;
      }
      return time;
    };
    _proto.repeat = function repeat(value) {
      if (arguments.length) {
        this._repeat = value === Infinity ? -2 : value;
        return _onUpdateTotalDuration(this);
      }
      return this._repeat === -2 ? Infinity : this._repeat;
    };
    _proto.repeatDelay = function repeatDelay(value) {
      if (arguments.length) {
        this._rDelay = value;
        return _onUpdateTotalDuration(this);
      }
      return this._rDelay;
    };
    _proto.yoyo = function yoyo(value) {
      if (arguments.length) {
        this._yoyo = value;
        return this;
      }
      return this._yoyo;
    };
    _proto.seek = function seek(position, suppressEvents) {
      return this.totalTime(
        _parsePosition(this, position),
        _isNotFalse(suppressEvents),
      );
    };
    _proto.restart = function restart(includeDelay, suppressEvents) {
      return this.play().totalTime(
        includeDelay ? -this._delay : 0,
        _isNotFalse(suppressEvents),
      );
    };
    _proto.play = function play(from, suppressEvents) {
      from != null && this.seek(from, suppressEvents);
      return this.reversed(false).paused(false);
    };
    _proto.reverse = function reverse(from, suppressEvents) {
      from != null && this.seek(from || this.totalDuration(), suppressEvents);
      return this.reversed(true).paused(false);
    };
    _proto.pause = function pause(atTime, suppressEvents) {
      atTime != null && this.seek(atTime, suppressEvents);
      return this.paused(true);
    };
    _proto.resume = function resume() {
      return this.paused(false);
    };
    _proto.reversed = function reversed(value) {
      if (arguments.length) {
        !!value !== this.reversed() &&
          this.timeScale(-this._rts || (value ? -_tinyNum : 0));
        return this;
      }
      return this._rts < 0;
    };
    _proto.invalidate = function invalidate() {
      this._initted = this._act = 0;
      this._zTime = -_tinyNum;
      return this;
    };
    _proto.isActive = function isActive() {
      var parent = this.parent || this._dp,
        start3 = this._start,
        rawTime;
      return !!(
        !parent ||
        (this._ts &&
          this._initted &&
          parent.isActive() &&
          (rawTime = parent.rawTime(true)) >= start3 &&
          rawTime < this.endTime(true) - _tinyNum)
      );
    };
    _proto.eventCallback = function eventCallback(type, callback, params) {
      var vars = this.vars;
      if (arguments.length > 1) {
        if (!callback) {
          delete vars[type];
        } else {
          vars[type] = callback;
          params && (vars[type + 'Params'] = params);
          type === 'onUpdate' && (this._onUpdate = callback);
        }
        return this;
      }
      return vars[type];
    };
    _proto.then = function then(onFulfilled) {
      var self = this;
      return new Promise(function (resolve) {
        var f = _isFunction(onFulfilled) ? onFulfilled : _passThrough,
          _resolve = function _resolve2() {
            var _then = self.then;
            self.then = null;
            _isFunction(f) &&
              (f = f(self)) &&
              (f.then || f === self) &&
              (self.then = _then);
            resolve(f);
            self.then = _then;
          };
        if (
          (self._initted && self.totalProgress() === 1 && self._ts >= 0) ||
          (!self._tTime && self._ts < 0)
        ) {
          _resolve();
        } else {
          self._prom = _resolve;
        }
      });
    };
    _proto.kill = function kill() {
      _interrupt(this);
    };
    return Animation2;
  })();
  _setDefaults(Animation.prototype, {
    _time: 0,
    _start: 0,
    _end: 0,
    _tTime: 0,
    _tDur: 0,
    _dirty: 0,
    _repeat: 0,
    _yoyo: false,
    parent: null,
    _initted: false,
    _rDelay: 0,
    _ts: 1,
    _dp: 0,
    ratio: 0,
    _zTime: -_tinyNum,
    _prom: 0,
    _ps: false,
    _rts: 1,
  });
  var Timeline = /* @__PURE__ */ (function (_Animation) {
    _inheritsLoose(Timeline2, _Animation);
    function Timeline2(vars, position) {
      var _this;
      if (vars === void 0) {
        vars = {};
      }
      _this = _Animation.call(this, vars) || this;
      _this.labels = {};
      _this.smoothChildTiming = !!vars.smoothChildTiming;
      _this.autoRemoveChildren = !!vars.autoRemoveChildren;
      _this._sort = _isNotFalse(vars.sortChildren);
      _globalTimeline &&
        _addToTimeline(
          vars.parent || _globalTimeline,
          _assertThisInitialized(_this),
          position,
        );
      vars.reversed && _this.reverse();
      vars.paused && _this.paused(true);
      vars.scrollTrigger &&
        _scrollTrigger(_assertThisInitialized(_this), vars.scrollTrigger);
      return _this;
    }
    var _proto2 = Timeline2.prototype;
    _proto2.to = function to(targets, vars, position) {
      _createTweenType(0, arguments, this);
      return this;
    };
    _proto2.from = function from(targets, vars, position) {
      _createTweenType(1, arguments, this);
      return this;
    };
    _proto2.fromTo = function fromTo(targets, fromVars, toVars, position) {
      _createTweenType(2, arguments, this);
      return this;
    };
    _proto2.set = function set3(targets, vars, position) {
      vars.duration = 0;
      vars.parent = this;
      _inheritDefaults(vars).repeatDelay || (vars.repeat = 0);
      vars.immediateRender = !!vars.immediateRender;
      new Tween(targets, vars, _parsePosition(this, position), 1);
      return this;
    };
    _proto2.call = function call(callback, params, position) {
      return _addToTimeline(
        this,
        Tween.delayedCall(0, callback, params),
        position,
      );
    };
    _proto2.staggerTo = function staggerTo(
      targets,
      duration,
      vars,
      stagger,
      position,
      onCompleteAll,
      onCompleteAllParams,
    ) {
      vars.duration = duration;
      vars.stagger = vars.stagger || stagger;
      vars.onComplete = onCompleteAll;
      vars.onCompleteParams = onCompleteAllParams;
      vars.parent = this;
      new Tween(targets, vars, _parsePosition(this, position));
      return this;
    };
    _proto2.staggerFrom = function staggerFrom(
      targets,
      duration,
      vars,
      stagger,
      position,
      onCompleteAll,
      onCompleteAllParams,
    ) {
      vars.runBackwards = 1;
      _inheritDefaults(vars).immediateRender = _isNotFalse(
        vars.immediateRender,
      );
      return this.staggerTo(
        targets,
        duration,
        vars,
        stagger,
        position,
        onCompleteAll,
        onCompleteAllParams,
      );
    };
    _proto2.staggerFromTo = function staggerFromTo(
      targets,
      duration,
      fromVars,
      toVars,
      stagger,
      position,
      onCompleteAll,
      onCompleteAllParams,
    ) {
      toVars.startAt = fromVars;
      _inheritDefaults(toVars).immediateRender = _isNotFalse(
        toVars.immediateRender,
      );
      return this.staggerTo(
        targets,
        duration,
        toVars,
        stagger,
        position,
        onCompleteAll,
        onCompleteAllParams,
      );
    };
    _proto2.render = function render2(totalTime, suppressEvents, force) {
      var prevTime = this._time,
        tDur = this._dirty ? this.totalDuration() : this._tDur,
        dur = this._dur,
        tTime =
          this !== _globalTimeline &&
          totalTime > tDur - _tinyNum &&
          totalTime >= 0
            ? tDur
            : totalTime < _tinyNum
            ? 0
            : totalTime,
        crossingStart =
          this._zTime < 0 !== totalTime < 0 && (this._initted || !dur),
        time,
        child2,
        next2,
        iteration,
        cycleDuration,
        prevPaused,
        pauseTween,
        timeScale,
        prevStart,
        prevIteration,
        yoyo,
        isYoyo;
      if (tTime !== this._tTime || force || crossingStart) {
        if (prevTime !== this._time && dur) {
          tTime += this._time - prevTime;
          totalTime += this._time - prevTime;
        }
        time = tTime;
        prevStart = this._start;
        timeScale = this._ts;
        prevPaused = !timeScale;
        if (crossingStart) {
          dur || (prevTime = this._zTime);
          (totalTime || !suppressEvents) && (this._zTime = totalTime);
        }
        if (this._repeat) {
          yoyo = this._yoyo;
          cycleDuration = dur + this._rDelay;
          if (this._repeat < -1 && totalTime < 0) {
            return this.totalTime(
              cycleDuration * 100 + totalTime,
              suppressEvents,
              force,
            );
          }
          time = _round(tTime % cycleDuration);
          if (tTime === tDur) {
            iteration = this._repeat;
            time = dur;
          } else {
            iteration = ~~(tTime / cycleDuration);
            if (iteration && iteration === tTime / cycleDuration) {
              time = dur;
              iteration--;
            }
            time > dur && (time = dur);
          }
          prevIteration = _animationCycle(this._tTime, cycleDuration);
          !prevTime &&
            this._tTime &&
            prevIteration !== iteration &&
            (prevIteration = iteration);
          if (yoyo && iteration & 1) {
            time = dur - time;
            isYoyo = 1;
          }
          if (iteration !== prevIteration && !this._lock) {
            var rewinding = yoyo && prevIteration & 1,
              doesWrap = rewinding === (yoyo && iteration & 1);
            iteration < prevIteration && (rewinding = !rewinding);
            prevTime = rewinding ? 0 : dur;
            this._lock = 1;
            this.render(
              prevTime || (isYoyo ? 0 : _round(iteration * cycleDuration)),
              suppressEvents,
              !dur,
            )._lock = 0;
            this._tTime = tTime;
            !suppressEvents && this.parent && _callback(this, 'onRepeat');
            this.vars.repeatRefresh && !isYoyo && (this.invalidate()._lock = 1);
            if (
              (prevTime && prevTime !== this._time) ||
              prevPaused !== !this._ts ||
              (this.vars.onRepeat && !this.parent && !this._act)
            ) {
              return this;
            }
            dur = this._dur;
            tDur = this._tDur;
            if (doesWrap) {
              this._lock = 2;
              prevTime = rewinding ? dur : -1e-4;
              this.render(prevTime, true);
              this.vars.repeatRefresh && !isYoyo && this.invalidate();
            }
            this._lock = 0;
            if (!this._ts && !prevPaused) {
              return this;
            }
            _propagateYoyoEase(this, isYoyo);
          }
        }
        if (this._hasPause && !this._forcing && this._lock < 2) {
          pauseTween = _findNextPauseTween(
            this,
            _round(prevTime),
            _round(time),
          );
          if (pauseTween) {
            tTime -= time - (time = pauseTween._start);
          }
        }
        this._tTime = tTime;
        this._time = time;
        this._act = !timeScale;
        if (!this._initted) {
          this._onUpdate = this.vars.onUpdate;
          this._initted = 1;
          this._zTime = totalTime;
          prevTime = 0;
        }
        if (!prevTime && time && !suppressEvents) {
          _callback(this, 'onStart');
          if (this._tTime !== tTime) {
            return this;
          }
        }
        if (time >= prevTime && totalTime >= 0) {
          child2 = this._first;
          while (child2) {
            next2 = child2._next;
            if (
              (child2._act || time >= child2._start) &&
              child2._ts &&
              pauseTween !== child2
            ) {
              if (child2.parent !== this) {
                return this.render(totalTime, suppressEvents, force);
              }
              child2.render(
                child2._ts > 0
                  ? (time - child2._start) * child2._ts
                  : (child2._dirty ? child2.totalDuration() : child2._tDur) +
                      (time - child2._start) * child2._ts,
                suppressEvents,
                force,
              );
              if (time !== this._time || (!this._ts && !prevPaused)) {
                pauseTween = 0;
                next2 && (tTime += this._zTime = -_tinyNum);
                break;
              }
            }
            child2 = next2;
          }
        } else {
          child2 = this._last;
          var adjustedTime = totalTime < 0 ? totalTime : time;
          while (child2) {
            next2 = child2._prev;
            if (
              (child2._act || adjustedTime <= child2._end) &&
              child2._ts &&
              pauseTween !== child2
            ) {
              if (child2.parent !== this) {
                return this.render(totalTime, suppressEvents, force);
              }
              child2.render(
                child2._ts > 0
                  ? (adjustedTime - child2._start) * child2._ts
                  : (child2._dirty ? child2.totalDuration() : child2._tDur) +
                      (adjustedTime - child2._start) * child2._ts,
                suppressEvents,
                force,
              );
              if (time !== this._time || (!this._ts && !prevPaused)) {
                pauseTween = 0;
                next2 &&
                  (tTime += this._zTime = adjustedTime ? -_tinyNum : _tinyNum);
                break;
              }
            }
            child2 = next2;
          }
        }
        if (pauseTween && !suppressEvents) {
          this.pause();
          pauseTween.render(time >= prevTime ? 0 : -_tinyNum)._zTime =
            time >= prevTime ? 1 : -1;
          if (this._ts) {
            this._start = prevStart;
            _setEnd(this);
            return this.render(totalTime, suppressEvents, force);
          }
        }
        this._onUpdate && !suppressEvents && _callback(this, 'onUpdate', true);
        if (
          (tTime === tDur && tDur >= this.totalDuration()) ||
          (!tTime && prevTime)
        ) {
          if (
            prevStart === this._start ||
            Math.abs(timeScale) !== Math.abs(this._ts)
          ) {
            if (!this._lock) {
              (totalTime || !dur) &&
                ((tTime === tDur && this._ts > 0) ||
                  (!tTime && this._ts < 0)) &&
                _removeFromParent(this, 1);
              if (
                !suppressEvents &&
                !(totalTime < 0 && !prevTime) &&
                (tTime || prevTime || !tDur)
              ) {
                _callback(
                  this,
                  tTime === tDur && totalTime >= 0
                    ? 'onComplete'
                    : 'onReverseComplete',
                  true,
                );
                this._prom &&
                  !(tTime < tDur && this.timeScale() > 0) &&
                  this._prom();
              }
            }
          }
        }
      }
      return this;
    };
    _proto2.add = function add2(child2, position) {
      var _this2 = this;
      _isNumber(position) ||
        (position = _parsePosition(this, position, child2));
      if (!(child2 instanceof Animation)) {
        if (_isArray(child2)) {
          child2.forEach(function (obj) {
            return _this2.add(obj, position);
          });
          return this;
        }
        if (_isString(child2)) {
          return this.addLabel(child2, position);
        }
        if (_isFunction(child2)) {
          child2 = Tween.delayedCall(0, child2);
        } else {
          return this;
        }
      }
      return this !== child2 ? _addToTimeline(this, child2, position) : this;
    };
    _proto2.getChildren = function getChildren(
      nested,
      tweens,
      timelines,
      ignoreBeforeTime,
    ) {
      if (nested === void 0) {
        nested = true;
      }
      if (tweens === void 0) {
        tweens = true;
      }
      if (timelines === void 0) {
        timelines = true;
      }
      if (ignoreBeforeTime === void 0) {
        ignoreBeforeTime = -_bigNum;
      }
      var a = [],
        child2 = this._first;
      while (child2) {
        if (child2._start >= ignoreBeforeTime) {
          if (child2 instanceof Tween) {
            tweens && a.push(child2);
          } else {
            timelines && a.push(child2);
            nested &&
              a.push.apply(a, child2.getChildren(true, tweens, timelines));
          }
        }
        child2 = child2._next;
      }
      return a;
    };
    _proto2.getById = function getById2(id) {
      var animations = this.getChildren(1, 1, 1),
        i = animations.length;
      while (i--) {
        if (animations[i].vars.id === id) {
          return animations[i];
        }
      }
    };
    _proto2.remove = function remove2(child2) {
      if (_isString(child2)) {
        return this.removeLabel(child2);
      }
      if (_isFunction(child2)) {
        return this.killTweensOf(child2);
      }
      _removeLinkedListItem(this, child2);
      if (child2 === this._recent) {
        this._recent = this._last;
      }
      return _uncache(this);
    };
    _proto2.totalTime = function totalTime(_totalTime2, suppressEvents) {
      if (!arguments.length) {
        return this._tTime;
      }
      this._forcing = 1;
      if (!this._dp && this._ts) {
        this._start = _round(
          _ticker.time -
            (this._ts > 0
              ? _totalTime2 / this._ts
              : (this.totalDuration() - _totalTime2) / -this._ts),
        );
      }
      _Animation.prototype.totalTime.call(this, _totalTime2, suppressEvents);
      this._forcing = 0;
      return this;
    };
    _proto2.addLabel = function addLabel(label, position) {
      this.labels[label] = _parsePosition(this, position);
      return this;
    };
    _proto2.removeLabel = function removeLabel(label) {
      delete this.labels[label];
      return this;
    };
    _proto2.addPause = function addPause(position, callback, params) {
      var t = Tween.delayedCall(0, callback || _emptyFunc, params);
      t.data = 'isPause';
      this._hasPause = 1;
      return _addToTimeline(this, t, _parsePosition(this, position));
    };
    _proto2.removePause = function removePause(position) {
      var child2 = this._first;
      position = _parsePosition(this, position);
      while (child2) {
        if (child2._start === position && child2.data === 'isPause') {
          _removeFromParent(child2);
        }
        child2 = child2._next;
      }
    };
    _proto2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
      var tweens = this.getTweensOf(targets, onlyActive),
        i = tweens.length;
      while (i--) {
        _overwritingTween !== tweens[i] && tweens[i].kill(targets, props);
      }
      return this;
    };
    _proto2.getTweensOf = function getTweensOf2(targets, onlyActive) {
      var a = [],
        parsedTargets = toArray(targets),
        child2 = this._first,
        isGlobalTime = _isNumber(onlyActive),
        children2;
      while (child2) {
        if (child2 instanceof Tween) {
          if (
            _arrayContainsAny(child2._targets, parsedTargets) &&
            (isGlobalTime
              ? (!_overwritingTween || (child2._initted && child2._ts)) &&
                child2.globalTime(0) <= onlyActive &&
                child2.globalTime(child2.totalDuration()) > onlyActive
              : !onlyActive || child2.isActive())
          ) {
            a.push(child2);
          }
        } else if (
          (children2 = child2.getTweensOf(parsedTargets, onlyActive)).length
        ) {
          a.push.apply(a, children2);
        }
        child2 = child2._next;
      }
      return a;
    };
    _proto2.tweenTo = function tweenTo(position, vars) {
      vars = vars || {};
      var tl = this,
        endTime = _parsePosition(tl, position),
        _vars = vars,
        startAt = _vars.startAt,
        _onStart = _vars.onStart,
        onStartParams = _vars.onStartParams,
        immediateRender = _vars.immediateRender,
        initted,
        tween = Tween.to(
          tl,
          _setDefaults(
            {
              ease: vars.ease || 'none',
              lazy: false,
              immediateRender: false,
              time: endTime,
              overwrite: 'auto',
              duration:
                vars.duration ||
                Math.abs(
                  (endTime -
                    (startAt && 'time' in startAt ? startAt.time : tl._time)) /
                    tl.timeScale(),
                ) ||
                _tinyNum,
              onStart: function onStart() {
                tl.pause();
                if (!initted) {
                  var duration =
                    vars.duration ||
                    Math.abs(
                      (endTime -
                        (startAt && 'time' in startAt
                          ? startAt.time
                          : tl._time)) /
                        tl.timeScale(),
                    );
                  tween._dur !== duration &&
                    _setDuration(tween, duration, 0, 1).render(
                      tween._time,
                      true,
                      true,
                    );
                  initted = 1;
                }
                _onStart && _onStart.apply(tween, onStartParams || []);
              },
            },
            vars,
          ),
        );
      return immediateRender ? tween.render(0) : tween;
    };
    _proto2.tweenFromTo = function tweenFromTo(fromPosition, toPosition, vars) {
      return this.tweenTo(
        toPosition,
        _setDefaults(
          {
            startAt: {
              time: _parsePosition(this, fromPosition),
            },
          },
          vars,
        ),
      );
    };
    _proto2.recent = function recent() {
      return this._recent;
    };
    _proto2.nextLabel = function nextLabel(afterTime) {
      if (afterTime === void 0) {
        afterTime = this._time;
      }
      return _getLabelInDirection(this, _parsePosition(this, afterTime));
    };
    _proto2.previousLabel = function previousLabel(beforeTime) {
      if (beforeTime === void 0) {
        beforeTime = this._time;
      }
      return _getLabelInDirection(this, _parsePosition(this, beforeTime), 1);
    };
    _proto2.currentLabel = function currentLabel(value) {
      return arguments.length
        ? this.seek(value, true)
        : this.previousLabel(this._time + _tinyNum);
    };
    _proto2.shiftChildren = function shiftChildren(
      amount,
      adjustLabels,
      ignoreBeforeTime,
    ) {
      if (ignoreBeforeTime === void 0) {
        ignoreBeforeTime = 0;
      }
      var child2 = this._first,
        labels = this.labels,
        p;
      while (child2) {
        if (child2._start >= ignoreBeforeTime) {
          child2._start += amount;
          child2._end += amount;
        }
        child2 = child2._next;
      }
      if (adjustLabels) {
        for (p in labels) {
          if (labels[p] >= ignoreBeforeTime) {
            labels[p] += amount;
          }
        }
      }
      return _uncache(this);
    };
    _proto2.invalidate = function invalidate() {
      var child2 = this._first;
      this._lock = 0;
      while (child2) {
        child2.invalidate();
        child2 = child2._next;
      }
      return _Animation.prototype.invalidate.call(this);
    };
    _proto2.clear = function clear2(includeLabels) {
      if (includeLabels === void 0) {
        includeLabels = true;
      }
      var child2 = this._first,
        next2;
      while (child2) {
        next2 = child2._next;
        this.remove(child2);
        child2 = next2;
      }
      this._dp && (this._time = this._tTime = this._pTime = 0);
      includeLabels && (this.labels = {});
      return _uncache(this);
    };
    _proto2.totalDuration = function totalDuration(value) {
      var max2 = 0,
        self = this,
        child2 = self._last,
        prevStart = _bigNum,
        prev,
        start3,
        parent;
      if (arguments.length) {
        return self.timeScale(
          (self._repeat < 0 ? self.duration() : self.totalDuration()) /
            (self.reversed() ? -value : value),
        );
      }
      if (self._dirty) {
        parent = self.parent;
        while (child2) {
          prev = child2._prev;
          child2._dirty && child2.totalDuration();
          start3 = child2._start;
          if (start3 > prevStart && self._sort && child2._ts && !self._lock) {
            self._lock = 1;
            _addToTimeline(self, child2, start3 - child2._delay, 1)._lock = 0;
          } else {
            prevStart = start3;
          }
          if (start3 < 0 && child2._ts) {
            max2 -= start3;
            if (
              (!parent && !self._dp) ||
              (parent && parent.smoothChildTiming)
            ) {
              self._start += start3 / self._ts;
              self._time -= start3;
              self._tTime -= start3;
            }
            self.shiftChildren(-start3, false, -Infinity);
            prevStart = 0;
          }
          child2._end > max2 && child2._ts && (max2 = child2._end);
          child2 = prev;
        }
        _setDuration(
          self,
          self === _globalTimeline && self._time > max2 ? self._time : max2,
          1,
          1,
        );
        self._dirty = 0;
      }
      return self._tDur;
    };
    Timeline2.updateRoot = function updateRoot(time) {
      if (_globalTimeline._ts) {
        _lazySafeRender(
          _globalTimeline,
          _parentToChildTotalTime(time, _globalTimeline),
        );
        _lastRenderedFrame = _ticker.frame;
      }
      if (_ticker.frame >= _nextGCFrame) {
        _nextGCFrame += _config.autoSleep || 120;
        var child2 = _globalTimeline._first;
        if (!child2 || !child2._ts) {
          if (_config.autoSleep && _ticker._listeners.length < 2) {
            while (child2 && !child2._ts) {
              child2 = child2._next;
            }
            child2 || _ticker.sleep();
          }
        }
      }
    };
    return Timeline2;
  })(Animation);
  _setDefaults(Timeline.prototype, {
    _lock: 0,
    _hasPause: 0,
    _forcing: 0,
  });
  var _addComplexStringPropTween = function _addComplexStringPropTween2(
    target,
    prop,
    start3,
    end,
    setter,
    stringFilter,
    funcParam,
  ) {
    var pt = new PropTween(
        this._pt,
        target,
        prop,
        0,
        1,
        _renderComplexString,
        null,
        setter,
      ),
      index = 0,
      matchIndex = 0,
      result,
      startNums,
      color,
      endNum,
      chunk,
      startNum,
      hasRandom,
      a;
    pt.b = start3;
    pt.e = end;
    start3 += '';
    end += '';
    if ((hasRandom = ~end.indexOf('random('))) {
      end = _replaceRandom(end);
    }
    if (stringFilter) {
      a = [start3, end];
      stringFilter(a, target, prop);
      start3 = a[0];
      end = a[1];
    }
    startNums = start3.match(_complexStringNumExp) || [];
    while ((result = _complexStringNumExp.exec(end))) {
      endNum = result[0];
      chunk = end.substring(index, result.index);
      if (color) {
        color = (color + 1) % 5;
      } else if (chunk.substr(-5) === 'rgba(') {
        color = 1;
      }
      if (endNum !== startNums[matchIndex++]) {
        startNum = parseFloat(startNums[matchIndex - 1]) || 0;
        pt._pt = {
          _next: pt._pt,
          p: chunk || matchIndex === 1 ? chunk : ',',
          s: startNum,
          c:
            endNum.charAt(1) === '='
              ? parseFloat(endNum.substr(2)) *
                (endNum.charAt(0) === '-' ? -1 : 1)
              : parseFloat(endNum) - startNum,
          m: color && color < 4 ? Math.round : 0,
        };
        index = _complexStringNumExp.lastIndex;
      }
    }
    pt.c = index < end.length ? end.substring(index, end.length) : '';
    pt.fp = funcParam;
    if (_relExp.test(end) || hasRandom) {
      pt.e = 0;
    }
    this._pt = pt;
    return pt;
  };
  var _addPropTween = function _addPropTween2(
    target,
    prop,
    start3,
    end,
    index,
    targets,
    modifier,
    stringFilter,
    funcParam,
  ) {
    _isFunction(end) && (end = end(index || 0, target, targets));
    var currentValue = target[prop],
      parsedStart =
        start3 !== 'get'
          ? start3
          : !_isFunction(currentValue)
          ? currentValue
          : funcParam
          ? target[
              prop.indexOf('set') ||
              !_isFunction(target['get' + prop.substr(3)])
                ? prop
                : 'get' + prop.substr(3)
            ](funcParam)
          : target[prop](),
      setter = !_isFunction(currentValue)
        ? _setterPlain
        : funcParam
        ? _setterFuncWithParam
        : _setterFunc,
      pt;
    if (_isString(end)) {
      if (~end.indexOf('random(')) {
        end = _replaceRandom(end);
      }
      if (end.charAt(1) === '=') {
        pt =
          parseFloat(parsedStart) +
          parseFloat(end.substr(2)) * (end.charAt(0) === '-' ? -1 : 1) +
          (getUnit(parsedStart) || 0);
        if (pt || pt === 0) {
          end = pt;
        }
      }
    }
    if (parsedStart !== end) {
      if (!isNaN(parsedStart * end) && end !== '') {
        pt = new PropTween(
          this._pt,
          target,
          prop,
          +parsedStart || 0,
          end - (parsedStart || 0),
          typeof currentValue === 'boolean' ? _renderBoolean : _renderPlain,
          0,
          setter,
        );
        funcParam && (pt.fp = funcParam);
        modifier && pt.modifier(modifier, this, target);
        return (this._pt = pt);
      }
      !currentValue && !(prop in target) && _missingPlugin(prop, end);
      return _addComplexStringPropTween.call(
        this,
        target,
        prop,
        parsedStart,
        end,
        setter,
        stringFilter || _config.stringFilter,
        funcParam,
      );
    }
  };
  var _processVars = function _processVars2(
    vars,
    index,
    target,
    targets,
    tween,
  ) {
    _isFunction(vars) &&
      (vars = _parseFuncOrString(vars, tween, index, target, targets));
    if (
      !_isObject(vars) ||
      (vars.style && vars.nodeType) ||
      _isArray(vars) ||
      _isTypedArray(vars)
    ) {
      return _isString(vars)
        ? _parseFuncOrString(vars, tween, index, target, targets)
        : vars;
    }
    var copy = {},
      p;
    for (p in vars) {
      copy[p] = _parseFuncOrString(vars[p], tween, index, target, targets);
    }
    return copy;
  };
  var _checkPlugin = function _checkPlugin2(
    property,
    vars,
    tween,
    index,
    target,
    targets,
  ) {
    var plugin2, pt, ptLookup, i;
    if (
      _plugins[property] &&
      (plugin2 = new _plugins[property]()).init(
        target,
        plugin2.rawVars
          ? vars[property]
          : _processVars(vars[property], index, target, targets, tween),
        tween,
        index,
        targets,
      ) !== false
    ) {
      tween._pt = pt = new PropTween(
        tween._pt,
        target,
        property,
        0,
        1,
        plugin2.render,
        plugin2,
        0,
        plugin2.priority,
      );
      if (tween !== _quickTween) {
        ptLookup = tween._ptLookup[tween._targets.indexOf(target)];
        i = plugin2._props.length;
        while (i--) {
          ptLookup[plugin2._props[i]] = pt;
        }
      }
    }
    return plugin2;
  };
  var _overwritingTween;
  var _initTween = function _initTween2(tween, time) {
    var vars = tween.vars,
      ease = vars.ease,
      startAt = vars.startAt,
      immediateRender = vars.immediateRender,
      lazy = vars.lazy,
      onUpdate = vars.onUpdate,
      onUpdateParams = vars.onUpdateParams,
      callbackScope = vars.callbackScope,
      runBackwards = vars.runBackwards,
      yoyoEase = vars.yoyoEase,
      keyframes = vars.keyframes,
      autoRevert = vars.autoRevert,
      dur = tween._dur,
      prevStartAt = tween._startAt,
      targets = tween._targets,
      parent = tween.parent,
      fullTargets =
        parent && parent.data === 'nested' ? parent.parent._targets : targets,
      autoOverwrite = tween._overwrite === 'auto' && !_suppressOverwrites,
      tl = tween.timeline,
      cleanVars,
      i,
      p,
      pt,
      target,
      hasPriority,
      gsData,
      harness,
      plugin2,
      ptLookup,
      index,
      harnessVars,
      overwritten;
    tl && (!keyframes || !ease) && (ease = 'none');
    tween._ease = _parseEase(ease, _defaults.ease);
    tween._yEase = yoyoEase
      ? _invertEase(
          _parseEase(yoyoEase === true ? ease : yoyoEase, _defaults.ease),
        )
      : 0;
    if (yoyoEase && tween._yoyo && !tween._repeat) {
      yoyoEase = tween._yEase;
      tween._yEase = tween._ease;
      tween._ease = yoyoEase;
    }
    tween._from = !tl && !!vars.runBackwards;
    if (!tl) {
      harness = targets[0] ? _getCache(targets[0]).harness : 0;
      harnessVars = harness && vars[harness.prop];
      cleanVars = _copyExcluding(vars, _reservedProps);
      prevStartAt && prevStartAt.render(-1, true).kill();
      if (startAt) {
        _removeFromParent(
          (tween._startAt = Tween.set(
            targets,
            _setDefaults(
              {
                data: 'isStart',
                overwrite: false,
                parent,
                immediateRender: true,
                lazy: _isNotFalse(lazy),
                startAt: null,
                delay: 0,
                onUpdate,
                onUpdateParams,
                callbackScope,
                stagger: 0,
              },
              startAt,
            ),
          )),
        );
        time < 0 &&
          !immediateRender &&
          !autoRevert &&
          tween._startAt.render(-1, true);
        if (immediateRender) {
          time > 0 && !autoRevert && (tween._startAt = 0);
          if (dur && time <= 0) {
            time && (tween._zTime = time);
            return;
          }
        } else if (autoRevert === false) {
          tween._startAt = 0;
        }
      } else if (runBackwards && dur) {
        if (prevStartAt) {
          !autoRevert && (tween._startAt = 0);
        } else {
          time && (immediateRender = false);
          p = _setDefaults(
            {
              overwrite: false,
              data: 'isFromStart',
              lazy: immediateRender && _isNotFalse(lazy),
              immediateRender,
              stagger: 0,
              parent,
            },
            cleanVars,
          );
          harnessVars && (p[harness.prop] = harnessVars);
          _removeFromParent((tween._startAt = Tween.set(targets, p)));
          time < 0 && tween._startAt.render(-1, true);
          if (!immediateRender) {
            _initTween2(tween._startAt, _tinyNum);
          } else if (!time) {
            return;
          }
        }
      }
      tween._pt = 0;
      lazy = (dur && _isNotFalse(lazy)) || (lazy && !dur);
      for (i = 0; i < targets.length; i++) {
        target = targets[i];
        gsData = target._gsap || _harness(targets)[i]._gsap;
        tween._ptLookup[i] = ptLookup = {};
        _lazyLookup[gsData.id] && _lazyTweens.length && _lazyRender();
        index = fullTargets === targets ? i : fullTargets.indexOf(target);
        if (
          harness &&
          (plugin2 = new harness()).init(
            target,
            harnessVars || cleanVars,
            tween,
            index,
            fullTargets,
          ) !== false
        ) {
          tween._pt = pt = new PropTween(
            tween._pt,
            target,
            plugin2.name,
            0,
            1,
            plugin2.render,
            plugin2,
            0,
            plugin2.priority,
          );
          plugin2._props.forEach(function (name) {
            ptLookup[name] = pt;
          });
          plugin2.priority && (hasPriority = 1);
        }
        if (!harness || harnessVars) {
          for (p in cleanVars) {
            if (
              _plugins[p] &&
              (plugin2 = _checkPlugin(
                p,
                cleanVars,
                tween,
                index,
                target,
                fullTargets,
              ))
            ) {
              plugin2.priority && (hasPriority = 1);
            } else {
              ptLookup[p] = pt = _addPropTween.call(
                tween,
                target,
                p,
                'get',
                cleanVars[p],
                index,
                fullTargets,
                0,
                vars.stringFilter,
              );
            }
          }
        }
        tween._op && tween._op[i] && tween.kill(target, tween._op[i]);
        if (autoOverwrite && tween._pt) {
          _overwritingTween = tween;
          _globalTimeline.killTweensOf(target, ptLookup, tween.globalTime(0));
          overwritten = !tween.parent;
          _overwritingTween = 0;
        }
        tween._pt && lazy && (_lazyLookup[gsData.id] = 1);
      }
      hasPriority && _sortPropTweensByPriority(tween);
      tween._onInit && tween._onInit(tween);
    }
    tween._onUpdate = onUpdate;
    tween._initted = (!tween._op || tween._pt) && !overwritten;
  };
  var _addAliasesToVars = function _addAliasesToVars2(targets, vars) {
    var harness = targets[0] ? _getCache(targets[0]).harness : 0,
      propertyAliases = harness && harness.aliases,
      copy,
      p,
      i,
      aliases;
    if (!propertyAliases) {
      return vars;
    }
    copy = _merge({}, vars);
    for (p in propertyAliases) {
      if (p in copy) {
        aliases = propertyAliases[p].split(',');
        i = aliases.length;
        while (i--) {
          copy[aliases[i]] = copy[p];
        }
      }
    }
    return copy;
  };
  var _parseFuncOrString = function _parseFuncOrString2(
    value,
    tween,
    i,
    target,
    targets,
  ) {
    return _isFunction(value)
      ? value.call(tween, i, target, targets)
      : _isString(value) && ~value.indexOf('random(')
      ? _replaceRandom(value)
      : value;
  };
  var _staggerTweenProps =
    _callbackNames + 'repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase';
  var _staggerPropsToSkip = (
    _staggerTweenProps + ',id,stagger,delay,duration,paused,scrollTrigger'
  ).split(',');
  var Tween = /* @__PURE__ */ (function (_Animation2) {
    _inheritsLoose(Tween2, _Animation2);
    function Tween2(targets, vars, position, skipInherit) {
      var _this3;
      if (typeof vars === 'number') {
        position.duration = vars;
        vars = position;
        position = null;
      }
      _this3 =
        _Animation2.call(this, skipInherit ? vars : _inheritDefaults(vars)) ||
        this;
      var _this3$vars = _this3.vars,
        duration = _this3$vars.duration,
        delay = _this3$vars.delay,
        immediateRender = _this3$vars.immediateRender,
        stagger = _this3$vars.stagger,
        overwrite = _this3$vars.overwrite,
        keyframes = _this3$vars.keyframes,
        defaults2 = _this3$vars.defaults,
        scrollTrigger = _this3$vars.scrollTrigger,
        yoyoEase = _this3$vars.yoyoEase,
        parent = vars.parent || _globalTimeline,
        parsedTargets = (
          _isArray(targets) || _isTypedArray(targets)
            ? _isNumber(targets[0])
            : 'length' in vars
        )
          ? [targets]
          : toArray(targets),
        tl,
        i,
        copy,
        l,
        p,
        curTarget,
        staggerFunc,
        staggerVarsToMerge;
      _this3._targets = parsedTargets.length
        ? _harness(parsedTargets)
        : _warn(
            'GSAP target ' + targets + ' not found. https://greensock.com',
            !_config.nullTargetWarn,
          ) || [];
      _this3._ptLookup = [];
      _this3._overwrite = overwrite;
      if (
        keyframes ||
        stagger ||
        _isFuncOrString(duration) ||
        _isFuncOrString(delay)
      ) {
        vars = _this3.vars;
        tl = _this3.timeline = new Timeline({
          data: 'nested',
          defaults: defaults2 || {},
        });
        tl.kill();
        tl.parent = tl._dp = _assertThisInitialized(_this3);
        tl._start = 0;
        if (keyframes) {
          _setDefaults(tl.vars.defaults, {
            ease: 'none',
          });
          stagger
            ? parsedTargets.forEach(function (t, i2) {
                return keyframes.forEach(function (frame, j) {
                  return tl.to(t, frame, j ? '>' : i2 * stagger);
                });
              })
            : keyframes.forEach(function (frame) {
                return tl.to(parsedTargets, frame, '>');
              });
        } else {
          l = parsedTargets.length;
          staggerFunc = stagger ? distribute(stagger) : _emptyFunc;
          if (_isObject(stagger)) {
            for (p in stagger) {
              if (~_staggerTweenProps.indexOf(p)) {
                staggerVarsToMerge || (staggerVarsToMerge = {});
                staggerVarsToMerge[p] = stagger[p];
              }
            }
          }
          for (i = 0; i < l; i++) {
            copy = {};
            for (p in vars) {
              if (_staggerPropsToSkip.indexOf(p) < 0) {
                copy[p] = vars[p];
              }
            }
            copy.stagger = 0;
            yoyoEase && (copy.yoyoEase = yoyoEase);
            staggerVarsToMerge && _merge(copy, staggerVarsToMerge);
            curTarget = parsedTargets[i];
            copy.duration = +_parseFuncOrString(
              duration,
              _assertThisInitialized(_this3),
              i,
              curTarget,
              parsedTargets,
            );
            copy.delay =
              (+_parseFuncOrString(
                delay,
                _assertThisInitialized(_this3),
                i,
                curTarget,
                parsedTargets,
              ) || 0) - _this3._delay;
            if (!stagger && l === 1 && copy.delay) {
              _this3._delay = delay = copy.delay;
              _this3._start += delay;
              copy.delay = 0;
            }
            tl.to(curTarget, copy, staggerFunc(i, curTarget, parsedTargets));
          }
          tl.duration() ? (duration = delay = 0) : (_this3.timeline = 0);
        }
        duration || _this3.duration((duration = tl.duration()));
      } else {
        _this3.timeline = 0;
      }
      if (overwrite === true && !_suppressOverwrites) {
        _overwritingTween = _assertThisInitialized(_this3);
        _globalTimeline.killTweensOf(parsedTargets);
        _overwritingTween = 0;
      }
      _addToTimeline(parent, _assertThisInitialized(_this3), position);
      vars.reversed && _this3.reverse();
      vars.paused && _this3.paused(true);
      if (
        immediateRender ||
        (!duration &&
          !keyframes &&
          _this3._start === _round(parent._time) &&
          _isNotFalse(immediateRender) &&
          _hasNoPausedAncestors(_assertThisInitialized(_this3)) &&
          parent.data !== 'nested')
      ) {
        _this3._tTime = -_tinyNum;
        _this3.render(Math.max(0, -delay));
      }
      scrollTrigger &&
        _scrollTrigger(_assertThisInitialized(_this3), scrollTrigger);
      return _this3;
    }
    var _proto3 = Tween2.prototype;
    _proto3.render = function render2(totalTime, suppressEvents, force) {
      var prevTime = this._time,
        tDur = this._tDur,
        dur = this._dur,
        tTime =
          totalTime > tDur - _tinyNum && totalTime >= 0
            ? tDur
            : totalTime < _tinyNum
            ? 0
            : totalTime,
        time,
        pt,
        iteration,
        cycleDuration,
        prevIteration,
        isYoyo,
        ratio,
        timeline2,
        yoyoEase;
      if (!dur) {
        _renderZeroDurationTween(this, totalTime, suppressEvents, force);
      } else if (
        tTime !== this._tTime ||
        !totalTime ||
        force ||
        (!this._initted && this._tTime) ||
        (this._startAt && this._zTime < 0 !== totalTime < 0)
      ) {
        time = tTime;
        timeline2 = this.timeline;
        if (this._repeat) {
          cycleDuration = dur + this._rDelay;
          if (this._repeat < -1 && totalTime < 0) {
            return this.totalTime(
              cycleDuration * 100 + totalTime,
              suppressEvents,
              force,
            );
          }
          time = _round(tTime % cycleDuration);
          if (tTime === tDur) {
            iteration = this._repeat;
            time = dur;
          } else {
            iteration = ~~(tTime / cycleDuration);
            if (iteration && iteration === tTime / cycleDuration) {
              time = dur;
              iteration--;
            }
            time > dur && (time = dur);
          }
          isYoyo = this._yoyo && iteration & 1;
          if (isYoyo) {
            yoyoEase = this._yEase;
            time = dur - time;
          }
          prevIteration = _animationCycle(this._tTime, cycleDuration);
          if (time === prevTime && !force && this._initted) {
            return this;
          }
          if (iteration !== prevIteration) {
            timeline2 && this._yEase && _propagateYoyoEase(timeline2, isYoyo);
            if (this.vars.repeatRefresh && !isYoyo && !this._lock) {
              this._lock = force = 1;
              this.render(
                _round(cycleDuration * iteration),
                true,
              ).invalidate()._lock = 0;
            }
          }
        }
        if (!this._initted) {
          if (
            _attemptInitTween(
              this,
              totalTime < 0 ? totalTime : time,
              force,
              suppressEvents,
            )
          ) {
            this._tTime = 0;
            return this;
          }
          if (dur !== this._dur) {
            return this.render(totalTime, suppressEvents, force);
          }
        }
        this._tTime = tTime;
        this._time = time;
        if (!this._act && this._ts) {
          this._act = 1;
          this._lazy = 0;
        }
        this.ratio = ratio = (yoyoEase || this._ease)(time / dur);
        if (this._from) {
          this.ratio = ratio = 1 - ratio;
        }
        time && !prevTime && !suppressEvents && _callback(this, 'onStart');
        if (time && !prevTime && !suppressEvents) {
          _callback(this, 'onStart');
          if (this._tTime !== tTime) {
            return this;
          }
        }
        pt = this._pt;
        while (pt) {
          pt.r(ratio, pt.d);
          pt = pt._next;
        }
        (timeline2 &&
          timeline2.render(
            totalTime < 0
              ? totalTime
              : !time && isYoyo
              ? -_tinyNum
              : timeline2._dur * ratio,
            suppressEvents,
            force,
          )) ||
          (this._startAt && (this._zTime = totalTime));
        if (this._onUpdate && !suppressEvents) {
          totalTime < 0 &&
            this._startAt &&
            this._startAt.render(totalTime, true, force);
          _callback(this, 'onUpdate');
        }
        this._repeat &&
          iteration !== prevIteration &&
          this.vars.onRepeat &&
          !suppressEvents &&
          this.parent &&
          _callback(this, 'onRepeat');
        if ((tTime === this._tDur || !tTime) && this._tTime === tTime) {
          totalTime < 0 &&
            this._startAt &&
            !this._onUpdate &&
            this._startAt.render(totalTime, true, true);
          (totalTime || !dur) &&
            ((tTime === this._tDur && this._ts > 0) ||
              (!tTime && this._ts < 0)) &&
            _removeFromParent(this, 1);
          if (
            !suppressEvents &&
            !(totalTime < 0 && !prevTime) &&
            (tTime || prevTime)
          ) {
            _callback(
              this,
              tTime === tDur ? 'onComplete' : 'onReverseComplete',
              true,
            );
            this._prom &&
              !(tTime < tDur && this.timeScale() > 0) &&
              this._prom();
          }
        }
      }
      return this;
    };
    _proto3.targets = function targets() {
      return this._targets;
    };
    _proto3.invalidate = function invalidate() {
      this._pt =
        this._op =
        this._startAt =
        this._onUpdate =
        this._lazy =
        this.ratio =
          0;
      this._ptLookup = [];
      this.timeline && this.timeline.invalidate();
      return _Animation2.prototype.invalidate.call(this);
    };
    _proto3.kill = function kill(targets, vars) {
      if (vars === void 0) {
        vars = 'all';
      }
      if (!targets && (!vars || vars === 'all')) {
        this._lazy = this._pt = 0;
        return this.parent ? _interrupt(this) : this;
      }
      if (this.timeline) {
        var tDur = this.timeline.totalDuration();
        this.timeline.killTweensOf(
          targets,
          vars,
          _overwritingTween && _overwritingTween.vars.overwrite !== true,
        )._first || _interrupt(this);
        this.parent &&
          tDur !== this.timeline.totalDuration() &&
          _setDuration(this, (this._dur * this.timeline._tDur) / tDur, 0, 1);
        return this;
      }
      var parsedTargets = this._targets,
        killingTargets = targets ? toArray(targets) : parsedTargets,
        propTweenLookup = this._ptLookup,
        firstPT = this._pt,
        overwrittenProps,
        curLookup,
        curOverwriteProps,
        props,
        p,
        pt,
        i;
      if (
        (!vars || vars === 'all') &&
        _arraysMatch(parsedTargets, killingTargets)
      ) {
        vars === 'all' && (this._pt = 0);
        return _interrupt(this);
      }
      overwrittenProps = this._op = this._op || [];
      if (vars !== 'all') {
        if (_isString(vars)) {
          p = {};
          _forEachName(vars, function (name) {
            return (p[name] = 1);
          });
          vars = p;
        }
        vars = _addAliasesToVars(parsedTargets, vars);
      }
      i = parsedTargets.length;
      while (i--) {
        if (~killingTargets.indexOf(parsedTargets[i])) {
          curLookup = propTweenLookup[i];
          if (vars === 'all') {
            overwrittenProps[i] = vars;
            props = curLookup;
            curOverwriteProps = {};
          } else {
            curOverwriteProps = overwrittenProps[i] = overwrittenProps[i] || {};
            props = vars;
          }
          for (p in props) {
            pt = curLookup && curLookup[p];
            if (pt) {
              if (!('kill' in pt.d) || pt.d.kill(p) === true) {
                _removeLinkedListItem(this, pt, '_pt');
              }
              delete curLookup[p];
            }
            if (curOverwriteProps !== 'all') {
              curOverwriteProps[p] = 1;
            }
          }
        }
      }
      this._initted && !this._pt && firstPT && _interrupt(this);
      return this;
    };
    Tween2.to = function to(targets, vars) {
      return new Tween2(targets, vars, arguments[2]);
    };
    Tween2.from = function from(targets, vars) {
      return _createTweenType(1, arguments);
    };
    Tween2.delayedCall = function delayedCall(delay, callback, params, scope2) {
      return new Tween2(callback, 0, {
        immediateRender: false,
        lazy: false,
        overwrite: false,
        delay,
        onComplete: callback,
        onReverseComplete: callback,
        onCompleteParams: params,
        onReverseCompleteParams: params,
        callbackScope: scope2,
      });
    };
    Tween2.fromTo = function fromTo(targets, fromVars, toVars) {
      return _createTweenType(2, arguments);
    };
    Tween2.set = function set3(targets, vars) {
      vars.duration = 0;
      vars.repeatDelay || (vars.repeat = 0);
      return new Tween2(targets, vars);
    };
    Tween2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
      return _globalTimeline.killTweensOf(targets, props, onlyActive);
    };
    return Tween2;
  })(Animation);
  _setDefaults(Tween.prototype, {
    _targets: [],
    _lazy: 0,
    _startAt: 0,
    _op: 0,
    _onInit: 0,
  });
  _forEachName('staggerTo,staggerFrom,staggerFromTo', function (name) {
    Tween[name] = function () {
      var tl = new Timeline(),
        params = _slice.call(arguments, 0);
      params.splice(name === 'staggerFromTo' ? 5 : 4, 0, 0);
      return tl[name].apply(tl, params);
    };
  });
  var _setterPlain = function _setterPlain2(target, property, value) {
    return (target[property] = value);
  };
  var _setterFunc = function _setterFunc2(target, property, value) {
    return target[property](value);
  };
  var _setterFuncWithParam = function _setterFuncWithParam2(
    target,
    property,
    value,
    data2,
  ) {
    return target[property](data2.fp, value);
  };
  var _setterAttribute = function _setterAttribute2(target, property, value) {
    return target.setAttribute(property, value);
  };
  var _getSetter = function _getSetter2(target, property) {
    return _isFunction(target[property])
      ? _setterFunc
      : _isUndefined(target[property]) && target.setAttribute
      ? _setterAttribute
      : _setterPlain;
  };
  var _renderPlain = function _renderPlain2(ratio, data2) {
    return data2.set(
      data2.t,
      data2.p,
      Math.round((data2.s + data2.c * ratio) * 1e6) / 1e6,
      data2,
    );
  };
  var _renderBoolean = function _renderBoolean2(ratio, data2) {
    return data2.set(data2.t, data2.p, !!(data2.s + data2.c * ratio), data2);
  };
  var _renderComplexString = function _renderComplexString2(ratio, data2) {
    var pt = data2._pt,
      s = '';
    if (!ratio && data2.b) {
      s = data2.b;
    } else if (ratio === 1 && data2.e) {
      s = data2.e;
    } else {
      while (pt) {
        s =
          pt.p +
          (pt.m
            ? pt.m(pt.s + pt.c * ratio)
            : Math.round((pt.s + pt.c * ratio) * 1e4) / 1e4) +
          s;
        pt = pt._next;
      }
      s += data2.c;
    }
    data2.set(data2.t, data2.p, s, data2);
  };
  var _renderPropTweens = function _renderPropTweens2(ratio, data2) {
    var pt = data2._pt;
    while (pt) {
      pt.r(ratio, pt.d);
      pt = pt._next;
    }
  };
  var _addPluginModifier = function _addPluginModifier2(
    modifier,
    tween,
    target,
    property,
  ) {
    var pt = this._pt,
      next2;
    while (pt) {
      next2 = pt._next;
      pt.p === property && pt.modifier(modifier, tween, target);
      pt = next2;
    }
  };
  var _killPropTweensOf = function _killPropTweensOf2(property) {
    var pt = this._pt,
      hasNonDependentRemaining,
      next2;
    while (pt) {
      next2 = pt._next;
      if ((pt.p === property && !pt.op) || pt.op === property) {
        _removeLinkedListItem(this, pt, '_pt');
      } else if (!pt.dep) {
        hasNonDependentRemaining = 1;
      }
      pt = next2;
    }
    return !hasNonDependentRemaining;
  };
  var _setterWithModifier = function _setterWithModifier2(
    target,
    property,
    value,
    data2,
  ) {
    data2.mSet(
      target,
      property,
      data2.m.call(data2.tween, value, data2.mt),
      data2,
    );
  };
  var _sortPropTweensByPriority = function _sortPropTweensByPriority2(parent) {
    var pt = parent._pt,
      next2,
      pt2,
      first,
      last;
    while (pt) {
      next2 = pt._next;
      pt2 = first;
      while (pt2 && pt2.pr > pt.pr) {
        pt2 = pt2._next;
      }
      if ((pt._prev = pt2 ? pt2._prev : last)) {
        pt._prev._next = pt;
      } else {
        first = pt;
      }
      if ((pt._next = pt2)) {
        pt2._prev = pt;
      } else {
        last = pt;
      }
      pt = next2;
    }
    parent._pt = first;
  };
  var PropTween = /* @__PURE__ */ (function () {
    function PropTween3(
      next2,
      target,
      prop,
      start3,
      change,
      renderer,
      data2,
      setter,
      priority,
    ) {
      this.t = target;
      this.s = start3;
      this.c = change;
      this.p = prop;
      this.r = renderer || _renderPlain;
      this.d = data2 || this;
      this.set = setter || _setterPlain;
      this.pr = priority || 0;
      this._next = next2;
      if (next2) {
        next2._prev = this;
      }
    }
    var _proto4 = PropTween3.prototype;
    _proto4.modifier = function modifier(func, tween, target) {
      this.mSet = this.mSet || this.set;
      this.set = _setterWithModifier;
      this.m = func;
      this.mt = target;
      this.tween = tween;
    };
    return PropTween3;
  })();
  _forEachName(
    _callbackNames +
      'parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger',
    function (name) {
      return (_reservedProps[name] = 1);
    },
  );
  _globals.TweenMax = _globals.TweenLite = Tween;
  _globals.TimelineLite = _globals.TimelineMax = Timeline;
  _globalTimeline = new Timeline({
    sortChildren: false,
    defaults: _defaults,
    autoRemoveChildren: true,
    id: 'root',
    smoothChildTiming: true,
  });
  _config.stringFilter = _colorStringFilter;
  var _gsap = {
    registerPlugin: function registerPlugin() {
      for (
        var _len2 = arguments.length, args = new Array(_len2), _key2 = 0;
        _key2 < _len2;
        _key2++
      ) {
        args[_key2] = arguments[_key2];
      }
      args.forEach(function (config3) {
        return _createPlugin(config3);
      });
    },
    timeline: function timeline(vars) {
      return new Timeline(vars);
    },
    getTweensOf: function getTweensOf(targets, onlyActive) {
      return _globalTimeline.getTweensOf(targets, onlyActive);
    },
    getProperty: function getProperty(target, property, unit2, uncache) {
      _isString(target) && (target = toArray(target)[0]);
      var getter = _getCache(target || {}).get,
        format2 = unit2 ? _passThrough : _numericIfPossible;
      unit2 === 'native' && (unit2 = '');
      return !target
        ? target
        : !property
        ? function (property2, unit3, uncache2) {
            return format2(
              ((_plugins[property2] && _plugins[property2].get) || getter)(
                target,
                property2,
                unit3,
                uncache2,
              ),
            );
          }
        : format2(
            ((_plugins[property] && _plugins[property].get) || getter)(
              target,
              property,
              unit2,
              uncache,
            ),
          );
    },
    quickSetter: function quickSetter(target, property, unit2) {
      target = toArray(target);
      if (target.length > 1) {
        var setters = target.map(function (t) {
            return gsap.quickSetter(t, property, unit2);
          }),
          l = setters.length;
        return function (value) {
          var i = l;
          while (i--) {
            setters[i](value);
          }
        };
      }
      target = target[0] || {};
      var Plugin = _plugins[property],
        cache = _getCache(target),
        p =
          (cache.harness && (cache.harness.aliases || {})[property]) ||
          property,
        setter = Plugin
          ? function (value) {
              var p2 = new Plugin();
              _quickTween._pt = 0;
              p2.init(target, unit2 ? value + unit2 : value, _quickTween, 0, [
                target,
              ]);
              p2.render(1, p2);
              _quickTween._pt && _renderPropTweens(1, _quickTween);
            }
          : cache.set(target, p);
      return Plugin
        ? setter
        : function (value) {
            return setter(target, p, unit2 ? value + unit2 : value, cache, 1);
          };
    },
    isTweening: function isTweening(targets) {
      return _globalTimeline.getTweensOf(targets, true).length > 0;
    },
    defaults: function defaults(value) {
      value &&
        value.ease &&
        (value.ease = _parseEase(value.ease, _defaults.ease));
      return _mergeDeep(_defaults, value || {});
    },
    config: function config2(value) {
      return _mergeDeep(_config, value || {});
    },
    registerEffect: function registerEffect(_ref3) {
      var name = _ref3.name,
        effect3 = _ref3.effect,
        plugins = _ref3.plugins,
        defaults2 = _ref3.defaults,
        extendTimeline = _ref3.extendTimeline;
      (plugins || '').split(',').forEach(function (pluginName) {
        return (
          pluginName &&
          !_plugins[pluginName] &&
          !_globals[pluginName] &&
          _warn(name + ' effect requires ' + pluginName + ' plugin.')
        );
      });
      _effects[name] = function (targets, vars, tl) {
        return effect3(
          toArray(targets),
          _setDefaults(vars || {}, defaults2),
          tl,
        );
      };
      if (extendTimeline) {
        Timeline.prototype[name] = function (targets, vars, position) {
          return this.add(
            _effects[name](
              targets,
              _isObject(vars) ? vars : (position = vars) && {},
              this,
            ),
            position,
          );
        };
      }
    },
    registerEase: function registerEase(name, ease) {
      _easeMap[name] = _parseEase(ease);
    },
    parseEase: function parseEase(ease, defaultEase) {
      return arguments.length ? _parseEase(ease, defaultEase) : _easeMap;
    },
    getById: function getById(id) {
      return _globalTimeline.getById(id);
    },
    exportRoot: function exportRoot(vars, includeDelayedCalls) {
      if (vars === void 0) {
        vars = {};
      }
      var tl = new Timeline(vars),
        child2,
        next2;
      tl.smoothChildTiming = _isNotFalse(vars.smoothChildTiming);
      _globalTimeline.remove(tl);
      tl._dp = 0;
      tl._time = tl._tTime = _globalTimeline._time;
      child2 = _globalTimeline._first;
      while (child2) {
        next2 = child2._next;
        if (
          includeDelayedCalls ||
          !(
            !child2._dur &&
            child2 instanceof Tween &&
            child2.vars.onComplete === child2._targets[0]
          )
        ) {
          _addToTimeline(tl, child2, child2._start - child2._delay);
        }
        child2 = next2;
      }
      _addToTimeline(_globalTimeline, tl, 0);
      return tl;
    },
    utils: {
      wrap,
      wrapYoyo,
      distribute,
      random,
      snap,
      normalize,
      getUnit,
      clamp,
      splitColor,
      toArray,
      selector,
      mapRange,
      pipe,
      unitize,
      interpolate,
      shuffle,
    },
    install: _install,
    effects: _effects,
    ticker: _ticker,
    updateRoot: Timeline.updateRoot,
    plugins: _plugins,
    globalTimeline: _globalTimeline,
    core: {
      PropTween,
      globals: _addGlobal,
      Tween,
      Timeline,
      Animation,
      getCache: _getCache,
      _removeLinkedListItem,
      suppressOverwrites: function suppressOverwrites(value) {
        return (_suppressOverwrites = value);
      },
    },
  };
  _forEachName('to,from,fromTo,delayedCall,set,killTweensOf', function (name) {
    return (_gsap[name] = Tween[name]);
  });
  _ticker.add(Timeline.updateRoot);
  _quickTween = _gsap.to(
    {},
    {
      duration: 0,
    },
  );
  var _getPluginPropTween = function _getPluginPropTween2(plugin2, prop) {
    var pt = plugin2._pt;
    while (pt && pt.p !== prop && pt.op !== prop && pt.fp !== prop) {
      pt = pt._next;
    }
    return pt;
  };
  var _addModifiers = function _addModifiers2(tween, modifiers) {
    var targets = tween._targets,
      p,
      i,
      pt;
    for (p in modifiers) {
      i = targets.length;
      while (i--) {
        pt = tween._ptLookup[i][p];
        if (pt && (pt = pt.d)) {
          if (pt._pt) {
            pt = _getPluginPropTween(pt, p);
          }
          pt && pt.modifier && pt.modifier(modifiers[p], tween, targets[i], p);
        }
      }
    }
  };
  var _buildModifierPlugin = function _buildModifierPlugin2(name, modifier) {
    return {
      name,
      rawVars: 1,
      init: function init5(target, vars, tween) {
        tween._onInit = function (tween2) {
          var temp, p;
          if (_isString(vars)) {
            temp = {};
            _forEachName(vars, function (name2) {
              return (temp[name2] = 1);
            });
            vars = temp;
          }
          if (modifier) {
            temp = {};
            for (p in vars) {
              temp[p] = modifier(vars[p]);
            }
            vars = temp;
          }
          _addModifiers(tween2, vars);
        };
      },
    };
  };
  var gsap =
    _gsap.registerPlugin(
      {
        name: 'attr',
        init: function init(target, vars, tween, index, targets) {
          var p, pt;
          for (p in vars) {
            pt = this.add(
              target,
              'setAttribute',
              (target.getAttribute(p) || 0) + '',
              vars[p],
              index,
              targets,
              0,
              0,
              p,
            );
            pt && (pt.op = p);
            this._props.push(p);
          }
        },
      },
      {
        name: 'endArray',
        init: function init2(target, value) {
          var i = value.length;
          while (i--) {
            this.add(target, i, target[i] || 0, value[i]);
          }
        },
      },
      _buildModifierPlugin('roundProps', _roundModifier),
      _buildModifierPlugin('modifiers'),
      _buildModifierPlugin('snap', snap),
    ) || _gsap;
  Tween.version = Timeline.version = gsap.version = '3.7.0';
  _coreReady = 1;
  _windowExists() && _wake();
  var Power0 = _easeMap.Power0;
  var Power1 = _easeMap.Power1;
  var Power2 = _easeMap.Power2;
  var Power3 = _easeMap.Power3;
  var Power4 = _easeMap.Power4;
  var Linear = _easeMap.Linear;
  var Quad = _easeMap.Quad;
  var Cubic = _easeMap.Cubic;
  var Quart = _easeMap.Quart;
  var Quint = _easeMap.Quint;
  var Strong = _easeMap.Strong;
  var Elastic = _easeMap.Elastic;
  var Back = _easeMap.Back;
  var SteppedEase = _easeMap.SteppedEase;
  var Bounce = _easeMap.Bounce;
  var Sine = _easeMap.Sine;
  var Expo = _easeMap.Expo;
  var Circ = _easeMap.Circ;

  // node_modules/gsap/CSSPlugin.js
  var _win2;
  var _doc2;
  var _docElement;
  var _pluginInitted;
  var _tempDiv;
  var _tempDivStyler;
  var _recentSetterPlugin;
  var _windowExists3 = function _windowExists4() {
    return typeof window !== 'undefined';
  };
  var _transformProps = {};
  var _RAD2DEG = 180 / Math.PI;
  var _DEG2RAD = Math.PI / 180;
  var _atan2 = Math.atan2;
  var _bigNum2 = 1e8;
  var _capsExp = /([A-Z])/g;
  var _horizontalExp = /(?:left|right|width|margin|padding|x)/i;
  var _complexExp = /[\s,\(]\S/;
  var _propertyAliases = {
    autoAlpha: 'opacity,visibility',
    scale: 'scaleX,scaleY',
    alpha: 'opacity',
  };
  var _renderCSSProp = function _renderCSSProp2(ratio, data2) {
    return data2.set(
      data2.t,
      data2.p,
      Math.round((data2.s + data2.c * ratio) * 1e4) / 1e4 + data2.u,
      data2,
    );
  };
  var _renderPropWithEnd = function _renderPropWithEnd2(ratio, data2) {
    return data2.set(
      data2.t,
      data2.p,
      ratio === 1
        ? data2.e
        : Math.round((data2.s + data2.c * ratio) * 1e4) / 1e4 + data2.u,
      data2,
    );
  };
  var _renderCSSPropWithBeginning = function _renderCSSPropWithBeginning2(
    ratio,
    data2,
  ) {
    return data2.set(
      data2.t,
      data2.p,
      ratio
        ? Math.round((data2.s + data2.c * ratio) * 1e4) / 1e4 + data2.u
        : data2.b,
      data2,
    );
  };
  var _renderRoundedCSSProp = function _renderRoundedCSSProp2(ratio, data2) {
    var value = data2.s + data2.c * ratio;
    data2.set(
      data2.t,
      data2.p,
      ~~(value + (value < 0 ? -0.5 : 0.5)) + data2.u,
      data2,
    );
  };
  var _renderNonTweeningValue = function _renderNonTweeningValue2(
    ratio,
    data2,
  ) {
    return data2.set(data2.t, data2.p, ratio ? data2.e : data2.b, data2);
  };
  var _renderNonTweeningValueOnlyAtEnd =
    function _renderNonTweeningValueOnlyAtEnd2(ratio, data2) {
      return data2.set(
        data2.t,
        data2.p,
        ratio !== 1 ? data2.b : data2.e,
        data2,
      );
    };
  var _setterCSSStyle = function _setterCSSStyle2(target, property, value) {
    return (target.style[property] = value);
  };
  var _setterCSSProp = function _setterCSSProp2(target, property, value) {
    return target.style.setProperty(property, value);
  };
  var _setterTransform = function _setterTransform2(target, property, value) {
    return (target._gsap[property] = value);
  };
  var _setterScale = function _setterScale2(target, property, value) {
    return (target._gsap.scaleX = target._gsap.scaleY = value);
  };
  var _setterScaleWithRender = function _setterScaleWithRender2(
    target,
    property,
    value,
    data2,
    ratio,
  ) {
    var cache = target._gsap;
    cache.scaleX = cache.scaleY = value;
    cache.renderTransform(ratio, cache);
  };
  var _setterTransformWithRender = function _setterTransformWithRender2(
    target,
    property,
    value,
    data2,
    ratio,
  ) {
    var cache = target._gsap;
    cache[property] = value;
    cache.renderTransform(ratio, cache);
  };
  var _transformProp = 'transform';
  var _transformOriginProp = _transformProp + 'Origin';
  var _supports3D;
  var _createElement = function _createElement2(type, ns) {
    var e = _doc2.createElementNS
      ? _doc2.createElementNS(
          (ns || 'http://www.w3.org/1999/xhtml').replace(/^https/, 'http'),
          type,
        )
      : _doc2.createElement(type);
    return e.style ? e : _doc2.createElement(type);
  };
  var _getComputedProperty = function _getComputedProperty2(
    target,
    property,
    skipPrefixFallback,
  ) {
    var cs = getComputedStyle(target);
    return (
      cs[property] ||
      cs.getPropertyValue(property.replace(_capsExp, '-$1').toLowerCase()) ||
      cs.getPropertyValue(property) ||
      (!skipPrefixFallback &&
        _getComputedProperty2(
          target,
          _checkPropPrefix(property) || property,
          1,
        )) ||
      ''
    );
  };
  var _prefixes = 'O,Moz,ms,Ms,Webkit'.split(',');
  var _checkPropPrefix = function _checkPropPrefix2(
    property,
    element,
    preferPrefix,
  ) {
    var e = element || _tempDiv,
      s = e.style,
      i = 5;
    if (property in s && !preferPrefix) {
      return property;
    }
    property = property.charAt(0).toUpperCase() + property.substr(1);
    while (i-- && !(_prefixes[i] + property in s)) {}
    return i < 0
      ? null
      : (i === 3 ? 'ms' : i >= 0 ? _prefixes[i] : '') + property;
  };
  var _initCore = function _initCore2() {
    if (_windowExists3() && window.document) {
      _win2 = window;
      _doc2 = _win2.document;
      _docElement = _doc2.documentElement;
      _tempDiv = _createElement('div') || {
        style: {},
      };
      _tempDivStyler = _createElement('div');
      _transformProp = _checkPropPrefix(_transformProp);
      _transformOriginProp = _transformProp + 'Origin';
      _tempDiv.style.cssText =
        'border-width:0;line-height:0;position:absolute;padding:0';
      _supports3D = !!_checkPropPrefix('perspective');
      _pluginInitted = 1;
    }
  };
  var _getBBoxHack = function _getBBoxHack2(swapIfPossible) {
    var svg = _createElement(
        'svg',
        (this.ownerSVGElement && this.ownerSVGElement.getAttribute('xmlns')) ||
          'http://www.w3.org/2000/svg',
      ),
      oldParent = this.parentNode,
      oldSibling = this.nextSibling,
      oldCSS = this.style.cssText,
      bbox;
    _docElement.appendChild(svg);
    svg.appendChild(this);
    this.style.display = 'block';
    if (swapIfPossible) {
      try {
        bbox = this.getBBox();
        this._gsapBBox = this.getBBox;
        this.getBBox = _getBBoxHack2;
      } catch (e) {}
    } else if (this._gsapBBox) {
      bbox = this._gsapBBox();
    }
    if (oldParent) {
      if (oldSibling) {
        oldParent.insertBefore(this, oldSibling);
      } else {
        oldParent.appendChild(this);
      }
    }
    _docElement.removeChild(svg);
    this.style.cssText = oldCSS;
    return bbox;
  };
  var _getAttributeFallbacks = function _getAttributeFallbacks2(
    target,
    attributesArray,
  ) {
    var i = attributesArray.length;
    while (i--) {
      if (target.hasAttribute(attributesArray[i])) {
        return target.getAttribute(attributesArray[i]);
      }
    }
  };
  var _getBBox = function _getBBox2(target) {
    var bounds;
    try {
      bounds = target.getBBox();
    } catch (error2) {
      bounds = _getBBoxHack.call(target, true);
    }
    (bounds && (bounds.width || bounds.height)) ||
      target.getBBox === _getBBoxHack ||
      (bounds = _getBBoxHack.call(target, true));
    return bounds && !bounds.width && !bounds.x && !bounds.y
      ? {
          x: +_getAttributeFallbacks(target, ['x', 'cx', 'x1']) || 0,
          y: +_getAttributeFallbacks(target, ['y', 'cy', 'y1']) || 0,
          width: 0,
          height: 0,
        }
      : bounds;
  };
  var _isSVG = function _isSVG2(e) {
    return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && _getBBox(e));
  };
  var _removeProperty = function _removeProperty2(target, property) {
    if (property) {
      var style2 = target.style;
      if (property in _transformProps && property !== _transformOriginProp) {
        property = _transformProp;
      }
      if (style2.removeProperty) {
        if (
          property.substr(0, 2) === 'ms' ||
          property.substr(0, 6) === 'webkit'
        ) {
          property = '-' + property;
        }
        style2.removeProperty(property.replace(_capsExp, '-$1').toLowerCase());
      } else {
        style2.removeAttribute(property);
      }
    }
  };
  var _addNonTweeningPT = function _addNonTweeningPT2(
    plugin2,
    target,
    property,
    beginning,
    end,
    onlySetAtEnd,
  ) {
    var pt = new PropTween(
      plugin2._pt,
      target,
      property,
      0,
      1,
      onlySetAtEnd ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue,
    );
    plugin2._pt = pt;
    pt.b = beginning;
    pt.e = end;
    plugin2._props.push(property);
    return pt;
  };
  var _nonConvertibleUnits = {
    deg: 1,
    rad: 1,
    turn: 1,
  };
  var _convertToUnit = function _convertToUnit2(
    target,
    property,
    value,
    unit2,
  ) {
    var curValue = parseFloat(value) || 0,
      curUnit = (value + '').trim().substr((curValue + '').length) || 'px',
      style2 = _tempDiv.style,
      horizontal = _horizontalExp.test(property),
      isRootSVG = target.tagName.toLowerCase() === 'svg',
      measureProperty =
        (isRootSVG ? 'client' : 'offset') + (horizontal ? 'Width' : 'Height'),
      amount = 100,
      toPixels = unit2 === 'px',
      toPercent = unit2 === '%',
      px,
      parent,
      cache,
      isSVG;
    if (
      unit2 === curUnit ||
      !curValue ||
      _nonConvertibleUnits[unit2] ||
      _nonConvertibleUnits[curUnit]
    ) {
      return curValue;
    }
    curUnit !== 'px' &&
      !toPixels &&
      (curValue = _convertToUnit2(target, property, value, 'px'));
    isSVG = target.getCTM && _isSVG(target);
    if (
      (toPercent || curUnit === '%') &&
      (_transformProps[property] || ~property.indexOf('adius'))
    ) {
      px = isSVG
        ? target.getBBox()[horizontal ? 'width' : 'height']
        : target[measureProperty];
      return _round(
        toPercent ? (curValue / px) * amount : (curValue / 100) * px,
      );
    }
    style2[horizontal ? 'width' : 'height'] =
      amount + (toPixels ? curUnit : unit2);
    parent =
      ~property.indexOf('adius') ||
      (unit2 === 'em' && target.appendChild && !isRootSVG)
        ? target
        : target.parentNode;
    if (isSVG) {
      parent = (target.ownerSVGElement || {}).parentNode;
    }
    if (!parent || parent === _doc2 || !parent.appendChild) {
      parent = _doc2.body;
    }
    cache = parent._gsap;
    if (
      cache &&
      toPercent &&
      cache.width &&
      horizontal &&
      cache.time === _ticker.time
    ) {
      return _round((curValue / cache.width) * amount);
    } else {
      (toPercent || curUnit === '%') &&
        (style2.position = _getComputedProperty(target, 'position'));
      parent === target && (style2.position = 'static');
      parent.appendChild(_tempDiv);
      px = _tempDiv[measureProperty];
      parent.removeChild(_tempDiv);
      style2.position = 'absolute';
      if (horizontal && toPercent) {
        cache = _getCache(parent);
        cache.time = _ticker.time;
        cache.width = parent[measureProperty];
      }
    }
    return _round(
      toPixels
        ? (px * curValue) / amount
        : px && curValue
        ? (amount / px) * curValue
        : 0,
    );
  };
  var _get = function _get2(target, property, unit2, uncache) {
    var value;
    _pluginInitted || _initCore();
    if (property in _propertyAliases && property !== 'transform') {
      property = _propertyAliases[property];
      if (~property.indexOf(',')) {
        property = property.split(',')[0];
      }
    }
    if (_transformProps[property] && property !== 'transform') {
      value = _parseTransform(target, uncache);
      value =
        property !== 'transformOrigin'
          ? value[property]
          : value.svg
          ? value.origin
          : _firstTwoOnly(_getComputedProperty(target, _transformOriginProp)) +
            ' ' +
            value.zOrigin +
            'px';
    } else {
      value = target.style[property];
      if (
        !value ||
        value === 'auto' ||
        uncache ||
        ~(value + '').indexOf('calc(')
      ) {
        value =
          (_specialProps[property] &&
            _specialProps[property](target, property, unit2)) ||
          _getComputedProperty(target, property) ||
          _getProperty(target, property) ||
          (property === 'opacity' ? 1 : 0);
      }
    }
    return unit2 && !~(value + '').trim().indexOf(' ')
      ? _convertToUnit(target, property, value, unit2) + unit2
      : value;
  };
  var _tweenComplexCSSString = function _tweenComplexCSSString2(
    target,
    prop,
    start3,
    end,
  ) {
    if (!start3 || start3 === 'none') {
      var p = _checkPropPrefix(prop, target, 1),
        s = p && _getComputedProperty(target, p, 1);
      if (s && s !== start3) {
        prop = p;
        start3 = s;
      } else if (prop === 'borderColor') {
        start3 = _getComputedProperty(target, 'borderTopColor');
      }
    }
    var pt = new PropTween(
        this._pt,
        target.style,
        prop,
        0,
        1,
        _renderComplexString,
      ),
      index = 0,
      matchIndex = 0,
      a,
      result,
      startValues,
      startNum,
      color,
      startValue,
      endValue,
      endNum,
      chunk,
      endUnit,
      startUnit,
      relative,
      endValues;
    pt.b = start3;
    pt.e = end;
    start3 += '';
    end += '';
    if (end === 'auto') {
      target.style[prop] = end;
      end = _getComputedProperty(target, prop) || end;
      target.style[prop] = start3;
    }
    a = [start3, end];
    _colorStringFilter(a);
    start3 = a[0];
    end = a[1];
    startValues = start3.match(_numWithUnitExp) || [];
    endValues = end.match(_numWithUnitExp) || [];
    if (endValues.length) {
      while ((result = _numWithUnitExp.exec(end))) {
        endValue = result[0];
        chunk = end.substring(index, result.index);
        if (color) {
          color = (color + 1) % 5;
        } else if (
          chunk.substr(-5) === 'rgba(' ||
          chunk.substr(-5) === 'hsla('
        ) {
          color = 1;
        }
        if (endValue !== (startValue = startValues[matchIndex++] || '')) {
          startNum = parseFloat(startValue) || 0;
          startUnit = startValue.substr((startNum + '').length);
          relative =
            endValue.charAt(1) === '=' ? +(endValue.charAt(0) + '1') : 0;
          if (relative) {
            endValue = endValue.substr(2);
          }
          endNum = parseFloat(endValue);
          endUnit = endValue.substr((endNum + '').length);
          index = _numWithUnitExp.lastIndex - endUnit.length;
          if (!endUnit) {
            endUnit = endUnit || _config.units[prop] || startUnit;
            if (index === end.length) {
              end += endUnit;
              pt.e += endUnit;
            }
          }
          if (startUnit !== endUnit) {
            startNum = _convertToUnit(target, prop, startValue, endUnit) || 0;
          }
          pt._pt = {
            _next: pt._pt,
            p: chunk || matchIndex === 1 ? chunk : ',',
            s: startNum,
            c: relative ? relative * endNum : endNum - startNum,
            m: (color && color < 4) || prop === 'zIndex' ? Math.round : 0,
          };
        }
      }
      pt.c = index < end.length ? end.substring(index, end.length) : '';
    } else {
      pt.r =
        prop === 'display' && end === 'none'
          ? _renderNonTweeningValueOnlyAtEnd
          : _renderNonTweeningValue;
    }
    _relExp.test(end) && (pt.e = 0);
    this._pt = pt;
    return pt;
  };
  var _keywordToPercent = {
    top: '0%',
    bottom: '100%',
    left: '0%',
    right: '100%',
    center: '50%',
  };
  var _convertKeywordsToPercentages = function _convertKeywordsToPercentages2(
    value,
  ) {
    var split = value.split(' '),
      x = split[0],
      y = split[1] || '50%';
    if (x === 'top' || x === 'bottom' || y === 'left' || y === 'right') {
      value = x;
      x = y;
      y = value;
    }
    split[0] = _keywordToPercent[x] || x;
    split[1] = _keywordToPercent[y] || y;
    return split.join(' ');
  };
  var _renderClearProps = function _renderClearProps2(ratio, data2) {
    if (data2.tween && data2.tween._time === data2.tween._dur) {
      var target = data2.t,
        style2 = target.style,
        props = data2.u,
        cache = target._gsap,
        prop,
        clearTransforms,
        i;
      if (props === 'all' || props === true) {
        style2.cssText = '';
        clearTransforms = 1;
      } else {
        props = props.split(',');
        i = props.length;
        while (--i > -1) {
          prop = props[i];
          if (_transformProps[prop]) {
            clearTransforms = 1;
            prop =
              prop === 'transformOrigin'
                ? _transformOriginProp
                : _transformProp;
          }
          _removeProperty(target, prop);
        }
      }
      if (clearTransforms) {
        _removeProperty(target, _transformProp);
        if (cache) {
          cache.svg && target.removeAttribute('transform');
          _parseTransform(target, 1);
          cache.uncache = 1;
        }
      }
    }
  };
  var _specialProps = {
    clearProps: function clearProps(
      plugin2,
      target,
      property,
      endValue,
      tween,
    ) {
      if (tween.data !== 'isFromStart') {
        var pt = (plugin2._pt = new PropTween(
          plugin2._pt,
          target,
          property,
          0,
          0,
          _renderClearProps,
        ));
        pt.u = endValue;
        pt.pr = -10;
        pt.tween = tween;
        plugin2._props.push(property);
        return 1;
      }
    },
  };
  var _identity2DMatrix = [1, 0, 0, 1, 0, 0];
  var _rotationalProperties = {};
  var _isNullTransform = function _isNullTransform2(value) {
    return value === 'matrix(1, 0, 0, 1, 0, 0)' || value === 'none' || !value;
  };
  var _getComputedTransformMatrixAsArray =
    function _getComputedTransformMatrixAsArray2(target) {
      var matrixString = _getComputedProperty(target, _transformProp);
      return _isNullTransform(matrixString)
        ? _identity2DMatrix
        : matrixString.substr(7).match(_numExp).map(_round);
    };
  var _getMatrix = function _getMatrix2(target, force2D) {
    var cache = target._gsap || _getCache(target),
      style2 = target.style,
      matrix = _getComputedTransformMatrixAsArray(target),
      parent,
      nextSibling,
      temp,
      addedToDOM;
    if (cache.svg && target.getAttribute('transform')) {
      temp = target.transform.baseVal.consolidate().matrix;
      matrix = [temp.a, temp.b, temp.c, temp.d, temp.e, temp.f];
      return matrix.join(',') === '1,0,0,1,0,0' ? _identity2DMatrix : matrix;
    } else if (
      matrix === _identity2DMatrix &&
      !target.offsetParent &&
      target !== _docElement &&
      !cache.svg
    ) {
      temp = style2.display;
      style2.display = 'block';
      parent = target.parentNode;
      if (!parent || !target.offsetParent) {
        addedToDOM = 1;
        nextSibling = target.nextSibling;
        _docElement.appendChild(target);
      }
      matrix = _getComputedTransformMatrixAsArray(target);
      temp ? (style2.display = temp) : _removeProperty(target, 'display');
      if (addedToDOM) {
        nextSibling
          ? parent.insertBefore(target, nextSibling)
          : parent
          ? parent.appendChild(target)
          : _docElement.removeChild(target);
      }
    }
    return force2D && matrix.length > 6
      ? [matrix[0], matrix[1], matrix[4], matrix[5], matrix[12], matrix[13]]
      : matrix;
  };
  var _applySVGOrigin = function _applySVGOrigin2(
    target,
    origin,
    originIsAbsolute,
    smooth,
    matrixArray,
    pluginToAddPropTweensTo,
  ) {
    var cache = target._gsap,
      matrix = matrixArray || _getMatrix(target, true),
      xOriginOld = cache.xOrigin || 0,
      yOriginOld = cache.yOrigin || 0,
      xOffsetOld = cache.xOffset || 0,
      yOffsetOld = cache.yOffset || 0,
      a = matrix[0],
      b = matrix[1],
      c = matrix[2],
      d = matrix[3],
      tx = matrix[4],
      ty = matrix[5],
      originSplit = origin.split(' '),
      xOrigin = parseFloat(originSplit[0]) || 0,
      yOrigin = parseFloat(originSplit[1]) || 0,
      bounds,
      determinant,
      x,
      y;
    if (!originIsAbsolute) {
      bounds = _getBBox(target);
      xOrigin =
        bounds.x +
        (~originSplit[0].indexOf('%')
          ? (xOrigin / 100) * bounds.width
          : xOrigin);
      yOrigin =
        bounds.y +
        (~(originSplit[1] || originSplit[0]).indexOf('%')
          ? (yOrigin / 100) * bounds.height
          : yOrigin);
    } else if (matrix !== _identity2DMatrix && (determinant = a * d - b * c)) {
      x =
        xOrigin * (d / determinant) +
        yOrigin * (-c / determinant) +
        (c * ty - d * tx) / determinant;
      y =
        xOrigin * (-b / determinant) +
        yOrigin * (a / determinant) -
        (a * ty - b * tx) / determinant;
      xOrigin = x;
      yOrigin = y;
    }
    if (smooth || (smooth !== false && cache.smooth)) {
      tx = xOrigin - xOriginOld;
      ty = yOrigin - yOriginOld;
      cache.xOffset = xOffsetOld + (tx * a + ty * c) - tx;
      cache.yOffset = yOffsetOld + (tx * b + ty * d) - ty;
    } else {
      cache.xOffset = cache.yOffset = 0;
    }
    cache.xOrigin = xOrigin;
    cache.yOrigin = yOrigin;
    cache.smooth = !!smooth;
    cache.origin = origin;
    cache.originIsAbsolute = !!originIsAbsolute;
    target.style[_transformOriginProp] = '0px 0px';
    if (pluginToAddPropTweensTo) {
      _addNonTweeningPT(
        pluginToAddPropTweensTo,
        cache,
        'xOrigin',
        xOriginOld,
        xOrigin,
      );
      _addNonTweeningPT(
        pluginToAddPropTweensTo,
        cache,
        'yOrigin',
        yOriginOld,
        yOrigin,
      );
      _addNonTweeningPT(
        pluginToAddPropTweensTo,
        cache,
        'xOffset',
        xOffsetOld,
        cache.xOffset,
      );
      _addNonTweeningPT(
        pluginToAddPropTweensTo,
        cache,
        'yOffset',
        yOffsetOld,
        cache.yOffset,
      );
    }
    target.setAttribute('data-svg-origin', xOrigin + ' ' + yOrigin);
  };
  var _parseTransform = function _parseTransform2(target, uncache) {
    var cache = target._gsap || new GSCache(target);
    if ('x' in cache && !uncache && !cache.uncache) {
      return cache;
    }
    var style2 = target.style,
      invertedScaleX = cache.scaleX < 0,
      px = 'px',
      deg = 'deg',
      origin = _getComputedProperty(target, _transformOriginProp) || '0',
      x,
      y,
      z,
      scaleX,
      scaleY,
      rotation,
      rotationX,
      rotationY,
      skewX,
      skewY,
      perspective,
      xOrigin,
      yOrigin,
      matrix,
      angle,
      cos,
      sin,
      a,
      b,
      c,
      d,
      a12,
      a22,
      t1,
      t2,
      t3,
      a13,
      a23,
      a33,
      a42,
      a43,
      a32;
    x =
      y =
      z =
      rotation =
      rotationX =
      rotationY =
      skewX =
      skewY =
      perspective =
        0;
    scaleX = scaleY = 1;
    cache.svg = !!(target.getCTM && _isSVG(target));
    matrix = _getMatrix(target, cache.svg);
    if (cache.svg) {
      t1 =
        (!cache.uncache || origin === '0px 0px') &&
        !uncache &&
        target.getAttribute('data-svg-origin');
      _applySVGOrigin(
        target,
        t1 || origin,
        !!t1 || cache.originIsAbsolute,
        cache.smooth !== false,
        matrix,
      );
    }
    xOrigin = cache.xOrigin || 0;
    yOrigin = cache.yOrigin || 0;
    if (matrix !== _identity2DMatrix) {
      a = matrix[0];
      b = matrix[1];
      c = matrix[2];
      d = matrix[3];
      x = a12 = matrix[4];
      y = a22 = matrix[5];
      if (matrix.length === 6) {
        scaleX = Math.sqrt(a * a + b * b);
        scaleY = Math.sqrt(d * d + c * c);
        rotation = a || b ? _atan2(b, a) * _RAD2DEG : 0;
        skewX = c || d ? _atan2(c, d) * _RAD2DEG + rotation : 0;
        skewX && (scaleY *= Math.abs(Math.cos(skewX * _DEG2RAD)));
        if (cache.svg) {
          x -= xOrigin - (xOrigin * a + yOrigin * c);
          y -= yOrigin - (xOrigin * b + yOrigin * d);
        }
      } else {
        a32 = matrix[6];
        a42 = matrix[7];
        a13 = matrix[8];
        a23 = matrix[9];
        a33 = matrix[10];
        a43 = matrix[11];
        x = matrix[12];
        y = matrix[13];
        z = matrix[14];
        angle = _atan2(a32, a33);
        rotationX = angle * _RAD2DEG;
        if (angle) {
          cos = Math.cos(-angle);
          sin = Math.sin(-angle);
          t1 = a12 * cos + a13 * sin;
          t2 = a22 * cos + a23 * sin;
          t3 = a32 * cos + a33 * sin;
          a13 = a12 * -sin + a13 * cos;
          a23 = a22 * -sin + a23 * cos;
          a33 = a32 * -sin + a33 * cos;
          a43 = a42 * -sin + a43 * cos;
          a12 = t1;
          a22 = t2;
          a32 = t3;
        }
        angle = _atan2(-c, a33);
        rotationY = angle * _RAD2DEG;
        if (angle) {
          cos = Math.cos(-angle);
          sin = Math.sin(-angle);
          t1 = a * cos - a13 * sin;
          t2 = b * cos - a23 * sin;
          t3 = c * cos - a33 * sin;
          a43 = d * sin + a43 * cos;
          a = t1;
          b = t2;
          c = t3;
        }
        angle = _atan2(b, a);
        rotation = angle * _RAD2DEG;
        if (angle) {
          cos = Math.cos(angle);
          sin = Math.sin(angle);
          t1 = a * cos + b * sin;
          t2 = a12 * cos + a22 * sin;
          b = b * cos - a * sin;
          a22 = a22 * cos - a12 * sin;
          a = t1;
          a12 = t2;
        }
        if (rotationX && Math.abs(rotationX) + Math.abs(rotation) > 359.9) {
          rotationX = rotation = 0;
          rotationY = 180 - rotationY;
        }
        scaleX = _round(Math.sqrt(a * a + b * b + c * c));
        scaleY = _round(Math.sqrt(a22 * a22 + a32 * a32));
        angle = _atan2(a12, a22);
        skewX = Math.abs(angle) > 2e-4 ? angle * _RAD2DEG : 0;
        perspective = a43 ? 1 / (a43 < 0 ? -a43 : a43) : 0;
      }
      if (cache.svg) {
        t1 = target.getAttribute('transform');
        cache.forceCSS =
          target.setAttribute('transform', '') ||
          !_isNullTransform(_getComputedProperty(target, _transformProp));
        t1 && target.setAttribute('transform', t1);
      }
    }
    if (Math.abs(skewX) > 90 && Math.abs(skewX) < 270) {
      if (invertedScaleX) {
        scaleX *= -1;
        skewX += rotation <= 0 ? 180 : -180;
        rotation += rotation <= 0 ? 180 : -180;
      } else {
        scaleY *= -1;
        skewX += skewX <= 0 ? 180 : -180;
      }
    }
    cache.x =
      x -
      ((cache.xPercent =
        x &&
        (cache.xPercent ||
          (Math.round(target.offsetWidth / 2) === Math.round(-x) ? -50 : 0)))
        ? (target.offsetWidth * cache.xPercent) / 100
        : 0) +
      px;
    cache.y =
      y -
      ((cache.yPercent =
        y &&
        (cache.yPercent ||
          (Math.round(target.offsetHeight / 2) === Math.round(-y) ? -50 : 0)))
        ? (target.offsetHeight * cache.yPercent) / 100
        : 0) +
      px;
    cache.z = z + px;
    cache.scaleX = _round(scaleX);
    cache.scaleY = _round(scaleY);
    cache.rotation = _round(rotation) + deg;
    cache.rotationX = _round(rotationX) + deg;
    cache.rotationY = _round(rotationY) + deg;
    cache.skewX = skewX + deg;
    cache.skewY = skewY + deg;
    cache.transformPerspective = perspective + px;
    if ((cache.zOrigin = parseFloat(origin.split(' ')[2]) || 0)) {
      style2[_transformOriginProp] = _firstTwoOnly(origin);
    }
    cache.xOffset = cache.yOffset = 0;
    cache.force3D = _config.force3D;
    cache.renderTransform = cache.svg
      ? _renderSVGTransforms
      : _supports3D
      ? _renderCSSTransforms
      : _renderNon3DTransforms;
    cache.uncache = 0;
    return cache;
  };
  var _firstTwoOnly = function _firstTwoOnly2(value) {
    return (value = value.split(' '))[0] + ' ' + value[1];
  };
  var _addPxTranslate = function _addPxTranslate2(target, start3, value) {
    var unit2 = getUnit(start3);
    return (
      _round(
        parseFloat(start3) +
          parseFloat(_convertToUnit(target, 'x', value + 'px', unit2)),
      ) + unit2
    );
  };
  var _renderNon3DTransforms = function _renderNon3DTransforms2(ratio, cache) {
    cache.z = '0px';
    cache.rotationY = cache.rotationX = '0deg';
    cache.force3D = 0;
    _renderCSSTransforms(ratio, cache);
  };
  var _zeroDeg = '0deg';
  var _zeroPx = '0px';
  var _endParenthesis = ') ';
  var _renderCSSTransforms = function _renderCSSTransforms2(ratio, cache) {
    var _ref = cache || this,
      xPercent = _ref.xPercent,
      yPercent = _ref.yPercent,
      x = _ref.x,
      y = _ref.y,
      z = _ref.z,
      rotation = _ref.rotation,
      rotationY = _ref.rotationY,
      rotationX = _ref.rotationX,
      skewX = _ref.skewX,
      skewY = _ref.skewY,
      scaleX = _ref.scaleX,
      scaleY = _ref.scaleY,
      transformPerspective = _ref.transformPerspective,
      force3D = _ref.force3D,
      target = _ref.target,
      zOrigin = _ref.zOrigin,
      transforms = '',
      use3D = (force3D === 'auto' && ratio && ratio !== 1) || force3D === true;
    if (zOrigin && (rotationX !== _zeroDeg || rotationY !== _zeroDeg)) {
      var angle = parseFloat(rotationY) * _DEG2RAD,
        a13 = Math.sin(angle),
        a33 = Math.cos(angle),
        cos;
      angle = parseFloat(rotationX) * _DEG2RAD;
      cos = Math.cos(angle);
      x = _addPxTranslate(target, x, a13 * cos * -zOrigin);
      y = _addPxTranslate(target, y, -Math.sin(angle) * -zOrigin);
      z = _addPxTranslate(target, z, a33 * cos * -zOrigin + zOrigin);
    }
    if (transformPerspective !== _zeroPx) {
      transforms += 'perspective(' + transformPerspective + _endParenthesis;
    }
    if (xPercent || yPercent) {
      transforms += 'translate(' + xPercent + '%, ' + yPercent + '%) ';
    }
    if (use3D || x !== _zeroPx || y !== _zeroPx || z !== _zeroPx) {
      transforms +=
        z !== _zeroPx || use3D
          ? 'translate3d(' + x + ', ' + y + ', ' + z + ') '
          : 'translate(' + x + ', ' + y + _endParenthesis;
    }
    if (rotation !== _zeroDeg) {
      transforms += 'rotate(' + rotation + _endParenthesis;
    }
    if (rotationY !== _zeroDeg) {
      transforms += 'rotateY(' + rotationY + _endParenthesis;
    }
    if (rotationX !== _zeroDeg) {
      transforms += 'rotateX(' + rotationX + _endParenthesis;
    }
    if (skewX !== _zeroDeg || skewY !== _zeroDeg) {
      transforms += 'skew(' + skewX + ', ' + skewY + _endParenthesis;
    }
    if (scaleX !== 1 || scaleY !== 1) {
      transforms += 'scale(' + scaleX + ', ' + scaleY + _endParenthesis;
    }
    target.style[_transformProp] = transforms || 'translate(0, 0)';
  };
  var _renderSVGTransforms = function _renderSVGTransforms2(ratio, cache) {
    var _ref2 = cache || this,
      xPercent = _ref2.xPercent,
      yPercent = _ref2.yPercent,
      x = _ref2.x,
      y = _ref2.y,
      rotation = _ref2.rotation,
      skewX = _ref2.skewX,
      skewY = _ref2.skewY,
      scaleX = _ref2.scaleX,
      scaleY = _ref2.scaleY,
      target = _ref2.target,
      xOrigin = _ref2.xOrigin,
      yOrigin = _ref2.yOrigin,
      xOffset = _ref2.xOffset,
      yOffset = _ref2.yOffset,
      forceCSS = _ref2.forceCSS,
      tx = parseFloat(x),
      ty = parseFloat(y),
      a11,
      a21,
      a12,
      a22,
      temp;
    rotation = parseFloat(rotation);
    skewX = parseFloat(skewX);
    skewY = parseFloat(skewY);
    if (skewY) {
      skewY = parseFloat(skewY);
      skewX += skewY;
      rotation += skewY;
    }
    if (rotation || skewX) {
      rotation *= _DEG2RAD;
      skewX *= _DEG2RAD;
      a11 = Math.cos(rotation) * scaleX;
      a21 = Math.sin(rotation) * scaleX;
      a12 = Math.sin(rotation - skewX) * -scaleY;
      a22 = Math.cos(rotation - skewX) * scaleY;
      if (skewX) {
        skewY *= _DEG2RAD;
        temp = Math.tan(skewX - skewY);
        temp = Math.sqrt(1 + temp * temp);
        a12 *= temp;
        a22 *= temp;
        if (skewY) {
          temp = Math.tan(skewY);
          temp = Math.sqrt(1 + temp * temp);
          a11 *= temp;
          a21 *= temp;
        }
      }
      a11 = _round(a11);
      a21 = _round(a21);
      a12 = _round(a12);
      a22 = _round(a22);
    } else {
      a11 = scaleX;
      a22 = scaleY;
      a21 = a12 = 0;
    }
    if ((tx && !~(x + '').indexOf('px')) || (ty && !~(y + '').indexOf('px'))) {
      tx = _convertToUnit(target, 'x', x, 'px');
      ty = _convertToUnit(target, 'y', y, 'px');
    }
    if (xOrigin || yOrigin || xOffset || yOffset) {
      tx = _round(tx + xOrigin - (xOrigin * a11 + yOrigin * a12) + xOffset);
      ty = _round(ty + yOrigin - (xOrigin * a21 + yOrigin * a22) + yOffset);
    }
    if (xPercent || yPercent) {
      temp = target.getBBox();
      tx = _round(tx + (xPercent / 100) * temp.width);
      ty = _round(ty + (yPercent / 100) * temp.height);
    }
    temp =
      'matrix(' +
      a11 +
      ',' +
      a21 +
      ',' +
      a12 +
      ',' +
      a22 +
      ',' +
      tx +
      ',' +
      ty +
      ')';
    target.setAttribute('transform', temp);
    forceCSS && (target.style[_transformProp] = temp);
  };
  var _addRotationalPropTween = function _addRotationalPropTween2(
    plugin2,
    target,
    property,
    startNum,
    endValue,
    relative,
  ) {
    var cap = 360,
      isString3 = _isString(endValue),
      endNum =
        parseFloat(endValue) *
        (isString3 && ~endValue.indexOf('rad') ? _RAD2DEG : 1),
      change = relative ? endNum * relative : endNum - startNum,
      finalValue = startNum + change + 'deg',
      direction,
      pt;
    if (isString3) {
      direction = endValue.split('_')[1];
      if (direction === 'short') {
        change %= cap;
        if (change !== change % (cap / 2)) {
          change += change < 0 ? cap : -cap;
        }
      }
      if (direction === 'cw' && change < 0) {
        change = ((change + cap * _bigNum2) % cap) - ~~(change / cap) * cap;
      } else if (direction === 'ccw' && change > 0) {
        change = ((change - cap * _bigNum2) % cap) - ~~(change / cap) * cap;
      }
    }
    plugin2._pt = pt = new PropTween(
      plugin2._pt,
      target,
      property,
      startNum,
      change,
      _renderPropWithEnd,
    );
    pt.e = finalValue;
    pt.u = 'deg';
    plugin2._props.push(property);
    return pt;
  };
  var _assign = function _assign2(target, source) {
    for (var p in source) {
      target[p] = source[p];
    }
    return target;
  };
  var _addRawTransformPTs = function _addRawTransformPTs2(
    plugin2,
    transforms,
    target,
  ) {
    var startCache = _assign({}, target._gsap),
      exclude = 'perspective,force3D,transformOrigin,svgOrigin',
      style2 = target.style,
      endCache,
      p,
      startValue,
      endValue,
      startNum,
      endNum,
      startUnit,
      endUnit;
    if (startCache.svg) {
      startValue = target.getAttribute('transform');
      target.setAttribute('transform', '');
      style2[_transformProp] = transforms;
      endCache = _parseTransform(target, 1);
      _removeProperty(target, _transformProp);
      target.setAttribute('transform', startValue);
    } else {
      startValue = getComputedStyle(target)[_transformProp];
      style2[_transformProp] = transforms;
      endCache = _parseTransform(target, 1);
      style2[_transformProp] = startValue;
    }
    for (p in _transformProps) {
      startValue = startCache[p];
      endValue = endCache[p];
      if (startValue !== endValue && exclude.indexOf(p) < 0) {
        startUnit = getUnit(startValue);
        endUnit = getUnit(endValue);
        startNum =
          startUnit !== endUnit
            ? _convertToUnit(target, p, startValue, endUnit)
            : parseFloat(startValue);
        endNum = parseFloat(endValue);
        plugin2._pt = new PropTween(
          plugin2._pt,
          endCache,
          p,
          startNum,
          endNum - startNum,
          _renderCSSProp,
        );
        plugin2._pt.u = endUnit || 0;
        plugin2._props.push(p);
      }
    }
    _assign(endCache, startCache);
  };
  _forEachName('padding,margin,Width,Radius', function (name, index) {
    var t = 'Top',
      r = 'Right',
      b = 'Bottom',
      l = 'Left',
      props = (index < 3 ? [t, r, b, l] : [t + l, t + r, b + r, b + l]).map(
        function (side) {
          return index < 2 ? name + side : 'border' + side + name;
        },
      );
    _specialProps[index > 1 ? 'border' + name : name] = function (
      plugin2,
      target,
      property,
      endValue,
      tween,
    ) {
      var a, vars;
      if (arguments.length < 4) {
        a = props.map(function (prop) {
          return _get(plugin2, prop, property);
        });
        vars = a.join(' ');
        return vars.split(a[0]).length === 5 ? a[0] : vars;
      }
      a = (endValue + '').split(' ');
      vars = {};
      props.forEach(function (prop, i) {
        return (vars[prop] = a[i] = a[i] || a[((i - 1) / 2) | 0]);
      });
      plugin2.init(target, vars, tween);
    };
  });
  var CSSPlugin = {
    name: 'css',
    register: _initCore,
    targetTest: function targetTest(target) {
      return target.style && target.nodeType;
    },
    init: function init3(target, vars, tween, index, targets) {
      var props = this._props,
        style2 = target.style,
        startAt = tween.vars.startAt,
        startValue,
        endValue,
        endNum,
        startNum,
        type,
        specialProp,
        p,
        startUnit,
        endUnit,
        relative,
        isTransformRelated,
        transformPropTween,
        cache,
        smooth,
        hasPriority;
      _pluginInitted || _initCore();
      for (p in vars) {
        if (p === 'autoRound') {
          continue;
        }
        endValue = vars[p];
        if (
          _plugins[p] &&
          _checkPlugin(p, vars, tween, index, target, targets)
        ) {
          continue;
        }
        type = typeof endValue;
        specialProp = _specialProps[p];
        if (type === 'function') {
          endValue = endValue.call(tween, index, target, targets);
          type = typeof endValue;
        }
        if (type === 'string' && ~endValue.indexOf('random(')) {
          endValue = _replaceRandom(endValue);
        }
        if (specialProp) {
          specialProp(this, target, p, endValue, tween) && (hasPriority = 1);
        } else if (p.substr(0, 2) === '--') {
          startValue = (
            getComputedStyle(target).getPropertyValue(p) + ''
          ).trim();
          endValue += '';
          _colorExp.lastIndex = 0;
          if (!_colorExp.test(startValue)) {
            startUnit = getUnit(startValue);
            endUnit = getUnit(endValue);
          }
          endUnit
            ? startUnit !== endUnit &&
              (startValue =
                _convertToUnit(target, p, startValue, endUnit) + endUnit)
            : startUnit && (endValue += startUnit);
          this.add(
            style2,
            'setProperty',
            startValue,
            endValue,
            index,
            targets,
            0,
            0,
            p,
          );
          props.push(p);
        } else if (type !== 'undefined') {
          if (startAt && p in startAt) {
            startValue =
              typeof startAt[p] === 'function'
                ? startAt[p].call(tween, index, target, targets)
                : startAt[p];
            p in _config.units &&
              !getUnit(startValue) &&
              (startValue += _config.units[p]);
            (startValue + '').charAt(1) === '=' &&
              (startValue = _get(target, p));
          } else {
            startValue = _get(target, p);
          }
          startNum = parseFloat(startValue);
          relative =
            type === 'string' && endValue.charAt(1) === '='
              ? +(endValue.charAt(0) + '1')
              : 0;
          relative && (endValue = endValue.substr(2));
          endNum = parseFloat(endValue);
          if (p in _propertyAliases) {
            if (p === 'autoAlpha') {
              if (
                startNum === 1 &&
                _get(target, 'visibility') === 'hidden' &&
                endNum
              ) {
                startNum = 0;
              }
              _addNonTweeningPT(
                this,
                style2,
                'visibility',
                startNum ? 'inherit' : 'hidden',
                endNum ? 'inherit' : 'hidden',
                !endNum,
              );
            }
            if (p !== 'scale' && p !== 'transform') {
              p = _propertyAliases[p];
              ~p.indexOf(',') && (p = p.split(',')[0]);
            }
          }
          isTransformRelated = p in _transformProps;
          if (isTransformRelated) {
            if (!transformPropTween) {
              cache = target._gsap;
              (cache.renderTransform && !vars.parseTransform) ||
                _parseTransform(target, vars.parseTransform);
              smooth = vars.smoothOrigin !== false && cache.smooth;
              transformPropTween = this._pt = new PropTween(
                this._pt,
                style2,
                _transformProp,
                0,
                1,
                cache.renderTransform,
                cache,
                0,
                -1,
              );
              transformPropTween.dep = 1;
            }
            if (p === 'scale') {
              this._pt = new PropTween(
                this._pt,
                cache,
                'scaleY',
                cache.scaleY,
                (relative ? relative * endNum : endNum - cache.scaleY) || 0,
              );
              props.push('scaleY', p);
              p += 'X';
            } else if (p === 'transformOrigin') {
              endValue = _convertKeywordsToPercentages(endValue);
              if (cache.svg) {
                _applySVGOrigin(target, endValue, 0, smooth, 0, this);
              } else {
                endUnit = parseFloat(endValue.split(' ')[2]) || 0;
                endUnit !== cache.zOrigin &&
                  _addNonTweeningPT(
                    this,
                    cache,
                    'zOrigin',
                    cache.zOrigin,
                    endUnit,
                  );
                _addNonTweeningPT(
                  this,
                  style2,
                  p,
                  _firstTwoOnly(startValue),
                  _firstTwoOnly(endValue),
                );
              }
              continue;
            } else if (p === 'svgOrigin') {
              _applySVGOrigin(target, endValue, 1, smooth, 0, this);
              continue;
            } else if (p in _rotationalProperties) {
              _addRotationalPropTween(
                this,
                cache,
                p,
                startNum,
                endValue,
                relative,
              );
              continue;
            } else if (p === 'smoothOrigin') {
              _addNonTweeningPT(this, cache, 'smooth', cache.smooth, endValue);
              continue;
            } else if (p === 'force3D') {
              cache[p] = endValue;
              continue;
            } else if (p === 'transform') {
              _addRawTransformPTs(this, endValue, target);
              continue;
            }
          } else if (!(p in style2)) {
            p = _checkPropPrefix(p) || p;
          }
          if (
            isTransformRelated ||
            ((endNum || endNum === 0) &&
              (startNum || startNum === 0) &&
              !_complexExp.test(endValue) &&
              p in style2)
          ) {
            startUnit = (startValue + '').substr((startNum + '').length);
            endNum || (endNum = 0);
            endUnit =
              getUnit(endValue) ||
              (p in _config.units ? _config.units[p] : startUnit);
            startUnit !== endUnit &&
              (startNum = _convertToUnit(target, p, startValue, endUnit));
            this._pt = new PropTween(
              this._pt,
              isTransformRelated ? cache : style2,
              p,
              startNum,
              relative ? relative * endNum : endNum - startNum,
              !isTransformRelated &&
              (endUnit === 'px' || p === 'zIndex') &&
              vars.autoRound !== false
                ? _renderRoundedCSSProp
                : _renderCSSProp,
            );
            this._pt.u = endUnit || 0;
            if (startUnit !== endUnit) {
              this._pt.b = startValue;
              this._pt.r = _renderCSSPropWithBeginning;
            }
          } else if (!(p in style2)) {
            if (p in target) {
              this.add(
                target,
                p,
                startValue || target[p],
                endValue,
                index,
                targets,
              );
            } else {
              _missingPlugin(p, endValue);
              continue;
            }
          } else {
            _tweenComplexCSSString.call(this, target, p, startValue, endValue);
          }
          props.push(p);
        }
      }
      hasPriority && _sortPropTweensByPriority(this);
    },
    get: _get,
    aliases: _propertyAliases,
    getSetter: function getSetter(target, property, plugin2) {
      var p = _propertyAliases[property];
      p && p.indexOf(',') < 0 && (property = p);
      return property in _transformProps &&
        property !== _transformOriginProp &&
        (target._gsap.x || _get(target, 'x'))
        ? plugin2 && _recentSetterPlugin === plugin2
          ? property === 'scale'
            ? _setterScale
            : _setterTransform
          : (_recentSetterPlugin = plugin2 || {}) &&
            (property === 'scale'
              ? _setterScaleWithRender
              : _setterTransformWithRender)
        : target.style && !_isUndefined(target.style[property])
        ? _setterCSSStyle
        : ~property.indexOf('-')
        ? _setterCSSProp
        : _getSetter(target, property);
    },
    core: {
      _removeProperty,
      _getMatrix,
    },
  };
  gsap.utils.checkPrefix = _checkPropPrefix;
  (function (positionAndScale, rotation, others, aliases) {
    var all = _forEachName(
      positionAndScale + ',' + rotation + ',' + others,
      function (name) {
        _transformProps[name] = 1;
      },
    );
    _forEachName(rotation, function (name) {
      _config.units[name] = 'deg';
      _rotationalProperties[name] = 1;
    });
    _propertyAliases[all[13]] = positionAndScale + ',' + rotation;
    _forEachName(aliases, function (name) {
      var split = name.split(':');
      _propertyAliases[split[1]] = all[split[0]];
    });
  })(
    'x,y,z,scale,scaleX,scaleY,xPercent,yPercent',
    'rotation,rotationX,rotationY,skewX,skewY',
    'transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective',
    '0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY',
  );
  _forEachName(
    'x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective',
    function (name) {
      _config.units[name] = 'px';
    },
  );
  gsap.registerPlugin(CSSPlugin);

  // node_modules/gsap/index.js
  var gsapWithCSS = gsap.registerPlugin(CSSPlugin) || gsap;
  var TweenMaxWithCSS = gsapWithCSS.core.Tween;

  // src/js/menu.js
  window.menu = function () {
    const menu = document.getElementById('mobile-menu');
    return {
      open(e) {
        menu.style.height = window.innerHeight + 'px';
        menu.classList.remove('hidden');
        document.body.style.height = window.innerHeight + 'px';
        document.body.classList.add('overflow-hidden');
        gsapWithCSS.set('#mobile-menu', {
          x: '100%',
        });
        gsapWithCSS.to('#mobile-menu', {
          x: 0,
          duration: 0.6,
          ease: 'power3.inOut',
        });
        const scrollbarWidth = getScrollbarWidth();
        document.body.style.paddingRight = scrollbarWidth + 'px';
      },
      close(e) {
        document.body.style.paddingRight = '';
        document.body.style.height = 'auto';
        document.body.classList.remove('overflow-hidden');
        gsapWithCSS.to('#mobile-menu', {
          x: '100%',
          duration: 0.3,
          ease: 'power3.inOut',
          onComplete: () => {
            menu.classList.add('hidden');
          },
        });
      },
      resize() {
        menu.style.height = window.innerHeight + 'px';
        if (window.innerWidth > 900) {
          menu.classList.add('hidden');
          document.body.classList.remove('fixed');
          document.documentElement.classList.remove('fixed');
        }
      },
    };
    function getScrollbarWidth() {
      var scrollDiv = document.createElement('div');
      scrollDiv.style.cssText =
        'width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;';
      document.body.appendChild(scrollDiv);
      var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
      return scroll;
    }
  };

  // src/js/product.js
  window.product = function () {
    var currentVariant = document.getElementById('VariantId');
    var price = document.getElementById('product-price');
    var compareAtPrice = document.getElementById('compare-at-price');
    var add2 = document.getElementById('add-to-cart');
    return {
      init() {},
      setVariant(e) {
        e.preventDefault();
        const qty = document.querySelector('.qty');
        const variantId = this.$el.getAttribute('data-variant-id');
        const variantPrice = this.$el.getAttribute('data-variant-price');
        const variantAvailable = this.$el.getAttribute(
          'data-variant-available',
        );
        const compareAtVariantPrice = this.$el.getAttribute(
          'data-compare-at-variant-price',
        );
        currentVariant.value = variantId;
        price.innerHTML = variantPrice;
        if (compareAtVariantPrice) {
          compareAtPrice.classList.remove('hidden');
          compareAtPrice.innerHTML = compareAtVariantPrice;
        } else {
          compareAtPrice.classList.add('hidden');
        }
        qty.setAttribute(
          'data-max',
          this.$el.getAttribute('data-variant-inventory'),
        );
        if (qty.value > qty.getAttribute('data-max')) {
          qty.value = qty.getAttribute('data-max');
        }
        price.innerHTML = variantPrice;
        if (variantAvailable === 'true') {
          add2.removeAttribute('disabled');
          add2.classList.add('hover:bg-tint3');
          add2.classList.remove('opacity-50');
          add2.innerHTML =
            '<span class="my-auto inline-block">Add to cart</span>';
        } else {
          add2.setAttribute('disabled', 'disabled');
          add2.classList.remove('hover:bg-tint3');
          add2.classList.add('opacity-50');
          add2.innerHTML = '<span class="my-auto inline-block">Sold out</span>';
        }
        this.$el.classList.remove('bg-tint2', 'text-tint3');
        this.$el.classList.add('bg-tint3', 'text-tint2', 'active');
        const variants = document.querySelectorAll('.variant');
        variants.forEach((variant) => {
          if (variant !== this.$el) {
            variant.classList.remove('bg-tint3', 'text-tint2', 'active');
            variant.classList.add('bg-tint2', 'text-tint3');
          }
        });
        const url = new URL(window.location.href);
        url.searchParams.set('variant', variantId);
        window.history.pushState({}, '', url);
        const currentVar = document.querySelector('#VariantId');
        currentVar.value = variantId;
        const varimg = this.$el.getAttribute('data-variant-image');
        if (varimg) {
          const thumb = document.querySelector(`[data-img-id="${varimg}"]`);
          if (thumb) {
            thumb.click();
          }
        }
      },
    };
  };

  // src/js/qty.js
  window.qty = function () {
    const update = document.getElementById('update-cart');
    return {
      add(e) {
        let qty = this.$el.parentElement.querySelector('.qty');
        let max2 = parseInt(qty.getAttribute('data-max'), 10);
        let currentValue = parseInt(qty.value, 10);
        if (currentValue < max2) {
          qty.value = currentValue + 1;
          if (update) {
            update.click();
          }
        }
      },
      minus(e) {
        let qty = this.$el.parentElement.querySelector('.qty');
        let currentValue = parseInt(qty.value, 10);
        if (currentValue > 1) {
          qty.value = currentValue - 1;
          if (update) {
            update.click();
          }
        }
      },
    };
  };

  // src/js/accordion.js
  window.accordion = function () {
    const accordionSpeed = 0.3;
    return {
      toggle() {
        const content =
          this.$el.parentElement.querySelector('.accordion-content');
        const status = this.$el.querySelector('.status');
        let isOpen = this.$el.getAttribute('data-open');
        if (isOpen === 'false') {
          gsapWithCSS.to(content, {
            height: 'auto',
            duration: accordionSpeed,
            ease: 'power3.inOut',
          });
          this.$el.setAttribute('data-open', 'true');
          status.innerHTML = '-';
          this.$el.classList.add('text-tint3');
          this.$el.classList.remove('text-tint1');
        } else {
          gsapWithCSS.to(content, {
            height: 0,
            duration: accordionSpeed,
            ease: 'power3.inOut',
          });
          this.$el.setAttribute('data-open', 'false');
          status.innerHTML = '+';
          this.$el.classList.add('text-tint1');
          this.$el.classList.remove('text-tint3');
        }
      },
    };
  };

  // node_modules/@splidejs/splide/dist/js/splide.esm.js
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ('value' in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, 'prototype', { writable: false });
    return Constructor;
  }
  var MEDIA_PREFERS_REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
  var CREATED = 1;
  var MOUNTED = 2;
  var IDLE = 3;
  var MOVING = 4;
  var SCROLLING = 5;
  var DRAGGING = 6;
  var DESTROYED = 7;
  var STATES = {
    CREATED,
    MOUNTED,
    IDLE,
    MOVING,
    SCROLLING,
    DRAGGING,
    DESTROYED,
  };
  function empty(array) {
    array.length = 0;
  }
  function slice(arrayLike, start3, end) {
    return Array.prototype.slice.call(arrayLike, start3, end);
  }
  function apply(func) {
    return func.bind.apply(func, [null].concat(slice(arguments, 1)));
  }
  var nextTick2 = setTimeout;
  var noop = function noop2() {};
  function raf(func) {
    return requestAnimationFrame(func);
  }
  function typeOf(type, subject) {
    return typeof subject === type;
  }
  function isObject2(subject) {
    return !isNull(subject) && typeOf('object', subject);
  }
  var isArray2 = Array.isArray;
  var isFunction = apply(typeOf, 'function');
  var isString2 = apply(typeOf, 'string');
  var isUndefined = apply(typeOf, 'undefined');
  function isNull(subject) {
    return subject === null;
  }
  function isHTMLElement(subject) {
    try {
      return (
        subject instanceof
        (subject.ownerDocument.defaultView || window).HTMLElement
      );
    } catch (e) {
      return false;
    }
  }
  function toArray3(value) {
    return isArray2(value) ? value : [value];
  }
  function forEach(values, iteratee) {
    toArray3(values).forEach(iteratee);
  }
  function includes(array, value) {
    return array.indexOf(value) > -1;
  }
  function push(array, items) {
    array.push.apply(array, toArray3(items));
    return array;
  }
  function toggleClass(elm, classes, add2) {
    if (elm) {
      forEach(classes, function (name) {
        if (name) {
          elm.classList[add2 ? 'add' : 'remove'](name);
        }
      });
    }
  }
  function addClass(elm, classes) {
    toggleClass(elm, isString2(classes) ? classes.split(' ') : classes, true);
  }
  function append(parent, children2) {
    forEach(children2, parent.appendChild.bind(parent));
  }
  function before(nodes, ref) {
    forEach(nodes, function (node) {
      var parent = (ref || node).parentNode;
      if (parent) {
        parent.insertBefore(node, ref);
      }
    });
  }
  function matches(elm, selector3) {
    return (
      isHTMLElement(elm) &&
      (elm['msMatchesSelector'] || elm.matches).call(elm, selector3)
    );
  }
  function children(parent, selector3) {
    var children2 = parent ? slice(parent.children) : [];
    return selector3
      ? children2.filter(function (child2) {
          return matches(child2, selector3);
        })
      : children2;
  }
  function child(parent, selector3) {
    return selector3
      ? children(parent, selector3)[0]
      : parent.firstElementChild;
  }
  var ownKeys2 = Object.keys;
  function forOwn(object, iteratee, right) {
    if (object) {
      (right ? ownKeys2(object).reverse() : ownKeys2(object)).forEach(function (
        key,
      ) {
        key !== '__proto__' && iteratee(object[key], key);
      });
    }
    return object;
  }
  function assign(object) {
    slice(arguments, 1).forEach(function (source) {
      forOwn(source, function (value, key) {
        object[key] = source[key];
      });
    });
    return object;
  }
  function merge(object) {
    slice(arguments, 1).forEach(function (source) {
      forOwn(source, function (value, key) {
        if (isArray2(value)) {
          object[key] = value.slice();
        } else if (isObject2(value)) {
          object[key] = merge(
            {},
            isObject2(object[key]) ? object[key] : {},
            value,
          );
        } else {
          object[key] = value;
        }
      });
    });
    return object;
  }
  function omit(object, keys) {
    forEach(keys || ownKeys2(object), function (key) {
      delete object[key];
    });
  }
  function removeAttribute(elms, attrs) {
    forEach(elms, function (elm) {
      forEach(attrs, function (attr) {
        elm && elm.removeAttribute(attr);
      });
    });
  }
  function setAttribute(elms, attrs, value) {
    if (isObject2(attrs)) {
      forOwn(attrs, function (value2, name) {
        setAttribute(elms, name, value2);
      });
    } else {
      forEach(elms, function (elm) {
        isNull(value) || value === ''
          ? removeAttribute(elm, attrs)
          : elm.setAttribute(attrs, String(value));
      });
    }
  }
  function create(tag, attrs, parent) {
    var elm = document.createElement(tag);
    if (attrs) {
      isString2(attrs) ? addClass(elm, attrs) : setAttribute(elm, attrs);
    }
    parent && append(parent, elm);
    return elm;
  }
  function style(elm, prop, value) {
    if (isUndefined(value)) {
      return getComputedStyle(elm)[prop];
    }
    if (!isNull(value)) {
      elm.style[prop] = '' + value;
    }
  }
  function display(elm, display2) {
    style(elm, 'display', display2);
  }
  function focus(elm) {
    (elm['setActive'] && elm['setActive']()) ||
      elm.focus({
        preventScroll: true,
      });
  }
  function getAttribute(elm, attr) {
    return elm.getAttribute(attr);
  }
  function hasClass(elm, className) {
    return elm && elm.classList.contains(className);
  }
  function rect(target) {
    return target.getBoundingClientRect();
  }
  function remove(nodes) {
    forEach(nodes, function (node) {
      if (node && node.parentNode) {
        node.parentNode.removeChild(node);
      }
    });
  }
  function parseHtml(html) {
    return child(new DOMParser().parseFromString(html, 'text/html').body);
  }
  function prevent(e, stopPropagation) {
    e.preventDefault();
    if (stopPropagation) {
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
  function query(parent, selector3) {
    return parent && parent.querySelector(selector3);
  }
  function queryAll(parent, selector3) {
    return selector3 ? slice(parent.querySelectorAll(selector3)) : [];
  }
  function removeClass(elm, classes) {
    toggleClass(elm, classes, false);
  }
  function timeOf(e) {
    return e.timeStamp;
  }
  function unit(value) {
    return isString2(value) ? value : value ? value + 'px' : '';
  }
  var PROJECT_CODE = 'splide';
  var DATA_ATTRIBUTE = 'data-' + PROJECT_CODE;
  function assert(condition, message) {
    if (!condition) {
      throw new Error('[' + PROJECT_CODE + '] ' + (message || ''));
    }
  }
  var min = Math.min;
  var max = Math.max;
  var floor = Math.floor;
  var ceil = Math.ceil;
  var abs = Math.abs;
  function approximatelyEqual(x, y, epsilon) {
    return abs(x - y) < epsilon;
  }
  function between(number, x, y, exclusive) {
    var minimum = min(x, y);
    var maximum = max(x, y);
    return exclusive
      ? minimum < number && number < maximum
      : minimum <= number && number <= maximum;
  }
  function clamp3(number, x, y) {
    var minimum = min(x, y);
    var maximum = max(x, y);
    return min(max(minimum, number), maximum);
  }
  function sign(x) {
    return +(x > 0) - +(x < 0);
  }
  function format(string, replacements) {
    forEach(replacements, function (replacement) {
      string = string.replace('%s', '' + replacement);
    });
    return string;
  }
  function pad(number) {
    return number < 10 ? '0' + number : '' + number;
  }
  var ids = {};
  function uniqueId(prefix2) {
    return '' + prefix2 + pad((ids[prefix2] = (ids[prefix2] || 0) + 1));
  }
  function EventBinder() {
    var listeners = [];
    function bind3(targets, events, callback, options) {
      forEachEvent(targets, events, function (target, event, namespace) {
        var isEventTarget = 'addEventListener' in target;
        var remover = isEventTarget
          ? target.removeEventListener.bind(target, event, callback, options)
          : target['removeListener'].bind(target, callback);
        isEventTarget
          ? target.addEventListener(event, callback, options)
          : target['addListener'](callback);
        listeners.push([target, event, namespace, callback, remover]);
      });
    }
    function unbind(targets, events, callback) {
      forEachEvent(targets, events, function (target, event, namespace) {
        listeners = listeners.filter(function (listener) {
          if (
            listener[0] === target &&
            listener[1] === event &&
            listener[2] === namespace &&
            (!callback || listener[3] === callback)
          ) {
            listener[4]();
            return false;
          }
          return true;
        });
      });
    }
    function dispatch2(target, type, detail) {
      var e;
      var bubbles = true;
      if (typeof CustomEvent === 'function') {
        e = new CustomEvent(type, {
          bubbles,
          detail,
        });
      } else {
        e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
      }
      target.dispatchEvent(e);
      return e;
    }
    function forEachEvent(targets, events, iteratee) {
      forEach(targets, function (target) {
        target &&
          forEach(events, function (events2) {
            events2.split(' ').forEach(function (eventNS) {
              var fragment = eventNS.split('.');
              iteratee(target, fragment[0], fragment[1]);
            });
          });
      });
    }
    function destroy() {
      listeners.forEach(function (data2) {
        data2[4]();
      });
      empty(listeners);
    }
    return {
      bind: bind3,
      unbind,
      dispatch: dispatch2,
      destroy,
    };
  }
  var EVENT_MOUNTED = 'mounted';
  var EVENT_READY = 'ready';
  var EVENT_MOVE = 'move';
  var EVENT_MOVED = 'moved';
  var EVENT_CLICK = 'click';
  var EVENT_ACTIVE = 'active';
  var EVENT_INACTIVE = 'inactive';
  var EVENT_VISIBLE = 'visible';
  var EVENT_HIDDEN = 'hidden';
  var EVENT_REFRESH = 'refresh';
  var EVENT_UPDATED = 'updated';
  var EVENT_RESIZE = 'resize';
  var EVENT_RESIZED = 'resized';
  var EVENT_DRAG = 'drag';
  var EVENT_DRAGGING = 'dragging';
  var EVENT_DRAGGED = 'dragged';
  var EVENT_SCROLL = 'scroll';
  var EVENT_SCROLLED = 'scrolled';
  var EVENT_OVERFLOW = 'overflow';
  var EVENT_DESTROY = 'destroy';
  var EVENT_ARROWS_MOUNTED = 'arrows:mounted';
  var EVENT_ARROWS_UPDATED = 'arrows:updated';
  var EVENT_PAGINATION_MOUNTED = 'pagination:mounted';
  var EVENT_PAGINATION_UPDATED = 'pagination:updated';
  var EVENT_NAVIGATION_MOUNTED = 'navigation:mounted';
  var EVENT_AUTOPLAY_PLAY = 'autoplay:play';
  var EVENT_AUTOPLAY_PLAYING = 'autoplay:playing';
  var EVENT_AUTOPLAY_PAUSE = 'autoplay:pause';
  var EVENT_LAZYLOAD_LOADED = 'lazyload:loaded';
  var EVENT_SLIDE_KEYDOWN = 'sk';
  var EVENT_SHIFTED = 'sh';
  var EVENT_END_INDEX_CHANGED = 'ei';
  function EventInterface(Splide2) {
    var bus = Splide2 ? Splide2.event.bus : document.createDocumentFragment();
    var binder = EventBinder();
    function on2(events, callback) {
      binder.bind(bus, toArray3(events).join(' '), function (e) {
        callback.apply(callback, isArray2(e.detail) ? e.detail : []);
      });
    }
    function emit(event) {
      binder.dispatch(bus, event, slice(arguments, 1));
    }
    if (Splide2) {
      Splide2.event.on(EVENT_DESTROY, binder.destroy);
    }
    return assign(binder, {
      bus,
      on: on2,
      off: apply(binder.unbind, bus),
      emit,
    });
  }
  function RequestInterval(interval, onInterval, onUpdate, limit) {
    var now = Date.now;
    var startTime;
    var rate = 0;
    var id;
    var paused = true;
    var count = 0;
    function update() {
      if (!paused) {
        rate = interval ? min((now() - startTime) / interval, 1) : 1;
        onUpdate && onUpdate(rate);
        if (rate >= 1) {
          onInterval();
          startTime = now();
          if (limit && ++count >= limit) {
            return pause();
          }
        }
        id = raf(update);
      }
    }
    function start3(resume) {
      resume || cancel();
      startTime = now() - (resume ? rate * interval : 0);
      paused = false;
      id = raf(update);
    }
    function pause() {
      paused = true;
    }
    function rewind() {
      startTime = now();
      rate = 0;
      if (onUpdate) {
        onUpdate(rate);
      }
    }
    function cancel() {
      id && cancelAnimationFrame(id);
      rate = 0;
      id = 0;
      paused = true;
    }
    function set3(time) {
      interval = time;
    }
    function isPaused() {
      return paused;
    }
    return {
      start: start3,
      rewind,
      pause,
      cancel,
      set: set3,
      isPaused,
    };
  }
  function State(initialState) {
    var state = initialState;
    function set3(value) {
      state = value;
    }
    function is(states) {
      return includes(toArray3(states), state);
    }
    return {
      set: set3,
      is,
    };
  }
  function Throttle(func, duration) {
    var interval = RequestInterval(duration || 0, func, null, 1);
    return function () {
      interval.isPaused() && interval.start();
    };
  }
  function Media(Splide2, Components2, options) {
    var state = Splide2.state;
    var breakpoints = options.breakpoints || {};
    var reducedMotion = options.reducedMotion || {};
    var binder = EventBinder();
    var queries = [];
    function setup() {
      var isMin = options.mediaQuery === 'min';
      ownKeys2(breakpoints)
        .sort(function (n, m) {
          return isMin ? +n - +m : +m - +n;
        })
        .forEach(function (key) {
          register2(
            breakpoints[key],
            '(' + (isMin ? 'min' : 'max') + '-width:' + key + 'px)',
          );
        });
      register2(reducedMotion, MEDIA_PREFERS_REDUCED_MOTION);
      update();
    }
    function destroy(completely) {
      if (completely) {
        binder.destroy();
      }
    }
    function register2(options2, query2) {
      var queryList = matchMedia(query2);
      binder.bind(queryList, 'change', update);
      queries.push([options2, queryList]);
    }
    function update() {
      var destroyed = state.is(DESTROYED);
      var direction = options.direction;
      var merged = queries.reduce(function (merged2, entry) {
        return merge(merged2, entry[1].matches ? entry[0] : {});
      }, {});
      omit(options);
      set3(merged);
      if (options.destroy) {
        Splide2.destroy(options.destroy === 'completely');
      } else if (destroyed) {
        destroy(true);
        Splide2.mount();
      } else {
        direction !== options.direction && Splide2.refresh();
      }
    }
    function reduce(enable) {
      if (matchMedia(MEDIA_PREFERS_REDUCED_MOTION).matches) {
        enable
          ? merge(options, reducedMotion)
          : omit(options, ownKeys2(reducedMotion));
      }
    }
    function set3(opts, base, notify) {
      merge(options, opts);
      base && merge(Object.getPrototypeOf(options), opts);
      if (notify || !state.is(CREATED)) {
        Splide2.emit(EVENT_UPDATED, options);
      }
    }
    return {
      setup,
      destroy,
      reduce,
      set: set3,
    };
  }
  var ARROW = 'Arrow';
  var ARROW_LEFT = ARROW + 'Left';
  var ARROW_RIGHT = ARROW + 'Right';
  var ARROW_UP = ARROW + 'Up';
  var ARROW_DOWN = ARROW + 'Down';
  var RTL = 'rtl';
  var TTB = 'ttb';
  var ORIENTATION_MAP = {
    width: ['height'],
    left: ['top', 'right'],
    right: ['bottom', 'left'],
    x: ['y'],
    X: ['Y'],
    Y: ['X'],
    ArrowLeft: [ARROW_UP, ARROW_RIGHT],
    ArrowRight: [ARROW_DOWN, ARROW_LEFT],
  };
  function Direction(Splide2, Components2, options) {
    function resolve(prop, axisOnly, direction) {
      direction = direction || options.direction;
      var index =
        direction === RTL && !axisOnly ? 1 : direction === TTB ? 0 : -1;
      return (
        (ORIENTATION_MAP[prop] && ORIENTATION_MAP[prop][index]) ||
        prop.replace(/width|left|right/i, function (match, offset) {
          var replacement =
            ORIENTATION_MAP[match.toLowerCase()][index] || match;
          return offset > 0
            ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
            : replacement;
        })
      );
    }
    function orient(value) {
      return value * (options.direction === RTL ? 1 : -1);
    }
    return {
      resolve,
      orient,
    };
  }
  var ROLE = 'role';
  var TAB_INDEX = 'tabindex';
  var DISABLED = 'disabled';
  var ARIA_PREFIX = 'aria-';
  var ARIA_CONTROLS = ARIA_PREFIX + 'controls';
  var ARIA_CURRENT = ARIA_PREFIX + 'current';
  var ARIA_SELECTED = ARIA_PREFIX + 'selected';
  var ARIA_LABEL = ARIA_PREFIX + 'label';
  var ARIA_LABELLEDBY = ARIA_PREFIX + 'labelledby';
  var ARIA_HIDDEN = ARIA_PREFIX + 'hidden';
  var ARIA_ORIENTATION = ARIA_PREFIX + 'orientation';
  var ARIA_ROLEDESCRIPTION = ARIA_PREFIX + 'roledescription';
  var ARIA_LIVE = ARIA_PREFIX + 'live';
  var ARIA_BUSY = ARIA_PREFIX + 'busy';
  var ARIA_ATOMIC = ARIA_PREFIX + 'atomic';
  var ALL_ATTRIBUTES = [
    ROLE,
    TAB_INDEX,
    DISABLED,
    ARIA_CONTROLS,
    ARIA_CURRENT,
    ARIA_LABEL,
    ARIA_LABELLEDBY,
    ARIA_HIDDEN,
    ARIA_ORIENTATION,
    ARIA_ROLEDESCRIPTION,
  ];
  var CLASS_PREFIX = PROJECT_CODE + '__';
  var STATUS_CLASS_PREFIX = 'is-';
  var CLASS_ROOT = PROJECT_CODE;
  var CLASS_TRACK = CLASS_PREFIX + 'track';
  var CLASS_LIST = CLASS_PREFIX + 'list';
  var CLASS_SLIDE = CLASS_PREFIX + 'slide';
  var CLASS_CLONE = CLASS_SLIDE + '--clone';
  var CLASS_CONTAINER = CLASS_SLIDE + '__container';
  var CLASS_ARROWS = CLASS_PREFIX + 'arrows';
  var CLASS_ARROW = CLASS_PREFIX + 'arrow';
  var CLASS_ARROW_PREV = CLASS_ARROW + '--prev';
  var CLASS_ARROW_NEXT = CLASS_ARROW + '--next';
  var CLASS_PAGINATION = CLASS_PREFIX + 'pagination';
  var CLASS_PAGINATION_PAGE = CLASS_PAGINATION + '__page';
  var CLASS_PROGRESS = CLASS_PREFIX + 'progress';
  var CLASS_PROGRESS_BAR = CLASS_PROGRESS + '__bar';
  var CLASS_TOGGLE = CLASS_PREFIX + 'toggle';
  var CLASS_TOGGLE_PLAY = CLASS_TOGGLE + '__play';
  var CLASS_TOGGLE_PAUSE = CLASS_TOGGLE + '__pause';
  var CLASS_SPINNER = CLASS_PREFIX + 'spinner';
  var CLASS_SR = CLASS_PREFIX + 'sr';
  var CLASS_INITIALIZED = STATUS_CLASS_PREFIX + 'initialized';
  var CLASS_ACTIVE = STATUS_CLASS_PREFIX + 'active';
  var CLASS_PREV = STATUS_CLASS_PREFIX + 'prev';
  var CLASS_NEXT = STATUS_CLASS_PREFIX + 'next';
  var CLASS_VISIBLE = STATUS_CLASS_PREFIX + 'visible';
  var CLASS_LOADING = STATUS_CLASS_PREFIX + 'loading';
  var CLASS_FOCUS_IN = STATUS_CLASS_PREFIX + 'focus-in';
  var CLASS_OVERFLOW = STATUS_CLASS_PREFIX + 'overflow';
  var STATUS_CLASSES = [
    CLASS_ACTIVE,
    CLASS_VISIBLE,
    CLASS_PREV,
    CLASS_NEXT,
    CLASS_LOADING,
    CLASS_FOCUS_IN,
    CLASS_OVERFLOW,
  ];
  var CLASSES = {
    slide: CLASS_SLIDE,
    clone: CLASS_CLONE,
    arrows: CLASS_ARROWS,
    arrow: CLASS_ARROW,
    prev: CLASS_ARROW_PREV,
    next: CLASS_ARROW_NEXT,
    pagination: CLASS_PAGINATION,
    page: CLASS_PAGINATION_PAGE,
    spinner: CLASS_SPINNER,
  };
  function closest(from, selector3) {
    if (isFunction(from.closest)) {
      return from.closest(selector3);
    }
    var elm = from;
    while (elm && elm.nodeType === 1) {
      if (matches(elm, selector3)) {
        break;
      }
      elm = elm.parentElement;
    }
    return elm;
  }
  var FRICTION = 5;
  var LOG_INTERVAL = 200;
  var POINTER_DOWN_EVENTS = 'touchstart mousedown';
  var POINTER_MOVE_EVENTS = 'touchmove mousemove';
  var POINTER_UP_EVENTS = 'touchend touchcancel mouseup click';
  function Elements(Splide2, Components2, options) {
    var _EventInterface = EventInterface(Splide2),
      on2 = _EventInterface.on,
      bind3 = _EventInterface.bind;
    var root = Splide2.root;
    var i18n = options.i18n;
    var elements = {};
    var slides = [];
    var rootClasses = [];
    var trackClasses = [];
    var track2;
    var list;
    var isUsingKey;
    function setup() {
      collect();
      init5();
      update();
    }
    function mount() {
      on2(EVENT_REFRESH, destroy);
      on2(EVENT_REFRESH, setup);
      on2(EVENT_UPDATED, update);
      bind3(
        document,
        POINTER_DOWN_EVENTS + ' keydown',
        function (e) {
          isUsingKey = e.type === 'keydown';
        },
        {
          capture: true,
        },
      );
      bind3(root, 'focusin', function () {
        toggleClass(root, CLASS_FOCUS_IN, !!isUsingKey);
      });
    }
    function destroy(completely) {
      var attrs = ALL_ATTRIBUTES.concat('style');
      empty(slides);
      removeClass(root, rootClasses);
      removeClass(track2, trackClasses);
      removeAttribute([track2, list], attrs);
      removeAttribute(
        root,
        completely ? attrs : ['style', ARIA_ROLEDESCRIPTION],
      );
    }
    function update() {
      removeClass(root, rootClasses);
      removeClass(track2, trackClasses);
      rootClasses = getClasses(CLASS_ROOT);
      trackClasses = getClasses(CLASS_TRACK);
      addClass(root, rootClasses);
      addClass(track2, trackClasses);
      setAttribute(root, ARIA_LABEL, options.label);
      setAttribute(root, ARIA_LABELLEDBY, options.labelledby);
    }
    function collect() {
      track2 = find('.' + CLASS_TRACK);
      list = child(track2, '.' + CLASS_LIST);
      assert(track2 && list, 'A track/list element is missing.');
      push(
        slides,
        children(list, '.' + CLASS_SLIDE + ':not(.' + CLASS_CLONE + ')'),
      );
      forOwn(
        {
          arrows: CLASS_ARROWS,
          pagination: CLASS_PAGINATION,
          prev: CLASS_ARROW_PREV,
          next: CLASS_ARROW_NEXT,
          bar: CLASS_PROGRESS_BAR,
          toggle: CLASS_TOGGLE,
        },
        function (className, key) {
          elements[key] = find('.' + className);
        },
      );
      assign(elements, {
        root,
        track: track2,
        list,
        slides,
      });
    }
    function init5() {
      var id = root.id || uniqueId(PROJECT_CODE);
      var role = options.role;
      root.id = id;
      track2.id = track2.id || id + '-track';
      list.id = list.id || id + '-list';
      if (!getAttribute(root, ROLE) && root.tagName !== 'SECTION' && role) {
        setAttribute(root, ROLE, role);
      }
      setAttribute(root, ARIA_ROLEDESCRIPTION, i18n.carousel);
      setAttribute(list, ROLE, 'presentation');
    }
    function find(selector3) {
      var elm = query(root, selector3);
      return elm && closest(elm, '.' + CLASS_ROOT) === root ? elm : void 0;
    }
    function getClasses(base) {
      return [
        base + '--' + options.type,
        base + '--' + options.direction,
        options.drag && base + '--draggable',
        options.isNavigation && base + '--nav',
        base === CLASS_ROOT && CLASS_ACTIVE,
      ];
    }
    return assign(elements, {
      setup,
      mount,
      destroy,
    });
  }
  var SLIDE = 'slide';
  var LOOP = 'loop';
  var FADE = 'fade';
  function Slide$1(Splide2, index, slideIndex, slide) {
    var event = EventInterface(Splide2);
    var on2 = event.on,
      emit = event.emit,
      bind3 = event.bind;
    var Components = Splide2.Components,
      root = Splide2.root,
      options = Splide2.options;
    var isNavigation = options.isNavigation,
      updateOnMove = options.updateOnMove,
      i18n = options.i18n,
      pagination = options.pagination,
      slideFocus = options.slideFocus;
    var resolve = Components.Direction.resolve;
    var styles = getAttribute(slide, 'style');
    var label = getAttribute(slide, ARIA_LABEL);
    var isClone = slideIndex > -1;
    var container = child(slide, '.' + CLASS_CONTAINER);
    var destroyed;
    function mount() {
      if (!isClone) {
        slide.id = root.id + '-slide' + pad(index + 1);
        setAttribute(slide, ROLE, pagination ? 'tabpanel' : 'group');
        setAttribute(slide, ARIA_ROLEDESCRIPTION, i18n.slide);
        setAttribute(
          slide,
          ARIA_LABEL,
          label || format(i18n.slideLabel, [index + 1, Splide2.length]),
        );
      }
      listen();
    }
    function listen() {
      bind3(slide, 'click', apply(emit, EVENT_CLICK, self));
      bind3(slide, 'keydown', apply(emit, EVENT_SLIDE_KEYDOWN, self));
      on2([EVENT_MOVED, EVENT_SHIFTED, EVENT_SCROLLED], update);
      on2(EVENT_NAVIGATION_MOUNTED, initNavigation);
      if (updateOnMove) {
        on2(EVENT_MOVE, onMove);
      }
    }
    function destroy() {
      destroyed = true;
      event.destroy();
      removeClass(slide, STATUS_CLASSES);
      removeAttribute(slide, ALL_ATTRIBUTES);
      setAttribute(slide, 'style', styles);
      setAttribute(slide, ARIA_LABEL, label || '');
    }
    function initNavigation() {
      var controls = Splide2.splides
        .map(function (target) {
          var Slide2 = target.splide.Components.Slides.getAt(index);
          return Slide2 ? Slide2.slide.id : '';
        })
        .join(' ');
      setAttribute(
        slide,
        ARIA_LABEL,
        format(i18n.slideX, (isClone ? slideIndex : index) + 1),
      );
      setAttribute(slide, ARIA_CONTROLS, controls);
      setAttribute(slide, ROLE, slideFocus ? 'button' : '');
      slideFocus && removeAttribute(slide, ARIA_ROLEDESCRIPTION);
    }
    function onMove() {
      if (!destroyed) {
        update();
      }
    }
    function update() {
      if (!destroyed) {
        var curr = Splide2.index;
        updateActivity();
        updateVisibility();
        toggleClass(slide, CLASS_PREV, index === curr - 1);
        toggleClass(slide, CLASS_NEXT, index === curr + 1);
      }
    }
    function updateActivity() {
      var active = isActive();
      if (active !== hasClass(slide, CLASS_ACTIVE)) {
        toggleClass(slide, CLASS_ACTIVE, active);
        setAttribute(slide, ARIA_CURRENT, (isNavigation && active) || '');
        emit(active ? EVENT_ACTIVE : EVENT_INACTIVE, self);
      }
    }
    function updateVisibility() {
      var visible = isVisible();
      var hidden = !visible && (!isActive() || isClone);
      if (!Splide2.state.is([MOVING, SCROLLING])) {
        setAttribute(slide, ARIA_HIDDEN, hidden || '');
      }
      setAttribute(
        queryAll(slide, options.focusableNodes || ''),
        TAB_INDEX,
        hidden ? -1 : '',
      );
      if (slideFocus) {
        setAttribute(slide, TAB_INDEX, hidden ? -1 : 0);
      }
      if (visible !== hasClass(slide, CLASS_VISIBLE)) {
        toggleClass(slide, CLASS_VISIBLE, visible);
        emit(visible ? EVENT_VISIBLE : EVENT_HIDDEN, self);
      }
      if (!visible && document.activeElement === slide) {
        var Slide2 = Components.Slides.getAt(Splide2.index);
        Slide2 && focus(Slide2.slide);
      }
    }
    function style$1(prop, value, useContainer) {
      style((useContainer && container) || slide, prop, value);
    }
    function isActive() {
      var curr = Splide2.index;
      return curr === index || (options.cloneStatus && curr === slideIndex);
    }
    function isVisible() {
      if (Splide2.is(FADE)) {
        return isActive();
      }
      var trackRect = rect(Components.Elements.track);
      var slideRect = rect(slide);
      var left = resolve('left', true);
      var right = resolve('right', true);
      return (
        floor(trackRect[left]) <= ceil(slideRect[left]) &&
        floor(slideRect[right]) <= ceil(trackRect[right])
      );
    }
    function isWithin(from, distance) {
      var diff = abs(from - index);
      if (!isClone && (options.rewind || Splide2.is(LOOP))) {
        diff = min(diff, Splide2.length - diff);
      }
      return diff <= distance;
    }
    var self = {
      index,
      slideIndex,
      slide,
      container,
      isClone,
      mount,
      destroy,
      update,
      style: style$1,
      isWithin,
    };
    return self;
  }
  function Slides(Splide2, Components2, options) {
    var _EventInterface2 = EventInterface(Splide2),
      on2 = _EventInterface2.on,
      emit = _EventInterface2.emit,
      bind3 = _EventInterface2.bind;
    var _Components2$Elements = Components2.Elements,
      slides = _Components2$Elements.slides,
      list = _Components2$Elements.list;
    var Slides2 = [];
    function mount() {
      init5();
      on2(EVENT_REFRESH, destroy);
      on2(EVENT_REFRESH, init5);
    }
    function init5() {
      slides.forEach(function (slide, index) {
        register2(slide, index, -1);
      });
    }
    function destroy() {
      forEach$1(function (Slide2) {
        Slide2.destroy();
      });
      empty(Slides2);
    }
    function update() {
      forEach$1(function (Slide2) {
        Slide2.update();
      });
    }
    function register2(slide, index, slideIndex) {
      var object = Slide$1(Splide2, index, slideIndex, slide);
      object.mount();
      Slides2.push(object);
      Slides2.sort(function (Slide1, Slide2) {
        return Slide1.index - Slide2.index;
      });
    }
    function get3(excludeClones) {
      return excludeClones
        ? filter(function (Slide2) {
            return !Slide2.isClone;
          })
        : Slides2;
    }
    function getIn(page) {
      var Controller2 = Components2.Controller;
      var index = Controller2.toIndex(page);
      var max2 = Controller2.hasFocus() ? 1 : options.perPage;
      return filter(function (Slide2) {
        return between(Slide2.index, index, index + max2 - 1);
      });
    }
    function getAt(index) {
      return filter(index)[0];
    }
    function add2(items, index) {
      forEach(items, function (slide) {
        if (isString2(slide)) {
          slide = parseHtml(slide);
        }
        if (isHTMLElement(slide)) {
          var ref = slides[index];
          ref ? before(slide, ref) : append(list, slide);
          addClass(slide, options.classes.slide);
          observeImages(slide, apply(emit, EVENT_RESIZE));
        }
      });
      emit(EVENT_REFRESH);
    }
    function remove$1(matcher) {
      remove(
        filter(matcher).map(function (Slide2) {
          return Slide2.slide;
        }),
      );
      emit(EVENT_REFRESH);
    }
    function forEach$1(iteratee, excludeClones) {
      get3(excludeClones).forEach(iteratee);
    }
    function filter(matcher) {
      return Slides2.filter(
        isFunction(matcher)
          ? matcher
          : function (Slide2) {
              return isString2(matcher)
                ? matches(Slide2.slide, matcher)
                : includes(toArray3(matcher), Slide2.index);
            },
      );
    }
    function style2(prop, value, useContainer) {
      forEach$1(function (Slide2) {
        Slide2.style(prop, value, useContainer);
      });
    }
    function observeImages(elm, callback) {
      var images = queryAll(elm, 'img');
      var length = images.length;
      if (length) {
        images.forEach(function (img) {
          bind3(img, 'load error', function () {
            if (!--length) {
              callback();
            }
          });
        });
      } else {
        callback();
      }
    }
    function getLength(excludeClones) {
      return excludeClones ? slides.length : Slides2.length;
    }
    function isEnough() {
      return Slides2.length > options.perPage;
    }
    return {
      mount,
      destroy,
      update,
      register: register2,
      get: get3,
      getIn,
      getAt,
      add: add2,
      remove: remove$1,
      forEach: forEach$1,
      filter,
      style: style2,
      getLength,
      isEnough,
    };
  }
  function Layout(Splide2, Components2, options) {
    var _EventInterface3 = EventInterface(Splide2),
      on2 = _EventInterface3.on,
      bind3 = _EventInterface3.bind,
      emit = _EventInterface3.emit;
    var Slides2 = Components2.Slides;
    var resolve = Components2.Direction.resolve;
    var _Components2$Elements2 = Components2.Elements,
      root = _Components2$Elements2.root,
      track2 = _Components2$Elements2.track,
      list = _Components2$Elements2.list;
    var getAt = Slides2.getAt,
      styleSlides = Slides2.style;
    var vertical;
    var rootRect;
    var overflow;
    function mount() {
      init5();
      bind3(window, 'resize load', Throttle(apply(emit, EVENT_RESIZE)));
      on2([EVENT_UPDATED, EVENT_REFRESH], init5);
      on2(EVENT_RESIZE, resize);
    }
    function init5() {
      vertical = options.direction === TTB;
      style(root, 'maxWidth', unit(options.width));
      style(track2, resolve('paddingLeft'), cssPadding(false));
      style(track2, resolve('paddingRight'), cssPadding(true));
      resize(true);
    }
    function resize(force) {
      var newRect = rect(root);
      if (
        force ||
        rootRect.width !== newRect.width ||
        rootRect.height !== newRect.height
      ) {
        style(track2, 'height', cssTrackHeight());
        styleSlides(resolve('marginRight'), unit(options.gap));
        styleSlides('width', cssSlideWidth());
        styleSlides('height', cssSlideHeight(), true);
        rootRect = newRect;
        emit(EVENT_RESIZED);
        if (overflow !== (overflow = isOverflow())) {
          toggleClass(root, CLASS_OVERFLOW, overflow);
          emit(EVENT_OVERFLOW, overflow);
        }
      }
    }
    function cssPadding(right) {
      var padding = options.padding;
      var prop = resolve(right ? 'right' : 'left');
      return (
        (padding &&
          unit(padding[prop] || (isObject2(padding) ? 0 : padding))) ||
        '0px'
      );
    }
    function cssTrackHeight() {
      var height = '';
      if (vertical) {
        height = cssHeight();
        assert(height, 'height or heightRatio is missing.');
        height =
          'calc(' +
          height +
          ' - ' +
          cssPadding(false) +
          ' - ' +
          cssPadding(true) +
          ')';
      }
      return height;
    }
    function cssHeight() {
      return unit(options.height || rect(list).width * options.heightRatio);
    }
    function cssSlideWidth() {
      return options.autoWidth
        ? null
        : unit(options.fixedWidth) || (vertical ? '' : cssSlideSize());
    }
    function cssSlideHeight() {
      return (
        unit(options.fixedHeight) ||
        (vertical ? (options.autoHeight ? null : cssSlideSize()) : cssHeight())
      );
    }
    function cssSlideSize() {
      var gap = unit(options.gap);
      return (
        'calc((100%' +
        (gap && ' + ' + gap) +
        ')/' +
        (options.perPage || 1) +
        (gap && ' - ' + gap) +
        ')'
      );
    }
    function listSize() {
      return rect(list)[resolve('width')];
    }
    function slideSize(index, withoutGap) {
      var Slide2 = getAt(index || 0);
      return Slide2
        ? rect(Slide2.slide)[resolve('width')] + (withoutGap ? 0 : getGap())
        : 0;
    }
    function totalSize(index, withoutGap) {
      var Slide2 = getAt(index);
      if (Slide2) {
        var right = rect(Slide2.slide)[resolve('right')];
        var left = rect(list)[resolve('left')];
        return abs(right - left) + (withoutGap ? 0 : getGap());
      }
      return 0;
    }
    function sliderSize(withoutGap) {
      return (
        totalSize(Splide2.length - 1) - totalSize(0) + slideSize(0, withoutGap)
      );
    }
    function getGap() {
      var Slide2 = getAt(0);
      return (
        (Slide2 && parseFloat(style(Slide2.slide, resolve('marginRight')))) || 0
      );
    }
    function getPadding(right) {
      return (
        parseFloat(
          style(track2, resolve('padding' + (right ? 'Right' : 'Left'))),
        ) || 0
      );
    }
    function isOverflow() {
      return Splide2.is(FADE) || sliderSize(true) > listSize();
    }
    return {
      mount,
      resize,
      listSize,
      slideSize,
      sliderSize,
      totalSize,
      getPadding,
      isOverflow,
    };
  }
  var MULTIPLIER = 2;
  function Clones(Splide2, Components2, options) {
    var event = EventInterface(Splide2);
    var on2 = event.on;
    var Elements2 = Components2.Elements,
      Slides2 = Components2.Slides;
    var resolve = Components2.Direction.resolve;
    var clones = [];
    var cloneCount;
    function mount() {
      on2(EVENT_REFRESH, remount);
      on2([EVENT_UPDATED, EVENT_RESIZE], observe);
      if ((cloneCount = computeCloneCount())) {
        generate(cloneCount);
        Components2.Layout.resize(true);
      }
    }
    function remount() {
      destroy();
      mount();
    }
    function destroy() {
      remove(clones);
      empty(clones);
      event.destroy();
    }
    function observe() {
      var count = computeCloneCount();
      if (cloneCount !== count) {
        if (cloneCount < count || !count) {
          event.emit(EVENT_REFRESH);
        }
      }
    }
    function generate(count) {
      var slides = Slides2.get().slice();
      var length = slides.length;
      if (length) {
        while (slides.length < count) {
          push(slides, slides);
        }
        push(slides.slice(-count), slides.slice(0, count)).forEach(function (
          Slide2,
          index,
        ) {
          var isHead = index < count;
          var clone2 = cloneDeep(Slide2.slide, index);
          isHead
            ? before(clone2, slides[0].slide)
            : append(Elements2.list, clone2);
          push(clones, clone2);
          Slides2.register(
            clone2,
            index - count + (isHead ? 0 : length),
            Slide2.index,
          );
        });
      }
    }
    function cloneDeep(elm, index) {
      var clone2 = elm.cloneNode(true);
      addClass(clone2, options.classes.clone);
      clone2.id = Splide2.root.id + '-clone' + pad(index + 1);
      return clone2;
    }
    function computeCloneCount() {
      var clones2 = options.clones;
      if (!Splide2.is(LOOP)) {
        clones2 = 0;
      } else if (isUndefined(clones2)) {
        var fixedSize =
          options[resolve('fixedWidth')] && Components2.Layout.slideSize(0);
        var fixedCount =
          fixedSize &&
          ceil(rect(Elements2.track)[resolve('width')] / fixedSize);
        clones2 =
          fixedCount ||
          (options[resolve('autoWidth')] && Splide2.length) ||
          options.perPage * MULTIPLIER;
      }
      return clones2;
    }
    return {
      mount,
      destroy,
    };
  }
  function Move(Splide2, Components2, options) {
    var _EventInterface4 = EventInterface(Splide2),
      on2 = _EventInterface4.on,
      emit = _EventInterface4.emit;
    var set3 = Splide2.state.set;
    var _Components2$Layout = Components2.Layout,
      slideSize = _Components2$Layout.slideSize,
      getPadding = _Components2$Layout.getPadding,
      totalSize = _Components2$Layout.totalSize,
      listSize = _Components2$Layout.listSize,
      sliderSize = _Components2$Layout.sliderSize;
    var _Components2$Directio = Components2.Direction,
      resolve = _Components2$Directio.resolve,
      orient = _Components2$Directio.orient;
    var _Components2$Elements3 = Components2.Elements,
      list = _Components2$Elements3.list,
      track2 = _Components2$Elements3.track;
    var Transition;
    function mount() {
      Transition = Components2.Transition;
      on2(
        [EVENT_MOUNTED, EVENT_RESIZED, EVENT_UPDATED, EVENT_REFRESH],
        reposition,
      );
    }
    function reposition() {
      if (!Components2.Controller.isBusy()) {
        Components2.Scroll.cancel();
        jump(Splide2.index);
        Components2.Slides.update();
      }
    }
    function move(dest, index, prev, callback) {
      if (dest !== index && canShift(dest > prev)) {
        cancel();
        translate(shift(getPosition(), dest > prev), true);
      }
      set3(MOVING);
      emit(EVENT_MOVE, index, prev, dest);
      Transition.start(index, function () {
        set3(IDLE);
        emit(EVENT_MOVED, index, prev, dest);
        callback && callback();
      });
    }
    function jump(index) {
      translate(toPosition(index, true));
    }
    function translate(position, preventLoop) {
      if (!Splide2.is(FADE)) {
        var destination = preventLoop ? position : loop2(position);
        style(
          list,
          'transform',
          'translate' + resolve('X') + '(' + destination + 'px)',
        );
        position !== destination && emit(EVENT_SHIFTED);
      }
    }
    function loop2(position) {
      if (Splide2.is(LOOP)) {
        var index = toIndex(position);
        var exceededMax = index > Components2.Controller.getEnd();
        var exceededMin = index < 0;
        if (exceededMin || exceededMax) {
          position = shift(position, exceededMax);
        }
      }
      return position;
    }
    function shift(position, backwards) {
      var excess = position - getLimit(backwards);
      var size2 = sliderSize();
      position -=
        orient(size2 * (ceil(abs(excess) / size2) || 1)) * (backwards ? 1 : -1);
      return position;
    }
    function cancel() {
      translate(getPosition(), true);
      Transition.cancel();
    }
    function toIndex(position) {
      var Slides2 = Components2.Slides.get();
      var index = 0;
      var minDistance = Infinity;
      for (var i = 0; i < Slides2.length; i++) {
        var slideIndex = Slides2[i].index;
        var distance = abs(toPosition(slideIndex, true) - position);
        if (distance <= minDistance) {
          minDistance = distance;
          index = slideIndex;
        } else {
          break;
        }
      }
      return index;
    }
    function toPosition(index, trimming) {
      var position = orient(totalSize(index - 1) - offset(index));
      return trimming ? trim(position) : position;
    }
    function getPosition() {
      var left = resolve('left');
      return rect(list)[left] - rect(track2)[left] + orient(getPadding(false));
    }
    function trim(position) {
      if (options.trimSpace && Splide2.is(SLIDE)) {
        position = clamp3(position, 0, orient(sliderSize(true) - listSize()));
      }
      return position;
    }
    function offset(index) {
      var focus2 = options.focus;
      return focus2 === 'center'
        ? (listSize() - slideSize(index, true)) / 2
        : +focus2 * slideSize(index) || 0;
    }
    function getLimit(max2) {
      return toPosition(
        max2 ? Components2.Controller.getEnd() : 0,
        !!options.trimSpace,
      );
    }
    function canShift(backwards) {
      var shifted = orient(shift(getPosition(), backwards));
      return backwards
        ? shifted >= 0
        : shifted <=
            list[resolve('scrollWidth')] - rect(track2)[resolve('width')];
    }
    function exceededLimit(max2, position) {
      position = isUndefined(position) ? getPosition() : position;
      var exceededMin =
        max2 !== true && orient(position) < orient(getLimit(false));
      var exceededMax =
        max2 !== false && orient(position) > orient(getLimit(true));
      return exceededMin || exceededMax;
    }
    return {
      mount,
      move,
      jump,
      translate,
      shift,
      cancel,
      toIndex,
      toPosition,
      getPosition,
      getLimit,
      exceededLimit,
      reposition,
    };
  }
  function Controller(Splide2, Components2, options) {
    var _EventInterface5 = EventInterface(Splide2),
      on2 = _EventInterface5.on,
      emit = _EventInterface5.emit;
    var Move2 = Components2.Move;
    var getPosition = Move2.getPosition,
      getLimit = Move2.getLimit,
      toPosition = Move2.toPosition;
    var _Components2$Slides = Components2.Slides,
      isEnough = _Components2$Slides.isEnough,
      getLength = _Components2$Slides.getLength;
    var omitEnd = options.omitEnd;
    var isLoop = Splide2.is(LOOP);
    var isSlide = Splide2.is(SLIDE);
    var getNext = apply(getAdjacent, false);
    var getPrev = apply(getAdjacent, true);
    var currIndex = options.start || 0;
    var endIndex;
    var prevIndex = currIndex;
    var slideCount;
    var perMove;
    var perPage;
    function mount() {
      init5();
      on2([EVENT_UPDATED, EVENT_REFRESH, EVENT_END_INDEX_CHANGED], init5);
      on2(EVENT_RESIZED, onResized);
    }
    function init5() {
      slideCount = getLength(true);
      perMove = options.perMove;
      perPage = options.perPage;
      endIndex = getEnd();
      var index = clamp3(currIndex, 0, omitEnd ? endIndex : slideCount - 1);
      if (index !== currIndex) {
        currIndex = index;
        Move2.reposition();
      }
    }
    function onResized() {
      if (endIndex !== getEnd()) {
        emit(EVENT_END_INDEX_CHANGED);
      }
    }
    function go(control, allowSameIndex, callback) {
      if (!isBusy()) {
        var dest = parse(control);
        var index = loop2(dest);
        if (index > -1 && (allowSameIndex || index !== currIndex)) {
          setIndex(index);
          Move2.move(dest, index, prevIndex, callback);
        }
      }
    }
    function scroll2(destination, duration, snap3, callback) {
      Components2.Scroll.scroll(destination, duration, snap3, function () {
        var index = loop2(Move2.toIndex(getPosition()));
        setIndex(omitEnd ? min(index, endIndex) : index);
        callback && callback();
      });
    }
    function parse(control) {
      var index = currIndex;
      if (isString2(control)) {
        var _ref = control.match(/([+\-<>])(\d+)?/) || [],
          indicator = _ref[1],
          number = _ref[2];
        if (indicator === '+' || indicator === '-') {
          index = computeDestIndex(
            currIndex + +('' + indicator + (+number || 1)),
            currIndex,
          );
        } else if (indicator === '>') {
          index = number ? toIndex(+number) : getNext(true);
        } else if (indicator === '<') {
          index = getPrev(true);
        }
      } else {
        index = isLoop ? control : clamp3(control, 0, endIndex);
      }
      return index;
    }
    function getAdjacent(prev, destination) {
      var number = perMove || (hasFocus() ? 1 : perPage);
      var dest = computeDestIndex(
        currIndex + number * (prev ? -1 : 1),
        currIndex,
        !(perMove || hasFocus()),
      );
      if (dest === -1 && isSlide) {
        if (!approximatelyEqual(getPosition(), getLimit(!prev), 1)) {
          return prev ? 0 : endIndex;
        }
      }
      return destination ? dest : loop2(dest);
    }
    function computeDestIndex(dest, from, snapPage) {
      if (isEnough() || hasFocus()) {
        var index = computeMovableDestIndex(dest);
        if (index !== dest) {
          from = dest;
          dest = index;
          snapPage = false;
        }
        if (dest < 0 || dest > endIndex) {
          if (
            !perMove &&
            (between(0, dest, from, true) ||
              between(endIndex, from, dest, true))
          ) {
            dest = toIndex(toPage(dest));
          } else {
            if (isLoop) {
              dest = snapPage
                ? dest < 0
                  ? -(slideCount % perPage || perPage)
                  : slideCount
                : dest;
            } else if (options.rewind) {
              dest = dest < 0 ? endIndex : 0;
            } else {
              dest = -1;
            }
          }
        } else {
          if (snapPage && dest !== from) {
            dest = toIndex(toPage(from) + (dest < from ? -1 : 1));
          }
        }
      } else {
        dest = -1;
      }
      return dest;
    }
    function computeMovableDestIndex(dest) {
      if (isSlide && options.trimSpace === 'move' && dest !== currIndex) {
        var position = getPosition();
        while (
          position === toPosition(dest, true) &&
          between(dest, 0, Splide2.length - 1, !options.rewind)
        ) {
          dest < currIndex ? --dest : ++dest;
        }
      }
      return dest;
    }
    function loop2(index) {
      return isLoop ? (index + slideCount) % slideCount || 0 : index;
    }
    function getEnd() {
      var end = slideCount - (hasFocus() || (isLoop && perMove) ? 1 : perPage);
      while (omitEnd && end-- > 0) {
        if (toPosition(slideCount - 1, true) !== toPosition(end, true)) {
          end++;
          break;
        }
      }
      return clamp3(end, 0, slideCount - 1);
    }
    function toIndex(page) {
      return clamp3(hasFocus() ? page : perPage * page, 0, endIndex);
    }
    function toPage(index) {
      return hasFocus()
        ? min(index, endIndex)
        : floor((index >= endIndex ? slideCount - 1 : index) / perPage);
    }
    function toDest(destination) {
      var closest2 = Move2.toIndex(destination);
      return isSlide ? clamp3(closest2, 0, endIndex) : closest2;
    }
    function setIndex(index) {
      if (index !== currIndex) {
        prevIndex = currIndex;
        currIndex = index;
      }
    }
    function getIndex(prev) {
      return prev ? prevIndex : currIndex;
    }
    function hasFocus() {
      return !isUndefined(options.focus) || options.isNavigation;
    }
    function isBusy() {
      return (
        Splide2.state.is([MOVING, SCROLLING]) && !!options.waitForTransition
      );
    }
    return {
      mount,
      go,
      scroll: scroll2,
      getNext,
      getPrev,
      getAdjacent,
      getEnd,
      setIndex,
      getIndex,
      toIndex,
      toPage,
      toDest,
      hasFocus,
      isBusy,
    };
  }
  var XML_NAME_SPACE = 'http://www.w3.org/2000/svg';
  var PATH =
    'm15.5 0.932-4.3 4.38 14.5 14.6-14.5 14.5 4.3 4.4 14.6-14.6 4.4-4.3-4.4-4.4-14.6-14.6z';
  var SIZE = 40;
  function Arrows(Splide2, Components2, options) {
    var event = EventInterface(Splide2);
    var on2 = event.on,
      bind3 = event.bind,
      emit = event.emit;
    var classes = options.classes,
      i18n = options.i18n;
    var Elements2 = Components2.Elements,
      Controller2 = Components2.Controller;
    var placeholder = Elements2.arrows,
      track2 = Elements2.track;
    var wrapper = placeholder;
    var prev = Elements2.prev;
    var next2 = Elements2.next;
    var created;
    var wrapperClasses;
    var arrows = {};
    function mount() {
      init5();
      on2(EVENT_UPDATED, remount);
    }
    function remount() {
      destroy();
      mount();
    }
    function init5() {
      var enabled = options.arrows;
      if (enabled && !(prev && next2)) {
        createArrows();
      }
      if (prev && next2) {
        assign(arrows, {
          prev,
          next: next2,
        });
        display(wrapper, enabled ? '' : 'none');
        addClass(
          wrapper,
          (wrapperClasses = CLASS_ARROWS + '--' + options.direction),
        );
        if (enabled) {
          listen();
          update();
          setAttribute([prev, next2], ARIA_CONTROLS, track2.id);
          emit(EVENT_ARROWS_MOUNTED, prev, next2);
        }
      }
    }
    function destroy() {
      event.destroy();
      removeClass(wrapper, wrapperClasses);
      if (created) {
        remove(placeholder ? [prev, next2] : wrapper);
        prev = next2 = null;
      } else {
        removeAttribute([prev, next2], ALL_ATTRIBUTES);
      }
    }
    function listen() {
      on2(
        [
          EVENT_MOUNTED,
          EVENT_MOVED,
          EVENT_REFRESH,
          EVENT_SCROLLED,
          EVENT_END_INDEX_CHANGED,
        ],
        update,
      );
      bind3(next2, 'click', apply(go, '>'));
      bind3(prev, 'click', apply(go, '<'));
    }
    function go(control) {
      Controller2.go(control, true);
    }
    function createArrows() {
      wrapper = placeholder || create('div', classes.arrows);
      prev = createArrow(true);
      next2 = createArrow(false);
      created = true;
      append(wrapper, [prev, next2]);
      !placeholder && before(wrapper, track2);
    }
    function createArrow(prev2) {
      var arrow =
        '<button class="' +
        classes.arrow +
        ' ' +
        (prev2 ? classes.prev : classes.next) +
        '" type="button"><svg xmlns="' +
        XML_NAME_SPACE +
        '" viewBox="0 0 ' +
        SIZE +
        ' ' +
        SIZE +
        '" width="' +
        SIZE +
        '" height="' +
        SIZE +
        '" focusable="false"><path d="' +
        (options.arrowPath || PATH) +
        '" />';
      return parseHtml(arrow);
    }
    function update() {
      if (prev && next2) {
        var index = Splide2.index;
        var prevIndex = Controller2.getPrev();
        var nextIndex = Controller2.getNext();
        var prevLabel =
          prevIndex > -1 && index < prevIndex ? i18n.last : i18n.prev;
        var nextLabel =
          nextIndex > -1 && index > nextIndex ? i18n.first : i18n.next;
        prev.disabled = prevIndex < 0;
        next2.disabled = nextIndex < 0;
        setAttribute(prev, ARIA_LABEL, prevLabel);
        setAttribute(next2, ARIA_LABEL, nextLabel);
        emit(EVENT_ARROWS_UPDATED, prev, next2, prevIndex, nextIndex);
      }
    }
    return {
      arrows,
      mount,
      destroy,
      update,
    };
  }
  var INTERVAL_DATA_ATTRIBUTE = DATA_ATTRIBUTE + '-interval';
  function Autoplay(Splide2, Components2, options) {
    var _EventInterface6 = EventInterface(Splide2),
      on2 = _EventInterface6.on,
      bind3 = _EventInterface6.bind,
      emit = _EventInterface6.emit;
    var interval = RequestInterval(
      options.interval,
      Splide2.go.bind(Splide2, '>'),
      onAnimationFrame,
    );
    var isPaused = interval.isPaused;
    var Elements2 = Components2.Elements,
      _Components2$Elements4 = Components2.Elements,
      root = _Components2$Elements4.root,
      toggle = _Components2$Elements4.toggle;
    var autoplay = options.autoplay;
    var hovered;
    var focused;
    var stopped = autoplay === 'pause';
    function mount() {
      if (autoplay) {
        listen();
        toggle && setAttribute(toggle, ARIA_CONTROLS, Elements2.track.id);
        stopped || play();
        update();
      }
    }
    function listen() {
      if (options.pauseOnHover) {
        bind3(root, 'mouseenter mouseleave', function (e) {
          hovered = e.type === 'mouseenter';
          autoToggle();
        });
      }
      if (options.pauseOnFocus) {
        bind3(root, 'focusin focusout', function (e) {
          focused = e.type === 'focusin';
          autoToggle();
        });
      }
      if (toggle) {
        bind3(toggle, 'click', function () {
          stopped ? play() : pause(true);
        });
      }
      on2([EVENT_MOVE, EVENT_SCROLL, EVENT_REFRESH], interval.rewind);
      on2(EVENT_MOVE, onMove);
    }
    function play() {
      if (isPaused() && Components2.Slides.isEnough()) {
        interval.start(!options.resetProgress);
        focused = hovered = stopped = false;
        update();
        emit(EVENT_AUTOPLAY_PLAY);
      }
    }
    function pause(stop2) {
      if (stop2 === void 0) {
        stop2 = true;
      }
      stopped = !!stop2;
      update();
      if (!isPaused()) {
        interval.pause();
        emit(EVENT_AUTOPLAY_PAUSE);
      }
    }
    function autoToggle() {
      if (!stopped) {
        hovered || focused ? pause(false) : play();
      }
    }
    function update() {
      if (toggle) {
        toggleClass(toggle, CLASS_ACTIVE, !stopped);
        setAttribute(
          toggle,
          ARIA_LABEL,
          options.i18n[stopped ? 'play' : 'pause'],
        );
      }
    }
    function onAnimationFrame(rate) {
      var bar = Elements2.bar;
      bar && style(bar, 'width', rate * 100 + '%');
      emit(EVENT_AUTOPLAY_PLAYING, rate);
    }
    function onMove(index) {
      var Slide2 = Components2.Slides.getAt(index);
      interval.set(
        (Slide2 && +getAttribute(Slide2.slide, INTERVAL_DATA_ATTRIBUTE)) ||
          options.interval,
      );
    }
    return {
      mount,
      destroy: interval.cancel,
      play,
      pause,
      isPaused,
    };
  }
  function Cover(Splide2, Components2, options) {
    var _EventInterface7 = EventInterface(Splide2),
      on2 = _EventInterface7.on;
    function mount() {
      if (options.cover) {
        on2(EVENT_LAZYLOAD_LOADED, apply(toggle, true));
        on2([EVENT_MOUNTED, EVENT_UPDATED, EVENT_REFRESH], apply(cover, true));
      }
    }
    function cover(cover2) {
      Components2.Slides.forEach(function (Slide2) {
        var img = child(Slide2.container || Slide2.slide, 'img');
        if (img && img.src) {
          toggle(cover2, img, Slide2);
        }
      });
    }
    function toggle(cover2, img, Slide2) {
      Slide2.style(
        'background',
        cover2 ? 'center/cover no-repeat url("' + img.src + '")' : '',
        true,
      );
      display(img, cover2 ? 'none' : '');
    }
    return {
      mount,
      destroy: apply(cover, false),
    };
  }
  var BOUNCE_DIFF_THRESHOLD = 10;
  var BOUNCE_DURATION = 600;
  var FRICTION_FACTOR = 0.6;
  var BASE_VELOCITY = 1.5;
  var MIN_DURATION = 800;
  function Scroll(Splide2, Components2, options) {
    var _EventInterface8 = EventInterface(Splide2),
      on2 = _EventInterface8.on,
      emit = _EventInterface8.emit;
    var set3 = Splide2.state.set;
    var Move2 = Components2.Move;
    var getPosition = Move2.getPosition,
      getLimit = Move2.getLimit,
      exceededLimit = Move2.exceededLimit,
      translate = Move2.translate;
    var isSlide = Splide2.is(SLIDE);
    var interval;
    var callback;
    var friction = 1;
    function mount() {
      on2(EVENT_MOVE, clear2);
      on2([EVENT_UPDATED, EVENT_REFRESH], cancel);
    }
    function scroll2(destination, duration, snap3, onScrolled, noConstrain) {
      var from = getPosition();
      clear2();
      if (snap3 && (!isSlide || !exceededLimit())) {
        var size2 = Components2.Layout.sliderSize();
        var offset =
          sign(destination) * size2 * floor(abs(destination) / size2) || 0;
        destination =
          Move2.toPosition(Components2.Controller.toDest(destination % size2)) +
          offset;
      }
      var noDistance = approximatelyEqual(from, destination, 1);
      friction = 1;
      duration = noDistance
        ? 0
        : duration ||
          max(abs(destination - from) / BASE_VELOCITY, MIN_DURATION);
      callback = onScrolled;
      interval = RequestInterval(
        duration,
        onEnd,
        apply(update, from, destination, noConstrain),
        1,
      );
      set3(SCROLLING);
      emit(EVENT_SCROLL);
      interval.start();
    }
    function onEnd() {
      set3(IDLE);
      callback && callback();
      emit(EVENT_SCROLLED);
    }
    function update(from, to, noConstrain, rate) {
      var position = getPosition();
      var target = from + (to - from) * easing(rate);
      var diff = (target - position) * friction;
      translate(position + diff);
      if (isSlide && !noConstrain && exceededLimit()) {
        friction *= FRICTION_FACTOR;
        if (abs(diff) < BOUNCE_DIFF_THRESHOLD) {
          scroll2(
            getLimit(exceededLimit(true)),
            BOUNCE_DURATION,
            false,
            callback,
            true,
          );
        }
      }
    }
    function clear2() {
      if (interval) {
        interval.cancel();
      }
    }
    function cancel() {
      if (interval && !interval.isPaused()) {
        clear2();
        onEnd();
      }
    }
    function easing(t) {
      var easingFunc = options.easingFunc;
      return easingFunc ? easingFunc(t) : 1 - Math.pow(1 - t, 4);
    }
    return {
      mount,
      destroy: clear2,
      scroll: scroll2,
      cancel,
    };
  }
  var SCROLL_LISTENER_OPTIONS = {
    passive: false,
    capture: true,
  };
  function Drag(Splide2, Components2, options) {
    var _EventInterface9 = EventInterface(Splide2),
      on2 = _EventInterface9.on,
      emit = _EventInterface9.emit,
      bind3 = _EventInterface9.bind,
      unbind = _EventInterface9.unbind;
    var state = Splide2.state;
    var Move2 = Components2.Move,
      Scroll2 = Components2.Scroll,
      Controller2 = Components2.Controller,
      track2 = Components2.Elements.track,
      reduce = Components2.Media.reduce;
    var _Components2$Directio2 = Components2.Direction,
      resolve = _Components2$Directio2.resolve,
      orient = _Components2$Directio2.orient;
    var getPosition = Move2.getPosition,
      exceededLimit = Move2.exceededLimit;
    var basePosition;
    var baseEvent;
    var prevBaseEvent;
    var isFree;
    var dragging;
    var exceeded = false;
    var clickPrevented;
    var disabled;
    var target;
    function mount() {
      bind3(track2, POINTER_MOVE_EVENTS, noop, SCROLL_LISTENER_OPTIONS);
      bind3(track2, POINTER_UP_EVENTS, noop, SCROLL_LISTENER_OPTIONS);
      bind3(
        track2,
        POINTER_DOWN_EVENTS,
        onPointerDown,
        SCROLL_LISTENER_OPTIONS,
      );
      bind3(track2, 'click', onClick, {
        capture: true,
      });
      bind3(track2, 'dragstart', prevent);
      on2([EVENT_MOUNTED, EVENT_UPDATED], init5);
    }
    function init5() {
      var drag = options.drag;
      disable(!drag);
      isFree = drag === 'free';
    }
    function onPointerDown(e) {
      clickPrevented = false;
      if (!disabled) {
        var isTouch = isTouchEvent(e);
        if (isDraggable(e.target) && (isTouch || !e.button)) {
          if (!Controller2.isBusy()) {
            target = isTouch ? track2 : window;
            dragging = state.is([MOVING, SCROLLING]);
            prevBaseEvent = null;
            bind3(
              target,
              POINTER_MOVE_EVENTS,
              onPointerMove,
              SCROLL_LISTENER_OPTIONS,
            );
            bind3(
              target,
              POINTER_UP_EVENTS,
              onPointerUp,
              SCROLL_LISTENER_OPTIONS,
            );
            Move2.cancel();
            Scroll2.cancel();
            save(e);
          } else {
            prevent(e, true);
          }
        }
      }
    }
    function onPointerMove(e) {
      if (!state.is(DRAGGING)) {
        state.set(DRAGGING);
        emit(EVENT_DRAG);
      }
      if (e.cancelable) {
        if (dragging) {
          Move2.translate(basePosition + constrain(diffCoord(e)));
          var expired = diffTime(e) > LOG_INTERVAL;
          var hasExceeded = exceeded !== (exceeded = exceededLimit());
          if (expired || hasExceeded) {
            save(e);
          }
          clickPrevented = true;
          emit(EVENT_DRAGGING);
          prevent(e);
        } else if (isSliderDirection(e)) {
          dragging = shouldStart(e);
          prevent(e);
        }
      }
    }
    function onPointerUp(e) {
      if (state.is(DRAGGING)) {
        state.set(IDLE);
        emit(EVENT_DRAGGED);
      }
      if (dragging) {
        move(e);
        prevent(e);
      }
      unbind(target, POINTER_MOVE_EVENTS, onPointerMove);
      unbind(target, POINTER_UP_EVENTS, onPointerUp);
      dragging = false;
    }
    function onClick(e) {
      if (!disabled && clickPrevented) {
        prevent(e, true);
      }
    }
    function save(e) {
      prevBaseEvent = baseEvent;
      baseEvent = e;
      basePosition = getPosition();
    }
    function move(e) {
      var velocity = computeVelocity(e);
      var destination = computeDestination(velocity);
      var rewind = options.rewind && options.rewindByDrag;
      reduce(false);
      if (isFree) {
        Controller2.scroll(destination, 0, options.snap);
      } else if (Splide2.is(FADE)) {
        Controller2.go(
          orient(sign(velocity)) < 0
            ? rewind
              ? '<'
              : '-'
            : rewind
            ? '>'
            : '+',
        );
      } else if (Splide2.is(SLIDE) && exceeded && rewind) {
        Controller2.go(exceededLimit(true) ? '>' : '<');
      } else {
        Controller2.go(Controller2.toDest(destination), true);
      }
      reduce(true);
    }
    function shouldStart(e) {
      var thresholds = options.dragMinThreshold;
      var isObj = isObject2(thresholds);
      var mouse = (isObj && thresholds.mouse) || 0;
      var touch = (isObj ? thresholds.touch : +thresholds) || 10;
      return abs(diffCoord(e)) > (isTouchEvent(e) ? touch : mouse);
    }
    function isSliderDirection(e) {
      return abs(diffCoord(e)) > abs(diffCoord(e, true));
    }
    function computeVelocity(e) {
      if (Splide2.is(LOOP) || !exceeded) {
        var time = diffTime(e);
        if (time && time < LOG_INTERVAL) {
          return diffCoord(e) / time;
        }
      }
      return 0;
    }
    function computeDestination(velocity) {
      return (
        getPosition() +
        sign(velocity) *
          min(
            abs(velocity) * (options.flickPower || 600),
            isFree
              ? Infinity
              : Components2.Layout.listSize() * (options.flickMaxPages || 1),
          )
      );
    }
    function diffCoord(e, orthogonal) {
      return coordOf(e, orthogonal) - coordOf(getBaseEvent(e), orthogonal);
    }
    function diffTime(e) {
      return timeOf(e) - timeOf(getBaseEvent(e));
    }
    function getBaseEvent(e) {
      return (baseEvent === e && prevBaseEvent) || baseEvent;
    }
    function coordOf(e, orthogonal) {
      return (isTouchEvent(e) ? e.changedTouches[0] : e)[
        'page' + resolve(orthogonal ? 'Y' : 'X')
      ];
    }
    function constrain(diff) {
      return diff / (exceeded && Splide2.is(SLIDE) ? FRICTION : 1);
    }
    function isDraggable(target2) {
      var noDrag = options.noDrag;
      return (
        !matches(target2, '.' + CLASS_PAGINATION_PAGE + ', .' + CLASS_ARROW) &&
        (!noDrag || !matches(target2, noDrag))
      );
    }
    function isTouchEvent(e) {
      return typeof TouchEvent !== 'undefined' && e instanceof TouchEvent;
    }
    function isDragging() {
      return dragging;
    }
    function disable(value) {
      disabled = value;
    }
    return {
      mount,
      disable,
      isDragging,
    };
  }
  var NORMALIZATION_MAP = {
    Spacebar: ' ',
    Right: ARROW_RIGHT,
    Left: ARROW_LEFT,
    Up: ARROW_UP,
    Down: ARROW_DOWN,
  };
  function normalizeKey(key) {
    key = isString2(key) ? key : key.key;
    return NORMALIZATION_MAP[key] || key;
  }
  var KEYBOARD_EVENT = 'keydown';
  function Keyboard(Splide2, Components2, options) {
    var _EventInterface10 = EventInterface(Splide2),
      on2 = _EventInterface10.on,
      bind3 = _EventInterface10.bind,
      unbind = _EventInterface10.unbind;
    var root = Splide2.root;
    var resolve = Components2.Direction.resolve;
    var target;
    var disabled;
    function mount() {
      init5();
      on2(EVENT_UPDATED, destroy);
      on2(EVENT_UPDATED, init5);
      on2(EVENT_MOVE, onMove);
    }
    function init5() {
      var keyboard = options.keyboard;
      if (keyboard) {
        target = keyboard === 'global' ? window : root;
        bind3(target, KEYBOARD_EVENT, onKeydown);
      }
    }
    function destroy() {
      unbind(target, KEYBOARD_EVENT);
    }
    function disable(value) {
      disabled = value;
    }
    function onMove() {
      var _disabled = disabled;
      disabled = true;
      nextTick2(function () {
        disabled = _disabled;
      });
    }
    function onKeydown(e) {
      if (!disabled) {
        var key = normalizeKey(e);
        if (key === resolve(ARROW_LEFT)) {
          Splide2.go('<');
        } else if (key === resolve(ARROW_RIGHT)) {
          Splide2.go('>');
        }
      }
    }
    return {
      mount,
      destroy,
      disable,
    };
  }
  var SRC_DATA_ATTRIBUTE = DATA_ATTRIBUTE + '-lazy';
  var SRCSET_DATA_ATTRIBUTE = SRC_DATA_ATTRIBUTE + '-srcset';
  var IMAGE_SELECTOR =
    '[' + SRC_DATA_ATTRIBUTE + '], [' + SRCSET_DATA_ATTRIBUTE + ']';
  function LazyLoad(Splide2, Components2, options) {
    var _EventInterface11 = EventInterface(Splide2),
      on2 = _EventInterface11.on,
      off = _EventInterface11.off,
      bind3 = _EventInterface11.bind,
      emit = _EventInterface11.emit;
    var isSequential = options.lazyLoad === 'sequential';
    var events = [EVENT_MOVED, EVENT_SCROLLED];
    var entries = [];
    function mount() {
      if (options.lazyLoad) {
        init5();
        on2(EVENT_REFRESH, init5);
      }
    }
    function init5() {
      empty(entries);
      register2();
      if (isSequential) {
        loadNext();
      } else {
        off(events);
        on2(events, check);
        check();
      }
    }
    function register2() {
      Components2.Slides.forEach(function (Slide2) {
        queryAll(Slide2.slide, IMAGE_SELECTOR).forEach(function (img) {
          var src = getAttribute(img, SRC_DATA_ATTRIBUTE);
          var srcset = getAttribute(img, SRCSET_DATA_ATTRIBUTE);
          if (src !== img.src || srcset !== img.srcset) {
            var className = options.classes.spinner;
            var parent = img.parentElement;
            var spinner =
              child(parent, '.' + className) ||
              create('span', className, parent);
            entries.push([img, Slide2, spinner]);
            img.src || display(img, 'none');
          }
        });
      });
    }
    function check() {
      entries = entries.filter(function (data2) {
        var distance = options.perPage * ((options.preloadPages || 1) + 1) - 1;
        return data2[1].isWithin(Splide2.index, distance) ? load(data2) : true;
      });
      entries.length || off(events);
    }
    function load(data2) {
      var img = data2[0];
      addClass(data2[1].slide, CLASS_LOADING);
      bind3(img, 'load error', apply(onLoad, data2));
      setAttribute(img, 'src', getAttribute(img, SRC_DATA_ATTRIBUTE));
      setAttribute(img, 'srcset', getAttribute(img, SRCSET_DATA_ATTRIBUTE));
      removeAttribute(img, SRC_DATA_ATTRIBUTE);
      removeAttribute(img, SRCSET_DATA_ATTRIBUTE);
    }
    function onLoad(data2, e) {
      var img = data2[0],
        Slide2 = data2[1];
      removeClass(Slide2.slide, CLASS_LOADING);
      if (e.type !== 'error') {
        remove(data2[2]);
        display(img, '');
        emit(EVENT_LAZYLOAD_LOADED, img, Slide2);
        emit(EVENT_RESIZE);
      }
      isSequential && loadNext();
    }
    function loadNext() {
      entries.length && load(entries.shift());
    }
    return {
      mount,
      destroy: apply(empty, entries),
      check,
    };
  }
  function Pagination(Splide2, Components2, options) {
    var event = EventInterface(Splide2);
    var on2 = event.on,
      emit = event.emit,
      bind3 = event.bind;
    var Slides2 = Components2.Slides,
      Elements2 = Components2.Elements,
      Controller2 = Components2.Controller;
    var hasFocus = Controller2.hasFocus,
      getIndex = Controller2.getIndex,
      go = Controller2.go;
    var resolve = Components2.Direction.resolve;
    var placeholder = Elements2.pagination;
    var items = [];
    var list;
    var paginationClasses;
    function mount() {
      destroy();
      on2([EVENT_UPDATED, EVENT_REFRESH, EVENT_END_INDEX_CHANGED], mount);
      var enabled = options.pagination;
      placeholder && display(placeholder, enabled ? '' : 'none');
      if (enabled) {
        on2([EVENT_MOVE, EVENT_SCROLL, EVENT_SCROLLED], update);
        createPagination();
        update();
        emit(
          EVENT_PAGINATION_MOUNTED,
          {
            list,
            items,
          },
          getAt(Splide2.index),
        );
      }
    }
    function destroy() {
      if (list) {
        remove(placeholder ? slice(list.children) : list);
        removeClass(list, paginationClasses);
        empty(items);
        list = null;
      }
      event.destroy();
    }
    function createPagination() {
      var length = Splide2.length;
      var classes = options.classes,
        i18n = options.i18n,
        perPage = options.perPage;
      var max2 = hasFocus() ? Controller2.getEnd() + 1 : ceil(length / perPage);
      list =
        placeholder ||
        create('ul', classes.pagination, Elements2.track.parentElement);
      addClass(
        list,
        (paginationClasses = CLASS_PAGINATION + '--' + getDirection()),
      );
      setAttribute(list, ROLE, 'tablist');
      setAttribute(list, ARIA_LABEL, i18n.select);
      setAttribute(
        list,
        ARIA_ORIENTATION,
        getDirection() === TTB ? 'vertical' : '',
      );
      for (var i = 0; i < max2; i++) {
        var li = create('li', null, list);
        var button = create(
          'button',
          {
            class: classes.page,
            type: 'button',
          },
          li,
        );
        var controls = Slides2.getIn(i).map(function (Slide2) {
          return Slide2.slide.id;
        });
        var text = !hasFocus() && perPage > 1 ? i18n.pageX : i18n.slideX;
        bind3(button, 'click', apply(onClick, i));
        if (options.paginationKeyboard) {
          bind3(button, 'keydown', apply(onKeydown, i));
        }
        setAttribute(li, ROLE, 'presentation');
        setAttribute(button, ROLE, 'tab');
        setAttribute(button, ARIA_CONTROLS, controls.join(' '));
        setAttribute(button, ARIA_LABEL, format(text, i + 1));
        setAttribute(button, TAB_INDEX, -1);
        items.push({
          li,
          button,
          page: i,
        });
      }
    }
    function onClick(page) {
      go('>' + page, true);
    }
    function onKeydown(page, e) {
      var length = items.length;
      var key = normalizeKey(e);
      var dir = getDirection();
      var nextPage = -1;
      if (key === resolve(ARROW_RIGHT, false, dir)) {
        nextPage = ++page % length;
      } else if (key === resolve(ARROW_LEFT, false, dir)) {
        nextPage = (--page + length) % length;
      } else if (key === 'Home') {
        nextPage = 0;
      } else if (key === 'End') {
        nextPage = length - 1;
      }
      var item = items[nextPage];
      if (item) {
        focus(item.button);
        go('>' + nextPage);
        prevent(e, true);
      }
    }
    function getDirection() {
      return options.paginationDirection || options.direction;
    }
    function getAt(index) {
      return items[Controller2.toPage(index)];
    }
    function update() {
      var prev = getAt(getIndex(true));
      var curr = getAt(getIndex());
      if (prev) {
        var button = prev.button;
        removeClass(button, CLASS_ACTIVE);
        removeAttribute(button, ARIA_SELECTED);
        setAttribute(button, TAB_INDEX, -1);
      }
      if (curr) {
        var _button = curr.button;
        addClass(_button, CLASS_ACTIVE);
        setAttribute(_button, ARIA_SELECTED, true);
        setAttribute(_button, TAB_INDEX, '');
      }
      emit(
        EVENT_PAGINATION_UPDATED,
        {
          list,
          items,
        },
        prev,
        curr,
      );
    }
    return {
      items,
      mount,
      destroy,
      getAt,
      update,
    };
  }
  var TRIGGER_KEYS = [' ', 'Enter'];
  function Sync(Splide2, Components2, options) {
    var isNavigation = options.isNavigation,
      slideFocus = options.slideFocus;
    var events = [];
    function mount() {
      Splide2.splides.forEach(function (target) {
        if (!target.isParent) {
          sync(Splide2, target.splide);
          sync(target.splide, Splide2);
        }
      });
      if (isNavigation) {
        navigate();
      }
    }
    function destroy() {
      events.forEach(function (event) {
        event.destroy();
      });
      empty(events);
    }
    function remount() {
      destroy();
      mount();
    }
    function sync(splide, target) {
      var event = EventInterface(splide);
      event.on(EVENT_MOVE, function (index, prev, dest) {
        target.go(target.is(LOOP) ? dest : index);
      });
      events.push(event);
    }
    function navigate() {
      var event = EventInterface(Splide2);
      var on2 = event.on;
      on2(EVENT_CLICK, onClick);
      on2(EVENT_SLIDE_KEYDOWN, onKeydown);
      on2([EVENT_MOUNTED, EVENT_UPDATED], update);
      events.push(event);
      event.emit(EVENT_NAVIGATION_MOUNTED, Splide2.splides);
    }
    function update() {
      setAttribute(
        Components2.Elements.list,
        ARIA_ORIENTATION,
        options.direction === TTB ? 'vertical' : '',
      );
    }
    function onClick(Slide2) {
      Splide2.go(Slide2.index);
    }
    function onKeydown(Slide2, e) {
      if (includes(TRIGGER_KEYS, normalizeKey(e))) {
        onClick(Slide2);
        prevent(e);
      }
    }
    return {
      setup: apply(
        Components2.Media.set,
        {
          slideFocus: isUndefined(slideFocus) ? isNavigation : slideFocus,
        },
        true,
      ),
      mount,
      destroy,
      remount,
    };
  }
  function Wheel(Splide2, Components2, options) {
    var _EventInterface12 = EventInterface(Splide2),
      bind3 = _EventInterface12.bind;
    var lastTime = 0;
    function mount() {
      if (options.wheel) {
        bind3(
          Components2.Elements.track,
          'wheel',
          onWheel,
          SCROLL_LISTENER_OPTIONS,
        );
      }
    }
    function onWheel(e) {
      if (e.cancelable) {
        var deltaY = e.deltaY;
        var backwards = deltaY < 0;
        var timeStamp = timeOf(e);
        var _min = options.wheelMinThreshold || 0;
        var sleep = options.wheelSleep || 0;
        if (abs(deltaY) > _min && timeStamp - lastTime > sleep) {
          Splide2.go(backwards ? '<' : '>');
          lastTime = timeStamp;
        }
        shouldPrevent(backwards) && prevent(e);
      }
    }
    function shouldPrevent(backwards) {
      return (
        !options.releaseWheel ||
        Splide2.state.is(MOVING) ||
        Components2.Controller.getAdjacent(backwards) !== -1
      );
    }
    return {
      mount,
    };
  }
  var SR_REMOVAL_DELAY = 90;
  function Live(Splide2, Components2, options) {
    var _EventInterface13 = EventInterface(Splide2),
      on2 = _EventInterface13.on;
    var track2 = Components2.Elements.track;
    var enabled = options.live && !options.isNavigation;
    var sr = create('span', CLASS_SR);
    var interval = RequestInterval(SR_REMOVAL_DELAY, apply(toggle, false));
    function mount() {
      if (enabled) {
        disable(!Components2.Autoplay.isPaused());
        setAttribute(track2, ARIA_ATOMIC, true);
        sr.textContent = '\u2026';
        on2(EVENT_AUTOPLAY_PLAY, apply(disable, true));
        on2(EVENT_AUTOPLAY_PAUSE, apply(disable, false));
        on2([EVENT_MOVED, EVENT_SCROLLED], apply(toggle, true));
      }
    }
    function toggle(active) {
      setAttribute(track2, ARIA_BUSY, active);
      if (active) {
        append(track2, sr);
        interval.start();
      } else {
        remove(sr);
        interval.cancel();
      }
    }
    function destroy() {
      removeAttribute(track2, [ARIA_LIVE, ARIA_ATOMIC, ARIA_BUSY]);
      remove(sr);
    }
    function disable(disabled) {
      if (enabled) {
        setAttribute(track2, ARIA_LIVE, disabled ? 'off' : 'polite');
      }
    }
    return {
      mount,
      disable,
      destroy,
    };
  }
  var ComponentConstructors = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    Media,
    Direction,
    Elements,
    Slides,
    Layout,
    Clones,
    Move,
    Controller,
    Arrows,
    Autoplay,
    Cover,
    Scroll,
    Drag,
    Keyboard,
    LazyLoad,
    Pagination,
    Sync,
    Wheel,
    Live,
  });
  var I18N = {
    prev: 'Previous slide',
    next: 'Next slide',
    first: 'Go to first slide',
    last: 'Go to last slide',
    slideX: 'Go to slide %s',
    pageX: 'Go to page %s',
    play: 'Start autoplay',
    pause: 'Pause autoplay',
    carousel: 'carousel',
    slide: 'slide',
    select: 'Select a slide to show',
    slideLabel: '%s of %s',
  };
  var DEFAULTS = {
    type: 'slide',
    role: 'region',
    speed: 400,
    perPage: 1,
    cloneStatus: true,
    arrows: true,
    pagination: true,
    paginationKeyboard: true,
    interval: 5e3,
    pauseOnHover: true,
    pauseOnFocus: true,
    resetProgress: true,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    drag: true,
    direction: 'ltr',
    trimSpace: true,
    focusableNodes: 'a, button, textarea, input, select, iframe',
    live: true,
    classes: CLASSES,
    i18n: I18N,
    reducedMotion: {
      speed: 0,
      rewindSpeed: 0,
      autoplay: 'pause',
    },
  };
  function Fade(Splide2, Components2, options) {
    var Slides2 = Components2.Slides;
    function mount() {
      EventInterface(Splide2).on([EVENT_MOUNTED, EVENT_REFRESH], init5);
    }
    function init5() {
      Slides2.forEach(function (Slide2) {
        Slide2.style('transform', 'translateX(-' + 100 * Slide2.index + '%)');
      });
    }
    function start3(index, done) {
      Slides2.style(
        'transition',
        'opacity ' + options.speed + 'ms ' + options.easing,
      );
      nextTick2(done);
    }
    return {
      mount,
      start: start3,
      cancel: noop,
    };
  }
  function Slide(Splide2, Components2, options) {
    var Move2 = Components2.Move,
      Controller2 = Components2.Controller,
      Scroll2 = Components2.Scroll;
    var list = Components2.Elements.list;
    var transition2 = apply(style, list, 'transition');
    var endCallback;
    function mount() {
      EventInterface(Splide2).bind(list, 'transitionend', function (e) {
        if (e.target === list && endCallback) {
          cancel();
          endCallback();
        }
      });
    }
    function start3(index, done) {
      var destination = Move2.toPosition(index, true);
      var position = Move2.getPosition();
      var speed = getSpeed(index);
      if (abs(destination - position) >= 1 && speed >= 1) {
        if (options.useScroll) {
          Scroll2.scroll(destination, speed, false, done);
        } else {
          transition2('transform ' + speed + 'ms ' + options.easing);
          Move2.translate(destination, true);
          endCallback = done;
        }
      } else {
        Move2.jump(index);
        done();
      }
    }
    function cancel() {
      transition2('');
      Scroll2.cancel();
    }
    function getSpeed(index) {
      var rewindSpeed = options.rewindSpeed;
      if (Splide2.is(SLIDE) && rewindSpeed) {
        var prev = Controller2.getIndex(true);
        var end = Controller2.getEnd();
        if ((prev === 0 && index >= end) || (prev >= end && index === 0)) {
          return rewindSpeed;
        }
      }
      return options.speed;
    }
    return {
      mount,
      start: start3,
      cancel,
    };
  }
  var _Splide = /* @__PURE__ */ (function () {
    function _Splide2(target, options) {
      this.event = EventInterface();
      this.Components = {};
      this.state = State(CREATED);
      this.splides = [];
      this._o = {};
      this._E = {};
      var root = isString2(target) ? query(document, target) : target;
      assert(root, root + ' is invalid.');
      this.root = root;
      options = merge(
        {
          label: getAttribute(root, ARIA_LABEL) || '',
          labelledby: getAttribute(root, ARIA_LABELLEDBY) || '',
        },
        DEFAULTS,
        _Splide2.defaults,
        options || {},
      );
      try {
        merge(options, JSON.parse(getAttribute(root, DATA_ATTRIBUTE)));
      } catch (e) {
        assert(false, 'Invalid JSON');
      }
      this._o = Object.create(merge({}, options));
    }
    var _proto = _Splide2.prototype;
    _proto.mount = function mount(Extensions, Transition) {
      var _this = this;
      var state = this.state,
        Components2 = this.Components;
      assert(state.is([CREATED, DESTROYED]), 'Already mounted!');
      state.set(CREATED);
      this._C = Components2;
      this._T = Transition || this._T || (this.is(FADE) ? Fade : Slide);
      this._E = Extensions || this._E;
      var Constructors = assign({}, ComponentConstructors, this._E, {
        Transition: this._T,
      });
      forOwn(Constructors, function (Component, key) {
        var component = Component(_this, Components2, _this._o);
        Components2[key] = component;
        component.setup && component.setup();
      });
      forOwn(Components2, function (component) {
        component.mount && component.mount();
      });
      this.emit(EVENT_MOUNTED);
      addClass(this.root, CLASS_INITIALIZED);
      state.set(IDLE);
      this.emit(EVENT_READY);
      return this;
    };
    _proto.sync = function sync(splide) {
      this.splides.push({
        splide,
      });
      splide.splides.push({
        splide: this,
        isParent: true,
      });
      if (this.state.is(IDLE)) {
        this._C.Sync.remount();
        splide.Components.Sync.remount();
      }
      return this;
    };
    _proto.go = function go(control) {
      this._C.Controller.go(control);
      return this;
    };
    _proto.on = function on2(events, callback) {
      this.event.on(events, callback);
      return this;
    };
    _proto.off = function off(events) {
      this.event.off(events);
      return this;
    };
    _proto.emit = function emit(event) {
      var _this$event;
      (_this$event = this.event).emit.apply(
        _this$event,
        [event].concat(slice(arguments, 1)),
      );
      return this;
    };
    _proto.add = function add2(slides, index) {
      this._C.Slides.add(slides, index);
      return this;
    };
    _proto.remove = function remove2(matcher) {
      this._C.Slides.remove(matcher);
      return this;
    };
    _proto.is = function is(type) {
      return this._o.type === type;
    };
    _proto.refresh = function refresh() {
      this.emit(EVENT_REFRESH);
      return this;
    };
    _proto.destroy = function destroy(completely) {
      if (completely === void 0) {
        completely = true;
      }
      var event = this.event,
        state = this.state;
      if (state.is(CREATED)) {
        EventInterface(this).on(
          EVENT_READY,
          this.destroy.bind(this, completely),
        );
      } else {
        forOwn(
          this._C,
          function (component) {
            component.destroy && component.destroy(completely);
          },
          true,
        );
        event.emit(EVENT_DESTROY);
        event.destroy();
        completely && empty(this.splides);
        state.set(DESTROYED);
      }
      return this;
    };
    _createClass(_Splide2, [
      {
        key: 'options',
        get: function get3() {
          return this._o;
        },
        set: function set3(options) {
          this._C.Media.set(options, true, true);
        },
      },
      {
        key: 'length',
        get: function get3() {
          return this._C.Slides.getLength(true);
        },
      },
      {
        key: 'index',
        get: function get3() {
          return this._C.Controller.getIndex();
        },
      },
    ]);
    return _Splide2;
  })();
  var Splide = _Splide;
  Splide.defaults = {};
  Splide.STATES = STATES;

  // src/js/gallery.js
  window.gallery = function () {
    var productGallery = document.getElementById('product-gallery');
    return {
      init() {
        var main = new Splide('#product-gallery', {
          type: 'fade',
          rewind: true,
          pagination: false,
          arrows: false,
          drag: true,
        });
        var thumbnails = new Splide('#product-thumb-nav', {
          fixedWidth: 90,
          fixedHeight: 90,
          gap: 10,
          rewind: true,
          pagination: false,
          isNavigation: true,
          breakpoints: {
            900: {
              fixedWidth: 55,
              fixedHeight: 55,
            },
          },
        });
        main.on('click', function () {
          main.go('>');
        });
        main.sync(thumbnails);
        main.mount();
        thumbnails.mount();
      },
    };
  };

  // src/js/forms.js
  window.forms = function () {
    return {
      submitForm(e) {
        e.preventDefault();
        let formTarget = this.$el.getAttribute('data-form');
        const form = document.getElementById(formTarget);
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.classList.remove('shake');
        const requiredFields = form.querySelectorAll('.required');
        let isValid = true;
        requiredFields.forEach((field) => {
          if (!field.value.trim()) {
            isValid = false;
            field.classList.add('border-tint3');
          } else {
            field.classList.remove('border-tint3');
          }
        });
        const allFieldsFilled = Array.from(requiredFields).every((field) =>
          field.value.trim(),
        );
        const emailField = form.querySelector('input[type="email"]');
        const isEmailValid = this.validateEmail(emailField.value.trim());
        if (allFieldsFilled && isEmailValid) {
          form.submit();
        } else {
          void submitBtn.offsetWidth;
          submitBtn.classList.add('shake');
          if (!isEmailValid) {
            emailField.classList.add('border-tint3');
          }
        }
      },
      validateTxt() {
        if (this.$el.value.trim()) {
          this.$el.classList.remove('border-tint3');
          return true;
        } else {
          this.$el.classList.add('border-tint3');
          return false;
        }
      },
      validateEmail(email) {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,20}$/;
        return regex.test(email);
      },
    };
  };

  // node_modules/instafeed.js/dist/instafeed.es.js
  function assert2(val, msg) {
    if (!val) {
      throw new Error(msg);
    }
  }
  function Instafeed(options) {
    assert2(
      !options || typeof options === 'object',
      'options must be an object, got ' + options + ' (' + typeof options + ')',
    );
    var opts = {
      accessToken: null,
      accessTokenTimeout: 1e4,
      after: null,
      apiTimeout: 1e4,
      apiLimit: null,
      before: null,
      debug: false,
      error: null,
      filter: null,
      limit: null,
      mock: false,
      render: null,
      sort: null,
      success: null,
      target: 'instafeed',
      template:
        '<a href="{{link}}"><img title="{{caption}}" src="{{image}}" /></a>',
      templateBoundaries: ['{{', '}}'],
      transform: null,
    };
    var state = {
      running: false,
      node: null,
      token: null,
      paging: null,
      pool: [],
    };
    if (options) {
      for (var optKey in opts) {
        if (typeof options[optKey] !== 'undefined') {
          opts[optKey] = options[optKey];
        }
      }
    }
    assert2(
      typeof opts.target === 'string' || typeof opts.target === 'object',
      'target must be a string or DOM node, got ' +
        opts.target +
        ' (' +
        typeof opts.target +
        ')',
    );
    assert2(
      typeof opts.accessToken === 'string' ||
        typeof opts.accessToken === 'function',
      'accessToken must be a string or function, got ' +
        opts.accessToken +
        ' (' +
        typeof opts.accessToken +
        ')',
    );
    assert2(
      typeof opts.accessTokenTimeout === 'number',
      'accessTokenTimeout must be a number, got ' +
        opts.accessTokenTimeout +
        ' (' +
        typeof opts.accessTokenTimeout +
        ')',
    );
    assert2(
      typeof opts.apiTimeout === 'number',
      'apiTimeout must be a number, got ' +
        opts.apiTimeout +
        ' (' +
        typeof opts.apiTimeout +
        ')',
    );
    assert2(
      typeof opts.debug === 'boolean',
      'debug must be true or false, got ' +
        opts.debug +
        ' (' +
        typeof opts.debug +
        ')',
    );
    assert2(
      typeof opts.mock === 'boolean',
      'mock must be true or false, got ' +
        opts.mock +
        ' (' +
        typeof opts.mock +
        ')',
    );
    assert2(
      typeof opts.templateBoundaries === 'object' &&
        opts.templateBoundaries.length === 2 &&
        typeof opts.templateBoundaries[0] === 'string' &&
        typeof opts.templateBoundaries[1] === 'string',
      'templateBoundaries must be an array of 2 strings, got ' +
        opts.templateBoundaries +
        ' (' +
        typeof opts.templateBoundaries +
        ')',
    );
    assert2(
      !opts.template || typeof opts.template === 'string',
      'template must null or string, got ' +
        opts.template +
        ' (' +
        typeof opts.template +
        ')',
    );
    assert2(
      !opts.error || typeof opts.error === 'function',
      'error must be null or function, got ' +
        opts.error +
        ' (' +
        typeof opts.error +
        ')',
    );
    assert2(
      !opts.before || typeof opts.before === 'function',
      'before must be null or function, got ' +
        opts.before +
        ' (' +
        typeof opts.before +
        ')',
    );
    assert2(
      !opts.after || typeof opts.after === 'function',
      'after must be null or function, got ' +
        opts.after +
        ' (' +
        typeof opts.after +
        ')',
    );
    assert2(
      !opts.success || typeof opts.success === 'function',
      'success must be null or function, got ' +
        opts.success +
        ' (' +
        typeof opts.success +
        ')',
    );
    assert2(
      !opts.filter || typeof opts.filter === 'function',
      'filter must be null or function, got ' +
        opts.filter +
        ' (' +
        typeof opts.filter +
        ')',
    );
    assert2(
      !opts.transform || typeof opts.transform === 'function',
      'transform must be null or function, got ' +
        opts.transform +
        ' (' +
        typeof opts.transform +
        ')',
    );
    assert2(
      !opts.sort || typeof opts.sort === 'function',
      'sort must be null or function, got ' +
        opts.sort +
        ' (' +
        typeof opts.sort +
        ')',
    );
    assert2(
      !opts.render || typeof opts.render === 'function',
      'render must be null or function, got ' +
        opts.render +
        ' (' +
        typeof opts.render +
        ')',
    );
    assert2(
      !opts.limit || typeof opts.limit === 'number',
      'limit must be null or number, got ' +
        opts.limit +
        ' (' +
        typeof opts.limit +
        ')',
    );
    assert2(
      !opts.apiLimit || typeof opts.apiLimit === 'number',
      'apiLimit must null or number, got ' +
        opts.apiLimit +
        ' (' +
        typeof opts.apiLimit +
        ')',
    );
    this._state = state;
    this._options = opts;
  }
  Instafeed.prototype.run = function run() {
    var scope2 = this;
    this._debug('run', 'options', this._options);
    this._debug('run', 'state', this._state);
    if (this._state.running) {
      this._debug('run', 'already running, skipping');
      return false;
    }
    this._start();
    this._debug('run', 'getting dom node');
    if (typeof this._options.target === 'string') {
      this._state.node = document.getElementById(this._options.target);
    } else {
      this._state.node = this._options.target;
    }
    if (!this._state.node) {
      this._fail(new Error('no element found with ID ' + this._options.target));
      return false;
    }
    this._debug('run', 'got dom node', this._state.node);
    this._debug('run', 'getting access token');
    this._getAccessToken(function onTokenReceived(err, token) {
      if (err) {
        scope2._debug('onTokenReceived', 'error', err);
        scope2._fail(new Error('error getting access token: ' + err.message));
        return;
      }
      scope2._debug('onTokenReceived', 'got token', token);
      scope2._state.token = token;
      scope2._showNext(function onNextShown(err2) {
        if (err2) {
          scope2._debug('onNextShown', 'error', err2);
          scope2._fail(err2);
          return;
        }
        scope2._finish();
      });
    });
    return true;
  };
  Instafeed.prototype.hasNext = function hasNext() {
    var paging = this._state.paging;
    var pool = this._state.pool;
    this._debug('hasNext', 'paging', paging);
    this._debug('hasNext', 'pool', pool.length, pool);
    return pool.length > 0 || (paging && typeof paging.next === 'string');
  };
  Instafeed.prototype.next = function next() {
    var scope2 = this;
    if (!scope2.hasNext()) {
      scope2._debug('next', 'hasNext is false, skipping');
      return false;
    }
    if (scope2._state.running) {
      scope2._debug('next', 'already running, skipping');
      return false;
    }
    scope2._start();
    scope2._showNext(function onNextShown(err) {
      if (err) {
        scope2._debug('onNextShown', 'error', err);
        scope2._fail(err);
        return;
      }
      scope2._finish();
    });
  };
  Instafeed.prototype._showNext = function showNext(callback) {
    var scope2 = this;
    var url = null;
    var poolItems = null;
    var hasLimit = typeof this._options.limit === 'number';
    scope2._debug(
      'showNext',
      'pool',
      scope2._state.pool.length,
      scope2._state.pool,
    );
    if (scope2._state.pool.length > 0) {
      if (hasLimit) {
        poolItems = scope2._state.pool.splice(0, scope2._options.limit);
      } else {
        poolItems = scope2._state.pool.splice(0);
      }
      scope2._debug('showNext', 'items from pool', poolItems.length, poolItems);
      scope2._debug(
        'showNext',
        'updated pool',
        scope2._state.pool.length,
        scope2._state.pool,
      );
      if (scope2._options.mock) {
        scope2._debug('showNext', 'mock enabled, skipping render');
      } else {
        try {
          scope2._renderData(poolItems);
        } catch (renderErr) {
          callback(renderErr);
          return;
        }
      }
      callback(null);
    } else {
      if (
        scope2._state.paging &&
        typeof scope2._state.paging.next === 'string'
      ) {
        url = scope2._state.paging.next;
      } else {
        url =
          'https://graph.instagram.com/me/media?fields=caption,id,media_type,media_url,permalink,thumbnail_url,timestamp,username&access_token=' +
          scope2._state.token;
        if (
          !scope2._options.apiLimit &&
          typeof scope2._options.limit === 'number'
        ) {
          scope2._debug(
            'showNext',
            'no apiLimit set, falling back to limit',
            scope2._options.apiLimit,
            scope2._options.limit,
          );
          url = url + '&limit=' + scope2._options.limit;
        } else if (typeof scope2._options.apiLimit === 'number') {
          scope2._debug(
            'showNext',
            'apiLimit set, overriding limit',
            scope2._options.apiLimit,
            scope2._options.limit,
          );
          url = url + '&limit=' + scope2._options.apiLimit;
        }
      }
      scope2._debug('showNext', 'making request', url);
      scope2._makeApiRequest(url, function onResponseReceived(err, data2) {
        var processed = null;
        if (err) {
          scope2._debug('onResponseReceived', 'error', err);
          callback(new Error('api request error: ' + err.message));
          return;
        }
        scope2._debug('onResponseReceived', 'data', data2);
        scope2._success(data2);
        scope2._debug('onResponseReceived', 'setting paging', data2.paging);
        scope2._state.paging = data2.paging;
        try {
          processed = scope2._processData(data2);
          scope2._debug('onResponseReceived', 'processed data', processed);
          if (processed.unused && processed.unused.length > 0) {
            scope2._debug(
              'onResponseReceived',
              'saving unused to pool',
              processed.unused.length,
              processed.unused,
            );
            for (var i = 0; i < processed.unused.length; i++) {
              scope2._state.pool.push(processed.unused[i]);
            }
          }
        } catch (processErr) {
          callback(processErr);
          return;
        }
        if (scope2._options.mock) {
          scope2._debug('onResponseReceived', 'mock enabled, skipping append');
        } else {
          try {
            scope2._renderData(processed.items);
          } catch (renderErr) {
            callback(renderErr);
            return;
          }
        }
        callback(null);
      });
    }
  };
  Instafeed.prototype._processData = function processData(data2) {
    var hasTransform = typeof this._options.transform === 'function';
    var hasFilter = typeof this._options.filter === 'function';
    var hasSort = typeof this._options.sort === 'function';
    var hasLimit = typeof this._options.limit === 'number';
    var transformedFiltered = [];
    var limitDelta = null;
    var dataItem = null;
    var transformedItem = null;
    var filterResult = null;
    var unusedItems = null;
    this._debug(
      'processData',
      'hasFilter',
      hasFilter,
      'hasTransform',
      hasTransform,
      'hasSort',
      hasSort,
      'hasLimit',
      hasLimit,
    );
    if (
      typeof data2 !== 'object' ||
      typeof data2.data !== 'object' ||
      data2.data.length <= 0
    ) {
      return null;
    }
    for (var i = 0; i < data2.data.length; i++) {
      dataItem = this._getItemData(data2.data[i]);
      if (hasTransform) {
        try {
          transformedItem = this._options.transform(dataItem);
          this._debug(
            'processData',
            'transformed item',
            dataItem,
            transformedItem,
          );
        } catch (err) {
          this._debug('processData', 'error calling transform', err);
          throw new Error('error in transform: ' + err.message);
        }
      } else {
        transformedItem = dataItem;
      }
      if (hasFilter) {
        try {
          filterResult = this._options.filter(transformedItem);
          this._debug(
            'processData',
            'filter item result',
            transformedItem,
            filterResult,
          );
        } catch (err) {
          this._debug('processData', 'error calling filter', err);
          throw new Error('error in filter: ' + err.message);
        }
        if (filterResult) {
          transformedFiltered.push(transformedItem);
        }
      } else {
        transformedFiltered.push(transformedItem);
      }
    }
    if (hasSort) {
      try {
        transformedFiltered.sort(this._options.sort);
      } catch (err) {
        this._debug('processData', 'error calling sort', err);
        throw new Error('error in sort: ' + err.message);
      }
    }
    if (hasLimit) {
      limitDelta = transformedFiltered.length - this._options.limit;
      this._debug(
        'processData',
        'checking limit',
        transformedFiltered.length,
        this._options.limit,
        limitDelta,
      );
      if (limitDelta > 0) {
        unusedItems = transformedFiltered.slice(
          transformedFiltered.length - limitDelta,
        );
        this._debug(
          'processData',
          'unusedItems',
          unusedItems.length,
          unusedItems,
        );
        transformedFiltered.splice(
          transformedFiltered.length - limitDelta,
          limitDelta,
        );
      }
    }
    return {
      items: transformedFiltered,
      unused: unusedItems,
    };
  };
  Instafeed.prototype._extractTags = function extractTags(str) {
    var exp = /#([^\s]+)/gi;
    var badChars = /[~`!@#$%^&*\(\)\-\+={}\[\]:;"'<>\?,\./|\\\s]+/i;
    var tags = [];
    var match = null;
    if (typeof str === 'string') {
      while ((match = exp.exec(str)) !== null) {
        if (badChars.test(match[1]) === false) {
          tags.push(match[1]);
        }
      }
    }
    return tags;
  };
  Instafeed.prototype._getItemData = function getItemData(data2) {
    var type = null;
    var image = null;
    switch (data2.media_type) {
      case 'IMAGE':
        type = 'image';
        image = data2.media_url;
        break;
      case 'VIDEO':
        type = 'video';
        image = data2.thumbnail_url;
        break;
      case 'CAROUSEL_ALBUM':
        type = 'album';
        image = data2.media_url;
        break;
    }
    return {
      caption: data2.caption,
      tags: this._extractTags(data2.caption),
      id: data2.id,
      image,
      link: data2.permalink,
      model: data2,
      timestamp: data2.timestamp,
      type,
      username: data2.username,
    };
  };
  Instafeed.prototype._renderData = function renderData(items) {
    var hasTemplate = typeof this._options.template === 'string';
    var hasRender = typeof this._options.render === 'function';
    var item = null;
    var itemHtml = null;
    var container = null;
    var html = '';
    this._debug(
      'renderData',
      'hasTemplate',
      hasTemplate,
      'hasRender',
      hasRender,
    );
    if (typeof items !== 'object' || items.length <= 0) {
      return;
    }
    for (var i = 0; i < items.length; i++) {
      item = items[i];
      if (hasRender) {
        try {
          itemHtml = this._options.render(item, this._options);
          this._debug('renderData', 'custom render result', item, itemHtml);
        } catch (err) {
          this._debug('renderData', 'error calling render', err);
          throw new Error('error in render: ' + err.message);
        }
      } else if (hasTemplate) {
        itemHtml = this._basicRender(item);
      }
      if (itemHtml) {
        html = html + itemHtml;
      } else {
        this._debug(
          'renderData',
          'render item did not return any content',
          item,
        );
      }
    }
    this._debug('renderData', 'html content', html);
    container = document.createElement('div');
    container.innerHTML = html;
    this._debug(
      'renderData',
      'container',
      container,
      container.childNodes.length,
      container.childNodes,
    );
    while (container.childNodes.length > 0) {
      this._debug('renderData', 'appending child', container.childNodes[0]);
      this._state.node.appendChild(container.childNodes[0]);
    }
  };
  Instafeed.prototype._basicRender = function basicRender(data2) {
    var exp = new RegExp(
      this._options.templateBoundaries[0] +
        '([\\s\\w.]+)' +
        this._options.templateBoundaries[1],
      'gm',
    );
    var template = this._options.template;
    var match = null;
    var output = '';
    var substr = null;
    var lastIndex = 0;
    var keyPath = null;
    var keyPathValue = null;
    while ((match = exp.exec(template)) !== null) {
      keyPath = match[1];
      substr = template.slice(lastIndex, match.index);
      output = output + substr;
      keyPathValue = this._valueForKeyPath(keyPath, data2);
      if (keyPathValue) {
        output = output + keyPathValue.toString();
      }
      lastIndex = exp.lastIndex;
    }
    if (lastIndex < template.length) {
      substr = template.slice(lastIndex, template.length);
      output = output + substr;
    }
    return output;
  };
  Instafeed.prototype._valueForKeyPath = function valueForKeyPath(
    keyPath,
    data2,
  ) {
    var exp = /([\w]+)/gm;
    var match = null;
    var key = null;
    var lastValue = data2;
    while ((match = exp.exec(keyPath)) !== null) {
      if (typeof lastValue !== 'object') {
        return null;
      }
      key = match[1];
      lastValue = lastValue[key];
    }
    return lastValue;
  };
  Instafeed.prototype._fail = function fail(err) {
    var didHook = this._runHook('error', err);
    if (!didHook && console && typeof console.error === 'function') {
      console.error(err);
    }
    this._state.running = false;
  };
  Instafeed.prototype._start = function start2() {
    this._state.running = true;
    this._runHook('before');
  };
  Instafeed.prototype._finish = function finish() {
    this._runHook('after');
    this._state.running = false;
  };
  Instafeed.prototype._success = function success(data2) {
    this._runHook('success', data2);
    this._state.running = false;
  };
  Instafeed.prototype._makeApiRequest = function makeApiRequest(url, callback) {
    var called = false;
    var scope2 = this;
    var apiRequest = null;
    var callbackOnce = function callbackOnce2(err, value) {
      if (!called) {
        called = true;
        callback(err, value);
      }
    };
    apiRequest = new XMLHttpRequest();
    apiRequest.ontimeout = function apiRequestTimedOut() {
      callbackOnce(new Error('api request timed out'));
    };
    apiRequest.onerror = function apiRequestOnError() {
      callbackOnce(new Error('api connection error'));
    };
    apiRequest.onload = function apiRequestOnLoad(event) {
      var contentType = apiRequest.getResponseHeader('Content-Type');
      var responseJson = null;
      scope2._debug('apiRequestOnLoad', 'loaded', event);
      scope2._debug('apiRequestOnLoad', 'response status', apiRequest.status);
      scope2._debug('apiRequestOnLoad', 'response content type', contentType);
      if (contentType.indexOf('application/json') >= 0) {
        try {
          responseJson = JSON.parse(apiRequest.responseText);
        } catch (err) {
          scope2._debug(
            'apiRequestOnLoad',
            'json parsing error',
            err,
            apiRequest.responseText,
          );
          callbackOnce(new Error('error parsing response json'));
          return;
        }
      }
      if (apiRequest.status !== 200) {
        if (responseJson && responseJson.error) {
          callbackOnce(
            new Error(
              responseJson.error.code + ' ' + responseJson.error.message,
            ),
          );
        } else {
          callbackOnce(new Error('status code ' + apiRequest.status));
        }
        return;
      }
      callbackOnce(null, responseJson);
    };
    apiRequest.open('GET', url, true);
    apiRequest.timeout = this._options.apiTimeout;
    apiRequest.send();
  };
  Instafeed.prototype._getAccessToken = function getAccessToken(callback) {
    var called = false;
    var scope2 = this;
    var timeoutCheck = null;
    var callbackOnce = function callbackOnce2(err, value) {
      if (!called) {
        called = true;
        clearTimeout(timeoutCheck);
        callback(err, value);
      }
    };
    if (typeof this._options.accessToken === 'function') {
      this._debug('getAccessToken', 'calling accessToken as function');
      timeoutCheck = setTimeout(function accessTokenTimeoutCheck() {
        scope2._debug('getAccessToken', 'timeout check', called);
        callbackOnce(new Error('accessToken timed out'), null);
      }, this._options.accessTokenTimeout);
      try {
        this._options.accessToken(function accessTokenReceiver(err, value) {
          scope2._debug(
            'getAccessToken',
            'received accessToken callback',
            called,
            err,
            value,
          );
          callbackOnce(err, value);
        });
      } catch (err) {
        this._debug(
          'getAccessToken',
          'error invoking the accessToken as function',
          err,
        );
        callbackOnce(err, null);
      }
    } else {
      this._debug(
        'getAccessToken',
        'treating accessToken as static',
        typeof this._options.accessToken,
      );
      callbackOnce(null, this._options.accessToken);
    }
  };
  Instafeed.prototype._debug = function debug() {
    var args = null;
    if (this._options.debug && console && typeof console.log === 'function') {
      args = [].slice.call(arguments);
      args[0] = '[Instafeed] [' + args[0] + ']';
      console.log.apply(null, args);
    }
  };
  Instafeed.prototype._runHook = function runHook(hookName, data2) {
    var success2 = false;
    if (typeof this._options[hookName] === 'function') {
      try {
        this._options[hookName](data2);
        success2 = true;
      } catch (err) {
        this._debug('runHook', 'error calling hook', hookName, err);
      }
    }
    return success2;
  };
  var instafeed_es_default = Instafeed;

  // src/js/insta.js
  window.insta = function () {
    return {
      init() {
        var feed = new instafeed_es_default({
          accessToken:
            'IGQWROWFhaMFExUUZA4VXYtbkt1SnFVR2gyVENySWxzQk8tSEtOYnFrNXdSS0JDRlVSbk9hRlRCYkVLOHFtLXY2Uno0aTA1NENaa0JCWmR1U2toZAm1hSmt4eEhwcFNVRms1S2VpTEhrbW4wTk1fUGVxX3lHUHJVcG8ZD',
          limit: 4,
          template:
            '<a aria-label="instagram post" class="block w-full" href="{{link}}"><img class="w-full" title="{{caption}}" src="{{image}}" alt="{{caption}}" loading="lazy" /></a>',
        });
        feed.run();
      },
    };
  };

  // src/js/testimonials.js
  window.testimonials = function () {
    return {
      init() {
        var tests = new Splide(this.$el, {
          type: 'loop',
          rewind: false,
          pagination: false,
          arrows: true,
          drag: true,
        });
        tests.mount();
      },
    };
  };

  // src/js/sauces.js
  window.sauces = function () {
    return {
      init() {
        var sauceGallery = new Splide(this.$el, {
          type: 'loop',
          rewind: false,
          pagination: false,
          arrows: true,
          drag: true,
        });
        sauceGallery.mount();
      },
    };
  };

  // node_modules/gsap/utils/matrix.js
  var _doc3;
  var _win3;
  var _docElement2;
  var _body;
  var _divContainer;
  var _svgContainer;
  var _identityMatrix;
  var _transformProp2 = 'transform';
  var _transformOriginProp2 = _transformProp2 + 'Origin';
  var _hasOffsetBug;
  var _setDoc = function _setDoc2(element) {
    var doc = element.ownerDocument || element;
    if (!(_transformProp2 in element.style) && 'msTransform' in element.style) {
      _transformProp2 = 'msTransform';
      _transformOriginProp2 = _transformProp2 + 'Origin';
    }
    while (doc.parentNode && (doc = doc.parentNode)) {}
    _win3 = window;
    _identityMatrix = new Matrix2D();
    if (doc) {
      _doc3 = doc;
      _docElement2 = doc.documentElement;
      _body = doc.body;
      var d1 = doc.createElement('div'),
        d2 = doc.createElement('div');
      _body.appendChild(d1);
      d1.appendChild(d2);
      d1.style.position = 'static';
      d1.style[_transformProp2] = 'translate3d(0,0,1px)';
      _hasOffsetBug = d2.offsetParent !== d1;
      _body.removeChild(d1);
    }
    return doc;
  };
  var _forceNonZeroScale = function _forceNonZeroScale2(e) {
    var a, cache;
    while (e && e !== _body) {
      cache = e._gsap;
      cache && cache.uncache && cache.get(e, 'x');
      if (cache && !cache.scaleX && !cache.scaleY && cache.renderTransform) {
        cache.scaleX = cache.scaleY = 1e-4;
        cache.renderTransform(1, cache);
        a ? a.push(cache) : (a = [cache]);
      }
      e = e.parentNode;
    }
    return a;
  };
  var _svgTemps = [];
  var _divTemps = [];
  var _getDocScrollTop = function _getDocScrollTop2() {
    return (
      _win3.pageYOffset ||
      _doc3.scrollTop ||
      _docElement2.scrollTop ||
      _body.scrollTop ||
      0
    );
  };
  var _getDocScrollLeft = function _getDocScrollLeft2() {
    return (
      _win3.pageXOffset ||
      _doc3.scrollLeft ||
      _docElement2.scrollLeft ||
      _body.scrollLeft ||
      0
    );
  };
  var _svgOwner = function _svgOwner2(element) {
    return (
      element.ownerSVGElement ||
      ((element.tagName + '').toLowerCase() === 'svg' ? element : null)
    );
  };
  var _isFixed = function _isFixed2(element) {
    if (_win3.getComputedStyle(element).position === 'fixed') {
      return true;
    }
    element = element.parentNode;
    if (element && element.nodeType === 1) {
      return _isFixed2(element);
    }
  };
  var _createSibling = function _createSibling2(element, i) {
    if (element.parentNode && (_doc3 || _setDoc(element))) {
      var svg = _svgOwner(element),
        ns = svg
          ? svg.getAttribute('xmlns') || 'http://www.w3.org/2000/svg'
          : 'http://www.w3.org/1999/xhtml',
        type = svg ? (i ? 'rect' : 'g') : 'div',
        x = i !== 2 ? 0 : 100,
        y = i === 3 ? 100 : 0,
        css =
          'position:absolute;display:block;pointer-events:none;margin:0;padding:0;',
        e = _doc3.createElementNS
          ? _doc3.createElementNS(ns.replace(/^https/, 'http'), type)
          : _doc3.createElement(type);
      if (i) {
        if (!svg) {
          if (!_divContainer) {
            _divContainer = _createSibling2(element);
            _divContainer.style.cssText = css;
          }
          e.style.cssText =
            css + 'width:0.1px;height:0.1px;top:' + y + 'px;left:' + x + 'px';
          _divContainer.appendChild(e);
        } else {
          _svgContainer || (_svgContainer = _createSibling2(element));
          e.setAttribute('width', 0.01);
          e.setAttribute('height', 0.01);
          e.setAttribute('transform', 'translate(' + x + ',' + y + ')');
          _svgContainer.appendChild(e);
        }
      }
      return e;
    }
    throw 'Need document and parent.';
  };
  var _consolidate = function _consolidate2(m) {
    var c = new Matrix2D(),
      i = 0;
    for (; i < m.numberOfItems; i++) {
      c.multiply(m.getItem(i).matrix);
    }
    return c;
  };
  var _placeSiblings = function _placeSiblings2(element, adjustGOffset) {
    var svg = _svgOwner(element),
      isRootSVG = element === svg,
      siblings = svg ? _svgTemps : _divTemps,
      parent = element.parentNode,
      container,
      m,
      b,
      x,
      y,
      cs;
    if (element === _win3) {
      return element;
    }
    siblings.length ||
      siblings.push(
        _createSibling(element, 1),
        _createSibling(element, 2),
        _createSibling(element, 3),
      );
    container = svg ? _svgContainer : _divContainer;
    if (svg) {
      b = isRootSVG
        ? {
            x: 0,
            y: 0,
          }
        : element.getBBox();
      m = element.transform ? element.transform.baseVal : {};
      if (m.numberOfItems) {
        m = m.numberOfItems > 1 ? _consolidate(m) : m.getItem(0).matrix;
        x = m.a * b.x + m.c * b.y;
        y = m.b * b.x + m.d * b.y;
      } else {
        m = _identityMatrix;
        x = b.x;
        y = b.y;
      }
      if (adjustGOffset && element.tagName.toLowerCase() === 'g') {
        x = y = 0;
      }
      (isRootSVG ? svg : parent).appendChild(container);
      container.setAttribute(
        'transform',
        'matrix(' +
          m.a +
          ',' +
          m.b +
          ',' +
          m.c +
          ',' +
          m.d +
          ',' +
          (m.e + x) +
          ',' +
          (m.f + y) +
          ')',
      );
    } else {
      x = y = 0;
      if (_hasOffsetBug) {
        m = element.offsetParent;
        b = element;
        while (b && (b = b.parentNode) && b !== m && b.parentNode) {
          if ((_win3.getComputedStyle(b)[_transformProp2] + '').length > 4) {
            x = b.offsetLeft;
            y = b.offsetTop;
            b = 0;
          }
        }
      }
      cs = _win3.getComputedStyle(element);
      if (cs.position !== 'absolute') {
        m = element.offsetParent;
        while (parent && parent !== m) {
          x += parent.scrollLeft || 0;
          y += parent.scrollTop || 0;
          parent = parent.parentNode;
        }
      }
      b = container.style;
      b.top = element.offsetTop - y + 'px';
      b.left = element.offsetLeft - x + 'px';
      b[_transformProp2] = cs[_transformProp2];
      b[_transformOriginProp2] = cs[_transformOriginProp2];
      b.position = cs.position === 'fixed' ? 'fixed' : 'absolute';
      element.parentNode.appendChild(container);
    }
    return container;
  };
  var _setMatrix = function _setMatrix2(m, a, b, c, d, e, f) {
    m.a = a;
    m.b = b;
    m.c = c;
    m.d = d;
    m.e = e;
    m.f = f;
    return m;
  };
  var Matrix2D = /* @__PURE__ */ (function () {
    function Matrix2D2(a, b, c, d, e, f) {
      if (a === void 0) {
        a = 1;
      }
      if (b === void 0) {
        b = 0;
      }
      if (c === void 0) {
        c = 0;
      }
      if (d === void 0) {
        d = 1;
      }
      if (e === void 0) {
        e = 0;
      }
      if (f === void 0) {
        f = 0;
      }
      _setMatrix(this, a, b, c, d, e, f);
    }
    var _proto = Matrix2D2.prototype;
    _proto.inverse = function inverse() {
      var a = this.a,
        b = this.b,
        c = this.c,
        d = this.d,
        e = this.e,
        f = this.f,
        determinant = a * d - b * c || 1e-10;
      return _setMatrix(
        this,
        d / determinant,
        -b / determinant,
        -c / determinant,
        a / determinant,
        (c * f - d * e) / determinant,
        -(a * f - b * e) / determinant,
      );
    };
    _proto.multiply = function multiply(matrix) {
      var a = this.a,
        b = this.b,
        c = this.c,
        d = this.d,
        e = this.e,
        f = this.f,
        a2 = matrix.a,
        b2 = matrix.c,
        c2 = matrix.b,
        d2 = matrix.d,
        e2 = matrix.e,
        f2 = matrix.f;
      return _setMatrix(
        this,
        a2 * a + c2 * c,
        a2 * b + c2 * d,
        b2 * a + d2 * c,
        b2 * b + d2 * d,
        e + e2 * a + f2 * c,
        f + e2 * b + f2 * d,
      );
    };
    _proto.clone = function clone2() {
      return new Matrix2D2(this.a, this.b, this.c, this.d, this.e, this.f);
    };
    _proto.equals = function equals(matrix) {
      var a = this.a,
        b = this.b,
        c = this.c,
        d = this.d,
        e = this.e,
        f = this.f;
      return (
        a === matrix.a &&
        b === matrix.b &&
        c === matrix.c &&
        d === matrix.d &&
        e === matrix.e &&
        f === matrix.f
      );
    };
    _proto.apply = function apply2(point, decoratee) {
      if (decoratee === void 0) {
        decoratee = {};
      }
      var x = point.x,
        y = point.y,
        a = this.a,
        b = this.b,
        c = this.c,
        d = this.d,
        e = this.e,
        f = this.f;
      decoratee.x = x * a + y * c + e || 0;
      decoratee.y = x * b + y * d + f || 0;
      return decoratee;
    };
    return Matrix2D2;
  })();
  function getGlobalMatrix(
    element,
    inverse,
    adjustGOffset,
    includeScrollInFixed,
  ) {
    if (
      !element ||
      !element.parentNode ||
      (_doc3 || _setDoc(element)).documentElement === element
    ) {
      return new Matrix2D();
    }
    var zeroScales = _forceNonZeroScale(element),
      svg = _svgOwner(element),
      temps = svg ? _svgTemps : _divTemps,
      container = _placeSiblings(element, adjustGOffset),
      b1 = temps[0].getBoundingClientRect(),
      b2 = temps[1].getBoundingClientRect(),
      b3 = temps[2].getBoundingClientRect(),
      parent = container.parentNode,
      isFixed = !includeScrollInFixed && _isFixed(element),
      m = new Matrix2D(
        (b2.left - b1.left) / 100,
        (b2.top - b1.top) / 100,
        (b3.left - b1.left) / 100,
        (b3.top - b1.top) / 100,
        b1.left + (isFixed ? 0 : _getDocScrollLeft()),
        b1.top + (isFixed ? 0 : _getDocScrollTop()),
      );
    parent.removeChild(container);
    if (zeroScales) {
      b1 = zeroScales.length;
      while (b1--) {
        b2 = zeroScales[b1];
        b2.scaleX = b2.scaleY = 0;
        b2.renderTransform(1, b2);
      }
    }
    return inverse ? m.inverse() : m;
  }

  // node_modules/gsap/Draggable.js
  function _assertThisInitialized2(self) {
    if (self === void 0) {
      throw new ReferenceError(
        "this hasn't been initialised - super() hasn't been called",
      );
    }
    return self;
  }
  function _inheritsLoose2(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }
  var gsap2;
  var _win4;
  var _doc4;
  var _docElement3;
  var _body2;
  var _tempDiv2;
  var _placeholderDiv;
  var _coreInitted2;
  var _checkPrefix;
  var _toArray;
  var _supportsPassive;
  var _isTouchDevice;
  var _touchEventLookup;
  var _dragCount;
  var _isMultiTouching;
  var _isAndroid;
  var InertiaPlugin;
  var _defaultCursor;
  var _supportsPointer;
  var _windowExists5 = function _windowExists6() {
    return typeof window !== 'undefined';
  };
  var _getGSAP = function _getGSAP2() {
    return (
      gsap2 ||
      (_windowExists5() &&
        (gsap2 = window.gsap) &&
        gsap2.registerPlugin &&
        gsap2)
    );
  };
  var _isFunction3 = function _isFunction4(value) {
    return typeof value === 'function';
  };
  var _isObject3 = function _isObject4(value) {
    return typeof value === 'object';
  };
  var _isUndefined3 = function _isUndefined4(value) {
    return typeof value === 'undefined';
  };
  var _emptyFunc3 = function _emptyFunc4() {
    return false;
  };
  var _transformProp3 = 'transform';
  var _transformOriginProp3 = 'transformOrigin';
  var _round3 = function _round4(value) {
    return Math.round(value * 1e4) / 1e4;
  };
  var _isArray2 = Array.isArray;
  var _createElement3 = function _createElement4(type, ns) {
    var e = _doc4.createElementNS
      ? _doc4.createElementNS(
          (ns || 'http://www.w3.org/1999/xhtml').replace(/^https/, 'http'),
          type,
        )
      : _doc4.createElement(type);
    return e.style ? e : _doc4.createElement(type);
  };
  var _RAD2DEG2 = 180 / Math.PI;
  var _bigNum3 = 1e20;
  var _identityMatrix2 = new Matrix2D();
  var _getTime =
    Date.now ||
    function () {
      return new Date().getTime();
    };
  var _renderQueue = [];
  var _lookup = {};
  var _lookupCount = 0;
  var _clickableTagExp = /^(?:a|input|textarea|button|select)$/i;
  var _lastDragTime = 0;
  var _temp1 = {};
  var _windowProxy = {};
  var _copy = function _copy2(obj, factor) {
    var copy = {},
      p;
    for (p in obj) {
      copy[p] = factor ? obj[p] * factor : obj[p];
    }
    return copy;
  };
  var _extend = function _extend2(obj, defaults2) {
    for (var p in defaults2) {
      if (!(p in obj)) {
        obj[p] = defaults2[p];
      }
    }
    return obj;
  };
  var _setTouchActionForAllDescendants =
    function _setTouchActionForAllDescendants2(elements, value) {
      var i = elements.length,
        children2;
      while (i--) {
        value
          ? (elements[i].style.touchAction = value)
          : elements[i].style.removeProperty('touch-action');
        children2 = elements[i].children;
        children2 &&
          children2.length &&
          _setTouchActionForAllDescendants2(children2, value);
      }
    };
  var _renderQueueTick = function _renderQueueTick2() {
    return _renderQueue.forEach(function (func) {
      return func();
    });
  };
  var _addToRenderQueue = function _addToRenderQueue2(func) {
    _renderQueue.push(func);
    if (_renderQueue.length === 1) {
      gsap2.ticker.add(_renderQueueTick);
    }
  };
  var _renderQueueTimeout = function _renderQueueTimeout2() {
    return !_renderQueue.length && gsap2.ticker.remove(_renderQueueTick);
  };
  var _removeFromRenderQueue = function _removeFromRenderQueue2(func) {
    var i = _renderQueue.length;
    while (i--) {
      if (_renderQueue[i] === func) {
        _renderQueue.splice(i, 1);
      }
    }
    gsap2.to(_renderQueueTimeout, {
      overwrite: true,
      delay: 15,
      duration: 0,
      onComplete: _renderQueueTimeout,
      data: '_draggable',
    });
  };
  var _setDefaults3 = function _setDefaults4(obj, defaults2) {
    for (var p in defaults2) {
      if (!(p in obj)) {
        obj[p] = defaults2[p];
      }
    }
    return obj;
  };
  var _addListener = function _addListener2(element, type, func, capture) {
    if (element.addEventListener) {
      var touchType = _touchEventLookup[type];
      capture =
        capture ||
        (_supportsPassive
          ? {
              passive: false,
            }
          : null);
      element.addEventListener(touchType || type, func, capture);
      touchType &&
        type !== touchType &&
        element.addEventListener(type, func, capture);
    }
  };
  var _removeListener = function _removeListener2(element, type, func) {
    if (element.removeEventListener) {
      var touchType = _touchEventLookup[type];
      element.removeEventListener(touchType || type, func);
      touchType &&
        type !== touchType &&
        element.removeEventListener(type, func);
    }
  };
  var _preventDefault = function _preventDefault2(event) {
    event.preventDefault && event.preventDefault();
    event.preventManipulation && event.preventManipulation();
  };
  var _hasTouchID = function _hasTouchID2(list, ID) {
    var i = list.length;
    while (i--) {
      if (list[i].identifier === ID) {
        return true;
      }
    }
  };
  var _onMultiTouchDocumentEnd = function _onMultiTouchDocumentEnd2(event) {
    _isMultiTouching = event.touches && _dragCount < event.touches.length;
    _removeListener(event.target, 'touchend', _onMultiTouchDocumentEnd2);
  };
  var _onMultiTouchDocument = function _onMultiTouchDocument2(event) {
    _isMultiTouching = event.touches && _dragCount < event.touches.length;
    _addListener(event.target, 'touchend', _onMultiTouchDocumentEnd);
  };
  var _getDocScrollTop3 = function _getDocScrollTop4(doc) {
    return (
      _win4.pageYOffset ||
      doc.scrollTop ||
      doc.documentElement.scrollTop ||
      doc.body.scrollTop ||
      0
    );
  };
  var _getDocScrollLeft3 = function _getDocScrollLeft4(doc) {
    return (
      _win4.pageXOffset ||
      doc.scrollLeft ||
      doc.documentElement.scrollLeft ||
      doc.body.scrollLeft ||
      0
    );
  };
  var _addScrollListener = function _addScrollListener2(e, callback) {
    _addListener(e, 'scroll', callback);
    if (!_isRoot(e.parentNode)) {
      _addScrollListener2(e.parentNode, callback);
    }
  };
  var _removeScrollListener = function _removeScrollListener2(e, callback) {
    _removeListener(e, 'scroll', callback);
    if (!_isRoot(e.parentNode)) {
      _removeScrollListener2(e.parentNode, callback);
    }
  };
  var _isRoot = function _isRoot2(e) {
    return !!(
      !e ||
      e === _docElement3 ||
      e.nodeType === 9 ||
      e === _doc4.body ||
      e === _win4 ||
      !e.nodeType ||
      !e.parentNode
    );
  };
  var _getMaxScroll = function _getMaxScroll2(element, axis) {
    var dim = axis === 'x' ? 'Width' : 'Height',
      scroll2 = 'scroll' + dim,
      client = 'client' + dim;
    return Math.max(
      0,
      _isRoot(element)
        ? Math.max(_docElement3[scroll2], _body2[scroll2]) -
            (_win4['inner' + dim] || _docElement3[client] || _body2[client])
        : element[scroll2] - element[client],
    );
  };
  var _recordMaxScrolls = function _recordMaxScrolls2(e, skipCurrent) {
    var x = _getMaxScroll(e, 'x'),
      y = _getMaxScroll(e, 'y');
    if (_isRoot(e)) {
      e = _windowProxy;
    } else {
      _recordMaxScrolls2(e.parentNode, skipCurrent);
    }
    e._gsMaxScrollX = x;
    e._gsMaxScrollY = y;
    if (!skipCurrent) {
      e._gsScrollX = e.scrollLeft || 0;
      e._gsScrollY = e.scrollTop || 0;
    }
  };
  var _setStyle = function _setStyle2(element, property, value) {
    var style2 = element.style;
    if (!style2) {
      return;
    }
    if (_isUndefined3(style2[property])) {
      property = _checkPrefix(property, element) || property;
    }
    if (value == null) {
      style2.removeProperty &&
        style2.removeProperty(
          property.replace(/([A-Z])/g, '-$1').toLowerCase(),
        );
    } else {
      style2[property] = value;
    }
  };
  var _getComputedStyle = function _getComputedStyle2(element) {
    return _win4.getComputedStyle(
      element instanceof Element
        ? element
        : element.host || (element.parentNode || {}).host || element,
    );
  };
  var _tempRect = {};
  var _parseRect = function _parseRect2(e) {
    if (e === _win4) {
      _tempRect.left = _tempRect.top = 0;
      _tempRect.width = _tempRect.right =
        _docElement3.clientWidth || e.innerWidth || _body2.clientWidth || 0;
      _tempRect.height = _tempRect.bottom =
        (e.innerHeight || 0) - 20 < _docElement3.clientHeight
          ? _docElement3.clientHeight
          : e.innerHeight || _body2.clientHeight || 0;
      return _tempRect;
    }
    var doc = e.ownerDocument || _doc4,
      r = !_isUndefined3(e.pageX)
        ? {
            left: e.pageX - _getDocScrollLeft3(doc),
            top: e.pageY - _getDocScrollTop3(doc),
            right: e.pageX - _getDocScrollLeft3(doc) + 1,
            bottom: e.pageY - _getDocScrollTop3(doc) + 1,
          }
        : !e.nodeType && !_isUndefined3(e.left) && !_isUndefined3(e.top)
        ? e
        : _toArray(e)[0].getBoundingClientRect();
    if (_isUndefined3(r.right) && !_isUndefined3(r.width)) {
      r.right = r.left + r.width;
      r.bottom = r.top + r.height;
    } else if (_isUndefined3(r.width)) {
      r = {
        width: r.right - r.left,
        height: r.bottom - r.top,
        right: r.right,
        left: r.left,
        bottom: r.bottom,
        top: r.top,
      };
    }
    return r;
  };
  var _dispatchEvent = function _dispatchEvent2(target, type, callbackName) {
    var vars = target.vars,
      callback = vars[callbackName],
      listeners = target._listeners[type],
      result;
    if (_isFunction3(callback)) {
      result = callback.apply(
        vars.callbackScope || target,
        vars[callbackName + 'Params'] || [target.pointerEvent],
      );
    }
    if (listeners && target.dispatchEvent(type) === false) {
      result = false;
    }
    return result;
  };
  var _getBounds = function _getBounds2(target, context) {
    var e = _toArray(target)[0],
      top,
      left,
      offset;
    if (!e.nodeType && e !== _win4) {
      if (!_isUndefined3(target.left)) {
        offset = {
          x: 0,
          y: 0,
        };
        return {
          left: target.left - offset.x,
          top: target.top - offset.y,
          width: target.width,
          height: target.height,
        };
      }
      left = target.min || target.minX || target.minRotation || 0;
      top = target.min || target.minY || 0;
      return {
        left,
        top,
        width: (target.max || target.maxX || target.maxRotation || 0) - left,
        height: (target.max || target.maxY || 0) - top,
      };
    }
    return _getElementBounds(e, context);
  };
  var _point1 = {};
  var _getElementBounds = function _getElementBounds2(element, context) {
    context = _toArray(context)[0];
    var isSVG = element.getBBox && element.ownerSVGElement,
      doc = element.ownerDocument || _doc4,
      left,
      right,
      top,
      bottom,
      matrix,
      p1,
      p2,
      p3,
      p4,
      bbox,
      width,
      height,
      cs,
      contextParent;
    if (element === _win4) {
      top = _getDocScrollTop3(doc);
      left = _getDocScrollLeft3(doc);
      right =
        left +
        (doc.documentElement.clientWidth ||
          element.innerWidth ||
          doc.body.clientWidth ||
          0);
      bottom =
        top +
        ((element.innerHeight || 0) - 20 < doc.documentElement.clientHeight
          ? doc.documentElement.clientHeight
          : element.innerHeight || doc.body.clientHeight || 0);
    } else if (context === _win4 || _isUndefined3(context)) {
      return element.getBoundingClientRect();
    } else {
      left = top = 0;
      if (isSVG) {
        bbox = element.getBBox();
        width = bbox.width;
        height = bbox.height;
      } else {
        if (element.viewBox && (bbox = element.viewBox.baseVal)) {
          left = bbox.x || 0;
          top = bbox.y || 0;
          width = bbox.width;
          height = bbox.height;
        }
        if (!width) {
          cs = _getComputedStyle(element);
          bbox = cs.boxSizing === 'border-box';
          width =
            (parseFloat(cs.width) || element.clientWidth || 0) +
            (bbox
              ? 0
              : parseFloat(cs.borderLeftWidth) +
                parseFloat(cs.borderRightWidth));
          height =
            (parseFloat(cs.height) || element.clientHeight || 0) +
            (bbox
              ? 0
              : parseFloat(cs.borderTopWidth) +
                parseFloat(cs.borderBottomWidth));
        }
      }
      right = width;
      bottom = height;
    }
    if (element === context) {
      return {
        left,
        top,
        width: right - left,
        height: bottom - top,
      };
    }
    matrix = getGlobalMatrix(context, true).multiply(getGlobalMatrix(element));
    p1 = matrix.apply({
      x: left,
      y: top,
    });
    p2 = matrix.apply({
      x: right,
      y: top,
    });
    p3 = matrix.apply({
      x: right,
      y: bottom,
    });
    p4 = matrix.apply({
      x: left,
      y: bottom,
    });
    left = Math.min(p1.x, p2.x, p3.x, p4.x);
    top = Math.min(p1.y, p2.y, p3.y, p4.y);
    contextParent = context.parentNode || {};
    return {
      left: left + (contextParent.scrollLeft || 0),
      top: top + (contextParent.scrollTop || 0),
      width: Math.max(p1.x, p2.x, p3.x, p4.x) - left,
      height: Math.max(p1.y, p2.y, p3.y, p4.y) - top,
    };
  };
  var _parseInertia = function _parseInertia2(
    draggable,
    snap3,
    max2,
    min2,
    factor,
    forceZeroVelocity,
  ) {
    var vars = {},
      a,
      i,
      l;
    if (snap3) {
      if (factor !== 1 && snap3 instanceof Array) {
        vars.end = a = [];
        l = snap3.length;
        if (_isObject3(snap3[0])) {
          for (i = 0; i < l; i++) {
            a[i] = _copy(snap3[i], factor);
          }
        } else {
          for (i = 0; i < l; i++) {
            a[i] = snap3[i] * factor;
          }
        }
        max2 += 1.1;
        min2 -= 1.1;
      } else if (_isFunction3(snap3)) {
        vars.end = function (value) {
          var result = snap3.call(draggable, value),
            copy,
            p;
          if (factor !== 1) {
            if (_isObject3(result)) {
              copy = {};
              for (p in result) {
                copy[p] = result[p] * factor;
              }
              result = copy;
            } else {
              result *= factor;
            }
          }
          return result;
        };
      } else {
        vars.end = snap3;
      }
    }
    if (max2 || max2 === 0) {
      vars.max = max2;
    }
    if (min2 || min2 === 0) {
      vars.min = min2;
    }
    if (forceZeroVelocity) {
      vars.velocity = 0;
    }
    return vars;
  };
  var _isClickable = function _isClickable2(element) {
    var data2;
    return !element || !element.getAttribute || element === _body2
      ? false
      : (data2 = element.getAttribute('data-clickable')) === 'true' ||
        (data2 !== 'false' &&
          (element.onclick ||
            _clickableTagExp.test(element.nodeName + '') ||
            element.getAttribute('contentEditable') === 'true'))
      ? true
      : _isClickable2(element.parentNode);
  };
  var _setSelectable = function _setSelectable2(elements, selectable) {
    var i = elements.length,
      e;
    while (i--) {
      e = elements[i];
      e.ondragstart = e.onselectstart = selectable ? null : _emptyFunc3;
      gsap2.set(e, {
        lazy: true,
        userSelect: selectable ? 'text' : 'none',
      });
    }
  };
  var _isFixed3 = function _isFixed4(element) {
    if (_getComputedStyle(element).position === 'fixed') {
      return true;
    }
    element = element.parentNode;
    if (element && element.nodeType === 1) {
      return _isFixed4(element);
    }
  };
  var _supports3D2;
  var _addPaddingBR;
  var ScrollProxy = function ScrollProxy2(element, vars) {
    element = gsap2.utils.toArray(element)[0];
    vars = vars || {};
    var content = document.createElement('div'),
      style2 = content.style,
      node = element.firstChild,
      offsetTop = 0,
      offsetLeft = 0,
      prevTop = element.scrollTop,
      prevLeft = element.scrollLeft,
      scrollWidth = element.scrollWidth,
      scrollHeight = element.scrollHeight,
      extraPadRight = 0,
      maxLeft = 0,
      maxTop = 0,
      elementWidth,
      elementHeight,
      contentHeight,
      nextNode,
      transformStart,
      transformEnd;
    if (_supports3D2 && vars.force3D !== false) {
      transformStart = 'translate3d(';
      transformEnd = 'px,0px)';
    } else if (_transformProp3) {
      transformStart = 'translate(';
      transformEnd = 'px)';
    }
    this.scrollTop = function (value, force) {
      if (!arguments.length) {
        return -this.top();
      }
      this.top(-value, force);
    };
    this.scrollLeft = function (value, force) {
      if (!arguments.length) {
        return -this.left();
      }
      this.left(-value, force);
    };
    this.left = function (value, force) {
      if (!arguments.length) {
        return -(element.scrollLeft + offsetLeft);
      }
      var dif = element.scrollLeft - prevLeft,
        oldOffset = offsetLeft;
      if ((dif > 2 || dif < -2) && !force) {
        prevLeft = element.scrollLeft;
        gsap2.killTweensOf(this, {
          left: 1,
          scrollLeft: 1,
        });
        this.left(-prevLeft);
        if (vars.onKill) {
          vars.onKill();
        }
        return;
      }
      value = -value;
      if (value < 0) {
        offsetLeft = (value - 0.5) | 0;
        value = 0;
      } else if (value > maxLeft) {
        offsetLeft = (value - maxLeft) | 0;
        value = maxLeft;
      } else {
        offsetLeft = 0;
      }
      if (offsetLeft || oldOffset) {
        if (!this._skip) {
          style2[_transformProp3] =
            transformStart + -offsetLeft + 'px,' + -offsetTop + transformEnd;
        }
        if (offsetLeft + extraPadRight >= 0) {
          style2.paddingRight = offsetLeft + extraPadRight + 'px';
        }
      }
      element.scrollLeft = value | 0;
      prevLeft = element.scrollLeft;
    };
    this.top = function (value, force) {
      if (!arguments.length) {
        return -(element.scrollTop + offsetTop);
      }
      var dif = element.scrollTop - prevTop,
        oldOffset = offsetTop;
      if ((dif > 2 || dif < -2) && !force) {
        prevTop = element.scrollTop;
        gsap2.killTweensOf(this, {
          top: 1,
          scrollTop: 1,
        });
        this.top(-prevTop);
        if (vars.onKill) {
          vars.onKill();
        }
        return;
      }
      value = -value;
      if (value < 0) {
        offsetTop = (value - 0.5) | 0;
        value = 0;
      } else if (value > maxTop) {
        offsetTop = (value - maxTop) | 0;
        value = maxTop;
      } else {
        offsetTop = 0;
      }
      if (offsetTop || oldOffset) {
        if (!this._skip) {
          style2[_transformProp3] =
            transformStart + -offsetLeft + 'px,' + -offsetTop + transformEnd;
        }
      }
      element.scrollTop = value | 0;
      prevTop = element.scrollTop;
    };
    this.maxScrollTop = function () {
      return maxTop;
    };
    this.maxScrollLeft = function () {
      return maxLeft;
    };
    this.disable = function () {
      node = content.firstChild;
      while (node) {
        nextNode = node.nextSibling;
        element.appendChild(node);
        node = nextNode;
      }
      if (element === content.parentNode) {
        element.removeChild(content);
      }
    };
    this.enable = function () {
      node = element.firstChild;
      if (node === content) {
        return;
      }
      while (node) {
        nextNode = node.nextSibling;
        content.appendChild(node);
        node = nextNode;
      }
      element.appendChild(content);
      this.calibrate();
    };
    this.calibrate = function (force) {
      var widthMatches = element.clientWidth === elementWidth,
        cs,
        x,
        y;
      prevTop = element.scrollTop;
      prevLeft = element.scrollLeft;
      if (
        widthMatches &&
        element.clientHeight === elementHeight &&
        content.offsetHeight === contentHeight &&
        scrollWidth === element.scrollWidth &&
        scrollHeight === element.scrollHeight &&
        !force
      ) {
        return;
      }
      if (offsetTop || offsetLeft) {
        x = this.left();
        y = this.top();
        this.left(-element.scrollLeft);
        this.top(-element.scrollTop);
      }
      cs = _getComputedStyle(element);
      if (!widthMatches || force) {
        style2.display = 'block';
        style2.width = 'auto';
        style2.paddingRight = '0px';
        extraPadRight = Math.max(0, element.scrollWidth - element.clientWidth);
        if (extraPadRight) {
          extraPadRight +=
            parseFloat(cs.paddingLeft) +
            (_addPaddingBR ? parseFloat(cs.paddingRight) : 0);
        }
      }
      style2.display = 'inline-block';
      style2.position = 'relative';
      style2.overflow = 'visible';
      style2.verticalAlign = 'top';
      style2.boxSizing = 'content-box';
      style2.width = '100%';
      style2.paddingRight = extraPadRight + 'px';
      if (_addPaddingBR) {
        style2.paddingBottom = cs.paddingBottom;
      }
      elementWidth = element.clientWidth;
      elementHeight = element.clientHeight;
      scrollWidth = element.scrollWidth;
      scrollHeight = element.scrollHeight;
      maxLeft = element.scrollWidth - elementWidth;
      maxTop = element.scrollHeight - elementHeight;
      contentHeight = content.offsetHeight;
      style2.display = 'block';
      if (x || y) {
        this.left(x);
        this.top(y);
      }
    };
    this.content = content;
    this.element = element;
    this._skip = false;
    this.enable();
  };
  var _initCore3 = function _initCore4(required) {
    if (_windowExists5() && document.body) {
      var nav = window && window.navigator;
      _win4 = window;
      _doc4 = document;
      _docElement3 = _doc4.documentElement;
      _body2 = _doc4.body;
      _tempDiv2 = _createElement3('div');
      _supportsPointer = !!window.PointerEvent;
      _placeholderDiv = _createElement3('div');
      _placeholderDiv.style.cssText =
        'visibility:hidden;height:1px;top:-1px;pointer-events:none;position:relative;clear:both;cursor:grab';
      _defaultCursor =
        _placeholderDiv.style.cursor === 'grab' ? 'grab' : 'move';
      _isAndroid = nav && nav.userAgent.toLowerCase().indexOf('android') !== -1;
      _isTouchDevice =
        ('ontouchstart' in _docElement3 && 'orientation' in _win4) ||
        (nav && (nav.MaxTouchPoints > 0 || nav.msMaxTouchPoints > 0));
      _addPaddingBR = (function () {
        var div = _createElement3('div'),
          child2 = _createElement3('div'),
          childStyle = child2.style,
          parent = _body2,
          val;
        childStyle.display = 'inline-block';
        childStyle.position = 'relative';
        div.style.cssText = child2.innerHTML =
          'width:90px;height:40px;padding:10px;overflow:auto;visibility:hidden';
        div.appendChild(child2);
        parent.appendChild(div);
        val = child2.offsetHeight + 18 > div.scrollHeight;
        parent.removeChild(div);
        return val;
      })();
      _touchEventLookup = (function (types) {
        var standard = types.split(','),
          converted = (
            'onpointerdown' in _tempDiv2
              ? 'pointerdown,pointermove,pointerup,pointercancel'
              : 'onmspointerdown' in _tempDiv2
              ? 'MSPointerDown,MSPointerMove,MSPointerUp,MSPointerCancel'
              : types
          ).split(','),
          obj = {},
          i = 4;
        while (--i > -1) {
          obj[standard[i]] = converted[i];
          obj[converted[i]] = standard[i];
        }
        try {
          _docElement3.addEventListener(
            'test',
            null,
            Object.defineProperty({}, 'passive', {
              get: function get3() {
                _supportsPassive = 1;
              },
            }),
          );
        } catch (e) {}
        return obj;
      })('touchstart,touchmove,touchend,touchcancel');
      _addListener(_doc4, 'touchcancel', _emptyFunc3);
      _addListener(_win4, 'touchmove', _emptyFunc3);
      _body2 && _body2.addEventListener('touchstart', _emptyFunc3);
      _addListener(_doc4, 'contextmenu', function () {
        for (var p in _lookup) {
          if (_lookup[p].isPressed) {
            _lookup[p].endDrag();
          }
        }
      });
      gsap2 = _coreInitted2 = _getGSAP();
    }
    if (gsap2) {
      InertiaPlugin = gsap2.plugins.inertia;
      _checkPrefix = gsap2.utils.checkPrefix;
      _transformProp3 = _checkPrefix(_transformProp3);
      _transformOriginProp3 = _checkPrefix(_transformOriginProp3);
      _toArray = gsap2.utils.toArray;
      _supports3D2 = !!_checkPrefix('perspective');
    } else if (required) {
      console.warn('Please gsap.registerPlugin(Draggable)');
    }
  };
  var EventDispatcher = /* @__PURE__ */ (function () {
    function EventDispatcher2(target) {
      this._listeners = {};
      this.target = target || this;
    }
    var _proto = EventDispatcher2.prototype;
    _proto.addEventListener = function addEventListener(type, callback) {
      var list = this._listeners[type] || (this._listeners[type] = []);
      if (!~list.indexOf(callback)) {
        list.push(callback);
      }
    };
    _proto.removeEventListener = function removeEventListener(type, callback) {
      var list = this._listeners[type],
        i = (list && list.indexOf(callback)) || -1;
      i > -1 && list.splice(i, 1);
    };
    _proto.dispatchEvent = function dispatchEvent(type) {
      var _this = this;
      var result;
      (this._listeners[type] || []).forEach(function (callback) {
        return (
          callback.call(_this, {
            type,
            target: _this.target,
          }) === false && (result = false)
        );
      });
      return result;
    };
    return EventDispatcher2;
  })();
  var Draggable = /* @__PURE__ */ (function (_EventDispatcher) {
    _inheritsLoose2(Draggable2, _EventDispatcher);
    function Draggable2(target, vars) {
      var _this2;
      _this2 = _EventDispatcher.call(this) || this;
      _coreInitted2 || _initCore3(1);
      target = _toArray(target)[0];
      if (!InertiaPlugin) {
        InertiaPlugin = gsap2.plugins.inertia;
      }
      _this2.vars = vars = _copy(vars || {});
      _this2.target = target;
      _this2.x = _this2.y = _this2.rotation = 0;
      _this2.dragResistance = parseFloat(vars.dragResistance) || 0;
      _this2.edgeResistance = isNaN(vars.edgeResistance)
        ? 1
        : parseFloat(vars.edgeResistance) || 0;
      _this2.lockAxis = vars.lockAxis;
      _this2.autoScroll = vars.autoScroll || 0;
      _this2.lockedAxis = null;
      _this2.allowEventDefault = !!vars.allowEventDefault;
      gsap2.getProperty(target, 'x');
      var type = (vars.type || 'x,y').toLowerCase(),
        xyMode = ~type.indexOf('x') || ~type.indexOf('y'),
        rotationMode = type.indexOf('rotation') !== -1,
        xProp = rotationMode ? 'rotation' : xyMode ? 'x' : 'left',
        yProp = xyMode ? 'y' : 'top',
        allowX = !!(
          ~type.indexOf('x') ||
          ~type.indexOf('left') ||
          type === 'scroll'
        ),
        allowY = !!(
          ~type.indexOf('y') ||
          ~type.indexOf('top') ||
          type === 'scroll'
        ),
        minimumMovement = vars.minimumMovement || 2,
        self = _assertThisInitialized2(_this2),
        triggers = _toArray(vars.trigger || vars.handle || target),
        killProps = {},
        dragEndTime = 0,
        checkAutoScrollBounds = false,
        autoScrollMarginTop = vars.autoScrollMarginTop || 40,
        autoScrollMarginRight = vars.autoScrollMarginRight || 40,
        autoScrollMarginBottom = vars.autoScrollMarginBottom || 40,
        autoScrollMarginLeft = vars.autoScrollMarginLeft || 40,
        isClickable = vars.clickableTest || _isClickable,
        clickTime = 0,
        gsCache = target._gsap || gsap2.core.getCache(target),
        isFixed = _isFixed3(target),
        getPropAsNum = function getPropAsNum2(property, unit2) {
          return parseFloat(gsCache.get(target, property, unit2));
        },
        ownerDoc = target.ownerDocument || _doc4,
        enabled,
        scrollProxy,
        startPointerX,
        startPointerY,
        startElementX,
        startElementY,
        hasBounds,
        hasDragCallback,
        hasMoveCallback,
        maxX,
        minX,
        maxY,
        minY,
        touch,
        touchID,
        rotationOrigin,
        dirty,
        old,
        snapX,
        snapY,
        snapXY,
        isClicking,
        touchEventTarget,
        matrix,
        interrupted,
        allowNativeTouchScrolling,
        touchDragAxis,
        isDispatching,
        clickDispatch,
        trustedClickDispatch,
        isPreventingDefault,
        onContextMenu = function onContextMenu2(e) {
          _preventDefault(e);
          e.stopImmediatePropagation && e.stopImmediatePropagation();
          return false;
        },
        render2 = function render3(suppressEvents) {
          if (
            self.autoScroll &&
            self.isDragging &&
            (checkAutoScrollBounds || dirty)
          ) {
            var e = target,
              autoScrollFactor = self.autoScroll * 15,
              parent,
              isRoot2,
              rect2,
              pointerX,
              pointerY,
              changeX,
              changeY,
              gap;
            checkAutoScrollBounds = false;
            _windowProxy.scrollTop =
              _win4.pageYOffset != null
                ? _win4.pageYOffset
                : ownerDoc.documentElement.scrollTop != null
                ? ownerDoc.documentElement.scrollTop
                : ownerDoc.body.scrollTop;
            _windowProxy.scrollLeft =
              _win4.pageXOffset != null
                ? _win4.pageXOffset
                : ownerDoc.documentElement.scrollLeft != null
                ? ownerDoc.documentElement.scrollLeft
                : ownerDoc.body.scrollLeft;
            pointerX = self.pointerX - _windowProxy.scrollLeft;
            pointerY = self.pointerY - _windowProxy.scrollTop;
            while (e && !isRoot2) {
              isRoot2 = _isRoot(e.parentNode);
              parent = isRoot2 ? _windowProxy : e.parentNode;
              rect2 = isRoot2
                ? {
                    bottom: Math.max(
                      _docElement3.clientHeight,
                      _win4.innerHeight || 0,
                    ),
                    right: Math.max(
                      _docElement3.clientWidth,
                      _win4.innerWidth || 0,
                    ),
                    left: 0,
                    top: 0,
                  }
                : parent.getBoundingClientRect();
              changeX = changeY = 0;
              if (allowY) {
                gap = parent._gsMaxScrollY - parent.scrollTop;
                if (gap < 0) {
                  changeY = gap;
                } else if (
                  pointerY > rect2.bottom - autoScrollMarginBottom &&
                  gap
                ) {
                  checkAutoScrollBounds = true;
                  changeY = Math.min(
                    gap,
                    (autoScrollFactor *
                      (1 -
                        Math.max(0, rect2.bottom - pointerY) /
                          autoScrollMarginBottom)) |
                      0,
                  );
                } else if (
                  pointerY < rect2.top + autoScrollMarginTop &&
                  parent.scrollTop
                ) {
                  checkAutoScrollBounds = true;
                  changeY = -Math.min(
                    parent.scrollTop,
                    (autoScrollFactor *
                      (1 -
                        Math.max(0, pointerY - rect2.top) /
                          autoScrollMarginTop)) |
                      0,
                  );
                }
                if (changeY) {
                  parent.scrollTop += changeY;
                }
              }
              if (allowX) {
                gap = parent._gsMaxScrollX - parent.scrollLeft;
                if (gap < 0) {
                  changeX = gap;
                } else if (
                  pointerX > rect2.right - autoScrollMarginRight &&
                  gap
                ) {
                  checkAutoScrollBounds = true;
                  changeX = Math.min(
                    gap,
                    (autoScrollFactor *
                      (1 -
                        Math.max(0, rect2.right - pointerX) /
                          autoScrollMarginRight)) |
                      0,
                  );
                } else if (
                  pointerX < rect2.left + autoScrollMarginLeft &&
                  parent.scrollLeft
                ) {
                  checkAutoScrollBounds = true;
                  changeX = -Math.min(
                    parent.scrollLeft,
                    (autoScrollFactor *
                      (1 -
                        Math.max(0, pointerX - rect2.left) /
                          autoScrollMarginLeft)) |
                      0,
                  );
                }
                if (changeX) {
                  parent.scrollLeft += changeX;
                }
              }
              if (isRoot2 && (changeX || changeY)) {
                _win4.scrollTo(parent.scrollLeft, parent.scrollTop);
                setPointerPosition(
                  self.pointerX + changeX,
                  self.pointerY + changeY,
                );
              }
              e = parent;
            }
          }
          if (dirty) {
            var x = self.x,
              y = self.y;
            if (rotationMode) {
              self.deltaX = x - parseFloat(gsCache.rotation);
              self.rotation = x;
              gsCache.rotation = x + 'deg';
              gsCache.renderTransform(1, gsCache);
            } else {
              if (scrollProxy) {
                if (allowY) {
                  self.deltaY = y - scrollProxy.top();
                  scrollProxy.top(y);
                }
                if (allowX) {
                  self.deltaX = x - scrollProxy.left();
                  scrollProxy.left(x);
                }
              } else if (xyMode) {
                if (allowY) {
                  self.deltaY = y - parseFloat(gsCache.y);
                  gsCache.y = y + 'px';
                }
                if (allowX) {
                  self.deltaX = x - parseFloat(gsCache.x);
                  gsCache.x = x + 'px';
                }
                gsCache.renderTransform(1, gsCache);
              } else {
                if (allowY) {
                  self.deltaY = y - parseFloat(target.style.top || 0);
                  target.style.top = y + 'px';
                }
                if (allowX) {
                  self.deltaX = x - parseFloat(target.style.left || 0);
                  target.style.left = x + 'px';
                }
              }
            }
            if (hasDragCallback && !suppressEvents && !isDispatching) {
              isDispatching = true;
              if (_dispatchEvent(self, 'drag', 'onDrag') === false) {
                if (allowX) {
                  self.x -= self.deltaX;
                }
                if (allowY) {
                  self.y -= self.deltaY;
                }
                render3(true);
              }
              isDispatching = false;
            }
          }
          dirty = false;
        },
        syncXY = function syncXY2(skipOnUpdate, skipSnap) {
          var x = self.x,
            y = self.y,
            snappedValue,
            cs;
          if (!target._gsap) {
            gsCache = gsap2.core.getCache(target);
          }
          gsCache.uncache && gsap2.getProperty(target, 'x');
          if (xyMode) {
            self.x = parseFloat(gsCache.x);
            self.y = parseFloat(gsCache.y);
          } else if (rotationMode) {
            self.x = self.rotation = parseFloat(gsCache.rotation);
          } else if (scrollProxy) {
            self.y = scrollProxy.top();
            self.x = scrollProxy.left();
          } else {
            self.y =
              parseFloat(
                target.style.top ||
                  ((cs = _getComputedStyle(target)) && cs.top),
              ) || 0;
            self.x = parseFloat(target.style.left || (cs || {}).left) || 0;
          }
          if (
            (snapX || snapY || snapXY) &&
            !skipSnap &&
            (self.isDragging || self.isThrowing)
          ) {
            if (snapXY) {
              _temp1.x = self.x;
              _temp1.y = self.y;
              snappedValue = snapXY(_temp1);
              if (snappedValue.x !== self.x) {
                self.x = snappedValue.x;
                dirty = true;
              }
              if (snappedValue.y !== self.y) {
                self.y = snappedValue.y;
                dirty = true;
              }
            }
            if (snapX) {
              snappedValue = snapX(self.x);
              if (snappedValue !== self.x) {
                self.x = snappedValue;
                if (rotationMode) {
                  self.rotation = snappedValue;
                }
                dirty = true;
              }
            }
            if (snapY) {
              snappedValue = snapY(self.y);
              if (snappedValue !== self.y) {
                self.y = snappedValue;
              }
              dirty = true;
            }
          }
          dirty && render2(true);
          if (!skipOnUpdate) {
            self.deltaX = self.x - x;
            self.deltaY = self.y - y;
            _dispatchEvent(self, 'throwupdate', 'onThrowUpdate');
          }
        },
        buildSnapFunc = function buildSnapFunc2(snap3, min2, max2, factor) {
          if (min2 == null) {
            min2 = -_bigNum3;
          }
          if (max2 == null) {
            max2 = _bigNum3;
          }
          if (_isFunction3(snap3)) {
            return function (n) {
              var edgeTolerance = !self.isPressed ? 1 : 1 - self.edgeResistance;
              return (
                snap3.call(
                  self,
                  n > max2
                    ? max2 + (n - max2) * edgeTolerance
                    : n < min2
                    ? min2 + (n - min2) * edgeTolerance
                    : n,
                ) * factor
              );
            };
          }
          if (_isArray2(snap3)) {
            return function (n) {
              var i = snap3.length,
                closest2 = 0,
                absDif = _bigNum3,
                val,
                dif;
              while (--i > -1) {
                val = snap3[i];
                dif = val - n;
                if (dif < 0) {
                  dif = -dif;
                }
                if (dif < absDif && val >= min2 && val <= max2) {
                  closest2 = i;
                  absDif = dif;
                }
              }
              return snap3[closest2];
            };
          }
          return isNaN(snap3)
            ? function (n) {
                return n;
              }
            : function () {
                return snap3 * factor;
              };
        },
        buildPointSnapFunc = function buildPointSnapFunc2(
          snap3,
          minX2,
          maxX2,
          minY2,
          maxY2,
          radius,
          factor,
        ) {
          radius = radius && radius < _bigNum3 ? radius * radius : _bigNum3;
          if (_isFunction3(snap3)) {
            return function (point) {
              var edgeTolerance = !self.isPressed ? 1 : 1 - self.edgeResistance,
                x = point.x,
                y = point.y,
                result,
                dx,
                dy;
              point.x = x =
                x > maxX2
                  ? maxX2 + (x - maxX2) * edgeTolerance
                  : x < minX2
                  ? minX2 + (x - minX2) * edgeTolerance
                  : x;
              point.y = y =
                y > maxY2
                  ? maxY2 + (y - maxY2) * edgeTolerance
                  : y < minY2
                  ? minY2 + (y - minY2) * edgeTolerance
                  : y;
              result = snap3.call(self, point);
              if (result !== point) {
                point.x = result.x;
                point.y = result.y;
              }
              if (factor !== 1) {
                point.x *= factor;
                point.y *= factor;
              }
              if (radius < _bigNum3) {
                dx = point.x - x;
                dy = point.y - y;
                if (dx * dx + dy * dy > radius) {
                  point.x = x;
                  point.y = y;
                }
              }
              return point;
            };
          }
          if (_isArray2(snap3)) {
            return function (p) {
              var i = snap3.length,
                closest2 = 0,
                minDist = _bigNum3,
                x,
                y,
                point,
                dist;
              while (--i > -1) {
                point = snap3[i];
                x = point.x - p.x;
                y = point.y - p.y;
                dist = x * x + y * y;
                if (dist < minDist) {
                  closest2 = i;
                  minDist = dist;
                }
              }
              return minDist <= radius ? snap3[closest2] : p;
            };
          }
          return function (n) {
            return n;
          };
        },
        calculateBounds = function calculateBounds2() {
          var bounds, targetBounds, snap3, snapIsRaw;
          hasBounds = false;
          if (scrollProxy) {
            scrollProxy.calibrate();
            self.minX = minX = -scrollProxy.maxScrollLeft();
            self.minY = minY = -scrollProxy.maxScrollTop();
            self.maxX = maxX = self.maxY = maxY = 0;
            hasBounds = true;
          } else if (!!vars.bounds) {
            bounds = _getBounds(vars.bounds, target.parentNode);
            if (rotationMode) {
              self.minX = minX = bounds.left;
              self.maxX = maxX = bounds.left + bounds.width;
              self.minY = minY = self.maxY = maxY = 0;
            } else if (
              !_isUndefined3(vars.bounds.maxX) ||
              !_isUndefined3(vars.bounds.maxY)
            ) {
              bounds = vars.bounds;
              self.minX = minX = bounds.minX;
              self.minY = minY = bounds.minY;
              self.maxX = maxX = bounds.maxX;
              self.maxY = maxY = bounds.maxY;
            } else {
              targetBounds = _getBounds(target, target.parentNode);
              self.minX = minX = Math.round(
                getPropAsNum(xProp, 'px') +
                  bounds.left -
                  targetBounds.left -
                  0.5,
              );
              self.minY = minY = Math.round(
                getPropAsNum(yProp, 'px') + bounds.top - targetBounds.top - 0.5,
              );
              self.maxX = maxX = Math.round(
                minX + (bounds.width - targetBounds.width),
              );
              self.maxY = maxY = Math.round(
                minY + (bounds.height - targetBounds.height),
              );
            }
            if (minX > maxX) {
              self.minX = maxX;
              self.maxX = maxX = minX;
              minX = self.minX;
            }
            if (minY > maxY) {
              self.minY = maxY;
              self.maxY = maxY = minY;
              minY = self.minY;
            }
            if (rotationMode) {
              self.minRotation = minX;
              self.maxRotation = maxX;
            }
            hasBounds = true;
          }
          if (vars.liveSnap) {
            snap3 = vars.liveSnap === true ? vars.snap || {} : vars.liveSnap;
            snapIsRaw = _isArray2(snap3) || _isFunction3(snap3);
            if (rotationMode) {
              snapX = buildSnapFunc(
                snapIsRaw ? snap3 : snap3.rotation,
                minX,
                maxX,
                1,
              );
              snapY = null;
            } else {
              if (snap3.points) {
                snapXY = buildPointSnapFunc(
                  snapIsRaw ? snap3 : snap3.points,
                  minX,
                  maxX,
                  minY,
                  maxY,
                  snap3.radius,
                  scrollProxy ? -1 : 1,
                );
              } else {
                if (allowX) {
                  snapX = buildSnapFunc(
                    snapIsRaw
                      ? snap3
                      : snap3.x || snap3.left || snap3.scrollLeft,
                    minX,
                    maxX,
                    scrollProxy ? -1 : 1,
                  );
                }
                if (allowY) {
                  snapY = buildSnapFunc(
                    snapIsRaw ? snap3 : snap3.y || snap3.top || snap3.scrollTop,
                    minY,
                    maxY,
                    scrollProxy ? -1 : 1,
                  );
                }
              }
            }
          }
        },
        onThrowComplete = function onThrowComplete2() {
          self.isThrowing = false;
          _dispatchEvent(self, 'throwcomplete', 'onThrowComplete');
        },
        onThrowInterrupt = function onThrowInterrupt2() {
          self.isThrowing = false;
        },
        animate = function animate2(inertia, forceZeroVelocity) {
          var snap3, snapIsRaw, tween, overshootTolerance;
          if (inertia && InertiaPlugin) {
            if (inertia === true) {
              snap3 = vars.snap || vars.liveSnap || {};
              snapIsRaw = _isArray2(snap3) || _isFunction3(snap3);
              inertia = {
                resistance:
                  (vars.throwResistance || vars.resistance || 1e3) /
                  (rotationMode ? 10 : 1),
              };
              if (rotationMode) {
                inertia.rotation = _parseInertia(
                  self,
                  snapIsRaw ? snap3 : snap3.rotation,
                  maxX,
                  minX,
                  1,
                  forceZeroVelocity,
                );
              } else {
                if (allowX) {
                  inertia[xProp] = _parseInertia(
                    self,
                    snapIsRaw ? snap3 : snap3.points || snap3.x || snap3.left,
                    maxX,
                    minX,
                    scrollProxy ? -1 : 1,
                    forceZeroVelocity || self.lockedAxis === 'x',
                  );
                }
                if (allowY) {
                  inertia[yProp] = _parseInertia(
                    self,
                    snapIsRaw ? snap3 : snap3.points || snap3.y || snap3.top,
                    maxY,
                    minY,
                    scrollProxy ? -1 : 1,
                    forceZeroVelocity || self.lockedAxis === 'y',
                  );
                }
                if (
                  snap3.points ||
                  (_isArray2(snap3) && _isObject3(snap3[0]))
                ) {
                  inertia.linkedProps = xProp + ',' + yProp;
                  inertia.radius = snap3.radius;
                }
              }
            }
            self.isThrowing = true;
            overshootTolerance = !isNaN(vars.overshootTolerance)
              ? vars.overshootTolerance
              : vars.edgeResistance === 1
              ? 0
              : 1 - self.edgeResistance + 0.2;
            if (!inertia.duration) {
              inertia.duration = {
                max: Math.max(
                  vars.minDuration || 0,
                  'maxDuration' in vars ? vars.maxDuration : 2,
                ),
                min: !isNaN(vars.minDuration)
                  ? vars.minDuration
                  : overshootTolerance === 0 ||
                    (_isObject3(inertia) && inertia.resistance > 1e3)
                  ? 0
                  : 0.5,
                overshoot: overshootTolerance,
              };
            }
            self.tween = tween = gsap2.to(scrollProxy || target, {
              inertia,
              data: '_draggable',
              onComplete: onThrowComplete,
              onInterrupt: onThrowInterrupt,
              onUpdate: vars.fastMode ? _dispatchEvent : syncXY,
              onUpdateParams: vars.fastMode
                ? [self, 'onthrowupdate', 'onThrowUpdate']
                : snap3 && snap3.radius
                ? [false, true]
                : [],
            });
            if (!vars.fastMode) {
              if (scrollProxy) {
                scrollProxy._skip = true;
              }
              tween.render(1e9, true, true);
              syncXY(true, true);
              self.endX = self.x;
              self.endY = self.y;
              if (rotationMode) {
                self.endRotation = self.x;
              }
              tween.play(0);
              syncXY(true, true);
              if (scrollProxy) {
                scrollProxy._skip = false;
              }
            }
          } else if (hasBounds) {
            self.applyBounds();
          }
        },
        updateMatrix = function updateMatrix2(shiftStart) {
          var start3 = matrix,
            p;
          matrix = getGlobalMatrix(target.parentNode, true);
          if (
            shiftStart &&
            self.isPressed &&
            !matrix.equals(start3 || new Matrix2D())
          ) {
            p = start3.inverse().apply({
              x: startPointerX,
              y: startPointerY,
            });
            matrix.apply(p, p);
            startPointerX = p.x;
            startPointerY = p.y;
          }
          if (matrix.equals(_identityMatrix2)) {
            matrix = null;
          }
        },
        recordStartPositions = function recordStartPositions2() {
          var edgeTolerance = 1 - self.edgeResistance,
            offsetX = isFixed ? _getDocScrollLeft3(ownerDoc) : 0,
            offsetY = isFixed ? _getDocScrollTop3(ownerDoc) : 0,
            parsedOrigin,
            x,
            y;
          updateMatrix(false);
          _point1.x = self.pointerX - offsetX;
          _point1.y = self.pointerY - offsetY;
          matrix && matrix.apply(_point1, _point1);
          startPointerX = _point1.x;
          startPointerY = _point1.y;
          if (dirty) {
            setPointerPosition(self.pointerX, self.pointerY);
            render2(true);
          }
          if (scrollProxy) {
            calculateBounds();
            startElementY = scrollProxy.top();
            startElementX = scrollProxy.left();
          } else {
            if (isTweening2()) {
              syncXY(true, true);
              calculateBounds();
            } else {
              self.applyBounds();
            }
            if (rotationMode) {
              parsedOrigin = target.ownerSVGElement
                ? [
                    gsCache.xOrigin - target.getBBox().x,
                    gsCache.yOrigin - target.getBBox().y,
                  ]
                : (
                    _getComputedStyle(target)[_transformOriginProp3] || '0 0'
                  ).split(' ');
              rotationOrigin = self.rotationOrigin = getGlobalMatrix(
                target,
              ).apply({
                x: parseFloat(parsedOrigin[0]) || 0,
                y: parseFloat(parsedOrigin[1]) || 0,
              });
              syncXY(true, true);
              x = self.pointerX - rotationOrigin.x - offsetX;
              y = rotationOrigin.y - self.pointerY + offsetY;
              startElementX = self.x;
              startElementY = self.y = Math.atan2(y, x) * _RAD2DEG2;
            } else {
              startElementY = getPropAsNum(yProp, 'px');
              startElementX = getPropAsNum(xProp, 'px');
            }
          }
          if (hasBounds && edgeTolerance) {
            if (startElementX > maxX) {
              startElementX = maxX + (startElementX - maxX) / edgeTolerance;
            } else if (startElementX < minX) {
              startElementX = minX - (minX - startElementX) / edgeTolerance;
            }
            if (!rotationMode) {
              if (startElementY > maxY) {
                startElementY = maxY + (startElementY - maxY) / edgeTolerance;
              } else if (startElementY < minY) {
                startElementY = minY - (minY - startElementY) / edgeTolerance;
              }
            }
          }
          self.startX = startElementX = _round3(startElementX);
          self.startY = startElementY = _round3(startElementY);
        },
        isTweening2 = function isTweening3() {
          return self.tween && self.tween.isActive();
        },
        removePlaceholder = function removePlaceholder2() {
          if (
            _placeholderDiv.parentNode &&
            !isTweening2() &&
            !self.isDragging
          ) {
            _placeholderDiv.parentNode.removeChild(_placeholderDiv);
          }
        },
        onPress = function onPress2(e, force) {
          var i;
          if (
            !enabled ||
            self.isPressed ||
            !e ||
            ((e.type === 'mousedown' || e.type === 'pointerdown') &&
              !force &&
              _getTime() - clickTime < 30 &&
              _touchEventLookup[self.pointerEvent.type])
          ) {
            isPreventingDefault && e && enabled && _preventDefault(e);
            return;
          }
          interrupted = isTweening2();
          self.pointerEvent = e;
          if (_touchEventLookup[e.type]) {
            touchEventTarget = ~e.type.indexOf('touch')
              ? e.currentTarget || e.target
              : ownerDoc;
            _addListener(touchEventTarget, 'touchend', onRelease);
            _addListener(touchEventTarget, 'touchmove', onMove);
            _addListener(touchEventTarget, 'touchcancel', onRelease);
            _addListener(ownerDoc, 'touchstart', _onMultiTouchDocument);
          } else {
            touchEventTarget = null;
            _addListener(ownerDoc, 'mousemove', onMove);
          }
          touchDragAxis = null;
          if (!_supportsPointer || !touchEventTarget) {
            _addListener(ownerDoc, 'mouseup', onRelease);
            e && e.target && _addListener(e.target, 'mouseup', onRelease);
          }
          isClicking =
            isClickable.call(self, e.target) &&
            vars.dragClickables === false &&
            !force;
          if (isClicking) {
            _addListener(e.target, 'change', onRelease);
            _dispatchEvent(self, 'pressInit', 'onPressInit');
            _dispatchEvent(self, 'press', 'onPress');
            _setSelectable(triggers, true);
            isPreventingDefault = false;
            return;
          }
          allowNativeTouchScrolling =
            !touchEventTarget ||
            allowX === allowY ||
            self.vars.allowNativeTouchScrolling === false ||
            (self.vars.allowContextMenu && e && (e.ctrlKey || e.which > 2))
              ? false
              : allowX
              ? 'y'
              : 'x';
          isPreventingDefault =
            !allowNativeTouchScrolling && !self.allowEventDefault;
          if (isPreventingDefault) {
            _preventDefault(e);
            _addListener(_win4, 'touchforcechange', _preventDefault);
          }
          if (e.changedTouches) {
            e = touch = e.changedTouches[0];
            touchID = e.identifier;
          } else if (e.pointerId) {
            touchID = e.pointerId;
          } else {
            touch = touchID = null;
          }
          _dragCount++;
          _addToRenderQueue(render2);
          startPointerY = self.pointerY = e.pageY;
          startPointerX = self.pointerX = e.pageX;
          _dispatchEvent(self, 'pressInit', 'onPressInit');
          if (allowNativeTouchScrolling || self.autoScroll) {
            _recordMaxScrolls(target.parentNode);
          }
          if (
            target.parentNode &&
            self.autoScroll &&
            !scrollProxy &&
            !rotationMode &&
            target.parentNode._gsMaxScrollX &&
            !_placeholderDiv.parentNode &&
            !target.getBBox
          ) {
            _placeholderDiv.style.width = target.parentNode.scrollWidth + 'px';
            target.parentNode.appendChild(_placeholderDiv);
          }
          recordStartPositions();
          self.tween && self.tween.kill();
          self.isThrowing = false;
          gsap2.killTweensOf(scrollProxy || target, killProps, true);
          scrollProxy &&
            gsap2.killTweensOf(
              target,
              {
                scrollTo: 1,
              },
              true,
            );
          self.tween = self.lockedAxis = null;
          if (
            vars.zIndexBoost ||
            (!rotationMode && !scrollProxy && vars.zIndexBoost !== false)
          ) {
            target.style.zIndex = Draggable2.zIndex++;
          }
          self.isPressed = true;
          hasDragCallback = !!(vars.onDrag || self._listeners.drag);
          hasMoveCallback = !!(vars.onMove || self._listeners.move);
          if (vars.cursor !== false || vars.activeCursor) {
            i = triggers.length;
            while (--i > -1) {
              gsap2.set(triggers[i], {
                cursor:
                  vars.activeCursor ||
                  vars.cursor ||
                  (_defaultCursor === 'grab' ? 'grabbing' : _defaultCursor),
              });
            }
          }
          _dispatchEvent(self, 'press', 'onPress');
        },
        onMove = function onMove2(e) {
          var originalEvent = e,
            touches,
            pointerX,
            pointerY,
            i,
            dx,
            dy;
          if (!enabled || _isMultiTouching || !self.isPressed || !e) {
            isPreventingDefault && e && enabled && _preventDefault(e);
            return;
          }
          self.pointerEvent = e;
          touches = e.changedTouches;
          if (touches) {
            e = touches[0];
            if (e !== touch && e.identifier !== touchID) {
              i = touches.length;
              while (
                --i > -1 &&
                (e = touches[i]).identifier !== touchID &&
                e.target !== target
              ) {}
              if (i < 0) {
                return;
              }
            }
          } else if (e.pointerId && touchID && e.pointerId !== touchID) {
            return;
          }
          if (touchEventTarget && allowNativeTouchScrolling && !touchDragAxis) {
            _point1.x = e.pageX - (isFixed ? _getDocScrollLeft3(ownerDoc) : 0);
            _point1.y = e.pageY - (isFixed ? _getDocScrollTop3(ownerDoc) : 0);
            matrix && matrix.apply(_point1, _point1);
            pointerX = _point1.x;
            pointerY = _point1.y;
            dx = Math.abs(pointerX - startPointerX);
            dy = Math.abs(pointerY - startPointerY);
            if (
              (dx !== dy && (dx > minimumMovement || dy > minimumMovement)) ||
              (_isAndroid && allowNativeTouchScrolling === touchDragAxis)
            ) {
              touchDragAxis = dx > dy && allowX ? 'x' : 'y';
              if (
                allowNativeTouchScrolling &&
                touchDragAxis !== allowNativeTouchScrolling
              ) {
                _addListener(_win4, 'touchforcechange', _preventDefault);
              }
              if (
                self.vars.lockAxisOnTouchScroll !== false &&
                allowX &&
                allowY
              ) {
                self.lockedAxis = touchDragAxis === 'x' ? 'y' : 'x';
                _isFunction3(self.vars.onLockAxis) &&
                  self.vars.onLockAxis.call(self, originalEvent);
              }
              if (_isAndroid && allowNativeTouchScrolling === touchDragAxis) {
                onRelease(originalEvent);
                return;
              }
            }
          }
          if (
            !self.allowEventDefault &&
            (!allowNativeTouchScrolling ||
              (touchDragAxis && allowNativeTouchScrolling !== touchDragAxis)) &&
            originalEvent.cancelable !== false
          ) {
            _preventDefault(originalEvent);
            isPreventingDefault = true;
          } else if (isPreventingDefault) {
            isPreventingDefault = false;
          }
          if (self.autoScroll) {
            checkAutoScrollBounds = true;
          }
          setPointerPosition(e.pageX, e.pageY, hasMoveCallback);
        },
        setPointerPosition = function setPointerPosition2(
          pointerX,
          pointerY,
          invokeOnMove,
        ) {
          var dragTolerance = 1 - self.dragResistance,
            edgeTolerance = 1 - self.edgeResistance,
            prevPointerX = self.pointerX,
            prevPointerY = self.pointerY,
            prevStartElementY = startElementY,
            prevX = self.x,
            prevY = self.y,
            prevEndX = self.endX,
            prevEndY = self.endY,
            prevEndRotation = self.endRotation,
            prevDirty = dirty,
            xChange,
            yChange,
            x,
            y,
            dif,
            temp;
          self.pointerX = pointerX;
          self.pointerY = pointerY;
          if (isFixed) {
            pointerX -= _getDocScrollLeft3(ownerDoc);
            pointerY -= _getDocScrollTop3(ownerDoc);
          }
          if (rotationMode) {
            y =
              Math.atan2(
                rotationOrigin.y - pointerY,
                pointerX - rotationOrigin.x,
              ) * _RAD2DEG2;
            dif = self.y - y;
            if (dif > 180) {
              startElementY -= 360;
              self.y = y;
            } else if (dif < -180) {
              startElementY += 360;
              self.y = y;
            }
            if (
              self.x !== startElementX ||
              Math.abs(startElementY - y) > minimumMovement
            ) {
              self.y = y;
              x = startElementX + (startElementY - y) * dragTolerance;
            } else {
              x = startElementX;
            }
          } else {
            if (matrix) {
              temp = pointerX * matrix.a + pointerY * matrix.c + matrix.e;
              pointerY = pointerX * matrix.b + pointerY * matrix.d + matrix.f;
              pointerX = temp;
            }
            yChange = pointerY - startPointerY;
            xChange = pointerX - startPointerX;
            if (yChange < minimumMovement && yChange > -minimumMovement) {
              yChange = 0;
            }
            if (xChange < minimumMovement && xChange > -minimumMovement) {
              xChange = 0;
            }
            if ((self.lockAxis || self.lockedAxis) && (xChange || yChange)) {
              temp = self.lockedAxis;
              if (!temp) {
                self.lockedAxis = temp =
                  allowX && Math.abs(xChange) > Math.abs(yChange)
                    ? 'y'
                    : allowY
                    ? 'x'
                    : null;
                if (temp && _isFunction3(self.vars.onLockAxis)) {
                  self.vars.onLockAxis.call(self, self.pointerEvent);
                }
              }
              if (temp === 'y') {
                yChange = 0;
              } else if (temp === 'x') {
                xChange = 0;
              }
            }
            x = _round3(startElementX + xChange * dragTolerance);
            y = _round3(startElementY + yChange * dragTolerance);
          }
          if (
            (snapX || snapY || snapXY) &&
            (self.x !== x || (self.y !== y && !rotationMode))
          ) {
            if (snapXY) {
              _temp1.x = x;
              _temp1.y = y;
              temp = snapXY(_temp1);
              x = _round3(temp.x);
              y = _round3(temp.y);
            }
            if (snapX) {
              x = _round3(snapX(x));
            }
            if (snapY) {
              y = _round3(snapY(y));
            }
          } else if (hasBounds) {
            if (x > maxX) {
              x = maxX + Math.round((x - maxX) * edgeTolerance);
            } else if (x < minX) {
              x = minX + Math.round((x - minX) * edgeTolerance);
            }
            if (!rotationMode) {
              if (y > maxY) {
                y = Math.round(maxY + (y - maxY) * edgeTolerance);
              } else if (y < minY) {
                y = Math.round(minY + (y - minY) * edgeTolerance);
              }
            }
          }
          if (self.x !== x || (self.y !== y && !rotationMode)) {
            if (rotationMode) {
              self.endRotation = self.x = self.endX = x;
              dirty = true;
            } else {
              if (allowY) {
                self.y = self.endY = y;
                dirty = true;
              }
              if (allowX) {
                self.x = self.endX = x;
                dirty = true;
              }
            }
            if (
              !invokeOnMove ||
              _dispatchEvent(self, 'move', 'onMove') !== false
            ) {
              if (!self.isDragging && self.isPressed) {
                self.isDragging = true;
                _dispatchEvent(self, 'dragstart', 'onDragStart');
              }
            } else {
              self.pointerX = prevPointerX;
              self.pointerY = prevPointerY;
              startElementY = prevStartElementY;
              self.x = prevX;
              self.y = prevY;
              self.endX = prevEndX;
              self.endY = prevEndY;
              self.endRotation = prevEndRotation;
              dirty = prevDirty;
            }
          }
        },
        onRelease = function onRelease2(e, force) {
          if (
            !enabled ||
            !self.isPressed ||
            (e &&
              touchID != null &&
              !force &&
              ((e.pointerId &&
                e.pointerId !== touchID &&
                e.target !== target) ||
                (e.changedTouches && !_hasTouchID(e.changedTouches, touchID))))
          ) {
            isPreventingDefault && e && enabled && _preventDefault(e);
            return;
          }
          self.isPressed = false;
          var originalEvent = e,
            wasDragging = self.isDragging,
            isContextMenuRelease =
              self.vars.allowContextMenu && e && (e.ctrlKey || e.which > 2),
            placeholderDelayedCall = gsap2.delayedCall(1e-3, removePlaceholder),
            touches,
            i,
            syntheticEvent,
            eventTarget,
            syntheticClick;
          if (touchEventTarget) {
            _removeListener(touchEventTarget, 'touchend', onRelease2);
            _removeListener(touchEventTarget, 'touchmove', onMove);
            _removeListener(touchEventTarget, 'touchcancel', onRelease2);
            _removeListener(ownerDoc, 'touchstart', _onMultiTouchDocument);
          } else {
            _removeListener(ownerDoc, 'mousemove', onMove);
          }
          _removeListener(_win4, 'touchforcechange', _preventDefault);
          if (!_supportsPointer || !touchEventTarget) {
            _removeListener(ownerDoc, 'mouseup', onRelease2);
            e && e.target && _removeListener(e.target, 'mouseup', onRelease2);
          }
          dirty = false;
          if (wasDragging) {
            dragEndTime = _lastDragTime = _getTime();
            self.isDragging = false;
          }
          if (isClicking && !isContextMenuRelease) {
            if (e) {
              _removeListener(e.target, 'change', onRelease2);
              self.pointerEvent = originalEvent;
            }
            _setSelectable(triggers, false);
            _dispatchEvent(self, 'release', 'onRelease');
            _dispatchEvent(self, 'click', 'onClick');
            isClicking = false;
            return;
          }
          _removeFromRenderQueue(render2);
          i = triggers.length;
          while (--i > -1) {
            _setStyle(
              triggers[i],
              'cursor',
              vars.cursor || (vars.cursor !== false ? _defaultCursor : null),
            );
          }
          _dragCount--;
          if (e) {
            touches = e.changedTouches;
            if (touches) {
              e = touches[0];
              if (e !== touch && e.identifier !== touchID) {
                i = touches.length;
                while (
                  --i > -1 &&
                  (e = touches[i]).identifier !== touchID &&
                  e.target !== target
                ) {}
                if (i < 0) {
                  return;
                }
              }
            }
            self.pointerEvent = originalEvent;
            self.pointerX = e.pageX;
            self.pointerY = e.pageY;
          }
          if (isContextMenuRelease && originalEvent) {
            _preventDefault(originalEvent);
            isPreventingDefault = true;
            _dispatchEvent(self, 'release', 'onRelease');
          } else if (originalEvent && !wasDragging) {
            isPreventingDefault = false;
            if (interrupted && (vars.snap || vars.bounds)) {
              animate(vars.inertia || vars.throwProps);
            }
            _dispatchEvent(self, 'release', 'onRelease');
            if (
              (!_isAndroid || originalEvent.type !== 'touchmove') &&
              originalEvent.type.indexOf('cancel') === -1
            ) {
              _dispatchEvent(self, 'click', 'onClick');
              if (_getTime() - clickTime < 300) {
                _dispatchEvent(self, 'doubleclick', 'onDoubleClick');
              }
              eventTarget = originalEvent.target || target;
              clickTime = _getTime();
              syntheticClick = function syntheticClick2() {
                if (
                  clickTime !== clickDispatch &&
                  self.enabled() &&
                  !self.isPressed &&
                  !originalEvent.defaultPrevented
                ) {
                  if (eventTarget.click) {
                    eventTarget.click();
                  } else if (ownerDoc.createEvent) {
                    syntheticEvent = ownerDoc.createEvent('MouseEvents');
                    syntheticEvent.initMouseEvent(
                      'click',
                      true,
                      true,
                      _win4,
                      1,
                      self.pointerEvent.screenX,
                      self.pointerEvent.screenY,
                      self.pointerX,
                      self.pointerY,
                      false,
                      false,
                      false,
                      false,
                      0,
                      null,
                    );
                    eventTarget.dispatchEvent(syntheticEvent);
                  }
                }
              };
              if (!_isAndroid && !originalEvent.defaultPrevented) {
                gsap2.delayedCall(0.05, syntheticClick);
              }
            }
          } else {
            animate(vars.inertia || vars.throwProps);
            if (
              !self.allowEventDefault &&
              originalEvent &&
              (vars.dragClickables !== false ||
                !isClickable.call(self, originalEvent.target)) &&
              wasDragging &&
              (!allowNativeTouchScrolling ||
                (touchDragAxis &&
                  allowNativeTouchScrolling === touchDragAxis)) &&
              originalEvent.cancelable !== false
            ) {
              isPreventingDefault = true;
              _preventDefault(originalEvent);
            } else {
              isPreventingDefault = false;
            }
            _dispatchEvent(self, 'release', 'onRelease');
          }
          isTweening2() &&
            placeholderDelayedCall.duration(self.tween.duration());
          wasDragging && _dispatchEvent(self, 'dragend', 'onDragEnd');
          return true;
        },
        updateScroll = function updateScroll2(e) {
          if (e && self.isDragging && !scrollProxy) {
            var parent = e.target || target.parentNode,
              deltaX = parent.scrollLeft - parent._gsScrollX,
              deltaY = parent.scrollTop - parent._gsScrollY;
            if (deltaX || deltaY) {
              if (matrix) {
                startPointerX -= deltaX * matrix.a + deltaY * matrix.c;
                startPointerY -= deltaY * matrix.d + deltaX * matrix.b;
              } else {
                startPointerX -= deltaX;
                startPointerY -= deltaY;
              }
              parent._gsScrollX += deltaX;
              parent._gsScrollY += deltaY;
              setPointerPosition(self.pointerX, self.pointerY);
            }
          }
        },
        onClick = function onClick2(e) {
          var time = _getTime(),
            recentlyClicked = time - clickTime < 40,
            recentlyDragged = time - dragEndTime < 40,
            alreadyDispatched = recentlyClicked && clickDispatch === clickTime,
            defaultPrevented =
              self.pointerEvent && self.pointerEvent.defaultPrevented,
            alreadyDispatchedTrusted =
              recentlyClicked && trustedClickDispatch === clickTime,
            trusted =
              e.isTrusted ||
              (e.isTrusted == null && recentlyClicked && alreadyDispatched);
          if (
            (alreadyDispatched ||
              (recentlyDragged && self.vars.suppressClickOnDrag !== false)) &&
            e.stopImmediatePropagation
          ) {
            e.stopImmediatePropagation();
          }
          if (
            recentlyClicked &&
            !(self.pointerEvent && self.pointerEvent.defaultPrevented) &&
            (!alreadyDispatched || (trusted && !alreadyDispatchedTrusted))
          ) {
            if (trusted && alreadyDispatched) {
              trustedClickDispatch = clickTime;
            }
            clickDispatch = clickTime;
            return;
          }
          if (self.isPressed || recentlyDragged || recentlyClicked) {
            if (!trusted || !e.detail || !recentlyClicked || defaultPrevented) {
              _preventDefault(e);
            }
          }
          if (!recentlyClicked && !recentlyDragged) {
            e && e.target && (self.pointerEvent = e);
            _dispatchEvent(self, 'click', 'onClick');
          }
        },
        localizePoint = function localizePoint2(p) {
          return matrix
            ? {
                x: p.x * matrix.a + p.y * matrix.c + matrix.e,
                y: p.x * matrix.b + p.y * matrix.d + matrix.f,
              }
            : {
                x: p.x,
                y: p.y,
              };
        };
      old = Draggable2.get(target);
      old && old.kill();
      _this2.startDrag = function (event, align) {
        var r1, r2, p1, p2;
        onPress(event || self.pointerEvent, true);
        if (align && !self.hitTest(event || self.pointerEvent)) {
          r1 = _parseRect(event || self.pointerEvent);
          r2 = _parseRect(target);
          p1 = localizePoint({
            x: r1.left + r1.width / 2,
            y: r1.top + r1.height / 2,
          });
          p2 = localizePoint({
            x: r2.left + r2.width / 2,
            y: r2.top + r2.height / 2,
          });
          startPointerX -= p1.x - p2.x;
          startPointerY -= p1.y - p2.y;
        }
        if (!self.isDragging) {
          self.isDragging = true;
          _dispatchEvent(self, 'dragstart', 'onDragStart');
        }
      };
      _this2.drag = onMove;
      _this2.endDrag = function (e) {
        return onRelease(e || self.pointerEvent, true);
      };
      _this2.timeSinceDrag = function () {
        return self.isDragging ? 0 : (_getTime() - dragEndTime) / 1e3;
      };
      _this2.timeSinceClick = function () {
        return (_getTime() - clickTime) / 1e3;
      };
      _this2.hitTest = function (target2, threshold) {
        return Draggable2.hitTest(self.target, target2, threshold);
      };
      _this2.getDirection = function (from, diagonalThreshold) {
        var mode =
            from === 'velocity' && InertiaPlugin
              ? from
              : _isObject3(from) && !rotationMode
              ? 'element'
              : 'start',
          xChange,
          yChange,
          ratio,
          direction,
          r1,
          r2;
        if (mode === 'element') {
          r1 = _parseRect(self.target);
          r2 = _parseRect(from);
        }
        xChange =
          mode === 'start'
            ? self.x - startElementX
            : mode === 'velocity'
            ? InertiaPlugin.getVelocity(target, xProp)
            : r1.left + r1.width / 2 - (r2.left + r2.width / 2);
        if (rotationMode) {
          return xChange < 0 ? 'counter-clockwise' : 'clockwise';
        } else {
          diagonalThreshold = diagonalThreshold || 2;
          yChange =
            mode === 'start'
              ? self.y - startElementY
              : mode === 'velocity'
              ? InertiaPlugin.getVelocity(target, yProp)
              : r1.top + r1.height / 2 - (r2.top + r2.height / 2);
          ratio = Math.abs(xChange / yChange);
          direction =
            ratio < 1 / diagonalThreshold ? '' : xChange < 0 ? 'left' : 'right';
          if (ratio < diagonalThreshold) {
            if (direction !== '') {
              direction += '-';
            }
            direction += yChange < 0 ? 'up' : 'down';
          }
        }
        return direction;
      };
      _this2.applyBounds = function (newBounds, sticky) {
        var x, y, forceZeroVelocity, e, parent, isRoot2;
        if (newBounds && vars.bounds !== newBounds) {
          vars.bounds = newBounds;
          return self.update(true, sticky);
        }
        syncXY(true);
        calculateBounds();
        if (hasBounds && !isTweening2()) {
          x = self.x;
          y = self.y;
          if (x > maxX) {
            x = maxX;
          } else if (x < minX) {
            x = minX;
          }
          if (y > maxY) {
            y = maxY;
          } else if (y < minY) {
            y = minY;
          }
          if (self.x !== x || self.y !== y) {
            forceZeroVelocity = true;
            self.x = self.endX = x;
            if (rotationMode) {
              self.endRotation = x;
            } else {
              self.y = self.endY = y;
            }
            dirty = true;
            render2(true);
            if (self.autoScroll && !self.isDragging) {
              _recordMaxScrolls(target.parentNode);
              e = target;
              _windowProxy.scrollTop =
                _win4.pageYOffset != null
                  ? _win4.pageYOffset
                  : ownerDoc.documentElement.scrollTop != null
                  ? ownerDoc.documentElement.scrollTop
                  : ownerDoc.body.scrollTop;
              _windowProxy.scrollLeft =
                _win4.pageXOffset != null
                  ? _win4.pageXOffset
                  : ownerDoc.documentElement.scrollLeft != null
                  ? ownerDoc.documentElement.scrollLeft
                  : ownerDoc.body.scrollLeft;
              while (e && !isRoot2) {
                isRoot2 = _isRoot(e.parentNode);
                parent = isRoot2 ? _windowProxy : e.parentNode;
                if (allowY && parent.scrollTop > parent._gsMaxScrollY) {
                  parent.scrollTop = parent._gsMaxScrollY;
                }
                if (allowX && parent.scrollLeft > parent._gsMaxScrollX) {
                  parent.scrollLeft = parent._gsMaxScrollX;
                }
                e = parent;
              }
            }
          }
          if (
            self.isThrowing &&
            (forceZeroVelocity ||
              self.endX > maxX ||
              self.endX < minX ||
              self.endY > maxY ||
              self.endY < minY)
          ) {
            animate(vars.inertia || vars.throwProps, forceZeroVelocity);
          }
        }
        return self;
      };
      _this2.update = function (applyBounds, sticky, ignoreExternalChanges) {
        var x = self.x,
          y = self.y;
        updateMatrix(!sticky);
        if (applyBounds) {
          self.applyBounds();
        } else {
          dirty && ignoreExternalChanges && render2(true);
          syncXY(true);
        }
        if (sticky) {
          setPointerPosition(self.pointerX, self.pointerY);
          dirty && render2(true);
        }
        if (
          self.isPressed &&
          !sticky &&
          ((allowX && Math.abs(x - self.x) > 0.01) ||
            (allowY && Math.abs(y - self.y) > 0.01 && !rotationMode))
        ) {
          recordStartPositions();
        }
        if (self.autoScroll) {
          _recordMaxScrolls(target.parentNode, self.isDragging);
          checkAutoScrollBounds = self.isDragging;
          render2(true);
          _removeScrollListener(target, updateScroll);
          _addScrollListener(target, updateScroll);
        }
        return self;
      };
      _this2.enable = function (type2) {
        var setVars = {
            lazy: true,
          },
          id,
          i,
          trigger2;
        if (vars.cursor !== false) {
          setVars.cursor = vars.cursor || _defaultCursor;
        }
        if (gsap2.utils.checkPrefix('touchCallout')) {
          setVars.touchCallout = 'none';
        }
        if (type2 !== 'soft') {
          _setTouchActionForAllDescendants(
            triggers,
            allowX === allowY
              ? 'none'
              : (vars.allowNativeTouchScrolling &&
                  (target.scrollHeight === target.clientHeight) ===
                    (target.scrollWidth === target.clientHeight)) ||
                vars.allowEventDefault
              ? 'manipulation'
              : allowX
              ? 'pan-y'
              : 'pan-x',
          );
          i = triggers.length;
          while (--i > -1) {
            trigger2 = triggers[i];
            _supportsPointer || _addListener(trigger2, 'mousedown', onPress);
            _addListener(trigger2, 'touchstart', onPress);
            _addListener(trigger2, 'click', onClick, true);
            gsap2.set(trigger2, setVars);
            if (trigger2.getBBox && trigger2.ownerSVGElement) {
              gsap2.set(trigger2.ownerSVGElement, {
                touchAction:
                  allowX === allowY
                    ? 'none'
                    : vars.allowNativeTouchScrolling || vars.allowEventDefault
                    ? 'manipulation'
                    : allowX
                    ? 'pan-y'
                    : 'pan-x',
              });
            }
            vars.allowContextMenu ||
              _addListener(trigger2, 'contextmenu', onContextMenu);
          }
          _setSelectable(triggers, false);
        }
        _addScrollListener(target, updateScroll);
        enabled = true;
        if (InertiaPlugin && type2 !== 'soft') {
          InertiaPlugin.track(
            scrollProxy || target,
            xyMode ? 'x,y' : rotationMode ? 'rotation' : 'top,left',
          );
        }
        target._gsDragID = id = 'd' + _lookupCount++;
        _lookup[id] = self;
        if (scrollProxy) {
          scrollProxy.enable();
          scrollProxy.element._gsDragID = id;
        }
        (vars.bounds || rotationMode) && recordStartPositions();
        vars.bounds && self.applyBounds();
        return self;
      };
      _this2.disable = function (type2) {
        var dragging = self.isDragging,
          i = triggers.length,
          trigger2;
        while (--i > -1) {
          _setStyle(triggers[i], 'cursor', null);
        }
        if (type2 !== 'soft') {
          _setTouchActionForAllDescendants(triggers, null);
          i = triggers.length;
          while (--i > -1) {
            trigger2 = triggers[i];
            _setStyle(trigger2, 'touchCallout', null);
            _removeListener(trigger2, 'mousedown', onPress);
            _removeListener(trigger2, 'touchstart', onPress);
            _removeListener(trigger2, 'click', onClick);
            _removeListener(trigger2, 'contextmenu', onContextMenu);
          }
          _setSelectable(triggers, true);
          if (touchEventTarget) {
            _removeListener(touchEventTarget, 'touchcancel', onRelease);
            _removeListener(touchEventTarget, 'touchend', onRelease);
            _removeListener(touchEventTarget, 'touchmove', onMove);
          }
          _removeListener(ownerDoc, 'mouseup', onRelease);
          _removeListener(ownerDoc, 'mousemove', onMove);
        }
        _removeScrollListener(target, updateScroll);
        enabled = false;
        InertiaPlugin &&
          type2 !== 'soft' &&
          InertiaPlugin.untrack(
            scrollProxy || target,
            xyMode ? 'x,y' : rotationMode ? 'rotation' : 'top,left',
          );
        scrollProxy && scrollProxy.disable();
        _removeFromRenderQueue(render2);
        self.isDragging = self.isPressed = isClicking = false;
        dragging && _dispatchEvent(self, 'dragend', 'onDragEnd');
        return self;
      };
      _this2.enabled = function (value, type2) {
        return arguments.length
          ? value
            ? self.enable(type2)
            : self.disable(type2)
          : enabled;
      };
      _this2.kill = function () {
        self.isThrowing = false;
        self.tween && self.tween.kill();
        self.disable();
        gsap2.set(triggers, {
          clearProps: 'userSelect',
        });
        delete _lookup[target._gsDragID];
        return self;
      };
      if (~type.indexOf('scroll')) {
        scrollProxy = _this2.scrollProxy = new ScrollProxy(
          target,
          _extend(
            {
              onKill: function onKill() {
                self.isPressed && onRelease(null);
              },
            },
            vars,
          ),
        );
        target.style.overflowY = allowY && !_isTouchDevice ? 'auto' : 'hidden';
        target.style.overflowX = allowX && !_isTouchDevice ? 'auto' : 'hidden';
        target = scrollProxy.content;
      }
      if (rotationMode) {
        killProps.rotation = 1;
      } else {
        if (allowX) {
          killProps[xProp] = 1;
        }
        if (allowY) {
          killProps[yProp] = 1;
        }
      }
      gsCache.force3D = 'force3D' in vars ? vars.force3D : true;
      _this2.enable();
      return _this2;
    }
    Draggable2.register = function register2(core) {
      gsap2 = core;
      _initCore3();
    };
    Draggable2.create = function create2(targets, vars) {
      _coreInitted2 || _initCore3(true);
      return _toArray(targets).map(function (target) {
        return new Draggable2(target, vars);
      });
    };
    Draggable2.get = function get3(target) {
      return _lookup[(_toArray(target)[0] || {})._gsDragID];
    };
    Draggable2.timeSinceDrag = function timeSinceDrag() {
      return (_getTime() - _lastDragTime) / 1e3;
    };
    Draggable2.hitTest = function hitTest(obj1, obj2, threshold) {
      if (obj1 === obj2) {
        return false;
      }
      var r1 = _parseRect(obj1),
        r2 = _parseRect(obj2),
        top = r1.top,
        left = r1.left,
        right = r1.right,
        bottom = r1.bottom,
        width = r1.width,
        height = r1.height,
        isOutside =
          r2.left > right ||
          r2.right < left ||
          r2.top > bottom ||
          r2.bottom < top,
        overlap,
        area,
        isRatio;
      if (isOutside || !threshold) {
        return !isOutside;
      }
      isRatio = (threshold + '').indexOf('%') !== -1;
      threshold = parseFloat(threshold) || 0;
      overlap = {
        left: Math.max(left, r2.left),
        top: Math.max(top, r2.top),
      };
      overlap.width = Math.min(right, r2.right) - overlap.left;
      overlap.height = Math.min(bottom, r2.bottom) - overlap.top;
      if (overlap.width < 0 || overlap.height < 0) {
        return false;
      }
      if (isRatio) {
        threshold *= 0.01;
        area = overlap.width * overlap.height;
        return (
          area >= width * height * threshold ||
          area >= r2.width * r2.height * threshold
        );
      }
      return overlap.width > threshold && overlap.height > threshold;
    };
    return Draggable2;
  })(EventDispatcher);
  _setDefaults3(Draggable.prototype, {
    pointerX: 0,
    pointerY: 0,
    startX: 0,
    startY: 0,
    deltaX: 0,
    deltaY: 0,
    isDragging: false,
    isPressed: false,
  });
  Draggable.zIndex = 1e3;
  Draggable.version = '3.7.0';
  _getGSAP() && gsap2.registerPlugin(Draggable);

  // node_modules/gsap/utils/VelocityTracker.js
  var gsap3;
  var _coreInitted3;
  var _toArray2;
  var _getUnit;
  var _first;
  var _ticker2;
  var _time1;
  var _time2;
  var _getCache3;
  var _getGSAP3 = function _getGSAP4() {
    return gsap3 || (typeof window !== 'undefined' && (gsap3 = window.gsap));
  };
  var _lookup2 = {};
  var _round5 = function _round6(value) {
    return Math.round(value * 1e4) / 1e4;
  };
  var _getID = function _getID2(target) {
    return _getCache3(target).id;
  };
  var _getByTarget = function _getByTarget2(target) {
    return _lookup2[
      _getID(typeof target === 'string' ? _toArray2(target)[0] : target)
    ];
  };
  var _onTick = function _onTick2(time) {
    var pt = _first,
      val;
    if (time - _time1 >= 0.05) {
      _time2 = _time1;
      _time1 = time;
      while (pt) {
        val = pt.g(pt.t, pt.p);
        if (val !== pt.v1 || time - pt.t1 > 0.2) {
          pt.v2 = pt.v1;
          pt.v1 = val;
          pt.t2 = pt.t1;
          pt.t1 = time;
        }
        pt = pt._next;
      }
    }
  };
  var _types = {
    deg: 360,
    rad: Math.PI * 2,
  };
  var _initCore5 = function _initCore6() {
    gsap3 = _getGSAP3();
    if (gsap3) {
      _toArray2 = gsap3.utils.toArray;
      _getUnit = gsap3.utils.getUnit;
      _getCache3 = gsap3.core.getCache;
      _ticker2 = gsap3.ticker;
      _coreInitted3 = 1;
    }
  };
  var PropTracker = function PropTracker2(target, property, type, next2) {
    this.t = target;
    this.p = property;
    this.g = target._gsap.get;
    this.rCap = _types[type || _getUnit(this.g(target, property))];
    this.v1 = this.v2 = 0;
    this.t1 = this.t2 = _ticker2.time;
    if (next2) {
      this._next = next2;
      next2._prev = this;
    }
  };
  var VelocityTracker = /* @__PURE__ */ (function () {
    function VelocityTracker2(target, property) {
      if (!_coreInitted3) {
        _initCore5();
      }
      this.target = _toArray2(target)[0];
      _lookup2[_getID(this.target)] = this;
      this._props = {};
      property && this.add(property);
    }
    VelocityTracker2.register = function register2(core) {
      gsap3 = core;
      _initCore5();
    };
    var _proto = VelocityTracker2.prototype;
    _proto.get = function get3(property, skipRecentTick) {
      var pt =
          this._props[property] ||
          console.warn('Not tracking ' + property + ' velocity.'),
        val,
        dif,
        rotationCap;
      val = parseFloat(skipRecentTick ? pt.v1 : pt.g(pt.t, pt.p));
      dif = val - parseFloat(pt.v2);
      rotationCap = pt.rCap;
      if (rotationCap) {
        dif = dif % rotationCap;
        if (dif !== dif % (rotationCap / 2)) {
          dif = dif < 0 ? dif + rotationCap : dif - rotationCap;
        }
      }
      return _round5(dif / ((skipRecentTick ? pt.t1 : _ticker2.time) - pt.t2));
    };
    _proto.getAll = function getAll() {
      var result = {},
        props = this._props,
        p;
      for (p in props) {
        result[p] = this.get(p);
      }
      return result;
    };
    _proto.isTracking = function isTracking(property) {
      return property in this._props;
    };
    _proto.add = function add2(property, type) {
      if (!(property in this._props)) {
        if (!_first) {
          _ticker2.add(_onTick);
          _time1 = _time2 = _ticker2.time;
        }
        _first = this._props[property] = new PropTracker(
          this.target,
          property,
          type,
          _first,
        );
      }
    };
    _proto.remove = function remove2(property) {
      var pt = this._props[property],
        prev,
        next2;
      if (pt) {
        prev = pt._prev;
        next2 = pt._next;
        if (prev) {
          prev._next = next2;
        }
        if (next2) {
          next2._prev = prev;
        } else if (_first === pt) {
          _ticker2.remove(_onTick);
          _first = 0;
        }
        delete this._props[property];
      }
    };
    _proto.kill = function kill(shallow) {
      for (var p in this._props) {
        this.remove(p);
      }
      if (!shallow) {
        delete _lookup2[_getID(this.target)];
      }
    };
    VelocityTracker2.track = function track2(targets, properties, types) {
      if (!_coreInitted3) {
        _initCore5();
      }
      var result = [],
        targs = _toArray2(targets),
        a = properties.split(','),
        t = (types || '').split(','),
        i = targs.length,
        tracker,
        j;
      while (i--) {
        tracker = _getByTarget(targs[i]) || new VelocityTracker2(targs[i]);
        j = a.length;
        while (j--) {
          tracker.add(a[j], t[j] || t[0]);
        }
        result.push(tracker);
      }
      return result;
    };
    VelocityTracker2.untrack = function untrack(targets, properties) {
      var props = (properties || '').split(',');
      _toArray2(targets).forEach(function (target) {
        var tracker = _getByTarget(target);
        if (tracker) {
          if (!props.length) {
            tracker.kill(1);
          } else {
            props.forEach(function (p) {
              return tracker.remove(p);
            });
          }
        }
      });
    };
    VelocityTracker2.isTracking = function isTracking(target, property) {
      var tracker = _getByTarget(target);
      return tracker && tracker.isTracking(property);
    };
    VelocityTracker2.getVelocity = function getVelocity(target, property) {
      var tracker = _getByTarget(target);
      return !tracker || !tracker.isTracking(property)
        ? console.warn('Not tracking velocity of ' + property)
        : tracker.get(property);
    };
    return VelocityTracker2;
  })();
  VelocityTracker.getByTarget = _getByTarget;
  _getGSAP3() && gsap3.registerPlugin(VelocityTracker);

  // node_modules/gsap/InertiaPlugin.js
  var gsap4;
  var _coreInitted4;
  var _parseEase3;
  var _toArray3;
  var _power3;
  var _config2;
  var _getUnit2;
  var PropTween2;
  var _getCache4;
  var _checkPointRatio;
  var _clamp3;
  var _processingVars;
  var _getTracker = VelocityTracker.getByTarget;
  var _getGSAP5 = function _getGSAP6() {
    return (
      gsap4 ||
      (typeof window !== 'undefined' &&
        (gsap4 = window.gsap) &&
        gsap4.registerPlugin &&
        gsap4)
    );
  };
  var _isString3 = function _isString4(value) {
    return typeof value === 'string';
  };
  var _isNumber3 = function _isNumber4(value) {
    return typeof value === 'number';
  };
  var _isObject5 = function _isObject6(value) {
    return typeof value === 'object';
  };
  var _isFunction5 = function _isFunction6(value) {
    return typeof value === 'function';
  };
  var _bonusValidated = 1;
  var _isArray3 = Array.isArray;
  var _emptyFunc5 = function _emptyFunc6(p) {
    return p;
  };
  var _bigNum4 = 1e10;
  var _tinyNum2 = 1 / _bigNum4;
  var _checkPoint = 0.05;
  var _round7 = function _round8(value) {
    return Math.round(value * 1e4) / 1e4;
  };
  var _extend3 = function _extend4(obj, defaults2, exclude) {
    for (var p in defaults2) {
      if (!(p in obj) && p !== exclude) {
        obj[p] = defaults2[p];
      }
    }
    return obj;
  };
  var _deepClone = function _deepClone2(obj) {
    var copy = {},
      p,
      v;
    for (p in obj) {
      copy[p] = _isObject5((v = obj[p])) ? _deepClone2(v) : v;
    }
    return copy;
  };
  var _getClosest = function _getClosest2(n, values, max2, min2, radius) {
    var i = values.length,
      closest2 = 0,
      absDif = _bigNum4,
      val,
      dif,
      p,
      dist;
    if (_isObject5(n)) {
      while (i--) {
        val = values[i];
        dif = 0;
        for (p in n) {
          dist = val[p] - n[p];
          dif += dist * dist;
        }
        if (dif < absDif) {
          closest2 = i;
          absDif = dif;
        }
      }
      if ((radius || _bigNum4) < _bigNum4 && radius < Math.sqrt(absDif)) {
        return n;
      }
    } else {
      while (i--) {
        val = values[i];
        dif = val - n;
        if (dif < 0) {
          dif = -dif;
        }
        if (dif < absDif && val >= min2 && val <= max2) {
          closest2 = i;
          absDif = dif;
        }
      }
    }
    return values[closest2];
  };
  var _parseEnd = function _parseEnd2(curProp, end, max2, min2, name, radius) {
    if (curProp.end === 'auto') {
      return curProp;
    }
    var endVar = curProp.end,
      adjustedEnd,
      p;
    max2 = isNaN(max2) ? _bigNum4 : max2;
    min2 = isNaN(min2) ? -_bigNum4 : min2;
    if (_isObject5(end)) {
      adjustedEnd = end.calculated
        ? end
        : (_isFunction5(endVar)
            ? endVar(end)
            : _getClosest(end, endVar, max2, min2, radius)) || end;
      if (!end.calculated) {
        for (p in adjustedEnd) {
          end[p] = adjustedEnd[p];
        }
        end.calculated = true;
      }
      adjustedEnd = adjustedEnd[name];
    } else {
      adjustedEnd = _isFunction5(endVar)
        ? endVar(end)
        : _isArray3(endVar)
        ? _getClosest(end, endVar, max2, min2, radius)
        : parseFloat(endVar);
    }
    if (adjustedEnd > max2) {
      adjustedEnd = max2;
    } else if (adjustedEnd < min2) {
      adjustedEnd = min2;
    }
    return {
      max: adjustedEnd,
      min: adjustedEnd,
      unitFactor: curProp.unitFactor,
    };
  };
  var _getNumOrDefault = function _getNumOrDefault2(
    vars,
    property,
    defaultValue,
  ) {
    return isNaN(vars[property]) ? defaultValue : +vars[property];
  };
  var _calculateChange = function _calculateChange2(velocity, duration) {
    return (duration * _checkPoint * velocity) / _checkPointRatio;
  };
  var _calculateDuration = function _calculateDuration2(start3, end, velocity) {
    return Math.abs(
      ((end - start3) * _checkPointRatio) / velocity / _checkPoint,
    );
  };
  var _reservedProps2 = {
    resistance: 1,
    checkpoint: 1,
    preventOvershoot: 1,
    linkedProps: 1,
    radius: 1,
    duration: 1,
  };
  var _processLinkedProps = function _processLinkedProps2(
    target,
    vars,
    getVal,
    resistance,
  ) {
    if (vars.linkedProps) {
      var linkedPropNames = vars.linkedProps.split(','),
        linkedProps = {},
        i,
        p,
        curProp,
        curVelocity,
        tracker,
        curDuration;
      for (i = 0; i < linkedPropNames.length; i++) {
        p = linkedPropNames[i];
        curProp = vars[p];
        if (curProp) {
          if (_isNumber3(curProp.velocity)) {
            curVelocity = curProp.velocity;
          } else {
            tracker = tracker || _getTracker(target);
            curVelocity = tracker && tracker.isTracking(p) ? tracker.get(p) : 0;
          }
          curDuration = Math.abs(
            curVelocity / _getNumOrDefault(curProp, 'resistance', resistance),
          );
          linkedProps[p] =
            parseFloat(getVal(target, p)) +
            _calculateChange(curVelocity, curDuration);
        }
      }
      return linkedProps;
    }
  };
  var _calculateTweenDuration = function _calculateTweenDuration2(
    target,
    vars,
    maxDuration,
    minDuration,
    overshootTolerance,
    recordEnd,
  ) {
    if (maxDuration === void 0) {
      maxDuration = 10;
    }
    if (minDuration === void 0) {
      minDuration = 0.2;
    }
    if (overshootTolerance === void 0) {
      overshootTolerance = 1;
    }
    if (recordEnd === void 0) {
      recordEnd = 0;
    }
    _isString3(target) && (target = _toArray3(target)[0]);
    if (!target) {
      return 0;
    }
    var duration = 0,
      clippedDuration = _bigNum4,
      inertiaVars = vars.inertia || vars,
      getVal = _getCache4(target).get,
      resistance = _getNumOrDefault(
        inertiaVars,
        'resistance',
        _config2.resistance,
      ),
      p,
      curProp,
      curDuration,
      curVelocity,
      curVal,
      end,
      curClippedDuration,
      tracker,
      unitFactor,
      linkedProps;
    linkedProps = _processLinkedProps(target, inertiaVars, getVal, resistance);
    for (p in inertiaVars) {
      if (!_reservedProps2[p]) {
        curProp = inertiaVars[p];
        if (!_isObject5(curProp)) {
          tracker = tracker || _getTracker(target);
          if (tracker && tracker.isTracking(p)) {
            curProp = _isNumber3(curProp)
              ? {
                  velocity: curProp,
                }
              : {
                  velocity: tracker.get(p),
                };
          } else {
            curVelocity = +curProp || 0;
            curDuration = Math.abs(curVelocity / resistance);
          }
        }
        if (_isObject5(curProp)) {
          if (_isNumber3(curProp.velocity)) {
            curVelocity = curProp.velocity;
          } else {
            tracker = tracker || _getTracker(target);
            curVelocity = tracker && tracker.isTracking(p) ? tracker.get(p) : 0;
          }
          curDuration = _clamp3(
            minDuration,
            maxDuration,
            Math.abs(
              curVelocity / _getNumOrDefault(curProp, 'resistance', resistance),
            ),
          );
          curVal = parseFloat(getVal(target, p)) || 0;
          end = curVal + _calculateChange(curVelocity, curDuration);
          if ('end' in curProp) {
            curProp = _parseEnd(
              curProp,
              linkedProps && p in linkedProps ? linkedProps : end,
              curProp.max,
              curProp.min,
              p,
              inertiaVars.radius,
            );
            if (recordEnd) {
              _processingVars === vars &&
                (_processingVars = inertiaVars = _deepClone(vars));
              inertiaVars[p] = _extend3(curProp, inertiaVars[p], 'end');
            }
          }
          if ('max' in curProp && end > +curProp.max + _tinyNum2) {
            unitFactor = curProp.unitFactor || _config2.unitFactors[p] || 1;
            curClippedDuration =
              (curVal > curProp.max && curProp.min !== curProp.max) ||
              (curVelocity * unitFactor > -15 && curVelocity * unitFactor < 45)
                ? minDuration + (maxDuration - minDuration) * 0.1
                : _calculateDuration(curVal, curProp.max, curVelocity);
            if (curClippedDuration + overshootTolerance < clippedDuration) {
              clippedDuration = curClippedDuration + overshootTolerance;
            }
          } else if ('min' in curProp && end < +curProp.min - _tinyNum2) {
            unitFactor = curProp.unitFactor || _config2.unitFactors[p] || 1;
            curClippedDuration =
              (curVal < curProp.min && curProp.min !== curProp.max) ||
              (curVelocity * unitFactor > -45 && curVelocity * unitFactor < 15)
                ? minDuration + (maxDuration - minDuration) * 0.1
                : _calculateDuration(curVal, curProp.min, curVelocity);
            if (curClippedDuration + overshootTolerance < clippedDuration) {
              clippedDuration = curClippedDuration + overshootTolerance;
            }
          }
          curClippedDuration > duration && (duration = curClippedDuration);
        }
        curDuration > duration && (duration = curDuration);
      }
    }
    duration > clippedDuration && (duration = clippedDuration);
    return duration > maxDuration
      ? maxDuration
      : duration < minDuration
      ? minDuration
      : duration;
  };
  var _initCore7 = function _initCore8() {
    gsap4 = _getGSAP5();
    if (gsap4) {
      _parseEase3 = gsap4.parseEase;
      _toArray3 = gsap4.utils.toArray;
      _getUnit2 = gsap4.utils.getUnit;
      _getCache4 = gsap4.core.getCache;
      _clamp3 = gsap4.utils.clamp;
      _power3 = _parseEase3('power3');
      _checkPointRatio = _power3(0.05);
      PropTween2 = gsap4.core.PropTween;
      gsap4.config({
        resistance: 100,
        unitFactors: {
          time: 1e3,
          totalTime: 1e3,
          progress: 1e3,
          totalProgress: 1e3,
        },
      });
      _config2 = gsap4.config();
      gsap4.registerPlugin(VelocityTracker);
      _coreInitted4 = 1;
    }
  };
  var InertiaPlugin2 = {
    version: '3.7.0',
    name: 'inertia',
    register: function register(core) {
      gsap4 = core;
      _initCore7();
    },
    init: function init4(target, vars, tween, index, targets) {
      _coreInitted4 || _initCore7();
      var tracker = _getTracker(target);
      if (vars === 'auto') {
        if (!tracker) {
          console.warn(
            'No inertia tracking on ' +
              target +
              '. InertiaPlugin.track(target) first.',
          );
          return;
        }
        vars = tracker.getAll();
      }
      this.target = target;
      this.tween = tween;
      _processingVars = vars;
      var cache = target._gsap,
        getVal = cache.get,
        dur = vars.duration,
        durIsObj = _isObject5(dur),
        preventOvershoot =
          vars.preventOvershoot || (durIsObj && dur.overshoot === 0),
        resistance = _getNumOrDefault(vars, 'resistance', _config2.resistance),
        duration = _isNumber3(dur)
          ? dur
          : _calculateTweenDuration(
              target,
              vars,
              (durIsObj && dur.max) || 10,
              (durIsObj && dur.min) || 0.2,
              durIsObj && 'overshoot' in dur
                ? +dur.overshoot
                : preventOvershoot
                ? 0
                : 1,
              true,
            ),
        p,
        curProp,
        curVal,
        unit2,
        velocity,
        change1,
        end,
        change2,
        linkedProps;
      vars = _processingVars;
      _processingVars = 0;
      linkedProps = _processLinkedProps(target, vars, getVal, resistance);
      for (p in vars) {
        if (!_reservedProps2[p]) {
          curProp = vars[p];
          _isFunction5(curProp) && (curProp = curProp(index, target, targets));
          if (_isNumber3(curProp)) {
            velocity = curProp;
          } else if (_isObject5(curProp) && !isNaN(curProp.velocity)) {
            velocity = +curProp.velocity;
          } else {
            if (tracker && tracker.isTracking(p)) {
              velocity = tracker.get(p);
            } else {
              console.warn(
                'ERROR: No velocity was defined for ' +
                  target +
                  ' property: ' +
                  p,
              );
            }
          }
          change1 = _calculateChange(velocity, duration);
          change2 = 0;
          curVal = getVal(target, p);
          unit2 = _getUnit2(curVal);
          curVal = parseFloat(curVal);
          if (_isObject5(curProp)) {
            end = curVal + change1;
            if ('end' in curProp) {
              curProp = _parseEnd(
                curProp,
                linkedProps && p in linkedProps ? linkedProps : end,
                curProp.max,
                curProp.min,
                p,
                vars.radius,
              );
            }
            if ('max' in curProp && +curProp.max < end) {
              if (preventOvershoot || curProp.preventOvershoot) {
                change1 = curProp.max - curVal;
              } else {
                change2 = curProp.max - curVal - change1;
              }
            } else if ('min' in curProp && +curProp.min > end) {
              if (preventOvershoot || curProp.preventOvershoot) {
                change1 = curProp.min - curVal;
              } else {
                change2 = curProp.min - curVal - change1;
              }
            }
          }
          this._props.push(p);
          this._pt = new PropTween2(
            this._pt,
            target,
            p,
            curVal,
            0,
            _emptyFunc5,
            0,
            cache.set(target, p, this),
          );
          this._pt.u = unit2 || 0;
          this._pt.c1 = change1;
          this._pt.c2 = change2;
        }
      }
      tween.duration(duration);
      return _bonusValidated;
    },
    render: function render(ratio, data2) {
      var pt = data2._pt;
      ratio = _power3(data2.tween._time / data2.tween._dur);
      while (pt) {
        pt.set(
          pt.t,
          pt.p,
          _round7(pt.s + pt.c1 * ratio + pt.c2 * ratio * ratio) + pt.u,
          pt.d,
          ratio,
        );
        pt = pt._next;
      }
    },
  };
  'track,untrack,isTracking,getVelocity,getByTarget'
    .split(',')
    .forEach(function (name) {
      return (InertiaPlugin2[name] = VelocityTracker[name]);
    });
  _getGSAP5() && gsap4.registerPlugin(InertiaPlugin2);

  // src/js/horizontalLoop.js
  gsapWithCSS.registerPlugin(Draggable, InertiaPlugin2);
  function horizontalLoop(items, config3) {
    items = gsapWithCSS.utils.toArray(items);
    config3 = config3 || {};
    let onChange = config3.onChange,
      lastIndex = 0,
      tl = gsapWithCSS.timeline({
        repeat: config3.repeat,
        onUpdate:
          onChange &&
          function () {
            let i = tl.closestIndex();
            if (lastIndex !== i) {
              lastIndex = i;
              onChange(items[i], i);
            }
          },
        paused: config3.paused,
        defaults: { ease: 'none' },
        onReverseComplete: () =>
          tl.totalTime(tl.rawTime() + tl.duration() * 100),
      }),
      length = items.length,
      startX = items[0].offsetLeft,
      times = [],
      widths = [],
      spaceBefore = [],
      xPercents = [],
      curIndex = 0,
      indexIsDirty = false,
      center = config3.center,
      pixelsPerSecond = (config3.speed || 1) * 100,
      snap3 =
        config3.snap === false
          ? (v) => v
          : gsapWithCSS.utils.snap(config3.snap || 1),
      timeOffset = 0,
      container =
        center === true
          ? items[0].parentNode
          : gsapWithCSS.utils.toArray(center)[0] || items[0].parentNode,
      totalWidth,
      getTotalWidth = () =>
        items[length - 1].offsetLeft +
        (xPercents[length - 1] / 100) * widths[length - 1] -
        startX +
        spaceBefore[0] +
        items[length - 1].offsetWidth *
          gsapWithCSS.getProperty(items[length - 1], 'scaleX') +
        (parseFloat(config3.paddingRight) || 0),
      populateWidths = () => {
        let b1 = container.getBoundingClientRect(),
          b2;
        items.forEach((el, i) => {
          widths[i] = parseFloat(gsapWithCSS.getProperty(el, 'width', 'px'));
          xPercents[i] = snap3(
            (parseFloat(gsapWithCSS.getProperty(el, 'x', 'px')) / widths[i]) *
              100 +
              gsapWithCSS.getProperty(el, 'xPercent'),
          );
          b2 = el.getBoundingClientRect();
          spaceBefore[i] = b2.left - (i ? b1.right : b1.left);
          b1 = b2;
        });
        gsapWithCSS.set(items, {
          xPercent: (i) => xPercents[i],
        });
        totalWidth = getTotalWidth();
      },
      timeWrap,
      populateOffsets = () => {
        timeOffset = center
          ? (tl.duration() * (container.offsetWidth / 2)) / totalWidth
          : 0;
        center &&
          times.forEach((t, i) => {
            times[i] = timeWrap(
              tl.labels['label' + i] +
                (tl.duration() * widths[i]) / 2 / totalWidth -
                timeOffset,
            );
          });
      },
      getClosest = (values, value, wrap3) => {
        let i = values.length,
          closest2 = 1e10,
          index = 0,
          d;
        while (i--) {
          d = Math.abs(values[i] - value);
          if (d > wrap3 / 2) {
            d = wrap3 - d;
          }
          if (d < closest2) {
            closest2 = d;
            index = i;
          }
        }
        return index;
      },
      populateTimeline = () => {
        let i, item, curX, distanceToStart, distanceToLoop;
        tl.clear();
        for (i = 0; i < length; i++) {
          item = items[i];
          curX = (xPercents[i] / 100) * widths[i];
          distanceToStart = item.offsetLeft + curX - startX + spaceBefore[0];
          distanceToLoop =
            distanceToStart +
            widths[i] * gsapWithCSS.getProperty(item, 'scaleX');
          tl.to(
            item,
            {
              xPercent: snap3(((curX - distanceToLoop) / widths[i]) * 100),
              duration: distanceToLoop / pixelsPerSecond,
            },
            0,
          )
            .fromTo(
              item,
              {
                xPercent: snap3(
                  ((curX - distanceToLoop + totalWidth) / widths[i]) * 100,
                ),
              },
              {
                xPercent: xPercents[i],
                duration:
                  (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
                immediateRender: false,
              },
              distanceToLoop / pixelsPerSecond,
            )
            .add('label' + i, distanceToStart / pixelsPerSecond);
          times[i] = distanceToStart / pixelsPerSecond;
        }
        timeWrap = gsapWithCSS.utils.wrap(0, tl.duration());
      },
      refresh = (deep) => {
        let progress = tl.progress();
        tl.progress(0, true);
        populateWidths();
        deep && populateTimeline();
        populateOffsets();
        deep && tl.draggable
          ? tl.time(times[curIndex], true)
          : tl.progress(progress, true);
      },
      proxy;
    gsapWithCSS.set(items, { x: 0 });
    populateWidths();
    populateTimeline();
    populateOffsets();
    window.addEventListener('resize', () => refresh(true));
    function toIndex(index, vars) {
      vars = vars || {};
      Math.abs(index - curIndex) > length / 2 &&
        (index += index > curIndex ? -length : length);
      let newIndex = gsapWithCSS.utils.wrap(0, length, index),
        time = times[newIndex];
      if (time > tl.time() !== index > curIndex && index !== curIndex) {
        time += tl.duration() * (index > curIndex ? 1 : -1);
      }
      if (time < 0 || time > tl.duration()) {
        vars.modifiers = { time: timeWrap };
      }
      curIndex = newIndex;
      vars.overwrite = true;
      gsapWithCSS.killTweensOf(proxy);
      return vars.duration === 0
        ? tl.time(timeWrap(time))
        : tl.tweenTo(time, vars);
    }
    tl.toIndex = (index, vars) => toIndex(index, vars);
    tl.closestIndex = (setCurrent) => {
      let index = getClosest(times, tl.time(), tl.duration());
      if (setCurrent) {
        curIndex = index;
        indexIsDirty = false;
      }
      return index;
    };
    tl.current = () => (indexIsDirty ? tl.closestIndex(true) : curIndex);
    tl.next = (vars) => toIndex(tl.current() + 1, vars);
    tl.previous = (vars) => toIndex(tl.current() - 1, vars);
    tl.times = times;
    tl.progress(1, true).progress(0, true);
    if (config3.reversed) {
      tl.vars.onReverseComplete();
      tl.reverse();
    }
    if (config3.draggable && typeof Draggable === 'function') {
      proxy = document.createElement('div');
      let wrap3 = gsapWithCSS.utils.wrap(0, 1),
        ratio,
        startProgress,
        draggable,
        dragSnap,
        lastSnap,
        initChangeX,
        wasPlaying,
        align = () =>
          tl.progress(
            wrap3(startProgress + (draggable.startX - draggable.x) * ratio),
          ),
        syncIndex = () => tl.closestIndex(true);
      typeof InertiaPlugin2 === 'undefined' &&
        console.warn(
          'InertiaPlugin required for momentum-based scrolling and snapping. https://greensock.com/club',
        );
      draggable = Draggable.create(proxy, {
        trigger: items[0].parentNode,
        type: 'x',
        onPressInit() {
          let x = this.x;
          gsapWithCSS.killTweensOf(tl);
          wasPlaying = !tl.paused();
          tl.pause();
          startProgress = tl.progress();
          refresh();
          ratio = 1 / totalWidth;
          initChangeX = startProgress / -ratio - x;
          gsapWithCSS.set(proxy, { x: startProgress / -ratio });
        },
        onDrag: align,
        onThrowUpdate: align,
        overshootTolerance: 0,
        inertia: true,
        snap(value) {
          if (Math.abs(startProgress / -ratio - this.x) < 10) {
            return lastSnap + initChangeX;
          }
          let time = -(value * ratio) * tl.duration(),
            wrappedTime = timeWrap(time),
            snapTime = times[getClosest(times, wrappedTime, tl.duration())],
            dif = snapTime - wrappedTime;
          Math.abs(dif) > tl.duration() / 2 &&
            (dif += dif < 0 ? tl.duration() : -tl.duration());
          lastSnap = (time + dif) / tl.duration() / -ratio;
          return lastSnap;
        },
        onRelease() {
          syncIndex();
          draggable.isThrowing && (indexIsDirty = true);
        },
        onThrowComplete: () => {
          syncIndex();
          wasPlaying && tl.play();
        },
      })[0];
      tl.draggable = draggable;
    }
    tl.closestIndex(true);
    lastIndex = curIndex;
    onChange && onChange(items[curIndex], curIndex);
    return tl;
  }

  // src/js/logos.js
  window.logos = function () {
    let marquee;
    return {
      init() {
        const logos = gsapWithCSS.utils.toArray(
          this.$el.querySelectorAll('.logo'),
        );
        let isReverse = this.$el.getAttribute('data-reverse');
        const speed = this.$el.getAttribute('data-speed');
        if (isReverse === 'true') {
          isReverse = true;
        } else {
          isReverse = false;
        }
        marquee = horizontalLoop(logos, {
          paused: false,
          draggable: false,
          speed,
          repeat: -1,
          reversed: isReverse,
        });
      },
      over() {
        marquee.pause();
      },
      out() {
        marquee.play();
      },
      resetPosition(container, width) {
        gsapWithCSS.set(container, { x: -width });
      },
    };
  };

  // src/js/hero.js
  window.hero = function () {
    return {
      init() {
        var screenH = window.innerHeight * 0.75;
        this.$el.style.height = screenH + 'px';
      },
    };
  };

  // src/js/newsletter.js
  window.newsletter = function () {
    return {
      open() {
        window._klOnsite = window._klOnsite || [];
        window._klOnsite.push(['openForm', 'TA2Bfj']);
      },
    };
  };

  // src/js/main.js
  window.Alpine = module_default;
  module_default.plugin(module_default2);
  module_default.start();
})();
/*!
 * CSSPlugin 3.7.0
 * https://greensock.com
 *
 * Copyright 2008-2021, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
 */
/*!
 * Draggable 3.7.0
 * https://greensock.com
 *
 * @license Copyright 2008-2021, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
 */
/*!
 * GSAP 3.7.0
 * https://greensock.com
 *
 * @license Copyright 2008-2021, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
 */
/*!
 * InertiaPlugin 3.7.0
 * https://greensock.com
 *
 * @license Copyright 2008-2021, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
 */
/*!
 * Splide.js
 * Version  : 4.1.4
 * License  : MIT
 * Copyright: 2022 Naotoshi Fujita
 */
/*!
 * VelocityTracker: 3.7.0
 * https://greensock.com
 *
 * Copyright 2008-2021, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
 */
/*!
 * matrix 3.7.0
 * https://greensock.com
 *
 * Copyright 2008-2021, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
 */
