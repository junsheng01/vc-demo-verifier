import axios from 'axios';
import config from "../config";

const { apiKeyHash, env } = config
const baseURL = `https://cloud-wallet-api.${env}.affinity-project.org/api/v1`
const verifierBaseUrl = `https://affinity-verifier.${env}.affinity-project.org/api/v1`

const cloudWalletApi = axios.create({
  baseURL,
  headers: {
    'Api-Key': apiKeyHash,
    'Content-Type': 'application/json',
  },
});

export const verifierApi = axios.create({
  baseURL: verifierBaseUrl,
  headers: {
    'Api-Key': apiKeyHash,
    'Content-Type': 'application/json',
  },
});

export const signup = async (
  username: string,
  password: string
) => {
  const signUpParams = {
    username, password, options: {
      didMethod: "elem",
      keyTypes: [
        "rsa", 'bbs'
      ]
    }
  }
  const { data: token } = await cloudWalletApi.post('/users/signup', signUpParams)

  return token
}

export const verifyVC = async (input: any) => {
  const { data } = await verifierApi.post('/verifier/verify-vcs', input)
  return data;
}

export default cloudWalletApi
