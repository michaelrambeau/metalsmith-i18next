'use strict'

var i18next    = require('i18next'),
	debug      = require('debug')('metalsmith-i18next'),
	helpers    = require('./helpers'),
	localise   = require('./localise')

/**

 Forks multiple versions of the website (one for each locale).

 @param {Object} options 
 @param {String|String[]} pattern      - A list of patterns to match files against.
 @param {String|String[]} namespaces   - A list of i18next namespaces to load.
 @param {String}          nsPath       - String to pass i18next as the resGetPath parameter.
 @param {String}          path         - String to expand the localized path to. Defaults to ':locale/:path'.

      Given the original path /folder/file.html and an 'en' locale, the 
      following variables are available for substitution:

        :file     => /folder/file.html
        :ext      => .html
        :base     => file.html
        :dir      => /folder 
        :name     => file
        :locale   => en

 Frontmatters can define the following properties:

	i18nNamespace           i18next namespace to lookup for the key.
 	i18nPrefix				tt function will be the same as t but with key prefix to reduces noise in the code.

 Templates and layouts have access to the following helper functions:

   t(key, options) 			i18next.t function with a preset locale that can be overriden in the options.
   tt(key, options)         i18next.t function with a preset locale and key prefix (see i18nPrefix above).
   tpath(path) 				Prefixes an absolute path with the /:locale. Relative paths are unchanged.

*/

module.exports = function(options) {

	// ------------------------------------------------------------------------
	// Set default values on the options
	// ------------------------------------------------------------------------

	options = Object.assign({
		locales:     [],
		pattern:    '**/*',
		path:       ':locale/:file',
		namespaces: ['translation'],
		nsPath:     './locales/__lng__/__ns__.json',
		resGetPath: '/locales/__lng__/__ns__.json',
		helpers:    'scripts/i18n-helpers.js',
		engine:     'hamlc', // also accepts 'handlebars'
    fallbackLng: false
	}, options || {})

	debug('Options are %j', options)

	// ------------------------------------------------------------------------
	// Do some minimal validation on the options
	// ------------------------------------------------------------------------

	var locales    = options.locales,
		pattern    = options.pattern,
		pathpat    = options.path,
		namespaces = options.namespaces,
		resGetPath = options.nsPath,
		engine     = options.engine,
    fallbackLng = options.fallbackLng

	if (typeof locales != 'string' && !Array.isArray(locales))
		throw new TypeError('metalsmith-i18next locales option should be a string or an array of strings')

	if (typeof pattern !== 'string' && !Array.isArray(pattern))
		throw new TypeError('metalsmith-i18next pattern option should be a string or an array of strings')

	// `pathpat` can be either a String or a function (file, lang) that returns a String
	if (typeof pathpat !== 'string' && typeof pathpat !== 'function' )
		throw new TypeError('metalsmith-i18next path option should be a string or a function')

	if (typeof namespaces !== 'string' && !Array.isArray(namespaces))
		throw new TypeError('metalsmith-i18next namespaces option should be a string or an array of strings')

	if (typeof resGetPath !== 'string')
		throw new TypeError('metalsmith-i18next resGetPath option should be a string')

	if (typeof engine !== 'string')
		throw new TypeError('metalsmith-i18next engine option should be a string')

	if (typeof fallbackLng !== 'string' && typeof fallbackLng !== 'boolean')
		throw new TypeError('metalsmith-i18next fallbackLng option should be a string')

	if (locales.indexOf(fallbackLng) === -1 && typeof fallbackLng !== 'boolean')
		throw new TypeError('metalsmith-i18next fallbackLng option must be included in locales')

	if (!Array.isArray(locales))
		locales = [locales]

	if (locales.length === 0)
		throw new Error('metalsmith-i18next locales options thould contain at least one locale')

	if (!Array.isArray(namespaces))
		namespaces = [namespaces]

	if (!namespaces.length)
		throw new Error('metalsmith-i18next namespaces option should be a string or an array of strings')


	// ------------------------------------------------------------------------
	// Setup i18next
	// ------------------------------------------------------------------------

	var serverConfig = {
		lng: locales[0],
		resGetPath,
		ns: {namespaces, defaultNs:namespaces[0]},
		preload: locales,
		getAsync: false,
		fallbackLng: fallbackLng
		// debug: true
	}

	i18next.init(serverConfig)

	return localise(debug, i18next, options)
}
