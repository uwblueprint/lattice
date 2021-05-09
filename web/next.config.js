const { LATTICE_API_URL } = process.env;

module.exports = {
  productionBrowserSourceMaps: true,
  rewrites: async () => {
    if (!LATTICE_API_URL) {
      console.info("Missing API server URL; proxying is disabled.");
      return [];
    }
    return [
      {
        source: "/api/:slug*",
        destination: `${LATTICE_API_URL}/:slug*`,
        basePath: false,
      },
    ];
  },
  serverRuntimeConfig: {
    apiUrl: LATTICE_API_URL,
  },
  future: {
    webpack5: true,
  },
};
