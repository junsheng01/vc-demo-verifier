import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from './Home';

jest.mock('./Login', ()=>()=><p>MockLogin</p>)
jest.mock('./Signup', ()=>()=><p>MockSignup</p>)

describe('Home component test', ()=>{
    test('UI will render correctly', ()=>{
        const { queryByRole, queryByText } = render(<Home />)
        expect(queryByText('MockSignup')).not.toBeTruthy();
        expect(queryByText('MockLogin')).toBeTruthy();
        expect(queryByText('Your company already signed up with verifier?')).not.toBeTruthy();
        expect(queryByRole('button', {name: 'Log in here'})).not.toBeTruthy();
        expect(queryByText('Want to register for an account for your company to verify credentials?')).toBeTruthy();
        expect(queryByRole('link', {name: 'Sign up here'})).toBeTruthy();
    })

    test('Click on signup then click on login', ()=>{
        const  { getByRole, queryByRole, queryByText } = render(<Home />)

        expect(queryByText('MockSignup')).not.toBeTruthy();
        expect(queryByText('Your company already signed up with verifier?')).not.toBeTruthy();
        expect(queryByRole('link', {name: 'Log in here'})).not.toBeTruthy();
        expect(queryByText('Want to register for an account for your company to verify credentials?')).toBeTruthy();
        expect(queryByRole('link', {name: 'Sign up here'})).toBeTruthy();

        const signUpToggle = getByRole('link', {name: 'Sign up here'});

        act(()=>{
            userEvent.click(signUpToggle);
        })

        expect(queryByText('MockSignup')).toBeTruthy();
        expect(queryByText('MockLogin')).not.toBeTruthy();
        expect(queryByText('Your company already signed up with verifier?')).toBeTruthy();
        expect(queryByRole('link', {name: 'Log in here'})).toBeTruthy();
        expect(queryByText('Want to register for an account for your company to verify credentials?')).not.toBeTruthy();
        expect(queryByRole('link', {name: 'Sign up here'})).not.toBeTruthy();

        const loginToggle = getByRole('link', {name: 'Log in here'});

        act(()=>{
            userEvent.click(loginToggle);
        })

        expect(queryByText('MockSignup')).not.toBeTruthy();
        expect(queryByText('Your company already signed up with verifier?')).not.toBeTruthy();
        expect(queryByRole('link', {name: 'Log in here'})).not.toBeTruthy();
        expect(queryByText('Want to register for an account for your company to verify credentials?')).toBeTruthy();
        expect(queryByRole('link', {name: 'Sign up here'})).toBeTruthy();
    })
})