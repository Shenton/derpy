module.exports = {
	root: true,
	extends: 'eslint:recommended',
	env: {
		node: true,
		es6: true
	},
	parserOptions: {
		ecmaVersion: 2017
	},
	rules: {
		'brace-style': ['error', 'stroustrup'],
		'comma-dangle': ['error', 'always-multiline'],
		'comma-spacing': 'error',
		'comma-style': 'error',
		curly: ['error', 'multi-line', 'consistent'],
		'dot-location': ['error', 'property'],
		'handle-callback-err': 'off',
		indent: ['error', 4],
		'max-nested-callbacks': ['error', { max: 4 }],
		'max-statements-per-line': ['error', { max: 2 }],
		'no-console': 'off',
		'no-empty-function': 'error',
		'no-floating-decimal': 'error',
		'no-inline-comments': 'error',
		'no-lonely-if': 'error',
		'no-multi-spaces': 'error',
		'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1, maxBOF: 0 }],
		'no-shadow': ['error', { allow: ['err', 'resolve', 'reject'] }],
		'no-trailing-spaces': ['error'],
		'no-var': 'error',
		'object-curly-spacing': ['error', 'always'],
		'prefer-const': 'error',
		quotes: ['error', 'single'],
		semi: ['error', 'always'],
		'space-before-blocks': 'error',
		'space-before-function-paren': ['error', {
			anonymous: 'never',
			named: 'never',
			asyncArrow: 'always'
		}],
		'space-in-parens': 'error',
		'space-infix-ops': 'error',
		'space-unary-ops': 'error',
		yoda: 'error'
	}
}