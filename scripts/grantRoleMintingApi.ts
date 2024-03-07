import { getDefaultProvider, Wallet } from 'ethers'; // ethers v5
import { Provider, TransactionResponse } from '@ethersproject/providers'; // ethers v5
import { ERC721Client } from '@imtbl/contracts';
import 'dotenv/config';

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;
const provider = getDefaultProvider('https://rpc.testnet.immutable.com');

// The address of our minting contract that requires the minter role (testnet)
const MINTER_ADDRESS = '0x9CcFbBaF5509B1a03826447EaFf9a0d1051Ad0CF';

const grantRoleMintingApi = async (
  provider: Provider,
): Promise<TransactionResponse> => {
  // Bound contract instance
  const contract = new ERC721Client(CONTRACT_ADDRESS!);

  // Your admin wallet that can grant the minter role
  const wallet = new Wallet(PRIVATE_KEY!, provider);

  // Give the minting contract minter role access
  const populatedTransaction = await contract.populateGrantMinterRole(
    MINTER_ADDRESS,
    {
      maxPriorityFeePerGas: 100e9,
      maxFeePerGas: 150e9,
    },
  );
  const result = await wallet.sendTransaction(populatedTransaction);
  console.log('Transaction Response:', result); // To get the TransactionResponse value
  const receipt = await result.wait();
  console.log('Transaction Receipt:', receipt); // To get the transaction receipt
  return result;
};

grantRoleMintingApi(provider);
