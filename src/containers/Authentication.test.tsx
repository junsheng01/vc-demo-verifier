import React, { FC, useEffect, useState } from "react";
import { Button, Form, FormControl } from "react-bootstrap";

import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { useAuthentication, AuthenticationProvider } from './Authentication';
import { AffinidiWallet as Wallet } from '@affinidi/wallet-browser-sdk';
import SdkService from "../services/SdkService";
import { MessageService } from "../services/MessageService";
import userEvent from "@testing-library/user-event";


// Mock modules
jest.mock('../services/SdkService');
jest.mock('../services/MessageService');
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

const mockAlert = jest.spyOn(window, 'alert');
jest.spyOn(console, 'error');

const MockSdkService = SdkService as jest.Mocked<typeof SdkService>;

const networkMember: Wallet = new Wallet('testPassword', 'testEncryptedSeed');
const SDK_AUTHENTICATION_LOCAL_STORAGE_KEY = "affinidi:accessToken";

const sdk = new MockSdkService(networkMember) as any;
sdk.accessToken = 'someAccessToken';


const TestComponent: FC = () => {
  const { signOut, setLoginState, loading, authenticated } = useAuthentication();

  async function onSignOut() {
    setLoginState({
        loading: false,
        authenticated: true,
        sdk: sdk,
        message: undefined
    })
    try {
        await signOut();
    } catch (err) {
        alert(err.message);
    }
  }

  useEffect(()=>{
    console.log('iuewhfiw')
    setLoginState({
        loading: false,
        authenticated: true,
        sdk: sdk,
        message: undefined
    })
  }, [])

  return (
    <div className='Login'>
      <div className='Form'>
            <Button block disabled={loading} onClick={onSignOut}>Sign Out</Button>
      </div>
    </div>
    
  );
};

function sleep(ms: any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Test Authentication context', ()=>{

    test('signOut', async ()=>{

        sdk.signOut.mockImplementation()

        localStorage.setItem(SDK_AUTHENTICATION_LOCAL_STORAGE_KEY, 'someToken');

        const { getByRole } = render(
            <AuthenticationProvider>
                <TestComponent />
            </AuthenticationProvider>
        )

        const signOutButton = getByRole('button', {name: 'Sign Out'})
        await sleep(500)
        await act(async ()=>{
            await userEvent.click(signOutButton)
        })

        await waitFor(async ()=>await expect(sdk.signOut).toBeCalled());

        expect(localStorage.getItem(SDK_AUTHENTICATION_LOCAL_STORAGE_KEY)).toBeNull();
    })

    // test('signOut error', async ()=>{
    //     const testUser = {
    //         username: 'testUsername',
    //         password: 'testPassword'
    //     }

    //     const sdk = new MockSdkService(await networkMember) as any
    //     sdk.accessToken = 'someAccessToken'
    //     MockSdkService.fromLoginAndPassword.mockReturnValue(sdk)

    //     const error = new Error("Some Error");
    //     sdk.signOut.mockImplementation(()=>{
    //         throw error;
    //     })

    //     const { getByRole, getByLabelText, queryByRole } = render(
    //         <AuthenticationProvider>
    //             <TestComponent />
    //         </AuthenticationProvider>
    //     )

    //     const usernameField = getByLabelText('Username');
    //     const passwordField = getByLabelText('Password');
    //     const loginButton = getByRole('button', {name: 'Login'});

    //     act(()=>{
    //         fireEvent.change(usernameField, {
    //             target: {
    //                 value: testUser.username
    //             }
    //         })

    //         fireEvent.change(passwordField, {
    //             target: {
    //                 value: testUser.password
    //             }
    //         })
    //     })

    //     await act(async ()=>{
    //         await userEvent.click(loginButton)
    //     })

    //     await waitFor(()=>expect(MockSdkService.fromLoginAndPassword).toBeCalledWith(testUser.username, testUser.password));
    //     expect(MockMessageService).toBeCalled()

    //     const signOutButton = getByRole('button', {name: 'Sign Out'})

    //     await act(async ()=>{
    //         await userEvent.click(signOutButton)
    //     })

    //     await waitFor(()=>expect(sdk.signOut).toBeCalled());
    //     expect(mockAlert).toBeCalledWith(error.message);

    //     expect(queryByRole('button', {name: 'Login'})).not.toBeTruthy();
    //     expect(queryByRole('button', {name: 'Sign Out'})).toBeTruthy();
    // })

    afterEach(()=>{
        localStorage.clear();
    })
})