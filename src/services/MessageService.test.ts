import { MessageService } from '../services/MessageService';
import SdkService from '../services/SdkService'
import { AffinidiWallet as Wallet } from '@affinidi/wallet-browser-sdk';
import AffinidiDidAuthService  from "@affinidi/affinidi-did-auth-lib/dist/DidAuthService/DidAuthService";


jest.mock('../services/SdkService');
jest.mock("@affinidi/wallet-browser-sdk", ()=>({
    AffinidiWallet: jest.fn()
}))
jest.mock("@affinidi/wallet-core-sdk", ()=>({
    __dangerous: {}
}))

jest.mock('uint8arrays/to-string.js', ()=>{});
jest.mock('uint8arrays/from-string.js', ()=>{});

jest.mock("@affinidi/affinidi-did-auth-lib/dist/DidAuthService/DidAuthService");

const networkMember: Wallet = new Wallet('testPassword', 'testEncryptedSeed');
const MockAffinidiDidAuthService = AffinidiDidAuthService as jest.Mocked<any>
const MockSdkService = SdkService as jest.Mocked<typeof SdkService>;

const sdkService = new MockSdkService(networkMember);
const messageService = new MessageService(sdkService);



describe('Message Service Test', ()=>{
    test('constructor', async ()=>{
        new MessageService(sdkService);
        expect(MockAffinidiDidAuthService).toBeCalled();
    })

    test('send method with response status == 200', async ()=>{
        jest.spyOn(MockSdkService.prototype, 'createEncryptedMessage').mockResolvedValue('someEncryptedMessage');
        const mockFetch = jest.spyOn(global as any, 'fetch').mockResolvedValue({
            status: 200,
            json: jest.fn().mockReturnValue('someResponseObject')
        })

        jest.spyOn(MockAffinidiDidAuthService.prototype, 'isTokenExpired').mockReturnValue(true)
        jest.spyOn(MockAffinidiDidAuthService.prototype, 'createDidAuthResponseToken').mockResolvedValue('someResponseToken')

        const obj = await messageService.send('someDid', 'someMessage');

        await expect(MockSdkService.prototype.createEncryptedMessage).toBeCalledWith('someDid', 'someMessage');
        await expect(mockFetch).toBeCalled();
        await expect(MockAffinidiDidAuthService.prototype.createDidAuthResponseToken).toBeCalledWith('someResponseObject');
        await expect(obj).toEqual('someResponseObject');
    })

    test('send method with response status < 200 || response.status > 299', async ()=>{
        jest.spyOn(MockSdkService.prototype, 'createEncryptedMessage').mockResolvedValue('someEncryptedMessage');
        const mockFetch = jest.spyOn(global as any, 'fetch').mockResolvedValue({
            status: 500,
            json: jest.fn().mockReturnValue('someResponseObject'),
        })

        jest.spyOn(MockAffinidiDidAuthService.prototype, 'isTokenExpired').mockReturnValue(true)
        jest.spyOn(MockAffinidiDidAuthService.prototype, 'createDidAuthResponseToken').mockResolvedValue('someResponseToken')

        await expect(messageService.send('someDid', 'someMessage')).rejects.toBeTruthy();;

        await expect(MockSdkService.prototype.createEncryptedMessage).toBeCalledWith('someDid', 'someMessage');
        await expect(mockFetch).toBeCalled();
        
    })

    test('send method with response status 204', async ()=>{
        jest.spyOn(MockSdkService.prototype, 'createEncryptedMessage').mockResolvedValue('someEncryptedMessage');
        const mockFetch = jest.spyOn(global as any, 'fetch').mockResolvedValue({
            status: 204,
            json: jest.fn().mockReturnValue('someResponseObject')
        })

        jest.spyOn(MockAffinidiDidAuthService.prototype, 'isTokenExpired').mockReturnValue(true)
        jest.spyOn(MockAffinidiDidAuthService.prototype, 'createDidAuthResponseToken').mockResolvedValue('someResponseToken')

        const obj = await messageService.send('someDid', 'someMessage');

        await expect(MockSdkService.prototype.createEncryptedMessage).toBeCalledWith('someDid', 'someMessage');
        await expect(mockFetch).toBeCalled();
        await expect(MockAffinidiDidAuthService.prototype.createDidAuthResponseToken).toBeCalledWith(undefined);
        await expect(obj).toEqual(undefined);
        
    })

    test('getAll method', async () => {
        const mockGetToken = jest.spyOn(MessageService.prototype as any, 'getToken').mockResolvedValue('someToken');
        const mockExecute = jest.spyOn(MessageService.prototype as any, 'execute').mockReturnValue({
            messages: [
                {
                    id: 'someId',
                    fromDid: 'someDid',
                    createdAt: 'someDateTime',
                    message: 'someMessage'
                }
            ]
        });
        await messageService.getAll();
        await expect(mockGetToken).toBeCalled()
        await expect(mockExecute).toBeCalledWith(
            '/messages',
            'GET',
            'someToken'
        );
        await expect(sdkService.readEncryptedMessage).toBeCalledWith('someMessage');
    })

    test('delete method', async ()=>{
        const mockGetToken = jest.spyOn(MessageService.prototype as any, 'getToken').mockResolvedValue('someToken');
        const mockExecute = jest.spyOn(MessageService.prototype as any, 'execute').mockReturnValue({
            messages: [
                {
                    id: 'someId',
                    fromDid: 'someDid',
                    createdAt: 'someDateTime',
                    message: 'someMessage'
                }
            ]
        });
        await messageService.delete('someId');
        await expect(mockGetToken).toBeCalled()
        await expect(mockExecute).toBeCalledWith(
            '/message/someId',
            'DELETE',
            'someToken'
        );
    })


})