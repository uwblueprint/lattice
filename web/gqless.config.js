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
    endpoint: "http://localhost:3000/graphql",
    headers: {},
  },
  destination: "./components/gqless/gqless.ts",
  subscriptions: false,
  javascriptOutput: false,
};

module.exports = config;
