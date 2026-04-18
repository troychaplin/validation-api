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
			getBlockValidation: () => w,
			getInvalidBlocks: () => b,
			getInvalidEditorChecks: () => h,
			getInvalidMeta: () => g,
			hasErrors: () => O,
			hasWarnings: () => E,
		}));
	var r = {};
	(e.r(r),
		e.d(r, {
			clearBlockValidation: () => R,
			setBlockValidation: () => P,
			setInvalidBlocks: () => j,
			setInvalidEditorChecks: () => k,
			setInvalidMeta: () => S,
		}));
	const n = window.wp.data;
	var o = 'core/validation',
		i = 'SET_INVALID_BLOCKS',
		a = 'SET_INVALID_META',
		c = 'SET_INVALID_EDITOR_CHECKS',
		l = 'SET_BLOCK_VALIDATION',
		u = 'CLEAR_BLOCK_VALIDATION',
		s = { blocks: [], meta: [], editor: [], blockValidation: {} },
		f = Object.freeze({ mode: 'none', issues: [] });
	function d(e) {
		return (
			(d =
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
			d(e)
		);
	}
	function p(e, t) {
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
	function m(e) {
		for (var t = 1; t < arguments.length; t++) {
			var r = null != arguments[t] ? arguments[t] : {};
			t % 2
				? p(Object(r), !0).forEach(function (t) {
						v(e, t, r[t]);
					})
				: Object.getOwnPropertyDescriptors
					? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
					: p(Object(r)).forEach(function (t) {
							Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
						});
		}
		return e;
	}
	function v(e, t, r) {
		return (
			(t = y(t)) in e
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
	function y(e) {
		var t = (function (e) {
			if ('object' != d(e) || !e) return e;
			var t = e[Symbol.toPrimitive];
			if (void 0 !== t) {
				var r = t.call(e, 'string');
				if ('object' != d(r)) return r;
				throw new TypeError('@@toPrimitive must return a primitive value.');
			}
			return String(e);
		})(e);
		return 'symbol' == d(t) ? t : t + '';
	}
	function b(e) {
		return e.blocks;
	}
	function g(e) {
		return e.meta;
	}
	function h(e) {
		return e.editor;
	}
	function w(e, t) {
		return e.blockValidation[t] || f;
	}
	function O(e) {
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
	function E(e) {
		if (O(e)) return !1;
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
	function j(e) {
		return { type: i, results: e };
	}
	function S(e) {
		return { type: a, results: e };
	}
	function k(e) {
		return { type: c, issues: e };
	}
	function P(e, t) {
		return { type: l, clientId: e, result: t };
	}
	function R(e) {
		return { type: u, clientId: e };
	}
	var I = (0, n.createReduxStore)(o, {
		reducer: function () {
			var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : s,
				t = arguments.length > 1 ? arguments[1] : void 0;
			switch (t.type) {
				case i:
					return m(m({}, e), {}, { blocks: t.results });
				case a:
					return m(m({}, e), {}, { meta: t.results });
				case c:
					return m(m({}, e), {}, { editor: t.issues });
				case l:
					return m(
						m({}, e),
						{},
						{
							blockValidation: m(
								m({}, e.blockValidation),
								{},
								v({}, t.clientId, t.result)
							),
						}
					);
				case u:
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
							})(r, [n].map(y)));
					return m(m({}, e), {}, { blockValidation: o });
				default:
					return e;
			}
		},
		selectors: t,
		actions: r,
	});
	(0, n.register)(I);
	const A = window.wp.plugins,
		_ = window.wp.element,
		B = window.wp.hooks;
	function N(e) {
		return (
			(N =
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
			N(e)
		);
	}
	function T(e, t) {
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
	function C(e) {
		for (var t = 1; t < arguments.length; t++) {
			var r = null != arguments[t] ? arguments[t] : {};
			t % 2
				? T(Object(r), !0).forEach(function (t) {
						L(e, t, r[t]);
					})
				: Object.getOwnPropertyDescriptors
					? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
					: T(Object(r)).forEach(function (t) {
							Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
						});
		}
		return e;
	}
	function L(e, t, r) {
		return (
			(t = (function (e) {
				var t = (function (e) {
					if ('object' != N(e) || !e) return e;
					var t = e[Symbol.toPrimitive];
					if (void 0 !== t) {
						var r = t.call(e, 'string');
						if ('object' != N(r)) return r;
						throw new TypeError('@@toPrimitive must return a primitive value.');
					}
					return String(e);
				})(e);
				return 'symbol' == N(t) ? t : t + '';
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
	var M = function (e, t) {
			return e.filter(function (e) {
				return e.type === t;
			});
		},
		V = function (e) {
			return M(e, 'error');
		},
		D = function (e) {
			return M(e, 'warning');
		},
		x = function (e) {
			return e.some(function (e) {
				return 'error' === e.type;
			});
		},
		F = function (e) {
			return e.some(function (e) {
				return 'warning' === e.type;
			});
		},
		K = function (e) {
			return null != e && !1 !== e.enabled;
		},
		U = function (e, t) {
			var r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {},
				n = e.message || '',
				o = e.error_msg || n,
				i = e.warning_msg || e.error_msg || n,
				a = e.level || 'error';
			return C(
				{
					check: t,
					checkName: t,
					type: a,
					priority: 'error' === a ? 1 : 'warning' === a ? 2 : 3,
					message: n,
					errorMsg: o,
					warningMsg: i,
				},
				r
			);
		},
		G = function (e) {
			var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
			return C({ isValid: 0 === e.length, issues: e, hasErrors: x(e), hasWarnings: F(e) }, t);
		};
	function W() {
		try {
			var e = (0, n.select)('core/editor').getEditorSettings();
			return (null == e ? void 0 : e.validationApi) || {};
		} catch (e) {
			return {};
		}
	}
	function $() {
		return W().metaValidationRules || {};
	}
	function q() {
		return W().editorContext || 'none';
	}
	function H(e, t) {
		(null == t || t > e.length) && (t = e.length);
		for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
		return n;
	}
	var Z = function (e) {
		var t = e.name,
			r = e.attributes,
			n = [],
			o = (W().validationRules || {})[t] || {};
		if (0 === Object.keys(o).length)
			return { isValid: !0, issues: [], mode: 'none', clientId: e.clientId, name: t };
		Object.entries(o).forEach(function (o) {
			var i,
				a,
				c =
					((a = 2),
					(function (e) {
						if (Array.isArray(e)) return e;
					})((i = o)) ||
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
									c = [],
									l = !0,
									u = !1;
								try {
									if (((i = (r = r.call(e)).next), 0 === t)) {
										if (Object(r) !== r) return;
										l = !1;
									} else
										for (
											;
											!(l = (n = i.call(r)).done) &&
											(c.push(n.value), c.length !== t);
											l = !0
										);
								} catch (e) {
									((u = !0), (o = e));
								} finally {
									try {
										if (
											!l &&
											null != r.return &&
											((a = r.return()), Object(a) !== a)
										)
											return;
									} finally {
										if (u) throw o;
									}
								}
								return c;
							}
						})(i, a) ||
						(function (e, t) {
							if (e) {
								if ('string' == typeof e) return H(e, t);
								var r = {}.toString.call(e).slice(8, -1);
								return (
									'Object' === r && e.constructor && (r = e.constructor.name),
									'Map' === r || 'Set' === r
										? Array.from(e)
										: 'Arguments' === r ||
											  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
											? H(e, t)
											: void 0
								);
							}
						})(i, a) ||
						(function () {
							throw new TypeError(
								'Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
							);
						})()),
				l = c[0],
				u = c[1];
			if (K(u)) {
				var s = !0;
				('function' == typeof u.validator && (s = u.validator(r, e)),
					(s = (0, B.applyFilters)('editor.validateBlock', s, t, r, l, e)) ||
						n.push(U(u, l)));
			}
		});
		var i = 'none';
		return (
			x(n) ? (i = 'error') : F(n) && (i = 'warning'),
			G(n, { mode: i, clientId: e.clientId, name: t })
		);
	};
	function z(e, t) {
		if (e) {
			if ('string' == typeof e) return J(e, t);
			var r = {}.toString.call(e).slice(8, -1);
			return (
				'Object' === r && e.constructor && (r = e.constructor.name),
				'Map' === r || 'Set' === r
					? Array.from(e)
					: 'Arguments' === r || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
						? J(e, t)
						: void 0
			);
		}
	}
	function J(e, t) {
		(null == t || t > e.length) && (t = e.length);
		for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
		return n;
	}
	function Q(e) {
		return e.flatMap(function (e) {
			var t,
				r = Z(e),
				n = [];
			return (
				r.isValid || n.push(r),
				e.innerBlocks && e.innerBlocks.length > 0
					? [].concat(
							n,
							(function (e) {
								if (Array.isArray(e)) return J(e);
							})((t = Q(e.innerBlocks))) ||
								(function (e) {
									if (
										('undefined' != typeof Symbol &&
											null != e[Symbol.iterator]) ||
										null != e['@@iterator']
									)
										return Array.from(e);
								})(t) ||
								z(t) ||
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
	function X(e) {
		var t,
			r = (function (e) {
				var t = ('undefined' != typeof Symbol && e[Symbol.iterator]) || e['@@iterator'];
				if (!t) {
					if (Array.isArray(e) || (t = z(e))) {
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
					var o = X(n.innerBlocks);
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
	function Y() {
		var e = q(),
			t = 'post-editor' === e || 'post-editor-template' === e;
		return Q(
			(0, n.useSelect)(
				function (e) {
					var r = e('core/block-editor'),
						n = r.getBlocks();
					if (t) {
						var o = X(n);
						if (o) {
							var i = r.getBlock(o.clientId),
								a = r
									.getBlockOrder(o.clientId)
									.map(function (e) {
										var t = r.getBlock(e);
										return (r.getBlockOrder(e), t);
									})
									.filter(Boolean);
							return a.length > 0 ? a : (null == i ? void 0 : i.innerBlocks) || [];
						}
						return n;
					}
					return n;
				},
				[t]
			)
		);
	}
	function ee(e, t) {
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
						c = [],
						l = !0,
						u = !1;
					try {
						if (((i = (r = r.call(e)).next), 0 === t)) {
							if (Object(r) !== r) return;
							l = !1;
						} else
							for (
								;
								!(l = (n = i.call(r)).done) && (c.push(n.value), c.length !== t);
								l = !0
							);
					} catch (e) {
						((u = !0), (o = e));
					} finally {
						try {
							if (!l && null != r.return && ((a = r.return()), Object(a) !== a))
								return;
						} finally {
							if (u) throw o;
						}
					}
					return c;
				}
			})(e, t) ||
			(function (e, t) {
				if (e) {
					if ('string' == typeof e) return te(e, t);
					var r = {}.toString.call(e).slice(8, -1);
					return (
						'Object' === r && e.constructor && (r = e.constructor.name),
						'Map' === r || 'Set' === r
							? Array.from(e)
							: 'Arguments' === r ||
								  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
								? te(e, t)
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
	function te(e, t) {
		(null == t || t > e.length) && (t = e.length);
		for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
		return n;
	}
	function re(e, t, r, n) {
		var o,
			i =
				null === (o = $()[e]) || void 0 === o || null === (o = o[t]) || void 0 === o
					? void 0
					: o[n];
		if (!K(i)) return !0;
		var a = !0;
		return (
			'required' === n && (a = '' !== r && null != r),
			(0, B.applyFilters)('editor.validateMeta', a, r, e, t, n)
		);
	}
	function ne(e, t, r) {
		for (
			var n = ($()[e] || {})[t] || {}, o = [], i = 0, a = Object.entries(n);
			i < a.length;
			i++
		) {
			var c = ee(a[i], 2),
				l = c[0],
				u = c[1];
			if (K(u) && !re(e, t, r, l)) {
				var s = U(u, l, { metaKey: t });
				o.push(s);
			}
		}
		return G(o);
	}
	function oe(e) {
		return (
			(oe =
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
			oe(e)
		);
	}
	function ie(e, t) {
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
	function ae(e) {
		for (var t = 1; t < arguments.length; t++) {
			var r = null != arguments[t] ? arguments[t] : {};
			t % 2
				? ie(Object(r), !0).forEach(function (t) {
						ce(e, t, r[t]);
					})
				: Object.getOwnPropertyDescriptors
					? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
					: ie(Object(r)).forEach(function (t) {
							Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
						});
		}
		return e;
	}
	function ce(e, t, r) {
		return (
			(t = (function (e) {
				var t = (function (e) {
					if ('object' != oe(e) || !e) return e;
					var t = e[Symbol.toPrimitive];
					if (void 0 !== t) {
						var r = t.call(e, 'string');
						if ('object' != oe(r)) return r;
						throw new TypeError('@@toPrimitive must return a primitive value.');
					}
					return String(e);
				})(e);
				return 'symbol' == oe(t) ? t : t + '';
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
	function le(e, t) {
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
						c = [],
						l = !0,
						u = !1;
					try {
						if (((i = (r = r.call(e)).next), 0 === t)) {
							if (Object(r) !== r) return;
							l = !1;
						} else
							for (
								;
								!(l = (n = i.call(r)).done) && (c.push(n.value), c.length !== t);
								l = !0
							);
					} catch (e) {
						((u = !0), (o = e));
					} finally {
						try {
							if (!l && null != r.return && ((a = r.return()), Object(a) !== a))
								return;
						} finally {
							if (u) throw o;
						}
					}
					return c;
				}
			})(e, t) ||
			(function (e, t) {
				if (e) {
					if ('string' == typeof e) return ue(e, t);
					var r = {}.toString.call(e).slice(8, -1);
					return (
						'Object' === r && e.constructor && (r = e.constructor.name),
						'Map' === r || 'Set' === r
							? Array.from(e)
							: 'Arguments' === r ||
								  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
								? ue(e, t)
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
	function ue(e, t) {
		(null == t || t > e.length) && (t = e.length);
		for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
		return n;
	}
	function se() {
		var e,
			t,
			r,
			i = Y(),
			a = (function () {
				for (
					var e = (0, n.useSelect)(function (e) {
							var t = e('core/editor');
							return {
								postType: t.getCurrentPostType(),
								meta: t.getEditedPostAttribute('meta'),
							};
						}, []),
						t = e.postType,
						r = e.meta,
						o = $()[t] || {},
						i = [],
						a = 0,
						c = Object.keys(o);
					a < c.length;
					a++
				) {
					var l = c[a],
						u = ne(t, l, null == r ? void 0 : r[l]);
					u.isValid || i.push(ae(ae({}, u), {}, { metaKey: l }));
				}
				return i;
			})(),
			c =
				((t = (e = (0, n.useSelect)(function (e) {
					var t = e('core/editor'),
						r = e('core/block-editor');
					return {
						postType: t.getCurrentPostType(),
						blocks: r.getBlocks(),
						title: t.getEditedPostAttribute('title'),
					};
				}, [])).blocks),
				(r = e.postType) && t
					? (function (e, t) {
							for (
								var r = (W().editorValidationRules || {})[e] || {},
									n = [],
									o = 0,
									i = Object.entries(r);
								o < i.length;
								o++
							) {
								var a = le(i[o], 2),
									c = a[0],
									l = a[1];
								if (
									K(l) &&
									!(0, B.applyFilters)('editor.validateEditor', !0, t, e, c, l)
								) {
									var u = U(l, c);
									n.push(u);
								}
							}
							return (
								n.sort(function (e, t) {
									return e.priority - t.priority;
								}),
								G(n)
							);
						})(r, t).issues
					: []),
			l = (0, n.useDispatch)(o),
			u = l.setInvalidBlocks,
			s = l.setInvalidMeta,
			f = l.setInvalidEditorChecks;
		((0, _.useEffect)(
			function () {
				u(i);
			},
			[i, u]
		),
			(0, _.useEffect)(
				function () {
					s(a);
				},
				[a, s]
			),
			(0, _.useEffect)(
				function () {
					f(c);
				},
				[c, f]
			));
	}
	function fe() {
		return (0, n.useSelect)(function (e) {
			var t = e(o);
			return {
				invalidBlocks: t.getInvalidBlocks(),
				invalidMeta: t.getInvalidMeta(),
				invalidEditorChecks: t.getInvalidEditorChecks(),
			};
		}, []);
	}
	var de = 'core/validation';
	const pe = window.wp.editor,
		me = window.wp.components,
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
				('error' === t ? V(e.issues || []) : D(e.issues || [])).forEach(function (n) {
					var o,
						i,
						a = 'error' === t ? n.errorMsg : n.warningMsg || n.errorMsg,
						c = ''.concat(e.name, '|').concat(a);
					(r.has(c) ||
						r.set(c, {
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
							!r.get(c).clientIds.includes(e.clientId) &&
							r.get(c).clientIds.push(e.clientId));
				});
			}),
			Array.from(r.values())
		);
	}
	function he(e, t) {
		var r = new Map();
		return (
			e.forEach(function (e) {
				('error' === t ? V(e.issues || []) : D(e.issues || [])).forEach(function (n) {
					var o = 'error' === t ? n.errorMsg : n.warningMsg || n.errorMsg,
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
				var n = 'error' === t ? e.errorMsg : e.warningMsg || e.errorMsg,
					o = n;
				r.has(o) || r.set(o, { message: n, description: e.description });
			}),
			Array.from(r.values())
		);
	}
	function Oe() {
		var e = fe(),
			t = e.invalidBlocks,
			r = e.invalidMeta,
			o = e.invalidEditorChecks,
			i = (0, n.useDispatch)('core/block-editor').selectBlock,
			a = (0, _.useRef)(null),
			c = M(o, 'error'),
			l = M(o, 'warning'),
			u = ge(t, 'error'),
			s = ge(t, 'warning'),
			f = he(r, 'error'),
			d = he(r, 'warning'),
			p = we(c, 'error'),
			m = we(l, 'warning'),
			v = u.length + f.length + p.length,
			y = s.length + d.length + m.length,
			b = 'currentColor';
		v > 0 ? (b = '#d82000') : y > 0 && (b = '#dbc900');
		var g = React.createElement(be, { fill: b }),
			h = function (e) {
				e &&
					(i(e),
					a.current && clearTimeout(a.current),
					(a.current = setTimeout(function () {
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
			(0, _.useEffect)(function () {
				return function () {
					a.current && clearTimeout(a.current);
				};
			}, []),
			0 === v && 0 === y
				? null
				: React.createElement(
						pe.PluginSidebar,
						{
							name: 'validation-sidebar',
							title: (0, ve.__)('Validation', 'validation-api'),
							icon: g,
							className: 'validation-api-validation-sidebar',
						},
						v > 0 &&
							React.createElement(
								me.PanelBody,
								{
									title: (0, ve.sprintf)(
										/* translators: %d: number of errors */ /* translators: %d: number of errors */
										(0, ve.__)('Errors (%d)', 'validation-api'),
										v
									),
									initialOpen: !0,
									className: 'validation-api-errors-panel',
								},
								u.length > 0 &&
									React.createElement(
										me.PanelRow,
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
												u.map(function (e, t) {
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
																	return h(e.clientIds[0]);
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
								f.length > 0 &&
									React.createElement(
										me.PanelRow,
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
												f.map(function (e, t) {
													return React.createElement(
														'li',
														{ key: 'meta-error-'.concat(t) },
														e.message
													);
												})
											)
										)
									),
								p.length > 0 &&
									React.createElement(
										me.PanelRow,
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
												p.map(function (e, t) {
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
						y > 0 &&
							React.createElement(
								me.PanelBody,
								{
									title: (0, ve.sprintf)(
										/* translators: %d: number of warnings */ /* translators: %d: number of warnings */
										(0, ve.__)('Warnings (%d)', 'validation-api'),
										y
									),
									initialOpen: !0,
									className: 'validation-api-warnings-panel',
								},
								s.length > 0 &&
									React.createElement(
										me.PanelRow,
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
												s.map(function (e, t) {
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
																	return h(e.clientIds[0]);
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
								d.length > 0 &&
									React.createElement(
										me.PanelRow,
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
												d.map(function (e, t) {
													return React.createElement(
														'li',
														{ key: 'meta-warning-'.concat(t) },
														e.message
													);
												})
											)
										)
									),
								m.length > 0 &&
									React.createElement(
										me.PanelRow,
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
												m.map(function (e, t) {
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
	function Ee() {
		return (se(), null);
	}
	function je() {
		var e, t, r, o, i, a, c, l, u, s, f, d, p;
		return (
			(e = q()),
			(t = 'post-editor' === e || 'post-editor-template' === e),
			(r = (0, n.useDispatch)('core/editor')),
			(o = r.lockPostSaving),
			(i = r.unlockPostSaving),
			(a = r.lockPostAutosaving),
			(c = r.unlockPostAutosaving),
			(l = r.disablePublishSidebar),
			(u = r.enablePublishSidebar),
			(s = fe()),
			(f = s.invalidBlocks),
			(d = s.invalidMeta),
			(p = s.invalidEditorChecks),
			(0, _.useEffect)(
				function () {
					if (t && o && i) {
						var e = f.some(function (e) {
								return 'error' === e.mode;
							}),
							r = d.some(function (e) {
								return e.hasErrors;
							}),
							n = x(p);
						e || r || n ? (o(de), a && a(de), l && l()) : (i(de), c && c(de), u && u());
					}
				},
				[f, d, p, o, i, a, c, l, u, t]
			),
			(0, _.useEffect)(
				function () {
					if (t && document.body) {
						var e = f.some(function (e) {
								return 'error' === e.mode;
							}),
							r = f.some(function (e) {
								return 'warning' === e.mode;
							}),
							n = d.some(function (e) {
								return e.hasErrors;
							}),
							o = d.some(function (e) {
								return e.hasWarnings && !e.hasErrors;
							}),
							i = x(p),
							a = F(p),
							c = e || n || i,
							l = !c && (r || o || a);
						return (
							c
								? (document.body.classList.add('has-validation-errors'),
									document.body.classList.remove('has-validation-warnings'))
								: l
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
				[f, d, p, t]
			),
			null
		);
	}
	(0, A.registerPlugin)('core-validation', {
		render: function () {
			return React.createElement(
				React.Fragment,
				null,
				React.createElement(Ee, null),
				React.createElement(je, null),
				React.createElement(Oe, null)
			);
		},
	});
	const Se = window.wp.compose,
		ke = window.wp.blockEditor;
	function Pe(e, t) {
		(null == t || t > e.length) && (t = e.length);
		for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
		return n;
	}
	function Re(e, t) {
		(null == t || t > e.length) && (t = e.length);
		for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
		return n;
	}
	function Ie(e) {
		var t,
			r,
			n = e.issues,
			o =
				((t = (0, _.useState)(!1)),
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
								c = [],
								l = !0,
								u = !1;
							try {
								if (((i = (r = r.call(e)).next), 0 === t)) {
									if (Object(r) !== r) return;
									l = !1;
								} else
									for (
										;
										!(l = (n = i.call(r)).done) &&
										(c.push(n.value), c.length !== t);
										l = !0
									);
							} catch (e) {
								((u = !0), (o = e));
							} finally {
								try {
									if (
										!l &&
										null != r.return &&
										((a = r.return()), Object(a) !== a)
									)
										return;
								} finally {
									if (u) throw o;
								}
							}
							return c;
						}
					})(t, r) ||
					(function (e, t) {
						if (e) {
							if ('string' == typeof e) return Re(e, t);
							var r = {}.toString.call(e).slice(8, -1);
							return (
								'Object' === r && e.constructor && (r = e.constructor.name),
								'Map' === r || 'Set' === r
									? Array.from(e)
									: 'Arguments' === r ||
										  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
										? Re(e, t)
										: void 0
							);
						}
					})(t, r) ||
					(function () {
						throw new TypeError(
							'Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
						);
					})()),
			i = o[0],
			a = o[1];
		if (!n || 0 === n.length) return null;
		var c = x(n),
			l = V(n),
			u = D(n),
			s = c
				? React.createElement(be, { fill: '#d82000' })
				: React.createElement(be, { fill: '#dbc900' });
		return React.createElement(
			React.Fragment,
			null,
			React.createElement(me.ToolbarButton, {
				icon: s,
				onClick: function () {
					return a(!0);
				},
				label: (0, ve.__)('View block issues or concerns', 'validation-api'),
				className: 'validation-api-toolbar-button',
				isCompact: !0,
			}),
			i &&
				React.createElement(
					me.Modal,
					{
						title: (0, ve.__)('Issues or Concerns', 'validation-api'),
						onRequestClose: function () {
							return a(!1);
						},
						className: 'validation-api-block-indicator-modal',
					},
					React.createElement(
						'div',
						{ className: 'validation-api-indicator-modal-content' },
						l.length > 0 &&
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
									l.map(function (e, t) {
										return React.createElement(
											'li',
											{ key: 'error-'.concat(t) },
											e.errorMsg
										);
									})
								)
							),
						u.length > 0 &&
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
									u.map(function (e, t) {
										return React.createElement(
											'li',
											{ key: 'warning-'.concat(t) },
											e.warningMsg || e.errorMsg
										);
									})
								)
							)
					)
				)
		);
	}
	function Ae(e) {
		return (
			(Ae =
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
			Ae(e)
		);
	}
	function _e(e, t) {
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
	function Be(e) {
		for (var t = 1; t < arguments.length; t++) {
			var r = null != arguments[t] ? arguments[t] : {};
			t % 2
				? _e(Object(r), !0).forEach(function (t) {
						Ne(e, t, r[t]);
					})
				: Object.getOwnPropertyDescriptors
					? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
					: _e(Object(r)).forEach(function (t) {
							Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
						});
		}
		return e;
	}
	function Ne(e, t, r) {
		return (
			(t = (function (e) {
				var t = (function (e) {
					if ('object' != Ae(e) || !e) return e;
					var t = e[Symbol.toPrimitive];
					if (void 0 !== t) {
						var r = t.call(e, 'string');
						if ('object' != Ae(r)) return r;
						throw new TypeError('@@toPrimitive must return a primitive value.');
					}
					return String(e);
				})(e);
				return 'symbol' == Ae(t) ? t : t + '';
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
	var Te = (0, Se.createHigherOrderComponent)(function (e) {
		return function (t) {
			var r = t.clientId,
				i = t.attributes,
				a = (0, n.useSelect)(
					function (e) {
						return e('core/block-editor').getBlock(r);
					},
					[r]
				),
				c = (0, n.useDispatch)(o),
				l = c.setBlockValidation,
				u = c.clearBlockValidation,
				s = (function (e, t) {
					var r,
						n,
						o = (arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {})
							.delay,
						i = void 0 === o ? 300 : o,
						a =
							((r = (0, _.useState)(function () {
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
											c = [],
											l = !0,
											u = !1;
										try {
											if (((i = (r = r.call(e)).next), 0 === t)) {
												if (Object(r) !== r) return;
												l = !1;
											} else
												for (
													;
													!(l = (n = i.call(r)).done) &&
													(c.push(n.value), c.length !== t);
													l = !0
												);
										} catch (e) {
											((u = !0), (o = e));
										} finally {
											try {
												if (
													!l &&
													null != r.return &&
													((a = r.return()), Object(a) !== a)
												)
													return;
											} finally {
												if (u) throw o;
											}
										}
										return c;
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
						c = a[0],
						l = a[1],
						u = (0, _.useRef)(null),
						s = (0, _.useRef)(!0);
					return (
						(0, _.useEffect)(function () {
							return s.current
								? ((s.current = !1), void l(e()))
								: (u.current && clearTimeout(u.current),
									(u.current = setTimeout(function () {
										l(e());
									}, i)),
									function () {
										u.current && clearTimeout(u.current);
									});
						}, t),
						c
					);
				})(
					function () {
						if (!a) return { isValid: !0, issues: [], mode: 'none' };
						var e = Be(Be({}, a), {}, { attributes: i || a.attributes });
						return Z(e);
					},
					[a, i],
					{ delay: 300 }
				);
			return (
				(0, _.useEffect)(
					function () {
						return (
							l(r, s),
							function () {
								return u(r);
							}
						);
					},
					[r, s, l, u]
				),
				React.createElement(
					React.Fragment,
					null,
					React.createElement(e, t),
					!s.isValid &&
						React.createElement(
							ke.BlockControls,
							{ group: 'block' },
							React.createElement(Ie, { issues: s.issues })
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
	function Le() {
		return (
			(Le = Object.assign
				? Object.assign.bind()
				: function (e) {
						for (var t = 1; t < arguments.length; t++) {
							var r = arguments[t];
							for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
						}
						return e;
					}),
			Le.apply(null, arguments)
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
	function Ve(e) {
		for (var t = 1; t < arguments.length; t++) {
			var r = null != arguments[t] ? arguments[t] : {};
			t % 2
				? Me(Object(r), !0).forEach(function (t) {
						De(e, t, r[t]);
					})
				: Object.getOwnPropertyDescriptors
					? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
					: Me(Object(r)).forEach(function (t) {
							Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
						});
		}
		return e;
	}
	function De(e, t, r) {
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
	function xe() {
		var e,
			t,
			r = 'function' == typeof Symbol ? Symbol : {},
			n = r.iterator || '@@iterator',
			o = r.toStringTag || '@@toStringTag';
		function i(r, n, o, i) {
			var l = n && n.prototype instanceof c ? n : c,
				u = Object.create(l.prototype);
			return (
				Fe(
					u,
					'_invoke',
					(function (r, n, o) {
						var i,
							c,
							l,
							u = 0,
							s = o || [],
							f = !1,
							d = {
								p: 0,
								n: 0,
								v: e,
								a: p,
								f: p.bind(e, 4),
								d: function (t, r) {
									return ((i = t), (c = 0), (l = e), (d.n = r), a);
								},
							};
						function p(r, n) {
							for (c = r, l = n, t = 0; !f && u && !o && t < s.length; t++) {
								var o,
									i = s[t],
									p = d.p,
									m = i[2];
								r > 3
									? (o = m === n) &&
										((l = i[(c = i[4]) ? 5 : ((c = 3), 3)]), (i[4] = i[5] = e))
									: i[0] <= p &&
										((o = r < 2 && p < i[1])
											? ((c = 0), (d.v = n), (d.n = i[1]))
											: p < m &&
												(o = r < 3 || i[0] > n || n > m) &&
												((i[4] = r), (i[5] = n), (d.n = m), (c = 0)));
							}
							if (o || r > 1) return a;
							throw ((f = !0), n);
						}
						return function (o, s, m) {
							if (u > 1) throw TypeError('Generator is already running');
							for (
								f && 1 === s && p(s, m), c = s, l = m;
								(t = c < 2 ? e : l) || !f;
							) {
								i ||
									(c
										? c < 3
											? (c > 1 && (d.n = -1), p(c, l))
											: (d.n = l)
										: (d.v = l));
								try {
									if (((u = 2), i)) {
										if ((c || (o = 'next'), (t = i[o]))) {
											if (!(t = t.call(i, l)))
												throw TypeError('iterator result is not an object');
											if (!t.done) return t;
											((l = t.value), c < 2 && (c = 0));
										} else
											(1 === c && (t = i.return) && t.call(i),
												c < 2 &&
													((l = TypeError(
														"The iterator does not provide a '" +
															o +
															"' method"
													)),
													(c = 1)));
										i = e;
									} else if ((t = (f = d.n < 0) ? l : r.call(n, d)) !== a) break;
								} catch (t) {
									((i = e), (c = 1), (l = t));
								} finally {
									u = 1;
								}
							}
							return { value: t, done: f };
						};
					})(r, o, i),
					!0
				),
				u
			);
		}
		var a = {};
		function c() {}
		function l() {}
		function u() {}
		t = Object.getPrototypeOf;
		var s = [][n]
				? t(t([][n]()))
				: (Fe((t = {}), n, function () {
						return this;
					}),
					t),
			f = (u.prototype = c.prototype = Object.create(s));
		function d(e) {
			return (
				Object.setPrototypeOf
					? Object.setPrototypeOf(e, u)
					: ((e.__proto__ = u), Fe(e, o, 'GeneratorFunction')),
				(e.prototype = Object.create(f)),
				e
			);
		}
		return (
			(l.prototype = u),
			Fe(f, 'constructor', u),
			Fe(u, 'constructor', l),
			(l.displayName = 'GeneratorFunction'),
			Fe(u, o, 'GeneratorFunction'),
			Fe(f),
			Fe(f, o, 'Generator'),
			Fe(f, n, function () {
				return this;
			}),
			Fe(f, 'toString', function () {
				return '[object Generator]';
			}),
			(xe = function () {
				return { w: i, m: d };
			})()
		);
	}
	function Fe(e, t, r, n) {
		var o = Object.defineProperty;
		try {
			o({}, '', {});
		} catch (e) {
			o = 0;
		}
		((Fe = function (e, t, r, n) {
			function i(t, r) {
				Fe(e, t, function (e) {
					return this._invoke(t, r, e);
				});
			}
			t
				? o
					? o(e, t, { value: r, enumerable: !n, configurable: !n, writable: !n })
					: (e[t] = r)
				: (i('next', 0), i('throw', 1), i('return', 2));
		}),
			Fe(e, t, r, n));
	}
	function Ke(e, t, r, n, o, i, a) {
		try {
			var c = e[i](a),
				l = c.value;
		} catch (e) {
			return void r(e);
		}
		c.done ? t(l) : Promise.resolve(l).then(n, o);
	}
	((0, B.addFilter)('editor.BlockEdit', 'validation-api/with-error-handling', Te),
		(0, B.addFilter)(
			'editor.BlockListBlock',
			'validation-api/with-block-validation-classes',
			function (e) {
				return function (t) {
					var r = (0, n.useSelect)(
						function (e) {
							return e(o).getBlockValidation(t.clientId);
						},
						[t.clientId]
					);
					if ('none' === r.mode) return React.createElement(e, t);
					var i =
							'error' === r.mode
								? 'validation-api-block-error'
								: 'validation-api-block-warning',
						a = t.wrapperProps || {},
						c = Ve(
							Ve({}, a),
							{},
							{ className: [a.className, i].filter(Boolean).join(' ') }
						);
					return React.createElement(e, Le({}, t, { wrapperProps: c }));
				};
			}
		),
		(0, B.addFilter)(
			'editor.preSavePost',
			'validation-api/pre-save-gate',
			(function () {
				var e,
					t =
						((e = xe().m(function e(t) {
							var r;
							return xe().w(function (e) {
								for (;;)
									switch (e.n) {
										case 0:
											if (
												!(
													(r = (0, n.select)(o)) &&
													r.hasErrors &&
													r.hasErrors()
												)
											) {
												e.n = 1;
												break;
											}
											throw new Error(
												(0, ve.__)(
													'Validation errors must be resolved before saving.',
													'validation-api'
												)
											);
										case 1:
											return e.a(2, t);
									}
							}, e);
						})),
						function () {
							var t = this,
								r = arguments;
							return new Promise(function (n, o) {
								var i = e.apply(t, r);
								function a(e) {
									Ke(i, n, o, a, c, 'next', e);
								}
								function c(e) {
									Ke(i, n, o, a, c, 'throw', e);
								}
								a(void 0);
							});
						});
				return function (_x) {
					return t.apply(this, arguments);
				};
			})()
		));
})();
