import React from 'react';
import { act, render, fireEvent, waitFor } from '@testing-library/react';
import Signup from './Signup';
import userEvent from '@testing-library/user-event';
import { AuthenticationProvider } from './Authentication';
import * as ApiService from '../services/apiService';


// jest.mock('../services/SdkService');
// jest.mock('../services/MessageService');
jest.mock("@affinidi/wallet-browser-sdk", ()=>({
    AffinidiWallet: jest.fn()
}))
jest.mock("@affinidi/wallet-core-sdk", ()=>({
    __dangerous: {}
}))
jest.mock("@affinidi/affinidi-did-auth-lib/dist/DidAuthService/DidAuthService", ()=>{});

const mockSignUp = jest.spyOn(ApiService, 'signup');
const mockAlert = jest.spyOn(window, 'alert');

describe('Signup component', ()=>{
    test('UI can render', ()=>{
        const { queryByRole, queryByLabelText, queryByText } = render(
            <AuthenticationProvider>
                <Signup setShowSignUp = {true}/>
            </AuthenticationProvider>
        )

        expect(queryByRole('heading', {level: 1, name: 'Verifier Sign Up'})).toBeTruthy();
        expect(queryByText('Sign up as a Verifier to request and receive credentials for transactions!')).toBeTruthy();
        expect(queryByLabelText('Username')).toBeTruthy();
        expect(queryByLabelText('Password')).toBeTruthy();
        expect(queryByLabelText('Confirm Password')).toBeTruthy();
        expect(queryByRole('checkbox', {name: 'I accept the terms and conditions'}));
        expect(queryByRole('button', {name: 'Sign Up'})).toBeTruthy();
    })

    test('Sign up flow success', async ()=> {

        const testUser = {
            username: 'testUsername',
            password: 'testPassword',
            terms: true
        }

        mockSignUp.mockResolvedValue('someToken');

        const { getByRole, getByLabelText } = render(
            <AuthenticationProvider>
                <Signup setShowSignUp = {true}/>
            </AuthenticationProvider>
        );

        const usernameField = getByLabelText('Username');
        const passwordField = getByLabelText('Password');
        const confirmPasswordField = getByLabelText('Confirm Password');
        const termsCheckbox = getByRole('checkbox', {name: 'I accept the terms and conditions'});
        const submitButton = getByRole('button', {name: 'Sign Up'});

        act(()=>{
            fireEvent.change(usernameField, {
                target: {
                    value: testUser.username
                }
            });

            fireEvent.change(passwordField, {
                target: {
                    value: testUser.password
                }
            });

            fireEvent.change(confirmPasswordField, {
                target: {
                    value: testUser.password
                }
            });

            userEvent.click(termsCheckbox);
        });

        await act(async ()=>{
            await userEvent.click(submitButton)
        });

        expect(mockAlert).not.toBeCalledWith('Please agree with the terms and conditions before you sign up.');
        expect(mockAlert).not.toBeCalledWith('Passwords do not match.');
        expect(mockSignUp).toBeCalledWith(testUser.username, testUser.password);
        await waitFor(()=>expect(mockAlert).toBeCalledWith('Account has been created. Please sign in.'));
    });

    test('Alert prompting user to agree with terms should be shown if checkbox is not clicked', async ()=> {

        const testUser = {
            username: 'testUsername',
            password: 'testPassword',
            terms: true
        }

        mockSignUp.mockResolvedValue('someToken');

        const { getByRole, getByLabelText } = render(
            <AuthenticationProvider>
                <Signup setShowSignUp = {true}/>
            </AuthenticationProvider>
        );

        const usernameField = getByLabelText('Username');
        const passwordField = getByLabelText('Password');
        const confirmPasswordField = getByLabelText('Confirm Password');
        const submitButton = getByRole('button', {name: 'Sign Up'});

        act(()=>{
            fireEvent.change(usernameField, {
                target: {
                    value: testUser.username
                }
            });

            fireEvent.change(passwordField, {
                target: {
                    value: testUser.password
                }
            });

            fireEvent.change(confirmPasswordField, {
                target: {
                    value: testUser.password
                }
            });

        });

        await act(async ()=>{
            await userEvent.click(submitButton)
        });

        expect(mockAlert).toBeCalledWith('Please agree with the terms and conditions before you sign up.');
        expect(mockAlert).not.toBeCalledWith('Passwords do not match.');
        expect(mockSignUp).not.toBeCalledWith(testUser.username, testUser.password);
        await waitFor(()=>expect(mockAlert).not.toBeCalledWith('Account has been created. Please sign in.'));
    });

    test('Alert stating that passwords do not match should be shown if password != confirmPassword', async ()=>{
        const testUser = {
            username: 'testUsername',
            password: 'testPassword',
            terms: true
        }

        mockSignUp.mockResolvedValue('someToken');

        const { getByRole, getByLabelText } = render(
            <AuthenticationProvider>
                <Signup setShowSignUp = {true}/>
            </AuthenticationProvider>
        );

        const usernameField = getByLabelText('Username');
        const passwordField = getByLabelText('Password');
        const confirmPasswordField = getByLabelText('Confirm Password');
        const termsCheckbox = getByRole('checkbox', {name: 'I accept the terms and conditions'});
        const submitButton = getByRole('button', {name: 'Sign Up'});

        act(()=>{
            fireEvent.change(usernameField, {
                target: {
                    value: testUser.username
                }
            });

            fireEvent.change(passwordField, {
                target: {
                    value: testUser.password
                }
            });

            fireEvent.change(confirmPasswordField, {
                target: {
                    value: 'incorrectPassword'
                }
            });

            userEvent.click(termsCheckbox);
        });

        await act(async ()=>{
            await userEvent.click(submitButton)
        });

        expect(mockAlert).not.toBeCalledWith('Please agree with the terms and conditions before you sign up.');
        expect(mockAlert).toBeCalledWith('Passwords do not match.');
        expect(mockSignUp).not.toBeCalledWith(testUser.username, testUser.password);
        await waitFor(()=>expect(mockAlert).not.toBeCalledWith('Account has been created. Please sign in.'));
    })

    test('Alert should be shown if there is some signup error', async ()=>{
        
        const testUser = {
            username: 'testUsername',
            password: 'testPassword',
            terms: true
        }
        const error = new Error('someError');
        mockSignUp.mockRejectedValue(error);

        const { getByRole, getByLabelText } = render(
            <AuthenticationProvider>
                <Signup setShowSignUp = {true}/>
            </AuthenticationProvider>
        );

        const usernameField = getByLabelText('Username');
        const passwordField = getByLabelText('Password');
        const confirmPasswordField = getByLabelText('Confirm Password');
        const termsCheckbox = getByRole('checkbox', {name: 'I accept the terms and conditions'});
        const submitButton = getByRole('button', {name: 'Sign Up'});

        act(()=>{
            fireEvent.change(usernameField, {
                target: {
                    value: testUser.username
                }
            });

            fireEvent.change(passwordField, {
                target: {
                    value: testUser.password
                }
            });

            fireEvent.change(confirmPasswordField, {
                target: {
                    value: testUser.password
                }
            });

            userEvent.click(termsCheckbox);
        });

        await act(async ()=>{
            await userEvent.click(submitButton)
        });

        expect(mockAlert).not.toBeCalledWith('Please agree with the terms and conditions before you sign up.');
        expect(mockAlert).not.toBeCalledWith('Passwords do not match.');
        expect(mockSignUp).toBeCalledWith(testUser.username, testUser.password);
        await waitFor(()=>{
            expect(mockAlert).not.toBeCalledWith('Account has been created. Please sign in.');
            expect(mockAlert).toBeCalledWith(error.message);
        });

    })
})
