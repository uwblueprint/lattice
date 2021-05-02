const { NEXT_SERVER_API_URL } = process.env;

module.exports = {
  productionBrowserSourceMaps: true,
  rewrites: async () => {
    if (!NEXT_SERVER_API_URL) {
      console.warn("Missing API server URL.");
      return [];
    }
    return [
      {
        source: "/api/:slug",
        destination: `${NEXT_SERVER_API_URL}/:slug`,
        basePath: false,
      },
    ];
  },
  future: {
    webpack5: true,
  },
};
