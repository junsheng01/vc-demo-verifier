import { act, render, waitFor } from '@testing-library/react';
import Dashboard from './Dashboard';


jest.mock('./CredentialTable', ()=>()=><p>MockCredentialTable</p>)

describe('Dashboard Component Test', ()=>{
    test('UI can render', ()=>{
        const { queryByRole, queryByText } = render(<Dashboard />)
        expect(queryByRole('heading', {name: 'Applicants\' Credentials Table'}));
        expect(queryByText('MockCredentialTable'));
    });
})