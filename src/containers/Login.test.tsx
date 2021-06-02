import React from 'react';
import { act, render, fireEvent } from '@testing-library/react';
import Login from './Login';
import userEvent from '@testing-library/user-event';
import SdkService from '../services/SdkService';
import { MessageService } from '../services/MessageService';
import { AuthenticationProvider } from './Authentication';
import { AffinidiWallet as Wallet } from '@affinidi/wallet-browser-sdk';


jest.mock('../services/SdkService');
jest.mock('../services/MessageService');
jest.mock("@affinidi/wallet-browser-sdk", ()=>({
    AffinidiWallet: jest.fn()
}))
jest.mock("@affinidi/wallet-core-sdk", ()=>({
    __dangerous: {}
}))
jest.mock("@affinidi/affinidi-did-auth-lib/dist/DidAuthService/DidAuthService", ()=>{});


let MockSdkService = SdkService as jest.Mocked<typeof SdkService>;
let MockMessageService = MessageService as jest.Mocked<typeof MessageService>;
let mockSetItemInLocalStorage: jest.SpyInstance = jest.spyOn(Storage.prototype, 'setItem');
let mockAlert: jest.SpyInstance = jest.spyOn(window, 'alert');

const networkMember: Wallet = new Wallet('testKey', 'testEncryptedSeed');
const SDK_AUTHENTICATION_LOCAL_STORAGE_KEY = "affinidi:accessToken";



describe('Login Test', ()=>{

    test('UI can render', async () => {

        const { queryByLabelText, queryByRole } = render(<AuthenticationProvider><Login/></AuthenticationProvider>);

        expect(queryByLabelText('Username')).toBeTruthy();
        expect(queryByLabelText('Password')).toBeTruthy();
        expect(queryByRole('button', {name: 'Login'})).toBeTruthy();
    });

    test('Test login flow', async ()=>{
        const testUser = {
            username: 'testUsername',
            password: 'testPassword'
        }

        MockSdkService.fromLoginAndPassword.mockImplementation((username, password)=>{
            return Promise.resolve(new MockSdkService(networkMember))
        });
        

        const { getByRole, getByLabelText } = render(<AuthenticationProvider><Login/></AuthenticationProvider>);
        const usernameField = getByLabelText('Username');
        const passwordField = getByLabelText('Password');
        const loginButton = getByRole('button', {name: 'Login'});

        
        act(()=>{
            fireEvent.change(usernameField, {
                target: {
                    value: testUser.username
                }
            })

            fireEvent.change(passwordField, {
                target: {
                    value: testUser.password
                }
            })
        });

        expect(loginButton).not.toHaveAttribute('disabled');

        await act(async () => {
            await userEvent.click(loginButton);
        });

        expect(MockSdkService.fromLoginAndPassword).toBeCalledWith('testUsername', 'testPassword');
        expect(MockMessageService).toBeCalled();
        expect(mockSetItemInLocalStorage).toBeCalledWith(SDK_AUTHENTICATION_LOCAL_STORAGE_KEY, undefined);
        expect(mockAlert).not.toBeCalled();
    })

    test('Test login fail', async ()=>{
        const testUser = {
            username: 'testUsername',
            password: 'testPassword'
        }
        const error = new Error('someError');
        MockSdkService.fromLoginAndPassword.mockRejectedValue(error);
        
        const { getByRole, getByLabelText } = render(<AuthenticationProvider><Login/></AuthenticationProvider>);
        const usernameField = getByLabelText('Username');
        const passwordField = getByLabelText('Password');
        const loginButton = getByRole('button', {name: 'Login'});

        
        act(()=>{
            fireEvent.change(usernameField, {
                target: {
                    value: testUser.username
                }
            })

            fireEvent.change(passwordField, {
                target: {
                    value: testUser.password
                }
            })
        });

        expect(loginButton).not.toHaveAttribute('disabled');

        await act(async () => {
            await userEvent.click(loginButton);
        });

        expect(MockSdkService.fromLoginAndPassword).toBeCalledWith('testUsername', 'testPassword');
        expect(MockMessageService).not.toBeCalled();
        expect(mockSetItemInLocalStorage).not.toBeCalledWith(SDK_AUTHENTICATION_LOCAL_STORAGE_KEY, undefined);
        expect(mockAlert).toBeCalledWith(error.message);
    })
})