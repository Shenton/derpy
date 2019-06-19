const middleware = {}

middleware['login'] = require('..\\middleware\\login.js');
middleware['login'] = middleware['login'].default || middleware['login']

export default middleware
