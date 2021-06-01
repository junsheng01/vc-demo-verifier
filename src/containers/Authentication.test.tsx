import React, { FC, useState } from "react";
import { Button, Form, FormControl } from "react-bootstrap";

import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { useAuthentication, AuthenticationProvider } from './Authentication';
import { AffinidiWallet as Wallet } from '@affinidi/wallet-browser-sdk';
import SdkService from "../services/SdkService";
import { MessageService } from "../services/MessageService";
import userEvent from "@testing-library/user-event";



const TestComponent: FC = () => {
  const { loading, login, signOut, authenticated } = useAuthentication();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function onLogin() {
    try {
      await login.fromLoginAndPassword(username, password);
    } catch (err) {
      alert(err.message);
    }
  }

  async function onSignOut() {
      try {
          await signOut();
      } catch (err) {
          alert(err.message);
      }
  }

  return (
    <div className='Login'>
      <div className='Form'>
        <Form style={{ width: 280 }}>
            <Form.Group controlId="username">
                <Form.Label>Username</Form.Label>
                <FormControl
                autoFocus
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                />
            </Form.Group>

            <Form.Group controlId="password">
                <Form.Label>Password</Form.Label>
                <FormControl
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                />
            </Form.Group>
            {authenticated ?
                <Button block disabled={loading} onClick={onSignOut}>Sign Out</Button>:
                <Button block disabled={loading} onClick={onLogin}>Login</Button>
            }   

        </Form>
      </div>
    </div>
    
  );
};

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
const MockMessageService = MessageService as jest.Mocked<typeof MessageService>

const networkMember: Wallet = new Wallet('testPassword', 'testEncryptedSeed');
const SDK_AUTHENTICATION_LOCAL_STORAGE_KEY = "affinidi:accessToken";

describe('Test Authentication context', ()=>{
    test('login', async ()=>{
        const testUser = {
            username: 'testUsername',
            password: 'testPassword'
        };

        MockSdkService.fromLoginAndPassword.mockImplementation(async ()=>{
            const sdk = new MockSdkService(await networkMember) as any
            sdk.accessToken = 'someAccessToken'
            return sdk
        });

        MockSdkService.fromAccessToken.mockImplementation(async ()=>{
            const sdk = new MockSdkService(await networkMember) as any
            sdk.accessToken = 'someAccessToken'
            return sdk
        });

        const { getByRole, getByLabelText, queryByRole } = render(
            <AuthenticationProvider>
                <TestComponent />
            </AuthenticationProvider>
        );

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
        })

        await act(async ()=>{
            await userEvent.click(loginButton)
        })

        //await waitFor(()=>expect(MockSdkService.fromLoginAndPassword).toBeCalledWith(testUser.username, testUser.password));
        expect(MockMessageService).toBeCalled()

        expect(queryByRole('button', {name: 'Login'})).not.toBeTruthy();
        expect(queryByRole('button', {name: 'Sign Out'})).toBeTruthy();

        expect(localStorage.getItem(SDK_AUTHENTICATION_LOCAL_STORAGE_KEY)).toBe('someAccessToken');
    })

    test('login error', async ()=>{
        const testUser = {
            username: 'testUsername',
            password: 'testPassword'
        }
        const error = new Error('someErrorMessage');
        MockSdkService.fromLoginAndPassword.mockImplementation(async ()=>{
            throw error
        })

        MockSdkService.fromAccessToken.mockImplementation(async ()=>{
            const sdk = new MockSdkService(await networkMember) as any
            sdk.accessToken = 'someAccessToken'
            return sdk
        });

        const { getByRole, getByLabelText, queryByRole } = render(
            <AuthenticationProvider>
                <TestComponent />
            </AuthenticationProvider>
        )

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
        })

        await act(async ()=>{
            await userEvent.click(loginButton)
        })

        await waitFor(()=>expect(MockSdkService.fromLoginAndPassword).toBeCalledWith(testUser.username, testUser.password));
        expect(MockMessageService).not.toBeCalled()

        expect(mockAlert).toBeCalledWith(error.message);

        expect(queryByRole('button', {name: 'Login'})).toBeTruthy();
        expect(queryByRole('button', {name: 'Sign Out'})).not.toBeTruthy();
        
        expect(localStorage.getItem(SDK_AUTHENTICATION_LOCAL_STORAGE_KEY)).toBeNull();
    })

    test('signOut', async ()=>{
        const testUser = {
            username: 'testUsername',
            password: 'testPassword'
        }

        const sdk = new MockSdkService(await networkMember) as any
        sdk.accessToken = 'someAccessToken'
        MockSdkService.fromLoginAndPassword.mockReturnValue(sdk)
        sdk.signOut.mockImplementation()

        const { getByRole, getByLabelText, queryByRole } = render(
            <AuthenticationProvider>
                <TestComponent />
            </AuthenticationProvider>
        )

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
        })

        await act(async ()=>{
            await userEvent.click(loginButton)
        })

        await waitFor(()=>expect(MockSdkService.fromLoginAndPassword).toBeCalledWith(testUser.username, testUser.password));
        expect(MockMessageService).toBeCalled();

        const signOutButton = getByRole('button', {name: 'Sign Out'})

        await act(async ()=>{
            await userEvent.click(signOutButton)
        })

        await waitFor(()=>expect(sdk.signOut).toBeCalled());

        expect(queryByRole('button', {name: 'Login'})).toBeTruthy();
        expect(queryByRole('button', {name: 'Sign Out'})).not.toBeTruthy();

        expect(localStorage.getItem(SDK_AUTHENTICATION_LOCAL_STORAGE_KEY)).toBeNull();
    })

    test('signOut error', async ()=>{
        const testUser = {
            username: 'testUsername',
            password: 'testPassword'
        }

        const sdk = new MockSdkService(await networkMember) as any
        sdk.accessToken = 'someAccessToken'
        MockSdkService.fromLoginAndPassword.mockReturnValue(sdk)

        const error = new Error("Some Error");
        sdk.signOut.mockImplementation(()=>{
            throw error;
        })

        const { getByRole, getByLabelText, queryByRole } = render(
            <AuthenticationProvider>
                <TestComponent />
            </AuthenticationProvider>
        )

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
        })

        await act(async ()=>{
            await userEvent.click(loginButton)
        })

        await waitFor(()=>expect(MockSdkService.fromLoginAndPassword).toBeCalledWith(testUser.username, testUser.password));
        expect(MockMessageService).toBeCalled()

        const signOutButton = getByRole('button', {name: 'Sign Out'})

        await act(async ()=>{
            await userEvent.click(signOutButton)
        })

        await waitFor(()=>expect(sdk.signOut).toBeCalled());
        expect(mockAlert).toBeCalledWith(error.message);

        expect(queryByRole('button', {name: 'Login'})).not.toBeTruthy();
        expect(queryByRole('button', {name: 'Sign Out'})).toBeTruthy();
    })

    afterEach(()=>{
        localStorage.clear();
    })
})