const child_progress = require('child_process');
const config = require('./main/config');
const isProduction = (process.argv.find(v => v.indexOf('--') === 0) || '').replace(/^--/, '') === 'prod';

if (isProduction) {
  // production
  Object.assign(process.env, {
    'EXTEND_ESLINT': true,
    'PUBLIC_URL': './',
    'GENERATE_SOURCEMAP': false,
    'NODE_ENV': 'production'
  });
} else {
  // development
  Object.assign(process.env, {
    'BROWSER': 'none',
    'EXTEND_ESLINT': 'true',
    'PUBLIC_URL': '/',
    'NODE_ENV': 'development',
    'PORT': 3333
  });
}

Object.assign(process.env, {
  'REACT_APP_TITLE': config.title
});

const progress = child_progress.exec(isProduction ? 'craco build' : 'craco start');
progress.stdout.pipe(process.stdout);
progress.stderr.pipe(process.stderr);
