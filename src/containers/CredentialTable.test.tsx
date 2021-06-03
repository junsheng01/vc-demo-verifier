import { render, waitFor } from '@testing-library/react';
import CredentialTable from './CredentialTable';
import SdkService from '../services/SdkService';
import {useAuthentication} from "./Authentication";
import {CredentialShareResponseOutput} from '@affinidi/wallet-core-sdk/dist/dto/verifier.dto'
import { AffinidiWallet as Wallet } from '@affinidi/wallet-browser-sdk';
import { useGlobalTokenValue } from './MessageListener';

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


jest.mock('../services/SdkService');
jest.mock('./Authentication');
jest.mock('./MessageListener');
jest.mock("@affinidi/wallet-browser-sdk", ()=>({
    AffinidiWallet: jest.fn()
}));
jest.mock("@affinidi/wallet-core-sdk", ()=>({
    __dangerous: {}
}));
jest.mock("@affinidi/affinidi-did-auth-lib/dist/DidAuthService/DidAuthService", ()=>{});
jest.mock("@affinidi/common/dist/services/JwtService", ()=>{});

let MockSdkService = SdkService as jest.Mocked<typeof SdkService>;
let mockUseAuthentication = useAuthentication as jest.Mocked<any>;
let mockUseGlobalTokenValue = useGlobalTokenValue as jest.Mocked<any>;

const verifyCredentialShareResponseTokenOutput: CredentialShareResponseOutput = {
    nonce: 'someNonce',
    errors: [],
    did: 'someDid',
    isValid: true,
    suppliedCredentials: [signedCredential]
}
const mockVerifyCredentialShareResponseToken = jest.spyOn(SdkService.prototype, 'verifyCredentialShareResponseToken');
jest.spyOn(console, 'error');

const networkMember: Wallet = new Wallet('testPassword', 'testEncryptedSeed');


describe('Test CredentialTable', ()=>{
    test("UI can render", async ()=>{
        mockVerifyCredentialShareResponseToken.mockResolvedValue(verifyCredentialShareResponseTokenOutput);
        mockUseGlobalTokenValue.mockReturnValue(['someGlobalToken']);

        const sdk = new MockSdkService(networkMember);
        mockUseAuthentication.mockImplementation(()=>({
            sdk: sdk
        }));
        const { queryByRole, queryByAltText } = render(<CredentialTable />);
        expect(queryByRole('columnheader', {name: 'Index'})).toBeTruthy();
        expect(queryByRole('columnheader', {name: 'Name'})).toBeTruthy();
        expect(queryByRole('columnheader', {name: 'Driving Class'})).toBeTruthy();
        expect(queryByRole('columnheader', {name: 'Validated'})).toBeTruthy();
        expect(mockVerifyCredentialShareResponseToken).toBeCalled();

        await waitFor(()=>{
            expect(queryByRole('rowheader', {name: '1'})).toBeTruthy();
            expect(queryByRole('cell', {name: 'someGivenName'})).toBeTruthy();
            expect(queryByRole('cell', {name: '1'})).toBeTruthy();
            expect(queryByAltText('check')).toBeTruthy();
        })
    })
})