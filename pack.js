const child_progress = require('child_process');

const platform = (process.argv.find(v => v.indexOf('--') === 0) || '').replace(/^--/, '');

const progress = child_progress.exec(`electron-packager ./ Hi --platform=${platform} --ignore=".idea|src" --overwrite`);
progress.stdout.pipe(process.stdout);
progress.stderr.pipe(process.stderr);
