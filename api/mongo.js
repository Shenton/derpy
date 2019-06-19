const mongoose = require('mongoose');

const { logger } = require('./logger');

const { dbConnect, dbName } = require('./config').api;

mongoose.set('useCreateIndex', true);
mongoose.connect(dbConnect + dbName, { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', err => logger.error('DB connection error:' + err));
db.once('open', () => logger.info('DB connected.'));

module.exports = mongoose;
