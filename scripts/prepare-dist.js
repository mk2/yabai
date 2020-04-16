'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const rimraf = require('rimraf');

const rootDir = path.resolve(process.cwd());

// run bundle
process.chdir(path.resolve(rootDir, 'packages', 'yabai'));
spawnSync('npm', ['run', 'bundle'], { stdio: 'inherit' });
process.chdir(rootDir);

// make package
rimraf.sync(path.resolve(rootDir, 'packages', 'publish'));
fs.mkdirSync(path.resolve(rootDir, 'packages', 'publish'));

// copy need files
for (const file of ['yabai.js', 'fs_admin.node', 'pathwatcher.node', 'superstring.node']) {
  fs.copyFileSync(
    path.resolve(rootDir, 'packages', 'yabai', 'dist', file),
    path.resolve(rootDir, 'packages', 'publish', file),
  );
}
fs.copyFileSync(
  path.resolve(rootDir, 'packages', 'yabai', 'package.json'),
  path.resolve(rootDir, 'packages', 'publish', 'package.json'),
);
fs.copyFileSync(
  path.resolve(rootDir, 'packages', 'yabai', 'README.md'),
  path.resolve(rootDir, 'packages', 'publish', 'README.md'),
);

// edit package.json
const packageJson = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'packages', 'publish', 'package.json')));
delete packageJson.scripts;
delete packageJson.dependencies;
delete packageJson.devDependencies;
delete packageJson.importSort;
fs.writeFileSync(path.resolve(rootDir, 'packages', 'publish', 'package.json'), JSON.stringify(packageJson, null, 4));
