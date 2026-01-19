const { execSync } = require('child_process');
const path = require('path');

exports.default = async function(context) {
  const { appOutDir } = context;
  
  // For macOS, the app path is inside the .app bundle
  const platform = context.electronPlatformName;
  let appPath = appOutDir;
  
  if (platform === 'darwin') {
    const appName = context.packager.appInfo.productFilename;
    appPath = path.join(appOutDir, `${appName}.app`, 'Contents', 'Resources', 'app');
  } else if (platform === 'win32') {
    appPath = path.join(appOutDir, 'resources', 'app');
  } else {
    appPath = path.join(appOutDir, 'resources', 'app');
  }
  
  console.log(`Rebuilding native modules for ${platform} in ${appPath}...`);
  
  try {
    // Rebuild sharp for Electron
    execSync('npm rebuild sharp --update-binary', {
      cwd: appPath,
      stdio: 'inherit',
      env: {
        ...process.env,
        npm_config_arch: context.arch,
        npm_config_target_arch: context.arch,
        npm_config_disturl: 'https://electronjs.org/headers',
        npm_config_runtime: 'electron',
        npm_config_target: context.electronVersion
      }
    });
    
    console.log('Native modules rebuilt successfully');
  } catch (error) {
    console.error('Error rebuilding native modules:', error);
  }
};
