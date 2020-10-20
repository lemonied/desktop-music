const child_progress = require('child_process');
const glob = require('glob');
const { resolve, relative } = require('path');
const fs = require('fs');
const isProduction = (process.argv.find(v => v.indexOf('--') === 0) || '').replace(/^--/, '') === 'prod';

if (isProduction) {
  // production
  Object.assign(process.env, {
    'EXTEND_ESLINT': true,
    'PUBLIC_URL': '/',
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

const files = glob.sync(resolve(__dirname, './src/views/*'));

const features = {};
const routes = files.map(file => {
  if (!fs.statSync(file).isDirectory()) {
    return null;
  }
  try {
    const route = JSON.parse(
      fs.readFileSync(
        resolve(file, 'route.json')
      ).toString('utf-8')
    );
    if (typeof route.order === 'undefined') { route.order = 0; }
    Object.assign(features, {
      [route.id]: route.enable
    });
    return Object.assign({
      filePath: relative(resolve(__dirname, './src'), file)
        .replace(/\\/g, '/')
        .replace(/^\.\//, '')
    }, route);
  } catch (err) {
    console.error(err);
    return null;
  }
}).filter(v => v && v.enable)
  .sort((a, b) => a.order - b.order);

Object.assign(process.env, {
  'REACT_APP_ROUTES': JSON.stringify(routes),
  'REACT_APP_FEATURES': JSON.stringify(features)
});

const progress = child_progress.exec(isProduction ? 'craco build' : 'craco start');
progress.stdout.pipe(process.stdout);
progress.stderr.pipe(process.stderr);
