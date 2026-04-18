(() => {
	'use strict';
	var e = {
			d: (i, t) => {
				for (var n in t)
					e.o(t, n) &&
						!e.o(i, n) &&
						Object.defineProperty(i, n, { enumerable: !0, get: t[n] });
			},
			o: (e, i) => Object.prototype.hasOwnProperty.call(e, i),
			r: e => {
				('undefined' != typeof Symbol &&
					Symbol.toStringTag &&
					Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
					Object.defineProperty(e, '__esModule', { value: !0 }));
			},
		},
		i = {};
	(e.r(i),
		e.d(i, {
			getBlockValidation: () => h,
			getInvalidBlocks: () => p,
			getInvalidEditorChecks: () => g,
			getInvalidMeta: () => m,
			hasErrors: () => v,
			hasWarnings: () => f,
		}));
	var t = {};
	(e.r(t),
		e.d(t, {
			clearBlockValidation: () => x,
			setBlockValidation: () => j,
			setInvalidBlocks: () => w,
			setInvalidEditorChecks: () => k,
			setInvalidMeta: () => b,
		}));
	const n = window.wp.data,
		r = 'core/validation',
		s = 'SET_INVALID_BLOCKS',
		o = 'SET_INVALID_META',
		a = 'SET_INVALID_EDITOR_CHECKS',
		l = 'SET_BLOCK_VALIDATION',
		c = 'CLEAR_BLOCK_VALIDATION',
		d = { blocks: [], meta: [], editor: [], blockValidation: {} },
		u = Object.freeze({ mode: 'none', issues: [] });
	function p(e) {
		return e.blocks;
	}
	function m(e) {
		return e.meta;
	}
	function g(e) {
		return e.editor;
	}
	function h(e, i) {
		return e.blockValidation[i] || u;
	}
	function v(e) {
		const i = e.blocks.some(e => 'error' === e.mode),
			t = e.meta.some(e => e.hasErrors),
			n = e.editor.some(e => 'error' === e.type);
		return i || t || n;
	}
	function f(e) {
		if (v(e)) return !1;
		const i = e.blocks.some(e => 'warning' === e.mode),
			t = e.meta.some(e => e.hasWarnings && !e.hasErrors),
			n = e.editor.some(e => 'warning' === e.type);
		return i || t || n;
	}
	function w(e) {
		return { type: s, results: e };
	}
	function b(e) {
		return { type: o, results: e };
	}
	function k(e) {
		return { type: a, issues: e };
	}
	function j(e, i) {
		return { type: l, clientId: e, result: i };
	}
	function x(e) {
		return { type: c, clientId: e };
	}
	const y = (0, n.createReduxStore)(r, {
		reducer: function (e = d, i) {
			switch (i.type) {
				case s:
					return { ...e, blocks: i.results };
				case o:
					return { ...e, meta: i.results };
				case a:
					return { ...e, editor: i.issues };
				case l:
					return {
						...e,
						blockValidation: { ...e.blockValidation, [i.clientId]: i.result },
					};
				case c: {
					const { [i.clientId]: t, ...n } = e.blockValidation;
					return { ...e, blockValidation: n };
				}
				default:
					return e;
			}
		},
		selectors: i,
		actions: t,
	});
	(0, n.register)(y);
	const I = window.wp.plugins,
		E = window.wp.element,
		B = window.wp.hooks,
		_ = (e, i) => e.filter(e => e.type === i),
		N = e => _(e, 'error'),
		L = e => _(e, 'warning'),
		C = e => e.some(e => 'error' === e.type),
		V = e => e.some(e => 'warning' === e.type),
		M = e => null != e && !1 !== e.enabled,
		S = (e, i, t = {}) => {
			const n = e.message || '',
				r = e.error_msg || n,
				s = e.warning_msg || e.error_msg || n,
				o = e.level || 'error';
			let a;
			return (
				(a = 'error' === o ? 1 : 'warning' === o ? 2 : 3),
				{
					check: i,
					checkName: i,
					type: o,
					priority: a,
					message: n,
					errorMsg: r,
					warningMsg: s,
					...t,
				}
			);
		},
		P = (e, i = {}) => ({
			isValid: 0 === e.length,
			issues: e,
			hasErrors: C(e),
			hasWarnings: V(e),
			...i,
		});
	function T() {
		try {
			const e = (0, n.select)('core/editor').getEditorSettings();
			return e?.validationApi || {};
		} catch {
			return {};
		}
	}
	function O() {
		return T().metaValidationRules || {};
	}
	function A() {
		return T().editorContext || 'none';
	}
	const R = e => {
		const i = e.name,
			t = e.attributes,
			n = [],
			r = (T().validationRules || {})[i] || {};
		if (0 === Object.keys(r).length)
			return { isValid: !0, issues: [], mode: 'none', clientId: e.clientId, name: i };
		Object.entries(r).forEach(([r, s]) => {
			if (!M(s)) return;
			let o = !0;
			('function' == typeof s.validator && (o = s.validator(t, e)),
				(o = (0, B.applyFilters)('editor.validateBlock', o, i, t, r, e)),
				o || n.push(S(s, r)));
		});
		let s = 'none';
		return (
			C(n) ? (s = 'error') : V(n) && (s = 'warning'),
			P(n, { mode: s, clientId: e.clientId, name: i })
		);
	};
	function $(e) {
		return e.flatMap(e => {
			const i = R(e),
				t = [];
			return (
				i.isValid || t.push(i),
				e.innerBlocks && e.innerBlocks.length > 0 ? [...t, ...$(e.innerBlocks)] : t
			);
		});
	}
	function F(e) {
		for (const i of e) {
			if ('core/post-content' === i.name) return i;
			if (i.innerBlocks && i.innerBlocks.length > 0) {
				const e = F(i.innerBlocks);
				if (e) return e;
			}
		}
		return null;
	}
	function D() {
		const e = A(),
			i = 'post-editor' === e || 'post-editor-template' === e;
		return $(
			(0, n.useSelect)(
				e => {
					const t = e('core/block-editor'),
						n = t.getBlocks();
					if (i) {
						const e = F(n);
						if (e) {
							const i = t.getBlock(e.clientId),
								n = t
									.getBlockOrder(e.clientId)
									.map(e => {
										const i = t.getBlock(e);
										return (t.getBlockOrder(e), i);
									})
									.filter(Boolean);
							return n.length > 0 ? n : i?.innerBlocks || [];
						}
						return n;
					}
					return n;
				},
				[i]
			)
		);
	}
	function K(e, i, t, n) {
		const r = O()[e]?.[i]?.[n];
		if (!M(r)) return !0;
		let s = !0;
		return (
			'required' === n && (s = '' !== t && null != t),
			(s = (0, B.applyFilters)('editor.validateMeta', s, t, e, i, n)),
			s
		);
	}
	function W(e, i, t) {
		const n = (O()[e] || {})[i] || {},
			r = [];
		for (const [s, o] of Object.entries(n))
			if (M(o) && !K(e, i, t, s)) {
				const e = S(o, s, { metaKey: i });
				r.push(e);
			}
		return P(r);
	}
	function q() {
		const e = D(),
			i = (function () {
				const { postType: e, meta: i } = (0, n.useSelect)(e => {
						const i = e('core/editor');
						return {
							postType: i.getCurrentPostType(),
							meta: i.getEditedPostAttribute('meta'),
						};
					}, []),
					t = O()[e] || {},
					r = [];
				for (const n of Object.keys(t)) {
					const t = i?.[n],
						s = W(e, n, t);
					s.isValid || r.push({ ...s, metaKey: n });
				}
				return r;
			})(),
			t = (function () {
				const { blocks: e, postType: i } = (0, n.useSelect)(e => {
					const i = e('core/editor'),
						t = e('core/block-editor');
					return {
						postType: i.getCurrentPostType(),
						blocks: t.getBlocks(),
						title: i.getEditedPostAttribute('title'),
					};
				}, []);
				return i && e
					? (function (e, i) {
							const t = (T().editorValidationRules || {})[e] || {},
								n = [];
							for (const [r, s] of Object.entries(t))
								if (
									M(s) &&
									!(0, B.applyFilters)('editor.validateEditor', !0, i, e, r, s)
								) {
									const e = S(s, r);
									n.push(e);
								}
							return (n.sort((e, i) => e.priority - i.priority), P(n));
						})(i, e).issues
					: [];
			})(),
			{
				setInvalidBlocks: s,
				setInvalidMeta: o,
				setInvalidEditorChecks: a,
			} = (0, n.useDispatch)(r);
		((0, E.useEffect)(() => {
			s(e);
		}, [e, s]),
			(0, E.useEffect)(() => {
				o(i);
			}, [i, o]),
			(0, E.useEffect)(() => {
				a(t);
			}, [t, a]));
	}
	function H() {
		return (0, n.useSelect)(e => {
			const i = e(r);
			return {
				invalidBlocks: i.getInvalidBlocks(),
				invalidMeta: i.getInvalidMeta(),
				invalidEditorChecks: i.getInvalidEditorChecks(),
			};
		}, []);
	}
	const Z = 'core/validation',
		z = window.wp.editor,
		J = window.wp.components,
		U = window.wp.i18n,
		X = window.wp.blocks,
		G = window.ReactJSXRuntime;
	function Q({ fill: e = 'currentColor' }) {
		return (0, G.jsxs)('svg', {
			viewBox: '-0.81 -0.81 25.62 25.62',
			xmlns: 'http://www.w3.org/2000/svg',
			className: 'validation-api-sidebar-icon',
			children: [
				(0, G.jsx)('path', {
					fill: e,
					d: 'M21.77205 2.96949V9.22968L24 11.49539L21.41025 14.12373C20.18445 17.59455 17.82645 19.4559 16.5927 20.1609C15.7053 20.66805 13.45103 22.0566 12.42537 22.69365L12 22.9578L11.57463 22.69365C10.54898 22.0566 8.2947 20.66805 7.4073 20.1609C6.17361 19.4559 3.81545 17.59455 2.58966 14.12373L0 11.49539L2.22791 9.22968V2.96949L10.16957 0L10.73433 1.51038L3.84047 4.08809V9.88976L2.26275 11.49425L3.99707 13.25445L4.05633 13.4307C5.10714 16.5531 7.20452 18.1878 8.2074 18.7608C9.01367 19.2216 10.87026 20.36115 12 21.06C13.12974 20.36115 14.98634 19.2216 15.7926 18.7608C16.7955 18.1878 18.8928 16.5531 19.9437 13.4307L20.00295 13.25445L21.73725 11.49425L20.15955 9.88976V4.08809L13.26567 1.51038L13.83044 0L21.77205 2.96949Z',
				}),
				(0, G.jsx)('path', {
					fill: e,
					d: 'M16.95615 8.74307L10.64529 15.05385L7.23707 11.64567L8.37732 10.50542L10.64529 12.77339L15.81585 7.60281L16.95615 8.74307Z',
				}),
			],
		});
	}
	function Y(e) {
		const i = (0, X.getBlockType)(e);
		return i && i.title
			? i.title
			: (e.split('/')[1] || e)
					.split(/[-_]/)
					.map(e => e.charAt(0).toUpperCase() + e.slice(1))
					.join(' ');
	}
	function ee(e, i) {
		const t = new Map();
		return (
			e.forEach(e => {
				('error' === i ? N(e.issues || []) : L(e.issues || [])).forEach(n => {
					const r = 'error' === i ? n.errorMsg : n.warningMsg || n.errorMsg,
						s = `${e.name}|${r}`;
					(t.has(s) ||
						t.set(s, {
							blockName: Y(e.name),
							blockType: e.name,
							message: r,
							clientIds: [],
						}),
						e.clientId &&
							!t.get(s).clientIds.includes(e.clientId) &&
							t.get(s).clientIds.push(e.clientId));
				});
			}),
			Array.from(t.values())
		);
	}
	function ie(e, i) {
		const t = new Map();
		return (
			e.forEach(e => {
				('error' === i ? N(e.issues || []) : L(e.issues || [])).forEach(n => {
					const r = 'error' === i ? n.errorMsg : n.warningMsg || n.errorMsg,
						s = `${e.metaKey}|${r}`;
					t.has(s) || t.set(s, { metaKey: e.metaKey, message: r });
				});
			}),
			Array.from(t.values())
		);
	}
	function te(e, i) {
		const t = new Map();
		return (
			e.forEach(e => {
				const n = 'error' === i ? e.errorMsg : e.warningMsg || e.errorMsg,
					r = n;
				t.has(r) || t.set(r, { message: n, description: e.description });
			}),
			Array.from(t.values())
		);
	}
	function ne() {
		const { invalidBlocks: e, invalidMeta: i, invalidEditorChecks: t } = H(),
			{ selectBlock: r } = (0, n.useDispatch)('core/block-editor'),
			s = (0, E.useRef)(null),
			o = _(t, 'error'),
			a = _(t, 'warning'),
			l = ee(e, 'error'),
			c = ee(e, 'warning'),
			d = ie(i, 'error'),
			u = ie(i, 'warning'),
			p = te(o, 'error'),
			m = te(a, 'warning'),
			g = l.length + d.length + p.length,
			h = c.length + u.length + m.length;
		let v = 'currentColor';
		g > 0 ? (v = '#d82000') : h > 0 && (v = '#dbc900');
		const f = (0, G.jsx)(Q, { fill: v }),
			w = e => {
				e &&
					(r(e),
					s.current && clearTimeout(s.current),
					(s.current = setTimeout(() => {
						let i = document.querySelector(`[data-block="${e}"]`);
						(i || (i = document.querySelector(`[data-type][data-block="${e}"]`)),
							i || (i = document.querySelector(`.wp-block[data-block="${e}"]`)),
							i && i.scrollIntoView({ behavior: 'smooth', block: 'center' }));
					}, 100)));
			};
		return (
			(0, E.useEffect)(
				() => () => {
					s.current && clearTimeout(s.current);
				},
				[]
			),
			0 === g && 0 === h
				? null
				: (0, G.jsxs)(z.PluginSidebar, {
						name: 'validation-sidebar',
						title: (0, U.__)('Validation', 'validation-api'),
						icon: f,
						className: 'validation-api-validation-sidebar',
						children: [
							g > 0 &&
								(0, G.jsxs)(J.PanelBody, {
									title: (0, U.sprintf)(
										/* translators: %d: number of errors */ /* translators: %d: number of errors */
										(0, U.__)('Errors (%d)', 'validation-api'),
										g
									),
									initialOpen: !0,
									className: 'validation-api-errors-panel',
									children: [
										l.length > 0 &&
											(0, G.jsx)(J.PanelRow, {
												children: (0, G.jsxs)('div', {
													className: 'validation-api-error-group',
													children: [
														(0, G.jsx)('p', {
															className:
																'validation-api-error-subheading',
															children: (0, U.__)(
																'Block Issues',
																'validation-api'
															),
														}),
														(0, G.jsx)('ul', {
															className: 'validation-api-error-list',
															children: l.map((e, i) => {
																const t = e.clientIds.length,
																	n = t > 1 ? ` (x${t})` : '';
																return (0, G.jsxs)(
																	'li',
																	{
																		children: [
																			(0, G.jsx)('button', {
																				type: 'button',
																				className:
																					'validation-api-issue-link',
																				onClick: () =>
																					w(
																						e
																							.clientIds[0]
																					),
																				children:
																					e.blockName,
																			}),
																			': ',
																			e.message,
																			n,
																		],
																	},
																	`block-error-${i}`
																);
															}),
														}),
													],
												}),
											}),
										d.length > 0 &&
											(0, G.jsx)(J.PanelRow, {
												children: (0, G.jsxs)('div', {
													className: 'validation-api-error-group',
													children: [
														(0, G.jsx)('p', {
															className:
																'validation-api-error-subheading',
															children: (0, U.__)(
																'Field Issues',
																'validation-api'
															),
														}),
														(0, G.jsx)('ul', {
															className: 'validation-api-error-list',
															children: d.map((e, i) =>
																(0, G.jsx)(
																	'li',
																	{ children: e.message },
																	`meta-error-${i}`
																)
															),
														}),
													],
												}),
											}),
										p.length > 0 &&
											(0, G.jsx)(J.PanelRow, {
												children: (0, G.jsxs)('div', {
													className: 'validation-api-error-group',
													children: [
														(0, G.jsx)('p', {
															className:
																'validation-api-error-subheading',
															children: (0, U.__)(
																'Editor Issues',
																'validation-api'
															),
														}),
														(0, G.jsx)('ul', {
															className: 'validation-api-error-list',
															children: p.map((e, i) =>
																(0, G.jsx)(
																	'li',
																	{ children: e.message },
																	`editor-error-${i}`
																)
															),
														}),
													],
												}),
											}),
									],
								}),
							h > 0 &&
								(0, G.jsxs)(J.PanelBody, {
									title: (0, U.sprintf)(
										/* translators: %d: number of warnings */ /* translators: %d: number of warnings */
										(0, U.__)('Warnings (%d)', 'validation-api'),
										h
									),
									initialOpen: !0,
									className: 'validation-api-warnings-panel',
									children: [
										c.length > 0 &&
											(0, G.jsx)(J.PanelRow, {
												children: (0, G.jsxs)('div', {
													className: 'validation-api-warning-group',
													children: [
														(0, G.jsx)('p', {
															className:
																'validation-api-warning-subheading',
															children: (0, U.__)(
																'Block Issues',
																'validation-api'
															),
														}),
														(0, G.jsx)('ul', {
															className:
																'validation-api-warning-list',
															children: c.map((e, i) => {
																const t = e.clientIds.length,
																	n = t > 1 ? ` (x${t})` : '';
																return (0, G.jsxs)(
																	'li',
																	{
																		children: [
																			(0, G.jsx)('button', {
																				type: 'button',
																				className:
																					'validation-api-issue-link',
																				onClick: () =>
																					w(
																						e
																							.clientIds[0]
																					),
																				children:
																					e.blockName,
																			}),
																			': ',
																			e.message,
																			n,
																		],
																	},
																	`block-warning-${i}`
																);
															}),
														}),
													],
												}),
											}),
										u.length > 0 &&
											(0, G.jsx)(J.PanelRow, {
												children: (0, G.jsxs)('div', {
													className: 'validation-api-warning-group',
													children: [
														(0, G.jsx)('p', {
															className:
																'validation-api-warning-subheading',
															children: (0, U.__)(
																'Field Issues',
																'validation-api'
															),
														}),
														(0, G.jsx)('ul', {
															className:
																'validation-api-warning-list',
															children: u.map((e, i) =>
																(0, G.jsx)(
																	'li',
																	{ children: e.message },
																	`meta-warning-${i}`
																)
															),
														}),
													],
												}),
											}),
										m.length > 0 &&
											(0, G.jsx)(J.PanelRow, {
												children: (0, G.jsxs)('div', {
													className: 'validation-api-warning-group',
													children: [
														(0, G.jsx)('p', {
															className:
																'validation-api-warning-subheading',
															children: (0, U.__)(
																'Editor Issues',
																'validation-api'
															),
														}),
														(0, G.jsx)('ul', {
															className:
																'validation-api-warning-list',
															children: m.map((e, i) =>
																(0, G.jsx)(
																	'li',
																	{ children: e.message },
																	`editor-warning-${i}`
																)
															),
														}),
													],
												}),
											}),
									],
								}),
						],
					})
		);
	}
	function re() {
		return (q(), null);
	}
	function se() {
		return (
			(function () {
				const e = A(),
					i = 'post-editor' === e || 'post-editor-template' === e,
					{
						lockPostSaving: t,
						unlockPostSaving: r,
						lockPostAutosaving: s,
						unlockPostAutosaving: o,
						disablePublishSidebar: a,
						enablePublishSidebar: l,
					} = (0, n.useDispatch)('core/editor'),
					{ invalidBlocks: c, invalidMeta: d, invalidEditorChecks: u } = H();
				((0, E.useEffect)(() => {
					if (!i) return;
					if (!t || !r) return;
					const e = c.some(e => 'error' === e.mode),
						n = d.some(e => e.hasErrors),
						p = C(u);
					e || n || p ? (t(Z), s && s(Z), a && a()) : (r(Z), o && o(Z), l && l());
				}, [c, d, u, t, r, s, o, a, l, i]),
					(0, E.useEffect)(() => {
						if (!i) return;
						if (!document.body) return;
						const e = c.some(e => 'error' === e.mode),
							t = c.some(e => 'warning' === e.mode),
							n = d.some(e => e.hasErrors),
							r = d.some(e => e.hasWarnings && !e.hasErrors),
							s = C(u),
							o = V(u),
							a = e || n || s,
							l = !a && (t || r || o);
						return (
							a
								? (document.body.classList.add('has-validation-errors'),
									document.body.classList.remove('has-validation-warnings'))
								: l
									? (document.body.classList.add('has-validation-warnings'),
										document.body.classList.remove('has-validation-errors'))
									: document.body.classList.remove(
											'has-validation-errors',
											'has-validation-warnings'
										),
							() => {
								document.body &&
									document.body.classList.remove(
										'has-validation-errors',
										'has-validation-warnings'
									);
							}
						);
					}, [c, d, u, i]));
			})(),
			null
		);
	}
	(0, I.registerPlugin)('core-validation', {
		render: function () {
			return (0, G.jsxs)(G.Fragment, {
				children: [(0, G.jsx)(re, {}), (0, G.jsx)(se, {}), (0, G.jsx)(ne, {})],
			});
		},
	});
	const oe = window.wp.compose,
		ae = window.wp.blockEditor;
	function le({ issues: e }) {
		const [i, t] = (0, E.useState)(!1);
		if (!e || 0 === e.length) return null;
		const n = C(e),
			r = N(e),
			s = L(e),
			o = n ? (0, G.jsx)(Q, { fill: '#d82000' }) : (0, G.jsx)(Q, { fill: '#dbc900' });
		return (0, G.jsxs)(G.Fragment, {
			children: [
				(0, G.jsx)(J.ToolbarButton, {
					icon: o,
					onClick: () => t(!0),
					label: (0, U.__)('View block issues or concerns', 'validation-api'),
					className: 'validation-api-toolbar-button',
					isCompact: !0,
				}),
				i &&
					(0, G.jsx)(J.Modal, {
						title: (0, U.__)('Issues or Concerns', 'validation-api'),
						onRequestClose: () => t(!1),
						className: 'validation-api-block-indicator-modal',
						children: (0, G.jsxs)('div', {
							className: 'validation-api-indicator-modal-content',
							children: [
								r.length > 0 &&
									(0, G.jsxs)('div', {
										className:
											'validation-api-indicator-section validation-api-indicator-errors',
										children: [
											(0, G.jsxs)('h2', {
												className: 'validation-api-indicator-section-title',
												children: [
													(0, G.jsx)('span', {
														className:
															'validation-api-indicator-section-title-circle',
													}),
													(0, U.__)('Errors', 'validation-api'),
												],
											}),
											(0, G.jsx)('ul', {
												children: r.map((e, i) =>
													(0, G.jsx)(
														'li',
														{ children: e.errorMsg },
														`error-${i}`
													)
												),
											}),
										],
									}),
								s.length > 0 &&
									(0, G.jsxs)('div', {
										className:
											'validation-api-indicator-section validation-api-indicator-warnings',
										children: [
											(0, G.jsxs)('h2', {
												className: 'validation-api-indicator-section-title',
												children: [
													(0, G.jsx)('span', {
														className:
															'validation-api-indicator-section-title-circle',
													}),
													(0, U.__)('Warnings', 'validation-api'),
												],
											}),
											(0, G.jsx)('ul', {
												children: s.map((e, i) =>
													(0, G.jsx)(
														'li',
														{ children: e.warningMsg || e.errorMsg },
														`warning-${i}`
													)
												),
											}),
										],
									}),
							],
						}),
					}),
			],
		});
	}
	const ce = (0, oe.createHigherOrderComponent)(
		e => i => {
			const { clientId: t, attributes: s } = i,
				o = (0, n.useSelect)(e => e('core/block-editor').getBlock(t), [t]),
				{ setBlockValidation: a, clearBlockValidation: l } = (0, n.useDispatch)(r),
				c = (function (e, i, t = {}) {
					const { delay: n = 300 } = t,
						[r, s] = (0, E.useState)(() => e()),
						o = (0, E.useRef)(null),
						a = (0, E.useRef)(!0);
					return (
						(0, E.useEffect)(
							() =>
								a.current
									? ((a.current = !1), void s(e()))
									: (o.current && clearTimeout(o.current),
										(o.current = setTimeout(() => {
											s(e());
										}, n)),
										() => {
											o.current && clearTimeout(o.current);
										}),
							i
						),
						r
					);
				})(
					() => {
						if (!o) return { isValid: !0, issues: [], mode: 'none' };
						const e = { ...o, attributes: s || o.attributes };
						return R(e);
					},
					[o, s],
					{ delay: 300 }
				);
			return (
				(0, E.useEffect)(() => (a(t, c), () => l(t)), [t, c, a, l]),
				(0, G.jsxs)(G.Fragment, {
					children: [
						(0, G.jsx)(e, { ...i }),
						!c.isValid &&
							(0, G.jsx)(ae.BlockControls, {
								group: 'block',
								children: (0, G.jsx)(le, { issues: c.issues }),
							}),
					],
				})
			);
		},
		'withErrorHandling'
	);
	((0, B.addFilter)('editor.BlockEdit', 'validation-api/with-error-handling', ce),
		(0, B.addFilter)(
			'editor.BlockListBlock',
			'validation-api/with-block-validation-classes',
			function (e) {
				return i => {
					const t = (0, n.useSelect)(
						e => e(r).getBlockValidation(i.clientId),
						[i.clientId]
					);
					if ('none' === t.mode) return (0, G.jsx)(e, { ...i });
					const s =
							'error' === t.mode
								? 'validation-api-block-error'
								: 'validation-api-block-warning',
						o = i.wrapperProps || {},
						a = { ...o, className: [o.className, s].filter(Boolean).join(' ') };
					return (0, G.jsx)(e, { ...i, wrapperProps: a });
				};
			}
		),
		(0, B.addFilter)('editor.preSavePost', 'validation-api/pre-save-gate', async e => {
			const i = (0, n.select)(r);
			if (i && i.hasErrors && i.hasErrors())
				throw new Error(
					(0, U.__)('Validation errors must be resolved before saving.', 'validation-api')
				);
			return e;
		}));
})();
