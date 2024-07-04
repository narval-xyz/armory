import dotenv from 'dotenv';
import path from 'path';

// Resolve the path to the .env file based on the current directory structure
const envPath = path.resolve('/Users/ptroger/narval/narval/examples/armory-sdk-nodejs/.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

import { writeFileSync } from "fs";
import { ENTRYPOINT_ADDRESS_V07, createSmartAccountClient, ENTRYPOINT_ADDRESS_V06 } from "permissionless";
import { SimpleSmartAccount, signerToSimpleSmartAccount } from "permissionless/accounts";
import {
    createPimlicoBundlerClient,
    createPimlicoPaymasterClient,
} from "permissionless/clients/pimlico";
import { Hex, createPublicClient, http, HttpTransport } from "viem";
import { generatePrivateKey, privateKeyToAccount, toAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { getArmoryConfig } from "./armory.sdk";
import { Sdk, armoryClient, armoryUserOperationSigner } from "./armory.account";
import { setInitialState } from "./armory.data";
import { Action, SerializedUserOperationV6, UserOperationV6, hexSchema } from "@narval/policy-engine-shared";
import { resourceId } from "@narval/armory-sdk";
import { getUserOperationHash } from "permissionless/utils"
import { v4 } from "uuid";
import { getChainId } from 'viem/actions';

console.log('ALCHEMY_API_KEY:', process.env.ALCHEMY_API_KEY);
console.log('ROOT_USER_CRED:', process.env.ROOT_USER_CRED);
console.log('PIMLICO_API_KEY:', process.env.PIMLICO_API_KEY);
console.log('PRIVATE_KEY:', process.env.PRIVATE_KEY);

const main = async () => {
  const simpleSmartAccountWithNarval = (simpleSmartAccount: SimpleSmartAccount<"0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", HttpTransport, undefined>, narvalSdk: Sdk, signerId: string): SimpleSmartAccount<"0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", HttpTransport, undefined> => {
    const signUserOperation = async (userOp: any) => {
      const factoryAddress = await simpleSmartAccount.getFactory();
      console.log('\n\n ###factoryAddress:', factoryAddress, '\n\n')
      const chainId = await getChainId(simpleSmartAccount.client)
      console.log('\n\n ###chainId:', chainId, '\n\n')
      const signature = await simpleSmartAccount.getDummySignature(userOp as any)

      const result = UserOperationV6.safeParse({
        ...userOp,
        chainId,
        factoryAddress,
        signature,
        entryPoint: simpleSmartAccount.entryPoint,
      })
      if (!result.success) {
        console.log('-------------\n\nError in signUserOperation\n\n-------------\n\n###UserOp: ', userOp, result.error)
        throw new Error('Invalid user operation')
      }
      console.log('###UserOp: ', SerializedUserOperationV6.parse(result.data))
      const nonce = v4()
      const accessToken = await narvalSdk.authClient.requestAccessToken({
        action: Action.SIGN_USER_OPERATION,
        resourceId: signerId,
        userOperation: result.data,
        nonce,
      })
      .catch((e) => {
        console.log('-------------\n\nError in signUserOperation\n\n-------------')
        console.error(e)
      })
      console.log('###AccessToken: ', accessToken)

      if (!accessToken) {
        throw new Error('No access token')
      }

      const signedUserOp = await narvalSdk.vaultClient.sign({
        data: {
          action: Action.SIGN_USER_OPERATION,
          resourceId: signerId,
          nonce,
          userOperation: result.data,
        },
        accessToken,
      })

      return signedUserOp.signature
    }
    return {
      ...simpleSmartAccount,
      signUserOperation
    }
  }

  console.group('process.env', process.env.ROOT_USER_CRED)
  const ROOT_USER_CRED = hexSchema.parse(process.env.ROOT_USER_CRED)
  const config = await getArmoryConfig( ROOT_USER_CRED )
  const armory = armoryClient(config);
  const { address: signerAddress } = await setInitialState(armory, ROOT_USER_CRED);
  const signer = armoryUserOperationSigner(armory, signerAddress)

  const apiKey = process.env.PIMLICO_API_KEY
  if (!apiKey) throw new Error("Missing PIMLICO_API_KEY")
  const paymasterUrl = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${apiKey}`

  const publicClient = createPublicClient({
    transport: http("https://rpc.ankr.com/eth_sepolia"),
  })

  const paymasterClient = createPimlicoPaymasterClient({
    transport: http(paymasterUrl),
    entryPoint: ENTRYPOINT_ADDRESS_V06,
  })

  const account = await signerToSimpleSmartAccount(publicClient, {
    signer,
    entryPoint: ENTRYPOINT_ADDRESS_V06, // global entrypoint
  })

  const narvalAccount = simpleSmartAccountWithNarval(account, armory, resourceId(signerAddress))

  console.log(`Smart account address: https://sepolia.etherscan.io/address/${narvalAccount.address}`)
  
  const bundlerUrl = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${apiKey}`
  
  const bundlerClient = createPimlicoBundlerClient({
    transport: http(bundlerUrl),
    entryPoint: ENTRYPOINT_ADDRESS_V06,
  })
  
  const smartAccountClient = createSmartAccountClient({
    account: narvalAccount,
    entryPoint: ENTRYPOINT_ADDRESS_V06,
    chain: sepolia,
    bundlerTransport: http(bundlerUrl),
    middleware: {
      gasPrice: async () => {
        return (await bundlerClient.getUserOperationGasPrice()).fast
      },
      sponsorUserOperation: paymasterClient.sponsorUserOperation,
    },
  })


  const txHash = await smartAccountClient.sendTransaction({
    to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    value: 0n,
  })
  
  console.log(`User operation included: https://sepolia.etherscan.io/tx/${txHash}`)
}

main().catch(console.error)