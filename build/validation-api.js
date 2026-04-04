(() => {
	'use strict';
	var e = {
			d: (t, r) => {
				for (var n in r)
					e.o(r, n) &&
						!e.o(t, n) &&
						Object.defineProperty(t, n, { enumerable: !0, get: r[n] });
			},
			o: (e, t) => Object.prototype.hasOwnProperty.call(e, t),
			r: e => {
				('undefined' != typeof Symbol &&
					Symbol.toStringTag &&
					Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
					Object.defineProperty(e, '__esModule', { value: !0 }));
			},
		},
		t = {};
	(e.r(t),
		e.d(t, {
			getBlockValidation: () => re,
			getInvalidBlocks: () => Y,
			getInvalidEditorChecks: () => te,
			getInvalidMeta: () => ee,
			hasErrors: () => ne,
			hasWarnings: () => oe,
		}));
	var r = {};
	(e.r(r),
		e.d(r, {
			clearBlockValidation: () => ue,
			setBlockValidation: () => ce,
			setInvalidBlocks: () => ie,
			setInvalidEditorChecks: () => le,
			setInvalidMeta: () => ae,
		}));
	const n = window.wp.plugins,
		o = window.wp.data,
		i = window.wp.element;
	function a(e) {
		return (
			(a =
				'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
					? function (e) {
							return typeof e;
						}
					: function (e) {
							return e &&
								'function' == typeof Symbol &&
								e.constructor === Symbol &&
								e !== Symbol.prototype
								? 'symbol'
								: typeof e;
						}),
			a(e)
		);
	}
	function l(e, t) {
		var r = Object.keys(e);
		if (Object.getOwnPropertySymbols) {
			var n = Object.getOwnPropertySymbols(e);
			(t &&
				(n = n.filter(function (t) {
					return Object.getOwnPropertyDescriptor(e, t).enumerable;
				})),
				r.push.apply(r, n));
		}
		return r;
	}
	function c(e) {
		for (var t = 1; t < arguments.length; t++) {
			var r = null != arguments[t] ? arguments[t] : {};
			t % 2
				? l(Object(r), !0).forEach(function (t) {
						u(e, t, r[t]);
					})
				: Object.getOwnPropertyDescriptors
					? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
					: l(Object(r)).forEach(function (t) {
							Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
						});
		}
		return e;
	}
	function u(e, t, r) {
		return (
			(t = (function (e) {
				var t = (function (e) {
					if ('object' != a(e) || !e) return e;
					var t = e[Symbol.toPrimitive];
					if (void 0 !== t) {
						var r = t.call(e, 'string');
						if ('object' != a(r)) return r;
						throw new TypeError('@@toPrimitive must return a primitive value.');
					}
					return String(e);
				})(e);
				return 'symbol' == a(t) ? t : t + '';
			})(t)) in e
				? Object.defineProperty(e, t, {
						value: r,
						enumerable: !0,
						configurable: !0,
						writable: !0,
					})
				: (e[t] = r),
			e
		);
	}
	var s = function (e, t) {
			return e.filter(function (e) {
				return e.type === t;
			});
		},
		f = function (e) {
			return s(e, 'error');
		},
		d = function (e) {
			return s(e, 'warning');
		},
		m = function (e) {
			return e.some(function (e) {
				return 'error' === e.type;
			});
		},
		p = function (e) {
			return e.some(function (e) {
				return 'warning' === e.type;
			});
		},
		v = function (e) {
			return null != e && !1 !== e.enabled;
		},
		y = function (e, t) {
			var r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {},
				n = e.message || '',
				o = e.error_msg || n,
				i = e.warning_msg || e.error_msg || n,
				a = e.level || 'error';
			return c(
				{
					check: t,
					checkName: t,
					type: a,
					priority: 'error' === a ? 1 : 'warning' === a ? 2 : 3,
					message: n,
					errorMsg: o,
					warningMsg: i,
					error_msg: o,
					warning_msg: i,
				},
				r
			);
		},
		b = function (e) {
			var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
			return c({ isValid: 0 === e.length, issues: e, hasErrors: m(e), hasWarnings: p(e) }, t);
		};
	const g = window.wp.hooks;
	function h(e, t) {
		(null == t || t > e.length) && (t = e.length);
		for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
		return n;
	}
	var w,
		O = function (e) {
			var t,
				r = e.name,
				n = e.attributes,
				o = [],
				i =
					(null === (t = window.ValidationAPI) ||
					void 0 === t ||
					null === (t = t.validationRules) ||
					void 0 === t
						? void 0
						: t[r]) || {};
			if (0 === Object.keys(i).length)
				return { isValid: !0, issues: [], mode: 'none', clientId: e.clientId, name: r };
			Object.entries(i).forEach(function (t) {
				var i,
					a,
					l =
						((a = 2),
						(function (e) {
							if (Array.isArray(e)) return e;
						})((i = t)) ||
							(function (e, t) {
								var r =
									null == e
										? null
										: ('undefined' != typeof Symbol && e[Symbol.iterator]) ||
											e['@@iterator'];
								if (null != r) {
									var n,
										o,
										i,
										a,
										l = [],
										c = !0,
										u = !1;
									try {
										if (((i = (r = r.call(e)).next), 0 === t)) {
											if (Object(r) !== r) return;
											c = !1;
										} else
											for (
												;
												!(c = (n = i.call(r)).done) &&
												(l.push(n.value), l.length !== t);
												c = !0
											);
									} catch (e) {
										((u = !0), (o = e));
									} finally {
										try {
											if (
												!c &&
												null != r.return &&
												((a = r.return()), Object(a) !== a)
											)
												return;
										} finally {
											if (u) throw o;
										}
									}
									return l;
								}
							})(i, a) ||
							(function (e, t) {
								if (e) {
									if ('string' == typeof e) return h(e, t);
									var r = {}.toString.call(e).slice(8, -1);
									return (
										'Object' === r && e.constructor && (r = e.constructor.name),
										'Map' === r || 'Set' === r
											? Array.from(e)
											: 'Arguments' === r ||
												  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
												? h(e, t)
												: void 0
									);
								}
							})(i, a) ||
							(function () {
								throw new TypeError(
									'Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
								);
							})()),
					c = l[0],
					u = l[1];
				if (v(u)) {
					var s = !0;
					('function' == typeof u.validator && (s = u.validator(n, e)),
						(s = (0, g.applyFilters)('validation_api_validate_block', s, r, n, c, e)) ||
							o.push(y(u, c)));
				}
			});
			var a = 'none';
			return (
				m(o) ? (a = 'error') : p(o) && (a = 'warning'),
				b(o, { mode: a, clientId: e.clientId, name: r })
			);
		};
	function E(e, t) {
		if (e) {
			if ('string' == typeof e) return j(e, t);
			var r = {}.toString.call(e).slice(8, -1);
			return (
				'Object' === r && e.constructor && (r = e.constructor.name),
				'Map' === r || 'Set' === r
					? Array.from(e)
					: 'Arguments' === r || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
						? j(e, t)
						: void 0
			);
		}
	}
	function j(e, t) {
		(null == t || t > e.length) && (t = e.length);
		for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
		return n;
	}
	function S(e) {
		return e.flatMap(function (e) {
			var t,
				r = O(e),
				n = [];
			return (
				r.isValid || n.push(r),
				e.innerBlocks && e.innerBlocks.length > 0
					? [].concat(
							n,
							(function (e) {
								if (Array.isArray(e)) return j(e);
							})((t = S(e.innerBlocks))) ||
								(function (e) {
									if (
										('undefined' != typeof Symbol &&
											null != e[Symbol.iterator]) ||
										null != e['@@iterator']
									)
										return Array.from(e);
								})(t) ||
								E(t) ||
								(function () {
									throw new TypeError(
										'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
									);
								})()
						)
					: n
			);
		});
	}
	function k(e) {
		var t,
			r = (function (e) {
				var t = ('undefined' != typeof Symbol && e[Symbol.iterator]) || e['@@iterator'];
				if (!t) {
					if (Array.isArray(e) || (t = E(e))) {
						t && (e = t);
						var _n = 0,
							r = function () {};
						return {
							s: r,
							n: function () {
								return _n >= e.length ? { done: !0 } : { done: !1, value: e[_n++] };
							},
							e: function (e) {
								throw e;
							},
							f: r,
						};
					}
					throw new TypeError(
						'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
					);
				}
				var n,
					o = !0,
					i = !1;
				return {
					s: function () {
						t = t.call(e);
					},
					n: function () {
						var e = t.next();
						return ((o = e.done), e);
					},
					e: function (e) {
						((i = !0), (n = e));
					},
					f: function () {
						try {
							o || null == t.return || t.return();
						} finally {
							if (i) throw n;
						}
					},
				};
			})(e);
		try {
			for (r.s(); !(t = r.n()).done; ) {
				var n = t.value;
				if ('core/post-content' === n.name) return n;
				if (n.innerBlocks && n.innerBlocks.length > 0) {
					var o = k(n.innerBlocks);
					if (o) return o;
				}
			}
		} catch (e) {
			r.e(e);
		} finally {
			r.f();
		}
		return null;
	}
	function P() {
		var e,
			t =
				(null === (e = window.ValidationAPI) || void 0 === e ? void 0 : e.editorContext) ||
				'none',
			r = 'post-editor' === t || 'post-editor-template' === t;
		return S(
			(0, o.useSelect)(
				function (e) {
					var t = e('core/block-editor'),
						n = t.getBlocks();
					if (r) {
						var o = k(n);
						if (o) {
							var i = t.getBlock(o.clientId),
								a = t
									.getBlockOrder(o.clientId)
									.map(function (e) {
										var r = t.getBlock(e);
										return (t.getBlockOrder(e), r);
									})
									.filter(Boolean);
							return a.length > 0 ? a : (null == i ? void 0 : i.innerBlocks) || [];
						}
						return n;
					}
					return n;
				},
				[r]
			)
		);
	}
	function R(e, t) {
		return (
			(function (e) {
				if (Array.isArray(e)) return e;
			})(e) ||
			(function (e, t) {
				var r =
					null == e
						? null
						: ('undefined' != typeof Symbol && e[Symbol.iterator]) || e['@@iterator'];
				if (null != r) {
					var n,
						o,
						i,
						a,
						l = [],
						c = !0,
						u = !1;
					try {
						if (((i = (r = r.call(e)).next), 0 === t)) {
							if (Object(r) !== r) return;
							c = !1;
						} else
							for (
								;
								!(c = (n = i.call(r)).done) && (l.push(n.value), l.length !== t);
								c = !0
							);
					} catch (e) {
						((u = !0), (o = e));
					} finally {
						try {
							if (!c && null != r.return && ((a = r.return()), Object(a) !== a))
								return;
						} finally {
							if (u) throw o;
						}
					}
					return l;
				}
			})(e, t) ||
			(function (e, t) {
				if (e) {
					if ('string' == typeof e) return I(e, t);
					var r = {}.toString.call(e).slice(8, -1);
					return (
						'Object' === r && e.constructor && (r = e.constructor.name),
						'Map' === r || 'Set' === r
							? Array.from(e)
							: 'Arguments' === r ||
								  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
								? I(e, t)
								: void 0
					);
				}
			})(e, t) ||
			(function () {
				throw new TypeError(
					'Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
				);
			})()
		);
	}
	function I(e, t) {
		(null == t || t > e.length) && (t = e.length);
		for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
		return n;
	}
	var _,
		A =
			(null === (w = window.ValidationAPI) || void 0 === w
				? void 0
				: w.metaValidationRules) || {};
	function N(e, t, r, n) {
		var o,
			i =
				null === (o = A[e]) || void 0 === o || null === (o = o[t]) || void 0 === o
					? void 0
					: o[n];
		if (!v(i)) return !0;
		var a = !0;
		return (
			'required' === n && (a = '' !== r && null != r),
			(0, g.applyFilters)('validation_api_validate_meta', a, r, e, t, n)
		);
	}
	function C(e, t, r) {
		for (
			var n = (A[e] || {})[t] || {}, o = [], i = 0, a = Object.entries(n);
			i < a.length;
			i++
		) {
			var l = R(a[i], 2),
				c = l[0],
				u = l[1];
			if (v(u) && !N(e, t, r, c)) {
				var s = y(u, c, { metaKey: t });
				o.push(s);
			}
		}
		return b(o);
	}
	function B(e) {
		return (
			(B =
				'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
					? function (e) {
							return typeof e;
						}
					: function (e) {
							return e &&
								'function' == typeof Symbol &&
								e.constructor === Symbol &&
								e !== Symbol.prototype
								? 'symbol'
								: typeof e;
						}),
			B(e)
		);
	}
	function V(e, t) {
		var r = Object.keys(e);
		if (Object.getOwnPropertySymbols) {
			var n = Object.getOwnPropertySymbols(e);
			(t &&
				(n = n.filter(function (t) {
					return Object.getOwnPropertyDescriptor(e, t).enumerable;
				})),
				r.push.apply(r, n));
		}
		return r;
	}
	function L(e) {
		for (var t = 1; t < arguments.length; t++) {
			var r = null != arguments[t] ? arguments[t] : {};
			t % 2
				? V(Object(r), !0).forEach(function (t) {
						T(e, t, r[t]);
					})
				: Object.getOwnPropertyDescriptors
					? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
					: V(Object(r)).forEach(function (t) {
							Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
						});
		}
		return e;
	}
	function T(e, t, r) {
		return (
			(t = (function (e) {
				var t = (function (e) {
					if ('object' != B(e) || !e) return e;
					var t = e[Symbol.toPrimitive];
					if (void 0 !== t) {
						var r = t.call(e, 'string');
						if ('object' != B(r)) return r;
						throw new TypeError('@@toPrimitive must return a primitive value.');
					}
					return String(e);
				})(e);
				return 'symbol' == B(t) ? t : t + '';
			})(t)) in e
				? Object.defineProperty(e, t, {
						value: r,
						enumerable: !0,
						configurable: !0,
						writable: !0,
					})
				: (e[t] = r),
			e
		);
	}
	function D(e, t) {
		return (
			(function (e) {
				if (Array.isArray(e)) return e;
			})(e) ||
			(function (e, t) {
				var r =
					null == e
						? null
						: ('undefined' != typeof Symbol && e[Symbol.iterator]) || e['@@iterator'];
				if (null != r) {
					var n,
						o,
						i,
						a,
						l = [],
						c = !0,
						u = !1;
					try {
						if (((i = (r = r.call(e)).next), 0 === t)) {
							if (Object(r) !== r) return;
							c = !1;
						} else
							for (
								;
								!(c = (n = i.call(r)).done) && (l.push(n.value), l.length !== t);
								c = !0
							);
					} catch (e) {
						((u = !0), (o = e));
					} finally {
						try {
							if (!c && null != r.return && ((a = r.return()), Object(a) !== a))
								return;
						} finally {
							if (u) throw o;
						}
					}
					return l;
				}
			})(e, t) ||
			(function (e, t) {
				if (e) {
					if ('string' == typeof e) return M(e, t);
					var r = {}.toString.call(e).slice(8, -1);
					return (
						'Object' === r && e.constructor && (r = e.constructor.name),
						'Map' === r || 'Set' === r
							? Array.from(e)
							: 'Arguments' === r ||
								  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
								? M(e, t)
								: void 0
					);
				}
			})(e, t) ||
			(function () {
				throw new TypeError(
					'Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
				);
			})()
		);
	}
	function M(e, t) {
		(null == t || t > e.length) && (t = e.length);
		for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
		return n;
	}
	var x =
		(null === (_ = window.ValidationAPI) || void 0 === _ ? void 0 : _.editorValidationRules) ||
		{};
	var F = 'validation-api',
		K = 'SET_INVALID_BLOCKS',
		W = 'SET_INVALID_META',
		U = 'SET_INVALID_EDITOR_CHECKS',
		$ = 'SET_BLOCK_VALIDATION',
		q = 'CLEAR_BLOCK_VALIDATION',
		H = { blocks: [], meta: [], editor: [], blockValidation: {} },
		Z = Object.freeze({ mode: 'none', issues: [] });
	function z(e) {
		return (
			(z =
				'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
					? function (e) {
							return typeof e;
						}
					: function (e) {
							return e &&
								'function' == typeof Symbol &&
								e.constructor === Symbol &&
								e !== Symbol.prototype
								? 'symbol'
								: typeof e;
						}),
			z(e)
		);
	}
	function G(e, t) {
		var r = Object.keys(e);
		if (Object.getOwnPropertySymbols) {
			var n = Object.getOwnPropertySymbols(e);
			(t &&
				(n = n.filter(function (t) {
					return Object.getOwnPropertyDescriptor(e, t).enumerable;
				})),
				r.push.apply(r, n));
		}
		return r;
	}
	function J(e) {
		for (var t = 1; t < arguments.length; t++) {
			var r = null != arguments[t] ? arguments[t] : {};
			t % 2
				? G(Object(r), !0).forEach(function (t) {
						Q(e, t, r[t]);
					})
				: Object.getOwnPropertyDescriptors
					? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
					: G(Object(r)).forEach(function (t) {
							Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
						});
		}
		return e;
	}
	function Q(e, t, r) {
		return (
			(t = X(t)) in e
				? Object.defineProperty(e, t, {
						value: r,
						enumerable: !0,
						configurable: !0,
						writable: !0,
					})
				: (e[t] = r),
			e
		);
	}
	function X(e) {
		var t = (function (e) {
			if ('object' != z(e) || !e) return e;
			var t = e[Symbol.toPrimitive];
			if (void 0 !== t) {
				var r = t.call(e, 'string');
				if ('object' != z(r)) return r;
				throw new TypeError('@@toPrimitive must return a primitive value.');
			}
			return String(e);
		})(e);
		return 'symbol' == z(t) ? t : t + '';
	}
	function Y(e) {
		return e.blocks;
	}
	function ee(e) {
		return e.meta;
	}
	function te(e) {
		return e.editor;
	}
	function re(e, t) {
		return e.blockValidation[t] || Z;
	}
	function ne(e) {
		var t = e.blocks.some(function (e) {
				return 'error' === e.mode;
			}),
			r = e.meta.some(function (e) {
				return e.hasErrors;
			}),
			n = e.editor.some(function (e) {
				return 'error' === e.type;
			});
		return t || r || n;
	}
	function oe(e) {
		if (ne(e)) return !1;
		var t = e.blocks.some(function (e) {
				return 'warning' === e.mode;
			}),
			r = e.meta.some(function (e) {
				return e.hasWarnings && !e.hasErrors;
			}),
			n = e.editor.some(function (e) {
				return 'warning' === e.type;
			});
		return t || r || n;
	}
	function ie(e) {
		return { type: K, results: e };
	}
	function ae(e) {
		return { type: W, results: e };
	}
	function le(e) {
		return { type: U, issues: e };
	}
	function ce(e, t) {
		return { type: $, clientId: e, result: t };
	}
	function ue(e) {
		return { type: q, clientId: e };
	}
	var se = (0, o.createReduxStore)(F, {
		reducer: function () {
			var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : H,
				t = arguments.length > 1 ? arguments[1] : void 0;
			switch (t.type) {
				case K:
					return J(J({}, e), {}, { blocks: t.results });
				case W:
					return J(J({}, e), {}, { meta: t.results });
				case U:
					return J(J({}, e), {}, { editor: t.issues });
				case $:
					return J(
						J({}, e),
						{},
						{
							blockValidation: J(
								J({}, e.blockValidation),
								{},
								Q({}, t.clientId, t.result)
							),
						}
					);
				case q:
					var r = e.blockValidation,
						n = t.clientId,
						o =
							(r[n],
							(function (e, t) {
								if (null == e) return {};
								var r,
									n,
									o = (function (e, t) {
										if (null == e) return {};
										var r = {};
										for (var n in e)
											if ({}.hasOwnProperty.call(e, n)) {
												if (-1 !== t.indexOf(n)) continue;
												r[n] = e[n];
											}
										return r;
									})(e, t);
								if (Object.getOwnPropertySymbols) {
									var i = Object.getOwnPropertySymbols(e);
									for (n = 0; n < i.length; n++)
										((r = i[n]),
											-1 === t.indexOf(r) &&
												{}.propertyIsEnumerable.call(e, r) &&
												(o[r] = e[r]));
								}
								return o;
							})(r, [n].map(X)));
					return J(J({}, e), {}, { blockValidation: o });
				default:
					return e;
			}
		},
		selectors: t,
		actions: r,
	});
	function fe() {
		var e,
			t,
			r,
			n = P(),
			a = (function () {
				for (
					var e,
						t = (0, o.useSelect)(function (e) {
							var t = e('core/editor');
							return {
								postType: t.getCurrentPostType(),
								meta: t.getEditedPostAttribute('meta'),
							};
						}, []),
						r = t.postType,
						n = t.meta,
						i =
							((null === (e = window.ValidationAPI) || void 0 === e
								? void 0
								: e.metaValidationRules) || {})[r] || {},
						a = [],
						l = 0,
						c = Object.keys(i);
					l < c.length;
					l++
				) {
					var u = c[l],
						s = C(r, u, null == n ? void 0 : n[u]);
					s.isValid || a.push(L(L({}, s), {}, { metaKey: u }));
				}
				return a;
			})(),
			l =
				((e = (0, o.useSelect)(function (e) {
					var t = e('core/editor'),
						r = e('core/block-editor');
					return {
						postType: t.getCurrentPostType(),
						blocks: r.getBlocks(),
						title: t.getEditedPostAttribute('title'),
					};
				}, [])),
				(t = e.blocks),
				(r = e.postType) && t
					? (function (e, t) {
							for (
								var r = x[e] || {}, n = [], o = 0, i = Object.entries(r);
								o < i.length;
								o++
							) {
								var a = D(i[o], 2),
									l = a[0],
									c = a[1];
								if (
									v(c) &&
									!(0, g.applyFilters)(
										'validation_api_validate_editor',
										!0,
										t,
										e,
										l,
										c
									)
								) {
									var u = y(c, l);
									n.push(u);
								}
							}
							return (
								n.sort(function (e, t) {
									return e.priority - t.priority;
								}),
								b(n)
							);
						})(r, t).issues
					: []),
			c = (0, o.useDispatch)(F),
			u = c.setInvalidBlocks,
			s = c.setInvalidMeta,
			f = c.setInvalidEditorChecks;
		return (
			(0, i.useEffect)(
				function () {
					u(n);
				},
				[n, u]
			),
			(0, i.useEffect)(
				function () {
					s(a);
				},
				[a, s]
			),
			(0, i.useEffect)(
				function () {
					f(l);
				},
				[l, f]
			),
			null
		);
	}
	function de() {
		var e,
			t =
				(null === (e = window.ValidationAPI) || void 0 === e ? void 0 : e.editorContext) ||
				'none',
			r = 'post-editor' === t || 'post-editor-template' === t,
			n = 'core/editor',
			a = (0, o.useDispatch)(n),
			l = wp.data && wp.data.select && wp.data.select(n),
			c = (0, o.useSelect)(function (e) {
				var t = e(F);
				return {
					invalidBlocks: t.getInvalidBlocks(),
					invalidMeta: t.getInvalidMeta(),
					invalidEditorChecks: t.getInvalidEditorChecks(),
				};
			}, []),
			u = c.invalidBlocks,
			s = c.invalidMeta,
			f = c.invalidEditorChecks,
			d = a || {},
			v = d.lockPostSaving,
			y = d.unlockPostSaving,
			b = d.lockPostAutosaving,
			g = d.unlockPostAutosaving,
			h = d.disablePublishSidebar,
			w = d.enablePublishSidebar;
		return (
			(0, i.useEffect)(
				function () {
					if (r && 'none' !== t && l && v && y) {
						var e = u.some(function (e) {
								return 'error' === e.mode;
							}),
							n = s.some(function (e) {
								return e.hasErrors;
							}),
							o = m(f);
						e || n || o
							? (v('validation-api'), b && b('validation-api'), h && h())
							: (y('validation-api'), g && g('validation-api'), w && w());
					}
				},
				[u, s, f, v, y, b, g, h, w, r, t, l]
			),
			(0, i.useEffect)(
				function () {
					if (r && 'none' !== t && document.body) {
						var e = u.some(function (e) {
								return 'error' === e.mode;
							}),
							n = u.some(function (e) {
								return 'warning' === e.mode;
							}),
							o = s.some(function (e) {
								return e.hasErrors;
							}),
							i = s.some(function (e) {
								return e.hasWarnings && !e.hasErrors;
							}),
							a = m(f),
							l = p(f),
							c = e || o || a,
							d = !c && (n || i || l);
						return (
							c
								? (document.body.classList.add('has-validation-errors'),
									document.body.classList.remove('has-validation-warnings'))
								: d
									? (document.body.classList.add('has-validation-warnings'),
										document.body.classList.remove('has-validation-errors'))
									: document.body.classList.remove(
											'has-validation-errors',
											'has-validation-warnings'
										),
							function () {
								document.body &&
									document.body.classList.remove(
										'has-validation-errors',
										'has-validation-warnings'
									);
							}
						);
					}
				},
				[u, s, f, r, t]
			),
			null
		);
	}
	(0, o.register)(se);
	const me = window.wp.editor,
		pe = window.wp.components,
		ve = window.wp.i18n,
		ye = window.wp.blocks;
	function be(e) {
		var t = e.fill,
			r = void 0 === t ? 'currentColor' : t;
		return React.createElement(
			'svg',
			{
				viewBox: '-0.81 -0.81 25.62 25.62',
				xmlns: 'http://www.w3.org/2000/svg',
				className: 'validation-api-sidebar-icon',
			},
			React.createElement('path', {
				fill: r,
				d: 'M21.77205 2.96949V9.22968L24 11.49539L21.41025 14.12373C20.18445 17.59455 17.82645 19.4559 16.5927 20.1609C15.7053 20.66805 13.45103 22.0566 12.42537 22.69365L12 22.9578L11.57463 22.69365C10.54898 22.0566 8.2947 20.66805 7.4073 20.1609C6.17361 19.4559 3.81545 17.59455 2.58966 14.12373L0 11.49539L2.22791 9.22968V2.96949L10.16957 0L10.73433 1.51038L3.84047 4.08809V9.88976L2.26275 11.49425L3.99707 13.25445L4.05633 13.4307C5.10714 16.5531 7.20452 18.1878 8.2074 18.7608C9.01367 19.2216 10.87026 20.36115 12 21.06C13.12974 20.36115 14.98634 19.2216 15.7926 18.7608C16.7955 18.1878 18.8928 16.5531 19.9437 13.4307L20.00295 13.25445L21.73725 11.49425L20.15955 9.88976V4.08809L13.26567 1.51038L13.83044 0L21.77205 2.96949Z',
			}),
			React.createElement('path', {
				fill: r,
				d: 'M16.95615 8.74307L10.64529 15.05385L7.23707 11.64567L8.37732 10.50542L10.64529 12.77339L15.81585 7.60281L16.95615 8.74307Z',
			})
		);
	}
	function ge(e, t) {
		var r = new Map();
		return (
			e.forEach(function (e) {
				('error' === t ? f(e.issues || []) : d(e.issues || [])).forEach(function (n) {
					var o,
						i,
						a = 'error' === t ? n.error_msg : n.warning_msg || n.error_msg,
						l = ''.concat(e.name, '|').concat(a);
					(r.has(l) ||
						r.set(l, {
							blockName:
								((o = e.name),
								(i = (0, ye.getBlockType)(o)),
								i && i.title
									? i.title
									: (o.split('/')[1] || o)
											.split(/[-_]/)
											.map(function (e) {
												return e.charAt(0).toUpperCase() + e.slice(1);
											})
											.join(' ')),
							blockType: e.name,
							message: a,
							clientIds: [],
						}),
						e.clientId &&
							!r.get(l).clientIds.includes(e.clientId) &&
							r.get(l).clientIds.push(e.clientId));
				});
			}),
			Array.from(r.values())
		);
	}
	function he(e, t) {
		var r = new Map();
		return (
			e.forEach(function (e) {
				('error' === t ? f(e.issues || []) : d(e.issues || [])).forEach(function (n) {
					var o = 'error' === t ? n.error_msg : n.warning_msg || n.error_msg,
						i = ''.concat(e.metaKey, '|').concat(o);
					r.has(i) || r.set(i, { metaKey: e.metaKey, message: o });
				});
			}),
			Array.from(r.values())
		);
	}
	function we(e, t) {
		var r = new Map();
		return (
			e.forEach(function (e) {
				var n =
						'error' === t
							? e.errorMsg || e.error_msg
							: e.warningMsg || e.warning_msg || e.errorMsg || e.error_msg,
					o = n;
				r.has(o) || r.set(o, { message: n, description: e.description });
			}),
			Array.from(r.values())
		);
	}
	function Oe() {
		var e = (0, o.useSelect)(function (e) {
				var t = e(F);
				return {
					invalidBlocks: t.getInvalidBlocks(),
					invalidMeta: t.getInvalidMeta(),
					invalidEditorChecks: t.getInvalidEditorChecks(),
				};
			}, []),
			t = e.invalidBlocks,
			r = e.invalidMeta,
			n = e.invalidEditorChecks,
			a = (0, o.useDispatch)('core/block-editor').selectBlock,
			l = (0, i.useRef)(null),
			c = s(n, 'error'),
			u = s(n, 'warning'),
			f = ge(t, 'error'),
			d = ge(t, 'warning'),
			m = he(r, 'error'),
			p = he(r, 'warning'),
			v = we(c, 'error'),
			y = we(u, 'warning'),
			b = f.length + m.length + v.length,
			g = d.length + p.length + y.length,
			h = 'currentColor';
		b > 0 ? (h = '#d82000') : g > 0 && (h = '#dbc900');
		var w = React.createElement(be, { fill: h }),
			O = function (e) {
				e &&
					(a(e),
					l.current && clearTimeout(l.current),
					(l.current = setTimeout(function () {
						var t = document.querySelector('[data-block="'.concat(e, '"]'));
						(t ||
							(t = document.querySelector(
								'[data-type][data-block="'.concat(e, '"]')
							)),
							t ||
								(t = document.querySelector(
									'.wp-block[data-block="'.concat(e, '"]')
								)),
							t && t.scrollIntoView({ behavior: 'smooth', block: 'center' }));
					}, 100)));
			};
		return (
			(0, i.useEffect)(function () {
				return function () {
					l.current && clearTimeout(l.current);
				};
			}, []),
			0 === b && 0 === g
				? null
				: React.createElement(
						me.PluginSidebar,
						{
							name: 'validation-sidebar',
							title: (0, ve.__)('Validation', 'validation-api'),
							icon: w,
							className: 'validation-api-validation-sidebar',
						},
						b > 0 &&
							React.createElement(
								pe.PanelBody,
								{
									title: (0, ve.sprintf)(
										/* translators: %d: number of errors */ /* translators: %d: number of errors */
										(0, ve.__)('Errors (%d)', 'validation-api'),
										b
									),
									initialOpen: !0,
									className: 'validation-api-errors-panel',
								},
								f.length > 0 &&
									React.createElement(
										pe.PanelRow,
										null,
										React.createElement(
											'div',
											{ className: 'validation-api-error-group' },
											React.createElement(
												'p',
												{ className: 'validation-api-error-subheading' },
												(0, ve.__)('Block Issues', 'validation-api')
											),
											React.createElement(
												'ul',
												{ className: 'validation-api-error-list' },
												f.map(function (e, t) {
													var r = e.clientIds.length,
														n = r > 1 ? ' (x'.concat(r, ')') : '';
													return React.createElement(
														'li',
														{ key: 'block-error-'.concat(t) },
														React.createElement(
															'button',
															{
																type: 'button',
																className:
																	'validation-api-issue-link',
																onClick: function () {
																	return O(e.clientIds[0]);
																},
															},
															e.blockName
														),
														': ',
														e.message,
														n
													);
												})
											)
										)
									),
								m.length > 0 &&
									React.createElement(
										pe.PanelRow,
										null,
										React.createElement(
											'div',
											{ className: 'validation-api-error-group' },
											React.createElement(
												'p',
												{ className: 'validation-api-error-subheading' },
												(0, ve.__)('Field Issues', 'validation-api')
											),
											React.createElement(
												'ul',
												{ className: 'validation-api-error-list' },
												m.map(function (e, t) {
													return React.createElement(
														'li',
														{ key: 'meta-error-'.concat(t) },
														e.message
													);
												})
											)
										)
									),
								v.length > 0 &&
									React.createElement(
										pe.PanelRow,
										null,
										React.createElement(
											'div',
											{ className: 'validation-api-error-group' },
											React.createElement(
												'p',
												{ className: 'validation-api-error-subheading' },
												(0, ve.__)('Editor Issues', 'validation-api')
											),
											React.createElement(
												'ul',
												{ className: 'validation-api-error-list' },
												v.map(function (e, t) {
													return React.createElement(
														'li',
														{ key: 'editor-error-'.concat(t) },
														e.message
													);
												})
											)
										)
									)
							),
						g > 0 &&
							React.createElement(
								pe.PanelBody,
								{
									title: (0, ve.sprintf)(
										/* translators: %d: number of warnings */ /* translators: %d: number of warnings */
										(0, ve.__)('Warnings (%d)', 'validation-api'),
										g
									),
									initialOpen: !0,
									className: 'validation-api-warnings-panel',
								},
								d.length > 0 &&
									React.createElement(
										pe.PanelRow,
										null,
										React.createElement(
											'div',
											{ className: 'validation-api-warning-group' },
											React.createElement(
												'p',
												{ className: 'validation-api-warning-subheading' },
												(0, ve.__)('Block Issues', 'validation-api')
											),
											React.createElement(
												'ul',
												{ className: 'validation-api-warning-list' },
												d.map(function (e, t) {
													var r = e.clientIds.length,
														n = r > 1 ? ' (x'.concat(r, ')') : '';
													return React.createElement(
														'li',
														{ key: 'block-warning-'.concat(t) },
														React.createElement(
															'button',
															{
																type: 'button',
																className:
																	'validation-api-issue-link',
																onClick: function () {
																	return O(e.clientIds[0]);
																},
															},
															e.blockName
														),
														': ',
														e.message,
														n
													);
												})
											)
										)
									),
								p.length > 0 &&
									React.createElement(
										pe.PanelRow,
										null,
										React.createElement(
											'div',
											{ className: 'validation-api-warning-group' },
											React.createElement(
												'p',
												{ className: 'validation-api-warning-subheading' },
												(0, ve.__)('Field Issues', 'validation-api')
											),
											React.createElement(
												'ul',
												{ className: 'validation-api-warning-list' },
												p.map(function (e, t) {
													return React.createElement(
														'li',
														{ key: 'meta-warning-'.concat(t) },
														e.message
													);
												})
											)
										)
									),
								y.length > 0 &&
									React.createElement(
										pe.PanelRow,
										null,
										React.createElement(
											'div',
											{ className: 'validation-api-warning-group' },
											React.createElement(
												'p',
												{ className: 'validation-api-warning-subheading' },
												(0, ve.__)('Editor Issues', 'validation-api')
											),
											React.createElement(
												'ul',
												{ className: 'validation-api-warning-list' },
												y.map(function (e, t) {
													return React.createElement(
														'li',
														{ key: 'editor-warning-'.concat(t) },
														e.message
													);
												})
											)
										)
									)
							)
					)
		);
	}
	(0, n.registerPlugin)('validation-api', {
		render: function () {
			return React.createElement(
				React.Fragment,
				null,
				React.createElement(fe, null),
				React.createElement(de, null),
				React.createElement(Oe, null)
			);
		},
	});
	const Ee = window.wp.compose,
		je = window.wp.blockEditor;
	function Se(e, t) {
		(null == t || t > e.length) && (t = e.length);
		for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
		return n;
	}
	function ke(e) {
		var t,
			r,
			n = e.issues,
			o =
				((t = (0, i.useState)(!1)),
				(r = 2),
				(function (e) {
					if (Array.isArray(e)) return e;
				})(t) ||
					(function (e, t) {
						var r =
							null == e
								? null
								: ('undefined' != typeof Symbol && e[Symbol.iterator]) ||
									e['@@iterator'];
						if (null != r) {
							var n,
								o,
								i,
								a,
								l = [],
								c = !0,
								u = !1;
							try {
								if (((i = (r = r.call(e)).next), 0 === t)) {
									if (Object(r) !== r) return;
									c = !1;
								} else
									for (
										;
										!(c = (n = i.call(r)).done) &&
										(l.push(n.value), l.length !== t);
										c = !0
									);
							} catch (e) {
								((u = !0), (o = e));
							} finally {
								try {
									if (
										!c &&
										null != r.return &&
										((a = r.return()), Object(a) !== a)
									)
										return;
								} finally {
									if (u) throw o;
								}
							}
							return l;
						}
					})(t, r) ||
					(function (e, t) {
						if (e) {
							if ('string' == typeof e) return Se(e, t);
							var r = {}.toString.call(e).slice(8, -1);
							return (
								'Object' === r && e.constructor && (r = e.constructor.name),
								'Map' === r || 'Set' === r
									? Array.from(e)
									: 'Arguments' === r ||
										  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
										? Se(e, t)
										: void 0
							);
						}
					})(t, r) ||
					(function () {
						throw new TypeError(
							'Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
						);
					})()),
			a = o[0],
			l = o[1];
		if (!n || 0 === n.length) return null;
		var c = m(n),
			u = f(n),
			s = d(n),
			p = c
				? React.createElement(be, { fill: '#d82000' })
				: React.createElement(be, { fill: '#dbc900' });
		return React.createElement(
			React.Fragment,
			null,
			React.createElement(pe.ToolbarButton, {
				icon: p,
				onClick: function () {
					return l(!0);
				},
				label: (0, ve.__)('View block issues or concerns', 'validation-api'),
				className: 'validation-api-toolbar-button',
				isCompact: !0,
			}),
			a &&
				React.createElement(
					pe.Modal,
					{
						title: (0, ve.__)('Issues or Concerns', 'validation-api'),
						onRequestClose: function () {
							return l(!1);
						},
						className: 'validation-api-block-indicator-modal',
					},
					React.createElement(
						'div',
						{ className: 'validation-api-indicator-modal-content' },
						u.length > 0 &&
							React.createElement(
								'div',
								{
									className:
										'validation-api-indicator-section validation-api-indicator-errors',
								},
								React.createElement(
									'h2',
									{ className: 'validation-api-indicator-section-title' },
									React.createElement('span', {
										className: 'validation-api-indicator-section-title-circle',
									}),
									(0, ve.__)('Errors', 'validation-api')
								),
								React.createElement(
									'ul',
									null,
									u.map(function (e, t) {
										return React.createElement(
											'li',
											{ key: 'error-'.concat(t) },
											e.error_msg
										);
									})
								)
							),
						s.length > 0 &&
							React.createElement(
								'div',
								{
									className:
										'validation-api-indicator-section validation-api-indicator-warnings',
								},
								React.createElement(
									'h2',
									{ className: 'validation-api-indicator-section-title' },
									React.createElement('span', {
										className: 'validation-api-indicator-section-title-circle',
									}),
									(0, ve.__)('Warnings', 'validation-api')
								),
								React.createElement(
									'ul',
									null,
									s.map(function (e, t) {
										return React.createElement(
											'li',
											{ key: 'warning-'.concat(t) },
											e.warning_msg || e.error_msg
										);
									})
								)
							)
					)
				)
		);
	}
	function Pe(e, t) {
		(null == t || t > e.length) && (t = e.length);
		for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
		return n;
	}
	function Re(e) {
		return (
			(Re =
				'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
					? function (e) {
							return typeof e;
						}
					: function (e) {
							return e &&
								'function' == typeof Symbol &&
								e.constructor === Symbol &&
								e !== Symbol.prototype
								? 'symbol'
								: typeof e;
						}),
			Re(e)
		);
	}
	function Ie(e, t) {
		var r = Object.keys(e);
		if (Object.getOwnPropertySymbols) {
			var n = Object.getOwnPropertySymbols(e);
			(t &&
				(n = n.filter(function (t) {
					return Object.getOwnPropertyDescriptor(e, t).enumerable;
				})),
				r.push.apply(r, n));
		}
		return r;
	}
	function _e(e) {
		for (var t = 1; t < arguments.length; t++) {
			var r = null != arguments[t] ? arguments[t] : {};
			t % 2
				? Ie(Object(r), !0).forEach(function (t) {
						Ae(e, t, r[t]);
					})
				: Object.getOwnPropertyDescriptors
					? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
					: Ie(Object(r)).forEach(function (t) {
							Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
						});
		}
		return e;
	}
	function Ae(e, t, r) {
		return (
			(t = (function (e) {
				var t = (function (e) {
					if ('object' != Re(e) || !e) return e;
					var t = e[Symbol.toPrimitive];
					if (void 0 !== t) {
						var r = t.call(e, 'string');
						if ('object' != Re(r)) return r;
						throw new TypeError('@@toPrimitive must return a primitive value.');
					}
					return String(e);
				})(e);
				return 'symbol' == Re(t) ? t : t + '';
			})(t)) in e
				? Object.defineProperty(e, t, {
						value: r,
						enumerable: !0,
						configurable: !0,
						writable: !0,
					})
				: (e[t] = r),
			e
		);
	}
	var Ne = (0, Ee.createHigherOrderComponent)(function (e) {
		return function (t) {
			var r = t.clientId,
				n = t.attributes,
				a = (0, o.useSelect)(
					function (e) {
						return e('core/block-editor').getBlock(r);
					},
					[r]
				),
				l = (0, o.useDispatch)(F),
				c = l.setBlockValidation,
				u = l.clearBlockValidation,
				s = (function (e, t) {
					var r,
						n,
						o = (arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {})
							.delay,
						a = void 0 === o ? 300 : o,
						l =
							((r = (0, i.useState)(function () {
								return e();
							})),
							(n = 2),
							(function (e) {
								if (Array.isArray(e)) return e;
							})(r) ||
								(function (e, t) {
									var r =
										null == e
											? null
											: ('undefined' != typeof Symbol &&
													e[Symbol.iterator]) ||
												e['@@iterator'];
									if (null != r) {
										var n,
											o,
											i,
											a,
											l = [],
											c = !0,
											u = !1;
										try {
											if (((i = (r = r.call(e)).next), 0 === t)) {
												if (Object(r) !== r) return;
												c = !1;
											} else
												for (
													;
													!(c = (n = i.call(r)).done) &&
													(l.push(n.value), l.length !== t);
													c = !0
												);
										} catch (e) {
											((u = !0), (o = e));
										} finally {
											try {
												if (
													!c &&
													null != r.return &&
													((a = r.return()), Object(a) !== a)
												)
													return;
											} finally {
												if (u) throw o;
											}
										}
										return l;
									}
								})(r, n) ||
								(function (e, t) {
									if (e) {
										if ('string' == typeof e) return Pe(e, t);
										var r = {}.toString.call(e).slice(8, -1);
										return (
											'Object' === r &&
												e.constructor &&
												(r = e.constructor.name),
											'Map' === r || 'Set' === r
												? Array.from(e)
												: 'Arguments' === r ||
													  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(
															r
													  )
													? Pe(e, t)
													: void 0
										);
									}
								})(r, n) ||
								(function () {
									throw new TypeError(
										'Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
									);
								})()),
						c = l[0],
						u = l[1],
						s = (0, i.useRef)(null),
						f = (0, i.useRef)(!0);
					return (
						(0, i.useEffect)(function () {
							return f.current
								? ((f.current = !1), void u(e()))
								: (s.current && clearTimeout(s.current),
									(s.current = setTimeout(function () {
										u(e());
									}, a)),
									function () {
										s.current && clearTimeout(s.current);
									});
						}, t),
						c
					);
				})(
					function () {
						if (!a) return { isValid: !0, issues: [], mode: 'none' };
						var e = _e(_e({}, a), {}, { attributes: n || a.attributes });
						return O(e);
					},
					[a, n],
					{ delay: 300 }
				);
			return (
				(0, i.useEffect)(
					function () {
						return (
							c(r, s),
							function () {
								return u(r);
							}
						);
					},
					[r, s, c, u]
				),
				React.createElement(
					React.Fragment,
					null,
					React.createElement(e, t),
					!s.isValid &&
						React.createElement(
							je.BlockControls,
							{ group: 'block' },
							React.createElement(ke, { issues: s.issues })
						)
				)
			);
		};
	}, 'withErrorHandling');
	function Ce(e) {
		return (
			(Ce =
				'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
					? function (e) {
							return typeof e;
						}
					: function (e) {
							return e &&
								'function' == typeof Symbol &&
								e.constructor === Symbol &&
								e !== Symbol.prototype
								? 'symbol'
								: typeof e;
						}),
			Ce(e)
		);
	}
	function Be() {
		return (
			(Be = Object.assign
				? Object.assign.bind()
				: function (e) {
						for (var t = 1; t < arguments.length; t++) {
							var r = arguments[t];
							for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
						}
						return e;
					}),
			Be.apply(null, arguments)
		);
	}
	function Ve(e, t) {
		var r = Object.keys(e);
		if (Object.getOwnPropertySymbols) {
			var n = Object.getOwnPropertySymbols(e);
			(t &&
				(n = n.filter(function (t) {
					return Object.getOwnPropertyDescriptor(e, t).enumerable;
				})),
				r.push.apply(r, n));
		}
		return r;
	}
	function Le(e) {
		for (var t = 1; t < arguments.length; t++) {
			var r = null != arguments[t] ? arguments[t] : {};
			t % 2
				? Ve(Object(r), !0).forEach(function (t) {
						Te(e, t, r[t]);
					})
				: Object.getOwnPropertyDescriptors
					? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
					: Ve(Object(r)).forEach(function (t) {
							Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
						});
		}
		return e;
	}
	function Te(e, t, r) {
		return (
			(t = (function (e) {
				var t = (function (e) {
					if ('object' != Ce(e) || !e) return e;
					var t = e[Symbol.toPrimitive];
					if (void 0 !== t) {
						var r = t.call(e, 'string');
						if ('object' != Ce(r)) return r;
						throw new TypeError('@@toPrimitive must return a primitive value.');
					}
					return String(e);
				})(e);
				return 'symbol' == Ce(t) ? t : t + '';
			})(t)) in e
				? Object.defineProperty(e, t, {
						value: r,
						enumerable: !0,
						configurable: !0,
						writable: !0,
					})
				: (e[t] = r),
			e
		);
	}
	function De(e) {
		return (
			(De =
				'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
					? function (e) {
							return typeof e;
						}
					: function (e) {
							return e &&
								'function' == typeof Symbol &&
								e.constructor === Symbol &&
								e !== Symbol.prototype
								? 'symbol'
								: typeof e;
						}),
			De(e)
		);
	}
	function Me(e, t) {
		var r = Object.keys(e);
		if (Object.getOwnPropertySymbols) {
			var n = Object.getOwnPropertySymbols(e);
			(t &&
				(n = n.filter(function (t) {
					return Object.getOwnPropertyDescriptor(e, t).enumerable;
				})),
				r.push.apply(r, n));
		}
		return r;
	}
	function xe(e) {
		for (var t = 1; t < arguments.length; t++) {
			var r = null != arguments[t] ? arguments[t] : {};
			t % 2
				? Me(Object(r), !0).forEach(function (t) {
						Fe(e, t, r[t]);
					})
				: Object.getOwnPropertyDescriptors
					? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
					: Me(Object(r)).forEach(function (t) {
							Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
						});
		}
		return e;
	}
	function Fe(e, t, r) {
		return (
			(t = (function (e) {
				var t = (function (e) {
					if ('object' != De(e) || !e) return e;
					var t = e[Symbol.toPrimitive];
					if (void 0 !== t) {
						var r = t.call(e, 'string');
						if ('object' != De(r)) return r;
						throw new TypeError('@@toPrimitive must return a primitive value.');
					}
					return String(e);
				})(e);
				return 'symbol' == De(t) ? t : t + '';
			})(t)) in e
				? Object.defineProperty(e, t, {
						value: r,
						enumerable: !0,
						configurable: !0,
						writable: !0,
					})
				: (e[t] = r),
			e
		);
	}
	function Ke(e) {
		return (
			(Ke =
				'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
					? function (e) {
							return typeof e;
						}
					: function (e) {
							return e &&
								'function' == typeof Symbol &&
								e.constructor === Symbol &&
								e !== Symbol.prototype
								? 'symbol'
								: typeof e;
						}),
			Ke(e)
		);
	}
	(wp.hooks.addFilter('editor.BlockEdit', 'validation-api/with-error-handling', Ne),
		(0, g.addFilter)(
			'editor.BlockListBlock',
			'validation-api/with-block-validation-classes',
			function (e) {
				return function (t) {
					var r = (0, o.useSelect)(
						function (e) {
							return e(F).getBlockValidation(t.clientId);
						},
						[t.clientId]
					);
					if ('none' === r.mode) return React.createElement(e, t);
					var n =
							'error' === r.mode
								? 'validation-api-block-error'
								: 'validation-api-block-warning',
						i = t.wrapperProps || {},
						a = Le(
							Le({}, i),
							{},
							{ className: [i.className, n].filter(Boolean).join(' ') }
						);
					return React.createElement(e, Be({}, t, { wrapperProps: a }));
				};
			}
		),
		void 0 === window.ValidationAPI && (window.ValidationAPI = {}),
		(window.ValidationAPI.useMetaField = function (e) {
			var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : '',
				r = (function (e) {
					return (0, o.useSelect)(
						function (t) {
							var r = t('core/editor'),
								n = r.getEditedPostAttribute,
								o = (0, r.getCurrentPostType)(),
								i = n('meta'),
								a = i ? i[e] : '';
							if (!o || !e)
								return {
									isValid: !0,
									hasErrors: !1,
									hasWarnings: !1,
									issues: [],
									wrapperClassName: '',
								};
							var l = C(o, e, a),
								c = '';
							return (
								l.hasErrors
									? (c = 'validation-api-meta-error')
									: l.hasWarnings && (c = 'validation-api-meta-warning'),
								xe(xe({}, l), {}, { wrapperClassName: c })
							);
						},
						[e]
					);
				})(e),
				n = (0, o.useSelect)(
					function (t) {
						var r = t('core/editor');
						if (!r) return { value: '' };
						var n = r.getEditedPostAttribute('meta');
						return { value: n ? n[e] : '' };
					},
					[e]
				).value,
				i = (0, o.useDispatch)('core/editor').editPost,
				a = t;
			if (r && (r.hasErrors || r.hasWarnings)) {
				var l = r.issues
						.map(function (e) {
							return e.message || e.error_msg || e.warning_msg;
						})
						.join('. '),
					c = r.hasErrors ? 'validation-api-error-text' : 'validation-api-warning-text';
				a = a
					? React.createElement(
							React.Fragment,
							null,
							a,
							React.createElement('span', { className: c }, '* ', l)
						)
					: React.createElement('span', { className: c }, '* ', l);
			}
			return {
				value: n || '',
				onChange: function (t) {
					var r, n, o;
					i &&
						i({
							meta:
								((r = {}),
								(n = e),
								(o = t),
								(n = (function (e) {
									var t = (function (e) {
										if ('object' != Ke(e) || !e) return e;
										var t = e[Symbol.toPrimitive];
										if (void 0 !== t) {
											var r = t.call(e, 'string');
											if ('object' != Ke(r)) return r;
											throw new TypeError(
												'@@toPrimitive must return a primitive value.'
											);
										}
										return String(e);
									})(e);
									return 'symbol' == Ke(t) ? t : t + '';
								})(n)) in r
									? Object.defineProperty(r, n, {
											value: o,
											enumerable: !0,
											configurable: !0,
											writable: !0,
										})
									: (r[n] = o),
								r),
						});
				},
				help: a,
				className:
					null != r && r.wrapperClassName
						? 'validation-api-field '.concat(r.wrapperClassName)
						: '',
			};
		}));
})();
