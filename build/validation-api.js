(() => {
	'use strict';
	const e = window.wp.plugins,
		t = window.wp.data,
		r = window.wp.element;
	function n(e) {
		return (
			(n =
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
			n(e)
		);
	}
	function o(e, t) {
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
	function a(e) {
		for (var t = 1; t < arguments.length; t++) {
			var r = null != arguments[t] ? arguments[t] : {};
			t % 2
				? o(Object(r), !0).forEach(function (t) {
						i(e, t, r[t]);
					})
				: Object.getOwnPropertyDescriptors
					? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
					: o(Object(r)).forEach(function (t) {
							Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
						});
		}
		return e;
	}
	function i(e, t, r) {
		return (
			(t = (function (e) {
				var t = (function (e) {
					if ('object' != n(e) || !e) return e;
					var t = e[Symbol.toPrimitive];
					if (void 0 !== t) {
						var r = t.call(e, 'string');
						if ('object' != n(r)) return r;
						throw new TypeError('@@toPrimitive must return a primitive value.');
					}
					return String(e);
				})(e);
				return 'symbol' == n(t) ? t : t + '';
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
	var l = function (e, t) {
			return e.filter(function (e) {
				return e.type === t;
			});
		},
		c = function (e) {
			return l(e, 'error');
		},
		u = function (e) {
			return l(e, 'warning');
		},
		s = function (e) {
			return e.some(function (e) {
				return 'error' === e.type;
			});
		},
		f = function (e) {
			return e.some(function (e) {
				return 'warning' === e.type;
			});
		},
		m = function (e) {
			return null != e && !1 !== e.enabled;
		},
		d = function (e, t) {
			var r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {},
				n = e.message || '',
				o = e.error_msg || n,
				i = e.warning_msg || e.error_msg || n,
				l = e.level || 'error';
			return a(
				{
					check: t,
					checkName: t,
					type: l,
					priority: 'error' === l ? 1 : 'warning' === l ? 2 : 3,
					message: n,
					errorMsg: o,
					warningMsg: i,
					error_msg: o,
					warning_msg: i,
				},
				r
			);
		},
		p = function (e) {
			var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
			return a({ isValid: 0 === e.length, issues: e, hasErrors: s(e), hasWarnings: f(e) }, t);
		};
	const v = window.wp.hooks;
	function y(e, t) {
		(null == t || t > e.length) && (t = e.length);
		for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
		return n;
	}
	var b,
		g = function (e) {
			var t,
				r = e.name,
				n = e.attributes,
				o = [],
				a =
					(null === (t = window.ValidationAPI) ||
					void 0 === t ||
					null === (t = t.validationRules) ||
					void 0 === t
						? void 0
						: t[r]) || {};
			if (0 === Object.keys(a).length)
				return { isValid: !0, issues: [], mode: 'none', clientId: e.clientId, name: r };
			Object.entries(a).forEach(function (t) {
				var a,
					i,
					l =
						((i = 2),
						(function (e) {
							if (Array.isArray(e)) return e;
						})((a = t)) ||
							(function (e, t) {
								var r =
									null == e
										? null
										: ('undefined' != typeof Symbol && e[Symbol.iterator]) ||
											e['@@iterator'];
								if (null != r) {
									var n,
										o,
										a,
										i,
										l = [],
										c = !0,
										u = !1;
									try {
										if (((a = (r = r.call(e)).next), 0 === t)) {
											if (Object(r) !== r) return;
											c = !1;
										} else
											for (
												;
												!(c = (n = a.call(r)).done) &&
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
												((i = r.return()), Object(i) !== i)
											)
												return;
										} finally {
											if (u) throw o;
										}
									}
									return l;
								}
							})(a, i) ||
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
							})(a, i) ||
							(function () {
								throw new TypeError(
									'Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
								);
							})()),
					c = l[0],
					u = l[1];
				if (m(u)) {
					var s = !0;
					('function' == typeof u.validator && (s = u.validator(n, e)),
						(s = (0, v.applyFilters)('validation_api_validate_block', s, r, n, c, e)) ||
							o.push(d(u, c)));
				}
			});
			var i = 'none';
			return (
				s(o) ? (i = 'error') : f(o) && (i = 'warning'),
				p(o, { mode: i, clientId: e.clientId, name: r })
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
	function O(e) {
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
							})((t = O(e.innerBlocks))) ||
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
	function E(e) {
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
					o = !0,
					a = !1;
				return {
					s: function () {
						t = t.call(e);
					},
					n: function () {
						var e = t.next();
						return ((o = e.done), e);
					},
					e: function (e) {
						((a = !0), (n = e));
					},
					f: function () {
						try {
							o || null == t.return || t.return();
						} finally {
							if (a) throw n;
						}
					},
				};
			})(e);
		try {
			for (r.s(); !(t = r.n()).done; ) {
				var n = t.value;
				if ('core/post-content' === n.name) return n;
				if (n.innerBlocks && n.innerBlocks.length > 0) {
					var o = E(n.innerBlocks);
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
	function j() {
		var e,
			r =
				(null === (e = window.ValidationAPI) || void 0 === e ? void 0 : e.editorContext) ||
				'none',
			n = 'post-editor' === r || 'post-editor-template' === r;
		return O(
			(0, t.useSelect)(
				function (e) {
					var t = e('core/block-editor'),
						r = t.getBlocks();
					if (n) {
						var o = E(r);
						if (o) {
							var a = t.getBlock(o.clientId),
								i = t
									.getBlockOrder(o.clientId)
									.map(function (e) {
										var r = t.getBlock(e);
										return (t.getBlockOrder(e), r);
									})
									.filter(Boolean);
							return i.length > 0 ? i : (null == a ? void 0 : a.innerBlocks) || [];
						}
						return r;
					}
					return r;
				},
				[n]
			)
		);
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
						o,
						a,
						i,
						l = [],
						c = !0,
						u = !1;
					try {
						if (((a = (r = r.call(e)).next), 0 === t)) {
							if (Object(r) !== r) return;
							c = !1;
						} else
							for (
								;
								!(c = (n = a.call(r)).done) && (l.push(n.value), l.length !== t);
								c = !0
							);
					} catch (e) {
						((u = !0), (o = e));
					} finally {
						try {
							if (!c && null != r.return && ((i = r.return()), Object(i) !== i))
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
					if ('string' == typeof e) return P(e, t);
					var r = {}.toString.call(e).slice(8, -1);
					return (
						'Object' === r && e.constructor && (r = e.constructor.name),
						'Map' === r || 'Set' === r
							? Array.from(e)
							: 'Arguments' === r ||
								  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
								? P(e, t)
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
	function P(e, t) {
		(null == t || t > e.length) && (t = e.length);
		for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
		return n;
	}
	var R,
		k =
			(null === (b = window.ValidationAPI) || void 0 === b
				? void 0
				: b.metaValidationRules) || {};
	function A(e, t, r, n) {
		var o,
			a =
				null === (o = k[e]) || void 0 === o || null === (o = o[t]) || void 0 === o
					? void 0
					: o[n];
		if (!m(a)) return !0;
		var i = !0;
		return (
			'required' === n && (i = '' !== r && null != r),
			(0, v.applyFilters)('validation_api_validate_meta', i, r, e, t, n)
		);
	}
	function I(e, t, r) {
		for (
			var n = (k[e] || {})[t] || {}, o = [], a = 0, i = Object.entries(n);
			a < i.length;
			a++
		) {
			var l = S(i[a], 2),
				c = l[0],
				u = l[1];
			if (m(u) && !A(e, t, r, c)) {
				var s = d(u, c, { metaKey: t });
				o.push(s);
			}
		}
		return p(o);
	}
	function _(e) {
		return (
			(_ =
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
			_(e)
		);
	}
	function N(e, t) {
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
				? N(Object(r), !0).forEach(function (t) {
						L(e, t, r[t]);
					})
				: Object.getOwnPropertyDescriptors
					? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
					: N(Object(r)).forEach(function (t) {
							Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
						});
		}
		return e;
	}
	function L(e, t, r) {
		return (
			(t = (function (e) {
				var t = (function (e) {
					if ('object' != _(e) || !e) return e;
					var t = e[Symbol.toPrimitive];
					if (void 0 !== t) {
						var r = t.call(e, 'string');
						if ('object' != _(r)) return r;
						throw new TypeError('@@toPrimitive must return a primitive value.');
					}
					return String(e);
				})(e);
				return 'symbol' == _(t) ? t : t + '';
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
				r = (0, t.useSelect)(function (e) {
					var t = e('core/editor');
					return {
						postType: t.getCurrentPostType(),
						meta: t.getEditedPostAttribute('meta'),
					};
				}, []),
				n = r.postType,
				o = r.meta,
				a =
					((null === (e = window.ValidationAPI) || void 0 === e
						? void 0
						: e.metaValidationRules) || {})[n] || {},
				i = [],
				l = 0,
				c = Object.keys(a);
			l < c.length;
			l++
		) {
			var u = c[l],
				s = I(n, u, null == o ? void 0 : o[u]);
			s.isValid || i.push(C(C({}, s), {}, { metaKey: u }));
		}
		return i;
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
						o,
						a,
						i,
						l = [],
						c = !0,
						u = !1;
					try {
						if (((a = (r = r.call(e)).next), 0 === t)) {
							if (Object(r) !== r) return;
							c = !1;
						} else
							for (
								;
								!(c = (n = a.call(r)).done) && (l.push(n.value), l.length !== t);
								c = !0
							);
					} catch (e) {
						((u = !0), (o = e));
					} finally {
						try {
							if (!c && null != r.return && ((i = r.return()), Object(i) !== i))
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
		(null === (R = window.ValidationAPI) || void 0 === R ? void 0 : R.editorValidationRules) ||
		{};
	function M() {
		var e = (0, t.useSelect)(function (e) {
				var t = e('core/editor'),
					r = e('core/block-editor');
				return {
					postType: t.getCurrentPostType(),
					blocks: r.getBlocks(),
					title: t.getEditedPostAttribute('title'),
				};
			}, []),
			r = e.blocks,
			n = e.postType;
		if (!n || !r) return [];
		var o = (function (e, t) {
			for (var r = D[e] || {}, n = [], o = 0, a = Object.entries(r); o < a.length; o++) {
				var i = B(a[o], 2),
					l = i[0],
					c = i[1];
				if (
					m(c) &&
					!(0, v.applyFilters)('validation_api_validate_editor', !0, t, e, l, c)
				) {
					var u = d(c, l);
					n.push(u);
				}
			}
			return (
				n.sort(function (e, t) {
					return e.priority - t.priority;
				}),
				p(n)
			);
		})(n, r);
		return o.issues;
	}
	function x() {
		var e,
			n =
				(null === (e = window.ValidationAPI) || void 0 === e ? void 0 : e.editorContext) ||
				'none',
			o = 'post-editor' === n || 'post-editor-template' === n,
			a = 'core/editor',
			i = (0, t.useDispatch)(a),
			l = wp.data && wp.data.select && wp.data.select(a),
			c = j(),
			u = T(),
			m = M(),
			d = i || {},
			p = d.lockPostSaving,
			v = d.unlockPostSaving,
			y = d.lockPostAutosaving,
			b = d.unlockPostAutosaving,
			g = d.disablePublishSidebar,
			w = d.enablePublishSidebar;
		return (
			(0, r.useEffect)(
				function () {
					if (o && 'none' !== n && l && p && v) {
						var e = c.some(function (e) {
								return 'error' === e.mode;
							}),
							t = u.some(function (e) {
								return e.hasErrors;
							}),
							r = s(m);
						e || t || r
							? (p('validation-api'), y && y('validation-api'), g && g())
							: (v('validation-api'), b && b('validation-api'), w && w());
					}
				},
				[c, u, m, p, v, y, b, g, w, o, n, l]
			),
			(0, r.useEffect)(
				function () {
					if (o && 'none' !== n && document.body) {
						var e = c.some(function (e) {
								return 'error' === e.mode;
							}),
							t = c.some(function (e) {
								return 'warning' === e.mode;
							}),
							r = u.some(function (e) {
								return e.hasErrors;
							}),
							a = u.some(function (e) {
								return e.hasWarnings && !e.hasErrors;
							}),
							i = s(m),
							l = f(m),
							d = e || r || i,
							p = !d && (t || a || l);
						return (
							d
								? (document.body.classList.add('has-validation-errors'),
									document.body.classList.remove('has-validation-warnings'))
								: p
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
				[c, u, m, o, n]
			),
			null
		);
	}
	const F = window.wp.editor,
		U = window.wp.components,
		W = window.wp.i18n,
		$ = window.wp.blocks;
	function q(e) {
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
	function K(e, t) {
		var r = new Map();
		return (
			e.forEach(function (e) {
				('error' === t ? c(e.issues || []) : u(e.issues || [])).forEach(function (n) {
					var o,
						a,
						i = 'error' === t ? n.error_msg : n.warning_msg || n.error_msg,
						l = ''.concat(e.name, '|').concat(i);
					(r.has(l) ||
						r.set(l, {
							blockName:
								((o = e.name),
								(a = (0, $.getBlockType)(o)),
								a && a.title
									? a.title
									: (o.split('/')[1] || o)
											.split(/[-_]/)
											.map(function (e) {
												return e.charAt(0).toUpperCase() + e.slice(1);
											})
											.join(' ')),
							blockType: e.name,
							message: i,
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
				('error' === t ? c(e.issues || []) : u(e.issues || [])).forEach(function (n) {
					var o = 'error' === t ? n.error_msg : n.warning_msg || n.error_msg,
						a = ''.concat(e.metaKey, '|').concat(o);
					r.has(a) || r.set(a, { metaKey: e.metaKey, message: o });
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
					o = n;
				r.has(o) || r.set(o, { message: n, description: e.description });
			}),
			Array.from(r.values())
		);
	}
	function z() {
		var e = j() || [],
			n = T() || [],
			o = M() || [],
			a = (0, t.useDispatch)('core/block-editor').selectBlock,
			i = (0, r.useRef)(null),
			c = l(o, 'error'),
			u = l(o, 'warning'),
			s = K(e, 'error'),
			f = K(e, 'warning'),
			m = H(n, 'error'),
			d = H(n, 'warning'),
			p = Z(c, 'error'),
			v = Z(u, 'warning'),
			y = s.length + m.length + p.length,
			b = f.length + d.length + v.length,
			g = 'currentColor';
		y > 0 ? (g = '#d82000') : b > 0 && (g = '#dbc900');
		var w = React.createElement(q, { fill: g }),
			h = function (e) {
				e &&
					(a(e),
					i.current && clearTimeout(i.current),
					(i.current = setTimeout(function () {
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
			(0, r.useEffect)(function () {
				return function () {
					i.current && clearTimeout(i.current);
				};
			}, []),
			0 === y && 0 === b
				? null
				: React.createElement(
						F.PluginSidebar,
						{
							name: 'validation-sidebar',
							title: (0, W.__)('Validation', 'validation-api'),
							icon: w,
							className: 'validation-api-validation-sidebar',
						},
						y > 0 &&
							React.createElement(
								U.PanelBody,
								{
									title: (0, W.sprintf)(
										/* translators: %d: number of errors */ /* translators: %d: number of errors */
										(0, W.__)('Errors (%d)', 'validation-api'),
										y
									),
									initialOpen: !0,
									className: 'validation-api-errors-panel',
								},
								s.length > 0 &&
									React.createElement(
										U.PanelRow,
										null,
										React.createElement(
											'div',
											{ className: 'validation-api-error-group' },
											React.createElement(
												'p',
												{ className: 'validation-api-error-subheading' },
												(0, W.__)('Block Issues', 'validation-api')
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
										U.PanelRow,
										null,
										React.createElement(
											'div',
											{ className: 'validation-api-error-group' },
											React.createElement(
												'p',
												{ className: 'validation-api-error-subheading' },
												(0, W.__)('Field Issues', 'validation-api')
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
										U.PanelRow,
										null,
										React.createElement(
											'div',
											{ className: 'validation-api-error-group' },
											React.createElement(
												'p',
												{ className: 'validation-api-error-subheading' },
												(0, W.__)('Editor Issues', 'validation-api')
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
								U.PanelBody,
								{
									title: (0, W.sprintf)(
										/* translators: %d: number of warnings */ /* translators: %d: number of warnings */
										(0, W.__)('Warnings (%d)', 'validation-api'),
										b
									),
									initialOpen: !0,
									className: 'validation-api-warnings-panel',
								},
								f.length > 0 &&
									React.createElement(
										U.PanelRow,
										null,
										React.createElement(
											'div',
											{ className: 'validation-api-warning-group' },
											React.createElement(
												'p',
												{ className: 'validation-api-warning-subheading' },
												(0, W.__)('Block Issues', 'validation-api')
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
										U.PanelRow,
										null,
										React.createElement(
											'div',
											{ className: 'validation-api-warning-group' },
											React.createElement(
												'p',
												{ className: 'validation-api-warning-subheading' },
												(0, W.__)('Field Issues', 'validation-api')
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
										U.PanelRow,
										null,
										React.createElement(
											'div',
											{ className: 'validation-api-warning-group' },
											React.createElement(
												'p',
												{ className: 'validation-api-warning-subheading' },
												(0, W.__)('Editor Issues', 'validation-api')
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
	const G = window.wp.compose,
		J = window.wp.blockEditor;
	function Q(e, t) {
		(null == t || t > e.length) && (t = e.length);
		for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
		return n;
	}
	function X(e) {
		var t,
			n,
			o = e.issues,
			a =
				((t = (0, r.useState)(!1)),
				(n = 2),
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
								a,
								i,
								l = [],
								c = !0,
								u = !1;
							try {
								if (((a = (r = r.call(e)).next), 0 === t)) {
									if (Object(r) !== r) return;
									c = !1;
								} else
									for (
										;
										!(c = (n = a.call(r)).done) &&
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
										((i = r.return()), Object(i) !== i)
									)
										return;
								} finally {
									if (u) throw o;
								}
							}
							return l;
						}
					})(t, n) ||
					(function (e, t) {
						if (e) {
							if ('string' == typeof e) return Q(e, t);
							var r = {}.toString.call(e).slice(8, -1);
							return (
								'Object' === r && e.constructor && (r = e.constructor.name),
								'Map' === r || 'Set' === r
									? Array.from(e)
									: 'Arguments' === r ||
										  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
										? Q(e, t)
										: void 0
							);
						}
					})(t, n) ||
					(function () {
						throw new TypeError(
							'Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
						);
					})()),
			i = a[0],
			l = a[1];
		if (!o || 0 === o.length) return null;
		var f = s(o),
			m = c(o),
			d = u(o),
			p = f
				? React.createElement(q, { fill: '#d82000' })
				: React.createElement(q, { fill: '#dbc900' });
		return React.createElement(
			React.Fragment,
			null,
			React.createElement(U.ToolbarButton, {
				icon: p,
				onClick: function () {
					return l(!0);
				},
				label: (0, W.__)('View block issues or concerns', 'validation-api'),
				className: 'validation-api-toolbar-button',
				isCompact: !0,
			}),
			i &&
				React.createElement(
					U.Modal,
					{
						title: (0, W.__)('Issues or Concerns', 'validation-api'),
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
									'h2',
									{ className: 'validation-api-indicator-section-title' },
									React.createElement('span', {
										className: 'validation-api-indicator-section-title-circle',
									}),
									(0, W.__)('Errors', 'validation-api')
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
									'h2',
									{ className: 'validation-api-indicator-section-title' },
									React.createElement('span', {
										className: 'validation-api-indicator-section-title-circle',
									}),
									(0, W.__)('Warnings', 'validation-api')
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
	function Y(e, t) {
		(null == t || t > e.length) && (t = e.length);
		for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
		return n;
	}
	var ee = new Map(),
		te = Object.freeze({ mode: 'none', issues: [] });
	function re(e) {
		return (
			(re =
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
			re(e)
		);
	}
	function ne(e, t) {
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
	function oe(e) {
		for (var t = 1; t < arguments.length; t++) {
			var r = null != arguments[t] ? arguments[t] : {};
			t % 2
				? ne(Object(r), !0).forEach(function (t) {
						ae(e, t, r[t]);
					})
				: Object.getOwnPropertyDescriptors
					? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
					: ne(Object(r)).forEach(function (t) {
							Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
						});
		}
		return e;
	}
	function ae(e, t, r) {
		return (
			(t = (function (e) {
				var t = (function (e) {
					if ('object' != re(e) || !e) return e;
					var t = e[Symbol.toPrimitive];
					if (void 0 !== t) {
						var r = t.call(e, 'string');
						if ('object' != re(r)) return r;
						throw new TypeError('@@toPrimitive must return a primitive value.');
					}
					return String(e);
				})(e);
				return 'symbol' == re(t) ? t : t + '';
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
	var ie = (0, G.createHigherOrderComponent)(function (e) {
		return function (n) {
			var o = n.clientId,
				a = n.attributes,
				i = (0, t.useSelect)(
					function (e) {
						return e('core/block-editor').getBlock(o);
					},
					[o]
				),
				l = (function (e, t) {
					var n,
						o,
						a = (arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {})
							.delay,
						i = void 0 === a ? 300 : a,
						l =
							((n = (0, r.useState)(function () {
								return e();
							})),
							(o = 2),
							(function (e) {
								if (Array.isArray(e)) return e;
							})(n) ||
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
											a,
											i,
											l = [],
											c = !0,
											u = !1;
										try {
											if (((a = (r = r.call(e)).next), 0 === t)) {
												if (Object(r) !== r) return;
												c = !1;
											} else
												for (
													;
													!(c = (n = a.call(r)).done) &&
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
													((i = r.return()), Object(i) !== i)
												)
													return;
											} finally {
												if (u) throw o;
											}
										}
										return l;
									}
								})(n, o) ||
								(function (e, t) {
									if (e) {
										if ('string' == typeof e) return Y(e, t);
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
													? Y(e, t)
													: void 0
										);
									}
								})(n, o) ||
								(function () {
									throw new TypeError(
										'Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
									);
								})()),
						c = l[0],
						u = l[1],
						s = (0, r.useRef)(null),
						f = (0, r.useRef)(!0);
					return (
						(0, r.useEffect)(function () {
							return f.current
								? ((f.current = !1), void u(e()))
								: (s.current && clearTimeout(s.current),
									(s.current = setTimeout(function () {
										u(e());
									}, i)),
									function () {
										s.current && clearTimeout(s.current);
									});
						}, t),
						c
					);
				})(
					function () {
						if (!i) return { isValid: !0, issues: [], mode: 'none' };
						var e = oe(oe({}, i), {}, { attributes: a || i.attributes });
						return g(e);
					},
					[i, a],
					{ delay: 300 }
				);
			return (
				(0, r.useEffect)(
					function () {
						return (
							(function (e, t) {
								ee.set(e, t);
							})(o, l),
							function () {
								return (function (e) {
									ee.delete(e);
								})(o);
							}
						);
					},
					[o, l]
				),
				React.createElement(
					React.Fragment,
					null,
					React.createElement(e, n),
					!l.isValid &&
						React.createElement(
							J.BlockControls,
							{ group: 'block' },
							React.createElement(X, { issues: l.issues })
						)
				)
			);
		};
	}, 'withErrorHandling');
	function le(e) {
		return (
			(le =
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
			le(e)
		);
	}
	function ce() {
		return (
			(ce = Object.assign
				? Object.assign.bind()
				: function (e) {
						for (var t = 1; t < arguments.length; t++) {
							var r = arguments[t];
							for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
						}
						return e;
					}),
			ce.apply(null, arguments)
		);
	}
	function ue(e, t) {
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
	function se(e) {
		for (var t = 1; t < arguments.length; t++) {
			var r = null != arguments[t] ? arguments[t] : {};
			t % 2
				? ue(Object(r), !0).forEach(function (t) {
						fe(e, t, r[t]);
					})
				: Object.getOwnPropertyDescriptors
					? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
					: ue(Object(r)).forEach(function (t) {
							Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
						});
		}
		return e;
	}
	function fe(e, t, r) {
		return (
			(t = (function (e) {
				var t = (function (e) {
					if ('object' != le(e) || !e) return e;
					var t = e[Symbol.toPrimitive];
					if (void 0 !== t) {
						var r = t.call(e, 'string');
						if ('object' != le(r)) return r;
						throw new TypeError('@@toPrimitive must return a primitive value.');
					}
					return String(e);
				})(e);
				return 'symbol' == le(t) ? t : t + '';
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
	function me(e) {
		return (
			(me =
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
			me(e)
		);
	}
	function de(e, t) {
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
	function pe(e) {
		for (var t = 1; t < arguments.length; t++) {
			var r = null != arguments[t] ? arguments[t] : {};
			t % 2
				? de(Object(r), !0).forEach(function (t) {
						ve(e, t, r[t]);
					})
				: Object.getOwnPropertyDescriptors
					? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
					: de(Object(r)).forEach(function (t) {
							Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
						});
		}
		return e;
	}
	function ve(e, t, r) {
		return (
			(t = (function (e) {
				var t = (function (e) {
					if ('object' != me(e) || !e) return e;
					var t = e[Symbol.toPrimitive];
					if (void 0 !== t) {
						var r = t.call(e, 'string');
						if ('object' != me(r)) return r;
						throw new TypeError('@@toPrimitive must return a primitive value.');
					}
					return String(e);
				})(e);
				return 'symbol' == me(t) ? t : t + '';
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
	function ye(e) {
		return (
			(ye =
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
			ye(e)
		);
	}
	(wp.hooks.addFilter('editor.BlockEdit', 'validation-api/with-error-handling', ie),
		(0, v.addFilter)(
			'editor.BlockListBlock',
			'validation-api/with-block-validation-classes',
			function (e) {
				return function (t) {
					var r,
						n = ((r = t.clientId), ee.get(r) || te);
					if ('none' === n.mode) return React.createElement(e, t);
					var o =
							'error' === n.mode
								? 'validation-api-block-error'
								: 'validation-api-block-warning',
						a = t.wrapperProps || {},
						i = se(
							se({}, a),
							{},
							{ className: [a.className, o].filter(Boolean).join(' ') }
						);
					return React.createElement(e, ce({}, t, { wrapperProps: i }));
				};
			}
		),
		void 0 === window.ValidationAPI && (window.ValidationAPI = {}),
		(window.ValidationAPI.useMetaField = function (e) {
			var r = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : '',
				n = (function (e) {
					return (0, t.useSelect)(
						function (t) {
							var r = t('core/editor'),
								n = r.getEditedPostAttribute,
								o = (0, r.getCurrentPostType)(),
								a = n('meta'),
								i = a ? a[e] : '';
							if (!o || !e)
								return {
									isValid: !0,
									hasErrors: !1,
									hasWarnings: !1,
									issues: [],
									wrapperClassName: '',
								};
							var l = I(o, e, i),
								c = '';
							return (
								l.hasErrors
									? (c = 'validation-api-meta-error')
									: l.hasWarnings && (c = 'validation-api-meta-warning'),
								pe(pe({}, l), {}, { wrapperClassName: c })
							);
						},
						[e]
					);
				})(e),
				o = (0, t.useSelect)(
					function (t) {
						var r = t('core/editor');
						if (!r) return { value: '' };
						var n = r.getEditedPostAttribute('meta');
						return { value: n ? n[e] : '' };
					},
					[e]
				).value,
				a = (0, t.useDispatch)('core/editor').editPost,
				i = r;
			if (n && (n.hasErrors || n.hasWarnings)) {
				var l = n.issues
						.map(function (e) {
							return e.message || e.error_msg || e.warning_msg;
						})
						.join('. '),
					c = n.hasErrors ? 'validation-api-error-text' : 'validation-api-warning-text';
				i = i
					? React.createElement(
							React.Fragment,
							null,
							i,
							React.createElement('span', { className: c }, '* ', l)
						)
					: React.createElement('span', { className: c }, '* ', l);
			}
			return {
				value: o || '',
				onChange: function (t) {
					var r, n, o;
					a &&
						a({
							meta:
								((r = {}),
								(n = e),
								(o = t),
								(n = (function (e) {
									var t = (function (e) {
										if ('object' != ye(e) || !e) return e;
										var t = e[Symbol.toPrimitive];
										if (void 0 !== t) {
											var r = t.call(e, 'string');
											if ('object' != ye(r)) return r;
											throw new TypeError(
												'@@toPrimitive must return a primitive value.'
											);
										}
										return String(e);
									})(e);
									return 'symbol' == ye(t) ? t : t + '';
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
				help: i,
				className:
					null != n && n.wrapperClassName
						? 'validation-api-field '.concat(n.wrapperClassName)
						: '',
			};
		}));
})();
