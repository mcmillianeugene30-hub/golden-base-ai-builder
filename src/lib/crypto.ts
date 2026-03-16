import { createPublicClient, createWalletClient, http, parseUnits, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { db } from './db';
import { ADMIN_CONFIG } from '@/packages/config/admin';

const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL),
});

const USDC_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
] as const;

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bDA02913' as `0x${string}`;

export const generatePaymentAddress = (userId: string): `0x${string}` => {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  
  return account.address;
};

export const verifyPayment = async (
  txHash: `0x${string}`,
  amount: number,
  currency: 'USDC' | 'ETH'
): Promise<{ valid: boolean; from?: string; amount?: string }> => {
  try {
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    
    if (receipt.status === 'success') {
      if (currency === 'USDC') {
        const transferLogs = receipt.logs.filter(
          (log) => log.address.toLowerCase() === USDC_ADDRESS.toLowerCase()
        );

        for (const log of transferLogs) {
          const decoded = publicClient.decodeEventLog({
            abi: USDC_ABI,
            eventName: 'Transfer',
            data: log.data,
            topics: log.topics as any,
          });

          if (decoded) {
            const amountBN = decoded.args.value;
            const receivedAmount = parseFloat(formatUnits(amountBN, 6));
            
            if (receivedAmount >= amount * 0.99) {
              return {
                valid: true,
                from: decoded.args.from,
                amount: receivedAmount.toString(),
              };
            }
          }
        }
      } else {
        const tx = await publicClient.getTransaction({ hash: txHash });
        if (tx && tx.to?.toLowerCase() === ADMIN_CONFIG.wallet.toLowerCase()) {
          const value = parseFloat(formatUnits(tx.value || 0n, 18));
          if (value >= amount * 0.99) {
            return {
              valid: true,
              from: tx.from,
              amount: value.toString(),
            };
          }
        }
      }
    }

    return { valid: false };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return { valid: false };
  }
};

export const recordCryptoPayment = async (
  userId: string,
  txHash: `0x${string}`,
  amount: number,
  currency: 'USDC' | 'ETH',
  type: 'subscription' | 'credits' | 'frame_payment'
) => {
  const verification = await verifyPayment(txHash, amount, currency);

  if (!verification.valid) {
    throw new Error('Payment verification failed');
  }

  const transaction = await db.transaction.create({
    data: {
      userId,
      type,
      amount: amount,
      currency,
      method: 'crypto',
      status: 'completed',
      txHash,
    },
  });

  return transaction;
};

export const getCryptoPaymentQRCode = (
  amount: number,
  currency: 'USDC' | 'ETH'
): string => {
  const address = ADMIN_CONFIG.wallet;
  const decimals = currency === 'USDC' ? 6 : 18;
  const value = parseUnits(amount.toString(), decimals);
  
  return `ethereum:${address}@8453?value=${value}`;
};

export const estimateGasFee = async (
  to: `0x${string}`,
  value: bigint,
  data?: `0x${string}`
): Promise<bigint> => {
  const gasEstimate = await publicClient.estimateGas({
    to,
    value,
    data,
  });

  const gasPrice = await publicClient.getGasPrice();
  
  return gasEstimate * gasPrice;
};

export const checkUSDCBalance = async (address: `0x${string}`): Promise<number> => {
  const balance = await publicClient.readContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: [address],
  });

  return parseFloat(formatUnits(balance, 6));
};

export const checkETHBalance = async (address: `0x${string}`): Promise<number> => {
  const balance = await publicClient.getBalance({ address });
  
  return parseFloat(formatUnits(balance, 18));
};
