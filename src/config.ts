/*
 * @affinidi/wallet-browser-sdk expects an env variable that matches either of these three values 'staging|dev|prod'
 */

function decodeEnv(env: string): "dev" | "staging" | "prod" {
  switch (env) {
    case "dev":
    case "prod":
      return env;
    case "development":
      return "dev";
    case "production":
      return "prod";
    default:
      return "staging";
  }
}

const config = {
  env: decodeEnv(process.env.REACT_APP_ENVIRONMENT || process.env.NODE_ENV),
  apiKey: process.env.REACT_APP_API_KEY as string,
  apiKeyHash: process.env.REACT_APP_API_KEY_HASH as string,
  wallet_url: process.env.REACT_APP_WALLET_URL || 'http://localhost:3001',
  messagesBaseUrl:
    process.env.REACT_APP_MESSAGES_BASE_URL ||
    `https://affinidi-messages.${decodeEnv(process.env.REACT_APP_ENVIRONMENT || process.env.NODE_ENV)}.affinity-project.org`,
};

export default config
