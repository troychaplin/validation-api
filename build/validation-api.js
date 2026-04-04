(() => {
	'use strict';
	const e = window.wp.plugins,
		t = window.wp.hooks,
		r = window.wp.data,
		n = window.wp.element;
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
	function i(e, t) {
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
	function o(e) {
		for (var t = 1; t < arguments.length; t++) {
			var r = null != arguments[t] ? arguments[t] : {};
			t % 2
				? i(Object(r), !0).forEach(function (t) {
						l(e, t, r[t]);
					})
				: Object.getOwnPropertyDescriptors
					? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
					: i(Object(r)).forEach(function (t) {
							Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
						});
		}
		return e;
	}
	function l(e, t, r) {
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
	var c = function (e, t) {
			return e.filter(function (e) {
				return e.type === t;
			});
		},
		u = function (e) {
			return c(e, 'error');
		},
		s = function (e) {
			return c(e, 'warning');
		},
		f = function (e) {
			return e.some(function (e) {
				return 'error' === e.type;
			});
		},
		m = function (e) {
			return e.some(function (e) {
				return 'warning' === e.type;
			});
		},
		d = function (e) {
			return null != e && !1 !== e.enabled;
		},
		p = function (e, t) {
			var r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {},
				n = e.message || '',
				a = e.error_msg || n,
				i = e.warning_msg || e.error_msg || n,
				l = e.level || 'error';
			return o(
				{
					check: t,
					checkName: t,
					type: l,
					priority: 'error' === l ? 1 : 'warning' === l ? 2 : 3,
					message: n,
					errorMsg: a,
					warningMsg: i,
					error_msg: a,
					warning_msg: i,
				},
				r
			);
		},
		v = function (e) {
			var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
			return o({ isValid: 0 === e.length, issues: e, hasErrors: f(e), hasWarnings: m(e) }, t);
		};
	function y(e, t) {
		(null == t || t > e.length) && (t = e.length);
		for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
		return n;
	}
	var b,
		g = function (e) {
			var r = e.name,
				n = e.attributes,
				a = [],
				i = G[r] || {};
			if (0 === Object.keys(i).length)
				return { isValid: !0, issues: [], mode: 'none', clientId: e.clientId, name: r };
			Object.entries(i).forEach(function (i) {
				var o,
					l,
					c =
						((l = 2),
						(function (e) {
							if (Array.isArray(e)) return e;
						})((o = i)) ||
							(function (e, t) {
								var r =
									null == e
										? null
										: ('undefined' != typeof Symbol && e[Symbol.iterator]) ||
											e['@@iterator'];
								if (null != r) {
									var n,
										a,
										i,
										o,
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
										((u = !0), (a = e));
									} finally {
										try {
											if (
												!c &&
												null != r.return &&
												((o = r.return()), Object(o) !== o)
											)
												return;
										} finally {
											if (u) throw a;
										}
									}
									return l;
								}
							})(o, l) ||
							(function (e, t) {
								if (e) {
									if ('string' == typeof e) return y(e, t);
									var r = {}.toString.call(e).slice(8, -1);
									return (
										'Object' === r && e.constructor && (r = e.constructor.name),
										'Map' === r || 'Set' === r
											? Array.from(e)
											: 'Arguments' === r ||
												  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
												? y(e, t)
												: void 0
									);
								}
							})(o, l) ||
							(function () {
								throw new TypeError(
									'Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
								);
							})()),
					u = c[0],
					s = c[1];
				if (d(s)) {
					var f = !0;
					('function' == typeof s.validator && (f = s.validator(n, e)),
						(f = (0, t.applyFilters)('validation_api_validate_block', f, r, n, u, e)) ||
							a.push(p(s, u)));
				}
			});
			var o = 'none';
			return (
				f(a) ? (o = 'error') : m(a) && (o = 'warning'),
				v(a, { mode: o, clientId: e.clientId, name: r })
			);
		};
	function w(e, t) {
		if (e) {
			if ('string' == typeof e) return h(e, t);
			var r = {}.toString.call(e).slice(8, -1);
			return (
				'Object' === r && e.constructor && (r = e.constructor.name),
				'Map' === r || 'Set' === r
					? Array.from(e)
					: 'Arguments' === r || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
						? h(e, t)
						: void 0
			);
		}
	}
	function h(e, t) {
		(null == t || t > e.length) && (t = e.length);
		for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
		return n;
	}
	function E(e) {
		return e.flatMap(function (e) {
			var t,
				r = g(e),
				n = [];
			return (
				r.isValid || n.push(r),
				e.innerBlocks && e.innerBlocks.length > 0
					? [].concat(
							n,
							(function (e) {
								if (Array.isArray(e)) return h(e);
							})((t = E(e.innerBlocks))) ||
								(function (e) {
									if (
										('undefined' != typeof Symbol &&
											null != e[Symbol.iterator]) ||
										null != e['@@iterator']
									)
										return Array.from(e);
								})(t) ||
								w(t) ||
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
	function O(e) {
		var t,
			r = (function (e) {
				var t = ('undefined' != typeof Symbol && e[Symbol.iterator]) || e['@@iterator'];
				if (!t) {
					if (Array.isArray(e) || (t = w(e))) {
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
					a = !0,
					i = !1;
				return {
					s: function () {
						t = t.call(e);
					},
					n: function () {
						var e = t.next();
						return ((a = e.done), e);
					},
					e: function (e) {
						((i = !0), (n = e));
					},
					f: function () {
						try {
							a || null == t.return || t.return();
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
					var a = O(n.innerBlocks);
					if (a) return a;
				}
			}
		} catch (e) {
			r.e(e);
		} finally {
			r.f();
		}
		return null;
	}
	function j() {
		var e,
			t =
				(null === (e = window.ValidationAPI) || void 0 === e ? void 0 : e.editorContext) ||
				'none',
			n = 'post-editor' === t || 'post-editor-template' === t;
		return E(
			(0, r.useSelect)(
				function (e) {
					var t = e('core/block-editor'),
						r = t.getBlocks();
					if (n) {
						var a = O(r);
						if (a) {
							var i = t.getBlock(a.clientId),
								o = t
									.getBlockOrder(a.clientId)
									.map(function (e) {
										var r = t.getBlock(e);
										return (t.getBlockOrder(e), r);
									})
									.filter(Boolean);
							return o.length > 0 ? o : (null == i ? void 0 : i.innerBlocks) || [];
						}
						return r;
					}
					return r;
				},
				[n]
			)
		).filter(function (e) {
			return !e.isValid;
		});
	}
	function S(e, t) {
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
						a,
						i,
						o,
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
						((u = !0), (a = e));
					} finally {
						try {
							if (!c && null != r.return && ((o = r.return()), Object(o) !== o))
								return;
						} finally {
							if (u) throw a;
						}
					}
					return l;
				}
			})(e, t) ||
			(function (e, t) {
				if (e) {
					if ('string' == typeof e) return R(e, t);
					var r = {}.toString.call(e).slice(8, -1);
					return (
						'Object' === r && e.constructor && (r = e.constructor.name),
						'Map' === r || 'Set' === r
							? Array.from(e)
							: 'Arguments' === r ||
								  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
								? R(e, t)
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
	function R(e, t) {
		(null == t || t > e.length) && (t = e.length);
		for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
		return n;
	}
	var P,
		k =
			(null === (b = window.ValidationAPI) || void 0 === b
				? void 0
				: b.metaValidationRules) || {};
	function A(e, r, n, a) {
		var i,
			o =
				null === (i = k[e]) || void 0 === i || null === (i = i[r]) || void 0 === i
					? void 0
					: i[a];
		if (!d(o)) return !0;
		var l = !0;
		return (
			'required' === a && (l = '' !== n && null != n),
			(0, t.applyFilters)('validation_api_validate_meta', l, n, e, r, a)
		);
	}
	function _(e, t, r) {
		for (
			var n = (k[e] || {})[t] || {}, a = [], i = 0, o = Object.entries(n);
			i < o.length;
			i++
		) {
			var l = S(o[i], 2),
				c = l[0],
				u = l[1];
			if (d(u) && !A(e, t, r, c)) {
				var s = p(u, c, { metaKey: t });
				((s.checkName = c), a.push(s));
			}
		}
		return v(a);
	}
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
	function I(e, t) {
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
				? I(Object(r), !0).forEach(function (t) {
						L(e, t, r[t]);
					})
				: Object.getOwnPropertyDescriptors
					? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
					: I(Object(r)).forEach(function (t) {
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
	function T() {
		for (
			var e,
				t = (0, r.useSelect)(function (e) {
					var t = e('core/editor');
					return {
						postType: t.getCurrentPostType(),
						meta: t.getEditedPostAttribute('meta'),
					};
				}, []),
				n = t.postType,
				a = t.meta,
				i =
					((null === (e = window.ValidationAPI) || void 0 === e
						? void 0
						: e.metaValidationRules) || {})[n] || {},
				o = [],
				l = 0,
				c = Object.keys(i);
			l < c.length;
			l++
		) {
			var u = c[l],
				s = _(n, u, null == a ? void 0 : a[u]);
			s.isValid || o.push(C(C({}, s), {}, { metaKey: u }));
		}
		return o;
	}
	function B(e, t) {
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
						a,
						i,
						o,
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
						((u = !0), (a = e));
					} finally {
						try {
							if (!c && null != r.return && ((o = r.return()), Object(o) !== o))
								return;
						} finally {
							if (u) throw a;
						}
					}
					return l;
				}
			})(e, t) ||
			(function (e, t) {
				if (e) {
					if ('string' == typeof e) return V(e, t);
					var r = {}.toString.call(e).slice(8, -1);
					return (
						'Object' === r && e.constructor && (r = e.constructor.name),
						'Map' === r || 'Set' === r
							? Array.from(e)
							: 'Arguments' === r ||
								  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
								? V(e, t)
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
	function V(e, t) {
		(null == t || t > e.length) && (t = e.length);
		for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
		return n;
	}
	var D =
		(null === (P = window.ValidationAPI) || void 0 === P ? void 0 : P.editorValidationRules) ||
		{};
	function M() {
		var e = (0, r.useSelect)(function (e) {
				var t = e('core/editor'),
					r = e('core/block-editor');
				return {
					postType: t.getCurrentPostType(),
					blocks: r.getBlocks(),
					title: t.getEditedPostAttribute('title'),
				};
			}, []),
			n = e.blocks,
			a = e.postType;
		if (!a || !n) return [];
		var i = (function (e, r) {
			for (var n = D[e] || {}, a = [], i = 0, o = Object.entries(n); i < o.length; i++) {
				var l = B(o[i], 2),
					c = l[0],
					u = l[1];
				if (
					d(u) &&
					!(0, t.applyFilters)('validation_api_validate_editor', !0, r, e, c, u)
				) {
					var s = p(u, c);
					((s.checkName = c), a.push(s));
				}
			}
			return (
				a.sort(function (e, t) {
					return e.priority - t.priority;
				}),
				v(a)
			);
		})(a, n);
		return i.issues;
	}
	function x() {
		var e,
			t =
				(null === (e = window.ValidationAPI) || void 0 === e ? void 0 : e.editorContext) ||
				'none',
			a = 'post-editor' === t || 'post-editor-template' === t,
			i = 'core/editor',
			o = (0, r.useDispatch)(i),
			l = wp.data && wp.data.select && wp.data.select(i),
			c = j(),
			u = T(),
			s = M(),
			d = o || {},
			p = d.lockPostSaving,
			v = d.unlockPostSaving,
			y = d.lockPostAutosaving,
			b = d.unlockPostAutosaving,
			g = d.disablePublishSidebar,
			w = d.enablePublishSidebar;
		return (
			(0, n.useEffect)(
				function () {
					if (a && 'none' !== t && l && p && v) {
						var e = c.some(function (e) {
								return 'error' === e.mode;
							}),
							r = u.some(function (e) {
								return e.hasErrors;
							}),
							n = f(s);
						e || r || n
							? (p('validation-api'), y && y('validation-api'), g && g())
							: (v('validation-api'), b && b('validation-api'), w && w());
					}
				},
				[c, u, s, p, v, y, b, g, w, a, t, l]
			),
			(0, n.useEffect)(
				function () {
					if (a && 'none' !== t && document.body) {
						var e = c.some(function (e) {
								return 'error' === e.mode;
							}),
							r = c.some(function (e) {
								return 'warning' === e.mode;
							}),
							n = u.some(function (e) {
								return e.hasErrors;
							}),
							i = u.some(function (e) {
								return e.hasWarnings && !e.hasErrors;
							}),
							o = f(s),
							l = m(s),
							d = e || n || o,
							p = !d && (r || i || l);
						return (
							d
								? (document.body.classList.add('has-meta-validation-errors'),
									document.body.classList.remove('has-meta-validation-warnings'))
								: p
									? (document.body.classList.add('has-meta-validation-warnings'),
										document.body.classList.remove(
											'has-meta-validation-errors'
										))
									: document.body.classList.remove(
											'has-meta-validation-errors',
											'has-meta-validation-warnings'
										),
							function () {
								document.body &&
									document.body.classList.remove(
										'has-meta-validation-errors',
										'has-meta-validation-warnings'
									);
							}
						);
					}
				},
				[c, u, s, a, t]
			),
			null
		);
	}
	const F = window.wp.editor,
		W = window.wp.components,
		U = window.wp.i18n,
		$ = window.wp.blocks;
	function q(e) {
		var t = e.fill,
			r = void 0 === t ? 'currentColor' : t;
		return React.createElement(
			'svg',
			{
				viewBox: '-2.12 -2.12 28.24 28.24',
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
	function K(e, t) {
		var r = new Map();
		return (
			e.forEach(function (e) {
				('error' === t ? u(e.issues || []) : s(e.issues || [])).forEach(function (n) {
					var a,
						i,
						o = 'error' === t ? n.error_msg : n.warning_msg || n.error_msg,
						l = ''.concat(e.name, '|').concat(o);
					(r.has(l) ||
						r.set(l, {
							blockName:
								((a = e.name),
								(i = (0, $.getBlockType)(a)),
								i && i.title
									? i.title
									: (a.split('/')[1] || a)
											.split(/[-_]/)
											.map(function (e) {
												return e.charAt(0).toUpperCase() + e.slice(1);
											})
											.join(' ')),
							blockType: e.name,
							message: o,
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
	function H(e, t) {
		var r = new Map();
		return (
			e.forEach(function (e) {
				('error' === t ? u(e.issues || []) : s(e.issues || [])).forEach(function (n) {
					var a = 'error' === t ? n.error_msg : n.warning_msg || n.error_msg,
						i = ''.concat(e.metaKey, '|').concat(a);
					r.has(i) || r.set(i, { metaKey: e.metaKey, message: a });
				});
			}),
			Array.from(r.values())
		);
	}
	function Z(e, t) {
		var r = new Map();
		return (
			e.forEach(function (e) {
				var n =
						'error' === t
							? e.errorMsg || e.error_msg
							: e.warningMsg || e.warning_msg || e.errorMsg || e.error_msg,
					a = n;
				r.has(a) || r.set(a, { message: n, description: e.description });
			}),
			Array.from(r.values())
		);
	}
	function z() {
		var e = j() || [],
			t = T() || [],
			a = M() || [],
			i = (0, r.useDispatch)('core/block-editor').selectBlock,
			o = (0, n.useRef)(null),
			l = c(a, 'error'),
			u = c(a, 'warning'),
			s = K(e, 'error'),
			f = K(e, 'warning'),
			m = H(t, 'error'),
			d = H(t, 'warning'),
			p = Z(l, 'error'),
			v = Z(u, 'warning'),
			y = s.length + m.length + p.length,
			b = f.length + d.length + v.length,
			g = 'currentColor';
		y > 0 ? (g = '#d82000') : b > 0 && (g = '#dbc900');
		var w = React.createElement(q, { fill: g }),
			h = function (e) {
				e &&
					(i(e),
					o.current && clearTimeout(o.current),
					(o.current = setTimeout(function () {
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
			(0, n.useEffect)(function () {
				return function () {
					o.current && clearTimeout(o.current);
				};
			}, []),
			0 === y && 0 === b
				? null
				: React.createElement(
						F.PluginSidebar,
						{
							name: 'validation-sidebar',
							title: (0, U.__)('Validation', 'validation-api'),
							icon: w,
							className: 'validation-api-validation-sidebar',
						},
						y > 0 &&
							React.createElement(
								W.PanelBody,
								{
									title: (0, U.sprintf)(
										/* translators: %d: number of errors */ /* translators: %d: number of errors */
										(0, U.__)('Errors (%d)', 'validation-api'),
										y
									),
									initialOpen: !0,
									className: 'validation-api-errors-panel',
								},
								s.length > 0 &&
									React.createElement(
										W.PanelRow,
										null,
										React.createElement(
											'div',
											{ className: 'validation-api-error-group' },
											React.createElement(
												'p',
												{ className: 'validation-api-error-subheading' },
												React.createElement(
													'strong',
													null,
													React.createElement('span', {
														className:
															'validation-api-indicator-circle',
													}),
													(0, U.__)('Block Errors', 'validation-api')
												)
											),
											React.createElement(
												'ul',
												{ className: 'validation-api-error-list' },
												s.map(function (e, t) {
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
								m.length > 0 &&
									React.createElement(
										W.PanelRow,
										null,
										React.createElement(
											'div',
											{ className: 'validation-api-error-group' },
											React.createElement(
												'p',
												{ className: 'validation-api-error-subheading' },
												React.createElement(
													'strong',
													null,
													React.createElement('span', {
														className:
															'validation-api-indicator-circle',
													}),
													(0, U.__)('Meta Errors', 'validation-api')
												)
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
								p.length > 0 &&
									React.createElement(
										W.PanelRow,
										null,
										React.createElement(
											'div',
											{ className: 'validation-api-error-group' },
											React.createElement(
												'p',
												{ className: 'validation-api-error-subheading' },
												React.createElement(
													'strong',
													null,
													React.createElement('span', {
														className:
															'validation-api-indicator-circle',
													}),
													(0, U.__)('Editor Errors', 'validation-api')
												)
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
						b > 0 &&
							React.createElement(
								W.PanelBody,
								{
									title: (0, U.sprintf)(
										/* translators: %d: number of warnings */ /* translators: %d: number of warnings */
										(0, U.__)('Warnings (%d)', 'validation-api'),
										b
									),
									initialOpen: !0,
									className: 'validation-api-warnings-panel',
								},
								f.length > 0 &&
									React.createElement(
										W.PanelRow,
										null,
										React.createElement(
											'div',
											{ className: 'validation-api-warning-group' },
											React.createElement(
												'p',
												{ className: 'validation-api-warning-subheading' },
												React.createElement(
													'strong',
													null,
													React.createElement('span', {
														className:
															'validation-api-indicator-circle',
													}),
													(0, U.__)('Block Warnings', 'validation-api')
												)
											),
											React.createElement(
												'ul',
												{ className: 'validation-api-warning-list' },
												f.map(function (e, t) {
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
										W.PanelRow,
										null,
										React.createElement(
											'div',
											{ className: 'validation-api-warning-group' },
											React.createElement(
												'p',
												{ className: 'validation-api-warning-subheading' },
												React.createElement(
													'strong',
													null,
													React.createElement('span', {
														className:
															'validation-api-indicator-circle',
													}),
													(0, U.__)('Meta Warnings', 'validation-api')
												)
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
								v.length > 0 &&
									React.createElement(
										W.PanelRow,
										null,
										React.createElement(
											'div',
											{ className: 'validation-api-warning-group' },
											React.createElement(
												'p',
												{ className: 'validation-api-warning-subheading' },
												React.createElement(
													'strong',
													null,
													React.createElement('span', {
														className:
															'validation-api-indicator-circle',
													}),
													(0, U.__)('Editor Warnings', 'validation-api')
												)
											),
											React.createElement(
												'ul',
												{ className: 'validation-api-warning-list' },
												v.map(function (e, t) {
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
	(0, t.addFilter)(
		'blocks.registerBlockType',
		'validation-api/add-validation-category',
		function (e) {
			return e;
		}
	);
	var G = new Proxy(
		{},
		{
			get: function (e, t) {
				if (window.ValidationAPI && window.ValidationAPI.validationRules)
					return window.ValidationAPI.validationRules[t];
			},
		}
	);
	(0, e.registerPlugin)('validation-api', {
		render: function () {
			return React.createElement(
				React.Fragment,
				null,
				React.createElement(x, null),
				React.createElement(z, null)
			);
		},
	});
	const J = window.wp.compose,
		Q = window.wp.blockEditor;
	function X(e, t) {
		(null == t || t > e.length) && (t = e.length);
		for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
		return n;
	}
	function Y(e) {
		var t,
			r,
			a = e.issues,
			i =
				((t = (0, n.useState)(!1)),
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
								a,
								i,
								o,
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
								((u = !0), (a = e));
							} finally {
								try {
									if (
										!c &&
										null != r.return &&
										((o = r.return()), Object(o) !== o)
									)
										return;
								} finally {
									if (u) throw a;
								}
							}
							return l;
						}
					})(t, r) ||
					(function (e, t) {
						if (e) {
							if ('string' == typeof e) return X(e, t);
							var r = {}.toString.call(e).slice(8, -1);
							return (
								'Object' === r && e.constructor && (r = e.constructor.name),
								'Map' === r || 'Set' === r
									? Array.from(e)
									: 'Arguments' === r ||
										  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
										? X(e, t)
										: void 0
							);
						}
					})(t, r) ||
					(function () {
						throw new TypeError(
							'Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
						);
					})()),
			o = i[0],
			l = i[1];
		if (!a || 0 === a.length) return null;
		var c = f(a),
			m = u(a),
			d = s(a),
			p = c
				? React.createElement(q, { fill: '#d82000' })
				: React.createElement(q, { fill: '#d8c600' });
		return React.createElement(
			React.Fragment,
			null,
			React.createElement(W.ToolbarButton, {
				icon: p,
				onClick: function () {
					return l(!0);
				},
				label: (0, U.__)('View block issues or concerns', 'validation-api'),
				className: 'validation-api-toolbar-button',
				isCompact: !0,
			}),
			o &&
				React.createElement(
					W.Modal,
					{
						title: (0, U.__)('Issues or Concerns', 'validation-api'),
						onRequestClose: function () {
							return l(!1);
						},
						className: 'validation-api-block-indicator-modal',
					},
					React.createElement(
						'div',
						{ className: 'validation-api-indicator-modal-content' },
						m.length > 0 &&
							React.createElement(
								'div',
								{
									className:
										'validation-api-indicator-section validation-api-indicator-errors',
								},
								React.createElement(
									'p',
									null,
									React.createElement(
										'strong',
										{ className: 'validation-api-indicator-section-title' },
										React.createElement('span', {
											className:
												'validation-api-indicator-section-title-circle',
										}),
										(0, U.__)('Errors', 'validation-api')
									)
								),
								React.createElement(
									'ul',
									null,
									m.map(function (e, t) {
										return React.createElement(
											'li',
											{ key: 'error-'.concat(t) },
											e.error_msg
										);
									})
								)
							),
						d.length > 0 &&
							React.createElement(
								'div',
								{
									className:
										'validation-api-indicator-section validation-api-indicator-warnings',
								},
								React.createElement(
									'p',
									null,
									React.createElement(
										'strong',
										{ className: 'validation-api-indicator-section-title' },
										React.createElement('span', {
											className:
												'validation-api-indicator-section-title-circle',
										}),
										(0, U.__)('Warnings', 'validation-api')
									)
								),
								React.createElement(
									'ul',
									null,
									d.map(function (e, t) {
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
	function ee(e, t) {
		(null == t || t > e.length) && (t = e.length);
		for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
		return n;
	}
	var te = new Map(),
		re = Object.freeze({ mode: 'none', issues: [] });
	function ne(e) {
		return (
			(ne =
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
			ne(e)
		);
	}
	function ae(e, t) {
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
	function ie(e) {
		for (var t = 1; t < arguments.length; t++) {
			var r = null != arguments[t] ? arguments[t] : {};
			t % 2
				? ae(Object(r), !0).forEach(function (t) {
						oe(e, t, r[t]);
					})
				: Object.getOwnPropertyDescriptors
					? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
					: ae(Object(r)).forEach(function (t) {
							Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
						});
		}
		return e;
	}
	function oe(e, t, r) {
		return (
			(t = (function (e) {
				var t = (function (e) {
					if ('object' != ne(e) || !e) return e;
					var t = e[Symbol.toPrimitive];
					if (void 0 !== t) {
						var r = t.call(e, 'string');
						if ('object' != ne(r)) return r;
						throw new TypeError('@@toPrimitive must return a primitive value.');
					}
					return String(e);
				})(e);
				return 'symbol' == ne(t) ? t : t + '';
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
	var le = (0, J.createHigherOrderComponent)(function (e) {
		return function (t) {
			var a = t.clientId,
				i = t.attributes,
				o = (0, r.useSelect)(
					function (e) {
						return e('core/block-editor').getBlock(a);
					},
					[a]
				),
				l = (function (e, t) {
					var r,
						a,
						i = (arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {})
							.delay,
						o = void 0 === i ? 300 : i,
						l =
							((r = (0, n.useState)(function () {
								return e();
							})),
							(a = 2),
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
											a,
											i,
											o,
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
											((u = !0), (a = e));
										} finally {
											try {
												if (
													!c &&
													null != r.return &&
													((o = r.return()), Object(o) !== o)
												)
													return;
											} finally {
												if (u) throw a;
											}
										}
										return l;
									}
								})(r, a) ||
								(function (e, t) {
									if (e) {
										if ('string' == typeof e) return ee(e, t);
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
													? ee(e, t)
													: void 0
										);
									}
								})(r, a) ||
								(function () {
									throw new TypeError(
										'Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
									);
								})()),
						c = l[0],
						u = l[1],
						s = (0, n.useRef)(null),
						f = (0, n.useRef)(!0);
					return (
						(0, n.useEffect)(function () {
							return f.current
								? ((f.current = !1), void u(e()))
								: (s.current && clearTimeout(s.current),
									(s.current = setTimeout(function () {
										u(e());
									}, o)),
									function () {
										s.current && clearTimeout(s.current);
									});
						}, t),
						c
					);
				})(
					function () {
						if (!o) return { isValid: !0, issues: [], mode: 'none' };
						var e = ie(ie({}, o), {}, { attributes: i || o.attributes });
						return g(e);
					},
					[o, i],
					{ delay: 300 }
				);
			return (
				(0, n.useEffect)(
					function () {
						return (
							(function (e, t) {
								te.set(e, t);
							})(a, l),
							function () {
								return (function (e) {
									te.delete(e);
								})(a);
							}
						);
					},
					[a, l]
				),
				React.createElement(
					React.Fragment,
					null,
					React.createElement(e, t),
					!l.isValid &&
						React.createElement(
							Q.BlockControls,
							{ group: 'other' },
							React.createElement(Y, { issues: l.issues })
						)
				)
			);
		};
	}, 'withErrorHandling');
	function ce(e) {
		return (
			(ce =
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
			ce(e)
		);
	}
	function ue() {
		return (
			(ue = Object.assign
				? Object.assign.bind()
				: function (e) {
						for (var t = 1; t < arguments.length; t++) {
							var r = arguments[t];
							for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
						}
						return e;
					}),
			ue.apply(null, arguments)
		);
	}
	function se(e, t) {
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
	function fe(e) {
		for (var t = 1; t < arguments.length; t++) {
			var r = null != arguments[t] ? arguments[t] : {};
			t % 2
				? se(Object(r), !0).forEach(function (t) {
						me(e, t, r[t]);
					})
				: Object.getOwnPropertyDescriptors
					? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
					: se(Object(r)).forEach(function (t) {
							Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
						});
		}
		return e;
	}
	function me(e, t, r) {
		return (
			(t = (function (e) {
				var t = (function (e) {
					if ('object' != ce(e) || !e) return e;
					var t = e[Symbol.toPrimitive];
					if (void 0 !== t) {
						var r = t.call(e, 'string');
						if ('object' != ce(r)) return r;
						throw new TypeError('@@toPrimitive must return a primitive value.');
					}
					return String(e);
				})(e);
				return 'symbol' == ce(t) ? t : t + '';
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
	function de(e) {
		return (
			(de =
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
			de(e)
		);
	}
	function pe(e, t) {
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
	function ve(e) {
		for (var t = 1; t < arguments.length; t++) {
			var r = null != arguments[t] ? arguments[t] : {};
			t % 2
				? pe(Object(r), !0).forEach(function (t) {
						ye(e, t, r[t]);
					})
				: Object.getOwnPropertyDescriptors
					? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
					: pe(Object(r)).forEach(function (t) {
							Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
						});
		}
		return e;
	}
	function ye(e, t, r) {
		return (
			(t = (function (e) {
				var t = (function (e) {
					if ('object' != de(e) || !e) return e;
					var t = e[Symbol.toPrimitive];
					if (void 0 !== t) {
						var r = t.call(e, 'string');
						if ('object' != de(r)) return r;
						throw new TypeError('@@toPrimitive must return a primitive value.');
					}
					return String(e);
				})(e);
				return 'symbol' == de(t) ? t : t + '';
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
	function be(e) {
		return (
			(be =
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
			be(e)
		);
	}
	(wp.hooks.addFilter('editor.BlockEdit', 'validation-api/with-error-handling', le),
		wp.hooks.addFilter(
			'editor.BlockListBlock',
			'validation-api/with-block-validation-classes',
			function (e) {
				return function (t) {
					var r,
						n = ((r = t.clientId), te.get(r) || re);
					if ('none' === n.mode) return React.createElement(e, t);
					var a =
							'error' === n.mode
								? 'validation-api-block-error'
								: 'validation-api-block-warning',
						i = t.wrapperProps || {},
						o = fe(
							fe({}, i),
							{},
							{ className: [i.className, a].filter(Boolean).join(' ') }
						);
					return React.createElement(e, ue({}, t, { wrapperProps: o }));
				};
			}
		),
		void 0 === window.ValidationAPI && (window.ValidationAPI = {}),
		(window.ValidationAPI.useMetaField = function (e) {
			var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : '',
				n = (function (e) {
					return (0, r.useSelect)(
						function (t) {
							var r = t('core/editor'),
								n = r.getEditedPostAttribute,
								a = (0, r.getCurrentPostType)(),
								i = n('meta'),
								o = i ? i[e] : '';
							if (!a || !e)
								return {
									isValid: !0,
									hasErrors: !1,
									hasWarnings: !1,
									issues: [],
									wrapperClassName: '',
								};
							var l = _(a, e, o),
								c = '';
							return (
								l.hasErrors
									? (c = 'validation-api-meta-error')
									: l.hasWarnings && (c = 'validation-api-meta-warning'),
								ve(ve({}, l), {}, { wrapperClassName: c })
							);
						},
						[e]
					);
				})(e),
				a = (0, r.useSelect)(
					function (t) {
						var r = t('core/editor');
						if (!r) return { value: '' };
						var n = r.getEditedPostAttribute('meta');
						return { value: n ? n[e] : '' };
					},
					[e]
				).value,
				i = (0, r.useDispatch)('core/editor').editPost,
				o = t;
			if (n && (n.hasErrors || n.hasWarnings)) {
				var l = n.issues
						.map(function (e) {
							return e.message || e.error_msg || e.warning_msg;
						})
						.join('. '),
					c = n.hasErrors ? 'validation-api-error-text' : 'validation-api-warning-text';
				o = o
					? React.createElement(
							React.Fragment,
							null,
							o,
							React.createElement('span', { className: c }, '* ', l)
						)
					: React.createElement('span', { className: c }, '* ', l);
			}
			return {
				value: a || '',
				onChange: function (t) {
					var r, n, a;
					i &&
						i({
							meta:
								((r = {}),
								(n = e),
								(a = t),
								(n = (function (e) {
									var t = (function (e) {
										if ('object' != be(e) || !e) return e;
										var t = e[Symbol.toPrimitive];
										if (void 0 !== t) {
											var r = t.call(e, 'string');
											if ('object' != be(r)) return r;
											throw new TypeError(
												'@@toPrimitive must return a primitive value.'
											);
										}
										return String(e);
									})(e);
									return 'symbol' == be(t) ? t : t + '';
								})(n)) in r
									? Object.defineProperty(r, n, {
											value: a,
											enumerable: !0,
											configurable: !0,
											writable: !0,
										})
									: (r[n] = a),
								r),
						});
				},
				help: o,
				className:
					null != n && n.wrapperClassName
						? 'validation-api-field '.concat(n.wrapperClassName)
						: '',
			};
		}));
})();
