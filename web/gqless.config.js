/**
 * @type {import("@gqless/cli").GQlessConfig}
 */
const config = {
  react: true,
  scalarTypes: {
    ID: "string",
    DateTime: "string",
  },
  introspection: {
    endpoint: "http://localhost:3000/api/graphql",
    headers: {},
  },
  destination: "./components/gqless/index.ts",
  subscriptions: false,
  javascriptOutput: false,
};

module.exports = config;
