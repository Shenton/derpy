const mongoose = require('mongoose');

if (!mongoose.connection.name) {
    const { logger } = require('./logger');
    const { dbConnect, dbName } = require('./config');

    mongoose.set('useCreateIndex', true);
    mongoose.connect(dbConnect + dbName, { useNewUrlParser: true });
    mongoose.connection.on('error', err => logger.error('DB connection error: ' + err));
    mongoose.connection.once('open', () => logger.info('DB connected.'));
}

module.exports = mongoose;
