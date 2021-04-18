#!/usr/bin/env node
// @ts-check

import startApp from '../index.js';

const port = 4000;
const address = '0.0.0.0';

startApp().listen(port, address, () => {
  console.log(`App started on port: ${port}`);
});
