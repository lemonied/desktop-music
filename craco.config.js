const CracoLessPlugin = require('craco-less');
const styleVars = require('./src/styleVars');

const makePrefix = (prefix, origin) => {
  const ret = {};
  Object.keys(origin).forEach(key => {
    Object.assign(ret, {
      [`${prefix}${key}`]: `${origin[key]}`
    });
  });
  return ret;
};

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: makePrefix('@', styleVars),
            javascriptEnabled: true
          }
        }
      }
    }
  ],
  style: {
    sass: {
      loaderOptions: (sassLoaderOptions, { env, paths }) => {
        Object.assign(sassLoaderOptions, {
          prependData: Object.keys(styleVars).map(key => {
            return `$${key}: ${styleVars[key]};`;
          }).join('')
        });
        return sassLoaderOptions;
      }
    }
  }
};
