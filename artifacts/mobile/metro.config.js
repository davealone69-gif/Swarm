const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sharing@14 writes a local-maven-repo tmp dir that Metro tries to watch
// but may not exist yet — exclude it to prevent ENOENT crash.
config.watchFolders = (config.watchFolders ?? []).filter(Boolean);
config.resolver = config.resolver ?? {};
config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList) ? config.resolver.blockList : []),
  /expo-sharing.*_tmp_[^/]*\/local-maven-repo/,
];

module.exports = config;
