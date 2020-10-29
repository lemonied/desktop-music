const CracoLessPlugin = require('craco-less');
const styleVars = require('./src/styleVars');

const makePrefix = (prefix, origin) => {
  const ret = {};
  origin.forEach(item => {
    item.less.forEach(v => {
      Object.assign(ret, {
        [`${prefix}${v}`]: `${item.value}`
      });
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
          prependData: styleVars.map(item => {
            return item.scss.map(v => {
              return `$${v}: ${item.value};`;
            });
          }).join('')
        });
        return sassLoaderOptions;
      }
    }
  }
};
