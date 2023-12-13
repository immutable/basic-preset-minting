import { getDefaultProvider, Wallet } from 'ethers'; // ethers v5
import { Provider, TransactionResponse } from '@ethersproject/providers'; // ethers v5
import { ERC721Client } from '@imtbl/contracts';
import 'dotenv/config';

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.MINTER_PRIVATE_KEY;
const provider = getDefaultProvider('https://rpc.testnet.immutable.com');

const mint = async (provider: Provider): Promise<TransactionResponse> => {
  // Bound contract instance
  const contract = new ERC721Client(CONTRACT_ADDRESS!);
  // The wallet of the intended signer of the mint request
  const wallet = new Wallet(PRIVATE_KEY!, provider);
  // We can use the read function hasRole to check if the intended signer
  // has sufficient permissions to mint before we send the transaction
  const minterRole = await contract.MINTER_ROLE(provider);
  const hasMinterRole = await contract.hasRole(
    provider,
    minterRole,
    wallet.address
  );

  if (!hasMinterRole) {
    // Handle scenario without permissions...
    console.log('Account doesnt have permissions to mint.');
    return Promise.reject(
      new Error('Account doesnt have permissions to mint.')
    );
  }

  // Construct the mint requests
  const requests = [
    {
      to: process.env.RECIPIENT_ONE!,
      tokenIds: [1, 2],
    },
    {
      to: process.env.RECIPIENT_TWO!,
      tokenIds: [3],
    },
  ];

  // The network has introduced a minimum gas price of 100 Gwei to protect it against SPAM traffic, ensure it can process transactions efficiently and remain cost-effective. 
  // Transactions with a tip cap below 100 Gwei are rejected by the RPC. This limit ensures a standard for transaction costs. This also implies that the fee cap must be greater than or equal to 100 Gwei.
  const gasOverrides = {
    maxPriorityFeePerGas: 100e9, // 100 Gwei
    maxFeePerGas: 150e9,
    gasLimit: 200000, // Set an appropriate gas limit for your transaction
  };
  
  // Rather than be executed directly, contract write functions on the SDK client are returned
  // as populated transactions so that users can implement their own transaction signing logic.
  const populatedTransaction = await contract.populateMintBatch(requests, gasOverrides);
  const result = await wallet.sendTransaction(populatedTransaction);
  console.log(result); // To get the TransactionResponse value
  return result;
};

mint(provider);