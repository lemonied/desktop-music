const { request, login } = require('electron').remote.require('./remote');

window.globalvars = {
  request,
  win: require('electron').remote.getCurrentWindow(),
  login
};
