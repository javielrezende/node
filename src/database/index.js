const mongoose = require('mongoose');

//mongoose.createConnection('mongodb://localhost/noderest', { useNewUrlParser: true });
mongoose.connect('mongodb://localhost/noderest', {useNewUrlParser: true, useCreateIndex: true});
mongoose.Promise = global.Promise;

module.exports = mongoose;