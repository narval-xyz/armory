// import { createArmory, ArmoryClientConfig, Armory } from '../../armory'
// import { Request, AccessToken, EvaluationResponse, Decision } from '@narval/policy-engine-shared';
// import axios from 'axios';
// import { NarvalSdkException, ForbiddenException, NotImplementedException } from '../../exceptions';

// jest.mock('axios');
// const mockedAxios = axios as jest.Mocked<typeof axios>;

// describe('Armory Client', () => {
//   const mockConfig: ArmoryClientConfig = {
//     authHost: 'https://cloud.narval.xyz/auth',
//     vaultHost: 'https://cloud.narval.xyz/vault',
//     entityStoreHost: 'https://cloud.narval.xyz/auth',
//     policyStoreHost: 'https://cloud.narval.xyz/auth',
//     clientId: 'test-client-id',
//     signer: {
//       kty: 'RSA',
//       n: 'test-n',
//       e: 'test-e'
//     }
//   };

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('createEvaluate', () => {
//     it('should handle PERMIT decision correctly', async () => {
//       const request: Request = { };
//       const response: EvaluationResponse = {
//         decision: Decision.PERMIT,
//         accessToken: { value: 'access-token-value' }
//       };

//       mockedAxios.post.mockResolvedValue({ data: response });
//       const armory = createArmory(mockConfig);
//       const result = await armory.evaluate(request);

//       expect(result).toEqual(response);
//       expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('/evaluations'), expect.anything(), expect.anything());
//     });

//     it('should throw NarvalSdkException when accessToken is missing on PERMIT decision', async () => {
//       const request: Request = { id: 'test-request' };
//       const response: EvaluationResponse = { decision: Decision.PERMIT };

//       mockedAxios.post.mockResolvedValue({ data: response });
//       const armory = createArmory(mockConfig);

//       await expect(armory.evaluate(request)).rejects.toThrow(NarvalSdkException);
//     });

//     it('should throw NotImplementedException for CONFIRM decision', async () => {
//       const request: Request = { id: 'test-request' };
//       const response: EvaluationResponse = { decision: Decision.CONFIRM };

//       mockedAxios.post.mockResolvedValue({ data: response });
//       const armory = createArmory(mockConfig);

//       await expect(armory.evaluate(request)).rejects.toThrow(NotImplementedException);
//     });

//     it('should throw ForbiddenException for FORBID decision', async () => {
//       const request: Request = { id: 'test-request' };
//       const response: EvaluationResponse = { decision: Decision.FORBID };

//       mockedAxios.post.mockResolvedValue({ data: response });
//       const armory = createArmory(mockConfig);

//       await expect(armory.evaluate(request)).rejects.toThrow(ForbiddenException);
//     });
//   });

//   describe('createSignRequest', () => {
//     it('should successfully sign a request', async () => {
//       const request: Request = { id: 'test-request' };
//       const accessToken: AccessToken = { value: 'access-token-value' };
//       const hex = 'signed-hex-value';

//       mockedAxios.post.mockResolvedValue({ data: { signature: hex } });
//       const armory = createArmory(mockConfig);
//       const result = await armory.signRequest(request, accessToken);

//       expect(result).toEqual(hex);
//       expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('/sign'), expect.anything(), expect.anything());
//     });
//   });
// });
