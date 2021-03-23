#!/usr/bin/env node
// @ts-check
import makeServer from '../index.js';

const port = 4000;
makeServer(port, () => {
  console.log(`App started on port: ${port}`);
});
