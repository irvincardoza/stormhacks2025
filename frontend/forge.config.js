const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

const isDev = process.env.NODE_ENV === 'development';

function resolveViteBundlePath() {
  if (isDev) {
    return require('path').resolve(__dirname, '.');
  }

  return require('path').resolve(__dirname, 'out/renderer');
}

module.exports = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    [
      '@electron-forge/plugin-vite',
      {
        build: [
          {
            entry: require('path').resolve(__dirname, 'src/main/main.js'),
            config: require('path').resolve(__dirname, 'vite.main.config.mjs'),
            target: 'main',
          },
          {
            entry: require('path').resolve(__dirname, 'src/preload/preload.js'),
            config: require('path').resolve(__dirname, 'vite.preload.config.mjs'),
            target: 'preload',
          },
        ],
        renderer: {
          config: require('path').resolve(__dirname, 'vite.renderer.config.mjs'),
          entryPoints: [
            {
              html: require('path').resolve(__dirname, 'src/renderer/index.html'),
              js: require('path').resolve(__dirname, 'src/renderer/main.tsx'),
              name: 'main_window',
            },
          ],
        },
      },
    ],
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
