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
		d = function (e) {
			return e.some(function (e) {
				return 'error' === e.type;
			});
		},
		m = function (e) {
			return e.some(function (e) {
				return 'warning' === e.type;
			});
		},
		f = function (e) {
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
			return o({ isValid: 0 === e.length, issues: e, hasErrors: d(e), hasWarnings: m(e) }, t);
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
				if (f(s)) {
					var d = !0;
					('function' == typeof s.validator && (d = s.validator(n, e)),
						(d = (0, t.applyFilters)('validation_api_validate_block', d, r, n, u, e)) ||
							a.push(p(s, u)));
				}
			});
			var o = 'none';
			return (
				d(a) ? (o = 'error') : m(a) && (o = 'warning'),
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
	function R() {
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
					if ('string' == typeof e) return j(e, t);
					var r = {}.toString.call(e).slice(8, -1);
					return (
						'Object' === r && e.constructor && (r = e.constructor.name),
						'Map' === r || 'Set' === r
							? Array.from(e)
							: 'Arguments' === r ||
								  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
								? j(e, t)
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
	function j(e, t) {
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
		if (!f(o)) return !0;
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
			if (f(u) && !A(e, t, r, c)) {
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
						V(e, t, r[t]);
					})
				: Object.getOwnPropertyDescriptors
					? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
					: I(Object(r)).forEach(function (t) {
							Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
						});
		}
		return e;
	}
	function V(e, t, r) {
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
		(null === (P = window.ValidationAPI) || void 0 === P ? void 0 : P.editorValidationRules) ||
		{};
	function D() {
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
			for (var n = x[e] || {}, a = [], i = 0, o = Object.entries(n); i < o.length; i++) {
				var l = B(o[i], 2),
					c = l[0],
					u = l[1];
				if (
					f(u) &&
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
	function L() {
		var e,
			t =
				(null === (e = window.ValidationAPI) || void 0 === e ? void 0 : e.editorContext) ||
				'none',
			a = 'post-editor' === t || 'post-editor-template' === t,
			i = 'core/editor',
			o = (0, r.useDispatch)(i),
			l = wp.data && wp.data.select && wp.data.select(i),
			c = R(),
			u = T(),
			s = D(),
			f = o || {},
			p = f.lockPostSaving,
			v = f.unlockPostSaving,
			y = f.lockPostAutosaving,
			b = f.unlockPostAutosaving,
			g = f.disablePublishSidebar,
			w = f.enablePublishSidebar;
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
							n = d(s);
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
							o = d(s),
							l = m(s),
							f = e || n || o,
							p = !f && (r || i || l);
						return (
							f
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
	const W = window.wp.editor,
		F = window.wp.components,
		Z = window.wp.i18n,
		U = window.wp.blocks;
	function $(e, t) {
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
								(i = (0, U.getBlockType)(a)),
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
	function q(e, t) {
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
	function K(e, t) {
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
	function H() {
		var e = R() || [],
			t = T() || [],
			a = D() || [],
			i = (0, r.useDispatch)('core/block-editor').selectBlock,
			o = (0, n.useRef)(null),
			l = c(a, 'error'),
			u = c(a, 'warning'),
			s = $(e, 'error'),
			d = $(e, 'warning'),
			m = q(t, 'error'),
			f = q(t, 'warning'),
			p = K(l, 'error'),
			v = K(u, 'warning'),
			y = s.length + m.length + p.length,
			b = d.length + f.length + v.length,
			g = 'currentColor';
		y > 0 ? (g = '#d82000') : b > 0 && (g = '#dbc900');
		var w = React.createElement(
				'svg',
				{
					width: '16',
					height: '16',
					viewBox: '0 0 16 16',
					fill: g,
					className: 'validation-api-sidebar-icon',
					xmlns: 'http://www.w3.org/2000/svg',
				},
				React.createElement('path', {
					d: 'M8 0C9.77663 0 11.4175 0.57979 12.7451 1.55957L11.5498 2.75488C10.5372 2.06824 9.3156 1.66699 8 1.66699C4.5022 1.66699 1.66699 4.5022 1.66699 8C1.66699 11.4978 4.5022 14.333 8 14.333C11.2302 14.333 13.8933 11.9148 14.2822 8.79004L10.2256 12.8477C10.0614 13.0117 9.84597 13.0923 9.63086 13.0908C9.41575 13.0923 9.20031 13.0117 9.03613 12.8477L3.75586 7.56738C3.43077 7.24201 3.43077 6.71502 3.75586 6.38965C4.0813 6.06421 4.60913 6.06421 4.93457 6.38965L7.40137 8.85645L13.6689 2.58887C13.9944 2.26363 14.5223 2.26361 14.8477 2.58887C15.173 2.91425 15.1729 3.44213 14.8477 3.76758L8.58008 10.0352L9.63086 11.0859L14.3271 6.38965C14.3588 6.35799 14.3926 6.32921 14.4277 6.30371L15.5059 5.22656C15.8253 6.09066 16 7.0249 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C2.2549e-07 3.58172 3.58172 2.25497e-07 8 0Z',
					fill: g,
				})
			),
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
			React.createElement(
				W.PluginSidebar,
				{
					name: 'validation-sidebar',
					title: (0, Z.__)('Validation', 'validation-api'),
					icon: w,
					className: 'validation-api-validation-sidebar',
				},
				y > 0 &&
					React.createElement(
						F.PanelBody,
						{
							title: (0, Z.sprintf)(
								/* translators: %d: number of errors */ /* translators: %d: number of errors */
								(0, Z.__)('Errors (%d)', 'validation-api'),
								y
							),
							initialOpen: !0,
							className: 'validation-api-errors-panel',
						},
						s.length > 0 &&
							React.createElement(
								F.PanelRow,
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
												className: 'validation-api-indicator-circle',
											}),
											(0, Z.__)('Block Errors', 'validation-api')
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
														className: 'validation-api-issue-link',
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
								F.PanelRow,
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
												className: 'validation-api-indicator-circle',
											}),
											(0, Z.__)('Meta Errors', 'validation-api')
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
								F.PanelRow,
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
												className: 'validation-api-indicator-circle',
											}),
											(0, Z.__)('Editor Errors', 'validation-api')
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
						F.PanelBody,
						{
							title: (0, Z.sprintf)(
								/* translators: %d: number of warnings */ /* translators: %d: number of warnings */
								(0, Z.__)('Warnings (%d)', 'validation-api'),
								b
							),
							initialOpen: !0,
							className: 'validation-api-warnings-panel',
						},
						d.length > 0 &&
							React.createElement(
								F.PanelRow,
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
												className: 'validation-api-indicator-circle',
											}),
											(0, Z.__)('Block Warnings', 'validation-api')
										)
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
														className: 'validation-api-issue-link',
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
								F.PanelRow,
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
												className: 'validation-api-indicator-circle',
											}),
											(0, Z.__)('Meta Warnings', 'validation-api')
										)
									),
									React.createElement(
										'ul',
										{ className: 'validation-api-warning-list' },
										f.map(function (e, t) {
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
								F.PanelRow,
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
												className: 'validation-api-indicator-circle',
											}),
											(0, Z.__)('Editor Warnings', 'validation-api')
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
				React.createElement(L, null),
				React.createElement(H, null)
			);
		},
	});
	const J = window.wp.compose,
		X = window.wp.primitives,
		z = window.ReactJSXRuntime;
	var Q = (0, z.jsx)(X.SVG, {
			xmlns: 'http://www.w3.org/2000/svg',
			viewBox: '0 0 24 24',
			children: (0, z.jsx)(X.Path, {
				fillRule: 'evenodd',
				clipRule: 'evenodd',
				d: 'M12.218 5.377a.25.25 0 0 0-.436 0l-7.29 12.96a.25.25 0 0 0 .218.373h14.58a.25.25 0 0 0 .218-.372l-7.29-12.96Zm-1.743-.735c.669-1.19 2.381-1.19 3.05 0l7.29 12.96a1.75 1.75 0 0 1-1.525 2.608H4.71a1.75 1.75 0 0 1-1.525-2.608l7.29-12.96ZM12.75 17.46h-1.5v-1.5h1.5v1.5Zm-1.5-3h1.5v-5h-1.5v5Z',
			}),
		}),
		Y = (0, z.jsx)(X.SVG, {
			xmlns: 'http://www.w3.org/2000/svg',
			viewBox: '0 0 24 24',
			children: (0, z.jsx)(X.Path, {
				fillRule: 'evenodd',
				clipRule: 'evenodd',
				d: 'M5.5 12a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0ZM12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-.75 12v-1.5h1.5V16h-1.5Zm0-8v5h1.5V8h-1.5Z',
			}),
		});
	function ee(e, t) {
		(null == t || t > e.length) && (t = e.length);
		for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
		return n;
	}
	function te(e) {
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
							if ('string' == typeof e) return ee(e, t);
							var r = {}.toString.call(e).slice(8, -1);
							return (
								'Object' === r && e.constructor && (r = e.constructor.name),
								'Map' === r || 'Set' === r
									? Array.from(e)
									: 'Arguments' === r ||
										  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
										? ee(e, t)
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
		var c = d(a),
			m = u(a),
			f = s(a),
			p = c ? Q : Y,
			v = c
				? 'validation-api-block-indicator validation-api-block-indicator--error'
				: 'validation-api-block-indicator validation-api-block-indicator--warning';
		return React.createElement(
			React.Fragment,
			null,
			React.createElement(
				'div',
				{ className: v },
				React.createElement(F.Button, {
					icon: p,
					onClick: function () {
						return l(!0);
					},
					className: 'validation-api-block-indicator-button',
					'aria-label': (0, Z.__)('View block issues or concerns', 'validation-api'),
				})
			),
			o &&
				React.createElement(
					F.Modal,
					{
						title: (0, Z.__)('Issues or Concerns', 'validation-api'),
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
										(0, Z.__)('Errors', 'validation-api')
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
						f.length > 0 &&
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
										(0, Z.__)('Warnings', 'validation-api')
									)
								),
								React.createElement(
									'ul',
									null,
									f.map(function (e, t) {
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
	function re(e, t) {
		(null == t || t > e.length) && (t = e.length);
		for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
		return n;
	}
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
										if ('string' == typeof e) return re(e, t);
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
													? re(e, t)
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
						d = (0, n.useRef)(!0);
					return (
						(0, n.useEffect)(function () {
							return d.current
								? ((d.current = !1), void u(e()))
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
				),
				c = 'validation-api-block-wrapper';
			return (
				l.isValid ||
					('error' === l.mode
						? (c += ' validation-api-block-error')
						: 'warning' === l.mode && (c += ' validation-api-block-warning')),
				React.createElement(
					'div',
					{ className: c },
					React.createElement(e, t),
					!l.isValid && React.createElement(te, { mode: l.mode, issues: l.issues })
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
						de(e, t, r[t]);
					})
				: Object.getOwnPropertyDescriptors
					? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
					: ue(Object(r)).forEach(function (t) {
							Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
						});
		}
		return e;
	}
	function de(e, t, r) {
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
	(wp.hooks.addFilter('editor.BlockEdit', 'validation-api/with-error-handling', le),
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
								se(se({}, l), {}, { wrapperClassName: c })
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
										if ('object' != me(e) || !e) return e;
										var t = e[Symbol.toPrimitive];
										if (void 0 !== t) {
											var r = t.call(e, 'string');
											if ('object' != me(r)) return r;
											throw new TypeError(
												'@@toPrimitive must return a primitive value.'
											);
										}
										return String(e);
									})(e);
									return 'symbol' == me(t) ? t : t + '';
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
