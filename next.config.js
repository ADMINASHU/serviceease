module.exports = {
    webpack: (config, { dev, isServer }) => {
      if (dev) {
        config.devtool = 'source-map';
      }
      return config;
    }
  };
  