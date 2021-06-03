import cloudWalletApi from './apiService';
import {signup} from './apiService';


describe('Test apiService', () => {
    
    test('storeSignedVCs function', async () =>{
        jest.spyOn(cloudWalletApi, 'post').mockResolvedValue({
            data: 'someResponseData'
        })
        const data = await signup('testUsername', 'testPassword');
        expect(cloudWalletApi.post).toBeCalledWith("/users/signup", {"password": "testPassword", "username": "testUsername"})
        expect(data).toEqual('someResponseData');
    })
})