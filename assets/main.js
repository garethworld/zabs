(() => {
  var lo = !1,
    fo = !1,
    kr = [],
    co = -1;
  function Kd(r) {
    Qd(r);
  }
  function Qd(r) {
    kr.includes(r) || kr.push(r), Zd();
  }
  function qu(r) {
    let t = kr.indexOf(r);
    t !== -1 && t > co && kr.splice(t, 1);
  }
  function Zd() {
    !fo && !lo && ((lo = !0), queueMicrotask(Jd));
  }
  function Jd() {
    (lo = !1), (fo = !0);
    for (let r = 0; r < kr.length; r++) kr[r](), (co = r);
    (kr.length = 0), (co = -1), (fo = !1);
  }
  var ri,
    Mr,
    ii,
    ju,
    ho = !0;
  function th(r) {
    (ho = !1), r(), (ho = !0);
  }
  function eh(r) {
    (ri = r.reactive),
      (ii = r.release),
      (Mr = (t) =>
        r.effect(t, {
          scheduler: (e) => {
            ho ? Kd(e) : e();
          },
        })),
      (ju = r.raw);
  }
  function Ru(r) {
    Mr = r;
  }
  function rh(r) {
    let t = () => {};
    return [
      (i) => {
        let n = Mr(i);
        return (
          r._x_effects ||
            ((r._x_effects = new Set()),
            (r._x_runEffects = () => {
              r._x_effects.forEach((s) => s());
            })),
          r._x_effects.add(n),
          (t = () => {
            n !== void 0 && (r._x_effects.delete(n), ii(n));
          }),
          n
        );
      },
      () => {
        t();
      },
    ];
  }
  function Ku(r, t) {
    let e = !0,
      i,
      n = Mr(() => {
        let s = r();
        JSON.stringify(s),
          e
            ? (i = s)
            : queueMicrotask(() => {
                t(s, i), (i = s);
              }),
          (e = !1);
      });
    return () => ii(n);
  }
  function $i(r, t, e = {}) {
    r.dispatchEvent(
      new CustomEvent(t, {
        detail: e,
        bubbles: !0,
        composed: !0,
        cancelable: !0,
      }),
    );
  }
  function Ze(r, t) {
    if (typeof ShadowRoot == 'function' && r instanceof ShadowRoot) {
      Array.from(r.children).forEach((n) => Ze(n, t));
      return;
    }
    let e = !1;
    if ((t(r, () => (e = !0)), e)) return;
    let i = r.firstElementChild;
    for (; i; ) Ze(i, t, !1), (i = i.nextElementSibling);
  }
  function he(r, ...t) {
    console.warn(`Alpine Warning: ${r}`, ...t);
  }
  var Mu = !1;
  function ih() {
    Mu &&
      he(
        'Alpine has already been initialized on this page. Calling Alpine.start() more than once can cause problems.',
      ),
      (Mu = !0),
      document.body ||
        he(
          "Unable to initialize. Trying to load Alpine before `<body>` is available. Did you forget to add `defer` in Alpine's `<script>` tag?",
        ),
      $i(document, 'alpine:init'),
      $i(document, 'alpine:initializing'),
      Ro(),
      oh((t) => Me(t, Ze)),
      ko((t) => Oo(t)),
      ol((t, e) => {
        Fo(t, e).forEach((i) => i());
      });
    let r = (t) => !rs(t.parentElement, !0);
    Array.from(document.querySelectorAll(Ju().join(',')))
      .filter(r)
      .forEach((t) => {
        Me(t);
      }),
      $i(document, 'alpine:initialized');
  }
  var Co = [],
    Qu = [];
  function Zu() {
    return Co.map((r) => r());
  }
  function Ju() {
    return Co.concat(Qu).map((r) => r());
  }
  function tl(r) {
    Co.push(r);
  }
  function el(r) {
    Qu.push(r);
  }
  function rs(r, t = !1) {
    return qi(r, (e) => {
      if ((t ? Ju() : Zu()).some((n) => e.matches(n))) return !0;
    });
  }
  function qi(r, t) {
    if (!!r) {
      if (t(r)) return r;
      if ((r._x_teleportBack && (r = r._x_teleportBack), !!r.parentElement))
        return qi(r.parentElement, t);
    }
  }
  function nh(r) {
    return Zu().some((t) => r.matches(t));
  }
  var rl = [];
  function sh(r) {
    rl.push(r);
  }
  function Me(r, t = Ze, e = () => {}) {
    xh(() => {
      t(r, (i, n) => {
        e(i, n),
          rl.forEach((s) => s(i, n)),
          Fo(i, i.attributes).forEach((s) => s()),
          i._x_ignore && n();
      });
    });
  }
  function Oo(r, t = Ze) {
    t(r, (e) => {
      ul(e), ah(e);
    });
  }
  var il = [],
    nl = [],
    sl = [];
  function oh(r) {
    sl.push(r);
  }
  function ko(r, t) {
    typeof t == 'function'
      ? (r._x_cleanups || (r._x_cleanups = []), r._x_cleanups.push(t))
      : ((t = r), nl.push(t));
  }
  function ol(r) {
    il.push(r);
  }
  function al(r, t, e) {
    r._x_attributeCleanups || (r._x_attributeCleanups = {}),
      r._x_attributeCleanups[t] || (r._x_attributeCleanups[t] = []),
      r._x_attributeCleanups[t].push(e);
  }
  function ul(r, t) {
    !r._x_attributeCleanups ||
      Object.entries(r._x_attributeCleanups).forEach(([e, i]) => {
        (t === void 0 || t.includes(e)) &&
          (i.forEach((n) => n()), delete r._x_attributeCleanups[e]);
      });
  }
  function ah(r) {
    if (r._x_cleanups) for (; r._x_cleanups.length; ) r._x_cleanups.pop()();
  }
  var Do = new MutationObserver(Io),
    Lo = !1;
  function Ro() {
    Do.observe(document, {
      subtree: !0,
      childList: !0,
      attributes: !0,
      attributeOldValue: !0,
    }),
      (Lo = !0);
  }
  function ll() {
    uh(), Do.disconnect(), (Lo = !1);
  }
  var Wi = [];
  function uh() {
    let r = Do.takeRecords();
    Wi.push(() => r.length > 0 && Io(r));
    let t = Wi.length;
    queueMicrotask(() => {
      if (Wi.length === t) for (; Wi.length > 0; ) Wi.shift()();
    });
  }
  function Et(r) {
    if (!Lo) return r();
    ll();
    let t = r();
    return Ro(), t;
  }
  var Mo = !1,
    Jn = [];
  function lh() {
    Mo = !0;
  }
  function fh() {
    (Mo = !1), Io(Jn), (Jn = []);
  }
  function Io(r) {
    if (Mo) {
      Jn = Jn.concat(r);
      return;
    }
    let t = new Set(),
      e = new Set(),
      i = new Map(),
      n = new Map();
    for (let s = 0; s < r.length; s++)
      if (
        !r[s].target._x_ignoreMutationObserver &&
        (r[s].type === 'childList' &&
          (r[s].addedNodes.forEach((o) => o.nodeType === 1 && t.add(o)),
          r[s].removedNodes.forEach((o) => o.nodeType === 1 && e.add(o))),
        r[s].type === 'attributes')
      ) {
        let o = r[s].target,
          a = r[s].attributeName,
          u = r[s].oldValue,
          f = () => {
            i.has(o) || i.set(o, []),
              i.get(o).push({ name: a, value: o.getAttribute(a) });
          },
          c = () => {
            n.has(o) || n.set(o, []), n.get(o).push(a);
          };
        o.hasAttribute(a) && u === null
          ? f()
          : o.hasAttribute(a)
          ? (c(), f())
          : c();
      }
    n.forEach((s, o) => {
      ul(o, s);
    }),
      i.forEach((s, o) => {
        il.forEach((a) => a(o, s));
      });
    for (let s of e) t.has(s) || (nl.forEach((o) => o(s)), Oo(s));
    t.forEach((s) => {
      (s._x_ignoreSelf = !0), (s._x_ignore = !0);
    });
    for (let s of t)
      e.has(s) ||
        !s.isConnected ||
        (delete s._x_ignoreSelf,
        delete s._x_ignore,
        sl.forEach((o) => o(s)),
        (s._x_ignore = !0),
        (s._x_ignoreSelf = !0));
    t.forEach((s) => {
      delete s._x_ignoreSelf, delete s._x_ignore;
    }),
      (t = null),
      (e = null),
      (i = null),
      (n = null);
  }
  function fl(r) {
    return Ki(ti(r));
  }
  function ji(r, t, e) {
    return (
      (r._x_dataStack = [t, ...ti(e || r)]),
      () => {
        r._x_dataStack = r._x_dataStack.filter((i) => i !== t);
      }
    );
  }
  function ti(r) {
    return r._x_dataStack
      ? r._x_dataStack
      : typeof ShadowRoot == 'function' && r instanceof ShadowRoot
      ? ti(r.host)
      : r.parentNode
      ? ti(r.parentNode)
      : [];
  }
  function Ki(r) {
    return new Proxy({ objects: r }, ch);
  }
  var ch = {
    ownKeys({ objects: r }) {
      return Array.from(new Set(r.flatMap((t) => Object.keys(t))));
    },
    has({ objects: r }, t) {
      return t == Symbol.unscopables
        ? !1
        : r.some(
            (e) =>
              Object.prototype.hasOwnProperty.call(e, t) || Reflect.has(e, t),
          );
    },
    get({ objects: r }, t, e) {
      return t == 'toJSON'
        ? dh
        : Reflect.get(r.find((i) => Reflect.has(i, t)) || {}, t, e);
    },
    set({ objects: r }, t, e, i) {
      let n =
          r.find((o) => Object.prototype.hasOwnProperty.call(o, t)) ||
          r[r.length - 1],
        s = Object.getOwnPropertyDescriptor(n, t);
      return s?.set && s?.get ? Reflect.set(n, t, e, i) : Reflect.set(n, t, e);
    },
  };
  function dh() {
    return Reflect.ownKeys(this).reduce(
      (t, e) => ((t[e] = Reflect.get(this, e)), t),
      {},
    );
  }
  function cl(r) {
    let t = (i) => typeof i == 'object' && !Array.isArray(i) && i !== null,
      e = (i, n = '') => {
        Object.entries(Object.getOwnPropertyDescriptors(i)).forEach(
          ([s, { value: o, enumerable: a }]) => {
            if (
              a === !1 ||
              o === void 0 ||
              (typeof o == 'object' && o !== null && o.__v_skip)
            )
              return;
            let u = n === '' ? s : `${n}.${s}`;
            typeof o == 'object' && o !== null && o._x_interceptor
              ? (i[s] = o.initialize(r, u, s))
              : t(o) && o !== i && !(o instanceof Element) && e(o, u);
          },
        );
      };
    return e(r);
  }
  function dl(r, t = () => {}) {
    let e = {
      initialValue: void 0,
      _x_interceptor: !0,
      initialize(i, n, s) {
        return r(
          this.initialValue,
          () => hh(i, n),
          (o) => po(i, n, o),
          n,
          s,
        );
      },
    };
    return (
      t(e),
      (i) => {
        if (typeof i == 'object' && i !== null && i._x_interceptor) {
          let n = e.initialize.bind(e);
          e.initialize = (s, o, a) => {
            let u = i.initialize(s, o, a);
            return (e.initialValue = u), n(s, o, a);
          };
        } else e.initialValue = i;
        return e;
      }
    );
  }
  function hh(r, t) {
    return t.split('.').reduce((e, i) => e[i], r);
  }
  function po(r, t, e) {
    if ((typeof t == 'string' && (t = t.split('.')), t.length === 1))
      r[t[0]] = e;
    else {
      if (t.length === 0) throw error;
      return r[t[0]] || (r[t[0]] = {}), po(r[t[0]], t.slice(1), e);
    }
  }
  var hl = {};
  function _e(r, t) {
    hl[r] = t;
  }
  function _o(r, t) {
    return (
      Object.entries(hl).forEach(([e, i]) => {
        let n = null;
        function s() {
          if (n) return n;
          {
            let [o, a] = yl(t);
            return (n = { interceptor: dl, ...o }), ko(t, a), n;
          }
        }
        Object.defineProperty(r, `$${e}`, {
          get() {
            return i(t, s());
          },
          enumerable: !1,
        });
      }),
      r
    );
  }
  function ph(r, t, e, ...i) {
    try {
      return e(...i);
    } catch (n) {
      Gi(n, r, t);
    }
  }
  function Gi(r, t, e = void 0) {
    (r = Object.assign(r ?? { message: 'No error message given.' }, {
      el: t,
      expression: e,
    })),
      console.warn(
        `Alpine Expression Error: ${r.message}

${
  e
    ? 'Expression: "' +
      e +
      `"

`
    : ''
}`,
        t,
      ),
      setTimeout(() => {
        throw r;
      }, 0);
  }
  var Qn = !0;
  function pl(r) {
    let t = Qn;
    Qn = !1;
    let e = r();
    return (Qn = t), e;
  }
  function Dr(r, t, e = {}) {
    let i;
    return Bt(r, t)((n) => (i = n), e), i;
  }
  function Bt(...r) {
    return _l(...r);
  }
  var _l = gl;
  function _h(r) {
    _l = r;
  }
  function gl(r, t) {
    let e = {};
    _o(e, r);
    let i = [e, ...ti(r)],
      n = typeof t == 'function' ? gh(i, t) : mh(i, t, r);
    return ph.bind(null, r, t, n);
  }
  function gh(r, t) {
    return (e = () => {}, { scope: i = {}, params: n = [] } = {}) => {
      let s = t.apply(Ki([i, ...r]), n);
      ts(e, s);
    };
  }
  var so = {};
  function vh(r, t) {
    if (so[r]) return so[r];
    let e = Object.getPrototypeOf(async function () {}).constructor,
      i =
        /^[\n\s]*if.*\(.*\)/.test(r.trim()) || /^(let|const)\s/.test(r.trim())
          ? `(async()=>{ ${r} })()`
          : r,
      s = (() => {
        try {
          let o = new e(
            ['__self', 'scope'],
            `with (scope) { __self.result = ${i} }; __self.finished = true; return __self.result;`,
          );
          return (
            Object.defineProperty(o, 'name', { value: `[Alpine] ${r}` }), o
          );
        } catch (o) {
          return Gi(o, t, r), Promise.resolve();
        }
      })();
    return (so[r] = s), s;
  }
  function mh(r, t, e) {
    let i = vh(t, e);
    return (n = () => {}, { scope: s = {}, params: o = [] } = {}) => {
      (i.result = void 0), (i.finished = !1);
      let a = Ki([s, ...r]);
      if (typeof i == 'function') {
        let u = i(i, a).catch((f) => Gi(f, e, t));
        i.finished
          ? (ts(n, i.result, a, o, e), (i.result = void 0))
          : u
              .then((f) => {
                ts(n, f, a, o, e);
              })
              .catch((f) => Gi(f, e, t))
              .finally(() => (i.result = void 0));
      }
    };
  }
  function ts(r, t, e, i, n) {
    if (Qn && typeof t == 'function') {
      let s = t.apply(e, i);
      s instanceof Promise
        ? s.then((o) => ts(r, o, e, i)).catch((o) => Gi(o, n, t))
        : r(s);
    } else
      typeof t == 'object' && t instanceof Promise ? t.then((s) => r(s)) : r(t);
  }
  var No = 'x-';
  function ni(r = '') {
    return No + r;
  }
  function yh(r) {
    No = r;
  }
  var go = {};
  function wt(r, t) {
    return (
      (go[r] = t),
      {
        before(e) {
          if (!go[e]) {
            console.warn(
              String.raw`Cannot find directive \`${e}\`. \`${r}\` will use the default order of execution`,
            );
            return;
          }
          let i = Or.indexOf(e);
          Or.splice(i >= 0 ? i : Or.indexOf('DEFAULT'), 0, r);
        },
      }
    );
  }
  function Fo(r, t, e) {
    if (((t = Array.from(t)), r._x_virtualDirectives)) {
      let s = Object.entries(r._x_virtualDirectives).map(([a, u]) => ({
          name: a,
          value: u,
        })),
        o = vl(s);
      (s = s.map((a) =>
        o.find((u) => u.name === a.name)
          ? { name: `x-bind:${a.name}`, value: `"${a.value}"` }
          : a,
      )),
        (t = t.concat(s));
    }
    let i = {};
    return t
      .map(wl((s, o) => (i[s] = o)))
      .filter(El)
      .map(wh(i, e))
      .sort(Th)
      .map((s) => bh(r, s));
  }
  function vl(r) {
    return Array.from(r)
      .map(wl())
      .filter((t) => !El(t));
  }
  var vo = !1,
    Yi = new Map(),
    ml = Symbol();
  function xh(r) {
    vo = !0;
    let t = Symbol();
    (ml = t), Yi.set(t, []);
    let e = () => {
        for (; Yi.get(t).length; ) Yi.get(t).shift()();
        Yi.delete(t);
      },
      i = () => {
        (vo = !1), e();
      };
    r(e), i();
  }
  function yl(r) {
    let t = [],
      e = (a) => t.push(a),
      [i, n] = rh(r);
    return (
      t.push(n),
      [
        {
          Alpine: Qi,
          effect: i,
          cleanup: e,
          evaluateLater: Bt.bind(Bt, r),
          evaluate: Dr.bind(Dr, r),
        },
        () => t.forEach((a) => a()),
      ]
    );
  }
  function bh(r, t) {
    let e = () => {},
      i = go[t.type] || e,
      [n, s] = yl(r);
    al(r, t.original, s);
    let o = () => {
      r._x_ignore ||
        r._x_ignoreSelf ||
        (i.inline && i.inline(r, t, n),
        (i = i.bind(i, r, t, n)),
        vo ? Yi.get(ml).push(i) : i());
    };
    return (o.runCleanups = s), o;
  }
  var xl =
      (r, t) =>
      ({ name: e, value: i }) => (
        e.startsWith(r) && (e = e.replace(r, t)), { name: e, value: i }
      ),
    bl = (r) => r;
  function wl(r = () => {}) {
    return ({ name: t, value: e }) => {
      let { name: i, value: n } = Tl.reduce((s, o) => o(s), {
        name: t,
        value: e,
      });
      return i !== t && r(i, t), { name: i, value: n };
    };
  }
  var Tl = [];
  function Bo(r) {
    Tl.push(r);
  }
  function El({ name: r }) {
    return Sl().test(r);
  }
  var Sl = () => new RegExp(`^${No}([^:^.]+)\\b`);
  function wh(r, t) {
    return ({ name: e, value: i }) => {
      let n = e.match(Sl()),
        s = e.match(/:([a-zA-Z0-9\-_:]+)/),
        o = e.match(/\.[^.\]]+(?=[^\]]*$)/g) || [],
        a = t || r[e] || e;
      return {
        type: n ? n[1] : null,
        value: s ? s[1] : null,
        modifiers: o.map((u) => u.replace('.', '')),
        expression: i,
        original: a,
      };
    };
  }
  var mo = 'DEFAULT',
    Or = [
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
      mo,
      'teleport',
    ];
  function Th(r, t) {
    let e = Or.indexOf(r.type) === -1 ? mo : r.type,
      i = Or.indexOf(t.type) === -1 ? mo : t.type;
    return Or.indexOf(e) - Or.indexOf(i);
  }
  var yo = [],
    Vo = !1;
  function zo(r = () => {}) {
    return (
      queueMicrotask(() => {
        Vo ||
          setTimeout(() => {
            xo();
          });
      }),
      new Promise((t) => {
        yo.push(() => {
          r(), t();
        });
      })
    );
  }
  function xo() {
    for (Vo = !1; yo.length; ) yo.shift()();
  }
  function Eh() {
    Vo = !0;
  }
  function Wo(r, t) {
    return Array.isArray(t)
      ? Iu(r, t.join(' '))
      : typeof t == 'object' && t !== null
      ? Sh(r, t)
      : typeof t == 'function'
      ? Wo(r, t())
      : Iu(r, t);
  }
  function Iu(r, t) {
    let e = (s) => s.split(' ').filter(Boolean),
      i = (s) =>
        s
          .split(' ')
          .filter((o) => !r.classList.contains(o))
          .filter(Boolean),
      n = (s) => (
        r.classList.add(...s),
        () => {
          r.classList.remove(...s);
        }
      );
    return (t = t === !0 ? (t = '') : t || ''), n(i(t));
  }
  function Sh(r, t) {
    let e = (a) => a.split(' ').filter(Boolean),
      i = Object.entries(t)
        .flatMap(([a, u]) => (u ? e(a) : !1))
        .filter(Boolean),
      n = Object.entries(t)
        .flatMap(([a, u]) => (u ? !1 : e(a)))
        .filter(Boolean),
      s = [],
      o = [];
    return (
      n.forEach((a) => {
        r.classList.contains(a) && (r.classList.remove(a), o.push(a));
      }),
      i.forEach((a) => {
        r.classList.contains(a) || (r.classList.add(a), s.push(a));
      }),
      () => {
        o.forEach((a) => r.classList.add(a)),
          s.forEach((a) => r.classList.remove(a));
      }
    );
  }
  function is(r, t) {
    return typeof t == 'object' && t !== null ? Ah(r, t) : Ph(r, t);
  }
  function Ah(r, t) {
    let e = {};
    return (
      Object.entries(t).forEach(([i, n]) => {
        (e[i] = r.style[i]),
          i.startsWith('--') || (i = Ch(i)),
          r.style.setProperty(i, n);
      }),
      setTimeout(() => {
        r.style.length === 0 && r.removeAttribute('style');
      }),
      () => {
        is(r, e);
      }
    );
  }
  function Ph(r, t) {
    let e = r.getAttribute('style', t);
    return (
      r.setAttribute('style', t),
      () => {
        r.setAttribute('style', e || '');
      }
    );
  }
  function Ch(r) {
    return r.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
  function bo(r, t = () => {}) {
    let e = !1;
    return function () {
      e ? t.apply(this, arguments) : ((e = !0), r.apply(this, arguments));
    };
  }
  wt(
    'transition',
    (r, { value: t, modifiers: e, expression: i }, { evaluate: n }) => {
      typeof i == 'function' && (i = n(i)),
        i !== !1 && (!i || typeof i == 'boolean' ? kh(r, e, t) : Oh(r, i, t));
    },
  );
  function Oh(r, t, e) {
    Al(r, Wo, ''),
      {
        enter: (n) => {
          r._x_transition.enter.during = n;
        },
        'enter-start': (n) => {
          r._x_transition.enter.start = n;
        },
        'enter-end': (n) => {
          r._x_transition.enter.end = n;
        },
        leave: (n) => {
          r._x_transition.leave.during = n;
        },
        'leave-start': (n) => {
          r._x_transition.leave.start = n;
        },
        'leave-end': (n) => {
          r._x_transition.leave.end = n;
        },
      }[e](t);
  }
  function kh(r, t, e) {
    Al(r, is);
    let i = !t.includes('in') && !t.includes('out') && !e,
      n = i || t.includes('in') || ['enter'].includes(e),
      s = i || t.includes('out') || ['leave'].includes(e);
    t.includes('in') && !i && (t = t.filter((v, m) => m < t.indexOf('out'))),
      t.includes('out') && !i && (t = t.filter((v, m) => m > t.indexOf('out')));
    let o = !t.includes('opacity') && !t.includes('scale'),
      a = o || t.includes('opacity'),
      u = o || t.includes('scale'),
      f = a ? 0 : 1,
      c = u ? Hi(t, 'scale', 95) / 100 : 1,
      d = Hi(t, 'delay', 0) / 1e3,
      p = Hi(t, 'origin', 'center'),
      l = 'opacity, transform',
      _ = Hi(t, 'duration', 150) / 1e3,
      h = Hi(t, 'duration', 75) / 1e3,
      g = 'cubic-bezier(0.4, 0.0, 0.2, 1)';
    n &&
      ((r._x_transition.enter.during = {
        transformOrigin: p,
        transitionDelay: `${d}s`,
        transitionProperty: l,
        transitionDuration: `${_}s`,
        transitionTimingFunction: g,
      }),
      (r._x_transition.enter.start = { opacity: f, transform: `scale(${c})` }),
      (r._x_transition.enter.end = { opacity: 1, transform: 'scale(1)' })),
      s &&
        ((r._x_transition.leave.during = {
          transformOrigin: p,
          transitionDelay: `${d}s`,
          transitionProperty: l,
          transitionDuration: `${h}s`,
          transitionTimingFunction: g,
        }),
        (r._x_transition.leave.start = { opacity: 1, transform: 'scale(1)' }),
        (r._x_transition.leave.end = { opacity: f, transform: `scale(${c})` }));
  }
  function Al(r, t, e = {}) {
    r._x_transition ||
      (r._x_transition = {
        enter: { during: e, start: e, end: e },
        leave: { during: e, start: e, end: e },
        in(i = () => {}, n = () => {}) {
          wo(
            r,
            t,
            {
              during: this.enter.during,
              start: this.enter.start,
              end: this.enter.end,
            },
            i,
            n,
          );
        },
        out(i = () => {}, n = () => {}) {
          wo(
            r,
            t,
            {
              during: this.leave.during,
              start: this.leave.start,
              end: this.leave.end,
            },
            i,
            n,
          );
        },
      });
  }
  window.Element.prototype._x_toggleAndCascadeWithTransitions = function (
    r,
    t,
    e,
    i,
  ) {
    let n =
        document.visibilityState === 'visible'
          ? requestAnimationFrame
          : setTimeout,
      s = () => n(e);
    if (t) {
      r._x_transition && (r._x_transition.enter || r._x_transition.leave)
        ? r._x_transition.enter &&
          (Object.entries(r._x_transition.enter.during).length ||
            Object.entries(r._x_transition.enter.start).length ||
            Object.entries(r._x_transition.enter.end).length)
          ? r._x_transition.in(e)
          : s()
        : r._x_transition
        ? r._x_transition.in(e)
        : s();
      return;
    }
    (r._x_hidePromise = r._x_transition
      ? new Promise((o, a) => {
          r._x_transition.out(
            () => {},
            () => o(i),
          ),
            r._x_transitioning &&
              r._x_transitioning.beforeCancel(() =>
                a({ isFromCancelledTransition: !0 }),
              );
        })
      : Promise.resolve(i)),
      queueMicrotask(() => {
        let o = Pl(r);
        o
          ? (o._x_hideChildren || (o._x_hideChildren = []),
            o._x_hideChildren.push(r))
          : n(() => {
              let a = (u) => {
                let f = Promise.all([
                  u._x_hidePromise,
                  ...(u._x_hideChildren || []).map(a),
                ]).then(([c]) => c());
                return delete u._x_hidePromise, delete u._x_hideChildren, f;
              };
              a(r).catch((u) => {
                if (!u.isFromCancelledTransition) throw u;
              });
            });
      });
  };
  function Pl(r) {
    let t = r.parentNode;
    if (!!t) return t._x_hidePromise ? t : Pl(t);
  }
  function wo(
    r,
    t,
    { during: e, start: i, end: n } = {},
    s = () => {},
    o = () => {},
  ) {
    if (
      (r._x_transitioning && r._x_transitioning.cancel(),
      Object.keys(e).length === 0 &&
        Object.keys(i).length === 0 &&
        Object.keys(n).length === 0)
    ) {
      s(), o();
      return;
    }
    let a, u, f;
    Dh(r, {
      start() {
        a = t(r, i);
      },
      during() {
        u = t(r, e);
      },
      before: s,
      end() {
        a(), (f = t(r, n));
      },
      after: o,
      cleanup() {
        u(), f();
      },
    });
  }
  function Dh(r, t) {
    let e,
      i,
      n,
      s = bo(() => {
        Et(() => {
          (e = !0),
            i || t.before(),
            n || (t.end(), xo()),
            t.after(),
            r.isConnected && t.cleanup(),
            delete r._x_transitioning;
        });
      });
    (r._x_transitioning = {
      beforeCancels: [],
      beforeCancel(o) {
        this.beforeCancels.push(o);
      },
      cancel: bo(function () {
        for (; this.beforeCancels.length; ) this.beforeCancels.shift()();
        s();
      }),
      finish: s,
    }),
      Et(() => {
        t.start(), t.during();
      }),
      Eh(),
      requestAnimationFrame(() => {
        if (e) return;
        let o =
            Number(
              getComputedStyle(r)
                .transitionDuration.replace(/,.*/, '')
                .replace('s', ''),
            ) * 1e3,
          a =
            Number(
              getComputedStyle(r)
                .transitionDelay.replace(/,.*/, '')
                .replace('s', ''),
            ) * 1e3;
        o === 0 &&
          (o =
            Number(getComputedStyle(r).animationDuration.replace('s', '')) *
            1e3),
          Et(() => {
            t.before();
          }),
          (i = !0),
          requestAnimationFrame(() => {
            e ||
              (Et(() => {
                t.end();
              }),
              xo(),
              setTimeout(r._x_transitioning.finish, o + a),
              (n = !0));
          });
      });
  }
  function Hi(r, t, e) {
    if (r.indexOf(t) === -1) return e;
    let i = r[r.indexOf(t) + 1];
    if (!i || (t === 'scale' && isNaN(i))) return e;
    if (t === 'duration' || t === 'delay') {
      let n = i.match(/([0-9]+)ms/);
      if (n) return n[1];
    }
    return t === 'origin' &&
      ['top', 'right', 'left', 'center', 'bottom'].includes(r[r.indexOf(t) + 2])
      ? [i, r[r.indexOf(t) + 2]].join(' ')
      : i;
  }
  var Je = !1;
  function Ir(r, t = () => {}) {
    return (...e) => (Je ? t(...e) : r(...e));
  }
  function Lh(r) {
    return (...t) => Je && r(...t);
  }
  var Cl = [];
  function ns(r) {
    Cl.push(r);
  }
  function Rh(r, t) {
    Cl.forEach((e) => e(r, t)),
      (Je = !0),
      Ol(() => {
        Me(t, (e, i) => {
          i(e, () => {});
        });
      }),
      (Je = !1);
  }
  var To = !1;
  function Mh(r, t) {
    t._x_dataStack || (t._x_dataStack = r._x_dataStack),
      (Je = !0),
      (To = !0),
      Ol(() => {
        Ih(t);
      }),
      (Je = !1),
      (To = !1);
  }
  function Ih(r) {
    let t = !1;
    Me(r, (i, n) => {
      Ze(i, (s, o) => {
        if (t && nh(s)) return o();
        (t = !0), n(s, o);
      });
    });
  }
  function Ol(r) {
    let t = Mr;
    Ru((e, i) => {
      let n = t(e);
      return ii(n), () => {};
    }),
      r(),
      Ru(t);
  }
  function kl(r, t, e, i = []) {
    switch (
      (r._x_bindings || (r._x_bindings = ri({})),
      (r._x_bindings[t] = e),
      (t = i.includes('camel') ? Xh(t) : t),
      t)
    ) {
      case 'value':
        Nh(r, e);
        break;
      case 'style':
        Bh(r, e);
        break;
      case 'class':
        Fh(r, e);
        break;
      case 'selected':
      case 'checked':
        Vh(r, t, e);
        break;
      default:
        Dl(r, t, e);
        break;
    }
  }
  function Nh(r, t) {
    if (r.type === 'radio')
      r.attributes.value === void 0 && (r.value = t),
        window.fromModel &&
          (typeof t == 'boolean'
            ? (r.checked = Zn(r.value) === t)
            : (r.checked = Nu(r.value, t)));
    else if (r.type === 'checkbox')
      Number.isInteger(t)
        ? (r.value = t)
        : !Array.isArray(t) &&
          typeof t != 'boolean' &&
          ![null, void 0].includes(t)
        ? (r.value = String(t))
        : Array.isArray(t)
        ? (r.checked = t.some((e) => Nu(e, r.value)))
        : (r.checked = !!t);
    else if (r.tagName === 'SELECT') Hh(r, t);
    else {
      if (r.value === t) return;
      r.value = t === void 0 ? '' : t;
    }
  }
  function Fh(r, t) {
    r._x_undoAddedClasses && r._x_undoAddedClasses(),
      (r._x_undoAddedClasses = Wo(r, t));
  }
  function Bh(r, t) {
    r._x_undoAddedStyles && r._x_undoAddedStyles(),
      (r._x_undoAddedStyles = is(r, t));
  }
  function Vh(r, t, e) {
    Dl(r, t, e), Wh(r, t, e);
  }
  function Dl(r, t, e) {
    [null, void 0, !1].includes(e) && Yh(t)
      ? r.removeAttribute(t)
      : (Ll(t) && (e = t), zh(r, t, e));
  }
  function zh(r, t, e) {
    r.getAttribute(t) != e && r.setAttribute(t, e);
  }
  function Wh(r, t, e) {
    r[t] !== e && (r[t] = e);
  }
  function Hh(r, t) {
    let e = [].concat(t).map((i) => i + '');
    Array.from(r.options).forEach((i) => {
      i.selected = e.includes(i.value);
    });
  }
  function Xh(r) {
    return r.toLowerCase().replace(/-(\w)/g, (t, e) => e.toUpperCase());
  }
  function Nu(r, t) {
    return r == t;
  }
  function Zn(r) {
    return [1, '1', 'true', 'on', 'yes', !0].includes(r)
      ? !0
      : [0, '0', 'false', 'off', 'no', !1].includes(r)
      ? !1
      : r
      ? Boolean(r)
      : null;
  }
  function Ll(r) {
    return [
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
    ].includes(r);
  }
  function Yh(r) {
    return ![
      'aria-pressed',
      'aria-checked',
      'aria-expanded',
      'aria-selected',
    ].includes(r);
  }
  function $h(r, t, e) {
    return r._x_bindings && r._x_bindings[t] !== void 0
      ? r._x_bindings[t]
      : Rl(r, t, e);
  }
  function Uh(r, t, e, i = !0) {
    if (r._x_bindings && r._x_bindings[t] !== void 0) return r._x_bindings[t];
    if (r._x_inlineBindings && r._x_inlineBindings[t] !== void 0) {
      let n = r._x_inlineBindings[t];
      return (n.extract = i), pl(() => Dr(r, n.expression));
    }
    return Rl(r, t, e);
  }
  function Rl(r, t, e) {
    let i = r.getAttribute(t);
    return i === null
      ? typeof e == 'function'
        ? e()
        : e
      : i === ''
      ? !0
      : Ll(t)
      ? !![t, 'true'].includes(i)
      : i;
  }
  function Ml(r, t) {
    var e;
    return function () {
      var i = this,
        n = arguments,
        s = function () {
          (e = null), r.apply(i, n);
        };
      clearTimeout(e), (e = setTimeout(s, t));
    };
  }
  function Il(r, t) {
    let e;
    return function () {
      let i = this,
        n = arguments;
      e || (r.apply(i, n), (e = !0), setTimeout(() => (e = !1), t));
    };
  }
  function Nl({ get: r, set: t }, { get: e, set: i }) {
    let n = !0,
      s,
      o,
      a = Mr(() => {
        let u = r(),
          f = e();
        if (n) i(oo(u)), (n = !1);
        else {
          let c = JSON.stringify(u),
            d = JSON.stringify(f);
          c !== s ? i(oo(u)) : c !== d && t(oo(f));
        }
        (s = JSON.stringify(r())), (o = JSON.stringify(e()));
      });
    return () => {
      ii(a);
    };
  }
  function oo(r) {
    return typeof r == 'object' ? JSON.parse(JSON.stringify(r)) : r;
  }
  function Gh(r) {
    (Array.isArray(r) ? r : [r]).forEach((e) => e(Qi));
  }
  var Cr = {},
    Fu = !1;
  function qh(r, t) {
    if ((Fu || ((Cr = ri(Cr)), (Fu = !0)), t === void 0)) return Cr[r];
    (Cr[r] = t),
      typeof t == 'object' &&
        t !== null &&
        t.hasOwnProperty('init') &&
        typeof t.init == 'function' &&
        Cr[r].init(),
      cl(Cr[r]);
  }
  function jh() {
    return Cr;
  }
  var Fl = {};
  function Kh(r, t) {
    let e = typeof t != 'function' ? () => t : t;
    return r instanceof Element ? Bl(r, e()) : ((Fl[r] = e), () => {});
  }
  function Qh(r) {
    return (
      Object.entries(Fl).forEach(([t, e]) => {
        Object.defineProperty(r, t, {
          get() {
            return (...i) => e(...i);
          },
        });
      }),
      r
    );
  }
  function Bl(r, t, e) {
    let i = [];
    for (; i.length; ) i.pop()();
    let n = Object.entries(t).map(([o, a]) => ({ name: o, value: a })),
      s = vl(n);
    return (
      (n = n.map((o) =>
        s.find((a) => a.name === o.name)
          ? { name: `x-bind:${o.name}`, value: `"${o.value}"` }
          : o,
      )),
      Fo(r, n, e).map((o) => {
        i.push(o.runCleanups), o();
      }),
      () => {
        for (; i.length; ) i.pop()();
      }
    );
  }
  var Vl = {};
  function Zh(r, t) {
    Vl[r] = t;
  }
  function Jh(r, t) {
    return (
      Object.entries(Vl).forEach(([e, i]) => {
        Object.defineProperty(r, e, {
          get() {
            return (...n) => i.bind(t)(...n);
          },
          enumerable: !1,
        });
      }),
      r
    );
  }
  var tp = {
      get reactive() {
        return ri;
      },
      get release() {
        return ii;
      },
      get effect() {
        return Mr;
      },
      get raw() {
        return ju;
      },
      version: '3.13.8',
      flushAndStopDeferringMutations: fh,
      dontAutoEvaluateFunctions: pl,
      disableEffectScheduling: th,
      startObservingMutations: Ro,
      stopObservingMutations: ll,
      setReactivityEngine: eh,
      onAttributeRemoved: al,
      onAttributesAdded: ol,
      closestDataStack: ti,
      skipDuringClone: Ir,
      onlyDuringClone: Lh,
      addRootSelector: tl,
      addInitSelector: el,
      interceptClone: ns,
      addScopeToNode: ji,
      deferMutations: lh,
      mapAttributes: Bo,
      evaluateLater: Bt,
      interceptInit: sh,
      setEvaluator: _h,
      mergeProxies: Ki,
      extractProp: Uh,
      findClosest: qi,
      onElRemoved: ko,
      closestRoot: rs,
      destroyTree: Oo,
      interceptor: dl,
      transition: wo,
      setStyles: is,
      mutateDom: Et,
      directive: wt,
      entangle: Nl,
      throttle: Il,
      debounce: Ml,
      evaluate: Dr,
      initTree: Me,
      nextTick: zo,
      prefixed: ni,
      prefix: yh,
      plugin: Gh,
      magic: _e,
      store: qh,
      start: ih,
      clone: Mh,
      cloneNode: Rh,
      bound: $h,
      $data: fl,
      watch: Ku,
      walk: Ze,
      data: Zh,
      bind: Kh,
    },
    Qi = tp;
  function zl(r, t) {
    let e = Object.create(null),
      i = r.split(',');
    for (let n = 0; n < i.length; n++) e[i[n]] = !0;
    return t ? (n) => !!e[n.toLowerCase()] : (n) => !!e[n];
  }
  var ep =
      'itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly',
    Pm = zl(
      ep +
        ',async,autofocus,autoplay,controls,default,defer,disabled,hidden,loop,open,required,reversed,scoped,seamless,checked,muted,multiple,selected',
    ),
    rp = Object.freeze({}),
    Cm = Object.freeze([]),
    ip = Object.prototype.hasOwnProperty,
    ss = (r, t) => ip.call(r, t),
    Lr = Array.isArray,
    Ui = (r) => Wl(r) === '[object Map]',
    np = (r) => typeof r == 'string',
    Ho = (r) => typeof r == 'symbol',
    os = (r) => r !== null && typeof r == 'object',
    sp = Object.prototype.toString,
    Wl = (r) => sp.call(r),
    Hl = (r) => Wl(r).slice(8, -1),
    Xo = (r) =>
      np(r) && r !== 'NaN' && r[0] !== '-' && '' + parseInt(r, 10) === r,
    as = (r) => {
      let t = Object.create(null);
      return (e) => t[e] || (t[e] = r(e));
    },
    op = /-(\w)/g,
    Om = as((r) => r.replace(op, (t, e) => (e ? e.toUpperCase() : ''))),
    ap = /\B([A-Z])/g,
    km = as((r) => r.replace(ap, '-$1').toLowerCase()),
    Xl = as((r) => r.charAt(0).toUpperCase() + r.slice(1)),
    Dm = as((r) => (r ? `on${Xl(r)}` : '')),
    Yl = (r, t) => r !== t && (r === r || t === t),
    Eo = new WeakMap(),
    Xi = [],
    Ee,
    Rr = Symbol('iterate'),
    So = Symbol('Map key iterate');
  function up(r) {
    return r && r._isEffect === !0;
  }
  function lp(r, t = rp) {
    up(r) && (r = r.raw);
    let e = dp(r, t);
    return t.lazy || e(), e;
  }
  function fp(r) {
    r.active &&
      ($l(r), r.options.onStop && r.options.onStop(), (r.active = !1));
  }
  var cp = 0;
  function dp(r, t) {
    let e = function () {
      if (!e.active) return r();
      if (!Xi.includes(e)) {
        $l(e);
        try {
          return pp(), Xi.push(e), (Ee = e), r();
        } finally {
          Xi.pop(), Ul(), (Ee = Xi[Xi.length - 1]);
        }
      }
    };
    return (
      (e.id = cp++),
      (e.allowRecurse = !!t.allowRecurse),
      (e._isEffect = !0),
      (e.active = !0),
      (e.raw = r),
      (e.deps = []),
      (e.options = t),
      e
    );
  }
  function $l(r) {
    let { deps: t } = r;
    if (t.length) {
      for (let e = 0; e < t.length; e++) t[e].delete(r);
      t.length = 0;
    }
  }
  var ei = !0,
    Yo = [];
  function hp() {
    Yo.push(ei), (ei = !1);
  }
  function pp() {
    Yo.push(ei), (ei = !0);
  }
  function Ul() {
    let r = Yo.pop();
    ei = r === void 0 ? !0 : r;
  }
  function pe(r, t, e) {
    if (!ei || Ee === void 0) return;
    let i = Eo.get(r);
    i || Eo.set(r, (i = new Map()));
    let n = i.get(e);
    n || i.set(e, (n = new Set())),
      n.has(Ee) ||
        (n.add(Ee),
        Ee.deps.push(n),
        Ee.options.onTrack &&
          Ee.options.onTrack({ effect: Ee, target: r, type: t, key: e }));
  }
  function tr(r, t, e, i, n, s) {
    let o = Eo.get(r);
    if (!o) return;
    let a = new Set(),
      u = (c) => {
        c &&
          c.forEach((d) => {
            (d !== Ee || d.allowRecurse) && a.add(d);
          });
      };
    if (t === 'clear') o.forEach(u);
    else if (e === 'length' && Lr(r))
      o.forEach((c, d) => {
        (d === 'length' || d >= i) && u(c);
      });
    else
      switch ((e !== void 0 && u(o.get(e)), t)) {
        case 'add':
          Lr(r)
            ? Xo(e) && u(o.get('length'))
            : (u(o.get(Rr)), Ui(r) && u(o.get(So)));
          break;
        case 'delete':
          Lr(r) || (u(o.get(Rr)), Ui(r) && u(o.get(So)));
          break;
        case 'set':
          Ui(r) && u(o.get(Rr));
          break;
      }
    let f = (c) => {
      c.options.onTrigger &&
        c.options.onTrigger({
          effect: c,
          target: r,
          key: e,
          type: t,
          newValue: i,
          oldValue: n,
          oldTarget: s,
        }),
        c.options.scheduler ? c.options.scheduler(c) : c();
    };
    a.forEach(f);
  }
  var _p = zl('__proto__,__v_isRef,__isVue'),
    Gl = new Set(
      Object.getOwnPropertyNames(Symbol)
        .map((r) => Symbol[r])
        .filter(Ho),
    ),
    gp = ql(),
    vp = ql(!0),
    Bu = mp();
  function mp() {
    let r = {};
    return (
      ['includes', 'indexOf', 'lastIndexOf'].forEach((t) => {
        r[t] = function (...e) {
          let i = pt(this);
          for (let s = 0, o = this.length; s < o; s++) pe(i, 'get', s + '');
          let n = i[t](...e);
          return n === -1 || n === !1 ? i[t](...e.map(pt)) : n;
        };
      }),
      ['push', 'pop', 'shift', 'unshift', 'splice'].forEach((t) => {
        r[t] = function (...e) {
          hp();
          let i = pt(this)[t].apply(this, e);
          return Ul(), i;
        };
      }),
      r
    );
  }
  function ql(r = !1, t = !1) {
    return function (i, n, s) {
      if (n === '__v_isReactive') return !r;
      if (n === '__v_isReadonly') return r;
      if (n === '__v_raw' && s === (r ? (t ? Mp : Zl) : t ? Rp : Ql).get(i))
        return i;
      let o = Lr(i);
      if (!r && o && ss(Bu, n)) return Reflect.get(Bu, n, s);
      let a = Reflect.get(i, n, s);
      return (Ho(n) ? Gl.has(n) : _p(n)) || (r || pe(i, 'get', n), t)
        ? a
        : Ao(a)
        ? !o || !Xo(n)
          ? a.value
          : a
        : os(a)
        ? r
          ? Jl(a)
          : qo(a)
        : a;
    };
  }
  var yp = xp();
  function xp(r = !1) {
    return function (e, i, n, s) {
      let o = e[i];
      if (!r && ((n = pt(n)), (o = pt(o)), !Lr(e) && Ao(o) && !Ao(n)))
        return (o.value = n), !0;
      let a = Lr(e) && Xo(i) ? Number(i) < e.length : ss(e, i),
        u = Reflect.set(e, i, n, s);
      return (
        e === pt(s) &&
          (a ? Yl(n, o) && tr(e, 'set', i, n, o) : tr(e, 'add', i, n)),
        u
      );
    };
  }
  function bp(r, t) {
    let e = ss(r, t),
      i = r[t],
      n = Reflect.deleteProperty(r, t);
    return n && e && tr(r, 'delete', t, void 0, i), n;
  }
  function wp(r, t) {
    let e = Reflect.has(r, t);
    return (!Ho(t) || !Gl.has(t)) && pe(r, 'has', t), e;
  }
  function Tp(r) {
    return pe(r, 'iterate', Lr(r) ? 'length' : Rr), Reflect.ownKeys(r);
  }
  var Ep = { get: gp, set: yp, deleteProperty: bp, has: wp, ownKeys: Tp },
    Sp = {
      get: vp,
      set(r, t) {
        return (
          console.warn(
            `Set operation on key "${String(t)}" failed: target is readonly.`,
            r,
          ),
          !0
        );
      },
      deleteProperty(r, t) {
        return (
          console.warn(
            `Delete operation on key "${String(
              t,
            )}" failed: target is readonly.`,
            r,
          ),
          !0
        );
      },
    },
    $o = (r) => (os(r) ? qo(r) : r),
    Uo = (r) => (os(r) ? Jl(r) : r),
    Go = (r) => r,
    us = (r) => Reflect.getPrototypeOf(r);
  function Un(r, t, e = !1, i = !1) {
    r = r.__v_raw;
    let n = pt(r),
      s = pt(t);
    t !== s && !e && pe(n, 'get', t), !e && pe(n, 'get', s);
    let { has: o } = us(n),
      a = i ? Go : e ? Uo : $o;
    if (o.call(n, t)) return a(r.get(t));
    if (o.call(n, s)) return a(r.get(s));
    r !== n && r.get(t);
  }
  function Gn(r, t = !1) {
    let e = this.__v_raw,
      i = pt(e),
      n = pt(r);
    return (
      r !== n && !t && pe(i, 'has', r),
      !t && pe(i, 'has', n),
      r === n ? e.has(r) : e.has(r) || e.has(n)
    );
  }
  function qn(r, t = !1) {
    return (
      (r = r.__v_raw), !t && pe(pt(r), 'iterate', Rr), Reflect.get(r, 'size', r)
    );
  }
  function Vu(r) {
    r = pt(r);
    let t = pt(this);
    return us(t).has.call(t, r) || (t.add(r), tr(t, 'add', r, r)), this;
  }
  function zu(r, t) {
    t = pt(t);
    let e = pt(this),
      { has: i, get: n } = us(e),
      s = i.call(e, r);
    s ? Kl(e, i, r) : ((r = pt(r)), (s = i.call(e, r)));
    let o = n.call(e, r);
    return (
      e.set(r, t),
      s ? Yl(t, o) && tr(e, 'set', r, t, o) : tr(e, 'add', r, t),
      this
    );
  }
  function Wu(r) {
    let t = pt(this),
      { has: e, get: i } = us(t),
      n = e.call(t, r);
    n ? Kl(t, e, r) : ((r = pt(r)), (n = e.call(t, r)));
    let s = i ? i.call(t, r) : void 0,
      o = t.delete(r);
    return n && tr(t, 'delete', r, void 0, s), o;
  }
  function Hu() {
    let r = pt(this),
      t = r.size !== 0,
      e = Ui(r) ? new Map(r) : new Set(r),
      i = r.clear();
    return t && tr(r, 'clear', void 0, void 0, e), i;
  }
  function jn(r, t) {
    return function (i, n) {
      let s = this,
        o = s.__v_raw,
        a = pt(o),
        u = t ? Go : r ? Uo : $o;
      return (
        !r && pe(a, 'iterate', Rr),
        o.forEach((f, c) => i.call(n, u(f), u(c), s))
      );
    };
  }
  function Kn(r, t, e) {
    return function (...i) {
      let n = this.__v_raw,
        s = pt(n),
        o = Ui(s),
        a = r === 'entries' || (r === Symbol.iterator && o),
        u = r === 'keys' && o,
        f = n[r](...i),
        c = e ? Go : t ? Uo : $o;
      return (
        !t && pe(s, 'iterate', u ? So : Rr),
        {
          next() {
            let { value: d, done: p } = f.next();
            return p
              ? { value: d, done: p }
              : { value: a ? [c(d[0]), c(d[1])] : c(d), done: p };
          },
          [Symbol.iterator]() {
            return this;
          },
        }
      );
    };
  }
  function Qe(r) {
    return function (...t) {
      {
        let e = t[0] ? `on key "${t[0]}" ` : '';
        console.warn(
          `${Xl(r)} operation ${e}failed: target is readonly.`,
          pt(this),
        );
      }
      return r === 'delete' ? !1 : this;
    };
  }
  function Ap() {
    let r = {
        get(s) {
          return Un(this, s);
        },
        get size() {
          return qn(this);
        },
        has: Gn,
        add: Vu,
        set: zu,
        delete: Wu,
        clear: Hu,
        forEach: jn(!1, !1),
      },
      t = {
        get(s) {
          return Un(this, s, !1, !0);
        },
        get size() {
          return qn(this);
        },
        has: Gn,
        add: Vu,
        set: zu,
        delete: Wu,
        clear: Hu,
        forEach: jn(!1, !0),
      },
      e = {
        get(s) {
          return Un(this, s, !0);
        },
        get size() {
          return qn(this, !0);
        },
        has(s) {
          return Gn.call(this, s, !0);
        },
        add: Qe('add'),
        set: Qe('set'),
        delete: Qe('delete'),
        clear: Qe('clear'),
        forEach: jn(!0, !1),
      },
      i = {
        get(s) {
          return Un(this, s, !0, !0);
        },
        get size() {
          return qn(this, !0);
        },
        has(s) {
          return Gn.call(this, s, !0);
        },
        add: Qe('add'),
        set: Qe('set'),
        delete: Qe('delete'),
        clear: Qe('clear'),
        forEach: jn(!0, !0),
      };
    return (
      ['keys', 'values', 'entries', Symbol.iterator].forEach((s) => {
        (r[s] = Kn(s, !1, !1)),
          (e[s] = Kn(s, !0, !1)),
          (t[s] = Kn(s, !1, !0)),
          (i[s] = Kn(s, !0, !0));
      }),
      [r, e, t, i]
    );
  }
  var [Pp, Cp, Op, kp] = Ap();
  function jl(r, t) {
    let e = t ? (r ? kp : Op) : r ? Cp : Pp;
    return (i, n, s) =>
      n === '__v_isReactive'
        ? !r
        : n === '__v_isReadonly'
        ? r
        : n === '__v_raw'
        ? i
        : Reflect.get(ss(e, n) && n in i ? e : i, n, s);
  }
  var Dp = { get: jl(!1, !1) },
    Lp = { get: jl(!0, !1) };
  function Kl(r, t, e) {
    let i = pt(e);
    if (i !== e && t.call(r, i)) {
      let n = Hl(r);
      console.warn(
        `Reactive ${n} contains both the raw and reactive versions of the same object${
          n === 'Map' ? ' as keys' : ''
        }, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`,
      );
    }
  }
  var Ql = new WeakMap(),
    Rp = new WeakMap(),
    Zl = new WeakMap(),
    Mp = new WeakMap();
  function Ip(r) {
    switch (r) {
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
  function Np(r) {
    return r.__v_skip || !Object.isExtensible(r) ? 0 : Ip(Hl(r));
  }
  function qo(r) {
    return r && r.__v_isReadonly ? r : tf(r, !1, Ep, Dp, Ql);
  }
  function Jl(r) {
    return tf(r, !0, Sp, Lp, Zl);
  }
  function tf(r, t, e, i, n) {
    if (!os(r))
      return console.warn(`value cannot be made reactive: ${String(r)}`), r;
    if (r.__v_raw && !(t && r.__v_isReactive)) return r;
    let s = n.get(r);
    if (s) return s;
    let o = Np(r);
    if (o === 0) return r;
    let a = new Proxy(r, o === 2 ? i : e);
    return n.set(r, a), a;
  }
  function pt(r) {
    return (r && pt(r.__v_raw)) || r;
  }
  function Ao(r) {
    return Boolean(r && r.__v_isRef === !0);
  }
  _e('nextTick', () => zo);
  _e('dispatch', (r) => $i.bind($i, r));
  _e('watch', (r, { evaluateLater: t, cleanup: e }) => (i, n) => {
    let s = t(i),
      a = Ku(() => {
        let u;
        return s((f) => (u = f)), u;
      }, n);
    e(a);
  });
  _e('store', jh);
  _e('data', (r) => fl(r));
  _e('root', (r) => rs(r));
  _e(
    'refs',
    (r) => (r._x_refs_proxy || (r._x_refs_proxy = Ki(Fp(r))), r._x_refs_proxy),
  );
  function Fp(r) {
    let t = [];
    return (
      qi(r, (e) => {
        e._x_refs && t.push(e._x_refs);
      }),
      t
    );
  }
  var ao = {};
  function ef(r) {
    return ao[r] || (ao[r] = 0), ++ao[r];
  }
  function Bp(r, t) {
    return qi(r, (e) => {
      if (e._x_ids && e._x_ids[t]) return !0;
    });
  }
  function Vp(r, t) {
    r._x_ids || (r._x_ids = {}), r._x_ids[t] || (r._x_ids[t] = ef(t));
  }
  _e('id', (r, { cleanup: t }) => (e, i = null) => {
    let n = `${e}${i ? `-${i}` : ''}`;
    return zp(r, n, t, () => {
      let s = Bp(r, e),
        o = s ? s._x_ids[e] : ef(e);
      return i ? `${e}-${o}-${i}` : `${e}-${o}`;
    });
  });
  ns((r, t) => {
    r._x_id && (t._x_id = r._x_id);
  });
  function zp(r, t, e, i) {
    if ((r._x_id || (r._x_id = {}), r._x_id[t])) return r._x_id[t];
    let n = i();
    return (
      (r._x_id[t] = n),
      e(() => {
        delete r._x_id[t];
      }),
      n
    );
  }
  _e('el', (r) => r);
  rf('Focus', 'focus', 'focus');
  rf('Persist', 'persist', 'persist');
  function rf(r, t, e) {
    _e(t, (i) =>
      he(
        `You can't use [$${t}] without first installing the "${r}" plugin here: https://alpinejs.dev/plugins/${e}`,
        i,
      ),
    );
  }
  wt(
    'modelable',
    (r, { expression: t }, { effect: e, evaluateLater: i, cleanup: n }) => {
      let s = i(t),
        o = () => {
          let c;
          return s((d) => (c = d)), c;
        },
        a = i(`${t} = __placeholder`),
        u = (c) => a(() => {}, { scope: { __placeholder: c } }),
        f = o();
      u(f),
        queueMicrotask(() => {
          if (!r._x_model) return;
          r._x_removeModelListeners.default();
          let c = r._x_model.get,
            d = r._x_model.set,
            p = Nl(
              {
                get() {
                  return c();
                },
                set(l) {
                  d(l);
                },
              },
              {
                get() {
                  return o();
                },
                set(l) {
                  u(l);
                },
              },
            );
          n(p);
        });
    },
  );
  wt('teleport', (r, { modifiers: t, expression: e }, { cleanup: i }) => {
    r.tagName.toLowerCase() !== 'template' &&
      he('x-teleport can only be used on a <template> tag', r);
    let n = Xu(e),
      s = r.content.cloneNode(!0).firstElementChild;
    (r._x_teleport = s),
      (s._x_teleportBack = r),
      r.setAttribute('data-teleport-template', !0),
      s.setAttribute('data-teleport-target', !0),
      r._x_forwardEvents &&
        r._x_forwardEvents.forEach((a) => {
          s.addEventListener(a, (u) => {
            u.stopPropagation(), r.dispatchEvent(new u.constructor(u.type, u));
          });
        }),
      ji(s, {}, r);
    let o = (a, u, f) => {
      f.includes('prepend')
        ? u.parentNode.insertBefore(a, u)
        : f.includes('append')
        ? u.parentNode.insertBefore(a, u.nextSibling)
        : u.appendChild(a);
    };
    Et(() => {
      o(s, n, t), Me(s), (s._x_ignore = !0);
    }),
      (r._x_teleportPutBack = () => {
        let a = Xu(e);
        Et(() => {
          o(r._x_teleport, a, t);
        });
      }),
      i(() => s.remove());
  });
  var Wp = document.createElement('div');
  function Xu(r) {
    let t = Ir(
      () => document.querySelector(r),
      () => Wp,
    )();
    return t || he(`Cannot find x-teleport element for selector: "${r}"`), t;
  }
  var nf = () => {};
  nf.inline = (r, { modifiers: t }, { cleanup: e }) => {
    t.includes('self') ? (r._x_ignoreSelf = !0) : (r._x_ignore = !0),
      e(() => {
        t.includes('self') ? delete r._x_ignoreSelf : delete r._x_ignore;
      });
  };
  wt('ignore', nf);
  wt(
    'effect',
    Ir((r, { expression: t }, { effect: e }) => {
      e(Bt(r, t));
    }),
  );
  function Po(r, t, e, i) {
    let n = r,
      s = (u) => i(u),
      o = {},
      a = (u, f) => (c) => f(u, c);
    if (
      (e.includes('dot') && (t = Hp(t)),
      e.includes('camel') && (t = Xp(t)),
      e.includes('passive') && (o.passive = !0),
      e.includes('capture') && (o.capture = !0),
      e.includes('window') && (n = window),
      e.includes('document') && (n = document),
      e.includes('debounce'))
    ) {
      let u = e[e.indexOf('debounce') + 1] || 'invalid-wait',
        f = es(u.split('ms')[0]) ? Number(u.split('ms')[0]) : 250;
      s = Ml(s, f);
    }
    if (e.includes('throttle')) {
      let u = e[e.indexOf('throttle') + 1] || 'invalid-wait',
        f = es(u.split('ms')[0]) ? Number(u.split('ms')[0]) : 250;
      s = Il(s, f);
    }
    return (
      e.includes('prevent') &&
        (s = a(s, (u, f) => {
          f.preventDefault(), u(f);
        })),
      e.includes('stop') &&
        (s = a(s, (u, f) => {
          f.stopPropagation(), u(f);
        })),
      e.includes('self') &&
        (s = a(s, (u, f) => {
          f.target === r && u(f);
        })),
      (e.includes('away') || e.includes('outside')) &&
        ((n = document),
        (s = a(s, (u, f) => {
          r.contains(f.target) ||
            (f.target.isConnected !== !1 &&
              ((r.offsetWidth < 1 && r.offsetHeight < 1) ||
                (r._x_isShown !== !1 && u(f))));
        }))),
      e.includes('once') &&
        (s = a(s, (u, f) => {
          u(f), n.removeEventListener(t, s, o);
        })),
      (s = a(s, (u, f) => {
        ($p(t) && Up(f, e)) || u(f);
      })),
      n.addEventListener(t, s, o),
      () => {
        n.removeEventListener(t, s, o);
      }
    );
  }
  function Hp(r) {
    return r.replace(/-/g, '.');
  }
  function Xp(r) {
    return r.toLowerCase().replace(/-(\w)/g, (t, e) => e.toUpperCase());
  }
  function es(r) {
    return !Array.isArray(r) && !isNaN(r);
  }
  function Yp(r) {
    return [' ', '_'].includes(r)
      ? r
      : r
          .replace(/([a-z])([A-Z])/g, '$1-$2')
          .replace(/[_\s]/, '-')
          .toLowerCase();
  }
  function $p(r) {
    return ['keydown', 'keyup'].includes(r);
  }
  function Up(r, t) {
    let e = t.filter(
      (s) =>
        !['window', 'document', 'prevent', 'stop', 'once', 'capture'].includes(
          s,
        ),
    );
    if (e.includes('debounce')) {
      let s = e.indexOf('debounce');
      e.splice(s, es((e[s + 1] || 'invalid-wait').split('ms')[0]) ? 2 : 1);
    }
    if (e.includes('throttle')) {
      let s = e.indexOf('throttle');
      e.splice(s, es((e[s + 1] || 'invalid-wait').split('ms')[0]) ? 2 : 1);
    }
    if (e.length === 0 || (e.length === 1 && Yu(r.key).includes(e[0])))
      return !1;
    let n = ['ctrl', 'shift', 'alt', 'meta', 'cmd', 'super'].filter((s) =>
      e.includes(s),
    );
    return (
      (e = e.filter((s) => !n.includes(s))),
      !(
        n.length > 0 &&
        n.filter(
          (o) => ((o === 'cmd' || o === 'super') && (o = 'meta'), r[`${o}Key`]),
        ).length === n.length &&
        Yu(r.key).includes(e[0])
      )
    );
  }
  function Yu(r) {
    if (!r) return [];
    r = Yp(r);
    let t = {
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
    return (
      (t[r] = r),
      Object.keys(t)
        .map((e) => {
          if (t[e] === r) return e;
        })
        .filter((e) => e)
    );
  }
  wt(
    'model',
    (r, { modifiers: t, expression: e }, { effect: i, cleanup: n }) => {
      let s = r;
      t.includes('parent') && (s = r.parentNode);
      let o = Bt(s, e),
        a;
      typeof e == 'string'
        ? (a = Bt(s, `${e} = __placeholder`))
        : typeof e == 'function' && typeof e() == 'string'
        ? (a = Bt(s, `${e()} = __placeholder`))
        : (a = () => {});
      let u = () => {
          let p;
          return o((l) => (p = l)), Uu(p) ? p.get() : p;
        },
        f = (p) => {
          let l;
          o((_) => (l = _)),
            Uu(l) ? l.set(p) : a(() => {}, { scope: { __placeholder: p } });
        };
      typeof e == 'string' &&
        r.type === 'radio' &&
        Et(() => {
          r.hasAttribute('name') || r.setAttribute('name', e);
        });
      var c =
        r.tagName.toLowerCase() === 'select' ||
        ['checkbox', 'radio'].includes(r.type) ||
        t.includes('lazy')
          ? 'change'
          : 'input';
      let d = Je
        ? () => {}
        : Po(r, c, t, (p) => {
            f($u(r, t, p, u()));
          });
      if (
        (t.includes('fill') &&
          ([void 0, null, ''].includes(u()) ||
            (r.type === 'checkbox' && Array.isArray(u()))) &&
          f($u(r, t, { target: r }, u())),
        r._x_removeModelListeners || (r._x_removeModelListeners = {}),
        (r._x_removeModelListeners.default = d),
        n(() => r._x_removeModelListeners.default()),
        r.form)
      ) {
        let p = Po(r.form, 'reset', [], (l) => {
          zo(() => r._x_model && r._x_model.set(r.value));
        });
        n(() => p());
      }
      (r._x_model = {
        get() {
          return u();
        },
        set(p) {
          f(p);
        },
      }),
        (r._x_forceModelUpdate = (p) => {
          p === void 0 && typeof e == 'string' && e.match(/\./) && (p = ''),
            (window.fromModel = !0),
            Et(() => kl(r, 'value', p)),
            delete window.fromModel;
        }),
        i(() => {
          let p = u();
          (t.includes('unintrusive') && document.activeElement.isSameNode(r)) ||
            r._x_forceModelUpdate(p);
        });
    },
  );
  function $u(r, t, e, i) {
    return Et(() => {
      if (e instanceof CustomEvent && e.detail !== void 0)
        return e.detail !== null && e.detail !== void 0
          ? e.detail
          : e.target.value;
      if (r.type === 'checkbox')
        if (Array.isArray(i)) {
          let n = null;
          return (
            t.includes('number')
              ? (n = uo(e.target.value))
              : t.includes('boolean')
              ? (n = Zn(e.target.value))
              : (n = e.target.value),
            e.target.checked ? i.concat([n]) : i.filter((s) => !Gp(s, n))
          );
        } else return e.target.checked;
      else {
        if (r.tagName.toLowerCase() === 'select' && r.multiple)
          return t.includes('number')
            ? Array.from(e.target.selectedOptions).map((n) => {
                let s = n.value || n.text;
                return uo(s);
              })
            : t.includes('boolean')
            ? Array.from(e.target.selectedOptions).map((n) => {
                let s = n.value || n.text;
                return Zn(s);
              })
            : Array.from(e.target.selectedOptions).map(
                (n) => n.value || n.text,
              );
        {
          let n;
          return (
            r.type === 'radio'
              ? e.target.checked
                ? (n = e.target.value)
                : (n = i)
              : (n = e.target.value),
            t.includes('number')
              ? uo(n)
              : t.includes('boolean')
              ? Zn(n)
              : t.includes('trim')
              ? n.trim()
              : n
          );
        }
      }
    });
  }
  function uo(r) {
    let t = r ? parseFloat(r) : null;
    return qp(t) ? t : r;
  }
  function Gp(r, t) {
    return r == t;
  }
  function qp(r) {
    return !Array.isArray(r) && !isNaN(r);
  }
  function Uu(r) {
    return (
      r !== null &&
      typeof r == 'object' &&
      typeof r.get == 'function' &&
      typeof r.set == 'function'
    );
  }
  wt('cloak', (r) =>
    queueMicrotask(() => Et(() => r.removeAttribute(ni('cloak')))),
  );
  el(() => `[${ni('init')}]`);
  wt(
    'init',
    Ir((r, { expression: t }, { evaluate: e }) =>
      typeof t == 'string' ? !!t.trim() && e(t, {}, !1) : e(t, {}, !1),
    ),
  );
  wt('text', (r, { expression: t }, { effect: e, evaluateLater: i }) => {
    let n = i(t);
    e(() => {
      n((s) => {
        Et(() => {
          r.textContent = s;
        });
      });
    });
  });
  wt('html', (r, { expression: t }, { effect: e, evaluateLater: i }) => {
    let n = i(t);
    e(() => {
      n((s) => {
        Et(() => {
          (r.innerHTML = s),
            (r._x_ignoreSelf = !0),
            Me(r),
            delete r._x_ignoreSelf;
        });
      });
    });
  });
  Bo(xl(':', bl(ni('bind:'))));
  var sf = (
    r,
    { value: t, modifiers: e, expression: i, original: n },
    { effect: s, cleanup: o },
  ) => {
    if (!t) {
      let u = {};
      Qh(u),
        Bt(r, i)(
          (c) => {
            Bl(r, c, n);
          },
          { scope: u },
        );
      return;
    }
    if (t === 'key') return jp(r, i);
    if (
      r._x_inlineBindings &&
      r._x_inlineBindings[t] &&
      r._x_inlineBindings[t].extract
    )
      return;
    let a = Bt(r, i);
    s(() =>
      a((u) => {
        u === void 0 && typeof i == 'string' && i.match(/\./) && (u = ''),
          Et(() => kl(r, t, u, e));
      }),
    ),
      o(() => {
        r._x_undoAddedClasses && r._x_undoAddedClasses(),
          r._x_undoAddedStyles && r._x_undoAddedStyles();
      });
  };
  sf.inline = (r, { value: t, modifiers: e, expression: i }) => {
    !t ||
      (r._x_inlineBindings || (r._x_inlineBindings = {}),
      (r._x_inlineBindings[t] = { expression: i, extract: !1 }));
  };
  wt('bind', sf);
  function jp(r, t) {
    r._x_keyExpression = t;
  }
  tl(() => `[${ni('data')}]`);
  wt('data', (r, { expression: t }, { cleanup: e }) => {
    if (Kp(r)) return;
    t = t === '' ? '{}' : t;
    let i = {};
    _o(i, r);
    let n = {};
    Jh(n, i);
    let s = Dr(r, t, { scope: n });
    (s === void 0 || s === !0) && (s = {}), _o(s, r);
    let o = ri(s);
    cl(o);
    let a = ji(r, o);
    o.init && Dr(r, o.init),
      e(() => {
        o.destroy && Dr(r, o.destroy), a();
      });
  });
  ns((r, t) => {
    r._x_dataStack &&
      ((t._x_dataStack = r._x_dataStack),
      t.setAttribute('data-has-alpine-state', !0));
  });
  function Kp(r) {
    return Je ? (To ? !0 : r.hasAttribute('data-has-alpine-state')) : !1;
  }
  wt('show', (r, { modifiers: t, expression: e }, { effect: i }) => {
    let n = Bt(r, e);
    r._x_doHide ||
      (r._x_doHide = () => {
        Et(() => {
          r.style.setProperty(
            'display',
            'none',
            t.includes('important') ? 'important' : void 0,
          );
        });
      }),
      r._x_doShow ||
        (r._x_doShow = () => {
          Et(() => {
            r.style.length === 1 && r.style.display === 'none'
              ? r.removeAttribute('style')
              : r.style.removeProperty('display');
          });
        });
    let s = () => {
        r._x_doHide(), (r._x_isShown = !1);
      },
      o = () => {
        r._x_doShow(), (r._x_isShown = !0);
      },
      a = () => setTimeout(o),
      u = bo(
        (d) => (d ? o() : s()),
        (d) => {
          typeof r._x_toggleAndCascadeWithTransitions == 'function'
            ? r._x_toggleAndCascadeWithTransitions(r, d, o, s)
            : d
            ? a()
            : s();
        },
      ),
      f,
      c = !0;
    i(() =>
      n((d) => {
        (!c && d === f) ||
          (t.includes('immediate') && (d ? a() : s()), u(d), (f = d), (c = !1));
      }),
    );
  });
  wt('for', (r, { expression: t }, { effect: e, cleanup: i }) => {
    let n = Zp(t),
      s = Bt(r, n.items),
      o = Bt(r, r._x_keyExpression || 'index');
    (r._x_prevKeys = []),
      (r._x_lookup = {}),
      e(() => Qp(r, n, s, o)),
      i(() => {
        Object.values(r._x_lookup).forEach((a) => a.remove()),
          delete r._x_prevKeys,
          delete r._x_lookup;
      });
  });
  function Qp(r, t, e, i) {
    let n = (o) => typeof o == 'object' && !Array.isArray(o),
      s = r;
    e((o) => {
      Jp(o) && o >= 0 && (o = Array.from(Array(o).keys(), (g) => g + 1)),
        o === void 0 && (o = []);
      let a = r._x_lookup,
        u = r._x_prevKeys,
        f = [],
        c = [];
      if (n(o))
        o = Object.entries(o).map(([g, v]) => {
          let m = Gu(t, v, g, o);
          i(
            (y) => {
              c.includes(y) && he('Duplicate key on x-for', r), c.push(y);
            },
            { scope: { index: g, ...m } },
          ),
            f.push(m);
        });
      else
        for (let g = 0; g < o.length; g++) {
          let v = Gu(t, o[g], g, o);
          i(
            (m) => {
              c.includes(m) && he('Duplicate key on x-for', r), c.push(m);
            },
            { scope: { index: g, ...v } },
          ),
            f.push(v);
        }
      let d = [],
        p = [],
        l = [],
        _ = [];
      for (let g = 0; g < u.length; g++) {
        let v = u[g];
        c.indexOf(v) === -1 && l.push(v);
      }
      u = u.filter((g) => !l.includes(g));
      let h = 'template';
      for (let g = 0; g < c.length; g++) {
        let v = c[g],
          m = u.indexOf(v);
        if (m === -1) u.splice(g, 0, v), d.push([h, g]);
        else if (m !== g) {
          let y = u.splice(g, 1)[0],
            A = u.splice(m - 1, 1)[0];
          u.splice(g, 0, A), u.splice(m, 0, y), p.push([y, A]);
        } else _.push(v);
        h = v;
      }
      for (let g = 0; g < l.length; g++) {
        let v = l[g];
        a[v]._x_effects && a[v]._x_effects.forEach(qu),
          a[v].remove(),
          (a[v] = null),
          delete a[v];
      }
      for (let g = 0; g < p.length; g++) {
        let [v, m] = p[g],
          y = a[v],
          A = a[m],
          x = document.createElement('div');
        Et(() => {
          A || he('x-for ":key" is undefined or invalid', s, m, a),
            A.after(x),
            y.after(A),
            A._x_currentIfEl && A.after(A._x_currentIfEl),
            x.before(y),
            y._x_currentIfEl && y.after(y._x_currentIfEl),
            x.remove();
        }),
          A._x_refreshXForScope(f[c.indexOf(m)]);
      }
      for (let g = 0; g < d.length; g++) {
        let [v, m] = d[g],
          y = v === 'template' ? s : a[v];
        y._x_currentIfEl && (y = y._x_currentIfEl);
        let A = f[m],
          x = c[m],
          E = document.importNode(s.content, !0).firstElementChild,
          w = ri(A);
        ji(E, w, s),
          (E._x_refreshXForScope = (S) => {
            Object.entries(S).forEach(([k, M]) => {
              w[k] = M;
            });
          }),
          Et(() => {
            y.after(E), Ir(() => Me(E))();
          }),
          typeof x == 'object' &&
            he(
              'x-for key cannot be an object, it must be a string or an integer',
              s,
            ),
          (a[x] = E);
      }
      for (let g = 0; g < _.length; g++)
        a[_[g]]._x_refreshXForScope(f[c.indexOf(_[g])]);
      s._x_prevKeys = c;
    });
  }
  function Zp(r) {
    let t = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/,
      e = /^\s*\(|\)\s*$/g,
      i = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/,
      n = r.match(i);
    if (!n) return;
    let s = {};
    s.items = n[2].trim();
    let o = n[1].replace(e, '').trim(),
      a = o.match(t);
    return (
      a
        ? ((s.item = o.replace(t, '').trim()),
          (s.index = a[1].trim()),
          a[2] && (s.collection = a[2].trim()))
        : (s.item = o),
      s
    );
  }
  function Gu(r, t, e, i) {
    let n = {};
    return (
      /^\[.*\]$/.test(r.item) && Array.isArray(t)
        ? r.item
            .replace('[', '')
            .replace(']', '')
            .split(',')
            .map((o) => o.trim())
            .forEach((o, a) => {
              n[o] = t[a];
            })
        : /^\{.*\}$/.test(r.item) && !Array.isArray(t) && typeof t == 'object'
        ? r.item
            .replace('{', '')
            .replace('}', '')
            .split(',')
            .map((o) => o.trim())
            .forEach((o) => {
              n[o] = t[o];
            })
        : (n[r.item] = t),
      r.index && (n[r.index] = e),
      r.collection && (n[r.collection] = i),
      n
    );
  }
  function Jp(r) {
    return !Array.isArray(r) && !isNaN(r);
  }
  function of() {}
  of.inline = (r, { expression: t }, { cleanup: e }) => {
    let i = rs(r);
    i._x_refs || (i._x_refs = {}),
      (i._x_refs[t] = r),
      e(() => delete i._x_refs[t]);
  };
  wt('ref', of);
  wt('if', (r, { expression: t }, { effect: e, cleanup: i }) => {
    r.tagName.toLowerCase() !== 'template' &&
      he('x-if can only be used on a <template> tag', r);
    let n = Bt(r, t),
      s = () => {
        if (r._x_currentIfEl) return r._x_currentIfEl;
        let a = r.content.cloneNode(!0).firstElementChild;
        return (
          ji(a, {}, r),
          Et(() => {
            r.after(a), Ir(() => Me(a))();
          }),
          (r._x_currentIfEl = a),
          (r._x_undoIf = () => {
            Ze(a, (u) => {
              u._x_effects && u._x_effects.forEach(qu);
            }),
              a.remove(),
              delete r._x_currentIfEl;
          }),
          a
        );
      },
      o = () => {
        !r._x_undoIf || (r._x_undoIf(), delete r._x_undoIf);
      };
    e(() =>
      n((a) => {
        a ? s() : o();
      }),
    ),
      i(() => r._x_undoIf && r._x_undoIf());
  });
  wt('id', (r, { expression: t }, { evaluate: e }) => {
    e(t).forEach((n) => Vp(r, n));
  });
  ns((r, t) => {
    r._x_ids && (t._x_ids = r._x_ids);
  });
  Bo(xl('@', bl(ni('on:'))));
  wt(
    'on',
    Ir((r, { value: t, modifiers: e, expression: i }, { cleanup: n }) => {
      let s = i ? Bt(r, i) : () => {};
      r.tagName.toLowerCase() === 'template' &&
        (r._x_forwardEvents || (r._x_forwardEvents = []),
        r._x_forwardEvents.includes(t) || r._x_forwardEvents.push(t));
      let o = Po(r, t, e, (a) => {
        s(() => {}, { scope: { $event: a }, params: [a] });
      });
      n(() => o());
    }),
  );
  ls('Collapse', 'collapse', 'collapse');
  ls('Intersect', 'intersect', 'intersect');
  ls('Focus', 'trap', 'focus');
  ls('Mask', 'mask', 'mask');
  function ls(r, t, e) {
    wt(t, (i) =>
      he(
        `You can't use [x-${t}] without first installing the "${r}" plugin here: https://alpinejs.dev/plugins/${e}`,
        i,
      ),
    );
  }
  Qi.setEvaluator(gl);
  Qi.setReactivityEngine({ reactive: qo, effect: lp, release: fp, raw: pt });
  var t_ = Qi,
    fs = t_;
  function e_(r) {
    r.directive(
      'intersect',
      r.skipDuringClone(
        (
          t,
          { value: e, expression: i, modifiers: n },
          { evaluateLater: s, cleanup: o },
        ) => {
          let a = s(i),
            u = { rootMargin: n_(n), threshold: r_(n) },
            f = new IntersectionObserver((c) => {
              c.forEach((d) => {
                d.isIntersecting !== (e === 'leave') &&
                  (a(), n.includes('once') && f.disconnect());
              });
            }, u);
          f.observe(t),
            o(() => {
              f.disconnect();
            });
        },
      ),
    );
  }
  function r_(r) {
    if (r.includes('full')) return 0.99;
    if (r.includes('half')) return 0.5;
    if (!r.includes('threshold')) return 0;
    let t = r[r.indexOf('threshold') + 1];
    return t === '100' ? 1 : t === '0' ? 0 : Number(`.${t}`);
  }
  function i_(r) {
    let t = r.match(/^(-?[0-9]+)(px|%)?$/);
    return t ? t[1] + (t[2] || 'px') : void 0;
  }
  function n_(r) {
    let t = 'margin',
      e = '0px 0px 0px 0px',
      i = r.indexOf(t);
    if (i === -1) return e;
    let n = [];
    for (let s = 1; s < 5; s++) n.push(i_(r[i + s] || ''));
    return (
      (n = n.filter((s) => s !== void 0)), n.length ? n.join(' ').trim() : e
    );
  }
  var af = e_;
  window.cart = function () {};
  function Ie(r) {
    if (r === void 0)
      throw new ReferenceError(
        "this hasn't been initialised - super() hasn't been called",
      );
    return r;
  }
  function _f(r, t) {
    (r.prototype = Object.create(t.prototype)),
      (r.prototype.constructor = r),
      (r.__proto__ = t);
  }
  var Vt = {
      autoSleep: 120,
      force3D: 'auto',
      nullTargetWarn: 1,
      units: { lineHeight: '' },
    },
    ai = { duration: 0.5, overwrite: !1, delay: 0 },
    la,
    Pe = 1e8,
    ut = 1 / Pe,
    ea = Math.PI * 2,
    s_ = ea / 4,
    o_ = 0,
    gf = Math.sqrt,
    a_ = Math.cos,
    u_ = Math.sin,
    Lt = function (t) {
      return typeof t == 'string';
    },
    kt = function (t) {
      return typeof t == 'function';
    },
    Fe = function (t) {
      return typeof t == 'number';
    },
    ys = function (t) {
      return typeof t > 'u';
    },
    Be = function (t) {
      return typeof t == 'object';
    },
    Xt = function (t) {
      return t !== !1;
    },
    vf = function () {
      return typeof window < 'u';
    },
    uf = function (t) {
      return kt(t) || Lt(t);
    },
    mf =
      (typeof ArrayBuffer == 'function' && ArrayBuffer.isView) ||
      function () {},
    Qt = Array.isArray,
    ra = /(?:-?\.?\d|\.)+/gi,
    fa = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,
    Fr = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g,
    jo = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,
    ca = /[+-]=-?[.\d]+/,
    yf = /[^,'"\[\]\s]+/gi,
    l_ = /[\d.+\-=]+(?:e[-+]\d*)*/i,
    vt,
    Se,
    ia,
    da,
    Zt = {},
    hs = {},
    xf,
    bf = function (t) {
      return (hs = li(t, Zt)) && ne;
    },
    xs = function (t, e) {
      return console.warn(
        'Invalid property',
        t,
        'set to',
        e,
        'Missing plugin? gsap.registerPlugin()',
      );
    },
    ps = function (t, e) {
      return !e && console.warn(t);
    },
    wf = function (t, e) {
      return (t && (Zt[t] = e) && hs && (hs[t] = e)) || Zt;
    },
    ui = function () {
      return 0;
    },
    ha = {},
    rr = [],
    na = {},
    Tf,
    Ht = {},
    Ko = {},
    lf = 30,
    cs = [],
    pa = '',
    _a = function (t) {
      var e = t[0],
        i,
        n;
      if ((Be(e) || kt(e) || (t = [t]), !(i = (e._gsap || {}).harness))) {
        for (n = cs.length; n-- && !cs[n].targetTest(e); );
        i = cs[n];
      }
      for (n = t.length; n--; )
        (t[n] && (t[n]._gsap || (t[n]._gsap = new ya(t[n], i)))) ||
          t.splice(n, 1);
      return t;
    },
    ir = function (t) {
      return t._gsap || _a(re(t))[0]._gsap;
    },
    ga = function (t, e, i) {
      return (i = t[e]) && kt(i)
        ? t[e]()
        : (ys(i) && t.getAttribute && t.getAttribute(e)) || i;
    },
    Yt = function (t, e) {
      return (t = t.split(',')).forEach(e) || t;
    },
    et = function (t) {
      return Math.round(t * 1e5) / 1e5 || 0;
    },
    f_ = function (t, e) {
      for (var i = e.length, n = 0; t.indexOf(e[n]) < 0 && ++n < i; );
      return n < i;
    },
    _s = function () {
      var t = rr.length,
        e = rr.slice(0),
        i,
        n;
      for (na = {}, rr.length = 0, i = 0; i < t; i++)
        (n = e[i]),
          n && n._lazy && (n.render(n._lazy[0], n._lazy[1], !0)._lazy = 0);
    },
    Ef = function (t, e, i, n) {
      rr.length && _s(), t.render(e, i, n), rr.length && _s();
    },
    Sf = function (t) {
      var e = parseFloat(t);
      return (e || e === 0) && (t + '').match(yf).length < 2
        ? e
        : Lt(t)
        ? t.trim()
        : t;
    },
    Af = function (t) {
      return t;
    },
    ie = function (t, e) {
      for (var i in e) i in t || (t[i] = e[i]);
      return t;
    },
    c_ = function (t, e) {
      for (var i in e)
        i in t || i === 'duration' || i === 'ease' || (t[i] = e[i]);
    },
    li = function (t, e) {
      for (var i in e) t[i] = e[i];
      return t;
    },
    ff = function r(t, e) {
      for (var i in e)
        i !== '__proto__' &&
          i !== 'constructor' &&
          i !== 'prototype' &&
          (t[i] = Be(e[i]) ? r(t[i] || (t[i] = {}), e[i]) : e[i]);
      return t;
    },
    sa = function (t, e) {
      var i = {},
        n;
      for (n in t) n in e || (i[n] = t[n]);
      return i;
    },
    ds = function (t) {
      var e = t.parent || vt,
        i = t.keyframes ? c_ : ie;
      if (Xt(t.inherit))
        for (; e; ) i(t, e.vars.defaults), (e = e.parent || e._dp);
      return t;
    },
    d_ = function (t, e) {
      for (var i = t.length, n = i === e.length; n && i-- && t[i] === e[i]; );
      return i < 0;
    },
    h_ = function (t, e, i, n, s) {
      i === void 0 && (i = '_first'), n === void 0 && (n = '_last');
      var o = t[n],
        a;
      if (s) for (a = e[s]; o && o[s] > a; ) o = o._prev;
      return (
        o
          ? ((e._next = o._next), (o._next = e))
          : ((e._next = t[i]), (t[i] = e)),
        e._next ? (e._next._prev = e) : (t[n] = e),
        (e._prev = o),
        (e.parent = e._dp = t),
        e
      );
    },
    bs = function (t, e, i, n) {
      i === void 0 && (i = '_first'), n === void 0 && (n = '_last');
      var s = e._prev,
        o = e._next;
      s ? (s._next = o) : t[i] === e && (t[i] = o),
        o ? (o._prev = s) : t[n] === e && (t[n] = s),
        (e._next = e._prev = e.parent = null);
    },
    nr = function (t, e) {
      t.parent && (!e || t.parent.autoRemoveChildren) && t.parent.remove(t),
        (t._act = 0);
    },
    Nr = function (t, e) {
      if (t && (!e || e._end > t._dur || e._start < 0))
        for (var i = t; i; ) (i._dirty = 1), (i = i.parent);
      return t;
    },
    p_ = function (t) {
      for (var e = t.parent; e && e.parent; )
        (e._dirty = 1), e.totalDuration(), (e = e.parent);
      return t;
    },
    __ = function r(t) {
      return !t || (t._ts && r(t.parent));
    },
    cf = function (t) {
      return t._repeat ? fi(t._tTime, (t = t.duration() + t._rDelay)) * t : 0;
    },
    fi = function (t, e) {
      var i = Math.floor((t /= e));
      return t && i === t ? i - 1 : i;
    },
    gs = function (t, e) {
      return (
        (t - e._start) * e._ts +
        (e._ts >= 0 ? 0 : e._dirty ? e.totalDuration() : e._tDur)
      );
    },
    va = function (t) {
      return (t._end = et(
        t._start + (t._tDur / Math.abs(t._ts || t._rts || ut) || 0),
      ));
    },
    Pf = function (t, e) {
      var i = t._dp;
      return (
        i &&
          i.smoothChildTiming &&
          t._ts &&
          ((t._start = et(
            i._time -
              (t._ts > 0
                ? e / t._ts
                : ((t._dirty ? t.totalDuration() : t._tDur) - e) / -t._ts),
          )),
          va(t),
          i._dirty || Nr(i, t)),
        t
      );
    },
    Cf = function (t, e) {
      var i;
      if (
        ((e._time || (e._initted && !e._dur)) &&
          ((i = gs(t.rawTime(), e)),
          (!e._dur || nn(0, e.totalDuration(), i) - e._tTime > ut) &&
            e.render(i, !0)),
        Nr(t, e)._dp && t._initted && t._time >= t._dur && t._ts)
      ) {
        if (t._dur < t.duration())
          for (i = t; i._dp; )
            i.rawTime() >= 0 && i.totalTime(i._tTime), (i = i._dp);
        t._zTime = -ut;
      }
    },
    Ae = function (t, e, i, n) {
      return (
        e.parent && nr(e),
        (e._start = et(
          (Fe(i) ? i : i || t !== vt ? ee(t, i, e) : t._time) + e._delay,
        )),
        (e._end = et(
          e._start + (e.totalDuration() / Math.abs(e.timeScale()) || 0),
        )),
        h_(t, e, '_first', '_last', t._sort ? '_start' : 0),
        oa(e) || (t._recent = e),
        n || Cf(t, e),
        t
      );
    },
    Of = function (t, e) {
      return (
        (Zt.ScrollTrigger || xs('scrollTrigger', e)) &&
        Zt.ScrollTrigger.create(e, t)
      );
    },
    kf = function (t, e, i, n) {
      if ((B_(t, e), !t._initted)) return 1;
      if (
        !i &&
        t._pt &&
        ((t._dur && t.vars.lazy !== !1) || (!t._dur && t.vars.lazy)) &&
        Tf !== Kt.frame
      )
        return rr.push(t), (t._lazy = [e, n]), 1;
    },
    g_ = function r(t) {
      var e = t.parent;
      return e && e._ts && e._initted && !e._lock && (e.rawTime() < 0 || r(e));
    },
    oa = function (t) {
      var e = t.data;
      return e === 'isFromStart' || e === 'isStart';
    },
    v_ = function (t, e, i, n) {
      var s = t.ratio,
        o =
          e < 0 ||
          (!e &&
            ((!t._start && g_(t) && !(!t._initted && oa(t))) ||
              ((t._ts < 0 || t._dp._ts < 0) && !oa(t))))
            ? 0
            : 1,
        a = t._rDelay,
        u = 0,
        f,
        c,
        d;
      if (
        (a &&
          t._repeat &&
          ((u = nn(0, t._tDur, e)),
          (c = fi(u, a)),
          (d = fi(t._tTime, a)),
          t._yoyo && c & 1 && (o = 1 - o),
          c !== d &&
            ((s = 1 - o),
            t.vars.repeatRefresh && t._initted && t.invalidate())),
        o !== s || n || t._zTime === ut || (!e && t._zTime))
      ) {
        if (!t._initted && kf(t, e, n, i)) return;
        for (
          d = t._zTime,
            t._zTime = e || (i ? ut : 0),
            i || (i = e && !d),
            t.ratio = o,
            t._from && (o = 1 - o),
            t._time = 0,
            t._tTime = u,
            f = t._pt;
          f;

        )
          f.r(o, f.d), (f = f._next);
        t._startAt && e < 0 && t._startAt.render(e, !0, !0),
          t._onUpdate && !i && jt(t, 'onUpdate'),
          u && t._repeat && !i && t.parent && jt(t, 'onRepeat'),
          (e >= t._tDur || e < 0) &&
            t.ratio === o &&
            (o && nr(t, 1),
            i ||
              (jt(t, o ? 'onComplete' : 'onReverseComplete', !0),
              t._prom && t._prom()));
      } else t._zTime || (t._zTime = e);
    },
    m_ = function (t, e, i) {
      var n;
      if (i > e)
        for (n = t._first; n && n._start <= i; ) {
          if (!n._dur && n.data === 'isPause' && n._start > e) return n;
          n = n._next;
        }
      else
        for (n = t._last; n && n._start >= i; ) {
          if (!n._dur && n.data === 'isPause' && n._start < e) return n;
          n = n._prev;
        }
    },
    ci = function (t, e, i, n) {
      var s = t._repeat,
        o = et(e) || 0,
        a = t._tTime / t._tDur;
      return (
        a && !n && (t._time *= o / t._dur),
        (t._dur = o),
        (t._tDur = s ? (s < 0 ? 1e10 : et(o * (s + 1) + t._rDelay * s)) : o),
        a && !n ? Pf(t, (t._tTime = t._tDur * a)) : t.parent && va(t),
        i || Nr(t.parent, t),
        t
      );
    },
    df = function (t) {
      return t instanceof Nt ? Nr(t) : ci(t, t._dur);
    },
    y_ = { _start: 0, endTime: ui, totalDuration: ui },
    ee = function r(t, e, i) {
      var n = t.labels,
        s = t._recent || y_,
        o = t.duration() >= Pe ? s.endTime(!1) : t._dur,
        a,
        u,
        f;
      return Lt(e) && (isNaN(e) || e in n)
        ? ((u = e.charAt(0)),
          (f = e.substr(-1) === '%'),
          (a = e.indexOf('=')),
          u === '<' || u === '>'
            ? (a >= 0 && (e = e.replace(/=/, '')),
              (u === '<' ? s._start : s.endTime(s._repeat >= 0)) +
                (parseFloat(e.substr(1)) || 0) *
                  (f ? (a < 0 ? s : i).totalDuration() / 100 : 1))
            : a < 0
            ? (e in n || (n[e] = o), n[e])
            : ((u = parseFloat(e.charAt(a - 1) + e.substr(a + 1))),
              f && i && (u = (u / 100) * (Qt(i) ? i[0] : i).totalDuration()),
              a > 1 ? r(t, e.substr(0, a - 1), i) + u : o + u))
        : e == null
        ? o
        : +e;
    },
    tn = function (t, e, i) {
      var n = Fe(e[1]),
        s = (n ? 2 : 1) + (t < 2 ? 0 : 1),
        o = e[s],
        a,
        u;
      if ((n && (o.duration = e[1]), (o.parent = i), t)) {
        for (a = o, u = i; u && !('immediateRender' in a); )
          (a = u.vars.defaults || {}), (u = Xt(u.vars.inherit) && u.parent);
        (o.immediateRender = Xt(a.immediateRender)),
          t < 2 ? (o.runBackwards = 1) : (o.startAt = e[s - 1]);
      }
      return new St(e[0], o, e[s + 1]);
    },
    sr = function (t, e) {
      return t || t === 0 ? e(t) : e;
    },
    nn = function (t, e, i) {
      return i < t ? t : i > e ? e : i;
    },
    $t = function (t) {
      if (typeof t != 'string') return '';
      var e = l_.exec(t);
      return e ? t.substr(e.index + e[0].length) : '';
    },
    x_ = function (t, e, i) {
      return sr(i, function (n) {
        return nn(t, e, n);
      });
    },
    aa = [].slice,
    Df = function (t, e) {
      return (
        t &&
        Be(t) &&
        'length' in t &&
        ((!e && !t.length) || (t.length - 1 in t && Be(t[0]))) &&
        !t.nodeType &&
        t !== Se
      );
    },
    b_ = function (t, e, i) {
      return (
        i === void 0 && (i = []),
        t.forEach(function (n) {
          var s;
          return (Lt(n) && !e) || Df(n, 1)
            ? (s = i).push.apply(s, re(n))
            : i.push(n);
        }) || i
      );
    },
    re = function (t, e, i) {
      return Lt(t) && !i && (ia || !di())
        ? aa.call((e || da).querySelectorAll(t), 0)
        : Qt(t)
        ? b_(t, i)
        : Df(t)
        ? aa.call(t, 0)
        : t
        ? [t]
        : [];
    },
    w_ = function (t) {
      return (
        (t = re(t)[0] || ps('Invalid scope') || {}),
        function (e) {
          var i = t.current || t.nativeElement || t;
          return re(
            e,
            i.querySelectorAll
              ? i
              : i === t
              ? ps('Invalid scope') || da.createElement('div')
              : t,
          );
        }
      );
    },
    Lf = function (t) {
      return t.sort(function () {
        return 0.5 - Math.random();
      });
    },
    Rf = function (t) {
      if (kt(t)) return t;
      var e = Be(t) ? t : { each: t },
        i = oi(e.ease),
        n = e.from || 0,
        s = parseFloat(e.base) || 0,
        o = {},
        a = n > 0 && n < 1,
        u = isNaN(n) || a,
        f = e.axis,
        c = n,
        d = n;
      return (
        Lt(n)
          ? (c = d = { center: 0.5, edges: 0.5, end: 1 }[n] || 0)
          : !a && u && ((c = n[0]), (d = n[1])),
        function (p, l, _) {
          var h = (_ || e).length,
            g = o[h],
            v,
            m,
            y,
            A,
            x,
            E,
            w,
            S,
            k;
          if (!g) {
            if (((k = e.grid === 'auto' ? 0 : (e.grid || [1, Pe])[1]), !k)) {
              for (
                w = -Pe;
                w < (w = _[k++].getBoundingClientRect().left) && k < h;

              );
              k--;
            }
            for (
              g = o[h] = [],
                v = u ? Math.min(k, h) * c - 0.5 : n % k,
                m = u ? (h * d) / k - 0.5 : (n / k) | 0,
                w = 0,
                S = Pe,
                E = 0;
              E < h;
              E++
            )
              (y = (E % k) - v),
                (A = m - ((E / k) | 0)),
                (g[E] = x =
                  f ? Math.abs(f === 'y' ? A : y) : gf(y * y + A * A)),
                x > w && (w = x),
                x < S && (S = x);
            n === 'random' && Lf(g),
              (g.max = w - S),
              (g.min = S),
              (g.v = h =
                (parseFloat(e.amount) ||
                  parseFloat(e.each) *
                    (k > h
                      ? h - 1
                      : f
                      ? f === 'y'
                        ? h / k
                        : k
                      : Math.max(k, h / k)) ||
                  0) * (n === 'edges' ? -1 : 1)),
              (g.b = h < 0 ? s - h : s),
              (g.u = $t(e.amount || e.each) || 0),
              (i = i && h < 0 ? zf(i) : i);
          }
          return (
            (h = (g[p] - g.min) / g.max || 0),
            et(g.b + (i ? i(h) : h) * g.v) + g.u
          );
        }
      );
    },
    ua = function (t) {
      var e = t < 1 ? Math.pow(10, (t + '').length - 2) : 1;
      return function (i) {
        var n = Math.round(parseFloat(i) / t) * t * e;
        return (n - (n % 1)) / e + (Fe(i) ? 0 : $t(i));
      };
    },
    Mf = function (t, e) {
      var i = Qt(t),
        n,
        s;
      return (
        !i &&
          Be(t) &&
          ((n = i = t.radius || Pe),
          t.values
            ? ((t = re(t.values)), (s = !Fe(t[0])) && (n *= n))
            : (t = ua(t.increment))),
        sr(
          e,
          i
            ? kt(t)
              ? function (o) {
                  return (s = t(o)), Math.abs(s - o) <= n ? s : o;
                }
              : function (o) {
                  for (
                    var a = parseFloat(s ? o.x : o),
                      u = parseFloat(s ? o.y : 0),
                      f = Pe,
                      c = 0,
                      d = t.length,
                      p,
                      l;
                    d--;

                  )
                    s
                      ? ((p = t[d].x - a),
                        (l = t[d].y - u),
                        (p = p * p + l * l))
                      : (p = Math.abs(t[d] - a)),
                      p < f && ((f = p), (c = d));
                  return (
                    (c = !n || f <= n ? t[c] : o),
                    s || c === o || Fe(o) ? c : c + $t(o)
                  );
                }
            : ua(t),
        )
      );
    },
    If = function (t, e, i, n) {
      return sr(Qt(t) ? !e : i === !0 ? !!(i = 0) : !n, function () {
        return Qt(t)
          ? t[~~(Math.random() * t.length)]
          : (i = i || 1e-5) &&
              (n = i < 1 ? Math.pow(10, (i + '').length - 2) : 1) &&
              Math.floor(
                Math.round(
                  (t - i / 2 + Math.random() * (e - t + i * 0.99)) / i,
                ) *
                  i *
                  n,
              ) / n;
      });
    },
    T_ = function () {
      for (var t = arguments.length, e = new Array(t), i = 0; i < t; i++)
        e[i] = arguments[i];
      return function (n) {
        return e.reduce(function (s, o) {
          return o(s);
        }, n);
      };
    },
    E_ = function (t, e) {
      return function (i) {
        return t(parseFloat(i)) + (e || $t(i));
      };
    },
    S_ = function (t, e, i) {
      return Ff(t, e, 0, 1, i);
    },
    Nf = function (t, e, i) {
      return sr(i, function (n) {
        return t[~~e(n)];
      });
    },
    A_ = function r(t, e, i) {
      var n = e - t;
      return Qt(t)
        ? Nf(t, r(0, t.length), e)
        : sr(i, function (s) {
            return ((n + ((s - t) % n)) % n) + t;
          });
    },
    P_ = function r(t, e, i) {
      var n = e - t,
        s = n * 2;
      return Qt(t)
        ? Nf(t, r(0, t.length - 1), e)
        : sr(i, function (o) {
            return (o = (s + ((o - t) % s)) % s || 0), t + (o > n ? s - o : o);
          });
    },
    sn = function (t) {
      for (var e = 0, i = '', n, s, o, a; ~(n = t.indexOf('random(', e)); )
        (o = t.indexOf(')', n)),
          (a = t.charAt(n + 7) === '['),
          (s = t.substr(n + 7, o - n - 7).match(a ? yf : ra)),
          (i +=
            t.substr(e, n - e) +
            If(a ? s : +s[0], a ? 0 : +s[1], +s[2] || 1e-5)),
          (e = o + 1);
      return i + t.substr(e, t.length - e);
    },
    Ff = function (t, e, i, n, s) {
      var o = e - t,
        a = n - i;
      return sr(s, function (u) {
        return i + (((u - t) / o) * a || 0);
      });
    },
    C_ = function r(t, e, i, n) {
      var s = isNaN(t + e)
        ? 0
        : function (l) {
            return (1 - l) * t + l * e;
          };
      if (!s) {
        var o = Lt(t),
          a = {},
          u,
          f,
          c,
          d,
          p;
        if ((i === !0 && (n = 1) && (i = null), o))
          (t = { p: t }), (e = { p: e });
        else if (Qt(t) && !Qt(e)) {
          for (c = [], d = t.length, p = d - 2, f = 1; f < d; f++)
            c.push(r(t[f - 1], t[f]));
          d--,
            (s = function (_) {
              _ *= d;
              var h = Math.min(p, ~~_);
              return c[h](_ - h);
            }),
            (i = e);
        } else n || (t = li(Qt(t) ? [] : {}, t));
        if (!c) {
          for (u in e) xa.call(a, t, u, 'get', e[u]);
          s = function (_) {
            return Ea(_, a) || (o ? t.p : t);
          };
        }
      }
      return sr(i, s);
    },
    hf = function (t, e, i) {
      var n = t.labels,
        s = Pe,
        o,
        a,
        u;
      for (o in n)
        (a = n[o] - e),
          a < 0 == !!i && a && s > (a = Math.abs(a)) && ((u = o), (s = a));
      return u;
    },
    jt = function (t, e, i) {
      var n = t.vars,
        s = n[e],
        o,
        a;
      if (!!s)
        return (
          (o = n[e + 'Params']),
          (a = n.callbackScope || t),
          i && rr.length && _s(),
          o ? s.apply(a, o) : s.call(a)
        );
    },
    Zi = function (t) {
      return (
        nr(t),
        t.scrollTrigger && t.scrollTrigger.kill(!1),
        t.progress() < 1 && jt(t, 'onInterrupt'),
        t
      );
    },
    si,
    O_ = function (t) {
      t = (!t.name && t.default) || t;
      var e = t.name,
        i = kt(t),
        n =
          e && !i && t.init
            ? function () {
                this._props = [];
              }
            : t,
        s = {
          init: ui,
          render: Ea,
          add: xa,
          kill: $_,
          modifier: Y_,
          rawVars: 0,
        },
        o = { targetTest: 0, get: 0, getSetter: ws, aliases: {}, register: 0 };
      if ((di(), t !== n)) {
        if (Ht[e]) return;
        ie(n, ie(sa(t, s), o)),
          li(n.prototype, li(s, sa(t, o))),
          (Ht[(n.prop = e)] = n),
          t.targetTest && (cs.push(n), (ha[e] = 1)),
          (e =
            (e === 'css' ? 'CSS' : e.charAt(0).toUpperCase() + e.substr(1)) +
            'Plugin');
      }
      wf(e, n), t.register && t.register(ne, n, zt);
    },
    ct = 255,
    Ji = {
      aqua: [0, ct, ct],
      lime: [0, ct, 0],
      silver: [192, 192, 192],
      black: [0, 0, 0],
      maroon: [128, 0, 0],
      teal: [0, 128, 128],
      blue: [0, 0, ct],
      navy: [0, 0, 128],
      white: [ct, ct, ct],
      olive: [128, 128, 0],
      yellow: [ct, ct, 0],
      orange: [ct, 165, 0],
      gray: [128, 128, 128],
      purple: [128, 0, 128],
      green: [0, 128, 0],
      red: [ct, 0, 0],
      pink: [ct, 192, 203],
      cyan: [0, ct, ct],
      transparent: [ct, ct, ct, 0],
    },
    Qo = function (t, e, i) {
      return (
        (t = t < 0 ? t + 1 : t > 1 ? t - 1 : t),
        ((t * 6 < 1
          ? e + (i - e) * t * 6
          : t < 0.5
          ? i
          : t * 3 < 2
          ? e + (i - e) * (2 / 3 - t) * 6
          : e) *
          ct +
          0.5) |
          0
      );
    },
    Bf = function (t, e, i) {
      var n = t ? (Fe(t) ? [t >> 16, (t >> 8) & ct, t & ct] : 0) : Ji.black,
        s,
        o,
        a,
        u,
        f,
        c,
        d,
        p,
        l,
        _;
      if (!n) {
        if ((t.substr(-1) === ',' && (t = t.substr(0, t.length - 1)), Ji[t]))
          n = Ji[t];
        else if (t.charAt(0) === '#') {
          if (
            (t.length < 6 &&
              ((s = t.charAt(1)),
              (o = t.charAt(2)),
              (a = t.charAt(3)),
              (t =
                '#' +
                s +
                s +
                o +
                o +
                a +
                a +
                (t.length === 5 ? t.charAt(4) + t.charAt(4) : ''))),
            t.length === 9)
          )
            return (
              (n = parseInt(t.substr(1, 6), 16)),
              [n >> 16, (n >> 8) & ct, n & ct, parseInt(t.substr(7), 16) / 255]
            );
          (t = parseInt(t.substr(1), 16)),
            (n = [t >> 16, (t >> 8) & ct, t & ct]);
        } else if (t.substr(0, 3) === 'hsl') {
          if (((n = _ = t.match(ra)), !e))
            (u = (+n[0] % 360) / 360),
              (f = +n[1] / 100),
              (c = +n[2] / 100),
              (o = c <= 0.5 ? c * (f + 1) : c + f - c * f),
              (s = c * 2 - o),
              n.length > 3 && (n[3] *= 1),
              (n[0] = Qo(u + 1 / 3, s, o)),
              (n[1] = Qo(u, s, o)),
              (n[2] = Qo(u - 1 / 3, s, o));
          else if (~t.indexOf('='))
            return (n = t.match(fa)), i && n.length < 4 && (n[3] = 1), n;
        } else n = t.match(ra) || Ji.transparent;
        n = n.map(Number);
      }
      return (
        e &&
          !_ &&
          ((s = n[0] / ct),
          (o = n[1] / ct),
          (a = n[2] / ct),
          (d = Math.max(s, o, a)),
          (p = Math.min(s, o, a)),
          (c = (d + p) / 2),
          d === p
            ? (u = f = 0)
            : ((l = d - p),
              (f = c > 0.5 ? l / (2 - d - p) : l / (d + p)),
              (u =
                d === s
                  ? (o - a) / l + (o < a ? 6 : 0)
                  : d === o
                  ? (a - s) / l + 2
                  : (s - o) / l + 4),
              (u *= 60)),
          (n[0] = ~~(u + 0.5)),
          (n[1] = ~~(f * 100 + 0.5)),
          (n[2] = ~~(c * 100 + 0.5))),
        i && n.length < 4 && (n[3] = 1),
        n
      );
    },
    Vf = function (t) {
      var e = [],
        i = [],
        n = -1;
      return (
        t.split(Ne).forEach(function (s) {
          var o = s.match(Fr) || [];
          e.push.apply(e, o), i.push((n += o.length + 1));
        }),
        (e.c = i),
        e
      );
    },
    pf = function (t, e, i) {
      var n = '',
        s = (t + n).match(Ne),
        o = e ? 'hsla(' : 'rgba(',
        a = 0,
        u,
        f,
        c,
        d;
      if (!s) return t;
      if (
        ((s = s.map(function (p) {
          return (
            (p = Bf(p, e, 1)) &&
            o +
              (e
                ? p[0] + ',' + p[1] + '%,' + p[2] + '%,' + p[3]
                : p.join(',')) +
              ')'
          );
        })),
        i && ((c = Vf(t)), (u = i.c), u.join(n) !== c.c.join(n)))
      )
        for (f = t.replace(Ne, '1').split(Fr), d = f.length - 1; a < d; a++)
          n +=
            f[a] +
            (~u.indexOf(a)
              ? s.shift() || o + '0,0,0,0)'
              : (c.length ? c : s.length ? s : i).shift());
      if (!f)
        for (f = t.split(Ne), d = f.length - 1; a < d; a++) n += f[a] + s[a];
      return n + f[d];
    },
    Ne = (function () {
      var r =
          '(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b',
        t;
      for (t in Ji) r += '|' + t + '\\b';
      return new RegExp(r + ')', 'gi');
    })(),
    k_ = /hsl[a]?\(/,
    ma = function (t) {
      var e = t.join(' '),
        i;
      if (((Ne.lastIndex = 0), Ne.test(e)))
        return (
          (i = k_.test(e)),
          (t[1] = pf(t[1], i)),
          (t[0] = pf(t[0], i, Vf(t[1]))),
          !0
        );
    },
    vs,
    Kt = (function () {
      var r = Date.now,
        t = 500,
        e = 33,
        i = r(),
        n = i,
        s = 1e3 / 240,
        o = s,
        a = [],
        u,
        f,
        c,
        d,
        p,
        l,
        _ = function h(g) {
          var v = r() - n,
            m = g === !0,
            y,
            A,
            x,
            E;
          if (
            (v > t && (i += v - e),
            (n += v),
            (x = n - i),
            (y = x - o),
            (y > 0 || m) &&
              ((E = ++d.frame),
              (p = x - d.time * 1e3),
              (d.time = x = x / 1e3),
              (o += y + (y >= s ? 4 : s - y)),
              (A = 1)),
            m || (u = f(h)),
            A)
          )
            for (l = 0; l < a.length; l++) a[l](x, p, E, g);
        };
      return (
        (d = {
          time: 0,
          frame: 0,
          tick: function () {
            _(!0);
          },
          deltaRatio: function (g) {
            return p / (1e3 / (g || 60));
          },
          wake: function () {
            xf &&
              (!ia &&
                vf() &&
                ((Se = ia = window),
                (da = Se.document || {}),
                (Zt.gsap = ne),
                (Se.gsapVersions || (Se.gsapVersions = [])).push(ne.version),
                bf(hs || Se.GreenSockGlobals || (!Se.gsap && Se) || {}),
                (c = Se.requestAnimationFrame)),
              u && d.sleep(),
              (f =
                c ||
                function (g) {
                  return setTimeout(g, (o - d.time * 1e3 + 1) | 0);
                }),
              (vs = 1),
              _(2));
          },
          sleep: function () {
            (c ? Se.cancelAnimationFrame : clearTimeout)(u), (vs = 0), (f = ui);
          },
          lagSmoothing: function (g, v) {
            (t = g || 1 / ut), (e = Math.min(v, t, 0));
          },
          fps: function (g) {
            (s = 1e3 / (g || 240)), (o = d.time * 1e3 + s);
          },
          add: function (g) {
            a.indexOf(g) < 0 && a.push(g), di();
          },
          remove: function (g) {
            var v;
            ~(v = a.indexOf(g)) && a.splice(v, 1) && l >= v && l--;
          },
          _listeners: a,
        }),
        d
      );
    })(),
    di = function () {
      return !vs && Kt.wake();
    },
    it = {},
    D_ = /^[\d.\-M][\d.\-,\s]/,
    L_ = /["']/g,
    R_ = function (t) {
      for (
        var e = {},
          i = t.substr(1, t.length - 3).split(':'),
          n = i[0],
          s = 1,
          o = i.length,
          a,
          u,
          f;
        s < o;
        s++
      )
        (u = i[s]),
          (a = s !== o - 1 ? u.lastIndexOf(',') : u.length),
          (f = u.substr(0, a)),
          (e[n] = isNaN(f) ? f.replace(L_, '').trim() : +f),
          (n = u.substr(a + 1).trim());
      return e;
    },
    M_ = function (t) {
      var e = t.indexOf('(') + 1,
        i = t.indexOf(')'),
        n = t.indexOf('(', e);
      return t.substring(e, ~n && n < i ? t.indexOf(')', i + 1) : i);
    },
    I_ = function (t) {
      var e = (t + '').split('('),
        i = it[e[0]];
      return i && e.length > 1 && i.config
        ? i.config.apply(
            null,
            ~t.indexOf('{') ? [R_(e[1])] : M_(t).split(',').map(Sf),
          )
        : it._CE && D_.test(t)
        ? it._CE('', t)
        : i;
    },
    zf = function (t) {
      return function (e) {
        return 1 - t(1 - e);
      };
    },
    Wf = function r(t, e) {
      for (var i = t._first, n; i; )
        i instanceof Nt
          ? r(i, e)
          : i.vars.yoyoEase &&
            (!i._yoyo || !i._repeat) &&
            i._yoyo !== e &&
            (i.timeline
              ? r(i.timeline, e)
              : ((n = i._ease),
                (i._ease = i._yEase),
                (i._yEase = n),
                (i._yoyo = e))),
          (i = i._next);
    },
    oi = function (t, e) {
      return (t && (kt(t) ? t : it[t] || I_(t))) || e;
    },
    Br = function (t, e, i, n) {
      i === void 0 &&
        (i = function (u) {
          return 1 - e(1 - u);
        }),
        n === void 0 &&
          (n = function (u) {
            return u < 0.5 ? e(u * 2) / 2 : 1 - e((1 - u) * 2) / 2;
          });
      var s = { easeIn: e, easeOut: i, easeInOut: n },
        o;
      return (
        Yt(t, function (a) {
          (it[a] = Zt[a] = s), (it[(o = a.toLowerCase())] = i);
          for (var u in s)
            it[
              o + (u === 'easeIn' ? '.in' : u === 'easeOut' ? '.out' : '.inOut')
            ] = it[a + '.' + u] = s[u];
        }),
        s
      );
    },
    Hf = function (t) {
      return function (e) {
        return e < 0.5 ? (1 - t(1 - e * 2)) / 2 : 0.5 + t((e - 0.5) * 2) / 2;
      };
    },
    Zo = function r(t, e, i) {
      var n = e >= 1 ? e : 1,
        s = (i || (t ? 0.3 : 0.45)) / (e < 1 ? e : 1),
        o = (s / ea) * (Math.asin(1 / n) || 0),
        a = function (c) {
          return c === 1 ? 1 : n * Math.pow(2, -10 * c) * u_((c - o) * s) + 1;
        },
        u =
          t === 'out'
            ? a
            : t === 'in'
            ? function (f) {
                return 1 - a(1 - f);
              }
            : Hf(a);
      return (
        (s = ea / s),
        (u.config = function (f, c) {
          return r(t, f, c);
        }),
        u
      );
    },
    Jo = function r(t, e) {
      e === void 0 && (e = 1.70158);
      var i = function (o) {
          return o ? --o * o * ((e + 1) * o + e) + 1 : 0;
        },
        n =
          t === 'out'
            ? i
            : t === 'in'
            ? function (s) {
                return 1 - i(1 - s);
              }
            : Hf(i);
      return (
        (n.config = function (s) {
          return r(t, s);
        }),
        n
      );
    };
  Yt('Linear,Quad,Cubic,Quart,Quint,Strong', function (r, t) {
    var e = t < 5 ? t + 1 : t;
    Br(
      r + ',Power' + (e - 1),
      t
        ? function (i) {
            return Math.pow(i, e);
          }
        : function (i) {
            return i;
          },
      function (i) {
        return 1 - Math.pow(1 - i, e);
      },
      function (i) {
        return i < 0.5
          ? Math.pow(i * 2, e) / 2
          : 1 - Math.pow((1 - i) * 2, e) / 2;
      },
    );
  });
  it.Linear.easeNone = it.none = it.Linear.easeIn;
  Br('Elastic', Zo('in'), Zo('out'), Zo());
  (function (r, t) {
    var e = 1 / t,
      i = 2 * e,
      n = 2.5 * e,
      s = function (a) {
        return a < e
          ? r * a * a
          : a < i
          ? r * Math.pow(a - 1.5 / t, 2) + 0.75
          : a < n
          ? r * (a -= 2.25 / t) * a + 0.9375
          : r * Math.pow(a - 2.625 / t, 2) + 0.984375;
      };
    Br(
      'Bounce',
      function (o) {
        return 1 - s(1 - o);
      },
      s,
    );
  })(7.5625, 2.75);
  Br('Expo', function (r) {
    return r ? Math.pow(2, 10 * (r - 1)) : 0;
  });
  Br('Circ', function (r) {
    return -(gf(1 - r * r) - 1);
  });
  Br('Sine', function (r) {
    return r === 1 ? 1 : -a_(r * s_) + 1;
  });
  Br('Back', Jo('in'), Jo('out'), Jo());
  it.SteppedEase =
    it.steps =
    Zt.SteppedEase =
      {
        config: function (t, e) {
          t === void 0 && (t = 1);
          var i = 1 / t,
            n = t + (e ? 0 : 1),
            s = e ? 1 : 0,
            o = 1 - ut;
          return function (a) {
            return (((n * nn(0, o, a)) | 0) + s) * i;
          };
        },
      };
  ai.ease = it['quad.out'];
  Yt(
    'onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt',
    function (r) {
      return (pa += r + ',' + r + 'Params,');
    },
  );
  var ya = function (t, e) {
      (this.id = o_++),
        (t._gsap = this),
        (this.target = t),
        (this.harness = e),
        (this.get = e ? e.get : ga),
        (this.set = e ? e.getSetter : ws);
    },
    rn = (function () {
      function r(e) {
        (this.vars = e),
          (this._delay = +e.delay || 0),
          (this._repeat = e.repeat === 1 / 0 ? -2 : e.repeat || 0) &&
            ((this._rDelay = e.repeatDelay || 0),
            (this._yoyo = !!e.yoyo || !!e.yoyoEase)),
          (this._ts = 1),
          ci(this, +e.duration, 1, 1),
          (this.data = e.data),
          vs || Kt.wake();
      }
      var t = r.prototype;
      return (
        (t.delay = function (i) {
          return i || i === 0
            ? (this.parent &&
                this.parent.smoothChildTiming &&
                this.startTime(this._start + i - this._delay),
              (this._delay = i),
              this)
            : this._delay;
        }),
        (t.duration = function (i) {
          return arguments.length
            ? this.totalDuration(
                this._repeat > 0 ? i + (i + this._rDelay) * this._repeat : i,
              )
            : this.totalDuration() && this._dur;
        }),
        (t.totalDuration = function (i) {
          return arguments.length
            ? ((this._dirty = 0),
              ci(
                this,
                this._repeat < 0
                  ? i
                  : (i - this._repeat * this._rDelay) / (this._repeat + 1),
              ))
            : this._tDur;
        }),
        (t.totalTime = function (i, n) {
          if ((di(), !arguments.length)) return this._tTime;
          var s = this._dp;
          if (s && s.smoothChildTiming && this._ts) {
            for (Pf(this, i), !s._dp || s.parent || Cf(s, this); s.parent; )
              s.parent._time !==
                s._start +
                  (s._ts >= 0
                    ? s._tTime / s._ts
                    : (s.totalDuration() - s._tTime) / -s._ts) &&
                s.totalTime(s._tTime, !0),
                (s = s.parent);
            !this.parent &&
              this._dp.autoRemoveChildren &&
              ((this._ts > 0 && i < this._tDur) ||
                (this._ts < 0 && i > 0) ||
                (!this._tDur && !i)) &&
              Ae(this._dp, this, this._start - this._delay);
          }
          return (
            (this._tTime !== i ||
              (!this._dur && !n) ||
              (this._initted && Math.abs(this._zTime) === ut) ||
              (!i && !this._initted && (this.add || this._ptLookup))) &&
              (this._ts || (this._pTime = i), Ef(this, i, n)),
            this
          );
        }),
        (t.time = function (i, n) {
          return arguments.length
            ? this.totalTime(
                Math.min(this.totalDuration(), i + cf(this)) % this._dur ||
                  (i ? this._dur : 0),
                n,
              )
            : this._time;
        }),
        (t.totalProgress = function (i, n) {
          return arguments.length
            ? this.totalTime(this.totalDuration() * i, n)
            : this.totalDuration()
            ? Math.min(1, this._tTime / this._tDur)
            : this.ratio;
        }),
        (t.progress = function (i, n) {
          return arguments.length
            ? this.totalTime(
                this.duration() *
                  (this._yoyo && !(this.iteration() & 1) ? 1 - i : i) +
                  cf(this),
                n,
              )
            : this.duration()
            ? Math.min(1, this._time / this._dur)
            : this.ratio;
        }),
        (t.iteration = function (i, n) {
          var s = this.duration() + this._rDelay;
          return arguments.length
            ? this.totalTime(this._time + (i - 1) * s, n)
            : this._repeat
            ? fi(this._tTime, s) + 1
            : 1;
        }),
        (t.timeScale = function (i) {
          if (!arguments.length) return this._rts === -ut ? 0 : this._rts;
          if (this._rts === i) return this;
          var n =
            this.parent && this._ts ? gs(this.parent._time, this) : this._tTime;
          return (
            (this._rts = +i || 0),
            (this._ts = this._ps || i === -ut ? 0 : this._rts),
            p_(this.totalTime(nn(-this._delay, this._tDur, n), !0))
          );
        }),
        (t.paused = function (i) {
          return arguments.length
            ? (this._ps !== i &&
                ((this._ps = i),
                i
                  ? ((this._pTime =
                      this._tTime || Math.max(-this._delay, this.rawTime())),
                    (this._ts = this._act = 0))
                  : (di(),
                    (this._ts = this._rts),
                    this.totalTime(
                      this.parent && !this.parent.smoothChildTiming
                        ? this.rawTime()
                        : this._tTime || this._pTime,
                      this.progress() === 1 &&
                        (this._tTime -= ut) &&
                        Math.abs(this._zTime) !== ut,
                    ))),
              this)
            : this._ps;
        }),
        (t.startTime = function (i) {
          if (arguments.length) {
            this._start = i;
            var n = this.parent || this._dp;
            return (
              n && (n._sort || !this.parent) && Ae(n, this, i - this._delay),
              this
            );
          }
          return this._start;
        }),
        (t.endTime = function (i) {
          return (
            this._start +
            (Xt(i) ? this.totalDuration() : this.duration()) /
              Math.abs(this._ts)
          );
        }),
        (t.rawTime = function (i) {
          var n = this.parent || this._dp;
          return n
            ? i &&
              (!this._ts ||
                (this._repeat && this._time && this.totalProgress() < 1))
              ? this._tTime % (this._dur + this._rDelay)
              : this._ts
              ? gs(n.rawTime(i), this)
              : this._tTime
            : this._tTime;
        }),
        (t.globalTime = function (i) {
          for (var n = this, s = arguments.length ? i : n.rawTime(); n; )
            (s = n._start + s / (n._ts || 1)), (n = n._dp);
          return s;
        }),
        (t.repeat = function (i) {
          return arguments.length
            ? ((this._repeat = i === 1 / 0 ? -2 : i), df(this))
            : this._repeat === -2
            ? 1 / 0
            : this._repeat;
        }),
        (t.repeatDelay = function (i) {
          return arguments.length
            ? ((this._rDelay = i), df(this))
            : this._rDelay;
        }),
        (t.yoyo = function (i) {
          return arguments.length ? ((this._yoyo = i), this) : this._yoyo;
        }),
        (t.seek = function (i, n) {
          return this.totalTime(ee(this, i), Xt(n));
        }),
        (t.restart = function (i, n) {
          return this.play().totalTime(i ? -this._delay : 0, Xt(n));
        }),
        (t.play = function (i, n) {
          return i != null && this.seek(i, n), this.reversed(!1).paused(!1);
        }),
        (t.reverse = function (i, n) {
          return (
            i != null && this.seek(i || this.totalDuration(), n),
            this.reversed(!0).paused(!1)
          );
        }),
        (t.pause = function (i, n) {
          return i != null && this.seek(i, n), this.paused(!0);
        }),
        (t.resume = function () {
          return this.paused(!1);
        }),
        (t.reversed = function (i) {
          return arguments.length
            ? (!!i !== this.reversed() &&
                this.timeScale(-this._rts || (i ? -ut : 0)),
              this)
            : this._rts < 0;
        }),
        (t.invalidate = function () {
          return (this._initted = this._act = 0), (this._zTime = -ut), this;
        }),
        (t.isActive = function () {
          var i = this.parent || this._dp,
            n = this._start,
            s;
          return !!(
            !i ||
            (this._ts &&
              this._initted &&
              i.isActive() &&
              (s = i.rawTime(!0)) >= n &&
              s < this.endTime(!0) - ut)
          );
        }),
        (t.eventCallback = function (i, n, s) {
          var o = this.vars;
          return arguments.length > 1
            ? (n
                ? ((o[i] = n),
                  s && (o[i + 'Params'] = s),
                  i === 'onUpdate' && (this._onUpdate = n))
                : delete o[i],
              this)
            : o[i];
        }),
        (t.then = function (i) {
          var n = this;
          return new Promise(function (s) {
            var o = kt(i) ? i : Af,
              a = function () {
                var f = n.then;
                (n.then = null),
                  kt(o) && (o = o(n)) && (o.then || o === n) && (n.then = f),
                  s(o),
                  (n.then = f);
              };
            (n._initted && n.totalProgress() === 1 && n._ts >= 0) ||
            (!n._tTime && n._ts < 0)
              ? a()
              : (n._prom = a);
          });
        }),
        (t.kill = function () {
          Zi(this);
        }),
        r
      );
    })();
  ie(rn.prototype, {
    _time: 0,
    _start: 0,
    _end: 0,
    _tTime: 0,
    _tDur: 0,
    _dirty: 0,
    _repeat: 0,
    _yoyo: !1,
    parent: null,
    _initted: !1,
    _rDelay: 0,
    _ts: 1,
    _dp: 0,
    ratio: 0,
    _zTime: -ut,
    _prom: 0,
    _ps: !1,
    _rts: 1,
  });
  var Nt = (function (r) {
    _f(t, r);
    function t(i, n) {
      var s;
      return (
        i === void 0 && (i = {}),
        (s = r.call(this, i) || this),
        (s.labels = {}),
        (s.smoothChildTiming = !!i.smoothChildTiming),
        (s.autoRemoveChildren = !!i.autoRemoveChildren),
        (s._sort = Xt(i.sortChildren)),
        vt && Ae(i.parent || vt, Ie(s), n),
        i.reversed && s.reverse(),
        i.paused && s.paused(!0),
        i.scrollTrigger && Of(Ie(s), i.scrollTrigger),
        s
      );
    }
    var e = t.prototype;
    return (
      (e.to = function (n, s, o) {
        return tn(0, arguments, this), this;
      }),
      (e.from = function (n, s, o) {
        return tn(1, arguments, this), this;
      }),
      (e.fromTo = function (n, s, o, a) {
        return tn(2, arguments, this), this;
      }),
      (e.set = function (n, s, o) {
        return (
          (s.duration = 0),
          (s.parent = this),
          ds(s).repeatDelay || (s.repeat = 0),
          (s.immediateRender = !!s.immediateRender),
          new St(n, s, ee(this, o), 1),
          this
        );
      }),
      (e.call = function (n, s, o) {
        return Ae(this, St.delayedCall(0, n, s), o);
      }),
      (e.staggerTo = function (n, s, o, a, u, f, c) {
        return (
          (o.duration = s),
          (o.stagger = o.stagger || a),
          (o.onComplete = f),
          (o.onCompleteParams = c),
          (o.parent = this),
          new St(n, o, ee(this, u)),
          this
        );
      }),
      (e.staggerFrom = function (n, s, o, a, u, f, c) {
        return (
          (o.runBackwards = 1),
          (ds(o).immediateRender = Xt(o.immediateRender)),
          this.staggerTo(n, s, o, a, u, f, c)
        );
      }),
      (e.staggerFromTo = function (n, s, o, a, u, f, c, d) {
        return (
          (a.startAt = o),
          (ds(a).immediateRender = Xt(a.immediateRender)),
          this.staggerTo(n, s, a, u, f, c, d)
        );
      }),
      (e.render = function (n, s, o) {
        var a = this._time,
          u = this._dirty ? this.totalDuration() : this._tDur,
          f = this._dur,
          c = this !== vt && n > u - ut && n >= 0 ? u : n < ut ? 0 : n,
          d = this._zTime < 0 != n < 0 && (this._initted || !f),
          p,
          l,
          _,
          h,
          g,
          v,
          m,
          y,
          A,
          x,
          E,
          w;
        if (c !== this._tTime || o || d) {
          if (
            (a !== this._time &&
              f &&
              ((c += this._time - a), (n += this._time - a)),
            (p = c),
            (A = this._start),
            (y = this._ts),
            (v = !y),
            d && (f || (a = this._zTime), (n || !s) && (this._zTime = n)),
            this._repeat)
          ) {
            if (
              ((E = this._yoyo),
              (g = f + this._rDelay),
              this._repeat < -1 && n < 0)
            )
              return this.totalTime(g * 100 + n, s, o);
            if (
              ((p = et(c % g)),
              c === u
                ? ((h = this._repeat), (p = f))
                : ((h = ~~(c / g)),
                  h && h === c / g && ((p = f), h--),
                  p > f && (p = f)),
              (x = fi(this._tTime, g)),
              !a && this._tTime && x !== h && (x = h),
              E && h & 1 && ((p = f - p), (w = 1)),
              h !== x && !this._lock)
            ) {
              var S = E && x & 1,
                k = S === (E && h & 1);
              if (
                (h < x && (S = !S),
                (a = S ? 0 : f),
                (this._lock = 1),
                (this.render(a || (w ? 0 : et(h * g)), s, !f)._lock = 0),
                (this._tTime = c),
                !s && this.parent && jt(this, 'onRepeat'),
                this.vars.repeatRefresh && !w && (this.invalidate()._lock = 1),
                (a && a !== this._time) ||
                  v !== !this._ts ||
                  (this.vars.onRepeat && !this.parent && !this._act))
              )
                return this;
              if (
                ((f = this._dur),
                (u = this._tDur),
                k &&
                  ((this._lock = 2),
                  (a = S ? f : -1e-4),
                  this.render(a, !0),
                  this.vars.repeatRefresh && !w && this.invalidate()),
                (this._lock = 0),
                !this._ts && !v)
              )
                return this;
              Wf(this, w);
            }
          }
          if (
            (this._hasPause &&
              !this._forcing &&
              this._lock < 2 &&
              ((m = m_(this, et(a), et(p))), m && (c -= p - (p = m._start))),
            (this._tTime = c),
            (this._time = p),
            (this._act = !y),
            this._initted ||
              ((this._onUpdate = this.vars.onUpdate),
              (this._initted = 1),
              (this._zTime = n),
              (a = 0)),
            !a && p && !s && (jt(this, 'onStart'), this._tTime !== c))
          )
            return this;
          if (p >= a && n >= 0)
            for (l = this._first; l; ) {
              if (
                ((_ = l._next), (l._act || p >= l._start) && l._ts && m !== l)
              ) {
                if (l.parent !== this) return this.render(n, s, o);
                if (
                  (l.render(
                    l._ts > 0
                      ? (p - l._start) * l._ts
                      : (l._dirty ? l.totalDuration() : l._tDur) +
                          (p - l._start) * l._ts,
                    s,
                    o,
                  ),
                  p !== this._time || (!this._ts && !v))
                ) {
                  (m = 0), _ && (c += this._zTime = -ut);
                  break;
                }
              }
              l = _;
            }
          else {
            l = this._last;
            for (var M = n < 0 ? n : p; l; ) {
              if (
                ((_ = l._prev), (l._act || M <= l._end) && l._ts && m !== l)
              ) {
                if (l.parent !== this) return this.render(n, s, o);
                if (
                  (l.render(
                    l._ts > 0
                      ? (M - l._start) * l._ts
                      : (l._dirty ? l.totalDuration() : l._tDur) +
                          (M - l._start) * l._ts,
                    s,
                    o,
                  ),
                  p !== this._time || (!this._ts && !v))
                ) {
                  (m = 0), _ && (c += this._zTime = M ? -ut : ut);
                  break;
                }
              }
              l = _;
            }
          }
          if (
            m &&
            !s &&
            (this.pause(),
            (m.render(p >= a ? 0 : -ut)._zTime = p >= a ? 1 : -1),
            this._ts)
          )
            return (this._start = A), va(this), this.render(n, s, o);
          this._onUpdate && !s && jt(this, 'onUpdate', !0),
            ((c === u && u >= this.totalDuration()) || (!c && a)) &&
              (A === this._start || Math.abs(y) !== Math.abs(this._ts)) &&
              (this._lock ||
                ((n || !f) &&
                  ((c === u && this._ts > 0) || (!c && this._ts < 0)) &&
                  nr(this, 1),
                !s &&
                  !(n < 0 && !a) &&
                  (c || a || !u) &&
                  (jt(
                    this,
                    c === u && n >= 0 ? 'onComplete' : 'onReverseComplete',
                    !0,
                  ),
                  this._prom &&
                    !(c < u && this.timeScale() > 0) &&
                    this._prom())));
        }
        return this;
      }),
      (e.add = function (n, s) {
        var o = this;
        if ((Fe(s) || (s = ee(this, s, n)), !(n instanceof rn))) {
          if (Qt(n))
            return (
              n.forEach(function (a) {
                return o.add(a, s);
              }),
              this
            );
          if (Lt(n)) return this.addLabel(n, s);
          if (kt(n)) n = St.delayedCall(0, n);
          else return this;
        }
        return this !== n ? Ae(this, n, s) : this;
      }),
      (e.getChildren = function (n, s, o, a) {
        n === void 0 && (n = !0),
          s === void 0 && (s = !0),
          o === void 0 && (o = !0),
          a === void 0 && (a = -Pe);
        for (var u = [], f = this._first; f; )
          f._start >= a &&
            (f instanceof St
              ? s && u.push(f)
              : (o && u.push(f),
                n && u.push.apply(u, f.getChildren(!0, s, o)))),
            (f = f._next);
        return u;
      }),
      (e.getById = function (n) {
        for (var s = this.getChildren(1, 1, 1), o = s.length; o--; )
          if (s[o].vars.id === n) return s[o];
      }),
      (e.remove = function (n) {
        return Lt(n)
          ? this.removeLabel(n)
          : kt(n)
          ? this.killTweensOf(n)
          : (bs(this, n),
            n === this._recent && (this._recent = this._last),
            Nr(this));
      }),
      (e.totalTime = function (n, s) {
        return arguments.length
          ? ((this._forcing = 1),
            !this._dp &&
              this._ts &&
              (this._start = et(
                Kt.time -
                  (this._ts > 0
                    ? n / this._ts
                    : (this.totalDuration() - n) / -this._ts),
              )),
            r.prototype.totalTime.call(this, n, s),
            (this._forcing = 0),
            this)
          : this._tTime;
      }),
      (e.addLabel = function (n, s) {
        return (this.labels[n] = ee(this, s)), this;
      }),
      (e.removeLabel = function (n) {
        return delete this.labels[n], this;
      }),
      (e.addPause = function (n, s, o) {
        var a = St.delayedCall(0, s || ui, o);
        return (
          (a.data = 'isPause'), (this._hasPause = 1), Ae(this, a, ee(this, n))
        );
      }),
      (e.removePause = function (n) {
        var s = this._first;
        for (n = ee(this, n); s; )
          s._start === n && s.data === 'isPause' && nr(s), (s = s._next);
      }),
      (e.killTweensOf = function (n, s, o) {
        for (var a = this.getTweensOf(n, o), u = a.length; u--; )
          er !== a[u] && a[u].kill(n, s);
        return this;
      }),
      (e.getTweensOf = function (n, s) {
        for (var o = [], a = re(n), u = this._first, f = Fe(s), c; u; )
          u instanceof St
            ? f_(u._targets, a) &&
              (f
                ? (!er || (u._initted && u._ts)) &&
                  u.globalTime(0) <= s &&
                  u.globalTime(u.totalDuration()) > s
                : !s || u.isActive()) &&
              o.push(u)
            : (c = u.getTweensOf(a, s)).length && o.push.apply(o, c),
            (u = u._next);
        return o;
      }),
      (e.tweenTo = function (n, s) {
        s = s || {};
        var o = this,
          a = ee(o, n),
          u = s,
          f = u.startAt,
          c = u.onStart,
          d = u.onStartParams,
          p = u.immediateRender,
          l,
          _ = St.to(
            o,
            ie(
              {
                ease: s.ease || 'none',
                lazy: !1,
                immediateRender: !1,
                time: a,
                overwrite: 'auto',
                duration:
                  s.duration ||
                  Math.abs(
                    (a - (f && 'time' in f ? f.time : o._time)) / o.timeScale(),
                  ) ||
                  ut,
                onStart: function () {
                  if ((o.pause(), !l)) {
                    var g =
                      s.duration ||
                      Math.abs(
                        (a - (f && 'time' in f ? f.time : o._time)) /
                          o.timeScale(),
                      );
                    _._dur !== g && ci(_, g, 0, 1).render(_._time, !0, !0),
                      (l = 1);
                  }
                  c && c.apply(_, d || []);
                },
              },
              s,
            ),
          );
        return p ? _.render(0) : _;
      }),
      (e.tweenFromTo = function (n, s, o) {
        return this.tweenTo(s, ie({ startAt: { time: ee(this, n) } }, o));
      }),
      (e.recent = function () {
        return this._recent;
      }),
      (e.nextLabel = function (n) {
        return n === void 0 && (n = this._time), hf(this, ee(this, n));
      }),
      (e.previousLabel = function (n) {
        return n === void 0 && (n = this._time), hf(this, ee(this, n), 1);
      }),
      (e.currentLabel = function (n) {
        return arguments.length
          ? this.seek(n, !0)
          : this.previousLabel(this._time + ut);
      }),
      (e.shiftChildren = function (n, s, o) {
        o === void 0 && (o = 0);
        for (var a = this._first, u = this.labels, f; a; )
          a._start >= o && ((a._start += n), (a._end += n)), (a = a._next);
        if (s) for (f in u) u[f] >= o && (u[f] += n);
        return Nr(this);
      }),
      (e.invalidate = function () {
        var n = this._first;
        for (this._lock = 0; n; ) n.invalidate(), (n = n._next);
        return r.prototype.invalidate.call(this);
      }),
      (e.clear = function (n) {
        n === void 0 && (n = !0);
        for (var s = this._first, o; s; )
          (o = s._next), this.remove(s), (s = o);
        return (
          this._dp && (this._time = this._tTime = this._pTime = 0),
          n && (this.labels = {}),
          Nr(this)
        );
      }),
      (e.totalDuration = function (n) {
        var s = 0,
          o = this,
          a = o._last,
          u = Pe,
          f,
          c,
          d;
        if (arguments.length)
          return o.timeScale(
            (o._repeat < 0 ? o.duration() : o.totalDuration()) /
              (o.reversed() ? -n : n),
          );
        if (o._dirty) {
          for (d = o.parent; a; )
            (f = a._prev),
              a._dirty && a.totalDuration(),
              (c = a._start),
              c > u && o._sort && a._ts && !o._lock
                ? ((o._lock = 1), (Ae(o, a, c - a._delay, 1)._lock = 0))
                : (u = c),
              c < 0 &&
                a._ts &&
                ((s -= c),
                ((!d && !o._dp) || (d && d.smoothChildTiming)) &&
                  ((o._start += c / o._ts), (o._time -= c), (o._tTime -= c)),
                o.shiftChildren(-c, !1, -1 / 0),
                (u = 0)),
              a._end > s && a._ts && (s = a._end),
              (a = f);
          ci(o, o === vt && o._time > s ? o._time : s, 1, 1), (o._dirty = 0);
        }
        return o._tDur;
      }),
      (t.updateRoot = function (n) {
        if ((vt._ts && (Ef(vt, gs(n, vt)), (Tf = Kt.frame)), Kt.frame >= lf)) {
          lf += Vt.autoSleep || 120;
          var s = vt._first;
          if ((!s || !s._ts) && Vt.autoSleep && Kt._listeners.length < 2) {
            for (; s && !s._ts; ) s = s._next;
            s || Kt.sleep();
          }
        }
      }),
      t
    );
  })(rn);
  ie(Nt.prototype, { _lock: 0, _hasPause: 0, _forcing: 0 });
  var N_ = function (t, e, i, n, s, o, a) {
      var u = new zt(this._pt, t, e, 0, 1, Ta, null, s),
        f = 0,
        c = 0,
        d,
        p,
        l,
        _,
        h,
        g,
        v,
        m;
      for (
        u.b = i,
          u.e = n,
          i += '',
          n += '',
          (v = ~n.indexOf('random(')) && (n = sn(n)),
          o && ((m = [i, n]), o(m, t, e), (i = m[0]), (n = m[1])),
          p = i.match(jo) || [];
        (d = jo.exec(n));

      )
        (_ = d[0]),
          (h = n.substring(f, d.index)),
          l ? (l = (l + 1) % 5) : h.substr(-5) === 'rgba(' && (l = 1),
          _ !== p[c++] &&
            ((g = parseFloat(p[c - 1]) || 0),
            (u._pt = {
              _next: u._pt,
              p: h || c === 1 ? h : ',',
              s: g,
              c:
                _.charAt(1) === '='
                  ? parseFloat(_.substr(2)) * (_.charAt(0) === '-' ? -1 : 1)
                  : parseFloat(_) - g,
              m: l && l < 4 ? Math.round : 0,
            }),
            (f = jo.lastIndex));
      return (
        (u.c = f < n.length ? n.substring(f, n.length) : ''),
        (u.fp = a),
        (ca.test(n) || v) && (u.e = 0),
        (this._pt = u),
        u
      );
    },
    xa = function (t, e, i, n, s, o, a, u, f) {
      kt(n) && (n = n(s || 0, t, o));
      var c = t[e],
        d =
          i !== 'get'
            ? i
            : kt(c)
            ? f
              ? t[
                  e.indexOf('set') || !kt(t['get' + e.substr(3)])
                    ? e
                    : 'get' + e.substr(3)
                ](f)
              : t[e]()
            : c,
        p = kt(c) ? (f ? W_ : Yf) : wa,
        l;
      if (
        (Lt(n) &&
          (~n.indexOf('random(') && (n = sn(n)),
          n.charAt(1) === '=' &&
            ((l =
              parseFloat(d) +
              parseFloat(n.substr(2)) * (n.charAt(0) === '-' ? -1 : 1) +
              ($t(d) || 0)),
            (l || l === 0) && (n = l))),
        d !== n)
      )
        return !isNaN(d * n) && n !== ''
          ? ((l = new zt(
              this._pt,
              t,
              e,
              +d || 0,
              n - (d || 0),
              typeof c == 'boolean' ? X_ : $f,
              0,
              p,
            )),
            f && (l.fp = f),
            a && l.modifier(a, this, t),
            (this._pt = l))
          : (!c && !(e in t) && xs(e, n),
            N_.call(this, t, e, d, n, p, u || Vt.stringFilter, f));
    },
    F_ = function (t, e, i, n, s) {
      if (
        (kt(t) && (t = en(t, s, e, i, n)),
        !Be(t) || (t.style && t.nodeType) || Qt(t) || mf(t))
      )
        return Lt(t) ? en(t, s, e, i, n) : t;
      var o = {},
        a;
      for (a in t) o[a] = en(t[a], s, e, i, n);
      return o;
    },
    ba = function (t, e, i, n, s, o) {
      var a, u, f, c;
      if (
        Ht[t] &&
        (a = new Ht[t]()).init(
          s,
          a.rawVars ? e[t] : F_(e[t], n, s, o, i),
          i,
          n,
          o,
        ) !== !1 &&
        ((i._pt = u = new zt(i._pt, s, t, 0, 1, a.render, a, 0, a.priority)),
        i !== si)
      )
        for (f = i._ptLookup[i._targets.indexOf(s)], c = a._props.length; c--; )
          f[a._props[c]] = u;
      return a;
    },
    er,
    B_ = function r(t, e) {
      var i = t.vars,
        n = i.ease,
        s = i.startAt,
        o = i.immediateRender,
        a = i.lazy,
        u = i.onUpdate,
        f = i.onUpdateParams,
        c = i.callbackScope,
        d = i.runBackwards,
        p = i.yoyoEase,
        l = i.keyframes,
        _ = i.autoRevert,
        h = t._dur,
        g = t._startAt,
        v = t._targets,
        m = t.parent,
        y = m && m.data === 'nested' ? m.parent._targets : v,
        A = t._overwrite === 'auto' && !la,
        x = t.timeline,
        E,
        w,
        S,
        k,
        M,
        O,
        P,
        T,
        D,
        R,
        W,
        Y,
        z;
      if (
        (x && (!l || !n) && (n = 'none'),
        (t._ease = oi(n, ai.ease)),
        (t._yEase = p ? zf(oi(p === !0 ? n : p, ai.ease)) : 0),
        p &&
          t._yoyo &&
          !t._repeat &&
          ((p = t._yEase), (t._yEase = t._ease), (t._ease = p)),
        (t._from = !x && !!i.runBackwards),
        !x)
      ) {
        if (
          ((T = v[0] ? ir(v[0]).harness : 0),
          (Y = T && i[T.prop]),
          (E = sa(i, ha)),
          g && g.render(-1, !0).kill(),
          s)
        )
          if (
            (nr(
              (t._startAt = St.set(
                v,
                ie(
                  {
                    data: 'isStart',
                    overwrite: !1,
                    parent: m,
                    immediateRender: !0,
                    lazy: Xt(a),
                    startAt: null,
                    delay: 0,
                    onUpdate: u,
                    onUpdateParams: f,
                    callbackScope: c,
                    stagger: 0,
                  },
                  s,
                ),
              )),
            ),
            e < 0 && !o && !_ && t._startAt.render(-1, !0),
            o)
          ) {
            if ((e > 0 && !_ && (t._startAt = 0), h && e <= 0)) {
              e && (t._zTime = e);
              return;
            }
          } else _ === !1 && (t._startAt = 0);
        else if (d && h) {
          if (g) !_ && (t._startAt = 0);
          else if (
            (e && (o = !1),
            (S = ie(
              {
                overwrite: !1,
                data: 'isFromStart',
                lazy: o && Xt(a),
                immediateRender: o,
                stagger: 0,
                parent: m,
              },
              E,
            )),
            Y && (S[T.prop] = Y),
            nr((t._startAt = St.set(v, S))),
            e < 0 && t._startAt.render(-1, !0),
            !o)
          )
            r(t._startAt, ut);
          else if (!e) return;
        }
        for (
          t._pt = 0, a = (h && Xt(a)) || (a && !h), w = 0;
          w < v.length;
          w++
        ) {
          if (
            ((M = v[w]),
            (P = M._gsap || _a(v)[w]._gsap),
            (t._ptLookup[w] = R = {}),
            na[P.id] && rr.length && _s(),
            (W = y === v ? w : y.indexOf(M)),
            T &&
              (D = new T()).init(M, Y || E, t, W, y) !== !1 &&
              ((t._pt = k =
                new zt(t._pt, M, D.name, 0, 1, D.render, D, 0, D.priority)),
              D._props.forEach(function ($) {
                R[$] = k;
              }),
              D.priority && (O = 1)),
            !T || Y)
          )
            for (S in E)
              Ht[S] && (D = ba(S, E, t, W, M, y))
                ? D.priority && (O = 1)
                : (R[S] = k =
                    xa.call(t, M, S, 'get', E[S], W, y, 0, i.stringFilter));
          t._op && t._op[w] && t.kill(M, t._op[w]),
            A &&
              t._pt &&
              ((er = t),
              vt.killTweensOf(M, R, t.globalTime(0)),
              (z = !t.parent),
              (er = 0)),
            t._pt && a && (na[P.id] = 1);
        }
        O && Sa(t), t._onInit && t._onInit(t);
      }
      (t._onUpdate = u), (t._initted = (!t._op || t._pt) && !z);
    },
    V_ = function (t, e) {
      var i = t[0] ? ir(t[0]).harness : 0,
        n = i && i.aliases,
        s,
        o,
        a,
        u;
      if (!n) return e;
      s = li({}, e);
      for (o in n)
        if (o in s)
          for (u = n[o].split(','), a = u.length; a--; ) s[u[a]] = s[o];
      return s;
    },
    en = function (t, e, i, n, s) {
      return kt(t)
        ? t.call(e, i, n, s)
        : Lt(t) && ~t.indexOf('random(')
        ? sn(t)
        : t;
    },
    Xf = pa + 'repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase',
    z_ = (Xf + ',id,stagger,delay,duration,paused,scrollTrigger').split(','),
    St = (function (r) {
      _f(t, r);
      function t(i, n, s, o) {
        var a;
        typeof n == 'number' && ((s.duration = n), (n = s), (s = null)),
          (a = r.call(this, o ? n : ds(n)) || this);
        var u = a.vars,
          f = u.duration,
          c = u.delay,
          d = u.immediateRender,
          p = u.stagger,
          l = u.overwrite,
          _ = u.keyframes,
          h = u.defaults,
          g = u.scrollTrigger,
          v = u.yoyoEase,
          m = n.parent || vt,
          y = (Qt(i) || mf(i) ? Fe(i[0]) : 'length' in n) ? [i] : re(i),
          A,
          x,
          E,
          w,
          S,
          k,
          M,
          O;
        if (
          ((a._targets = y.length
            ? _a(y)
            : ps(
                'GSAP target ' + i + ' not found. https://greensock.com',
                !Vt.nullTargetWarn,
              ) || []),
          (a._ptLookup = []),
          (a._overwrite = l),
          _ || p || uf(f) || uf(c))
        ) {
          if (
            ((n = a.vars),
            (A = a.timeline = new Nt({ data: 'nested', defaults: h || {} })),
            A.kill(),
            (A.parent = A._dp = Ie(a)),
            (A._start = 0),
            _)
          )
            ie(A.vars.defaults, { ease: 'none' }),
              p
                ? y.forEach(function (P, T) {
                    return _.forEach(function (D, R) {
                      return A.to(P, D, R ? '>' : T * p);
                    });
                  })
                : _.forEach(function (P) {
                    return A.to(y, P, '>');
                  });
          else {
            if (((w = y.length), (M = p ? Rf(p) : ui), Be(p)))
              for (S in p) ~Xf.indexOf(S) && (O || (O = {}), (O[S] = p[S]));
            for (x = 0; x < w; x++) {
              E = {};
              for (S in n) z_.indexOf(S) < 0 && (E[S] = n[S]);
              (E.stagger = 0),
                v && (E.yoyoEase = v),
                O && li(E, O),
                (k = y[x]),
                (E.duration = +en(f, Ie(a), x, k, y)),
                (E.delay = (+en(c, Ie(a), x, k, y) || 0) - a._delay),
                !p &&
                  w === 1 &&
                  E.delay &&
                  ((a._delay = c = E.delay), (a._start += c), (E.delay = 0)),
                A.to(k, E, M(x, k, y));
            }
            A.duration() ? (f = c = 0) : (a.timeline = 0);
          }
          f || a.duration((f = A.duration()));
        } else a.timeline = 0;
        return (
          l === !0 && !la && ((er = Ie(a)), vt.killTweensOf(y), (er = 0)),
          Ae(m, Ie(a), s),
          n.reversed && a.reverse(),
          n.paused && a.paused(!0),
          (d ||
            (!f &&
              !_ &&
              a._start === et(m._time) &&
              Xt(d) &&
              __(Ie(a)) &&
              m.data !== 'nested')) &&
            ((a._tTime = -ut), a.render(Math.max(0, -c))),
          g && Of(Ie(a), g),
          a
        );
      }
      var e = t.prototype;
      return (
        (e.render = function (n, s, o) {
          var a = this._time,
            u = this._tDur,
            f = this._dur,
            c = n > u - ut && n >= 0 ? u : n < ut ? 0 : n,
            d,
            p,
            l,
            _,
            h,
            g,
            v,
            m,
            y;
          if (!f) v_(this, n, s, o);
          else if (
            c !== this._tTime ||
            !n ||
            o ||
            (!this._initted && this._tTime) ||
            (this._startAt && this._zTime < 0 != n < 0)
          ) {
            if (((d = c), (m = this.timeline), this._repeat)) {
              if (((_ = f + this._rDelay), this._repeat < -1 && n < 0))
                return this.totalTime(_ * 100 + n, s, o);
              if (
                ((d = et(c % _)),
                c === u
                  ? ((l = this._repeat), (d = f))
                  : ((l = ~~(c / _)),
                    l && l === c / _ && ((d = f), l--),
                    d > f && (d = f)),
                (g = this._yoyo && l & 1),
                g && ((y = this._yEase), (d = f - d)),
                (h = fi(this._tTime, _)),
                d === a && !o && this._initted)
              )
                return this;
              l !== h &&
                (m && this._yEase && Wf(m, g),
                this.vars.repeatRefresh &&
                  !g &&
                  !this._lock &&
                  ((this._lock = o = 1),
                  (this.render(et(_ * l), !0).invalidate()._lock = 0)));
            }
            if (!this._initted) {
              if (kf(this, n < 0 ? n : d, o, s)) return (this._tTime = 0), this;
              if (f !== this._dur) return this.render(n, s, o);
            }
            if (
              ((this._tTime = c),
              (this._time = d),
              !this._act && this._ts && ((this._act = 1), (this._lazy = 0)),
              (this.ratio = v = (y || this._ease)(d / f)),
              this._from && (this.ratio = v = 1 - v),
              d && !a && !s && jt(this, 'onStart'),
              d && !a && !s && (jt(this, 'onStart'), this._tTime !== c))
            )
              return this;
            for (p = this._pt; p; ) p.r(v, p.d), (p = p._next);
            (m && m.render(n < 0 ? n : !d && g ? -ut : m._dur * v, s, o)) ||
              (this._startAt && (this._zTime = n)),
              this._onUpdate &&
                !s &&
                (n < 0 && this._startAt && this._startAt.render(n, !0, o),
                jt(this, 'onUpdate')),
              this._repeat &&
                l !== h &&
                this.vars.onRepeat &&
                !s &&
                this.parent &&
                jt(this, 'onRepeat'),
              (c === this._tDur || !c) &&
                this._tTime === c &&
                (n < 0 &&
                  this._startAt &&
                  !this._onUpdate &&
                  this._startAt.render(n, !0, !0),
                (n || !f) &&
                  ((c === this._tDur && this._ts > 0) ||
                    (!c && this._ts < 0)) &&
                  nr(this, 1),
                !s &&
                  !(n < 0 && !a) &&
                  (c || a) &&
                  (jt(this, c === u ? 'onComplete' : 'onReverseComplete', !0),
                  this._prom &&
                    !(c < u && this.timeScale() > 0) &&
                    this._prom()));
          }
          return this;
        }),
        (e.targets = function () {
          return this._targets;
        }),
        (e.invalidate = function () {
          return (
            (this._pt =
              this._op =
              this._startAt =
              this._onUpdate =
              this._lazy =
              this.ratio =
                0),
            (this._ptLookup = []),
            this.timeline && this.timeline.invalidate(),
            r.prototype.invalidate.call(this)
          );
        }),
        (e.kill = function (n, s) {
          if ((s === void 0 && (s = 'all'), !n && (!s || s === 'all')))
            return (this._lazy = this._pt = 0), this.parent ? Zi(this) : this;
          if (this.timeline) {
            var o = this.timeline.totalDuration();
            return (
              this.timeline.killTweensOf(n, s, er && er.vars.overwrite !== !0)
                ._first || Zi(this),
              this.parent &&
                o !== this.timeline.totalDuration() &&
                ci(this, (this._dur * this.timeline._tDur) / o, 0, 1),
              this
            );
          }
          var a = this._targets,
            u = n ? re(n) : a,
            f = this._ptLookup,
            c = this._pt,
            d,
            p,
            l,
            _,
            h,
            g,
            v;
          if ((!s || s === 'all') && d_(a, u))
            return s === 'all' && (this._pt = 0), Zi(this);
          for (
            d = this._op = this._op || [],
              s !== 'all' &&
                (Lt(s) &&
                  ((h = {}),
                  Yt(s, function (m) {
                    return (h[m] = 1);
                  }),
                  (s = h)),
                (s = V_(a, s))),
              v = a.length;
            v--;

          )
            if (~u.indexOf(a[v])) {
              (p = f[v]),
                s === 'all'
                  ? ((d[v] = s), (_ = p), (l = {}))
                  : ((l = d[v] = d[v] || {}), (_ = s));
              for (h in _)
                (g = p && p[h]),
                  g &&
                    ((!('kill' in g.d) || g.d.kill(h) === !0) &&
                      bs(this, g, '_pt'),
                    delete p[h]),
                  l !== 'all' && (l[h] = 1);
            }
          return this._initted && !this._pt && c && Zi(this), this;
        }),
        (t.to = function (n, s) {
          return new t(n, s, arguments[2]);
        }),
        (t.from = function (n, s) {
          return tn(1, arguments);
        }),
        (t.delayedCall = function (n, s, o, a) {
          return new t(s, 0, {
            immediateRender: !1,
            lazy: !1,
            overwrite: !1,
            delay: n,
            onComplete: s,
            onReverseComplete: s,
            onCompleteParams: o,
            onReverseCompleteParams: o,
            callbackScope: a,
          });
        }),
        (t.fromTo = function (n, s, o) {
          return tn(2, arguments);
        }),
        (t.set = function (n, s) {
          return (s.duration = 0), s.repeatDelay || (s.repeat = 0), new t(n, s);
        }),
        (t.killTweensOf = function (n, s, o) {
          return vt.killTweensOf(n, s, o);
        }),
        t
      );
    })(rn);
  ie(St.prototype, { _targets: [], _lazy: 0, _startAt: 0, _op: 0, _onInit: 0 });
  Yt('staggerTo,staggerFrom,staggerFromTo', function (r) {
    St[r] = function () {
      var t = new Nt(),
        e = aa.call(arguments, 0);
      return e.splice(r === 'staggerFromTo' ? 5 : 4, 0, 0), t[r].apply(t, e);
    };
  });
  var wa = function (t, e, i) {
      return (t[e] = i);
    },
    Yf = function (t, e, i) {
      return t[e](i);
    },
    W_ = function (t, e, i, n) {
      return t[e](n.fp, i);
    },
    H_ = function (t, e, i) {
      return t.setAttribute(e, i);
    },
    ws = function (t, e) {
      return kt(t[e]) ? Yf : ys(t[e]) && t.setAttribute ? H_ : wa;
    },
    $f = function (t, e) {
      return e.set(e.t, e.p, Math.round((e.s + e.c * t) * 1e6) / 1e6, e);
    },
    X_ = function (t, e) {
      return e.set(e.t, e.p, !!(e.s + e.c * t), e);
    },
    Ta = function (t, e) {
      var i = e._pt,
        n = '';
      if (!t && e.b) n = e.b;
      else if (t === 1 && e.e) n = e.e;
      else {
        for (; i; )
          (n =
            i.p +
            (i.m
              ? i.m(i.s + i.c * t)
              : Math.round((i.s + i.c * t) * 1e4) / 1e4) +
            n),
            (i = i._next);
        n += e.c;
      }
      e.set(e.t, e.p, n, e);
    },
    Ea = function (t, e) {
      for (var i = e._pt; i; ) i.r(t, i.d), (i = i._next);
    },
    Y_ = function (t, e, i, n) {
      for (var s = this._pt, o; s; )
        (o = s._next), s.p === n && s.modifier(t, e, i), (s = o);
    },
    $_ = function (t) {
      for (var e = this._pt, i, n; e; )
        (n = e._next),
          (e.p === t && !e.op) || e.op === t
            ? bs(this, e, '_pt')
            : e.dep || (i = 1),
          (e = n);
      return !i;
    },
    U_ = function (t, e, i, n) {
      n.mSet(t, e, n.m.call(n.tween, i, n.mt), n);
    },
    Sa = function (t) {
      for (var e = t._pt, i, n, s, o; e; ) {
        for (i = e._next, n = s; n && n.pr > e.pr; ) n = n._next;
        (e._prev = n ? n._prev : o) ? (e._prev._next = e) : (s = e),
          (e._next = n) ? (n._prev = e) : (o = e),
          (e = i);
      }
      t._pt = s;
    },
    zt = (function () {
      function r(e, i, n, s, o, a, u, f, c) {
        (this.t = i),
          (this.s = s),
          (this.c = o),
          (this.p = n),
          (this.r = a || $f),
          (this.d = u || this),
          (this.set = f || wa),
          (this.pr = c || 0),
          (this._next = e),
          e && (e._prev = this);
      }
      var t = r.prototype;
      return (
        (t.modifier = function (i, n, s) {
          (this.mSet = this.mSet || this.set),
            (this.set = U_),
            (this.m = i),
            (this.mt = s),
            (this.tween = n);
        }),
        r
      );
    })();
  Yt(
    pa +
      'parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger',
    function (r) {
      return (ha[r] = 1);
    },
  );
  Zt.TweenMax = Zt.TweenLite = St;
  Zt.TimelineLite = Zt.TimelineMax = Nt;
  vt = new Nt({
    sortChildren: !1,
    defaults: ai,
    autoRemoveChildren: !0,
    id: 'root',
    smoothChildTiming: !0,
  });
  Vt.stringFilter = ma;
  var ms = {
    registerPlugin: function () {
      for (var t = arguments.length, e = new Array(t), i = 0; i < t; i++)
        e[i] = arguments[i];
      e.forEach(function (n) {
        return O_(n);
      });
    },
    timeline: function (t) {
      return new Nt(t);
    },
    getTweensOf: function (t, e) {
      return vt.getTweensOf(t, e);
    },
    getProperty: function (t, e, i, n) {
      Lt(t) && (t = re(t)[0]);
      var s = ir(t || {}).get,
        o = i ? Af : Sf;
      return (
        i === 'native' && (i = ''),
        t &&
          (e
            ? o(((Ht[e] && Ht[e].get) || s)(t, e, i, n))
            : function (a, u, f) {
                return o(((Ht[a] && Ht[a].get) || s)(t, a, u, f));
              })
      );
    },
    quickSetter: function (t, e, i) {
      if (((t = re(t)), t.length > 1)) {
        var n = t.map(function (c) {
            return ne.quickSetter(c, e, i);
          }),
          s = n.length;
        return function (c) {
          for (var d = s; d--; ) n[d](c);
        };
      }
      t = t[0] || {};
      var o = Ht[e],
        a = ir(t),
        u = (a.harness && (a.harness.aliases || {})[e]) || e,
        f = o
          ? function (c) {
              var d = new o();
              (si._pt = 0),
                d.init(t, i ? c + i : c, si, 0, [t]),
                d.render(1, d),
                si._pt && Ea(1, si);
            }
          : a.set(t, u);
      return o
        ? f
        : function (c) {
            return f(t, u, i ? c + i : c, a, 1);
          };
    },
    isTweening: function (t) {
      return vt.getTweensOf(t, !0).length > 0;
    },
    defaults: function (t) {
      return t && t.ease && (t.ease = oi(t.ease, ai.ease)), ff(ai, t || {});
    },
    config: function (t) {
      return ff(Vt, t || {});
    },
    registerEffect: function (t) {
      var e = t.name,
        i = t.effect,
        n = t.plugins,
        s = t.defaults,
        o = t.extendTimeline;
      (n || '').split(',').forEach(function (a) {
        return (
          a && !Ht[a] && !Zt[a] && ps(e + ' effect requires ' + a + ' plugin.')
        );
      }),
        (Ko[e] = function (a, u, f) {
          return i(re(a), ie(u || {}, s), f);
        }),
        o &&
          (Nt.prototype[e] = function (a, u, f) {
            return this.add(Ko[e](a, Be(u) ? u : (f = u) && {}, this), f);
          });
    },
    registerEase: function (t, e) {
      it[t] = oi(e);
    },
    parseEase: function (t, e) {
      return arguments.length ? oi(t, e) : it;
    },
    getById: function (t) {
      return vt.getById(t);
    },
    exportRoot: function (t, e) {
      t === void 0 && (t = {});
      var i = new Nt(t),
        n,
        s;
      for (
        i.smoothChildTiming = Xt(t.smoothChildTiming),
          vt.remove(i),
          i._dp = 0,
          i._time = i._tTime = vt._time,
          n = vt._first;
        n;

      )
        (s = n._next),
          (e ||
            !(
              !n._dur &&
              n instanceof St &&
              n.vars.onComplete === n._targets[0]
            )) &&
            Ae(i, n, n._start - n._delay),
          (n = s);
      return Ae(vt, i, 0), i;
    },
    utils: {
      wrap: A_,
      wrapYoyo: P_,
      distribute: Rf,
      random: If,
      snap: Mf,
      normalize: S_,
      getUnit: $t,
      clamp: x_,
      splitColor: Bf,
      toArray: re,
      selector: w_,
      mapRange: Ff,
      pipe: T_,
      unitize: E_,
      interpolate: C_,
      shuffle: Lf,
    },
    install: bf,
    effects: Ko,
    ticker: Kt,
    updateRoot: Nt.updateRoot,
    plugins: Ht,
    globalTimeline: vt,
    core: {
      PropTween: zt,
      globals: wf,
      Tween: St,
      Timeline: Nt,
      Animation: rn,
      getCache: ir,
      _removeLinkedListItem: bs,
      suppressOverwrites: function (t) {
        return (la = t);
      },
    },
  };
  Yt('to,from,fromTo,delayedCall,set,killTweensOf', function (r) {
    return (ms[r] = St[r]);
  });
  Kt.add(Nt.updateRoot);
  si = ms.to({}, { duration: 0 });
  var G_ = function (t, e) {
      for (var i = t._pt; i && i.p !== e && i.op !== e && i.fp !== e; )
        i = i._next;
      return i;
    },
    q_ = function (t, e) {
      var i = t._targets,
        n,
        s,
        o;
      for (n in e)
        for (s = i.length; s--; )
          (o = t._ptLookup[s][n]),
            o &&
              (o = o.d) &&
              (o._pt && (o = G_(o, n)),
              o && o.modifier && o.modifier(e[n], t, i[s], n));
    },
    ta = function (t, e) {
      return {
        name: t,
        rawVars: 1,
        init: function (n, s, o) {
          o._onInit = function (a) {
            var u, f;
            if (
              (Lt(s) &&
                ((u = {}),
                Yt(s, function (c) {
                  return (u[c] = 1);
                }),
                (s = u)),
              e)
            ) {
              u = {};
              for (f in s) u[f] = e(s[f]);
              s = u;
            }
            q_(a, s);
          };
        },
      };
    },
    ne =
      ms.registerPlugin(
        {
          name: 'attr',
          init: function (t, e, i, n, s) {
            var o, a;
            for (o in e)
              (a = this.add(
                t,
                'setAttribute',
                (t.getAttribute(o) || 0) + '',
                e[o],
                n,
                s,
                0,
                0,
                o,
              )),
                a && (a.op = o),
                this._props.push(o);
          },
        },
        {
          name: 'endArray',
          init: function (t, e) {
            for (var i = e.length; i--; ) this.add(t, i, t[i] || 0, e[i]);
          },
        },
        ta('roundProps', ua),
        ta('modifiers'),
        ta('snap', Mf),
      ) || ms;
  St.version = Nt.version = ne.version = '3.7.0';
  xf = 1;
  vf() && di();
  var j_ = it.Power0,
    K_ = it.Power1,
    Q_ = it.Power2,
    Z_ = it.Power3,
    J_ = it.Power4,
    tg = it.Linear,
    eg = it.Quad,
    rg = it.Cubic,
    ig = it.Quart,
    ng = it.Quint,
    sg = it.Strong,
    og = it.Elastic,
    ag = it.Back,
    ug = it.SteppedEase,
    lg = it.Bounce,
    fg = it.Sine,
    cg = it.Expo,
    dg = it.Circ;
  var Uf,
    or,
    _i,
    Da,
    Hr,
    hg,
    Gf,
    pg = function () {
      return typeof window < 'u';
    },
    lr = {},
    Wr = 180 / Math.PI,
    gi = Math.PI / 180,
    hi = Math.atan2,
    qf = 1e8,
    ec = /([A-Z])/g,
    _g = /(?:left|right|width|margin|padding|x)/i,
    gg = /[\s,\(]\S/,
    ar = {
      autoAlpha: 'opacity,visibility',
      scale: 'scaleX,scaleY',
      alpha: 'opacity',
    },
    rc = function (t, e) {
      return e.set(e.t, e.p, Math.round((e.s + e.c * t) * 1e4) / 1e4 + e.u, e);
    },
    vg = function (t, e) {
      return e.set(
        e.t,
        e.p,
        t === 1 ? e.e : Math.round((e.s + e.c * t) * 1e4) / 1e4 + e.u,
        e,
      );
    },
    mg = function (t, e) {
      return e.set(
        e.t,
        e.p,
        t ? Math.round((e.s + e.c * t) * 1e4) / 1e4 + e.u : e.b,
        e,
      );
    },
    yg = function (t, e) {
      var i = e.s + e.c * t;
      e.set(e.t, e.p, ~~(i + (i < 0 ? -0.5 : 0.5)) + e.u, e);
    },
    ic = function (t, e) {
      return e.set(e.t, e.p, t ? e.e : e.b, e);
    },
    nc = function (t, e) {
      return e.set(e.t, e.p, t !== 1 ? e.b : e.e, e);
    },
    xg = function (t, e, i) {
      return (t.style[e] = i);
    },
    bg = function (t, e, i) {
      return t.style.setProperty(e, i);
    },
    wg = function (t, e, i) {
      return (t._gsap[e] = i);
    },
    Tg = function (t, e, i) {
      return (t._gsap.scaleX = t._gsap.scaleY = i);
    },
    Eg = function (t, e, i, n, s) {
      var o = t._gsap;
      (o.scaleX = o.scaleY = i), o.renderTransform(s, o);
    },
    Sg = function (t, e, i, n, s) {
      var o = t._gsap;
      (o[e] = i), o.renderTransform(s, o);
    },
    Rt = 'transform',
    fr = Rt + 'Origin',
    sc,
    Ca = function (t, e) {
      var i = or.createElementNS
        ? or.createElementNS(
            (e || 'http://www.w3.org/1999/xhtml').replace(/^https/, 'http'),
            t,
          )
        : or.createElement(t);
      return i.style ? i : or.createElement(t);
    },
    Ve = function r(t, e, i) {
      var n = getComputedStyle(t);
      return (
        n[e] ||
        n.getPropertyValue(e.replace(ec, '-$1').toLowerCase()) ||
        n.getPropertyValue(e) ||
        (!i && r(t, vi(e) || e, 1)) ||
        ''
      );
    },
    jf = 'O,Moz,ms,Ms,Webkit'.split(','),
    vi = function (t, e, i) {
      var n = e || Hr,
        s = n.style,
        o = 5;
      if (t in s && !i) return t;
      for (
        t = t.charAt(0).toUpperCase() + t.substr(1);
        o-- && !(jf[o] + t in s);

      );
      return o < 0 ? null : (o === 3 ? 'ms' : o >= 0 ? jf[o] : '') + t;
    },
    Oa = function () {
      pg() &&
        window.document &&
        ((Uf = window),
        (or = Uf.document),
        (_i = or.documentElement),
        (Hr = Ca('div') || { style: {} }),
        (hg = Ca('div')),
        (Rt = vi(Rt)),
        (fr = Rt + 'Origin'),
        (Hr.style.cssText =
          'border-width:0;line-height:0;position:absolute;padding:0'),
        (sc = !!vi('perspective')),
        (Da = 1));
    },
    Aa = function r(t) {
      var e = Ca(
          'svg',
          (this.ownerSVGElement &&
            this.ownerSVGElement.getAttribute('xmlns')) ||
            'http://www.w3.org/2000/svg',
        ),
        i = this.parentNode,
        n = this.nextSibling,
        s = this.style.cssText,
        o;
      if (
        (_i.appendChild(e),
        e.appendChild(this),
        (this.style.display = 'block'),
        t)
      )
        try {
          (o = this.getBBox()),
            (this._gsapBBox = this.getBBox),
            (this.getBBox = r);
        } catch {}
      else this._gsapBBox && (o = this._gsapBBox());
      return (
        i && (n ? i.insertBefore(this, n) : i.appendChild(this)),
        _i.removeChild(e),
        (this.style.cssText = s),
        o
      );
    },
    Kf = function (t, e) {
      for (var i = e.length; i--; )
        if (t.hasAttribute(e[i])) return t.getAttribute(e[i]);
    },
    oc = function (t) {
      var e;
      try {
        e = t.getBBox();
      } catch {
        e = Aa.call(t, !0);
      }
      return (
        (e && (e.width || e.height)) ||
          t.getBBox === Aa ||
          (e = Aa.call(t, !0)),
        e && !e.width && !e.x && !e.y
          ? {
              x: +Kf(t, ['x', 'cx', 'x1']) || 0,
              y: +Kf(t, ['y', 'cy', 'y1']) || 0,
              width: 0,
              height: 0,
            }
          : e
      );
    },
    ac = function (t) {
      return !!(t.getCTM && (!t.parentNode || t.ownerSVGElement) && oc(t));
    },
    an = function (t, e) {
      if (e) {
        var i = t.style;
        e in lr && e !== fr && (e = Rt),
          i.removeProperty
            ? ((e.substr(0, 2) === 'ms' || e.substr(0, 6) === 'webkit') &&
                (e = '-' + e),
              i.removeProperty(e.replace(ec, '-$1').toLowerCase()))
            : i.removeAttribute(e);
      }
    },
    ur = function (t, e, i, n, s, o) {
      var a = new zt(t._pt, e, i, 0, 1, o ? nc : ic);
      return (t._pt = a), (a.b = n), (a.e = s), t._props.push(i), a;
    },
    Qf = { deg: 1, rad: 1, turn: 1 },
    cr = function r(t, e, i, n) {
      var s = parseFloat(i) || 0,
        o = (i + '').trim().substr((s + '').length) || 'px',
        a = Hr.style,
        u = _g.test(e),
        f = t.tagName.toLowerCase() === 'svg',
        c = (f ? 'client' : 'offset') + (u ? 'Width' : 'Height'),
        d = 100,
        p = n === 'px',
        l = n === '%',
        _,
        h,
        g,
        v;
      return n === o || !s || Qf[n] || Qf[o]
        ? s
        : (o !== 'px' && !p && (s = r(t, e, i, 'px')),
          (v = t.getCTM && ac(t)),
          (l || o === '%') && (lr[e] || ~e.indexOf('adius'))
            ? ((_ = v ? t.getBBox()[u ? 'width' : 'height'] : t[c]),
              et(l ? (s / _) * d : (s / 100) * _))
            : ((a[u ? 'width' : 'height'] = d + (p ? o : n)),
              (h =
                ~e.indexOf('adius') || (n === 'em' && t.appendChild && !f)
                  ? t
                  : t.parentNode),
              v && (h = (t.ownerSVGElement || {}).parentNode),
              (!h || h === or || !h.appendChild) && (h = or.body),
              (g = h._gsap),
              g && l && g.width && u && g.time === Kt.time
                ? et((s / g.width) * d)
                : ((l || o === '%') && (a.position = Ve(t, 'position')),
                  h === t && (a.position = 'static'),
                  h.appendChild(Hr),
                  (_ = Hr[c]),
                  h.removeChild(Hr),
                  (a.position = 'absolute'),
                  u && l && ((g = ir(h)), (g.time = Kt.time), (g.width = h[c])),
                  et(p ? (_ * s) / d : _ && s ? (d / _) * s : 0))));
    },
    pi = function (t, e, i, n) {
      var s;
      return (
        Da || Oa(),
        e in ar &&
          e !== 'transform' &&
          ((e = ar[e]), ~e.indexOf(',') && (e = e.split(',')[0])),
        lr[e] && e !== 'transform'
          ? ((s = ln(t, n)),
            (s =
              e !== 'transformOrigin'
                ? s[e]
                : s.svg
                ? s.origin
                : Es(Ve(t, fr)) + ' ' + s.zOrigin + 'px'))
          : ((s = t.style[e]),
            (!s || s === 'auto' || n || ~(s + '').indexOf('calc(')) &&
              (s =
                (Ts[e] && Ts[e](t, e, i)) ||
                Ve(t, e) ||
                ga(t, e) ||
                (e === 'opacity' ? 1 : 0))),
        i && !~(s + '').trim().indexOf(' ') ? cr(t, e, s, i) + i : s
      );
    },
    Ag = function (t, e, i, n) {
      if (!i || i === 'none') {
        var s = vi(e, t, 1),
          o = s && Ve(t, s, 1);
        o && o !== i
          ? ((e = s), (i = o))
          : e === 'borderColor' && (i = Ve(t, 'borderTopColor'));
      }
      var a = new zt(this._pt, t.style, e, 0, 1, Ta),
        u = 0,
        f = 0,
        c,
        d,
        p,
        l,
        _,
        h,
        g,
        v,
        m,
        y,
        A,
        x,
        E;
      if (
        ((a.b = i),
        (a.e = n),
        (i += ''),
        (n += ''),
        n === 'auto' &&
          ((t.style[e] = n), (n = Ve(t, e) || n), (t.style[e] = i)),
        (c = [i, n]),
        ma(c),
        (i = c[0]),
        (n = c[1]),
        (p = i.match(Fr) || []),
        (E = n.match(Fr) || []),
        E.length)
      ) {
        for (; (d = Fr.exec(n)); )
          (g = d[0]),
            (m = n.substring(u, d.index)),
            _
              ? (_ = (_ + 1) % 5)
              : (m.substr(-5) === 'rgba(' || m.substr(-5) === 'hsla(') &&
                (_ = 1),
            g !== (h = p[f++] || '') &&
              ((l = parseFloat(h) || 0),
              (A = h.substr((l + '').length)),
              (x = g.charAt(1) === '=' ? +(g.charAt(0) + '1') : 0),
              x && (g = g.substr(2)),
              (v = parseFloat(g)),
              (y = g.substr((v + '').length)),
              (u = Fr.lastIndex - y.length),
              y ||
                ((y = y || Vt.units[e] || A),
                u === n.length && ((n += y), (a.e += y))),
              A !== y && (l = cr(t, e, h, y) || 0),
              (a._pt = {
                _next: a._pt,
                p: m || f === 1 ? m : ',',
                s: l,
                c: x ? x * v : v - l,
                m: (_ && _ < 4) || e === 'zIndex' ? Math.round : 0,
              }));
        a.c = u < n.length ? n.substring(u, n.length) : '';
      } else a.r = e === 'display' && n === 'none' ? nc : ic;
      return ca.test(n) && (a.e = 0), (this._pt = a), a;
    },
    Zf = {
      top: '0%',
      bottom: '100%',
      left: '0%',
      right: '100%',
      center: '50%',
    },
    Pg = function (t) {
      var e = t.split(' '),
        i = e[0],
        n = e[1] || '50%';
      return (
        (i === 'top' || i === 'bottom' || n === 'left' || n === 'right') &&
          ((t = i), (i = n), (n = t)),
        (e[0] = Zf[i] || i),
        (e[1] = Zf[n] || n),
        e.join(' ')
      );
    },
    Cg = function (t, e) {
      if (e.tween && e.tween._time === e.tween._dur) {
        var i = e.t,
          n = i.style,
          s = e.u,
          o = i._gsap,
          a,
          u,
          f;
        if (s === 'all' || s === !0) (n.cssText = ''), (u = 1);
        else
          for (s = s.split(','), f = s.length; --f > -1; )
            (a = s[f]),
              lr[a] && ((u = 1), (a = a === 'transformOrigin' ? fr : Rt)),
              an(i, a);
        u &&
          (an(i, Rt),
          o &&
            (o.svg && i.removeAttribute('transform'),
            ln(i, 1),
            (o.uncache = 1)));
      }
    },
    Ts = {
      clearProps: function (t, e, i, n, s) {
        if (s.data !== 'isFromStart') {
          var o = (t._pt = new zt(t._pt, e, i, 0, 0, Cg));
          return (o.u = n), (o.pr = -10), (o.tween = s), t._props.push(i), 1;
        }
      },
    },
    un = [1, 0, 0, 1, 0, 0],
    uc = {},
    lc = function (t) {
      return t === 'matrix(1, 0, 0, 1, 0, 0)' || t === 'none' || !t;
    },
    Jf = function (t) {
      var e = Ve(t, Rt);
      return lc(e) ? un : e.substr(7).match(fa).map(et);
    },
    La = function (t, e) {
      var i = t._gsap || ir(t),
        n = t.style,
        s = Jf(t),
        o,
        a,
        u,
        f;
      return i.svg && t.getAttribute('transform')
        ? ((u = t.transform.baseVal.consolidate().matrix),
          (s = [u.a, u.b, u.c, u.d, u.e, u.f]),
          s.join(',') === '1,0,0,1,0,0' ? un : s)
        : (s === un &&
            !t.offsetParent &&
            t !== _i &&
            !i.svg &&
            ((u = n.display),
            (n.display = 'block'),
            (o = t.parentNode),
            (!o || !t.offsetParent) &&
              ((f = 1), (a = t.nextSibling), _i.appendChild(t)),
            (s = Jf(t)),
            u ? (n.display = u) : an(t, 'display'),
            f &&
              (a
                ? o.insertBefore(t, a)
                : o
                ? o.appendChild(t)
                : _i.removeChild(t))),
          e && s.length > 6 ? [s[0], s[1], s[4], s[5], s[12], s[13]] : s);
    },
    ka = function (t, e, i, n, s, o) {
      var a = t._gsap,
        u = s || La(t, !0),
        f = a.xOrigin || 0,
        c = a.yOrigin || 0,
        d = a.xOffset || 0,
        p = a.yOffset || 0,
        l = u[0],
        _ = u[1],
        h = u[2],
        g = u[3],
        v = u[4],
        m = u[5],
        y = e.split(' '),
        A = parseFloat(y[0]) || 0,
        x = parseFloat(y[1]) || 0,
        E,
        w,
        S,
        k;
      i
        ? u !== un &&
          (w = l * g - _ * h) &&
          ((S = A * (g / w) + x * (-h / w) + (h * m - g * v) / w),
          (k = A * (-_ / w) + x * (l / w) - (l * m - _ * v) / w),
          (A = S),
          (x = k))
        : ((E = oc(t)),
          (A = E.x + (~y[0].indexOf('%') ? (A / 100) * E.width : A)),
          (x =
            E.y + (~(y[1] || y[0]).indexOf('%') ? (x / 100) * E.height : x))),
        n || (n !== !1 && a.smooth)
          ? ((v = A - f),
            (m = x - c),
            (a.xOffset = d + (v * l + m * h) - v),
            (a.yOffset = p + (v * _ + m * g) - m))
          : (a.xOffset = a.yOffset = 0),
        (a.xOrigin = A),
        (a.yOrigin = x),
        (a.smooth = !!n),
        (a.origin = e),
        (a.originIsAbsolute = !!i),
        (t.style[fr] = '0px 0px'),
        o &&
          (ur(o, a, 'xOrigin', f, A),
          ur(o, a, 'yOrigin', c, x),
          ur(o, a, 'xOffset', d, a.xOffset),
          ur(o, a, 'yOffset', p, a.yOffset)),
        t.setAttribute('data-svg-origin', A + ' ' + x);
    },
    ln = function (t, e) {
      var i = t._gsap || new ya(t);
      if ('x' in i && !e && !i.uncache) return i;
      var n = t.style,
        s = i.scaleX < 0,
        o = 'px',
        a = 'deg',
        u = Ve(t, fr) || '0',
        f,
        c,
        d,
        p,
        l,
        _,
        h,
        g,
        v,
        m,
        y,
        A,
        x,
        E,
        w,
        S,
        k,
        M,
        O,
        P,
        T,
        D,
        R,
        W,
        Y,
        z,
        $,
        B,
        N,
        U,
        j,
        K;
      return (
        (f = c = d = _ = h = g = v = m = y = 0),
        (p = l = 1),
        (i.svg = !!(t.getCTM && ac(t))),
        (E = La(t, i.svg)),
        i.svg &&
          ((W =
            (!i.uncache || u === '0px 0px') &&
            !e &&
            t.getAttribute('data-svg-origin')),
          ka(t, W || u, !!W || i.originIsAbsolute, i.smooth !== !1, E)),
        (A = i.xOrigin || 0),
        (x = i.yOrigin || 0),
        E !== un &&
          ((M = E[0]),
          (O = E[1]),
          (P = E[2]),
          (T = E[3]),
          (f = D = E[4]),
          (c = R = E[5]),
          E.length === 6
            ? ((p = Math.sqrt(M * M + O * O)),
              (l = Math.sqrt(T * T + P * P)),
              (_ = M || O ? hi(O, M) * Wr : 0),
              (v = P || T ? hi(P, T) * Wr + _ : 0),
              v && (l *= Math.abs(Math.cos(v * gi))),
              i.svg && ((f -= A - (A * M + x * P)), (c -= x - (A * O + x * T))))
            : ((K = E[6]),
              (U = E[7]),
              ($ = E[8]),
              (B = E[9]),
              (N = E[10]),
              (j = E[11]),
              (f = E[12]),
              (c = E[13]),
              (d = E[14]),
              (w = hi(K, N)),
              (h = w * Wr),
              w &&
                ((S = Math.cos(-w)),
                (k = Math.sin(-w)),
                (W = D * S + $ * k),
                (Y = R * S + B * k),
                (z = K * S + N * k),
                ($ = D * -k + $ * S),
                (B = R * -k + B * S),
                (N = K * -k + N * S),
                (j = U * -k + j * S),
                (D = W),
                (R = Y),
                (K = z)),
              (w = hi(-P, N)),
              (g = w * Wr),
              w &&
                ((S = Math.cos(-w)),
                (k = Math.sin(-w)),
                (W = M * S - $ * k),
                (Y = O * S - B * k),
                (z = P * S - N * k),
                (j = T * k + j * S),
                (M = W),
                (O = Y),
                (P = z)),
              (w = hi(O, M)),
              (_ = w * Wr),
              w &&
                ((S = Math.cos(w)),
                (k = Math.sin(w)),
                (W = M * S + O * k),
                (Y = D * S + R * k),
                (O = O * S - M * k),
                (R = R * S - D * k),
                (M = W),
                (D = Y)),
              h &&
                Math.abs(h) + Math.abs(_) > 359.9 &&
                ((h = _ = 0), (g = 180 - g)),
              (p = et(Math.sqrt(M * M + O * O + P * P))),
              (l = et(Math.sqrt(R * R + K * K))),
              (w = hi(D, R)),
              (v = Math.abs(w) > 2e-4 ? w * Wr : 0),
              (y = j ? 1 / (j < 0 ? -j : j) : 0)),
          i.svg &&
            ((W = t.getAttribute('transform')),
            (i.forceCSS = t.setAttribute('transform', '') || !lc(Ve(t, Rt))),
            W && t.setAttribute('transform', W))),
        Math.abs(v) > 90 &&
          Math.abs(v) < 270 &&
          (s
            ? ((p *= -1),
              (v += _ <= 0 ? 180 : -180),
              (_ += _ <= 0 ? 180 : -180))
            : ((l *= -1), (v += v <= 0 ? 180 : -180))),
        (i.x =
          f -
          ((i.xPercent =
            f &&
            (i.xPercent ||
              (Math.round(t.offsetWidth / 2) === Math.round(-f) ? -50 : 0)))
            ? (t.offsetWidth * i.xPercent) / 100
            : 0) +
          o),
        (i.y =
          c -
          ((i.yPercent =
            c &&
            (i.yPercent ||
              (Math.round(t.offsetHeight / 2) === Math.round(-c) ? -50 : 0)))
            ? (t.offsetHeight * i.yPercent) / 100
            : 0) +
          o),
        (i.z = d + o),
        (i.scaleX = et(p)),
        (i.scaleY = et(l)),
        (i.rotation = et(_) + a),
        (i.rotationX = et(h) + a),
        (i.rotationY = et(g) + a),
        (i.skewX = v + a),
        (i.skewY = m + a),
        (i.transformPerspective = y + o),
        (i.zOrigin = parseFloat(u.split(' ')[2]) || 0) && (n[fr] = Es(u)),
        (i.xOffset = i.yOffset = 0),
        (i.force3D = Vt.force3D),
        (i.renderTransform = i.svg ? kg : sc ? fc : Og),
        (i.uncache = 0),
        i
      );
    },
    Es = function (t) {
      return (t = t.split(' '))[0] + ' ' + t[1];
    },
    Pa = function (t, e, i) {
      var n = $t(e);
      return et(parseFloat(e) + parseFloat(cr(t, 'x', i + 'px', n))) + n;
    },
    Og = function (t, e) {
      (e.z = '0px'),
        (e.rotationY = e.rotationX = '0deg'),
        (e.force3D = 0),
        fc(t, e);
    },
    Vr = '0deg',
    on = '0px',
    zr = ') ',
    fc = function (t, e) {
      var i = e || this,
        n = i.xPercent,
        s = i.yPercent,
        o = i.x,
        a = i.y,
        u = i.z,
        f = i.rotation,
        c = i.rotationY,
        d = i.rotationX,
        p = i.skewX,
        l = i.skewY,
        _ = i.scaleX,
        h = i.scaleY,
        g = i.transformPerspective,
        v = i.force3D,
        m = i.target,
        y = i.zOrigin,
        A = '',
        x = (v === 'auto' && t && t !== 1) || v === !0;
      if (y && (d !== Vr || c !== Vr)) {
        var E = parseFloat(c) * gi,
          w = Math.sin(E),
          S = Math.cos(E),
          k;
        (E = parseFloat(d) * gi),
          (k = Math.cos(E)),
          (o = Pa(m, o, w * k * -y)),
          (a = Pa(m, a, -Math.sin(E) * -y)),
          (u = Pa(m, u, S * k * -y + y));
      }
      g !== on && (A += 'perspective(' + g + zr),
        (n || s) && (A += 'translate(' + n + '%, ' + s + '%) '),
        (x || o !== on || a !== on || u !== on) &&
          (A +=
            u !== on || x
              ? 'translate3d(' + o + ', ' + a + ', ' + u + ') '
              : 'translate(' + o + ', ' + a + zr),
        f !== Vr && (A += 'rotate(' + f + zr),
        c !== Vr && (A += 'rotateY(' + c + zr),
        d !== Vr && (A += 'rotateX(' + d + zr),
        (p !== Vr || l !== Vr) && (A += 'skew(' + p + ', ' + l + zr),
        (_ !== 1 || h !== 1) && (A += 'scale(' + _ + ', ' + h + zr),
        (m.style[Rt] = A || 'translate(0, 0)');
    },
    kg = function (t, e) {
      var i = e || this,
        n = i.xPercent,
        s = i.yPercent,
        o = i.x,
        a = i.y,
        u = i.rotation,
        f = i.skewX,
        c = i.skewY,
        d = i.scaleX,
        p = i.scaleY,
        l = i.target,
        _ = i.xOrigin,
        h = i.yOrigin,
        g = i.xOffset,
        v = i.yOffset,
        m = i.forceCSS,
        y = parseFloat(o),
        A = parseFloat(a),
        x,
        E,
        w,
        S,
        k;
      (u = parseFloat(u)),
        (f = parseFloat(f)),
        (c = parseFloat(c)),
        c && ((c = parseFloat(c)), (f += c), (u += c)),
        u || f
          ? ((u *= gi),
            (f *= gi),
            (x = Math.cos(u) * d),
            (E = Math.sin(u) * d),
            (w = Math.sin(u - f) * -p),
            (S = Math.cos(u - f) * p),
            f &&
              ((c *= gi),
              (k = Math.tan(f - c)),
              (k = Math.sqrt(1 + k * k)),
              (w *= k),
              (S *= k),
              c &&
                ((k = Math.tan(c)),
                (k = Math.sqrt(1 + k * k)),
                (x *= k),
                (E *= k))),
            (x = et(x)),
            (E = et(E)),
            (w = et(w)),
            (S = et(S)))
          : ((x = d), (S = p), (E = w = 0)),
        ((y && !~(o + '').indexOf('px')) || (A && !~(a + '').indexOf('px'))) &&
          ((y = cr(l, 'x', o, 'px')), (A = cr(l, 'y', a, 'px'))),
        (_ || h || g || v) &&
          ((y = et(y + _ - (_ * x + h * w) + g)),
          (A = et(A + h - (_ * E + h * S) + v))),
        (n || s) &&
          ((k = l.getBBox()),
          (y = et(y + (n / 100) * k.width)),
          (A = et(A + (s / 100) * k.height))),
        (k =
          'matrix(' +
          x +
          ',' +
          E +
          ',' +
          w +
          ',' +
          S +
          ',' +
          y +
          ',' +
          A +
          ')'),
        l.setAttribute('transform', k),
        m && (l.style[Rt] = k);
    },
    Dg = function (t, e, i, n, s, o) {
      var a = 360,
        u = Lt(s),
        f = parseFloat(s) * (u && ~s.indexOf('rad') ? Wr : 1),
        c = o ? f * o : f - n,
        d = n + c + 'deg',
        p,
        l;
      return (
        u &&
          ((p = s.split('_')[1]),
          p === 'short' &&
            ((c %= a), c !== c % (a / 2) && (c += c < 0 ? a : -a)),
          p === 'cw' && c < 0
            ? (c = ((c + a * qf) % a) - ~~(c / a) * a)
            : p === 'ccw' && c > 0 && (c = ((c - a * qf) % a) - ~~(c / a) * a)),
        (t._pt = l = new zt(t._pt, e, i, n, c, vg)),
        (l.e = d),
        (l.u = 'deg'),
        t._props.push(i),
        l
      );
    },
    tc = function (t, e) {
      for (var i in e) t[i] = e[i];
      return t;
    },
    Lg = function (t, e, i) {
      var n = tc({}, i._gsap),
        s = 'perspective,force3D,transformOrigin,svgOrigin',
        o = i.style,
        a,
        u,
        f,
        c,
        d,
        p,
        l,
        _;
      n.svg
        ? ((f = i.getAttribute('transform')),
          i.setAttribute('transform', ''),
          (o[Rt] = e),
          (a = ln(i, 1)),
          an(i, Rt),
          i.setAttribute('transform', f))
        : ((f = getComputedStyle(i)[Rt]),
          (o[Rt] = e),
          (a = ln(i, 1)),
          (o[Rt] = f));
      for (u in lr)
        (f = n[u]),
          (c = a[u]),
          f !== c &&
            s.indexOf(u) < 0 &&
            ((l = $t(f)),
            (_ = $t(c)),
            (d = l !== _ ? cr(i, u, f, _) : parseFloat(f)),
            (p = parseFloat(c)),
            (t._pt = new zt(t._pt, a, u, d, p - d, rc)),
            (t._pt.u = _ || 0),
            t._props.push(u));
      tc(a, n);
    };
  Yt('padding,margin,Width,Radius', function (r, t) {
    var e = 'Top',
      i = 'Right',
      n = 'Bottom',
      s = 'Left',
      o = (t < 3 ? [e, i, n, s] : [e + s, e + i, n + i, n + s]).map(function (
        a,
      ) {
        return t < 2 ? r + a : 'border' + a + r;
      });
    Ts[t > 1 ? 'border' + r : r] = function (a, u, f, c, d) {
      var p, l;
      if (arguments.length < 4)
        return (
          (p = o.map(function (_) {
            return pi(a, _, f);
          })),
          (l = p.join(' ')),
          l.split(p[0]).length === 5 ? p[0] : l
        );
      (p = (c + '').split(' ')),
        (l = {}),
        o.forEach(function (_, h) {
          return (l[_] = p[h] = p[h] || p[((h - 1) / 2) | 0]);
        }),
        a.init(u, l, d);
    };
  });
  var Ra = {
    name: 'css',
    register: Oa,
    targetTest: function (t) {
      return t.style && t.nodeType;
    },
    init: function (t, e, i, n, s) {
      var o = this._props,
        a = t.style,
        u = i.vars.startAt,
        f,
        c,
        d,
        p,
        l,
        _,
        h,
        g,
        v,
        m,
        y,
        A,
        x,
        E,
        w;
      Da || Oa();
      for (h in e)
        if (
          h !== 'autoRound' &&
          ((c = e[h]), !(Ht[h] && ba(h, e, i, n, t, s)))
        ) {
          if (
            ((l = typeof c),
            (_ = Ts[h]),
            l === 'function' && ((c = c.call(i, n, t, s)), (l = typeof c)),
            l === 'string' && ~c.indexOf('random(') && (c = sn(c)),
            _)
          )
            _(this, t, h, c, i) && (w = 1);
          else if (h.substr(0, 2) === '--')
            (f = (getComputedStyle(t).getPropertyValue(h) + '').trim()),
              (c += ''),
              (Ne.lastIndex = 0),
              Ne.test(f) || ((g = $t(f)), (v = $t(c))),
              v ? g !== v && (f = cr(t, h, f, v) + v) : g && (c += g),
              this.add(a, 'setProperty', f, c, n, s, 0, 0, h),
              o.push(h);
          else if (l !== 'undefined') {
            if (
              (u && h in u
                ? ((f =
                    typeof u[h] == 'function' ? u[h].call(i, n, t, s) : u[h]),
                  h in Vt.units && !$t(f) && (f += Vt.units[h]),
                  (f + '').charAt(1) === '=' && (f = pi(t, h)))
                : (f = pi(t, h)),
              (p = parseFloat(f)),
              (m =
                l === 'string' && c.charAt(1) === '='
                  ? +(c.charAt(0) + '1')
                  : 0),
              m && (c = c.substr(2)),
              (d = parseFloat(c)),
              h in ar &&
                (h === 'autoAlpha' &&
                  (p === 1 && pi(t, 'visibility') === 'hidden' && d && (p = 0),
                  ur(
                    this,
                    a,
                    'visibility',
                    p ? 'inherit' : 'hidden',
                    d ? 'inherit' : 'hidden',
                    !d,
                  )),
                h !== 'scale' &&
                  h !== 'transform' &&
                  ((h = ar[h]), ~h.indexOf(',') && (h = h.split(',')[0]))),
              (y = h in lr),
              y)
            ) {
              if (
                (A ||
                  ((x = t._gsap),
                  (x.renderTransform && !e.parseTransform) ||
                    ln(t, e.parseTransform),
                  (E = e.smoothOrigin !== !1 && x.smooth),
                  (A = this._pt =
                    new zt(this._pt, a, Rt, 0, 1, x.renderTransform, x, 0, -1)),
                  (A.dep = 1)),
                h === 'scale')
              )
                (this._pt = new zt(
                  this._pt,
                  x,
                  'scaleY',
                  x.scaleY,
                  (m ? m * d : d - x.scaleY) || 0,
                )),
                  o.push('scaleY', h),
                  (h += 'X');
              else if (h === 'transformOrigin') {
                (c = Pg(c)),
                  x.svg
                    ? ka(t, c, 0, E, 0, this)
                    : ((v = parseFloat(c.split(' ')[2]) || 0),
                      v !== x.zOrigin && ur(this, x, 'zOrigin', x.zOrigin, v),
                      ur(this, a, h, Es(f), Es(c)));
                continue;
              } else if (h === 'svgOrigin') {
                ka(t, c, 1, E, 0, this);
                continue;
              } else if (h in uc) {
                Dg(this, x, h, p, c, m);
                continue;
              } else if (h === 'smoothOrigin') {
                ur(this, x, 'smooth', x.smooth, c);
                continue;
              } else if (h === 'force3D') {
                x[h] = c;
                continue;
              } else if (h === 'transform') {
                Lg(this, c, t);
                continue;
              }
            } else h in a || (h = vi(h) || h);
            if (
              y ||
              ((d || d === 0) && (p || p === 0) && !gg.test(c) && h in a)
            )
              (g = (f + '').substr((p + '').length)),
                d || (d = 0),
                (v = $t(c) || (h in Vt.units ? Vt.units[h] : g)),
                g !== v && (p = cr(t, h, f, v)),
                (this._pt = new zt(
                  this._pt,
                  y ? x : a,
                  h,
                  p,
                  m ? m * d : d - p,
                  !y && (v === 'px' || h === 'zIndex') && e.autoRound !== !1
                    ? yg
                    : rc,
                )),
                (this._pt.u = v || 0),
                g !== v && ((this._pt.b = f), (this._pt.r = mg));
            else if (h in a) Ag.call(this, t, h, f, c);
            else if (h in t) this.add(t, h, f || t[h], c, n, s);
            else {
              xs(h, c);
              continue;
            }
            o.push(h);
          }
        }
      w && Sa(this);
    },
    get: pi,
    aliases: ar,
    getSetter: function (t, e, i) {
      var n = ar[e];
      return (
        n && n.indexOf(',') < 0 && (e = n),
        e in lr && e !== fr && (t._gsap.x || pi(t, 'x'))
          ? i && Gf === i
            ? e === 'scale'
              ? Tg
              : wg
            : (Gf = i || {}) && (e === 'scale' ? Eg : Sg)
          : t.style && !ys(t.style[e])
          ? xg
          : ~e.indexOf('-')
          ? bg
          : ws(t, e)
      );
    },
    core: { _removeProperty: an, _getMatrix: La },
  };
  ne.utils.checkPrefix = vi;
  (function (r, t, e, i) {
    var n = Yt(r + ',' + t + ',' + e, function (s) {
      lr[s] = 1;
    });
    Yt(t, function (s) {
      (Vt.units[s] = 'deg'), (uc[s] = 1);
    }),
      (ar[n[13]] = r + ',' + t),
      Yt(i, function (s) {
        var o = s.split(':');
        ar[o[1]] = n[o[0]];
      });
  })(
    'x,y,z,scale,scaleX,scaleY,xPercent,yPercent',
    'rotation,rotationX,rotationY,skewX,skewY',
    'transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective',
    '0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY',
  );
  Yt(
    'x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective',
    function (r) {
      Vt.units[r] = 'px';
    },
  );
  ne.registerPlugin(Ra);
  var at = ne.registerPlugin(Ra) || ne,
    Wm = at.core.Tween;
  window.menu = function () {
    let r = document.getElementById('mobile-menu');
    return {
      open(e) {
        (r.style.height = window.innerHeight + 'px'),
          r.classList.remove('hidden'),
          (document.body.style.height = window.innerHeight + 'px'),
          document.body.classList.add('overflow-hidden'),
          at.set('#mobile-menu', { x: '100%' }),
          at.to('#mobile-menu', { x: 0, duration: 0.6, ease: 'power3.inOut' });
        let i = t();
        document.body.style.paddingRight = i + 'px';
      },
      close(e) {
        (document.body.style.paddingRight = ''),
          (document.body.style.height = 'auto'),
          document.body.classList.remove('overflow-hidden'),
          at.to('#mobile-menu', {
            x: '100%',
            duration: 0.3,
            ease: 'power3.inOut',
            onComplete: () => {
              r.classList.add('hidden');
            },
          });
      },
      resize() {
        (r.style.height = window.innerHeight + 'px'),
          window.innerWidth > 900 &&
            (r.classList.add('hidden'),
            document.body.classList.remove('fixed'),
            document.documentElement.classList.remove('fixed'));
      },
    };
    function t() {
      var e = document.createElement('div');
      (e.style.cssText =
        'width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;'),
        document.body.appendChild(e);
      var i = e.offsetWidth - e.clientWidth;
      return document.body.removeChild(e), scroll;
    }
  };
  window.product = function () {
    var r = document.getElementById('VariantId'),
      t = document.getElementById('product-price'),
      e = document.getElementById('compare-at-price'),
      i = document.getElementById('add-to-cart');
    return {
      setVariant(n) {
        n.preventDefault();
        let s = document.querySelector('.qty'),
          o = this.$el.getAttribute('data-variant-id'),
          a = this.$el.getAttribute('data-variant-price'),
          u = this.$el.getAttribute('data-variant-available'),
          f = this.$el.getAttribute('data-compare-at-variant-price');
        (r.value = o),
          (t.innerHTML = a),
          f
            ? (e.classList.remove('hidden'), (e.innerHTML = f))
            : e.classList.add('hidden'),
          s.setAttribute(
            'data-max',
            this.$el.getAttribute('data-variant-inventory'),
          ),
          s.value > s.getAttribute('data-max') &&
            (s.value = s.getAttribute('data-max')),
          (t.innerHTML = a),
          u === 'true'
            ? (i.removeAttribute('disabled'),
              i.classList.add('hover:bg-tint3'),
              i.classList.remove('opacity-50'),
              (i.innerHTML =
                '<span class="my-auto inline-block">Add to cart</span>'))
            : (i.setAttribute('disabled', 'disabled'),
              i.classList.remove('hover:bg-tint3'),
              i.classList.add('opacity-50'),
              (i.innerHTML =
                '<span class="my-auto inline-block">Sold out</span>')),
          this.$el.classList.remove('bg-tint2', 'text-tint3'),
          this.$el.classList.add('bg-tint3', 'text-tint2', 'active'),
          document.querySelectorAll('.variant').forEach((d) => {
            d !== this.$el &&
              (d.classList.remove('bg-tint3', 'text-tint2', 'active'),
              d.classList.add('bg-tint2', 'text-tint3'));
          });
      },
    };
  };
  window.qty = function () {
    let r = document.getElementById('update-cart');
    return {
      add(t) {
        let e = this.$el.parentElement.querySelector('.qty'),
          i = parseInt(e.getAttribute('data-max'), 10),
          n = parseInt(e.value, 10);
        n < i && ((e.value = n + 1), r && r.click());
      },
      minus(t) {
        let e = this.$el.parentElement.querySelector('.qty'),
          i = parseInt(e.value, 10);
        i > 1 && ((e.value = i - 1), r && r.click());
      },
    };
  };
  window.accordion = function () {
    return {
      toggle() {
        let t = this.$el.parentElement.querySelector('.accordion-content'),
          e = this.$el.querySelector('.status');
        this.$el.getAttribute('data-open') === 'false'
          ? (at.to(t, { height: 'auto', duration: 0.3, ease: 'power3.inOut' }),
            this.$el.setAttribute('data-open', 'true'),
            (e.innerHTML = '-'),
            this.$el.classList.add('text-tint3'),
            this.$el.classList.remove('text-tint1'))
          : (at.to(t, { height: 0, duration: 0.3, ease: 'power3.inOut' }),
            this.$el.setAttribute('data-open', 'false'),
            (e.innerHTML = '+'),
            this.$el.classList.add('text-tint1'),
            this.$el.classList.remove('text-tint3'));
      },
    };
  };
  function cc(r, t) {
    for (var e = 0; e < t.length; e++) {
      var i = t[e];
      (i.enumerable = i.enumerable || !1),
        (i.configurable = !0),
        'value' in i && (i.writable = !0),
        Object.defineProperty(r, i.key, i);
    }
  }
  function Rg(r, t, e) {
    return (
      t && cc(r.prototype, t),
      e && cc(r, e),
      Object.defineProperty(r, 'prototype', { writable: !1 }),
      r
    );
  }
  var dc = '(prefers-reduced-motion: reduce)',
    xi = 1,
    Mg = 2,
    Ti = 3,
    Si = 4,
    xn = 5,
    As = 6,
    ks = 7,
    Ig = {
      CREATED: xi,
      MOUNTED: Mg,
      IDLE: Ti,
      MOVING: Si,
      SCROLLING: xn,
      DRAGGING: As,
      DESTROYED: ks,
    };
  function Ye(r) {
    r.length = 0;
  }
  function gr(r, t, e) {
    return Array.prototype.slice.call(r, t, e);
  }
  function ht(r) {
    return r.bind.apply(r, [null].concat(gr(arguments, 1)));
  }
  var Ac = setTimeout,
    Ba = function () {};
  function hc(r) {
    return requestAnimationFrame(r);
  }
  function Ms(r, t) {
    return typeof t === r;
  }
  function dn(r) {
    return !$a(r) && Ms('object', r);
  }
  var Ya = Array.isArray,
    Pc = ht(Ms, 'function'),
    hr = ht(Ms, 'string'),
    bn = ht(Ms, 'undefined');
  function $a(r) {
    return r === null;
  }
  function Cc(r) {
    try {
      return r instanceof (r.ownerDocument.defaultView || window).HTMLElement;
    } catch {
      return !1;
    }
  }
  function wn(r) {
    return Ya(r) ? r : [r];
  }
  function ae(r, t) {
    wn(r).forEach(t);
  }
  function Ua(r, t) {
    return r.indexOf(t) > -1;
  }
  function Ps(r, t) {
    return r.push.apply(r, wn(t)), r;
  }
  function We(r, t, e) {
    r &&
      ae(t, function (i) {
        i && r.classList[e ? 'add' : 'remove'](i);
      });
  }
  function Ce(r, t) {
    We(r, hr(t) ? t.split(' ') : t, !0);
  }
  function Tn(r, t) {
    ae(t, r.appendChild.bind(r));
  }
  function Ga(r, t) {
    ae(r, function (e) {
      var i = (t || e).parentNode;
      i && i.insertBefore(e, t);
    });
  }
  function hn(r, t) {
    return Cc(r) && (r.msMatchesSelector || r.matches).call(r, t);
  }
  function Oc(r, t) {
    var e = r ? gr(r.children) : [];
    return t
      ? e.filter(function (i) {
          return hn(i, t);
        })
      : e;
  }
  function En(r, t) {
    return t ? Oc(r, t)[0] : r.firstElementChild;
  }
  var pn = Object.keys;
  function Yr(r, t, e) {
    return (
      r &&
        (e ? pn(r).reverse() : pn(r)).forEach(function (i) {
          i !== '__proto__' && t(r[i], i);
        }),
      r
    );
  }
  function _n(r) {
    return (
      gr(arguments, 1).forEach(function (t) {
        Yr(t, function (e, i) {
          r[i] = t[i];
        });
      }),
      r
    );
  }
  function dr(r) {
    return (
      gr(arguments, 1).forEach(function (t) {
        Yr(t, function (e, i) {
          Ya(e)
            ? (r[i] = e.slice())
            : dn(e)
            ? (r[i] = dr({}, dn(r[i]) ? r[i] : {}, e))
            : (r[i] = e);
        });
      }),
      r
    );
  }
  function pc(r, t) {
    ae(t || pn(r), function (e) {
      delete r[e];
    });
  }
  function Oe(r, t) {
    ae(r, function (e) {
      ae(t, function (i) {
        e && e.removeAttribute(i);
      });
    });
  }
  function Z(r, t, e) {
    dn(t)
      ? Yr(t, function (i, n) {
          Z(r, n, i);
        })
      : ae(r, function (i) {
          $a(e) || e === '' ? Oe(i, t) : i.setAttribute(t, String(e));
        });
  }
  function bi(r, t, e) {
    var i = document.createElement(r);
    return t && (hr(t) ? Ce(i, t) : Z(i, t)), e && Tn(e, i), i;
  }
  function ge(r, t, e) {
    if (bn(e)) return getComputedStyle(r)[t];
    $a(e) || (r.style[t] = '' + e);
  }
  function gn(r, t) {
    ge(r, 'display', t);
  }
  function kc(r) {
    (r.setActive && r.setActive()) || r.focus({ preventScroll: !0 });
  }
  function ve(r, t) {
    return r.getAttribute(t);
  }
  function _c(r, t) {
    return r && r.classList.contains(t);
  }
  function se(r) {
    return r.getBoundingClientRect();
  }
  function $r(r) {
    ae(r, function (t) {
      t && t.parentNode && t.parentNode.removeChild(t);
    });
  }
  function Dc(r) {
    return En(new DOMParser().parseFromString(r, 'text/html').body);
  }
  function ze(r, t) {
    r.preventDefault(),
      t && (r.stopPropagation(), r.stopImmediatePropagation());
  }
  function Lc(r, t) {
    return r && r.querySelector(t);
  }
  function qa(r, t) {
    return t ? gr(r.querySelectorAll(t)) : [];
  }
  function He(r, t) {
    We(r, t, !1);
  }
  function Va(r) {
    return r.timeStamp;
  }
  function Xr(r) {
    return hr(r) ? r : r ? r + 'px' : '';
  }
  var Sn = 'splide',
    ja = 'data-' + Sn;
  function fn(r, t) {
    if (!r) throw new Error('[' + Sn + '] ' + (t || ''));
  }
  var pr = Math.min,
    Ds = Math.max,
    Ls = Math.floor,
    vn = Math.ceil,
    Ut = Math.abs;
  function Rc(r, t, e) {
    return Ut(r - t) < e;
  }
  function Cs(r, t, e, i) {
    var n = pr(t, e),
      s = Ds(t, e);
    return i ? n < r && r < s : n <= r && r <= s;
  }
  function mi(r, t, e) {
    var i = pr(t, e),
      n = Ds(t, e);
    return pr(Ds(i, r), n);
  }
  function za(r) {
    return +(r > 0) - +(r < 0);
  }
  function Wa(r, t) {
    return (
      ae(t, function (e) {
        r = r.replace('%s', '' + e);
      }),
      r
    );
  }
  function Ka(r) {
    return r < 10 ? '0' + r : '' + r;
  }
  var gc = {};
  function Ng(r) {
    return '' + r + Ka((gc[r] = (gc[r] || 0) + 1));
  }
  function Mc() {
    var r = [];
    function t(o, a, u, f) {
      n(o, a, function (c, d, p) {
        var l = 'addEventListener' in c,
          _ = l
            ? c.removeEventListener.bind(c, d, u, f)
            : c.removeListener.bind(c, u);
        l ? c.addEventListener(d, u, f) : c.addListener(u),
          r.push([c, d, p, u, _]);
      });
    }
    function e(o, a, u) {
      n(o, a, function (f, c, d) {
        r = r.filter(function (p) {
          return p[0] === f && p[1] === c && p[2] === d && (!u || p[3] === u)
            ? (p[4](), !1)
            : !0;
        });
      });
    }
    function i(o, a, u) {
      var f,
        c = !0;
      return (
        typeof CustomEvent == 'function'
          ? (f = new CustomEvent(a, { bubbles: c, detail: u }))
          : ((f = document.createEvent('CustomEvent')),
            f.initCustomEvent(a, c, !1, u)),
        o.dispatchEvent(f),
        f
      );
    }
    function n(o, a, u) {
      ae(o, function (f) {
        f &&
          ae(a, function (c) {
            c.split(' ').forEach(function (d) {
              var p = d.split('.');
              u(f, p[0], p[1]);
            });
          });
      });
    }
    function s() {
      r.forEach(function (o) {
        o[4]();
      }),
        Ye(r);
    }
    return { bind: t, unbind: e, dispatch: i, destroy: s };
  }
  var Gr = 'mounted',
    vc = 'ready',
    _r = 'move',
    An = 'moved',
    Ic = 'click',
    Fg = 'active',
    Bg = 'inactive',
    Vg = 'visible',
    zg = 'hidden',
    At = 'refresh',
    Gt = 'updated',
    mn = 'resize',
    Qa = 'resized',
    Wg = 'drag',
    Hg = 'dragging',
    Xg = 'dragged',
    Za = 'scroll',
    Ai = 'scrolled',
    Yg = 'overflow',
    Nc = 'destroy',
    $g = 'arrows:mounted',
    Ug = 'arrows:updated',
    Gg = 'pagination:mounted',
    qg = 'pagination:updated',
    Fc = 'navigation:mounted',
    Bc = 'autoplay:play',
    jg = 'autoplay:playing',
    Vc = 'autoplay:pause',
    zc = 'lazyload:loaded',
    Wc = 'sk',
    Hc = 'sh',
    Rs = 'ei';
  function mt(r) {
    var t = r ? r.event.bus : document.createDocumentFragment(),
      e = Mc();
    function i(s, o) {
      e.bind(t, wn(s).join(' '), function (a) {
        o.apply(o, Ya(a.detail) ? a.detail : []);
      });
    }
    function n(s) {
      e.dispatch(t, s, gr(arguments, 1));
    }
    return (
      r && r.event.on(Nc, e.destroy),
      _n(e, { bus: t, on: i, off: ht(e.unbind, t), emit: n })
    );
  }
  function Is(r, t, e, i) {
    var n = Date.now,
      s,
      o = 0,
      a,
      u = !0,
      f = 0;
    function c() {
      if (!u) {
        if (
          ((o = r ? pr((n() - s) / r, 1) : 1),
          e && e(o),
          o >= 1 && (t(), (s = n()), i && ++f >= i))
        )
          return p();
        a = hc(c);
      }
    }
    function d(v) {
      v || _(), (s = n() - (v ? o * r : 0)), (u = !1), (a = hc(c));
    }
    function p() {
      u = !0;
    }
    function l() {
      (s = n()), (o = 0), e && e(o);
    }
    function _() {
      a && cancelAnimationFrame(a), (o = 0), (a = 0), (u = !0);
    }
    function h(v) {
      r = v;
    }
    function g() {
      return u;
    }
    return { start: d, rewind: l, pause: p, cancel: _, set: h, isPaused: g };
  }
  function Kg(r) {
    var t = r;
    function e(n) {
      t = n;
    }
    function i(n) {
      return Ua(wn(n), t);
    }
    return { set: e, is: i };
  }
  function Qg(r, t) {
    var e = Is(t || 0, r, null, 1);
    return function () {
      e.isPaused() && e.start();
    };
  }
  function Zg(r, t, e) {
    var i = r.state,
      n = e.breakpoints || {},
      s = e.reducedMotion || {},
      o = Mc(),
      a = [];
    function u() {
      var _ = e.mediaQuery === 'min';
      pn(n)
        .sort(function (h, g) {
          return _ ? +h - +g : +g - +h;
        })
        .forEach(function (h) {
          c(n[h], '(' + (_ ? 'min' : 'max') + '-width:' + h + 'px)');
        }),
        c(s, dc),
        d();
    }
    function f(_) {
      _ && o.destroy();
    }
    function c(_, h) {
      var g = matchMedia(h);
      o.bind(g, 'change', d), a.push([_, g]);
    }
    function d() {
      var _ = i.is(ks),
        h = e.direction,
        g = a.reduce(function (v, m) {
          return dr(v, m[1].matches ? m[0] : {});
        }, {});
      pc(e),
        l(g),
        e.destroy
          ? r.destroy(e.destroy === 'completely')
          : _
          ? (f(!0), r.mount())
          : h !== e.direction && r.refresh();
    }
    function p(_) {
      matchMedia(dc).matches && (_ ? dr(e, s) : pc(e, pn(s)));
    }
    function l(_, h, g) {
      dr(e, _),
        h && dr(Object.getPrototypeOf(e), _),
        (g || !i.is(xi)) && r.emit(Gt, e);
    }
    return { setup: u, destroy: f, reduce: p, set: l };
  }
  var Ns = 'Arrow',
    Fs = Ns + 'Left',
    Bs = Ns + 'Right',
    Xc = Ns + 'Up',
    Yc = Ns + 'Down';
  var mc = 'rtl',
    Vs = 'ttb',
    Ma = {
      width: ['height'],
      left: ['top', 'right'],
      right: ['bottom', 'left'],
      x: ['y'],
      X: ['Y'],
      Y: ['X'],
      ArrowLeft: [Xc, Bs],
      ArrowRight: [Yc, Fs],
    };
  function Jg(r, t, e) {
    function i(s, o, a) {
      a = a || e.direction;
      var u = a === mc && !o ? 1 : a === Vs ? 0 : -1;
      return (
        (Ma[s] && Ma[s][u]) ||
        s.replace(/width|left|right/i, function (f, c) {
          var d = Ma[f.toLowerCase()][u] || f;
          return c > 0 ? d.charAt(0).toUpperCase() + d.slice(1) : d;
        })
      );
    }
    function n(s) {
      return s * (e.direction === mc ? 1 : -1);
    }
    return { resolve: i, orient: n };
  }
  var Xe = 'role',
    wi = 'tabindex',
    tv = 'disabled',
    me = 'aria-',
    Pn = me + 'controls',
    $c = me + 'current',
    yc = me + 'selected',
    oe = me + 'label',
    Ja = me + 'labelledby',
    Uc = me + 'hidden',
    tu = me + 'orientation',
    yn = me + 'roledescription',
    xc = me + 'live',
    bc = me + 'busy',
    wc = me + 'atomic',
    eu = [Xe, wi, tv, Pn, $c, oe, Ja, Uc, tu, yn],
    ke = Sn + '__',
    vr = 'is-',
    Ia = Sn,
    Tc = ke + 'track',
    ev = ke + 'list',
    zs = ke + 'slide',
    Gc = zs + '--clone',
    rv = zs + '__container',
    ru = ke + 'arrows',
    Ws = ke + 'arrow',
    qc = Ws + '--prev',
    jc = Ws + '--next',
    Hs = ke + 'pagination',
    Kc = Hs + '__page',
    iv = ke + 'progress',
    nv = iv + '__bar',
    iu = ke + 'toggle',
    $m = iu + '__play',
    Um = iu + '__pause',
    sv = ke + 'spinner',
    ov = ke + 'sr',
    av = vr + 'initialized',
    Ur = vr + 'active',
    Qc = vr + 'prev',
    Zc = vr + 'next',
    Ha = vr + 'visible',
    Xa = vr + 'loading',
    Jc = vr + 'focus-in',
    td = vr + 'overflow',
    uv = [Ur, Ha, Qc, Zc, Xa, Jc, td],
    lv = {
      slide: zs,
      clone: Gc,
      arrows: ru,
      arrow: Ws,
      prev: qc,
      next: jc,
      pagination: Hs,
      page: Kc,
      spinner: sv,
    };
  function fv(r, t) {
    if (Pc(r.closest)) return r.closest(t);
    for (var e = r; e && e.nodeType === 1 && !hn(e, t); ) e = e.parentElement;
    return e;
  }
  var cv = 5,
    Ec = 200,
    ed = 'touchstart mousedown',
    Na = 'touchmove mousemove',
    Fa = 'touchend touchcancel mouseup click';
  function dv(r, t, e) {
    var i = mt(r),
      n = i.on,
      s = i.bind,
      o = r.root,
      a = e.i18n,
      u = {},
      f = [],
      c = [],
      d = [],
      p,
      l,
      _;
    function h() {
      y(), A(), m();
    }
    function g() {
      n(At, v),
        n(At, h),
        n(Gt, m),
        s(
          document,
          ed + ' keydown',
          function (w) {
            _ = w.type === 'keydown';
          },
          { capture: !0 },
        ),
        s(o, 'focusin', function () {
          We(o, Jc, !!_);
        });
    }
    function v(w) {
      var S = eu.concat('style');
      Ye(f), He(o, c), He(p, d), Oe([p, l], S), Oe(o, w ? S : ['style', yn]);
    }
    function m() {
      He(o, c),
        He(p, d),
        (c = E(Ia)),
        (d = E(Tc)),
        Ce(o, c),
        Ce(p, d),
        Z(o, oe, e.label),
        Z(o, Ja, e.labelledby);
    }
    function y() {
      (p = x('.' + Tc)),
        (l = En(p, '.' + ev)),
        fn(p && l, 'A track/list element is missing.'),
        Ps(f, Oc(l, '.' + zs + ':not(.' + Gc + ')')),
        Yr(
          {
            arrows: ru,
            pagination: Hs,
            prev: qc,
            next: jc,
            bar: nv,
            toggle: iu,
          },
          function (w, S) {
            u[S] = x('.' + w);
          },
        ),
        _n(u, { root: o, track: p, list: l, slides: f });
    }
    function A() {
      var w = o.id || Ng(Sn),
        S = e.role;
      (o.id = w),
        (p.id = p.id || w + '-track'),
        (l.id = l.id || w + '-list'),
        !ve(o, Xe) && o.tagName !== 'SECTION' && S && Z(o, Xe, S),
        Z(o, yn, a.carousel),
        Z(l, Xe, 'presentation');
    }
    function x(w) {
      var S = Lc(o, w);
      return S && fv(S, '.' + Ia) === o ? S : void 0;
    }
    function E(w) {
      return [
        w + '--' + e.type,
        w + '--' + e.direction,
        e.drag && w + '--draggable',
        e.isNavigation && w + '--nav',
        w === Ia && Ur,
      ];
    }
    return _n(u, { setup: h, mount: g, destroy: v });
  }
  var Ei = 'slide',
    Pi = 'loop',
    Cn = 'fade';
  function hv(r, t, e, i) {
    var n = mt(r),
      s = n.on,
      o = n.emit,
      a = n.bind,
      u = r.Components,
      f = r.root,
      c = r.options,
      d = c.isNavigation,
      p = c.updateOnMove,
      l = c.i18n,
      _ = c.pagination,
      h = c.slideFocus,
      g = u.Direction.resolve,
      v = ve(i, 'style'),
      m = ve(i, oe),
      y = e > -1,
      A = En(i, '.' + rv),
      x;
    function E() {
      y ||
        ((i.id = f.id + '-slide' + Ka(t + 1)),
        Z(i, Xe, _ ? 'tabpanel' : 'group'),
        Z(i, yn, l.slide),
        Z(i, oe, m || Wa(l.slideLabel, [t + 1, r.length]))),
        w();
    }
    function w() {
      a(i, 'click', ht(o, Ic, z)),
        a(i, 'keydown', ht(o, Wc, z)),
        s([An, Hc, Ai], O),
        s(Fc, k),
        p && s(_r, M);
    }
    function S() {
      (x = !0),
        n.destroy(),
        He(i, uv),
        Oe(i, eu),
        Z(i, 'style', v),
        Z(i, oe, m || '');
    }
    function k() {
      var $ = r.splides
        .map(function (B) {
          var N = B.splide.Components.Slides.getAt(t);
          return N ? N.slide.id : '';
        })
        .join(' ');
      Z(i, oe, Wa(l.slideX, (y ? e : t) + 1)),
        Z(i, Pn, $),
        Z(i, Xe, h ? 'button' : ''),
        h && Oe(i, yn);
    }
    function M() {
      x || O();
    }
    function O() {
      if (!x) {
        var $ = r.index;
        P(), T(), We(i, Qc, t === $ - 1), We(i, Zc, t === $ + 1);
      }
    }
    function P() {
      var $ = R();
      $ !== _c(i, Ur) &&
        (We(i, Ur, $), Z(i, $c, (d && $) || ''), o($ ? Fg : Bg, z));
    }
    function T() {
      var $ = W(),
        B = !$ && (!R() || y);
      if (
        (r.state.is([Si, xn]) || Z(i, Uc, B || ''),
        Z(qa(i, c.focusableNodes || ''), wi, B ? -1 : ''),
        h && Z(i, wi, B ? -1 : 0),
        $ !== _c(i, Ha) && (We(i, Ha, $), o($ ? Vg : zg, z)),
        !$ && document.activeElement === i)
      ) {
        var N = u.Slides.getAt(r.index);
        N && kc(N.slide);
      }
    }
    function D($, B, N) {
      ge((N && A) || i, $, B);
    }
    function R() {
      var $ = r.index;
      return $ === t || (c.cloneStatus && $ === e);
    }
    function W() {
      if (r.is(Cn)) return R();
      var $ = se(u.Elements.track),
        B = se(i),
        N = g('left', !0),
        U = g('right', !0);
      return Ls($[N]) <= vn(B[N]) && Ls(B[U]) <= vn($[U]);
    }
    function Y($, B) {
      var N = Ut($ - t);
      return !y && (c.rewind || r.is(Pi)) && (N = pr(N, r.length - N)), N <= B;
    }
    var z = {
      index: t,
      slideIndex: e,
      slide: i,
      container: A,
      isClone: y,
      mount: E,
      destroy: S,
      update: O,
      style: D,
      isWithin: Y,
    };
    return z;
  }
  function pv(r, t, e) {
    var i = mt(r),
      n = i.on,
      s = i.emit,
      o = i.bind,
      a = t.Elements,
      u = a.slides,
      f = a.list,
      c = [];
    function d() {
      p(), n(At, l), n(At, p);
    }
    function p() {
      u.forEach(function (O, P) {
        h(O, P, -1);
      });
    }
    function l() {
      x(function (O) {
        O.destroy();
      }),
        Ye(c);
    }
    function _() {
      x(function (O) {
        O.update();
      });
    }
    function h(O, P, T) {
      var D = hv(r, P, T, O);
      D.mount(),
        c.push(D),
        c.sort(function (R, W) {
          return R.index - W.index;
        });
    }
    function g(O) {
      return O
        ? E(function (P) {
            return !P.isClone;
          })
        : c;
    }
    function v(O) {
      var P = t.Controller,
        T = P.toIndex(O),
        D = P.hasFocus() ? 1 : e.perPage;
      return E(function (R) {
        return Cs(R.index, T, T + D - 1);
      });
    }
    function m(O) {
      return E(O)[0];
    }
    function y(O, P) {
      ae(O, function (T) {
        if ((hr(T) && (T = Dc(T)), Cc(T))) {
          var D = u[P];
          D ? Ga(T, D) : Tn(f, T), Ce(T, e.classes.slide), S(T, ht(s, mn));
        }
      }),
        s(At);
    }
    function A(O) {
      $r(
        E(O).map(function (P) {
          return P.slide;
        }),
      ),
        s(At);
    }
    function x(O, P) {
      g(P).forEach(O);
    }
    function E(O) {
      return c.filter(
        Pc(O)
          ? O
          : function (P) {
              return hr(O) ? hn(P.slide, O) : Ua(wn(O), P.index);
            },
      );
    }
    function w(O, P, T) {
      x(function (D) {
        D.style(O, P, T);
      });
    }
    function S(O, P) {
      var T = qa(O, 'img'),
        D = T.length;
      D
        ? T.forEach(function (R) {
            o(R, 'load error', function () {
              --D || P();
            });
          })
        : P();
    }
    function k(O) {
      return O ? u.length : c.length;
    }
    function M() {
      return c.length > e.perPage;
    }
    return {
      mount: d,
      destroy: l,
      update: _,
      register: h,
      get: g,
      getIn: v,
      getAt: m,
      add: y,
      remove: A,
      forEach: x,
      filter: E,
      style: w,
      getLength: k,
      isEnough: M,
    };
  }
  function _v(r, t, e) {
    var i = mt(r),
      n = i.on,
      s = i.bind,
      o = i.emit,
      a = t.Slides,
      u = t.Direction.resolve,
      f = t.Elements,
      c = f.root,
      d = f.track,
      p = f.list,
      l = a.getAt,
      _ = a.style,
      h,
      g,
      v;
    function m() {
      y(), s(window, 'resize load', Qg(ht(o, mn))), n([Gt, At], y), n(mn, A);
    }
    function y() {
      (h = e.direction === Vs),
        ge(c, 'maxWidth', Xr(e.width)),
        ge(d, u('paddingLeft'), x(!1)),
        ge(d, u('paddingRight'), x(!0)),
        A(!0);
    }
    function A(z) {
      var $ = se(c);
      (z || g.width !== $.width || g.height !== $.height) &&
        (ge(d, 'height', E()),
        _(u('marginRight'), Xr(e.gap)),
        _('width', S()),
        _('height', k(), !0),
        (g = $),
        o(Qa),
        v !== (v = Y()) && (We(c, td, v), o(Yg, v)));
    }
    function x(z) {
      var $ = e.padding,
        B = u(z ? 'right' : 'left');
      return ($ && Xr($[B] || (dn($) ? 0 : $))) || '0px';
    }
    function E() {
      var z = '';
      return (
        h &&
          ((z = w()),
          fn(z, 'height or heightRatio is missing.'),
          (z = 'calc(' + z + ' - ' + x(!1) + ' - ' + x(!0) + ')')),
        z
      );
    }
    function w() {
      return Xr(e.height || se(p).width * e.heightRatio);
    }
    function S() {
      return e.autoWidth ? null : Xr(e.fixedWidth) || (h ? '' : M());
    }
    function k() {
      return Xr(e.fixedHeight) || (h ? (e.autoHeight ? null : M()) : w());
    }
    function M() {
      var z = Xr(e.gap);
      return (
        'calc((100%' +
        (z && ' + ' + z) +
        ')/' +
        (e.perPage || 1) +
        (z && ' - ' + z) +
        ')'
      );
    }
    function O() {
      return se(p)[u('width')];
    }
    function P(z, $) {
      var B = l(z || 0);
      return B ? se(B.slide)[u('width')] + ($ ? 0 : R()) : 0;
    }
    function T(z, $) {
      var B = l(z);
      if (B) {
        var N = se(B.slide)[u('right')],
          U = se(p)[u('left')];
        return Ut(N - U) + ($ ? 0 : R());
      }
      return 0;
    }
    function D(z) {
      return T(r.length - 1) - T(0) + P(0, z);
    }
    function R() {
      var z = l(0);
      return (z && parseFloat(ge(z.slide, u('marginRight')))) || 0;
    }
    function W(z) {
      return parseFloat(ge(d, u('padding' + (z ? 'Right' : 'Left')))) || 0;
    }
    function Y() {
      return r.is(Cn) || D(!0) > O();
    }
    return {
      mount: m,
      resize: A,
      listSize: O,
      slideSize: P,
      sliderSize: D,
      totalSize: T,
      getPadding: W,
      isOverflow: Y,
    };
  }
  var gv = 2;
  function vv(r, t, e) {
    var i = mt(r),
      n = i.on,
      s = t.Elements,
      o = t.Slides,
      a = t.Direction.resolve,
      u = [],
      f;
    function c() {
      n(At, d), n([Gt, mn], l), (f = g()) && (_(f), t.Layout.resize(!0));
    }
    function d() {
      p(), c();
    }
    function p() {
      $r(u), Ye(u), i.destroy();
    }
    function l() {
      var v = g();
      f !== v && (f < v || !v) && i.emit(At);
    }
    function _(v) {
      var m = o.get().slice(),
        y = m.length;
      if (y) {
        for (; m.length < v; ) Ps(m, m);
        Ps(m.slice(-v), m.slice(0, v)).forEach(function (A, x) {
          var E = x < v,
            w = h(A.slide, x);
          E ? Ga(w, m[0].slide) : Tn(s.list, w),
            Ps(u, w),
            o.register(w, x - v + (E ? 0 : y), A.index);
        });
      }
    }
    function h(v, m) {
      var y = v.cloneNode(!0);
      return (
        Ce(y, e.classes.clone), (y.id = r.root.id + '-clone' + Ka(m + 1)), y
      );
    }
    function g() {
      var v = e.clones;
      if (!r.is(Pi)) v = 0;
      else if (bn(v)) {
        var m = e[a('fixedWidth')] && t.Layout.slideSize(0),
          y = m && vn(se(s.track)[a('width')] / m);
        v = y || (e[a('autoWidth')] && r.length) || e.perPage * gv;
      }
      return v;
    }
    return { mount: c, destroy: p };
  }
  function mv(r, t, e) {
    var i = mt(r),
      n = i.on,
      s = i.emit,
      o = r.state.set,
      a = t.Layout,
      u = a.slideSize,
      f = a.getPadding,
      c = a.totalSize,
      d = a.listSize,
      p = a.sliderSize,
      l = t.Direction,
      _ = l.resolve,
      h = l.orient,
      g = t.Elements,
      v = g.list,
      m = g.track,
      y;
    function A() {
      (y = t.Transition), n([Gr, Qa, Gt, At], x);
    }
    function x() {
      t.Controller.isBusy() ||
        (t.Scroll.cancel(), w(r.index), t.Slides.update());
    }
    function E(B, N, U, j) {
      B !== N && z(B > U) && (O(), S(M(D(), B > U), !0)),
        o(Si),
        s(_r, N, U, B),
        y.start(N, function () {
          o(Ti), s(An, N, U, B), j && j();
        });
    }
    function w(B) {
      S(T(B, !0));
    }
    function S(B, N) {
      if (!r.is(Cn)) {
        var U = N ? B : k(B);
        ge(v, 'transform', 'translate' + _('X') + '(' + U + 'px)'),
          B !== U && s(Hc);
      }
    }
    function k(B) {
      if (r.is(Pi)) {
        var N = P(B),
          U = N > t.Controller.getEnd(),
          j = N < 0;
        (j || U) && (B = M(B, U));
      }
      return B;
    }
    function M(B, N) {
      var U = B - Y(N),
        j = p();
      return (B -= h(j * (vn(Ut(U) / j) || 1)) * (N ? 1 : -1)), B;
    }
    function O() {
      S(D(), !0), y.cancel();
    }
    function P(B) {
      for (var N = t.Slides.get(), U = 0, j = 1 / 0, K = 0; K < N.length; K++) {
        var Ft = N[K].index,
          I = Ut(T(Ft, !0) - B);
        if (I <= j) (j = I), (U = Ft);
        else break;
      }
      return U;
    }
    function T(B, N) {
      var U = h(c(B - 1) - W(B));
      return N ? R(U) : U;
    }
    function D() {
      var B = _('left');
      return se(v)[B] - se(m)[B] + h(f(!1));
    }
    function R(B) {
      return e.trimSpace && r.is(Ei) && (B = mi(B, 0, h(p(!0) - d()))), B;
    }
    function W(B) {
      var N = e.focus;
      return N === 'center' ? (d() - u(B, !0)) / 2 : +N * u(B) || 0;
    }
    function Y(B) {
      return T(B ? t.Controller.getEnd() : 0, !!e.trimSpace);
    }
    function z(B) {
      var N = h(M(D(), B));
      return B ? N >= 0 : N <= v[_('scrollWidth')] - se(m)[_('width')];
    }
    function $(B, N) {
      N = bn(N) ? D() : N;
      var U = B !== !0 && h(N) < h(Y(!1)),
        j = B !== !1 && h(N) > h(Y(!0));
      return U || j;
    }
    return {
      mount: A,
      move: E,
      jump: w,
      translate: S,
      shift: M,
      cancel: O,
      toIndex: P,
      toPosition: T,
      getPosition: D,
      getLimit: Y,
      exceededLimit: $,
      reposition: x,
    };
  }
  function yv(r, t, e) {
    var i = mt(r),
      n = i.on,
      s = i.emit,
      o = t.Move,
      a = o.getPosition,
      u = o.getLimit,
      f = o.toPosition,
      c = t.Slides,
      d = c.isEnough,
      p = c.getLength,
      l = e.omitEnd,
      _ = r.is(Pi),
      h = r.is(Ei),
      g = ht(D, !1),
      v = ht(D, !0),
      m = e.start || 0,
      y,
      A = m,
      x,
      E,
      w;
    function S() {
      k(), n([Gt, At, Rs], k), n(Qa, M);
    }
    function k() {
      (x = p(!0)), (E = e.perMove), (w = e.perPage), (y = z());
      var I = mi(m, 0, l ? y : x - 1);
      I !== m && ((m = I), o.reposition());
    }
    function M() {
      y !== z() && s(Rs);
    }
    function O(I, ot, nt) {
      if (!Ft()) {
        var _t = T(I),
          gt = Y(_t);
        gt > -1 && (ot || gt !== m) && (U(gt), o.move(_t, gt, A, nt));
      }
    }
    function P(I, ot, nt, _t) {
      t.Scroll.scroll(I, ot, nt, function () {
        var gt = Y(o.toIndex(a()));
        U(l ? pr(gt, y) : gt), _t && _t();
      });
    }
    function T(I) {
      var ot = m;
      if (hr(I)) {
        var nt = I.match(/([+\-<>])(\d+)?/) || [],
          _t = nt[1],
          gt = nt[2];
        _t === '+' || _t === '-'
          ? (ot = R(m + +('' + _t + (+gt || 1)), m))
          : _t === '>'
          ? (ot = gt ? $(+gt) : g(!0))
          : _t === '<' && (ot = v(!0));
      } else ot = _ ? I : mi(I, 0, y);
      return ot;
    }
    function D(I, ot) {
      var nt = E || (K() ? 1 : w),
        _t = R(m + nt * (I ? -1 : 1), m, !(E || K()));
      return _t === -1 && h && !Rc(a(), u(!I), 1)
        ? I
          ? 0
          : y
        : ot
        ? _t
        : Y(_t);
    }
    function R(I, ot, nt) {
      if (d() || K()) {
        var _t = W(I);
        _t !== I && ((ot = I), (I = _t), (nt = !1)),
          I < 0 || I > y
            ? !E && (Cs(0, I, ot, !0) || Cs(y, ot, I, !0))
              ? (I = $(B(I)))
              : _
              ? (I = nt ? (I < 0 ? -(x % w || w) : x) : I)
              : e.rewind
              ? (I = I < 0 ? y : 0)
              : (I = -1)
            : nt && I !== ot && (I = $(B(ot) + (I < ot ? -1 : 1)));
      } else I = -1;
      return I;
    }
    function W(I) {
      if (h && e.trimSpace === 'move' && I !== m)
        for (
          var ot = a();
          ot === f(I, !0) && Cs(I, 0, r.length - 1, !e.rewind);

        )
          I < m ? --I : ++I;
      return I;
    }
    function Y(I) {
      return _ ? (I + x) % x || 0 : I;
    }
    function z() {
      for (var I = x - (K() || (_ && E) ? 1 : w); l && I-- > 0; )
        if (f(x - 1, !0) !== f(I, !0)) {
          I++;
          break;
        }
      return mi(I, 0, x - 1);
    }
    function $(I) {
      return mi(K() ? I : w * I, 0, y);
    }
    function B(I) {
      return K() ? pr(I, y) : Ls((I >= y ? x - 1 : I) / w);
    }
    function N(I) {
      var ot = o.toIndex(I);
      return h ? mi(ot, 0, y) : ot;
    }
    function U(I) {
      I !== m && ((A = m), (m = I));
    }
    function j(I) {
      return I ? A : m;
    }
    function K() {
      return !bn(e.focus) || e.isNavigation;
    }
    function Ft() {
      return r.state.is([Si, xn]) && !!e.waitForTransition;
    }
    return {
      mount: S,
      go: O,
      scroll: P,
      getNext: g,
      getPrev: v,
      getAdjacent: D,
      getEnd: z,
      setIndex: U,
      getIndex: j,
      toIndex: $,
      toPage: B,
      toDest: N,
      hasFocus: K,
      isBusy: Ft,
    };
  }
  var xv = 'http://www.w3.org/2000/svg',
    bv =
      'm15.5 0.932-4.3 4.38 14.5 14.6-14.5 14.5 4.3 4.4 14.6-14.6 4.4-4.3-4.4-4.4-14.6-14.6z',
    Ss = 40;
  function wv(r, t, e) {
    var i = mt(r),
      n = i.on,
      s = i.bind,
      o = i.emit,
      a = e.classes,
      u = e.i18n,
      f = t.Elements,
      c = t.Controller,
      d = f.arrows,
      p = f.track,
      l = d,
      _ = f.prev,
      h = f.next,
      g,
      v,
      m = {};
    function y() {
      x(), n(Gt, A);
    }
    function A() {
      E(), y();
    }
    function x() {
      var P = e.arrows;
      P && !(_ && h) && k(),
        _ &&
          h &&
          (_n(m, { prev: _, next: h }),
          gn(l, P ? '' : 'none'),
          Ce(l, (v = ru + '--' + e.direction)),
          P && (w(), O(), Z([_, h], Pn, p.id), o($g, _, h)));
    }
    function E() {
      i.destroy(),
        He(l, v),
        g ? ($r(d ? [_, h] : l), (_ = h = null)) : Oe([_, h], eu);
    }
    function w() {
      n([Gr, An, At, Ai, Rs], O),
        s(h, 'click', ht(S, '>')),
        s(_, 'click', ht(S, '<'));
    }
    function S(P) {
      c.go(P, !0);
    }
    function k() {
      (l = d || bi('div', a.arrows)),
        (_ = M(!0)),
        (h = M(!1)),
        (g = !0),
        Tn(l, [_, h]),
        !d && Ga(l, p);
    }
    function M(P) {
      var T =
        '<button class="' +
        a.arrow +
        ' ' +
        (P ? a.prev : a.next) +
        '" type="button"><svg xmlns="' +
        xv +
        '" viewBox="0 0 ' +
        Ss +
        ' ' +
        Ss +
        '" width="' +
        Ss +
        '" height="' +
        Ss +
        '" focusable="false"><path d="' +
        (e.arrowPath || bv) +
        '" />';
      return Dc(T);
    }
    function O() {
      if (_ && h) {
        var P = r.index,
          T = c.getPrev(),
          D = c.getNext(),
          R = T > -1 && P < T ? u.last : u.prev,
          W = D > -1 && P > D ? u.first : u.next;
        (_.disabled = T < 0),
          (h.disabled = D < 0),
          Z(_, oe, R),
          Z(h, oe, W),
          o(Ug, _, h, T, D);
      }
    }
    return { arrows: m, mount: y, destroy: E, update: O };
  }
  var Tv = ja + '-interval';
  function Ev(r, t, e) {
    var i = mt(r),
      n = i.on,
      s = i.bind,
      o = i.emit,
      a = Is(e.interval, r.go.bind(r, '>'), w),
      u = a.isPaused,
      f = t.Elements,
      c = t.Elements,
      d = c.root,
      p = c.toggle,
      l = e.autoplay,
      _,
      h,
      g = l === 'pause';
    function v() {
      l && (m(), p && Z(p, Pn, f.track.id), g || y(), E());
    }
    function m() {
      e.pauseOnHover &&
        s(d, 'mouseenter mouseleave', function (k) {
          (_ = k.type === 'mouseenter'), x();
        }),
        e.pauseOnFocus &&
          s(d, 'focusin focusout', function (k) {
            (h = k.type === 'focusin'), x();
          }),
        p &&
          s(p, 'click', function () {
            g ? y() : A(!0);
          }),
        n([_r, Za, At], a.rewind),
        n(_r, S);
    }
    function y() {
      u() &&
        t.Slides.isEnough() &&
        (a.start(!e.resetProgress), (h = _ = g = !1), E(), o(Bc));
    }
    function A(k) {
      k === void 0 && (k = !0), (g = !!k), E(), u() || (a.pause(), o(Vc));
    }
    function x() {
      g || (_ || h ? A(!1) : y());
    }
    function E() {
      p && (We(p, Ur, !g), Z(p, oe, e.i18n[g ? 'play' : 'pause']));
    }
    function w(k) {
      var M = f.bar;
      M && ge(M, 'width', k * 100 + '%'), o(jg, k);
    }
    function S(k) {
      var M = t.Slides.getAt(k);
      a.set((M && +ve(M.slide, Tv)) || e.interval);
    }
    return { mount: v, destroy: a.cancel, play: y, pause: A, isPaused: u };
  }
  function Sv(r, t, e) {
    var i = mt(r),
      n = i.on;
    function s() {
      e.cover && (n(zc, ht(a, !0)), n([Gr, Gt, At], ht(o, !0)));
    }
    function o(u) {
      t.Slides.forEach(function (f) {
        var c = En(f.container || f.slide, 'img');
        c && c.src && a(u, c, f);
      });
    }
    function a(u, f, c) {
      c.style(
        'background',
        u ? 'center/cover no-repeat url("' + f.src + '")' : '',
        !0,
      ),
        gn(f, u ? 'none' : '');
    }
    return { mount: s, destroy: ht(o, !1) };
  }
  var Av = 10,
    Pv = 600,
    Cv = 0.6,
    Ov = 1.5,
    kv = 800;
  function Dv(r, t, e) {
    var i = mt(r),
      n = i.on,
      s = i.emit,
      o = r.state.set,
      a = t.Move,
      u = a.getPosition,
      f = a.getLimit,
      c = a.exceededLimit,
      d = a.translate,
      p = r.is(Ei),
      l,
      _,
      h = 1;
    function g() {
      n(_r, A), n([Gt, At], x);
    }
    function v(w, S, k, M, O) {
      var P = u();
      if ((A(), k && (!p || !c()))) {
        var T = t.Layout.sliderSize(),
          D = za(w) * T * Ls(Ut(w) / T) || 0;
        w = a.toPosition(t.Controller.toDest(w % T)) + D;
      }
      var R = Rc(P, w, 1);
      (h = 1),
        (S = R ? 0 : S || Ds(Ut(w - P) / Ov, kv)),
        (_ = M),
        (l = Is(S, m, ht(y, P, w, O), 1)),
        o(xn),
        s(Za),
        l.start();
    }
    function m() {
      o(Ti), _ && _(), s(Ai);
    }
    function y(w, S, k, M) {
      var O = u(),
        P = w + (S - w) * E(M),
        T = (P - O) * h;
      d(O + T),
        p && !k && c() && ((h *= Cv), Ut(T) < Av && v(f(c(!0)), Pv, !1, _, !0));
    }
    function A() {
      l && l.cancel();
    }
    function x() {
      l && !l.isPaused() && (A(), m());
    }
    function E(w) {
      var S = e.easingFunc;
      return S ? S(w) : 1 - Math.pow(1 - w, 4);
    }
    return { mount: g, destroy: A, scroll: v, cancel: x };
  }
  var yi = { passive: !1, capture: !0 };
  function Lv(r, t, e) {
    var i = mt(r),
      n = i.on,
      s = i.emit,
      o = i.bind,
      a = i.unbind,
      u = r.state,
      f = t.Move,
      c = t.Scroll,
      d = t.Controller,
      p = t.Elements.track,
      l = t.Media.reduce,
      _ = t.Direction,
      h = _.resolve,
      g = _.orient,
      v = f.getPosition,
      m = f.exceededLimit,
      y,
      A,
      x,
      E,
      w,
      S = !1,
      k,
      M,
      O;
    function P() {
      o(p, Na, Ba, yi),
        o(p, Fa, Ba, yi),
        o(p, ed, D, yi),
        o(p, 'click', Y, { capture: !0 }),
        o(p, 'dragstart', ze),
        n([Gr, Gt], T);
    }
    function T() {
      var H = e.drag;
      Te(!H), (E = H === 'free');
    }
    function D(H) {
      if (((k = !1), !M)) {
        var Q = gt(H);
        _t(H.target) &&
          (Q || !H.button) &&
          (d.isBusy()
            ? ze(H, !0)
            : ((O = Q ? p : window),
              (w = u.is([Si, xn])),
              (x = null),
              o(O, Na, R, yi),
              o(O, Fa, W, yi),
              f.cancel(),
              c.cancel(),
              z(H)));
      }
    }
    function R(H) {
      if ((u.is(As) || (u.set(As), s(Wg)), H.cancelable))
        if (w) {
          f.translate(y + nt(K(H)));
          var Q = Ft(H) > Ec,
            J = S !== (S = m());
          (Q || J) && z(H), (k = !0), s(Hg), ze(H);
        } else N(H) && ((w = B(H)), ze(H));
    }
    function W(H) {
      u.is(As) && (u.set(Ti), s(Xg)),
        w && ($(H), ze(H)),
        a(O, Na, R),
        a(O, Fa, W),
        (w = !1);
    }
    function Y(H) {
      !M && k && ze(H, !0);
    }
    function z(H) {
      (x = A), (A = H), (y = v());
    }
    function $(H) {
      var Q = U(H),
        J = j(Q),
        je = e.rewind && e.rewindByDrag;
      l(!1),
        E
          ? d.scroll(J, 0, e.snap)
          : r.is(Cn)
          ? d.go(g(za(Q)) < 0 ? (je ? '<' : '-') : je ? '>' : '+')
          : r.is(Ei) && S && je
          ? d.go(m(!0) ? '>' : '<')
          : d.go(d.toDest(J), !0),
        l(!0);
    }
    function B(H) {
      var Q = e.dragMinThreshold,
        J = dn(Q),
        je = (J && Q.mouse) || 0,
        Wt = (J ? Q.touch : +Q) || 10;
      return Ut(K(H)) > (gt(H) ? Wt : je);
    }
    function N(H) {
      return Ut(K(H)) > Ut(K(H, !0));
    }
    function U(H) {
      if (r.is(Pi) || !S) {
        var Q = Ft(H);
        if (Q && Q < Ec) return K(H) / Q;
      }
      return 0;
    }
    function j(H) {
      return (
        v() +
        za(H) *
          pr(
            Ut(H) * (e.flickPower || 600),
            E ? 1 / 0 : t.Layout.listSize() * (e.flickMaxPages || 1),
          )
      );
    }
    function K(H, Q) {
      return ot(H, Q) - ot(I(H), Q);
    }
    function Ft(H) {
      return Va(H) - Va(I(H));
    }
    function I(H) {
      return (A === H && x) || A;
    }
    function ot(H, Q) {
      return (gt(H) ? H.changedTouches[0] : H)['page' + h(Q ? 'Y' : 'X')];
    }
    function nt(H) {
      return H / (S && r.is(Ei) ? cv : 1);
    }
    function _t(H) {
      var Q = e.noDrag;
      return !hn(H, '.' + Kc + ', .' + Ws) && (!Q || !hn(H, Q));
    }
    function gt(H) {
      return typeof TouchEvent < 'u' && H instanceof TouchEvent;
    }
    function we() {
      return w;
    }
    function Te(H) {
      M = H;
    }
    return { mount: P, disable: Te, isDragging: we };
  }
  var Rv = { Spacebar: ' ', Right: Bs, Left: Fs, Up: Xc, Down: Yc };
  function nu(r) {
    return (r = hr(r) ? r : r.key), Rv[r] || r;
  }
  var Sc = 'keydown';
  function Mv(r, t, e) {
    var i = mt(r),
      n = i.on,
      s = i.bind,
      o = i.unbind,
      a = r.root,
      u = t.Direction.resolve,
      f,
      c;
    function d() {
      p(), n(Gt, l), n(Gt, p), n(_r, h);
    }
    function p() {
      var v = e.keyboard;
      v && ((f = v === 'global' ? window : a), s(f, Sc, g));
    }
    function l() {
      o(f, Sc);
    }
    function _(v) {
      c = v;
    }
    function h() {
      var v = c;
      (c = !0),
        Ac(function () {
          c = v;
        });
    }
    function g(v) {
      if (!c) {
        var m = nu(v);
        m === u(Fs) ? r.go('<') : m === u(Bs) && r.go('>');
      }
    }
    return { mount: d, destroy: l, disable: _ };
  }
  var cn = ja + '-lazy',
    Os = cn + '-srcset',
    Iv = '[' + cn + '], [' + Os + ']';
  function Nv(r, t, e) {
    var i = mt(r),
      n = i.on,
      s = i.off,
      o = i.bind,
      a = i.emit,
      u = e.lazyLoad === 'sequential',
      f = [An, Ai],
      c = [];
    function d() {
      e.lazyLoad && (p(), n(At, p));
    }
    function p() {
      Ye(c), l(), u ? v() : (s(f), n(f, _), _());
    }
    function l() {
      t.Slides.forEach(function (m) {
        qa(m.slide, Iv).forEach(function (y) {
          var A = ve(y, cn),
            x = ve(y, Os);
          if (A !== y.src || x !== y.srcset) {
            var E = e.classes.spinner,
              w = y.parentElement,
              S = En(w, '.' + E) || bi('span', E, w);
            c.push([y, m, S]), y.src || gn(y, 'none');
          }
        });
      });
    }
    function _() {
      (c = c.filter(function (m) {
        var y = e.perPage * ((e.preloadPages || 1) + 1) - 1;
        return m[1].isWithin(r.index, y) ? h(m) : !0;
      })),
        c.length || s(f);
    }
    function h(m) {
      var y = m[0];
      Ce(m[1].slide, Xa),
        o(y, 'load error', ht(g, m)),
        Z(y, 'src', ve(y, cn)),
        Z(y, 'srcset', ve(y, Os)),
        Oe(y, cn),
        Oe(y, Os);
    }
    function g(m, y) {
      var A = m[0],
        x = m[1];
      He(x.slide, Xa),
        y.type !== 'error' && ($r(m[2]), gn(A, ''), a(zc, A, x), a(mn)),
        u && v();
    }
    function v() {
      c.length && h(c.shift());
    }
    return { mount: d, destroy: ht(Ye, c), check: _ };
  }
  function Fv(r, t, e) {
    var i = mt(r),
      n = i.on,
      s = i.emit,
      o = i.bind,
      a = t.Slides,
      u = t.Elements,
      f = t.Controller,
      c = f.hasFocus,
      d = f.getIndex,
      p = f.go,
      l = t.Direction.resolve,
      _ = u.pagination,
      h = [],
      g,
      v;
    function m() {
      y(), n([Gt, At, Rs], m);
      var M = e.pagination;
      _ && gn(_, M ? '' : 'none'),
        M &&
          (n([_r, Za, Ai], k),
          A(),
          k(),
          s(Gg, { list: g, items: h }, S(r.index)));
    }
    function y() {
      g && ($r(_ ? gr(g.children) : g), He(g, v), Ye(h), (g = null)),
        i.destroy();
    }
    function A() {
      var M = r.length,
        O = e.classes,
        P = e.i18n,
        T = e.perPage,
        D = c() ? f.getEnd() + 1 : vn(M / T);
      (g = _ || bi('ul', O.pagination, u.track.parentElement)),
        Ce(g, (v = Hs + '--' + w())),
        Z(g, Xe, 'tablist'),
        Z(g, oe, P.select),
        Z(g, tu, w() === Vs ? 'vertical' : '');
      for (var R = 0; R < D; R++) {
        var W = bi('li', null, g),
          Y = bi('button', { class: O.page, type: 'button' }, W),
          z = a.getIn(R).map(function (B) {
            return B.slide.id;
          }),
          $ = !c() && T > 1 ? P.pageX : P.slideX;
        o(Y, 'click', ht(x, R)),
          e.paginationKeyboard && o(Y, 'keydown', ht(E, R)),
          Z(W, Xe, 'presentation'),
          Z(Y, Xe, 'tab'),
          Z(Y, Pn, z.join(' ')),
          Z(Y, oe, Wa($, R + 1)),
          Z(Y, wi, -1),
          h.push({ li: W, button: Y, page: R });
      }
    }
    function x(M) {
      p('>' + M, !0);
    }
    function E(M, O) {
      var P = h.length,
        T = nu(O),
        D = w(),
        R = -1;
      T === l(Bs, !1, D)
        ? (R = ++M % P)
        : T === l(Fs, !1, D)
        ? (R = (--M + P) % P)
        : T === 'Home'
        ? (R = 0)
        : T === 'End' && (R = P - 1);
      var W = h[R];
      W && (kc(W.button), p('>' + R), ze(O, !0));
    }
    function w() {
      return e.paginationDirection || e.direction;
    }
    function S(M) {
      return h[f.toPage(M)];
    }
    function k() {
      var M = S(d(!0)),
        O = S(d());
      if (M) {
        var P = M.button;
        He(P, Ur), Oe(P, yc), Z(P, wi, -1);
      }
      if (O) {
        var T = O.button;
        Ce(T, Ur), Z(T, yc, !0), Z(T, wi, '');
      }
      s(qg, { list: g, items: h }, M, O);
    }
    return { items: h, mount: m, destroy: y, getAt: S, update: k };
  }
  var Bv = [' ', 'Enter'];
  function Vv(r, t, e) {
    var i = e.isNavigation,
      n = e.slideFocus,
      s = [];
    function o() {
      r.splides.forEach(function (_) {
        _.isParent || (f(r, _.splide), f(_.splide, r));
      }),
        i && c();
    }
    function a() {
      s.forEach(function (_) {
        _.destroy();
      }),
        Ye(s);
    }
    function u() {
      a(), o();
    }
    function f(_, h) {
      var g = mt(_);
      g.on(_r, function (v, m, y) {
        h.go(h.is(Pi) ? y : v);
      }),
        s.push(g);
    }
    function c() {
      var _ = mt(r),
        h = _.on;
      h(Ic, p), h(Wc, l), h([Gr, Gt], d), s.push(_), _.emit(Fc, r.splides);
    }
    function d() {
      Z(t.Elements.list, tu, e.direction === Vs ? 'vertical' : '');
    }
    function p(_) {
      r.go(_.index);
    }
    function l(_, h) {
      Ua(Bv, nu(h)) && (p(_), ze(h));
    }
    return {
      setup: ht(t.Media.set, { slideFocus: bn(n) ? i : n }, !0),
      mount: o,
      destroy: a,
      remount: u,
    };
  }
  function zv(r, t, e) {
    var i = mt(r),
      n = i.bind,
      s = 0;
    function o() {
      e.wheel && n(t.Elements.track, 'wheel', a, yi);
    }
    function a(f) {
      if (f.cancelable) {
        var c = f.deltaY,
          d = c < 0,
          p = Va(f),
          l = e.wheelMinThreshold || 0,
          _ = e.wheelSleep || 0;
        Ut(c) > l && p - s > _ && (r.go(d ? '<' : '>'), (s = p)), u(d) && ze(f);
      }
    }
    function u(f) {
      return (
        !e.releaseWheel || r.state.is(Si) || t.Controller.getAdjacent(f) !== -1
      );
    }
    return { mount: o };
  }
  var Wv = 90;
  function Hv(r, t, e) {
    var i = mt(r),
      n = i.on,
      s = t.Elements.track,
      o = e.live && !e.isNavigation,
      a = bi('span', ov),
      u = Is(Wv, ht(c, !1));
    function f() {
      o &&
        (p(!t.Autoplay.isPaused()),
        Z(s, wc, !0),
        (a.textContent = '\u2026'),
        n(Bc, ht(p, !0)),
        n(Vc, ht(p, !1)),
        n([An, Ai], ht(c, !0)));
    }
    function c(l) {
      Z(s, bc, l), l ? (Tn(s, a), u.start()) : ($r(a), u.cancel());
    }
    function d() {
      Oe(s, [xc, wc, bc]), $r(a);
    }
    function p(l) {
      o && Z(s, xc, l ? 'off' : 'polite');
    }
    return { mount: f, disable: p, destroy: d };
  }
  var Xv = Object.freeze({
      __proto__: null,
      Media: Zg,
      Direction: Jg,
      Elements: dv,
      Slides: pv,
      Layout: _v,
      Clones: vv,
      Move: mv,
      Controller: yv,
      Arrows: wv,
      Autoplay: Ev,
      Cover: Sv,
      Scroll: Dv,
      Drag: Lv,
      Keyboard: Mv,
      LazyLoad: Nv,
      Pagination: Fv,
      Sync: Vv,
      Wheel: zv,
      Live: Hv,
    }),
    Yv = {
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
    },
    $v = {
      type: 'slide',
      role: 'region',
      speed: 400,
      perPage: 1,
      cloneStatus: !0,
      arrows: !0,
      pagination: !0,
      paginationKeyboard: !0,
      interval: 5e3,
      pauseOnHover: !0,
      pauseOnFocus: !0,
      resetProgress: !0,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      drag: !0,
      direction: 'ltr',
      trimSpace: !0,
      focusableNodes: 'a, button, textarea, input, select, iframe',
      live: !0,
      classes: lv,
      i18n: Yv,
      reducedMotion: { speed: 0, rewindSpeed: 0, autoplay: 'pause' },
    };
  function Uv(r, t, e) {
    var i = t.Slides;
    function n() {
      mt(r).on([Gr, At], s);
    }
    function s() {
      i.forEach(function (a) {
        a.style('transform', 'translateX(-' + 100 * a.index + '%)');
      });
    }
    function o(a, u) {
      i.style('transition', 'opacity ' + e.speed + 'ms ' + e.easing), Ac(u);
    }
    return { mount: n, start: o, cancel: Ba };
  }
  function Gv(r, t, e) {
    var i = t.Move,
      n = t.Controller,
      s = t.Scroll,
      o = t.Elements.list,
      a = ht(ge, o, 'transition'),
      u;
    function f() {
      mt(r).bind(o, 'transitionend', function (l) {
        l.target === o && u && (d(), u());
      });
    }
    function c(l, _) {
      var h = i.toPosition(l, !0),
        g = i.getPosition(),
        v = p(l);
      Ut(h - g) >= 1 && v >= 1
        ? e.useScroll
          ? s.scroll(h, v, !1, _)
          : (a('transform ' + v + 'ms ' + e.easing),
            i.translate(h, !0),
            (u = _))
        : (i.jump(l), _());
    }
    function d() {
      a(''), s.cancel();
    }
    function p(l) {
      var _ = e.rewindSpeed;
      if (r.is(Ei) && _) {
        var h = n.getIndex(!0),
          g = n.getEnd();
        if ((h === 0 && l >= g) || (h >= g && l === 0)) return _;
      }
      return e.speed;
    }
    return { mount: f, start: c, cancel: d };
  }
  var qv = (function () {
      function r(e, i) {
        (this.event = mt()),
          (this.Components = {}),
          (this.state = Kg(xi)),
          (this.splides = []),
          (this._o = {}),
          (this._E = {});
        var n = hr(e) ? Lc(document, e) : e;
        fn(n, n + ' is invalid.'),
          (this.root = n),
          (i = dr(
            { label: ve(n, oe) || '', labelledby: ve(n, Ja) || '' },
            $v,
            r.defaults,
            i || {},
          ));
        try {
          dr(i, JSON.parse(ve(n, ja)));
        } catch {
          fn(!1, 'Invalid JSON');
        }
        this._o = Object.create(dr({}, i));
      }
      var t = r.prototype;
      return (
        (t.mount = function (i, n) {
          var s = this,
            o = this.state,
            a = this.Components;
          fn(o.is([xi, ks]), 'Already mounted!'),
            o.set(xi),
            (this._C = a),
            (this._T = n || this._T || (this.is(Cn) ? Uv : Gv)),
            (this._E = i || this._E);
          var u = _n({}, Xv, this._E, { Transition: this._T });
          return (
            Yr(u, function (f, c) {
              var d = f(s, a, s._o);
              (a[c] = d), d.setup && d.setup();
            }),
            Yr(a, function (f) {
              f.mount && f.mount();
            }),
            this.emit(Gr),
            Ce(this.root, av),
            o.set(Ti),
            this.emit(vc),
            this
          );
        }),
        (t.sync = function (i) {
          return (
            this.splides.push({ splide: i }),
            i.splides.push({ splide: this, isParent: !0 }),
            this.state.is(Ti) &&
              (this._C.Sync.remount(), i.Components.Sync.remount()),
            this
          );
        }),
        (t.go = function (i) {
          return this._C.Controller.go(i), this;
        }),
        (t.on = function (i, n) {
          return this.event.on(i, n), this;
        }),
        (t.off = function (i) {
          return this.event.off(i), this;
        }),
        (t.emit = function (i) {
          var n;
          return (
            (n = this.event).emit.apply(n, [i].concat(gr(arguments, 1))), this
          );
        }),
        (t.add = function (i, n) {
          return this._C.Slides.add(i, n), this;
        }),
        (t.remove = function (i) {
          return this._C.Slides.remove(i), this;
        }),
        (t.is = function (i) {
          return this._o.type === i;
        }),
        (t.refresh = function () {
          return this.emit(At), this;
        }),
        (t.destroy = function (i) {
          i === void 0 && (i = !0);
          var n = this.event,
            s = this.state;
          return (
            s.is(xi)
              ? mt(this).on(vc, this.destroy.bind(this, i))
              : (Yr(
                  this._C,
                  function (o) {
                    o.destroy && o.destroy(i);
                  },
                  !0,
                ),
                n.emit(Nc),
                n.destroy(),
                i && Ye(this.splides),
                s.set(ks)),
            this
          );
        }),
        Rg(r, [
          {
            key: 'options',
            get: function () {
              return this._o;
            },
            set: function (i) {
              this._C.Media.set(i, !0, !0);
            },
          },
          {
            key: 'length',
            get: function () {
              return this._C.Slides.getLength(!0);
            },
          },
          {
            key: 'index',
            get: function () {
              return this._C.Controller.getIndex();
            },
          },
        ]),
        r
      );
    })(),
    $e = qv;
  $e.defaults = {};
  $e.STATES = Ig;
  window.gallery = function () {
    var r = document.getElementById('product-gallery');
    return {
      init() {
        var t = new $e('#product-gallery', {
            type: 'fade',
            rewind: !0,
            pagination: !1,
            arrows: !1,
            drag: !0,
          }),
          e = new $e('#product-thumb-nav', {
            fixedWidth: 90,
            fixedHeight: 90,
            gap: 10,
            rewind: !0,
            pagination: !1,
            isNavigation: !0,
            breakpoints: { 900: { fixedWidth: 55, fixedHeight: 55 } },
          });
        t.on('click', function () {
          t.go('>');
        }),
          t.sync(e),
          t.mount(),
          e.mount();
      },
    };
  };
  window.forms = function () {
    return {
      submitForm(r) {
        r.preventDefault();
        let t = this.$el.getAttribute('data-form'),
          e = document.getElementById(t),
          i = e.querySelector('.submit-btn');
        i.classList.remove('shake');
        let n = e.querySelectorAll('.required'),
          s = !0;
        n.forEach((f) => {
          f.value.trim()
            ? f.classList.remove('border-tint3')
            : ((s = !1), f.classList.add('border-tint3'));
        });
        let o = Array.from(n).every((f) => f.value.trim()),
          a = e.querySelector('input[type="email"]'),
          u = this.validateEmail(a.value.trim());
        o && u
          ? e.submit()
          : (i.offsetWidth,
            i.classList.add('shake'),
            u || a.classList.add('border-tint3'));
      },
      validateTxt() {
        return this.$el.value.trim()
          ? (this.$el.classList.remove('border-tint3'), !0)
          : (this.$el.classList.add('border-tint3'), !1);
      },
      validateEmail(r) {
        return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,20}$/.test(r);
      },
    };
  };
  function Pt(r, t) {
    if (!r) throw new Error(t);
  }
  function Ct(r) {
    Pt(
      !r || typeof r == 'object',
      'options must be an object, got ' + r + ' (' + typeof r + ')',
    );
    var t = {
        accessToken: null,
        accessTokenTimeout: 1e4,
        after: null,
        apiTimeout: 1e4,
        apiLimit: null,
        before: null,
        debug: !1,
        error: null,
        filter: null,
        limit: null,
        mock: !1,
        render: null,
        sort: null,
        success: null,
        target: 'instafeed',
        template:
          '<a href="{{link}}"><img title="{{caption}}" src="{{image}}" /></a>',
        templateBoundaries: ['{{', '}}'],
        transform: null,
      },
      e = { running: !1, node: null, token: null, paging: null, pool: [] };
    if (r) for (var i in t) typeof r[i] < 'u' && (t[i] = r[i]);
    Pt(
      typeof t.target == 'string' || typeof t.target == 'object',
      'target must be a string or DOM node, got ' +
        t.target +
        ' (' +
        typeof t.target +
        ')',
    ),
      Pt(
        typeof t.accessToken == 'string' || typeof t.accessToken == 'function',
        'accessToken must be a string or function, got ' +
          t.accessToken +
          ' (' +
          typeof t.accessToken +
          ')',
      ),
      Pt(
        typeof t.accessTokenTimeout == 'number',
        'accessTokenTimeout must be a number, got ' +
          t.accessTokenTimeout +
          ' (' +
          typeof t.accessTokenTimeout +
          ')',
      ),
      Pt(
        typeof t.apiTimeout == 'number',
        'apiTimeout must be a number, got ' +
          t.apiTimeout +
          ' (' +
          typeof t.apiTimeout +
          ')',
      ),
      Pt(
        typeof t.debug == 'boolean',
        'debug must be true or false, got ' +
          t.debug +
          ' (' +
          typeof t.debug +
          ')',
      ),
      Pt(
        typeof t.mock == 'boolean',
        'mock must be true or false, got ' +
          t.mock +
          ' (' +
          typeof t.mock +
          ')',
      ),
      Pt(
        typeof t.templateBoundaries == 'object' &&
          t.templateBoundaries.length === 2 &&
          typeof t.templateBoundaries[0] == 'string' &&
          typeof t.templateBoundaries[1] == 'string',
        'templateBoundaries must be an array of 2 strings, got ' +
          t.templateBoundaries +
          ' (' +
          typeof t.templateBoundaries +
          ')',
      ),
      Pt(
        !t.template || typeof t.template == 'string',
        'template must null or string, got ' +
          t.template +
          ' (' +
          typeof t.template +
          ')',
      ),
      Pt(
        !t.error || typeof t.error == 'function',
        'error must be null or function, got ' +
          t.error +
          ' (' +
          typeof t.error +
          ')',
      ),
      Pt(
        !t.before || typeof t.before == 'function',
        'before must be null or function, got ' +
          t.before +
          ' (' +
          typeof t.before +
          ')',
      ),
      Pt(
        !t.after || typeof t.after == 'function',
        'after must be null or function, got ' +
          t.after +
          ' (' +
          typeof t.after +
          ')',
      ),
      Pt(
        !t.success || typeof t.success == 'function',
        'success must be null or function, got ' +
          t.success +
          ' (' +
          typeof t.success +
          ')',
      ),
      Pt(
        !t.filter || typeof t.filter == 'function',
        'filter must be null or function, got ' +
          t.filter +
          ' (' +
          typeof t.filter +
          ')',
      ),
      Pt(
        !t.transform || typeof t.transform == 'function',
        'transform must be null or function, got ' +
          t.transform +
          ' (' +
          typeof t.transform +
          ')',
      ),
      Pt(
        !t.sort || typeof t.sort == 'function',
        'sort must be null or function, got ' +
          t.sort +
          ' (' +
          typeof t.sort +
          ')',
      ),
      Pt(
        !t.render || typeof t.render == 'function',
        'render must be null or function, got ' +
          t.render +
          ' (' +
          typeof t.render +
          ')',
      ),
      Pt(
        !t.limit || typeof t.limit == 'number',
        'limit must be null or number, got ' +
          t.limit +
          ' (' +
          typeof t.limit +
          ')',
      ),
      Pt(
        !t.apiLimit || typeof t.apiLimit == 'number',
        'apiLimit must null or number, got ' +
          t.apiLimit +
          ' (' +
          typeof t.apiLimit +
          ')',
      ),
      (this._state = e),
      (this._options = t);
  }
  Ct.prototype.run = function () {
    var t = this;
    return (
      this._debug('run', 'options', this._options),
      this._debug('run', 'state', this._state),
      this._state.running
        ? (this._debug('run', 'already running, skipping'), !1)
        : (this._start(),
          this._debug('run', 'getting dom node'),
          typeof this._options.target == 'string'
            ? (this._state.node = document.getElementById(this._options.target))
            : (this._state.node = this._options.target),
          this._state.node
            ? (this._debug('run', 'got dom node', this._state.node),
              this._debug('run', 'getting access token'),
              this._getAccessToken(function (i, n) {
                if (i) {
                  t._debug('onTokenReceived', 'error', i),
                    t._fail(
                      new Error('error getting access token: ' + i.message),
                    );
                  return;
                }
                t._debug('onTokenReceived', 'got token', n),
                  (t._state.token = n),
                  t._showNext(function (o) {
                    if (o) {
                      t._debug('onNextShown', 'error', o), t._fail(o);
                      return;
                    }
                    t._finish();
                  });
              }),
              !0)
            : (this._fail(
                new Error('no element found with ID ' + this._options.target),
              ),
              !1))
    );
  };
  Ct.prototype.hasNext = function () {
    var t = this._state.paging,
      e = this._state.pool;
    return (
      this._debug('hasNext', 'paging', t),
      this._debug('hasNext', 'pool', e.length, e),
      e.length > 0 || (t && typeof t.next == 'string')
    );
  };
  Ct.prototype.next = function () {
    var t = this;
    if (!t.hasNext()) return t._debug('next', 'hasNext is false, skipping'), !1;
    if (t._state.running)
      return t._debug('next', 'already running, skipping'), !1;
    t._start(),
      t._showNext(function (i) {
        if (i) {
          t._debug('onNextShown', 'error', i), t._fail(i);
          return;
        }
        t._finish();
      });
  };
  Ct.prototype._showNext = function (t) {
    var e = this,
      i = null,
      n = null,
      s = typeof this._options.limit == 'number';
    if (
      (e._debug('showNext', 'pool', e._state.pool.length, e._state.pool),
      e._state.pool.length > 0)
    ) {
      if (
        (s
          ? (n = e._state.pool.splice(0, e._options.limit))
          : (n = e._state.pool.splice(0)),
        e._debug('showNext', 'items from pool', n.length, n),
        e._debug(
          'showNext',
          'updated pool',
          e._state.pool.length,
          e._state.pool,
        ),
        e._options.mock)
      )
        e._debug('showNext', 'mock enabled, skipping render');
      else
        try {
          e._renderData(n);
        } catch (o) {
          t(o);
          return;
        }
      t(null);
    } else
      e._state.paging && typeof e._state.paging.next == 'string'
        ? (i = e._state.paging.next)
        : ((i =
            'https://graph.instagram.com/me/media?fields=caption,id,media_type,media_url,permalink,thumbnail_url,timestamp,username&access_token=' +
            e._state.token),
          !e._options.apiLimit && typeof e._options.limit == 'number'
            ? (e._debug(
                'showNext',
                'no apiLimit set, falling back to limit',
                e._options.apiLimit,
                e._options.limit,
              ),
              (i = i + '&limit=' + e._options.limit))
            : typeof e._options.apiLimit == 'number' &&
              (e._debug(
                'showNext',
                'apiLimit set, overriding limit',
                e._options.apiLimit,
                e._options.limit,
              ),
              (i = i + '&limit=' + e._options.apiLimit))),
        e._debug('showNext', 'making request', i),
        e._makeApiRequest(i, function (a, u) {
          var f = null;
          if (a) {
            e._debug('onResponseReceived', 'error', a),
              t(new Error('api request error: ' + a.message));
            return;
          }
          e._debug('onResponseReceived', 'data', u),
            e._success(u),
            e._debug('onResponseReceived', 'setting paging', u.paging),
            (e._state.paging = u.paging);
          try {
            if (
              ((f = e._processData(u)),
              e._debug('onResponseReceived', 'processed data', f),
              f.unused && f.unused.length > 0)
            ) {
              e._debug(
                'onResponseReceived',
                'saving unused to pool',
                f.unused.length,
                f.unused,
              );
              for (var c = 0; c < f.unused.length; c++)
                e._state.pool.push(f.unused[c]);
            }
          } catch (d) {
            t(d);
            return;
          }
          if (e._options.mock)
            e._debug('onResponseReceived', 'mock enabled, skipping append');
          else
            try {
              e._renderData(f.items);
            } catch (d) {
              t(d);
              return;
            }
          t(null);
        });
  };
  Ct.prototype._processData = function (t) {
    var e = typeof this._options.transform == 'function',
      i = typeof this._options.filter == 'function',
      n = typeof this._options.sort == 'function',
      s = typeof this._options.limit == 'number',
      o = [],
      a = null,
      u = null,
      f = null,
      c = null,
      d = null;
    if (
      (this._debug(
        'processData',
        'hasFilter',
        i,
        'hasTransform',
        e,
        'hasSort',
        n,
        'hasLimit',
        s,
      ),
      typeof t != 'object' || typeof t.data != 'object' || t.data.length <= 0)
    )
      return null;
    for (var p = 0; p < t.data.length; p++) {
      if (((u = this._getItemData(t.data[p])), e))
        try {
          (f = this._options.transform(u)),
            this._debug('processData', 'transformed item', u, f);
        } catch (l) {
          throw (
            (this._debug('processData', 'error calling transform', l),
            new Error('error in transform: ' + l.message))
          );
        }
      else f = u;
      if (i) {
        try {
          (c = this._options.filter(f)),
            this._debug('processData', 'filter item result', f, c);
        } catch (l) {
          throw (
            (this._debug('processData', 'error calling filter', l),
            new Error('error in filter: ' + l.message))
          );
        }
        c && o.push(f);
      } else o.push(f);
    }
    if (n)
      try {
        o.sort(this._options.sort);
      } catch (l) {
        throw (
          (this._debug('processData', 'error calling sort', l),
          new Error('error in sort: ' + l.message))
        );
      }
    return (
      s &&
        ((a = o.length - this._options.limit),
        this._debug(
          'processData',
          'checking limit',
          o.length,
          this._options.limit,
          a,
        ),
        a > 0 &&
          ((d = o.slice(o.length - a)),
          this._debug('processData', 'unusedItems', d.length, d),
          o.splice(o.length - a, a))),
      { items: o, unused: d }
    );
  };
  Ct.prototype._extractTags = function (t) {
    var e = /#([^\s]+)/gi,
      i = /[~`!@#$%^&*\(\)\-\+={}\[\]:;"'<>\?,\./|\\\s]+/i,
      n = [],
      s = null;
    if (typeof t == 'string')
      for (; (s = e.exec(t)) !== null; ) i.test(s[1]) === !1 && n.push(s[1]);
    return n;
  };
  Ct.prototype._getItemData = function (t) {
    var e = null,
      i = null;
    switch (t.media_type) {
      case 'IMAGE':
        (e = 'image'), (i = t.media_url);
        break;
      case 'VIDEO':
        (e = 'video'), (i = t.thumbnail_url);
        break;
      case 'CAROUSEL_ALBUM':
        (e = 'album'), (i = t.media_url);
        break;
    }
    return {
      caption: t.caption,
      tags: this._extractTags(t.caption),
      id: t.id,
      image: i,
      link: t.permalink,
      model: t,
      timestamp: t.timestamp,
      type: e,
      username: t.username,
    };
  };
  Ct.prototype._renderData = function (t) {
    var e = typeof this._options.template == 'string',
      i = typeof this._options.render == 'function',
      n = null,
      s = null,
      o = null,
      a = '';
    if (
      (this._debug('renderData', 'hasTemplate', e, 'hasRender', i),
      !(typeof t != 'object' || t.length <= 0))
    ) {
      for (var u = 0; u < t.length; u++) {
        if (((n = t[u]), i))
          try {
            (s = this._options.render(n, this._options)),
              this._debug('renderData', 'custom render result', n, s);
          } catch (f) {
            throw (
              (this._debug('renderData', 'error calling render', f),
              new Error('error in render: ' + f.message))
            );
          }
        else e && (s = this._basicRender(n));
        s
          ? (a = a + s)
          : this._debug(
              'renderData',
              'render item did not return any content',
              n,
            );
      }
      for (
        this._debug('renderData', 'html content', a),
          o = document.createElement('div'),
          o.innerHTML = a,
          this._debug(
            'renderData',
            'container',
            o,
            o.childNodes.length,
            o.childNodes,
          );
        o.childNodes.length > 0;

      )
        this._debug('renderData', 'appending child', o.childNodes[0]),
          this._state.node.appendChild(o.childNodes[0]);
    }
  };
  Ct.prototype._basicRender = function (t) {
    for (
      var e = new RegExp(
          this._options.templateBoundaries[0] +
            '([\\s\\w.]+)' +
            this._options.templateBoundaries[1],
          'gm',
        ),
        i = this._options.template,
        n = null,
        s = '',
        o = null,
        a = 0,
        u = null,
        f = null;
      (n = e.exec(i)) !== null;

    )
      (u = n[1]),
        (o = i.slice(a, n.index)),
        (s = s + o),
        (f = this._valueForKeyPath(u, t)),
        f && (s = s + f.toString()),
        (a = e.lastIndex);
    return a < i.length && ((o = i.slice(a, i.length)), (s = s + o)), s;
  };
  Ct.prototype._valueForKeyPath = function (t, e) {
    for (
      var i = /([\w]+)/gm, n = null, s = null, o = e;
      (n = i.exec(t)) !== null;

    ) {
      if (typeof o != 'object') return null;
      (s = n[1]), (o = o[s]);
    }
    return o;
  };
  Ct.prototype._fail = function (t) {
    var e = this._runHook('error', t);
    !e && console && typeof console.error == 'function' && console.error(t),
      (this._state.running = !1);
  };
  Ct.prototype._start = function () {
    (this._state.running = !0), this._runHook('before');
  };
  Ct.prototype._finish = function () {
    this._runHook('after'), (this._state.running = !1);
  };
  Ct.prototype._success = function (t) {
    this._runHook('success', t), (this._state.running = !1);
  };
  Ct.prototype._makeApiRequest = function (t, e) {
    var i = !1,
      n = this,
      s = null,
      o = function (u, f) {
        i || ((i = !0), e(u, f));
      };
    (s = new XMLHttpRequest()),
      (s.ontimeout = function () {
        o(new Error('api request timed out'));
      }),
      (s.onerror = function () {
        o(new Error('api connection error'));
      }),
      (s.onload = function (u) {
        var f = s.getResponseHeader('Content-Type'),
          c = null;
        if (
          (n._debug('apiRequestOnLoad', 'loaded', u),
          n._debug('apiRequestOnLoad', 'response status', s.status),
          n._debug('apiRequestOnLoad', 'response content type', f),
          f.indexOf('application/json') >= 0)
        )
          try {
            c = JSON.parse(s.responseText);
          } catch (d) {
            n._debug(
              'apiRequestOnLoad',
              'json parsing error',
              d,
              s.responseText,
            ),
              o(new Error('error parsing response json'));
            return;
          }
        if (s.status !== 200) {
          c && c.error
            ? o(new Error(c.error.code + ' ' + c.error.message))
            : o(new Error('status code ' + s.status));
          return;
        }
        o(null, c);
      }),
      s.open('GET', t, !0),
      (s.timeout = this._options.apiTimeout),
      s.send();
  };
  Ct.prototype._getAccessToken = function (t) {
    var e = !1,
      i = this,
      n = null,
      s = function (a, u) {
        e || ((e = !0), clearTimeout(n), t(a, u));
      };
    if (typeof this._options.accessToken == 'function') {
      this._debug('getAccessToken', 'calling accessToken as function'),
        (n = setTimeout(function () {
          i._debug('getAccessToken', 'timeout check', e),
            s(new Error('accessToken timed out'), null);
        }, this._options.accessTokenTimeout));
      try {
        this._options.accessToken(function (a, u) {
          i._debug('getAccessToken', 'received accessToken callback', e, a, u),
            s(a, u);
        });
      } catch (o) {
        this._debug(
          'getAccessToken',
          'error invoking the accessToken as function',
          o,
        ),
          s(o, null);
      }
    } else
      this._debug(
        'getAccessToken',
        'treating accessToken as static',
        typeof this._options.accessToken,
      ),
        s(null, this._options.accessToken);
  };
  Ct.prototype._debug = function () {
    var t = null;
    this._options.debug &&
      console &&
      typeof console.log == 'function' &&
      ((t = [].slice.call(arguments)),
      (t[0] = '[Instafeed] [' + t[0] + ']'),
      console.log.apply(null, t));
  };
  Ct.prototype._runHook = function (t, e) {
    var i = !1;
    if (typeof this._options[t] == 'function')
      try {
        this._options[t](e), (i = !0);
      } catch (n) {
        this._debug('runHook', 'error calling hook', t, n);
      }
    return i;
  };
  var rd = Ct;
  window.insta = function () {
    return {
      init() {
        var r = new rd({
          accessToken:
            'IGQWROWFhaMFExUUZA4VXYtbkt1SnFVR2gyVENySWxzQk8tSEtOYnFrNXdSS0JDRlVSbk9hRlRCYkVLOHFtLXY2Uno0aTA1NENaa0JCWmR1U2toZAm1hSmt4eEhwcFNVRms1S2VpTEhrbW4wTk1fUGVxX3lHUHJVcG8ZD',
          limit: 4,
          template:
            '<a aria-label="instagram post" class="block w-full" href="{{link}}"><img class="w-full" title="{{caption}}" src="{{image}}" alt="{{caption}}" /></a>',
        });
        r.run();
      },
    };
  };
  window.testimonials = function () {
    return {
      init() {
        var r = new $e(this.$el, {
          type: 'loop',
          rewind: !1,
          pagination: !1,
          arrows: !0,
          drag: !0,
        });
        r.mount();
      },
    };
  };
  window.sauces = function () {
    return {
      init() {
        var r = new $e(this.$el, {
          type: 'loop',
          rewind: !1,
          pagination: !1,
          arrows: !0,
          drag: !0,
        });
        r.mount();
      },
    };
  };
  var mr,
    qr,
    uu,
    Ci,
    On,
    Xs,
    id,
    yr = 'transform',
    au = yr + 'Origin',
    nd,
    sd = function (t) {
      var e = t.ownerDocument || t;
      for (
        !(yr in t.style) &&
        ('msTransform' in t.style) &&
        ((yr = 'msTransform'), (au = yr + 'Origin'));
        e.parentNode && (e = e.parentNode);

      );
      if (((qr = window), (id = new jr()), e)) {
        (mr = e), (uu = e.documentElement), (Ci = e.body);
        var i = e.createElement('div'),
          n = e.createElement('div');
        Ci.appendChild(i),
          i.appendChild(n),
          (i.style.position = 'static'),
          (i.style[yr] = 'translate3d(0,0,1px)'),
          (nd = n.offsetParent !== i),
          Ci.removeChild(i);
      }
      return e;
    },
    jv = function (t) {
      for (var e, i; t && t !== Ci; )
        (i = t._gsap),
          i && i.uncache && i.get(t, 'x'),
          i &&
            !i.scaleX &&
            !i.scaleY &&
            i.renderTransform &&
            ((i.scaleX = i.scaleY = 1e-4),
            i.renderTransform(1, i),
            e ? e.push(i) : (e = [i])),
          (t = t.parentNode);
      return e;
    },
    od = [],
    ad = [],
    Kv = function () {
      return (
        qr.pageYOffset || mr.scrollTop || uu.scrollTop || Ci.scrollTop || 0
      );
    },
    Qv = function () {
      return (
        qr.pageXOffset || mr.scrollLeft || uu.scrollLeft || Ci.scrollLeft || 0
      );
    },
    lu = function (t) {
      return (
        t.ownerSVGElement ||
        ((t.tagName + '').toLowerCase() === 'svg' ? t : null)
      );
    },
    Zv = function r(t) {
      if (qr.getComputedStyle(t).position === 'fixed') return !0;
      if (((t = t.parentNode), t && t.nodeType === 1)) return r(t);
    },
    su = function r(t, e) {
      if (t.parentNode && (mr || sd(t))) {
        var i = lu(t),
          n = i
            ? i.getAttribute('xmlns') || 'http://www.w3.org/2000/svg'
            : 'http://www.w3.org/1999/xhtml',
          s = i ? (e ? 'rect' : 'g') : 'div',
          o = e !== 2 ? 0 : 100,
          a = e === 3 ? 100 : 0,
          u =
            'position:absolute;display:block;pointer-events:none;margin:0;padding:0;',
          f = mr.createElementNS
            ? mr.createElementNS(n.replace(/^https/, 'http'), s)
            : mr.createElement(s);
        return (
          e &&
            (i
              ? (Xs || (Xs = r(t)),
                f.setAttribute('width', 0.01),
                f.setAttribute('height', 0.01),
                f.setAttribute('transform', 'translate(' + o + ',' + a + ')'),
                Xs.appendChild(f))
              : (On || ((On = r(t)), (On.style.cssText = u)),
                (f.style.cssText =
                  u +
                  'width:0.1px;height:0.1px;top:' +
                  a +
                  'px;left:' +
                  o +
                  'px'),
                On.appendChild(f))),
          f
        );
      }
      throw 'Need document and parent.';
    },
    Jv = function (t) {
      for (var e = new jr(), i = 0; i < t.numberOfItems; i++)
        e.multiply(t.getItem(i).matrix);
      return e;
    },
    tm = function (t, e) {
      var i = lu(t),
        n = t === i,
        s = i ? od : ad,
        o = t.parentNode,
        a,
        u,
        f,
        c,
        d,
        p;
      if (t === qr) return t;
      if (
        (s.length || s.push(su(t, 1), su(t, 2), su(t, 3)), (a = i ? Xs : On), i)
      )
        (f = n ? { x: 0, y: 0 } : t.getBBox()),
          (u = t.transform ? t.transform.baseVal : {}),
          u.numberOfItems
            ? ((u = u.numberOfItems > 1 ? Jv(u) : u.getItem(0).matrix),
              (c = u.a * f.x + u.c * f.y),
              (d = u.b * f.x + u.d * f.y))
            : ((u = id), (c = f.x), (d = f.y)),
          e && t.tagName.toLowerCase() === 'g' && (c = d = 0),
          (n ? i : o).appendChild(a),
          a.setAttribute(
            'transform',
            'matrix(' +
              u.a +
              ',' +
              u.b +
              ',' +
              u.c +
              ',' +
              u.d +
              ',' +
              (u.e + c) +
              ',' +
              (u.f + d) +
              ')',
          );
      else {
        if (((c = d = 0), nd))
          for (
            u = t.offsetParent, f = t;
            f && (f = f.parentNode) && f !== u && f.parentNode;

          )
            (qr.getComputedStyle(f)[yr] + '').length > 4 &&
              ((c = f.offsetLeft), (d = f.offsetTop), (f = 0));
        if (((p = qr.getComputedStyle(t)), p.position !== 'absolute'))
          for (u = t.offsetParent; o && o !== u; )
            (c += o.scrollLeft || 0),
              (d += o.scrollTop || 0),
              (o = o.parentNode);
        (f = a.style),
          (f.top = t.offsetTop - d + 'px'),
          (f.left = t.offsetLeft - c + 'px'),
          (f[yr] = p[yr]),
          (f[au] = p[au]),
          (f.position = p.position === 'fixed' ? 'fixed' : 'absolute'),
          t.parentNode.appendChild(a);
      }
      return a;
    },
    ou = function (t, e, i, n, s, o, a) {
      return (
        (t.a = e), (t.b = i), (t.c = n), (t.d = s), (t.e = o), (t.f = a), t
      );
    },
    jr = (function () {
      function r(e, i, n, s, o, a) {
        e === void 0 && (e = 1),
          i === void 0 && (i = 0),
          n === void 0 && (n = 0),
          s === void 0 && (s = 1),
          o === void 0 && (o = 0),
          a === void 0 && (a = 0),
          ou(this, e, i, n, s, o, a);
      }
      var t = r.prototype;
      return (
        (t.inverse = function () {
          var i = this.a,
            n = this.b,
            s = this.c,
            o = this.d,
            a = this.e,
            u = this.f,
            f = i * o - n * s || 1e-10;
          return ou(
            this,
            o / f,
            -n / f,
            -s / f,
            i / f,
            (s * u - o * a) / f,
            -(i * u - n * a) / f,
          );
        }),
        (t.multiply = function (i) {
          var n = this.a,
            s = this.b,
            o = this.c,
            a = this.d,
            u = this.e,
            f = this.f,
            c = i.a,
            d = i.c,
            p = i.b,
            l = i.d,
            _ = i.e,
            h = i.f;
          return ou(
            this,
            c * n + p * o,
            c * s + p * a,
            d * n + l * o,
            d * s + l * a,
            u + _ * n + h * o,
            f + _ * s + h * a,
          );
        }),
        (t.clone = function () {
          return new r(this.a, this.b, this.c, this.d, this.e, this.f);
        }),
        (t.equals = function (i) {
          var n = this.a,
            s = this.b,
            o = this.c,
            a = this.d,
            u = this.e,
            f = this.f;
          return (
            n === i.a &&
            s === i.b &&
            o === i.c &&
            a === i.d &&
            u === i.e &&
            f === i.f
          );
        }),
        (t.apply = function (i, n) {
          n === void 0 && (n = {});
          var s = i.x,
            o = i.y,
            a = this.a,
            u = this.b,
            f = this.c,
            c = this.d,
            d = this.e,
            p = this.f;
          return (
            (n.x = s * a + o * f + d || 0), (n.y = s * u + o * c + p || 0), n
          );
        }),
        r
      );
    })();
  function kn(r, t, e, i) {
    if (!r || !r.parentNode || (mr || sd(r)).documentElement === r)
      return new jr();
    var n = jv(r),
      s = lu(r),
      o = s ? od : ad,
      a = tm(r, e),
      u = o[0].getBoundingClientRect(),
      f = o[1].getBoundingClientRect(),
      c = o[2].getBoundingClientRect(),
      d = a.parentNode,
      p = !i && Zv(r),
      l = new jr(
        (f.left - u.left) / 100,
        (f.top - u.top) / 100,
        (c.left - u.left) / 100,
        (c.top - u.top) / 100,
        u.left + (p ? 0 : Qv()),
        u.top + (p ? 0 : Kv()),
      );
    if ((d.removeChild(a), n))
      for (u = n.length; u--; )
        (f = n[u]), (f.scaleX = f.scaleY = 0), f.renderTransform(1, f);
    return t ? l.inverse() : l;
  }
  function em(r) {
    if (r === void 0)
      throw new ReferenceError(
        "this hasn't been initialised - super() hasn't been called",
      );
    return r;
  }
  function rm(r, t) {
    (r.prototype = Object.create(t.prototype)),
      (r.prototype.constructor = r),
      (r.__proto__ = t);
  }
  var st,
    dt,
    Jt,
    be,
    qe,
    fu,
    Ge,
    _u,
    Ln,
    Tr,
    md,
    gu,
    Fn,
    qs,
    yu,
    Rn,
    ye,
    Mn,
    Us,
    yd = function () {
      return typeof window < 'u';
    },
    xd = function () {
      return st || (yd() && (st = window.gsap) && st.registerPlugin && st);
    },
    wr = function (t) {
      return typeof t == 'function';
    },
    In = function (t) {
      return typeof t == 'object';
    },
    xe = function (t) {
      return typeof t > 'u';
    },
    Gs = function () {
      return !1;
    },
    Nn = 'transform',
    vu = 'transformOrigin',
    xr = function (t) {
      return Math.round(t * 1e4) / 1e4;
    },
    Dn = Array.isArray,
    Ys = function (t, e) {
      var i = Jt.createElementNS
        ? Jt.createElementNS(
            (e || 'http://www.w3.org/1999/xhtml').replace(/^https/, 'http'),
            t,
          )
        : Jt.createElement(t);
      return i.style ? i : Jt.createElement(t);
    },
    ud = 180 / Math.PI,
    Kr = 1e20,
    im = new jr(),
    br =
      Date.now ||
      function () {
        return new Date().getTime();
      },
    Zr = [],
    Di = {},
    nm = 0,
    sm = /^(?:a|input|textarea|button|select)$/i,
    ld = 0,
    Oi = {},
    Ue = {},
    bd = function (t, e) {
      var i = {},
        n;
      for (n in t) i[n] = e ? t[n] * e : t[n];
      return i;
    },
    om = function (t, e) {
      for (var i in e) i in t || (t[i] = e[i]);
      return t;
    },
    fd = function r(t, e) {
      for (var i = t.length, n; i--; )
        e
          ? (t[i].style.touchAction = e)
          : t[i].style.removeProperty('touch-action'),
          (n = t[i].children),
          n && n.length && r(n, e);
    },
    wd = function () {
      return Zr.forEach(function (t) {
        return t();
      });
    },
    am = function (t) {
      Zr.push(t), Zr.length === 1 && st.ticker.add(wd);
    },
    cd = function () {
      return !Zr.length && st.ticker.remove(wd);
    },
    dd = function (t) {
      for (var e = Zr.length; e--; ) Zr[e] === t && Zr.splice(e, 1);
      st.to(cd, {
        overwrite: !0,
        delay: 15,
        duration: 0,
        onComplete: cd,
        data: '_draggable',
      });
    },
    um = function (t, e) {
      for (var i in e) i in t || (t[i] = e[i]);
      return t;
    },
    Ot = function (t, e, i, n) {
      if (t.addEventListener) {
        var s = Fn[e];
        (n = n || (md ? { passive: !1 } : null)),
          t.addEventListener(s || e, i, n),
          s && e !== s && t.addEventListener(e, i, n);
      }
    },
    Tt = function (t, e, i) {
      if (t.removeEventListener) {
        var n = Fn[e];
        t.removeEventListener(n || e, i),
          n && e !== n && t.removeEventListener(e, i);
      }
    },
    ue = function (t) {
      t.preventDefault && t.preventDefault(),
        t.preventManipulation && t.preventManipulation();
    },
    lm = function (t, e) {
      for (var i = t.length; i--; ) if (t[i].identifier === e) return !0;
    },
    fm = function r(t) {
      (yu = t.touches && qs < t.touches.length), Tt(t.target, 'touchend', r);
    },
    hd = function (t) {
      (yu = t.touches && qs < t.touches.length), Ot(t.target, 'touchend', fm);
    },
    Li = function (t) {
      return (
        dt.pageYOffset ||
        t.scrollTop ||
        t.documentElement.scrollTop ||
        t.body.scrollTop ||
        0
      );
    },
    Ri = function (t) {
      return (
        dt.pageXOffset ||
        t.scrollLeft ||
        t.documentElement.scrollLeft ||
        t.body.scrollLeft ||
        0
      );
    },
    pd = function r(t, e) {
      Ot(t, 'scroll', e), Mi(t.parentNode) || r(t.parentNode, e);
    },
    _d = function r(t, e) {
      Tt(t, 'scroll', e), Mi(t.parentNode) || r(t.parentNode, e);
    },
    Mi = function (t) {
      return (
        !t ||
        t === be ||
        t.nodeType === 9 ||
        t === Jt.body ||
        t === dt ||
        !t.nodeType ||
        !t.parentNode
      );
    },
    gd = function (t, e) {
      var i = e === 'x' ? 'Width' : 'Height',
        n = 'scroll' + i,
        s = 'client' + i;
      return Math.max(
        0,
        Mi(t)
          ? Math.max(be[n], qe[n]) - (dt['inner' + i] || be[s] || qe[s])
          : t[n] - t[s],
      );
    },
    cu = function r(t, e) {
      var i = gd(t, 'x'),
        n = gd(t, 'y');
      Mi(t) ? (t = Ue) : r(t.parentNode, e),
        (t._gsMaxScrollX = i),
        (t._gsMaxScrollY = n),
        e ||
          ((t._gsScrollX = t.scrollLeft || 0),
          (t._gsScrollY = t.scrollTop || 0));
    },
    du = function (t, e, i) {
      var n = t.style;
      !n ||
        (xe(n[e]) && (e = Ln(e, t) || e),
        i == null
          ? n.removeProperty &&
            n.removeProperty(e.replace(/([A-Z])/g, '-$1').toLowerCase())
          : (n[e] = i));
    },
    Bn = function (t) {
      return dt.getComputedStyle(
        t instanceof Element ? t : t.host || (t.parentNode || {}).host || t,
      );
    },
    Qr = {},
    ki = function (t) {
      if (t === dt)
        return (
          (Qr.left = Qr.top = 0),
          (Qr.width = Qr.right =
            be.clientWidth || t.innerWidth || qe.clientWidth || 0),
          (Qr.height = Qr.bottom =
            (t.innerHeight || 0) - 20 < be.clientHeight
              ? be.clientHeight
              : t.innerHeight || qe.clientHeight || 0),
          Qr
        );
      var e = t.ownerDocument || Jt,
        i = xe(t.pageX)
          ? !t.nodeType && !xe(t.left) && !xe(t.top)
            ? t
            : Tr(t)[0].getBoundingClientRect()
          : {
              left: t.pageX - Ri(e),
              top: t.pageY - Li(e),
              right: t.pageX - Ri(e) + 1,
              bottom: t.pageY - Li(e) + 1,
            };
      return (
        xe(i.right) && !xe(i.width)
          ? ((i.right = i.left + i.width), (i.bottom = i.top + i.height))
          : xe(i.width) &&
            (i = {
              width: i.right - i.left,
              height: i.bottom - i.top,
              right: i.right,
              left: i.left,
              bottom: i.bottom,
              top: i.top,
            }),
        i
      );
    },
    bt = function (t, e, i) {
      var n = t.vars,
        s = n[i],
        o = t._listeners[e],
        a;
      return (
        wr(s) &&
          (a = s.apply(
            n.callbackScope || t,
            n[i + 'Params'] || [t.pointerEvent],
          )),
        o && t.dispatchEvent(e) === !1 && (a = !1),
        a
      );
    },
    vd = function (t, e) {
      var i = Tr(t)[0],
        n,
        s,
        o;
      return !i.nodeType && i !== dt
        ? xe(t.left)
          ? ((s = t.min || t.minX || t.minRotation || 0),
            (n = t.min || t.minY || 0),
            {
              left: s,
              top: n,
              width: (t.max || t.maxX || t.maxRotation || 0) - s,
              height: (t.max || t.maxY || 0) - n,
            })
          : ((o = { x: 0, y: 0 }),
            {
              left: t.left - o.x,
              top: t.top - o.y,
              width: t.width,
              height: t.height,
            })
        : cm(i, e);
    },
    le = {},
    cm = function (t, e) {
      e = Tr(e)[0];
      var i = t.getBBox && t.ownerSVGElement,
        n = t.ownerDocument || Jt,
        s,
        o,
        a,
        u,
        f,
        c,
        d,
        p,
        l,
        _,
        h,
        g,
        v,
        m;
      if (t === dt)
        (a = Li(n)),
          (s = Ri(n)),
          (o =
            s +
            (n.documentElement.clientWidth ||
              t.innerWidth ||
              n.body.clientWidth ||
              0)),
          (u =
            a +
            ((t.innerHeight || 0) - 20 < n.documentElement.clientHeight
              ? n.documentElement.clientHeight
              : t.innerHeight || n.body.clientHeight || 0));
      else {
        if (e === dt || xe(e)) return t.getBoundingClientRect();
        (s = a = 0),
          i
            ? ((_ = t.getBBox()), (h = _.width), (g = _.height))
            : (t.viewBox &&
                (_ = t.viewBox.baseVal) &&
                ((s = _.x || 0), (a = _.y || 0), (h = _.width), (g = _.height)),
              h ||
                ((v = Bn(t)),
                (_ = v.boxSizing === 'border-box'),
                (h =
                  (parseFloat(v.width) || t.clientWidth || 0) +
                  (_
                    ? 0
                    : parseFloat(v.borderLeftWidth) +
                      parseFloat(v.borderRightWidth))),
                (g =
                  (parseFloat(v.height) || t.clientHeight || 0) +
                  (_
                    ? 0
                    : parseFloat(v.borderTopWidth) +
                      parseFloat(v.borderBottomWidth))))),
          (o = h),
          (u = g);
      }
      return t === e
        ? { left: s, top: a, width: o - s, height: u - a }
        : ((f = kn(e, !0).multiply(kn(t))),
          (c = f.apply({ x: s, y: a })),
          (d = f.apply({ x: o, y: a })),
          (p = f.apply({ x: o, y: u })),
          (l = f.apply({ x: s, y: u })),
          (s = Math.min(c.x, d.x, p.x, l.x)),
          (a = Math.min(c.y, d.y, p.y, l.y)),
          (m = e.parentNode || {}),
          {
            left: s + (m.scrollLeft || 0),
            top: a + (m.scrollTop || 0),
            width: Math.max(c.x, d.x, p.x, l.x) - s,
            height: Math.max(c.y, d.y, p.y, l.y) - a,
          });
    },
    hu = function (t, e, i, n, s, o) {
      var a = {},
        u,
        f,
        c;
      if (e)
        if (s !== 1 && e instanceof Array) {
          if (((a.end = u = []), (c = e.length), In(e[0])))
            for (f = 0; f < c; f++) u[f] = bd(e[f], s);
          else for (f = 0; f < c; f++) u[f] = e[f] * s;
          (i += 1.1), (n -= 1.1);
        } else
          wr(e)
            ? (a.end = function (d) {
                var p = e.call(t, d),
                  l,
                  _;
                if (s !== 1)
                  if (In(p)) {
                    l = {};
                    for (_ in p) l[_] = p[_] * s;
                    p = l;
                  } else p *= s;
                return p;
              })
            : (a.end = e);
      return (
        (i || i === 0) && (a.max = i),
        (n || n === 0) && (a.min = n),
        o && (a.velocity = 0),
        a
      );
    },
    dm = function r(t) {
      var e;
      return !t || !t.getAttribute || t === qe
        ? !1
        : (e = t.getAttribute('data-clickable')) === 'true' ||
          (e !== 'false' &&
            (t.onclick ||
              sm.test(t.nodeName + '') ||
              t.getAttribute('contentEditable') === 'true'))
        ? !0
        : r(t.parentNode);
    },
    $s = function (t, e) {
      for (var i = t.length, n; i--; )
        (n = t[i]),
          (n.ondragstart = n.onselectstart = e ? null : Gs),
          st.set(n, { lazy: !0, userSelect: e ? 'text' : 'none' });
    },
    hm = function r(t) {
      if (Bn(t).position === 'fixed') return !0;
      if (((t = t.parentNode), t && t.nodeType === 1)) return r(t);
    },
    Td,
    mu,
    pm = function (t, e) {
      (t = st.utils.toArray(t)[0]), (e = e || {});
      var i = document.createElement('div'),
        n = i.style,
        s = t.firstChild,
        o = 0,
        a = 0,
        u = t.scrollTop,
        f = t.scrollLeft,
        c = t.scrollWidth,
        d = t.scrollHeight,
        p = 0,
        l = 0,
        _ = 0,
        h,
        g,
        v,
        m,
        y,
        A;
      Td && e.force3D !== !1
        ? ((y = 'translate3d('), (A = 'px,0px)'))
        : Nn && ((y = 'translate('), (A = 'px)')),
        (this.scrollTop = function (x, E) {
          if (!arguments.length) return -this.top();
          this.top(-x, E);
        }),
        (this.scrollLeft = function (x, E) {
          if (!arguments.length) return -this.left();
          this.left(-x, E);
        }),
        (this.left = function (x, E) {
          if (!arguments.length) return -(t.scrollLeft + a);
          var w = t.scrollLeft - f,
            S = a;
          if ((w > 2 || w < -2) && !E) {
            (f = t.scrollLeft),
              st.killTweensOf(this, { left: 1, scrollLeft: 1 }),
              this.left(-f),
              e.onKill && e.onKill();
            return;
          }
          (x = -x),
            x < 0
              ? ((a = (x - 0.5) | 0), (x = 0))
              : x > l
              ? ((a = (x - l) | 0), (x = l))
              : (a = 0),
            (a || S) &&
              (this._skip || (n[Nn] = y + -a + 'px,' + -o + A),
              a + p >= 0 && (n.paddingRight = a + p + 'px')),
            (t.scrollLeft = x | 0),
            (f = t.scrollLeft);
        }),
        (this.top = function (x, E) {
          if (!arguments.length) return -(t.scrollTop + o);
          var w = t.scrollTop - u,
            S = o;
          if ((w > 2 || w < -2) && !E) {
            (u = t.scrollTop),
              st.killTweensOf(this, { top: 1, scrollTop: 1 }),
              this.top(-u),
              e.onKill && e.onKill();
            return;
          }
          (x = -x),
            x < 0
              ? ((o = (x - 0.5) | 0), (x = 0))
              : x > _
              ? ((o = (x - _) | 0), (x = _))
              : (o = 0),
            (o || S) && (this._skip || (n[Nn] = y + -a + 'px,' + -o + A)),
            (t.scrollTop = x | 0),
            (u = t.scrollTop);
        }),
        (this.maxScrollTop = function () {
          return _;
        }),
        (this.maxScrollLeft = function () {
          return l;
        }),
        (this.disable = function () {
          for (s = i.firstChild; s; )
            (m = s.nextSibling), t.appendChild(s), (s = m);
          t === i.parentNode && t.removeChild(i);
        }),
        (this.enable = function () {
          if (((s = t.firstChild), s !== i)) {
            for (; s; ) (m = s.nextSibling), i.appendChild(s), (s = m);
            t.appendChild(i), this.calibrate();
          }
        }),
        (this.calibrate = function (x) {
          var E = t.clientWidth === h,
            w,
            S,
            k;
          (u = t.scrollTop),
            (f = t.scrollLeft),
            !(
              E &&
              t.clientHeight === g &&
              i.offsetHeight === v &&
              c === t.scrollWidth &&
              d === t.scrollHeight &&
              !x
            ) &&
              ((o || a) &&
                ((S = this.left()),
                (k = this.top()),
                this.left(-t.scrollLeft),
                this.top(-t.scrollTop)),
              (w = Bn(t)),
              (!E || x) &&
                ((n.display = 'block'),
                (n.width = 'auto'),
                (n.paddingRight = '0px'),
                (p = Math.max(0, t.scrollWidth - t.clientWidth)),
                p &&
                  (p +=
                    parseFloat(w.paddingLeft) +
                    (mu ? parseFloat(w.paddingRight) : 0))),
              (n.display = 'inline-block'),
              (n.position = 'relative'),
              (n.overflow = 'visible'),
              (n.verticalAlign = 'top'),
              (n.boxSizing = 'content-box'),
              (n.width = '100%'),
              (n.paddingRight = p + 'px'),
              mu && (n.paddingBottom = w.paddingBottom),
              (h = t.clientWidth),
              (g = t.clientHeight),
              (c = t.scrollWidth),
              (d = t.scrollHeight),
              (l = t.scrollWidth - h),
              (_ = t.scrollHeight - g),
              (v = i.offsetHeight),
              (n.display = 'block'),
              (S || k) && (this.left(S), this.top(k)));
        }),
        (this.content = i),
        (this.element = t),
        (this._skip = !1),
        this.enable();
    },
    pu = function (t) {
      if (yd() && document.body) {
        var e = window && window.navigator;
        (dt = window),
          (Jt = document),
          (be = Jt.documentElement),
          (qe = Jt.body),
          (fu = Ys('div')),
          (Us = !!window.PointerEvent),
          (Ge = Ys('div')),
          (Ge.style.cssText =
            'visibility:hidden;height:1px;top:-1px;pointer-events:none;position:relative;clear:both;cursor:grab'),
          (Mn = Ge.style.cursor === 'grab' ? 'grab' : 'move'),
          (Rn = e && e.userAgent.toLowerCase().indexOf('android') !== -1),
          (gu =
            ('ontouchstart' in be && 'orientation' in dt) ||
            (e && (e.MaxTouchPoints > 0 || e.msMaxTouchPoints > 0))),
          (mu = (function () {
            var i = Ys('div'),
              n = Ys('div'),
              s = n.style,
              o = qe,
              a;
            return (
              (s.display = 'inline-block'),
              (s.position = 'relative'),
              (i.style.cssText = n.innerHTML =
                'width:90px;height:40px;padding:10px;overflow:auto;visibility:hidden'),
              i.appendChild(n),
              o.appendChild(i),
              (a = n.offsetHeight + 18 > i.scrollHeight),
              o.removeChild(i),
              a
            );
          })()),
          (Fn = (function (i) {
            for (
              var n = i.split(','),
                s = (
                  ('onpointerdown' in fu)
                    ? 'pointerdown,pointermove,pointerup,pointercancel'
                    : ('onmspointerdown' in fu)
                    ? 'MSPointerDown,MSPointerMove,MSPointerUp,MSPointerCancel'
                    : i
                ).split(','),
                o = {},
                a = 4;
              --a > -1;

            )
              (o[n[a]] = s[a]), (o[s[a]] = n[a]);
            try {
              be.addEventListener(
                'test',
                null,
                Object.defineProperty({}, 'passive', {
                  get: function () {
                    md = 1;
                  },
                }),
              );
            } catch {}
            return o;
          })('touchstart,touchmove,touchend,touchcancel')),
          Ot(Jt, 'touchcancel', Gs),
          Ot(dt, 'touchmove', Gs),
          qe && qe.addEventListener('touchstart', Gs),
          Ot(Jt, 'contextmenu', function () {
            for (var i in Di) Di[i].isPressed && Di[i].endDrag();
          }),
          (st = _u = xd());
      }
      st
        ? ((ye = st.plugins.inertia),
          (Ln = st.utils.checkPrefix),
          (Nn = Ln(Nn)),
          (vu = Ln(vu)),
          (Tr = st.utils.toArray),
          (Td = !!Ln('perspective')))
        : t && console.warn('Please gsap.registerPlugin(Draggable)');
    },
    _m = (function () {
      function r(e) {
        (this._listeners = {}), (this.target = e || this);
      }
      var t = r.prototype;
      return (
        (t.addEventListener = function (i, n) {
          var s = this._listeners[i] || (this._listeners[i] = []);
          ~s.indexOf(n) || s.push(n);
        }),
        (t.removeEventListener = function (i, n) {
          var s = this._listeners[i],
            o = (s && s.indexOf(n)) || -1;
          o > -1 && s.splice(o, 1);
        }),
        (t.dispatchEvent = function (i) {
          var n = this,
            s;
          return (
            (this._listeners[i] || []).forEach(function (o) {
              return (
                o.call(n, { type: i, target: n.target }) === !1 && (s = !1)
              );
            }),
            s
          );
        }),
        r
      );
    })(),
    Er = (function (r) {
      rm(t, r);
      function t(e, i) {
        var n;
        (n = r.call(this) || this),
          _u || pu(1),
          (e = Tr(e)[0]),
          ye || (ye = st.plugins.inertia),
          (n.vars = i = bd(i || {})),
          (n.target = e),
          (n.x = n.y = n.rotation = 0),
          (n.dragResistance = parseFloat(i.dragResistance) || 0),
          (n.edgeResistance = isNaN(i.edgeResistance)
            ? 1
            : parseFloat(i.edgeResistance) || 0),
          (n.lockAxis = i.lockAxis),
          (n.autoScroll = i.autoScroll || 0),
          (n.lockedAxis = null),
          (n.allowEventDefault = !!i.allowEventDefault),
          st.getProperty(e, 'x');
        var s = (i.type || 'x,y').toLowerCase(),
          o = ~s.indexOf('x') || ~s.indexOf('y'),
          a = s.indexOf('rotation') !== -1,
          u = a ? 'rotation' : o ? 'x' : 'left',
          f = o ? 'y' : 'top',
          c = !!(~s.indexOf('x') || ~s.indexOf('left') || s === 'scroll'),
          d = !!(~s.indexOf('y') || ~s.indexOf('top') || s === 'scroll'),
          p = i.minimumMovement || 2,
          l = em(n),
          _ = Tr(i.trigger || i.handle || e),
          h = {},
          g = 0,
          v = !1,
          m = i.autoScrollMarginTop || 40,
          y = i.autoScrollMarginRight || 40,
          A = i.autoScrollMarginBottom || 40,
          x = i.autoScrollMarginLeft || 40,
          E = i.clickableTest || dm,
          w = 0,
          S = e._gsap || st.core.getCache(e),
          k = hm(e),
          M = function (b, L) {
            return parseFloat(S.get(e, b, L));
          },
          O = e.ownerDocument || Jt,
          P,
          T,
          D,
          R,
          W,
          Y,
          z,
          $,
          B,
          N,
          U,
          j,
          K,
          Ft,
          I,
          ot,
          nt,
          _t,
          gt,
          we,
          Te,
          H,
          Q,
          J,
          je,
          Wt,
          fe,
          Zs,
          Js,
          Cu,
          qt,
          Ou = function (b) {
            return (
              ue(b),
              b.stopImmediatePropagation && b.stopImmediatePropagation(),
              !1
            );
          },
          Le = function q(b) {
            if (l.autoScroll && l.isDragging && (v || nt)) {
              var L = e,
                C = l.autoScroll * 15,
                F,
                V,
                X,
                tt,
                G,
                lt,
                rt,
                ft;
              for (
                v = !1,
                  Ue.scrollTop =
                    dt.pageYOffset != null
                      ? dt.pageYOffset
                      : O.documentElement.scrollTop != null
                      ? O.documentElement.scrollTop
                      : O.body.scrollTop,
                  Ue.scrollLeft =
                    dt.pageXOffset != null
                      ? dt.pageXOffset
                      : O.documentElement.scrollLeft != null
                      ? O.documentElement.scrollLeft
                      : O.body.scrollLeft,
                  tt = l.pointerX - Ue.scrollLeft,
                  G = l.pointerY - Ue.scrollTop;
                L && !V;

              )
                (V = Mi(L.parentNode)),
                  (F = V ? Ue : L.parentNode),
                  (X = V
                    ? {
                        bottom: Math.max(be.clientHeight, dt.innerHeight || 0),
                        right: Math.max(be.clientWidth, dt.innerWidth || 0),
                        left: 0,
                        top: 0,
                      }
                    : F.getBoundingClientRect()),
                  (lt = rt = 0),
                  d &&
                    ((ft = F._gsMaxScrollY - F.scrollTop),
                    ft < 0
                      ? (rt = ft)
                      : G > X.bottom - A && ft
                      ? ((v = !0),
                        (rt = Math.min(
                          ft,
                          (C * (1 - Math.max(0, X.bottom - G) / A)) | 0,
                        )))
                      : G < X.top + m &&
                        F.scrollTop &&
                        ((v = !0),
                        (rt = -Math.min(
                          F.scrollTop,
                          (C * (1 - Math.max(0, G - X.top) / m)) | 0,
                        ))),
                    rt && (F.scrollTop += rt)),
                  c &&
                    ((ft = F._gsMaxScrollX - F.scrollLeft),
                    ft < 0
                      ? (lt = ft)
                      : tt > X.right - y && ft
                      ? ((v = !0),
                        (lt = Math.min(
                          ft,
                          (C * (1 - Math.max(0, X.right - tt) / y)) | 0,
                        )))
                      : tt < X.left + x &&
                        F.scrollLeft &&
                        ((v = !0),
                        (lt = -Math.min(
                          F.scrollLeft,
                          (C * (1 - Math.max(0, tt - X.left) / x)) | 0,
                        ))),
                    lt && (F.scrollLeft += lt)),
                  V &&
                    (lt || rt) &&
                    (dt.scrollTo(F.scrollLeft, F.scrollTop),
                    zi(l.pointerX + lt, l.pointerY + rt)),
                  (L = F);
            }
            if (nt) {
              var yt = l.x,
                It = l.y;
              a
                ? ((l.deltaX = yt - parseFloat(S.rotation)),
                  (l.rotation = yt),
                  (S.rotation = yt + 'deg'),
                  S.renderTransform(1, S))
                : T
                ? (d && ((l.deltaY = It - T.top()), T.top(It)),
                  c && ((l.deltaX = yt - T.left()), T.left(yt)))
                : o
                ? (d && ((l.deltaY = It - parseFloat(S.y)), (S.y = It + 'px')),
                  c && ((l.deltaX = yt - parseFloat(S.x)), (S.x = yt + 'px')),
                  S.renderTransform(1, S))
                : (d &&
                    ((l.deltaY = It - parseFloat(e.style.top || 0)),
                    (e.style.top = It + 'px')),
                  c &&
                    ((l.deltaX = yt - parseFloat(e.style.left || 0)),
                    (e.style.left = yt + 'px'))),
                $ &&
                  !b &&
                  !Zs &&
                  ((Zs = !0),
                  bt(l, 'drag', 'onDrag') === !1 &&
                    (c && (l.x -= l.deltaX), d && (l.y -= l.deltaY), q(!0)),
                  (Zs = !1));
            }
            nt = !1;
          },
          Ar = function (b, L) {
            var C = l.x,
              F = l.y,
              V,
              X;
            e._gsap || (S = st.core.getCache(e)),
              S.uncache && st.getProperty(e, 'x'),
              o
                ? ((l.x = parseFloat(S.x)), (l.y = parseFloat(S.y)))
                : a
                ? (l.x = l.rotation = parseFloat(S.rotation))
                : T
                ? ((l.y = T.top()), (l.x = T.left()))
                : ((l.y =
                    parseFloat(e.style.top || ((X = Bn(e)) && X.top)) || 0),
                  (l.x = parseFloat(e.style.left || (X || {}).left) || 0)),
              (gt || we || Te) &&
                !L &&
                (l.isDragging || l.isThrowing) &&
                (Te &&
                  ((Oi.x = l.x),
                  (Oi.y = l.y),
                  (V = Te(Oi)),
                  V.x !== l.x && ((l.x = V.x), (nt = !0)),
                  V.y !== l.y && ((l.y = V.y), (nt = !0))),
                gt &&
                  ((V = gt(l.x)),
                  V !== l.x && ((l.x = V), a && (l.rotation = V), (nt = !0))),
                we && ((V = we(l.y)), V !== l.y && (l.y = V), (nt = !0))),
              nt && Le(!0),
              b ||
                ((l.deltaX = l.x - C),
                (l.deltaY = l.y - F),
                bt(l, 'throwupdate', 'onThrowUpdate'));
          },
          to = function (b, L, C, F) {
            return (
              L == null && (L = -Kr),
              C == null && (C = Kr),
              wr(b)
                ? function (V) {
                    var X = l.isPressed ? 1 - l.edgeResistance : 1;
                    return (
                      b.call(
                        l,
                        V > C ? C + (V - C) * X : V < L ? L + (V - L) * X : V,
                      ) * F
                    );
                  }
                : Dn(b)
                ? function (V) {
                    for (var X = b.length, tt = 0, G = Kr, lt, rt; --X > -1; )
                      (lt = b[X]),
                        (rt = lt - V),
                        rt < 0 && (rt = -rt),
                        rt < G && lt >= L && lt <= C && ((tt = X), (G = rt));
                    return b[tt];
                  }
                : isNaN(b)
                ? function (V) {
                    return V;
                  }
                : function () {
                    return b * F;
                  }
            );
          },
          Ud = function (b, L, C, F, V, X, tt) {
            return (
              (X = X && X < Kr ? X * X : Kr),
              wr(b)
                ? function (G) {
                    var lt = l.isPressed ? 1 - l.edgeResistance : 1,
                      rt = G.x,
                      ft = G.y,
                      yt,
                      It,
                      Re;
                    return (
                      (G.x = rt =
                        rt > C
                          ? C + (rt - C) * lt
                          : rt < L
                          ? L + (rt - L) * lt
                          : rt),
                      (G.y = ft =
                        ft > V
                          ? V + (ft - V) * lt
                          : ft < F
                          ? F + (ft - F) * lt
                          : ft),
                      (yt = b.call(l, G)),
                      yt !== G && ((G.x = yt.x), (G.y = yt.y)),
                      tt !== 1 && ((G.x *= tt), (G.y *= tt)),
                      X < Kr &&
                        ((It = G.x - rt),
                        (Re = G.y - ft),
                        It * It + Re * Re > X && ((G.x = rt), (G.y = ft))),
                      G
                    );
                  }
                : Dn(b)
                ? function (G) {
                    for (
                      var lt = b.length, rt = 0, ft = Kr, yt, It, Re, te;
                      --lt > -1;

                    )
                      (Re = b[lt]),
                        (yt = Re.x - G.x),
                        (It = Re.y - G.y),
                        (te = yt * yt + It * It),
                        te < ft && ((rt = lt), (ft = te));
                    return ft <= X ? b[rt] : G;
                  }
                : function (G) {
                    return G;
                  }
            );
          },
          eo = function () {
            var b, L, C, F;
            (z = !1),
              T
                ? (T.calibrate(),
                  (l.minX = U = -T.maxScrollLeft()),
                  (l.minY = K = -T.maxScrollTop()),
                  (l.maxX = N = l.maxY = j = 0),
                  (z = !0))
                : i.bounds &&
                  ((b = vd(i.bounds, e.parentNode)),
                  a
                    ? ((l.minX = U = b.left),
                      (l.maxX = N = b.left + b.width),
                      (l.minY = K = l.maxY = j = 0))
                    : !xe(i.bounds.maxX) || !xe(i.bounds.maxY)
                    ? ((b = i.bounds),
                      (l.minX = U = b.minX),
                      (l.minY = K = b.minY),
                      (l.maxX = N = b.maxX),
                      (l.maxY = j = b.maxY))
                    : ((L = vd(e, e.parentNode)),
                      (l.minX = U =
                        Math.round(M(u, 'px') + b.left - L.left - 0.5)),
                      (l.minY = K =
                        Math.round(M(f, 'px') + b.top - L.top - 0.5)),
                      (l.maxX = N = Math.round(U + (b.width - L.width))),
                      (l.maxY = j = Math.round(K + (b.height - L.height)))),
                  U > N && ((l.minX = N), (l.maxX = N = U), (U = l.minX)),
                  K > j && ((l.minY = j), (l.maxY = j = K), (K = l.minY)),
                  a && ((l.minRotation = U), (l.maxRotation = N)),
                  (z = !0)),
              i.liveSnap &&
                ((C = i.liveSnap === !0 ? i.snap || {} : i.liveSnap),
                (F = Dn(C) || wr(C)),
                a
                  ? ((gt = to(F ? C : C.rotation, U, N, 1)), (we = null))
                  : C.points
                  ? (Te = Ud(
                      F ? C : C.points,
                      U,
                      N,
                      K,
                      j,
                      C.radius,
                      T ? -1 : 1,
                    ))
                  : (c &&
                      (gt = to(
                        F ? C : C.x || C.left || C.scrollLeft,
                        U,
                        N,
                        T ? -1 : 1,
                      )),
                    d &&
                      (we = to(
                        F ? C : C.y || C.top || C.scrollTop,
                        K,
                        j,
                        T ? -1 : 1,
                      ))));
          },
          Gd = function () {
            (l.isThrowing = !1), bt(l, 'throwcomplete', 'onThrowComplete');
          },
          qd = function () {
            l.isThrowing = !1;
          },
          ro = function (b, L) {
            var C, F, V, X;
            b && ye
              ? (b === !0 &&
                  ((C = i.snap || i.liveSnap || {}),
                  (F = Dn(C) || wr(C)),
                  (b = {
                    resistance:
                      (i.throwResistance || i.resistance || 1e3) / (a ? 10 : 1),
                  }),
                  a
                    ? (b.rotation = hu(l, F ? C : C.rotation, N, U, 1, L))
                    : (c &&
                        (b[u] = hu(
                          l,
                          F ? C : C.points || C.x || C.left,
                          N,
                          U,
                          T ? -1 : 1,
                          L || l.lockedAxis === 'x',
                        )),
                      d &&
                        (b[f] = hu(
                          l,
                          F ? C : C.points || C.y || C.top,
                          j,
                          K,
                          T ? -1 : 1,
                          L || l.lockedAxis === 'y',
                        )),
                      (C.points || (Dn(C) && In(C[0]))) &&
                        ((b.linkedProps = u + ',' + f),
                        (b.radius = C.radius)))),
                (l.isThrowing = !0),
                (X = isNaN(i.overshootTolerance)
                  ? i.edgeResistance === 1
                    ? 0
                    : 1 - l.edgeResistance + 0.2
                  : i.overshootTolerance),
                b.duration ||
                  (b.duration = {
                    max: Math.max(
                      i.minDuration || 0,
                      'maxDuration' in i ? i.maxDuration : 2,
                    ),
                    min: isNaN(i.minDuration)
                      ? X === 0 || (In(b) && b.resistance > 1e3)
                        ? 0
                        : 0.5
                      : i.minDuration,
                    overshoot: X,
                  }),
                (l.tween = V =
                  st.to(T || e, {
                    inertia: b,
                    data: '_draggable',
                    onComplete: Gd,
                    onInterrupt: qd,
                    onUpdate: i.fastMode ? bt : Ar,
                    onUpdateParams: i.fastMode
                      ? [l, 'onthrowupdate', 'onThrowUpdate']
                      : C && C.radius
                      ? [!1, !0]
                      : [],
                  })),
                i.fastMode ||
                  (T && (T._skip = !0),
                  V.render(1e9, !0, !0),
                  Ar(!0, !0),
                  (l.endX = l.x),
                  (l.endY = l.y),
                  a && (l.endRotation = l.x),
                  V.play(0),
                  Ar(!0, !0),
                  T && (T._skip = !1)))
              : z && l.applyBounds();
          },
          ku = function (b) {
            var L = J,
              C;
            (J = kn(e.parentNode, !0)),
              b &&
                l.isPressed &&
                !J.equals(L || new jr()) &&
                ((C = L.inverse().apply({ x: D, y: R })),
                J.apply(C, C),
                (D = C.x),
                (R = C.y)),
              J.equals(im) && (J = null);
          },
          io = function () {
            var b = 1 - l.edgeResistance,
              L = k ? Ri(O) : 0,
              C = k ? Li(O) : 0,
              F,
              V,
              X;
            ku(!1),
              (le.x = l.pointerX - L),
              (le.y = l.pointerY - C),
              J && J.apply(le, le),
              (D = le.x),
              (R = le.y),
              nt && (zi(l.pointerX, l.pointerY), Le(!0)),
              T
                ? (eo(), (Y = T.top()), (W = T.left()))
                : (Bi() ? (Ar(!0, !0), eo()) : l.applyBounds(),
                  a
                    ? ((F = e.ownerSVGElement
                        ? [S.xOrigin - e.getBBox().x, S.yOrigin - e.getBBox().y]
                        : (Bn(e)[vu] || '0 0').split(' ')),
                      (ot = l.rotationOrigin =
                        kn(e).apply({
                          x: parseFloat(F[0]) || 0,
                          y: parseFloat(F[1]) || 0,
                        })),
                      Ar(!0, !0),
                      (V = l.pointerX - ot.x - L),
                      (X = ot.y - l.pointerY + C),
                      (W = l.x),
                      (Y = l.y = Math.atan2(X, V) * ud))
                    : ((Y = M(f, 'px')), (W = M(u, 'px')))),
              z &&
                b &&
                (W > N ? (W = N + (W - N) / b) : W < U && (W = U - (U - W) / b),
                a ||
                  (Y > j
                    ? (Y = j + (Y - j) / b)
                    : Y < K && (Y = K - (K - Y) / b))),
              (l.startX = W = xr(W)),
              (l.startY = Y = xr(Y));
          },
          Bi = function () {
            return l.tween && l.tween.isActive();
          },
          jd = function () {
            Ge.parentNode &&
              !Bi() &&
              !l.isDragging &&
              Ge.parentNode.removeChild(Ge);
          },
          Vi = function (b, L) {
            var C;
            if (
              !P ||
              l.isPressed ||
              !b ||
              ((b.type === 'mousedown' || b.type === 'pointerdown') &&
                !L &&
                br() - w < 30 &&
                Fn[l.pointerEvent.type])
            ) {
              qt && b && P && ue(b);
              return;
            }
            if (
              ((je = Bi()),
              (l.pointerEvent = b),
              Fn[b.type]
                ? ((Q = ~b.type.indexOf('touch')
                    ? b.currentTarget || b.target
                    : O),
                  Ot(Q, 'touchend', ce),
                  Ot(Q, 'touchmove', Pr),
                  Ot(Q, 'touchcancel', ce),
                  Ot(O, 'touchstart', hd))
                : ((Q = null), Ot(O, 'mousemove', Pr)),
              (fe = null),
              (!Us || !Q) &&
                (Ot(O, 'mouseup', ce),
                b && b.target && Ot(b.target, 'mouseup', ce)),
              (H = E.call(l, b.target) && i.dragClickables === !1 && !L),
              H)
            ) {
              Ot(b.target, 'change', ce),
                bt(l, 'pressInit', 'onPressInit'),
                bt(l, 'press', 'onPress'),
                $s(_, !0),
                (qt = !1);
              return;
            }
            if (
              ((Wt =
                !Q ||
                c === d ||
                l.vars.allowNativeTouchScrolling === !1 ||
                (l.vars.allowContextMenu && b && (b.ctrlKey || b.which > 2))
                  ? !1
                  : c
                  ? 'y'
                  : 'x'),
              (qt = !Wt && !l.allowEventDefault),
              qt && (ue(b), Ot(dt, 'touchforcechange', ue)),
              b.changedTouches
                ? ((b = Ft = b.changedTouches[0]), (I = b.identifier))
                : b.pointerId
                ? (I = b.pointerId)
                : (Ft = I = null),
              qs++,
              am(Le),
              (R = l.pointerY = b.pageY),
              (D = l.pointerX = b.pageX),
              bt(l, 'pressInit', 'onPressInit'),
              (Wt || l.autoScroll) && cu(e.parentNode),
              e.parentNode &&
                l.autoScroll &&
                !T &&
                !a &&
                e.parentNode._gsMaxScrollX &&
                !Ge.parentNode &&
                !e.getBBox &&
                ((Ge.style.width = e.parentNode.scrollWidth + 'px'),
                e.parentNode.appendChild(Ge)),
              io(),
              l.tween && l.tween.kill(),
              (l.isThrowing = !1),
              st.killTweensOf(T || e, h, !0),
              T && st.killTweensOf(e, { scrollTo: 1 }, !0),
              (l.tween = l.lockedAxis = null),
              (i.zIndexBoost || (!a && !T && i.zIndexBoost !== !1)) &&
                (e.style.zIndex = t.zIndex++),
              (l.isPressed = !0),
              ($ = !!(i.onDrag || l._listeners.drag)),
              (B = !!(i.onMove || l._listeners.move)),
              i.cursor !== !1 || i.activeCursor)
            )
              for (C = _.length; --C > -1; )
                st.set(_[C], {
                  cursor:
                    i.activeCursor ||
                    i.cursor ||
                    (Mn === 'grab' ? 'grabbing' : Mn),
                });
            bt(l, 'press', 'onPress');
          },
          Pr = function (b) {
            var L = b,
              C,
              F,
              V,
              X,
              tt,
              G;
            if (!P || yu || !l.isPressed || !b) {
              qt && b && P && ue(b);
              return;
            }
            if (((l.pointerEvent = b), (C = b.changedTouches), C)) {
              if (((b = C[0]), b !== Ft && b.identifier !== I)) {
                for (
                  X = C.length;
                  --X > -1 && (b = C[X]).identifier !== I && b.target !== e;

                );
                if (X < 0) return;
              }
            } else if (b.pointerId && I && b.pointerId !== I) return;
            if (
              Q &&
              Wt &&
              !fe &&
              ((le.x = b.pageX - (k ? Ri(O) : 0)),
              (le.y = b.pageY - (k ? Li(O) : 0)),
              J && J.apply(le, le),
              (F = le.x),
              (V = le.y),
              (tt = Math.abs(F - D)),
              (G = Math.abs(V - R)),
              ((tt !== G && (tt > p || G > p)) || (Rn && Wt === fe)) &&
                ((fe = tt > G && c ? 'x' : 'y'),
                Wt && fe !== Wt && Ot(dt, 'touchforcechange', ue),
                l.vars.lockAxisOnTouchScroll !== !1 &&
                  c &&
                  d &&
                  ((l.lockedAxis = fe === 'x' ? 'y' : 'x'),
                  wr(l.vars.onLockAxis) && l.vars.onLockAxis.call(l, L)),
                Rn && Wt === fe))
            ) {
              ce(L);
              return;
            }
            !l.allowEventDefault &&
            (!Wt || (fe && Wt !== fe)) &&
            L.cancelable !== !1
              ? (ue(L), (qt = !0))
              : qt && (qt = !1),
              l.autoScroll && (v = !0),
              zi(b.pageX, b.pageY, B);
          },
          zi = function (b, L, C) {
            var F = 1 - l.dragResistance,
              V = 1 - l.edgeResistance,
              X = l.pointerX,
              tt = l.pointerY,
              G = Y,
              lt = l.x,
              rt = l.y,
              ft = l.endX,
              yt = l.endY,
              It = l.endRotation,
              Re = nt,
              te,
              Ke,
              Dt,
              xt,
              no,
              de;
            (l.pointerX = b),
              (l.pointerY = L),
              k && ((b -= Ri(O)), (L -= Li(O))),
              a
                ? ((xt = Math.atan2(ot.y - L, b - ot.x) * ud),
                  (no = l.y - xt),
                  no > 180
                    ? ((Y -= 360), (l.y = xt))
                    : no < -180 && ((Y += 360), (l.y = xt)),
                  l.x !== W || Math.abs(Y - xt) > p
                    ? ((l.y = xt), (Dt = W + (Y - xt) * F))
                    : (Dt = W))
                : (J &&
                    ((de = b * J.a + L * J.c + J.e),
                    (L = b * J.b + L * J.d + J.f),
                    (b = de)),
                  (Ke = L - R),
                  (te = b - D),
                  Ke < p && Ke > -p && (Ke = 0),
                  te < p && te > -p && (te = 0),
                  (l.lockAxis || l.lockedAxis) &&
                    (te || Ke) &&
                    ((de = l.lockedAxis),
                    de ||
                      ((l.lockedAxis = de =
                        c && Math.abs(te) > Math.abs(Ke)
                          ? 'y'
                          : d
                          ? 'x'
                          : null),
                      de &&
                        wr(l.vars.onLockAxis) &&
                        l.vars.onLockAxis.call(l, l.pointerEvent)),
                    de === 'y' ? (Ke = 0) : de === 'x' && (te = 0)),
                  (Dt = xr(W + te * F)),
                  (xt = xr(Y + Ke * F))),
              (gt || we || Te) && (l.x !== Dt || (l.y !== xt && !a))
                ? (Te &&
                    ((Oi.x = Dt),
                    (Oi.y = xt),
                    (de = Te(Oi)),
                    (Dt = xr(de.x)),
                    (xt = xr(de.y))),
                  gt && (Dt = xr(gt(Dt))),
                  we && (xt = xr(we(xt))))
                : z &&
                  (Dt > N
                    ? (Dt = N + Math.round((Dt - N) * V))
                    : Dt < U && (Dt = U + Math.round((Dt - U) * V)),
                  a ||
                    (xt > j
                      ? (xt = Math.round(j + (xt - j) * V))
                      : xt < K && (xt = Math.round(K + (xt - K) * V)))),
              (l.x !== Dt || (l.y !== xt && !a)) &&
                (a
                  ? ((l.endRotation = l.x = l.endX = Dt), (nt = !0))
                  : (d && ((l.y = l.endY = xt), (nt = !0)),
                    c && ((l.x = l.endX = Dt), (nt = !0))),
                !C || bt(l, 'move', 'onMove') !== !1
                  ? !l.isDragging &&
                    l.isPressed &&
                    ((l.isDragging = !0), bt(l, 'dragstart', 'onDragStart'))
                  : ((l.pointerX = X),
                    (l.pointerY = tt),
                    (Y = G),
                    (l.x = lt),
                    (l.y = rt),
                    (l.endX = ft),
                    (l.endY = yt),
                    (l.endRotation = It),
                    (nt = Re)));
          },
          ce = function q(b, L) {
            if (
              !P ||
              !l.isPressed ||
              (b &&
                I != null &&
                !L &&
                ((b.pointerId && b.pointerId !== I && b.target !== e) ||
                  (b.changedTouches && !lm(b.changedTouches, I))))
            ) {
              qt && b && P && ue(b);
              return;
            }
            l.isPressed = !1;
            var C = b,
              F = l.isDragging,
              V = l.vars.allowContextMenu && b && (b.ctrlKey || b.which > 2),
              X = st.delayedCall(0.001, jd),
              tt,
              G,
              lt,
              rt,
              ft;
            if (
              (Q
                ? (Tt(Q, 'touchend', q),
                  Tt(Q, 'touchmove', Pr),
                  Tt(Q, 'touchcancel', q),
                  Tt(O, 'touchstart', hd))
                : Tt(O, 'mousemove', Pr),
              Tt(dt, 'touchforcechange', ue),
              (!Us || !Q) &&
                (Tt(O, 'mouseup', q),
                b && b.target && Tt(b.target, 'mouseup', q)),
              (nt = !1),
              F && ((g = ld = br()), (l.isDragging = !1)),
              H && !V)
            ) {
              b && (Tt(b.target, 'change', q), (l.pointerEvent = C)),
                $s(_, !1),
                bt(l, 'release', 'onRelease'),
                bt(l, 'click', 'onClick'),
                (H = !1);
              return;
            }
            for (dd(Le), G = _.length; --G > -1; )
              du(_[G], 'cursor', i.cursor || (i.cursor !== !1 ? Mn : null));
            if ((qs--, b)) {
              if (
                ((tt = b.changedTouches),
                tt && ((b = tt[0]), b !== Ft && b.identifier !== I))
              ) {
                for (
                  G = tt.length;
                  --G > -1 && (b = tt[G]).identifier !== I && b.target !== e;

                );
                if (G < 0) return;
              }
              (l.pointerEvent = C),
                (l.pointerX = b.pageX),
                (l.pointerY = b.pageY);
            }
            return (
              V && C
                ? (ue(C), (qt = !0), bt(l, 'release', 'onRelease'))
                : C && !F
                ? ((qt = !1),
                  je && (i.snap || i.bounds) && ro(i.inertia || i.throwProps),
                  bt(l, 'release', 'onRelease'),
                  (!Rn || C.type !== 'touchmove') &&
                    C.type.indexOf('cancel') === -1 &&
                    (bt(l, 'click', 'onClick'),
                    br() - w < 300 && bt(l, 'doubleclick', 'onDoubleClick'),
                    (rt = C.target || e),
                    (w = br()),
                    (ft = function () {
                      w !== Js &&
                        l.enabled() &&
                        !l.isPressed &&
                        !C.defaultPrevented &&
                        (rt.click
                          ? rt.click()
                          : O.createEvent &&
                            ((lt = O.createEvent('MouseEvents')),
                            lt.initMouseEvent(
                              'click',
                              !0,
                              !0,
                              dt,
                              1,
                              l.pointerEvent.screenX,
                              l.pointerEvent.screenY,
                              l.pointerX,
                              l.pointerY,
                              !1,
                              !1,
                              !1,
                              !1,
                              0,
                              null,
                            ),
                            rt.dispatchEvent(lt)));
                    }),
                    !Rn && !C.defaultPrevented && st.delayedCall(0.05, ft)))
                : (ro(i.inertia || i.throwProps),
                  !l.allowEventDefault &&
                  C &&
                  (i.dragClickables !== !1 || !E.call(l, C.target)) &&
                  F &&
                  (!Wt || (fe && Wt === fe)) &&
                  C.cancelable !== !1
                    ? ((qt = !0), ue(C))
                    : (qt = !1),
                  bt(l, 'release', 'onRelease')),
              Bi() && X.duration(l.tween.duration()),
              F && bt(l, 'dragend', 'onDragEnd'),
              !0
            );
          },
          $n = function (b) {
            if (b && l.isDragging && !T) {
              var L = b.target || e.parentNode,
                C = L.scrollLeft - L._gsScrollX,
                F = L.scrollTop - L._gsScrollY;
              (C || F) &&
                (J
                  ? ((D -= C * J.a + F * J.c), (R -= F * J.d + C * J.b))
                  : ((D -= C), (R -= F)),
                (L._gsScrollX += C),
                (L._gsScrollY += F),
                zi(l.pointerX, l.pointerY));
            }
          },
          Du = function (b) {
            var L = br(),
              C = L - w < 40,
              F = L - g < 40,
              V = C && Js === w,
              X = l.pointerEvent && l.pointerEvent.defaultPrevented,
              tt = C && Cu === w,
              G = b.isTrusted || (b.isTrusted == null && C && V);
            if (
              ((V || (F && l.vars.suppressClickOnDrag !== !1)) &&
                b.stopImmediatePropagation &&
                b.stopImmediatePropagation(),
              C &&
                !(l.pointerEvent && l.pointerEvent.defaultPrevented) &&
                (!V || (G && !tt)))
            ) {
              G && V && (Cu = w), (Js = w);
              return;
            }
            (l.isPressed || F || C) && (!G || !b.detail || !C || X) && ue(b),
              !C &&
                !F &&
                (b && b.target && (l.pointerEvent = b),
                bt(l, 'click', 'onClick'));
          },
          Lu = function (b) {
            return J
              ? {
                  x: b.x * J.a + b.y * J.c + J.e,
                  y: b.x * J.b + b.y * J.d + J.f,
                }
              : { x: b.x, y: b.y };
          };
        return (
          (_t = t.get(e)),
          _t && _t.kill(),
          (n.startDrag = function (q, b) {
            var L, C, F, V;
            Vi(q || l.pointerEvent, !0),
              b &&
                !l.hitTest(q || l.pointerEvent) &&
                ((L = ki(q || l.pointerEvent)),
                (C = ki(e)),
                (F = Lu({ x: L.left + L.width / 2, y: L.top + L.height / 2 })),
                (V = Lu({ x: C.left + C.width / 2, y: C.top + C.height / 2 })),
                (D -= F.x - V.x),
                (R -= F.y - V.y)),
              l.isDragging ||
                ((l.isDragging = !0), bt(l, 'dragstart', 'onDragStart'));
          }),
          (n.drag = Pr),
          (n.endDrag = function (q) {
            return ce(q || l.pointerEvent, !0);
          }),
          (n.timeSinceDrag = function () {
            return l.isDragging ? 0 : (br() - g) / 1e3;
          }),
          (n.timeSinceClick = function () {
            return (br() - w) / 1e3;
          }),
          (n.hitTest = function (q, b) {
            return t.hitTest(l.target, q, b);
          }),
          (n.getDirection = function (q, b) {
            var L =
                q === 'velocity' && ye ? q : In(q) && !a ? 'element' : 'start',
              C,
              F,
              V,
              X,
              tt,
              G;
            return (
              L === 'element' && ((tt = ki(l.target)), (G = ki(q))),
              (C =
                L === 'start'
                  ? l.x - W
                  : L === 'velocity'
                  ? ye.getVelocity(e, u)
                  : tt.left + tt.width / 2 - (G.left + G.width / 2)),
              a
                ? C < 0
                  ? 'counter-clockwise'
                  : 'clockwise'
                : ((b = b || 2),
                  (F =
                    L === 'start'
                      ? l.y - Y
                      : L === 'velocity'
                      ? ye.getVelocity(e, f)
                      : tt.top + tt.height / 2 - (G.top + G.height / 2)),
                  (V = Math.abs(C / F)),
                  (X = V < 1 / b ? '' : C < 0 ? 'left' : 'right'),
                  V < b &&
                    (X !== '' && (X += '-'), (X += F < 0 ? 'up' : 'down')),
                  X)
            );
          }),
          (n.applyBounds = function (q, b) {
            var L, C, F, V, X, tt;
            if (q && i.bounds !== q) return (i.bounds = q), l.update(!0, b);
            if ((Ar(!0), eo(), z && !Bi())) {
              if (
                ((L = l.x),
                (C = l.y),
                L > N ? (L = N) : L < U && (L = U),
                C > j ? (C = j) : C < K && (C = K),
                (l.x !== L || l.y !== C) &&
                  ((F = !0),
                  (l.x = l.endX = L),
                  a ? (l.endRotation = L) : (l.y = l.endY = C),
                  (nt = !0),
                  Le(!0),
                  l.autoScroll && !l.isDragging))
              )
                for (
                  cu(e.parentNode),
                    V = e,
                    Ue.scrollTop =
                      dt.pageYOffset != null
                        ? dt.pageYOffset
                        : O.documentElement.scrollTop != null
                        ? O.documentElement.scrollTop
                        : O.body.scrollTop,
                    Ue.scrollLeft =
                      dt.pageXOffset != null
                        ? dt.pageXOffset
                        : O.documentElement.scrollLeft != null
                        ? O.documentElement.scrollLeft
                        : O.body.scrollLeft;
                  V && !tt;

                )
                  (tt = Mi(V.parentNode)),
                    (X = tt ? Ue : V.parentNode),
                    d &&
                      X.scrollTop > X._gsMaxScrollY &&
                      (X.scrollTop = X._gsMaxScrollY),
                    c &&
                      X.scrollLeft > X._gsMaxScrollX &&
                      (X.scrollLeft = X._gsMaxScrollX),
                    (V = X);
              l.isThrowing &&
                (F || l.endX > N || l.endX < U || l.endY > j || l.endY < K) &&
                ro(i.inertia || i.throwProps, F);
            }
            return l;
          }),
          (n.update = function (q, b, L) {
            var C = l.x,
              F = l.y;
            return (
              ku(!b),
              q ? l.applyBounds() : (nt && L && Le(!0), Ar(!0)),
              b && (zi(l.pointerX, l.pointerY), nt && Le(!0)),
              l.isPressed &&
                !b &&
                ((c && Math.abs(C - l.x) > 0.01) ||
                  (d && Math.abs(F - l.y) > 0.01 && !a)) &&
                io(),
              l.autoScroll &&
                (cu(e.parentNode, l.isDragging),
                (v = l.isDragging),
                Le(!0),
                _d(e, $n),
                pd(e, $n)),
              l
            );
          }),
          (n.enable = function (q) {
            var b = { lazy: !0 },
              L,
              C,
              F;
            if (
              (i.cursor !== !1 && (b.cursor = i.cursor || Mn),
              st.utils.checkPrefix('touchCallout') && (b.touchCallout = 'none'),
              q !== 'soft')
            ) {
              for (
                fd(
                  _,
                  c === d
                    ? 'none'
                    : (i.allowNativeTouchScrolling &&
                        (e.scrollHeight === e.clientHeight) ==
                          (e.scrollWidth === e.clientHeight)) ||
                      i.allowEventDefault
                    ? 'manipulation'
                    : c
                    ? 'pan-y'
                    : 'pan-x',
                ),
                  C = _.length;
                --C > -1;

              )
                (F = _[C]),
                  Us || Ot(F, 'mousedown', Vi),
                  Ot(F, 'touchstart', Vi),
                  Ot(F, 'click', Du, !0),
                  st.set(F, b),
                  F.getBBox &&
                    F.ownerSVGElement &&
                    st.set(F.ownerSVGElement, {
                      touchAction:
                        c === d
                          ? 'none'
                          : i.allowNativeTouchScrolling || i.allowEventDefault
                          ? 'manipulation'
                          : c
                          ? 'pan-y'
                          : 'pan-x',
                    }),
                  i.allowContextMenu || Ot(F, 'contextmenu', Ou);
              $s(_, !1);
            }
            return (
              pd(e, $n),
              (P = !0),
              ye &&
                q !== 'soft' &&
                ye.track(T || e, o ? 'x,y' : a ? 'rotation' : 'top,left'),
              (e._gsDragID = L = 'd' + nm++),
              (Di[L] = l),
              T && (T.enable(), (T.element._gsDragID = L)),
              (i.bounds || a) && io(),
              i.bounds && l.applyBounds(),
              l
            );
          }),
          (n.disable = function (q) {
            for (var b = l.isDragging, L = _.length, C; --L > -1; )
              du(_[L], 'cursor', null);
            if (q !== 'soft') {
              for (fd(_, null), L = _.length; --L > -1; )
                (C = _[L]),
                  du(C, 'touchCallout', null),
                  Tt(C, 'mousedown', Vi),
                  Tt(C, 'touchstart', Vi),
                  Tt(C, 'click', Du),
                  Tt(C, 'contextmenu', Ou);
              $s(_, !0),
                Q &&
                  (Tt(Q, 'touchcancel', ce),
                  Tt(Q, 'touchend', ce),
                  Tt(Q, 'touchmove', Pr)),
                Tt(O, 'mouseup', ce),
                Tt(O, 'mousemove', Pr);
            }
            return (
              _d(e, $n),
              (P = !1),
              ye &&
                q !== 'soft' &&
                ye.untrack(T || e, o ? 'x,y' : a ? 'rotation' : 'top,left'),
              T && T.disable(),
              dd(Le),
              (l.isDragging = l.isPressed = H = !1),
              b && bt(l, 'dragend', 'onDragEnd'),
              l
            );
          }),
          (n.enabled = function (q, b) {
            return arguments.length ? (q ? l.enable(b) : l.disable(b)) : P;
          }),
          (n.kill = function () {
            return (
              (l.isThrowing = !1),
              l.tween && l.tween.kill(),
              l.disable(),
              st.set(_, { clearProps: 'userSelect' }),
              delete Di[e._gsDragID],
              l
            );
          }),
          ~s.indexOf('scroll') &&
            ((T = n.scrollProxy =
              new pm(
                e,
                om(
                  {
                    onKill: function () {
                      l.isPressed && ce(null);
                    },
                  },
                  i,
                ),
              )),
            (e.style.overflowY = d && !gu ? 'auto' : 'hidden'),
            (e.style.overflowX = c && !gu ? 'auto' : 'hidden'),
            (e = T.content)),
          a ? (h.rotation = 1) : (c && (h[u] = 1), d && (h[f] = 1)),
          (S.force3D = 'force3D' in i ? i.force3D : !0),
          n.enable(),
          n
        );
      }
      return (
        (t.register = function (i) {
          (st = i), pu();
        }),
        (t.create = function (i, n) {
          return (
            _u || pu(!0),
            Tr(i).map(function (s) {
              return new t(s, n);
            })
          );
        }),
        (t.get = function (i) {
          return Di[(Tr(i)[0] || {})._gsDragID];
        }),
        (t.timeSinceDrag = function () {
          return (br() - ld) / 1e3;
        }),
        (t.hitTest = function (i, n, s) {
          if (i === n) return !1;
          var o = ki(i),
            a = ki(n),
            u = o.top,
            f = o.left,
            c = o.right,
            d = o.bottom,
            p = o.width,
            l = o.height,
            _ = a.left > c || a.right < f || a.top > d || a.bottom < u,
            h,
            g,
            v;
          return _ || !s
            ? !_
            : ((v = (s + '').indexOf('%') !== -1),
              (s = parseFloat(s) || 0),
              (h = { left: Math.max(f, a.left), top: Math.max(u, a.top) }),
              (h.width = Math.min(c, a.right) - h.left),
              (h.height = Math.min(d, a.bottom) - h.top),
              h.width < 0 || h.height < 0
                ? !1
                : v
                ? ((s *= 0.01),
                  (g = h.width * h.height),
                  g >= p * l * s || g >= a.width * a.height * s)
                : h.width > s && h.height > s);
        }),
        t
      );
    })(_m);
  um(Er.prototype, {
    pointerX: 0,
    pointerY: 0,
    startX: 0,
    startY: 0,
    deltaX: 0,
    deltaY: 0,
    isDragging: !1,
    isPressed: !1,
  });
  Er.zIndex = 1e3;
  Er.version = '3.7.0';
  xd() && st.registerPlugin(Er);
  var De,
    bu,
    zn,
    Sd,
    Ii,
    Ni,
    js,
    Ad,
    Pd,
    Cd = function () {
      return De || (typeof window < 'u' && (De = window.gsap));
    },
    wu = {},
    gm = function (t) {
      return Math.round(t * 1e4) / 1e4;
    },
    Tu = function (t) {
      return Pd(t).id;
    },
    Vn = function (t) {
      return wu[Tu(typeof t == 'string' ? zn(t)[0] : t)];
    },
    Ed = function (t) {
      var e = Ii,
        i;
      if (t - js >= 0.05)
        for (Ad = js, js = t; e; )
          (i = e.g(e.t, e.p)),
            (i !== e.v1 || t - e.t1 > 0.2) &&
              ((e.v2 = e.v1), (e.v1 = i), (e.t2 = e.t1), (e.t1 = t)),
            (e = e._next);
    },
    vm = { deg: 360, rad: Math.PI * 2 },
    xu = function () {
      (De = Cd()),
        De &&
          ((zn = De.utils.toArray),
          (Sd = De.utils.getUnit),
          (Pd = De.core.getCache),
          (Ni = De.ticker),
          (bu = 1));
    },
    mm = function (t, e, i, n) {
      (this.t = t),
        (this.p = e),
        (this.g = t._gsap.get),
        (this.rCap = vm[i || Sd(this.g(t, e))]),
        (this.v1 = this.v2 = 0),
        (this.t1 = this.t2 = Ni.time),
        n && ((this._next = n), (n._prev = this));
    },
    Fi = (function () {
      function r(e, i) {
        bu || xu(),
          (this.target = zn(e)[0]),
          (wu[Tu(this.target)] = this),
          (this._props = {}),
          i && this.add(i);
      }
      r.register = function (i) {
        (De = i), xu();
      };
      var t = r.prototype;
      return (
        (t.get = function (i, n) {
          var s =
              this._props[i] ||
              console.warn('Not tracking ' + i + ' velocity.'),
            o,
            a,
            u;
          return (
            (o = parseFloat(n ? s.v1 : s.g(s.t, s.p))),
            (a = o - parseFloat(s.v2)),
            (u = s.rCap),
            u &&
              ((a = a % u), a !== a % (u / 2) && (a = a < 0 ? a + u : a - u)),
            gm(a / ((n ? s.t1 : Ni.time) - s.t2))
          );
        }),
        (t.getAll = function () {
          var i = {},
            n = this._props,
            s;
          for (s in n) i[s] = this.get(s);
          return i;
        }),
        (t.isTracking = function (i) {
          return i in this._props;
        }),
        (t.add = function (i, n) {
          i in this._props ||
            (Ii || (Ni.add(Ed), (js = Ad = Ni.time)),
            (Ii = this._props[i] = new mm(this.target, i, n, Ii)));
        }),
        (t.remove = function (i) {
          var n = this._props[i],
            s,
            o;
          n &&
            ((s = n._prev),
            (o = n._next),
            s && (s._next = o),
            o ? (o._prev = s) : Ii === n && (Ni.remove(Ed), (Ii = 0)),
            delete this._props[i]);
        }),
        (t.kill = function (i) {
          for (var n in this._props) this.remove(n);
          i || delete wu[Tu(this.target)];
        }),
        (r.track = function (i, n, s) {
          bu || xu();
          for (
            var o = [],
              a = zn(i),
              u = n.split(','),
              f = (s || '').split(','),
              c = a.length,
              d,
              p;
            c--;

          ) {
            for (d = Vn(a[c]) || new r(a[c]), p = u.length; p--; )
              d.add(u[p], f[p] || f[0]);
            o.push(d);
          }
          return o;
        }),
        (r.untrack = function (i, n) {
          var s = (n || '').split(',');
          zn(i).forEach(function (o) {
            var a = Vn(o);
            a &&
              (s.length
                ? s.forEach(function (u) {
                    return a.remove(u);
                  })
                : a.kill(1));
          });
        }),
        (r.isTracking = function (i, n) {
          var s = Vn(i);
          return s && s.isTracking(n);
        }),
        (r.getVelocity = function (i, n) {
          var s = Vn(i);
          return !s || !s.isTracking(n)
            ? console.warn('Not tracking velocity of ' + n)
            : s.get(n);
        }),
        r
      );
    })();
  Fi.getByTarget = Vn;
  Cd() && De.registerPlugin(Fi);
  var Mt,
    Md,
    Od,
    Id,
    Eu,
    Wn,
    Nd,
    Fd,
    Bd,
    Au,
    Vd,
    Hn,
    Ks = Fi.getByTarget,
    zd = function () {
      return (
        Mt ||
        (typeof window < 'u' && (Mt = window.gsap) && Mt.registerPlugin && Mt)
      );
    },
    ym = function (t) {
      return typeof t == 'string';
    },
    Xn = function (t) {
      return typeof t == 'number';
    },
    Sr = function (t) {
      return typeof t == 'object';
    },
    Su = function (t) {
      return typeof t == 'function';
    },
    xm = 1,
    bm = Array.isArray,
    wm = function (t) {
      return t;
    },
    Jr = 1e10,
    kd = 1 / Jr,
    Wd = 0.05,
    Tm = function (t) {
      return Math.round(t * 1e4) / 1e4;
    },
    Em = function (t, e, i) {
      for (var n in e) !(n in t) && n !== i && (t[n] = e[n]);
      return t;
    },
    Sm = function r(t) {
      var e = {},
        i,
        n;
      for (i in t) e[i] = Sr((n = t[i])) ? r(n) : n;
      return e;
    },
    Dd = function (t, e, i, n, s) {
      var o = e.length,
        a = 0,
        u = Jr,
        f,
        c,
        d,
        p;
      if (Sr(t)) {
        for (; o--; ) {
          (f = e[o]), (c = 0);
          for (d in t) (p = f[d] - t[d]), (c += p * p);
          c < u && ((a = o), (u = c));
        }
        if ((s || Jr) < Jr && s < Math.sqrt(u)) return t;
      } else
        for (; o--; )
          (f = e[o]),
            (c = f - t),
            c < 0 && (c = -c),
            c < u && f >= n && f <= i && ((a = o), (u = c));
      return e[a];
    },
    Hd = function (t, e, i, n, s, o) {
      if (t.end === 'auto') return t;
      var a = t.end,
        u,
        f;
      if (((i = isNaN(i) ? Jr : i), (n = isNaN(n) ? -Jr : n), Sr(e))) {
        if (
          ((u = e.calculated ? e : (Su(a) ? a(e) : Dd(e, a, i, n, o)) || e),
          !e.calculated)
        ) {
          for (f in u) e[f] = u[f];
          e.calculated = !0;
        }
        u = u[s];
      } else u = Su(a) ? a(e) : bm(a) ? Dd(e, a, i, n, o) : parseFloat(a);
      return (
        u > i ? (u = i) : u < n && (u = n),
        { max: u, min: u, unitFactor: t.unitFactor }
      );
    },
    Qs = function (t, e, i) {
      return isNaN(t[e]) ? i : +t[e];
    },
    Pu = function (t, e) {
      return (e * Wd * t) / Au;
    },
    Ld = function (t, e, i) {
      return Math.abs(((e - t) * Au) / i / Wd);
    },
    Xd = {
      resistance: 1,
      checkpoint: 1,
      preventOvershoot: 1,
      linkedProps: 1,
      radius: 1,
      duration: 1,
    },
    Yd = function (t, e, i, n) {
      if (e.linkedProps) {
        var s = e.linkedProps.split(','),
          o = {},
          a,
          u,
          f,
          c,
          d,
          p;
        for (a = 0; a < s.length; a++)
          (u = s[a]),
            (f = e[u]),
            f &&
              (Xn(f.velocity)
                ? (c = f.velocity)
                : ((d = d || Ks(t)), (c = d && d.isTracking(u) ? d.get(u) : 0)),
              (p = Math.abs(c / Qs(f, 'resistance', n))),
              (o[u] = parseFloat(i(t, u)) + Pu(c, p)));
        return o;
      }
    },
    Am = function (t, e, i, n, s, o) {
      if (
        (i === void 0 && (i = 10),
        n === void 0 && (n = 0.2),
        s === void 0 && (s = 1),
        o === void 0 && (o = 0),
        ym(t) && (t = Id(t)[0]),
        !t)
      )
        return 0;
      var a = 0,
        u = Jr,
        f = e.inertia || e,
        c = Bd(t).get,
        d = Qs(f, 'resistance', Wn.resistance),
        p,
        l,
        _,
        h,
        g,
        v,
        m,
        y,
        A,
        x;
      x = Yd(t, f, c, d);
      for (p in f)
        Xd[p] ||
          ((l = f[p]),
          Sr(l) ||
            ((y = y || Ks(t)),
            y && y.isTracking(p)
              ? (l = Xn(l) ? { velocity: l } : { velocity: y.get(p) })
              : ((h = +l || 0), (_ = Math.abs(h / d)))),
          Sr(l) &&
            (Xn(l.velocity)
              ? (h = l.velocity)
              : ((y = y || Ks(t)), (h = y && y.isTracking(p) ? y.get(p) : 0)),
            (_ = Vd(n, i, Math.abs(h / Qs(l, 'resistance', d)))),
            (g = parseFloat(c(t, p)) || 0),
            (v = g + Pu(h, _)),
            'end' in l &&
              ((l = Hd(l, x && p in x ? x : v, l.max, l.min, p, f.radius)),
              o && (Hn === e && (Hn = f = Sm(e)), (f[p] = Em(l, f[p], 'end')))),
            'max' in l && v > +l.max + kd
              ? ((A = l.unitFactor || Wn.unitFactors[p] || 1),
                (m =
                  (g > l.max && l.min !== l.max) || (h * A > -15 && h * A < 45)
                    ? n + (i - n) * 0.1
                    : Ld(g, l.max, h)),
                m + s < u && (u = m + s))
              : 'min' in l &&
                v < +l.min - kd &&
                ((A = l.unitFactor || Wn.unitFactors[p] || 1),
                (m =
                  (g < l.min && l.min !== l.max) || (h * A > -45 && h * A < 15)
                    ? n + (i - n) * 0.1
                    : Ld(g, l.min, h)),
                m + s < u && (u = m + s)),
            m > a && (a = m)),
          _ > a && (a = _));
      return a > u && (a = u), a > i ? i : a < n ? n : a;
    },
    Rd = function () {
      (Mt = zd()),
        Mt &&
          ((Od = Mt.parseEase),
          (Id = Mt.utils.toArray),
          (Nd = Mt.utils.getUnit),
          (Bd = Mt.core.getCache),
          (Vd = Mt.utils.clamp),
          (Eu = Od('power3')),
          (Au = Eu(0.05)),
          (Fd = Mt.core.PropTween),
          Mt.config({
            resistance: 100,
            unitFactors: {
              time: 1e3,
              totalTime: 1e3,
              progress: 1e3,
              totalProgress: 1e3,
            },
          }),
          (Wn = Mt.config()),
          Mt.registerPlugin(Fi),
          (Md = 1));
    },
    Yn = {
      version: '3.7.0',
      name: 'inertia',
      register: function (t) {
        (Mt = t), Rd();
      },
      init: function (t, e, i, n, s) {
        Md || Rd();
        var o = Ks(t);
        if (e === 'auto') {
          if (!o) {
            console.warn(
              'No inertia tracking on ' +
                t +
                '. InertiaPlugin.track(target) first.',
            );
            return;
          }
          e = o.getAll();
        }
        (this.target = t), (this.tween = i), (Hn = e);
        var a = t._gsap,
          u = a.get,
          f = e.duration,
          c = Sr(f),
          d = e.preventOvershoot || (c && f.overshoot === 0),
          p = Qs(e, 'resistance', Wn.resistance),
          l = Xn(f)
            ? f
            : Am(
                t,
                e,
                (c && f.max) || 10,
                (c && f.min) || 0.2,
                c && 'overshoot' in f ? +f.overshoot : d ? 0 : 1,
                !0,
              ),
          _,
          h,
          g,
          v,
          m,
          y,
          A,
          x,
          E;
        (e = Hn), (Hn = 0), (E = Yd(t, e, u, p));
        for (_ in e)
          Xd[_] ||
            ((h = e[_]),
            Su(h) && (h = h(n, t, s)),
            Xn(h)
              ? (m = h)
              : Sr(h) && !isNaN(h.velocity)
              ? (m = +h.velocity)
              : o && o.isTracking(_)
              ? (m = o.get(_))
              : console.warn(
                  'ERROR: No velocity was defined for ' + t + ' property: ' + _,
                ),
            (y = Pu(m, l)),
            (x = 0),
            (g = u(t, _)),
            (v = Nd(g)),
            (g = parseFloat(g)),
            Sr(h) &&
              ((A = g + y),
              'end' in h &&
                (h = Hd(h, E && _ in E ? E : A, h.max, h.min, _, e.radius)),
              'max' in h && +h.max < A
                ? d || h.preventOvershoot
                  ? (y = h.max - g)
                  : (x = h.max - g - y)
                : 'min' in h &&
                  +h.min > A &&
                  (d || h.preventOvershoot
                    ? (y = h.min - g)
                    : (x = h.min - g - y))),
            this._props.push(_),
            (this._pt = new Fd(this._pt, t, _, g, 0, wm, 0, a.set(t, _, this))),
            (this._pt.u = v || 0),
            (this._pt.c1 = y),
            (this._pt.c2 = x));
        return i.duration(l), xm;
      },
      render: function (t, e) {
        var i = e._pt;
        for (t = Eu(e.tween._time / e.tween._dur); i; )
          i.set(i.t, i.p, Tm(i.s + i.c1 * t + i.c2 * t * t) + i.u, i.d, t),
            (i = i._next);
      },
    };
  'track,untrack,isTracking,getVelocity,getByTarget'
    .split(',')
    .forEach(function (r) {
      return (Yn[r] = Fi[r]);
    });
  zd() && Mt.registerPlugin(Yn);
  at.registerPlugin(Er, Yn);
  function $d(r, t) {
    (r = at.utils.toArray(r)), (t = t || {});
    let e = t.onChange,
      i = 0,
      n = at.timeline({
        repeat: t.repeat,
        onUpdate:
          e &&
          function () {
            let P = n.closestIndex();
            i !== P && ((i = P), e(r[P], P));
          },
        paused: t.paused,
        defaults: { ease: 'none' },
        onReverseComplete: () => n.totalTime(n.rawTime() + n.duration() * 100),
      }),
      s = r.length,
      o = r[0].offsetLeft,
      a = [],
      u = [],
      f = [],
      c = [],
      d = 0,
      p = !1,
      l = t.center,
      _ = (t.speed || 1) * 100,
      h = t.snap === !1 ? (P) => P : at.utils.snap(t.snap || 1),
      g = 0,
      v =
        l === !0 ? r[0].parentNode : at.utils.toArray(l)[0] || r[0].parentNode,
      m,
      y = () =>
        r[s - 1].offsetLeft +
        (c[s - 1] / 100) * u[s - 1] -
        o +
        f[0] +
        r[s - 1].offsetWidth * at.getProperty(r[s - 1], 'scaleX') +
        (parseFloat(t.paddingRight) || 0),
      A = () => {
        let P = v.getBoundingClientRect(),
          T;
        r.forEach((D, R) => {
          (u[R] = parseFloat(at.getProperty(D, 'width', 'px'))),
            (c[R] = h(
              (parseFloat(at.getProperty(D, 'x', 'px')) / u[R]) * 100 +
                at.getProperty(D, 'xPercent'),
            )),
            (T = D.getBoundingClientRect()),
            (f[R] = T.left - (R ? P.right : P.left)),
            (P = T);
        }),
          at.set(r, { xPercent: (D) => c[D] }),
          (m = y());
      },
      x,
      E = () => {
        (g = l ? (n.duration() * (v.offsetWidth / 2)) / m : 0),
          l &&
            a.forEach((P, T) => {
              a[T] = x(
                n.labels['label' + T] + (n.duration() * u[T]) / 2 / m - g,
              );
            });
      },
      w = (P, T, D) => {
        let R = P.length,
          W = 1e10,
          Y = 0,
          z;
        for (; R--; )
          (z = Math.abs(P[R] - T)),
            z > D / 2 && (z = D - z),
            z < W && ((W = z), (Y = R));
        return Y;
      },
      S = () => {
        let P, T, D, R, W;
        for (n.clear(), P = 0; P < s; P++)
          (T = r[P]),
            (D = (c[P] / 100) * u[P]),
            (R = T.offsetLeft + D - o + f[0]),
            (W = R + u[P] * at.getProperty(T, 'scaleX')),
            n
              .to(
                T,
                { xPercent: h(((D - W) / u[P]) * 100), duration: W / _ },
                0,
              )
              .fromTo(
                T,
                { xPercent: h(((D - W + m) / u[P]) * 100) },
                {
                  xPercent: c[P],
                  duration: (D - W + m - D) / _,
                  immediateRender: !1,
                },
                W / _,
              )
              .add('label' + P, R / _),
            (a[P] = R / _);
        x = at.utils.wrap(0, n.duration());
      },
      k = (P) => {
        let T = n.progress();
        n.progress(0, !0),
          A(),
          P && S(),
          E(),
          P && n.draggable ? n.time(a[d], !0) : n.progress(T, !0);
      },
      M;
    at.set(r, { x: 0 }),
      A(),
      S(),
      E(),
      window.addEventListener('resize', () => k(!0));
    function O(P, T) {
      (T = T || {}), Math.abs(P - d) > s / 2 && (P += P > d ? -s : s);
      let D = at.utils.wrap(0, s, P),
        R = a[D];
      return (
        R > n.time() != P > d &&
          P !== d &&
          (R += n.duration() * (P > d ? 1 : -1)),
        (R < 0 || R > n.duration()) && (T.modifiers = { time: x }),
        (d = D),
        (T.overwrite = !0),
        at.killTweensOf(M),
        T.duration === 0 ? n.time(x(R)) : n.tweenTo(R, T)
      );
    }
    if (
      ((n.toIndex = (P, T) => O(P, T)),
      (n.closestIndex = (P) => {
        let T = w(a, n.time(), n.duration());
        return P && ((d = T), (p = !1)), T;
      }),
      (n.current = () => (p ? n.closestIndex(!0) : d)),
      (n.next = (P) => O(n.current() + 1, P)),
      (n.previous = (P) => O(n.current() - 1, P)),
      (n.times = a),
      n.progress(1, !0).progress(0, !0),
      t.reversed && (n.vars.onReverseComplete(), n.reverse()),
      t.draggable && typeof Er == 'function')
    ) {
      M = document.createElement('div');
      let P = at.utils.wrap(0, 1),
        T,
        D,
        R,
        W,
        Y,
        z,
        $,
        B = () => n.progress(P(D + (R.startX - R.x) * T)),
        N = () => n.closestIndex(!0);
      typeof Yn > 'u' &&
        console.warn(
          'InertiaPlugin required for momentum-based scrolling and snapping. https://greensock.com/club',
        ),
        (R = Er.create(M, {
          trigger: r[0].parentNode,
          type: 'x',
          onPressInit() {
            let U = this.x;
            at.killTweensOf(n),
              ($ = !n.paused()),
              n.pause(),
              (D = n.progress()),
              k(),
              (T = 1 / m),
              (z = D / -T - U),
              at.set(M, { x: D / -T });
          },
          onDrag: B,
          onThrowUpdate: B,
          overshootTolerance: 0,
          inertia: !0,
          snap(U) {
            if (Math.abs(D / -T - this.x) < 10) return Y + z;
            let j = -(U * T) * n.duration(),
              K = x(j),
              Ft = a[w(a, K, n.duration())],
              I = Ft - K;
            return (
              Math.abs(I) > n.duration() / 2 &&
                (I += I < 0 ? n.duration() : -n.duration()),
              (Y = (j + I) / n.duration() / -T),
              Y
            );
          },
          onRelease() {
            N(), R.isThrowing && (p = !0);
          },
          onThrowComplete: () => {
            N(), $ && n.play();
          },
        })[0]),
        (n.draggable = R);
    }
    return n.closestIndex(!0), (i = d), e && e(r[d], d), n;
  }
  window.logos = function () {
    let r;
    return {
      init() {
        let t = at.utils.toArray(this.$el.querySelectorAll('.logo')),
          e = this.$el.getAttribute('data-reverse'),
          i = this.$el.getAttribute('data-speed');
        e === 'true' ? (e = !0) : (e = !1),
          (r = $d(t, {
            paused: !1,
            draggable: !1,
            speed: i,
            repeat: -1,
            reversed: e,
          }));
      },
      over() {
        r.pause();
      },
      out() {
        r.play();
      },
      resetPosition(t, e) {
        at.set(t, { x: -e });
      },
    };
  };
  window.hero = function () {
    return {
      init() {
        var r = window.innerHeight * 0.75;
        this.$el.style.height = r + 'px';
      },
    };
  };
  window.Alpine = fs;
  fs.plugin(af);
  fs.start();
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
