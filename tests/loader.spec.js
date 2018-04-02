'use strict';

const loader = require('../loader');
const loaderUtils = require('loader-utils');

describe('loader;', () => {
	it('should parse dynamic imports;', () => {
		const source = [];
		const expected = [];

		source.push(`
				import(
					/* webpackChunkName: "one" */
					'./go-to-date-dialog-impl'
				// tslint:disable-next-line:no-any
				// tslint:disable-next-line:no-any
				).then((gtdd: any) => {
					gtdd.showGoToDateDialog(undomodel);
				});`);
		expected.push(`
				Promise.all([import(
					/* webpackChunkName: "one" */
					'./go-to-date-dialog-impl'
				// tslint:disable-next-line:no-any
				// tslint:disable-next-line:no-any
				),importCss("one")]).then(promises => promises[0]).then((gtdd: any) => {
					gtdd.showGoToDateDialog(undomodel);
				});`);

		source.push(`
				//	import(
				//		/* webpackChunkName: 'two-two' */
				//		'./go-to-date-dialog-impl'
				//	// tslint:disable-next-line:no-any
				//	).then((gtdd: any) => {
				//		gtdd.showGoToDateDialog(undomodel);
				//	});`);
		expected.push(`
				//	import(
				//		/* webpackChunkName: 'two-two' */
				//		'./go-to-date-dialog-impl'
				//	// tslint:disable-next-line:no-any
				//	).then((gtdd: any) => {
				//		gtdd.showGoToDateDialog(undomodel);
				//	});`);

		source.push(`
				// // tslint:disable-next-line:no-any
				// import(/* webpackChunkName: "three" */ './go-to-date-dialog-impl').then((gtdd: any) => {
				// 	var m = {k: v};
				// });`);
		expected.push(`
				// // tslint:disable-next-line:no-any
				// Promise.all([import(/* webpackChunkName: "three" */ './go-to-date-dialog-impl'),importCss("three")]).then(promises => promises[0]).then((gtdd: any) => {
				// 	var m = {k: v};
				// });`);

		source.push(`
				// // tslint:disable-next-line:no-any
				// import('./go-to-date-dialog-impl').then((gtdd: any) => {
				// 	var m = {k: v};
				// });`);
		expected.push(`
				// // tslint:disable-next-line:no-any
				// import('./go-to-date-dialog-impl').then((gtdd: any) => {
				// 	var m = {k: v};
				// });`);

		source.push(`
				export function resolveByCustomer(customer) {
					return (customer === 'seekingalpha' || customer === 'smartlab-custom') ?
						import(/* webpackChunkName: "four" */ 'chart-client/js/containers/header-toolbar/seeking-alpha-toolset') : import(/* webpackChunkName: "five" */ 'chart-client/js/containers/header-toolbar/full-toolset');
				}`);
		expected.push(`
						Promise.all([import(/* webpackChunkName: "four" */ 'chart-client/js/containers/header-toolbar/seeking-alpha-toolset'),importCss("four")]).then(promises => promises[0]) : Promise.all([import(/* webpackChunkName: "five" */ 'chart-client/js/containers/header-toolbar/full-toolset'),importCss("five")]).then(promises => promises[0]);`)

		spyOn(loaderUtils, 'getOptions').and.returnValue({});
		const processed = loader(source.join('\n'));
		for (let i in expected) {
			expect(processed.indexOf(expected[i])).not.toBe(-1, expected[i]);
		}
	});

	it('should parse require.ensure;', () => {
		const source = [];
		const expected = [];

		source.push(`
				require.ensure(
					[],
					(require: <T>(path: string) => T) => {
						var m = {k: v};
					},
					'one'
				);`);
		expected.push(`
				importCss('one').then(function(){require.ensure(
					[],
					(require: <T>(path: string) => T) => {
						var m = {k: v};
					},
					'one'
				);}.bind(this));`);

		source.push(`
				require.ensure(
					[],
					(require: <T>(path: string) => T) => {
						var m = {k: v};
					}
				);
				require.ensure(
					[],
					(require: <T>(path: string) => T) => {
						var m = {k: v};
					}.bind(this),
				);`);
		expected.push(`
				require.ensure(
					[],
					(require: <T>(path: string) => T) => {
						var m = {k: v};
					}
				);
				require.ensure(
					[],
					(require: <T>(path: string) => T) => {
						var m = {k: v};
					}.bind(this),
				);`);

		source.push(`
				// require.ensure(
				// 	['./qwe'],
				// 	(require: <T>(path: string) => T) => {
				// 		require<typeof Qwe>('./qwe').qwe();
				// 	}.bind(this),
				// 	'qwe'
				// );`);
		expected.push(`
				// require.ensure(
				// 	['./qwe'],
				// 	(require: <T>(path: string) => T) => {
				// 		require<typeof Qwe>('./qwe').qwe();
				// 	}.bind(this),
				// 	'qwe'
				// );`);

		source.push(`
				require.ensure(
					[],
					function(require) {
						const { qwe } = require('./qwe');
					},
					'two'
				);`);
		expected.push(`
				importCss('two').then(function(){require.ensure(
					[],
					function(require) {
						const { qwe } = require('./qwe');
					},
					'two'
				);}.bind(this));`);

		source.push(`
				Cls.prototype.meth = function() {
					if (initData.ololo) {
						doThing();
					} else if (initData.ohoho) {
						Cls.doAnother();
					} else if (initData.qwewq) {
						require.ensure(['js/dialogs/warning-dialog'], function(require) {
							var warningDialog = require('js/dialogs/warning-dialog').warningDialog;

							warningDialog({
								title: $.t('PRO Plus Trial'),
								content: '<p>' + $.t('Sorry, PRO Plus trial was already reset once.') + '</p>',
								closeButtonText: $.t('Close', { context: 'input' }),
							}).open();
						}, 'three');
					}
				};`);
		expected.push(`
						importCss('three').then(function(){require.ensure(['js/dialogs/warning-dialog'], function(require) {
							var warningDialog = require('js/dialogs/warning-dialog').warningDialog;

							warningDialog({
								title: $.t('PRO Plus Trial'),
								content: '<p>' + $.t('Sorry, PRO Plus trial was already reset once.') + '</p>',
								closeButtonText: $.t('Close', { context: 'input' }),
							}).open();
						}, 'three');}.bind(this));`);

		source.push(`
				// @if FEATURESET == 'tv'
				if (res && res.q && !this.readOnly()) {
					require.ensure(['js/dialogs/q'], function(require) {
						var qDialog = require('js/dialogs/q').showQDialog;
						qDialog(this);
					}.bind(this), "four-four"  /* Four */);
				}
				// @endif`);
		expected.push(`
					importCss("four-four").then(function(){require.ensure(['js/dialogs/q'], function(require) {
						var qDialog = require('js/dialogs/q').showQDialog;
						qDialog(this);
					}.bind(this), "four-four"  /* Four */);}.bind(this));`);

		source.push(`
				showContextMenu(symbol, e) {
					require.ensure([], require => {
						const { Action } = require('chart-client/js/gui/action');
						const ContextMenu = require('chart-client/js/gui/contextmenumanager');
						const SymbolParser = require('chart-client/js/common/symbolparser');

						const actions = [];
						const shortName = SymbolParser.ticker(symbol);

						if (this._bridge.standalone || this._onWidget) {
							if (this._model.screener_type === 'sector' || this._model.screener_type === 'industry') {
								const $row = $(e.target).closest('.tv-screener-table__result-row');
								const $symbolLink = $row.find('.tv-screener__symbol');
								const chartAction = new Action({ text: $.t('Open {0} Page...').format($symbolLink.text()) });
								chartAction.callbacks().subscribe(null, () => {
									window.open($symbolLink.attr('href'), '_blank');
								});

								actions.push(chartAction);
							} else {
								const chartAction = new Action({ text: $.t('Open {0} Chart...').format(shortName) });
								chartAction.callbacks().subscribe(null, () => this._bridge.applySymbol(symbol, true));

								actions.push(chartAction);
							}
						} else {
							const compareAction = new Action({ text: $.t('Add {0} To Compare').format(shortName) });
							compareAction.callbacks().subscribe(this, function() {
								require.ensure([], require => {
									const CompareTab = require('chart-client/js/gui/comparetab').CompareTab;
									const compareTab = new CompareTab(this._bridge.chartWidgetCollection);
									compareTab.addCompareSymbol(symbol);
								}, 'five');
							});

							actions.push(compareAction);

							const addToWatchlistAction = new Action({ text: $.t('Add {0} To Watchlist').format(shortName) });
							addToWatchlistAction.callbacks().subscribe(this, function() {
								var activePage = widgetbar.setPage('base');
								var widget;
								for (var i = 0; i < activePage.widgets.length; i++) {
									if (activePage.widgets[i].type === 'watchlist') {
										widget = activePage.widgets[i].widgetObject;
										break;
									}
								}

								if (!widget) {
									return;
								}

								widget.addHighlight(symbol);
							});

							actions.push(addToWatchlistAction);

							if (isFeatureEnabled('text_notes')) {
								const addToTextNotesAction = new Action({ text: $.t('Add Text Note For {0}').format(shortName) });
								addToTextNotesAction.callbacks().subscribe(this, function() {
									runOrSignIn(function() {
										TradingView.bottomWidgetBar.toggleWidget('text_notes', true);
										TradingView.bottomWidgetBar._widgets.text_notes.addNote(null, shortName, symbol);
									}, { source: 'Add text note in screener' });
								});

								actions.push(addToTextNotesAction);
							}
						}

						ContextMenu.createMenu(actions).show(e);
						this._model.trackEvent('Open context menu');
					}, 'six');
				}`);
		expected.push(`
					importCss('six').then(function(){require.ensure([], require => {
						const { Action } = require('chart-client/js/gui/action');
						const ContextMenu = require('chart-client/js/gui/contextmenumanager');
						const SymbolParser = require('chart-client/js/common/symbolparser');`);
		expected.push(`
								importCss('five').then(function(){require.ensure([], require => {
									const CompareTab = require('chart-client/js/gui/comparetab').CompareTab;
									const compareTab = new CompareTab(this._bridge.chartWidgetCollection);
									compareTab.addCompareSymbol(symbol);
								}, 'five');}.bind(this));`);

		source.push(`
				require.ensure(
					[],
					function(require) {
						var qDialog = require('js/dialogs/q').showQDialog;
						qDialog(this);
					}.bind(this),
					'seven'
					/* Seven */
				);`);
		expected.push(`
				importCss('seven').then(function(){require.ensure(
					[],
					function(require) {
						var qDialog = require('js/dialogs/q').showQDialog;
						qDialog(this);
					}.bind(this),
					'seven'
					/* Seven */
				);}.bind(this));`);

		source.push(`
				require.ensure(
					['./qwe'],
					// adsdasd sdsad
					// qwewqe eqwe
					function(require) {
						// dasdsd
						var q = require('./qwe');
					}, 'eight');`);
		expected.push(`
				importCss('eight').then(function(){require.ensure(
					['./qwe'],
					// adsdasd sdsad
					// qwewqe eqwe
					function(require) {
						// dasdsd
						var q = require('./qwe');
					}, 'eight');}.bind(this));`);

		spyOn(loaderUtils, 'getOptions').and.returnValue({
			processRequireEnsure: true
		});
		const processed = loader(source.join('\n'));
		for (let i in expected) {
			expect(processed.indexOf(expected[i])).not.toBe(-1, expected[i]);
		}
	});

	it('should insert importCss import;', () => {
		const source = `
		'use strict'
		// afdsfsf

		// afasf
		/*
		 * dasdasds
		 */

		require.ensure([], function(require) {
			var q = require('./qwe');
		}, 'qwe');

		dasdasdsdas()
		var m = {k: v};
		dasds;
		`;

		spyOn(loaderUtils, 'getOptions').and.returnValue({
			processRequireEnsure: true
		});
		const processed = loader(source);
		expect(processed.match(/var importCss = require\(.+?\)\.importCss;\s+importCss\('qwe'\)\.then\(function\(\){require\.ensure/i)).not.toBe(null, processed);
	});
});
