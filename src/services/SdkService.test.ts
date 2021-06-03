import SdkService from '../services/SdkService'
import { AffinidiWallet as Wallet } from '@affinidi/wallet-browser-sdk';
import { __dangerous } from "@affinidi/wallet-core-sdk";
import config from "../config";

const { WalletStorageService } = __dangerous;

const SDK_OPTIONS = {
  env: config.env,
  apiKey: config.apiKey,
};

const signedCredential = {
    claim: {
        someProperty: "someProperty"
    },
    issued: "someIssuer",
    '@context': [
        {
            someProperty: 'someProperty'
        }
    ],
    id: 'someId',
    issuer: 'someIssuer',
    issuanceDate: 'someIssuanceDate',
    expirationDate: 'someExpiryDate',
    type: ['IDDocumentCredentialPersonV1'],
    credentialSubject: {
        data: {
            givenName: 'someGivenName',
            drivingClass: 'someDrivingClass',
            hasIDDocument: {
                hasIDDocument: {
                    idClass: '{"drivingClass": "1"}'
                }
            }
        }
    },
    proof: {
        created: new Date("2019-01-16"),
        type: 'someType',
        nonce: 'someNonce',
        signatureValue: 'someSignatureValue',
        creator: 'someCreator'
    },
    credentialStatus: {
        someProperty: 'someProperty'
    },
    verifiableCredential: [
        {
            someProperty: 'someProperty'
        }
    ],
    credentialSchema: {
        someProperty: 'someProperty'
    },
    refreshService: {
        someProperty: 'someProperty'
    },
    termsOfUse: [
        {
            someProperty: 'someProperty'
        }
    ],
    evidence: [
        {
            someProperty: 'someProperty'
        }
    ]
}

const credShareResponseOutput = {
    nonce: 'someNonce',
    errors: [],
    did: 'someDid',
    isValid: true,
    suppliedCredentials: [signedCredential]
}

jest.mock('uint8arrays/to-string.js', ()=>{});
jest.mock('uint8arrays/from-string.js', ()=>{});
jest.mock("@affinidi/wallet-browser-sdk");

const networkMember = new Wallet('testPassword', 'testEncryptedSeed') as any;
const sdkService = new SdkService(networkMember)

networkMember.accessToken = "someAccessToken"
networkMember.did = "someDid"
networkMember.encryptedSeed = "someEncryptedSeed"
networkMember.password = "somePassword"
networkMember._accessApiKey = "someAccessApiKey"

describe('Test SdkService', ()=>{
    test('fromAccessToken method', async ()=>{
        // @ts-ignore
        Wallet.setEnvironmentVarialbles.mockReturnValue({
            env: 'dev',
            storageRegion: 'someStorageRegion',
            accessApiKey: 'someAccessApi',
            issuerUrl: 'someIssuerUrl',
            registryUrl: 'someRegistryUrl',
            verifierUrl: 'someVerifierUrl',
            vaultUrl: 'someVaultUrl',
            keyStorageUrl: 'someKeyStorageUrl',
            userPoolId: 'someUserPoolId',
            clientId: 'someClientId',
            phoneIssuerBasePath: 'somePhoneIssuerBasePath',
            emailIssuerBasePath: 'someEmailIssuerBasePath',
            metricsUrl: 'someMetricsUrl',
            revocationUrl: 'someRevocationUrl'
        });
        jest.spyOn(WalletStorageService, 'pullEncryptedSeed').mockResolvedValue('someEncryptedSeed')
        jest.spyOn(WalletStorageService, 'pullEncryptionKey').mockResolvedValue('someEncryptedKey')
        await SdkService.fromAccessToken('someAccessToken');
        expect(WalletStorageService.pullEncryptedSeed).toBeCalledWith("someAccessToken", "someKeyStorageUrl", {"apiKey": SDK_OPTIONS.apiKey, "env": SDK_OPTIONS.env});
        expect(WalletStorageService.pullEncryptionKey).toBeCalledWith("someAccessToken");
        expect(Wallet).toBeCalledWith('someEncryptedKey', 'someEncryptedSeed', {
            ...SDK_OPTIONS,
            cognitoUserTokens: { 
                accessToken: 'someAccessToken'
            }
        });
    })

    test('verifyCredentialShareResponseToken method', async ()=>{
        jest.spyOn(Wallet.prototype, 'verifyCredentialShareResponseToken').mockResolvedValue(credShareResponseOutput);
        const response = await sdkService.verifyCredentialShareResponseToken('someCredentialShareResponseToken', 'someCredentialShareRequest', true)
        expect(response).toEqual(credShareResponseOutput);
    })  


    test('signOut method', async ()=>{
        jest.spyOn(Wallet.prototype, 'signOut');
        await sdkService.signOut()
        expect(Wallet.prototype.signOut).toBeCalled();
    })

    test('fromLoginAndPassword method', async ()=>{
        jest.spyOn(Wallet, 'fromLoginAndPassword').mockResolvedValue(networkMember);
        const response = await SdkService.fromLoginAndPassword('username', 'password');
        await expect(Wallet.fromLoginAndPassword).toBeCalled();
        expect(response).toEqual(sdkService);
    })

    test('readEncryptedMessage method', async ()=>{
        jest.spyOn(Wallet.prototype, 'readEncryptedMessage').mockResolvedValue('someMessage');
        const response = await sdkService.readEncryptedMessage('someEncryptedMessage');
        await expect(Wallet.prototype.readEncryptedMessage).toBeCalledWith('someEncryptedMessage');
        expect(response).toEqual('someMessage');
    })
    
    test('createEncryptedMessage method', async ()=>{
        jest.spyOn(Wallet.prototype, 'createEncryptedMessage').mockResolvedValue('someEncryptedMessage');
        const response = await sdkService.createEncryptedMessage('someDid', 'somePayload');
        await expect(Wallet.prototype.createEncryptedMessage).toBeCalledWith('someDid', 'somePayload');
        expect(response).toEqual('someEncryptedMessage')
    })

    test('accessApiKey getter', ()=>{
        expect(sdkService.accessApiKey).toEqual('someAccessApiKey');
    })

    test('encryptedSeed getter', ()=>{
        expect(sdkService.encryptionKey).toEqual('somePassword');
    })

    test('encryptionSeed getter', ()=>{
        expect(sdkService.encryptedSeed).toEqual('someEncryptedSeed');
    })

    test('did getter', ()=>{
        expect(sdkService.did).toEqual('someDid');
    })

    test('accessToken getter', ()=>{
        expect(sdkService.accessToken).toEqual('someAccessToken');
    })
})