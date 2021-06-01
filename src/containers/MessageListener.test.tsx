import { act, render, waitFor } from '@testing-library/react';
import { MessageService } from '../services/MessageService';
import SdkService from '../services/SdkService';
import {useAuthentication} from "./Authentication";
import MessageListener from './MessageListener';
import { AffinidiWallet as Wallet } from '@affinidi/wallet-browser-sdk';
import JwtService from "@affinidi/common/dist/services/JwtService";
import userEvent from '@testing-library/user-event';


jest.mock('../services/SdkService');
jest.mock('../services/MessageService');
jest.mock('./Authentication');
jest.mock("@affinidi/wallet-browser-sdk", ()=>({
    AffinidiWallet: jest.fn()
}));
jest.mock("@affinidi/wallet-core-sdk", ()=>({
    __dangerous: {}
}));
jest.mock("@affinidi/affinidi-did-auth-lib/dist/DidAuthService/DidAuthService", ()=>{});


jest.mock("@affinidi/common/dist/services/JwtService", ()=>({
    // ...jest.requireActual('@affinidi/common/dist/services/JwtService'),
    fromJWT: jest.fn()
}));

jest.spyOn(console, 'error');

let mockUseAuthentication = useAuthentication as jest.Mocked<any>;
let MockSdkService = SdkService as jest.Mocked<typeof SdkService>;
let MockMessageService = MessageService as jest.Mocked<typeof MessageService>
let MockJWTService = JwtService as jest.Mocked<typeof JwtService>

const networkMember: Wallet = new Wallet('testPassword', 'testEncryptedSeed');
const sdk = new MockSdkService(networkMember);
const message = new MockMessageService(sdk);

describe('Test Message List', ()=>{
    test('UI can render', async ()=>{
        mockUseAuthentication.mockReturnValue({
            message: message
        })
        jest.useFakeTimers();
        jest.spyOn(MockMessageService.prototype, 'getAll').mockImplementation(()=>{
            return Promise.all([{
                id: 'someId',
                fromDid: 'someFromDid',
                createdAt: 'December 17, 1995 03:24:00',
                message: {
                    token: 'someToken'
                }
            }])
        })
        jest.spyOn(MockMessageService.prototype, 'delete').mockImplementation();

        jest.spyOn(MockJWTService, 'fromJWT').mockReturnValue({
            payload: {
                typ: "credentialResponse"
            }
        });
        const { queryByText, queryByTestId} = render(<MessageListener />);
        jest.advanceTimersByTime(10*1000);
        await waitFor(()=>expect(MockMessageService.prototype.getAll).toBeCalled());
        expect(MockJWTService.fromJWT).toBeCalled();
        expect(queryByText('Message')).toBeTruthy();
        expect(queryByText('25 years ago')).toBeTruthy();
        expect(queryByTestId('toast-body')).toBeTruthy();
    })

    test('Click to process', async ()=>{
        mockUseAuthentication.mockReturnValue({
            message: message
        })
        jest.useFakeTimers();
        jest.spyOn(MockMessageService.prototype, 'getAll').mockImplementation(()=>{
            return Promise.all([{
                id: 'someId',
                fromDid: 'someFromDid',
                createdAt: 'December 17, 1995 03:24:00',
                message: {
                    token: 'someToken'
                }
            }])
        })
        jest.spyOn(MockMessageService.prototype, 'delete').mockImplementation();

        jest.spyOn(MockJWTService, 'fromJWT').mockReturnValue({
            payload: {
                typ: "credentialResponse"
            }
        });
        const { getByTestId} = render(<MessageListener />);
        jest.advanceTimersByTime(10*1000);
        await waitFor(()=>expect(MockMessageService.prototype.getAll).toBeCalled());
        expect(MockJWTService.fromJWT).toBeCalled();

        const toastBody = getByTestId('toast-body');

        act(()=>{
            userEvent.click(toastBody);
        })

        expect(MockMessageService.prototype.delete).toBeCalledWith('someId');

    })

    test('Test close', async ()=>{
        mockUseAuthentication.mockReturnValue({
            message: message
        })
        jest.useFakeTimers();
        jest.spyOn(MockMessageService.prototype, 'getAll').mockImplementation(()=>{
            return Promise.all([{
                id: 'someId',
                fromDid: 'someFromDid',
                createdAt: 'December 17, 1995 03:24:00',
                message: {
                    token: 'someToken'
                }
            }])
        })
        jest.spyOn(MockMessageService.prototype, 'delete').mockImplementation();

        jest.spyOn(MockJWTService, 'fromJWT').mockReturnValue({
            payload: {
                typ: "credentialResponse"
            }
        });
        const { getByText} = render(<MessageListener />);
        jest.advanceTimersByTime(10*1000);
        await waitFor(()=>expect(MockMessageService.prototype.getAll).toBeCalled());
        expect(MockJWTService.fromJWT).toBeCalled();

        const close = getByText('Close')

        act(()=>{
            userEvent.click(close);
        })

        expect(MockMessageService.prototype.delete).toBeCalledWith('someId');

    })

    test('No message', async ()=>{
        mockUseAuthentication.mockReturnValue({
            message: message
        })
        jest.useFakeTimers();
        jest.spyOn(MockMessageService.prototype, 'getAll').mockImplementation(()=>{
            return Promise.all([])
        })
        jest.spyOn(MockMessageService.prototype, 'delete').mockImplementation();

        jest.spyOn(MockJWTService, 'fromJWT').mockReturnValue({
            payload: {
                typ: "credentialResponse"
            }
        });
        const { queryByText, queryByTestId } = render(<MessageListener />);
        jest.advanceTimersByTime(10*1000);
        await waitFor(()=>expect(MockMessageService.prototype.getAll).toBeCalled());
        expect(MockJWTService.fromJWT).not.toBeCalled();
        expect(queryByText('Message')).not.toBeTruthy();
        expect(queryByText('25 years ago')).not.toBeTruthy();
        expect(queryByTestId('toast-body')).not.toBeTruthy();
    })
})