'use strict';

require('core-js/stable');
require('regenerator-runtime/runtime');

const { main } = require('./src');

main()
.then(console.log)
.catch(console.log);
