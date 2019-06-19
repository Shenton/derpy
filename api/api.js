const helmet = require('helmet');
const bodyParser = require('body-parser');

const app = require('express')();

const { port } = require('./config').api;

// Logger
const { logger, morganInfo, morganError } = require('./logger');
app.use(morganInfo);
app.use(morganError);

// Security
app.use(helmet());
app.disable('x-powered-by');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Home
app.get('/', function(req, res) {
    res.send('Hi, I am the Derpy API!');
});

// APIs
app.use('/user', require('./routes/user'));
//app.use('/api/discord', require('./routes/discord'));

app.listen(port, '0.0.0.0');
logger.info('API server listening on `localhost:' + port + '`.');
