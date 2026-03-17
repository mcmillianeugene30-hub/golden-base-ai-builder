'use client';

import { useState, useEffect } from 'react';
import { X, Copy, CheckCircle2 } from 'lucide-react';

interface CryptoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'subscription' | 'credits';
  amount: number;
  tier?: string;
  pack?: string;
}

export default function CryptoPaymentModal({
  isOpen,
  onClose,
  type,
  amount,
  tier,
  pack,
}: CryptoPaymentModalProps) {
  const [address, setAddress] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPaymentInfo();
    }
  }, [isOpen, amount]);

  const fetchPaymentInfo = async () => {
    try {
      const response = await fetch(`/api/payments/crypto?amount=${amount}&currency=USDC`);
      const data = await response.json();
      if (data.success) {
        setAddress(data.address);
        setQrCode(data.qrCode);
      }
    } catch (error) {
      console.error('Error fetching payment info:', error);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            Pay with Base USDC
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-white mb-2">
            ${amount.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">
            {type === 'subscription' ? `Subscription: ${tier}` : `Credit Pack: ${pack} credits`}
          </div>
        </div>

        {qrCode && (
          <div className="bg-white rounded-xl p-4 mb-6 flex items-center justify-center">
            <img src={`data:image/svg+xml,${encodeURIComponent(qrCode)}`} alt="QR Code" className="w-48 h-48" />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Send USDC to this address on Base:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={address}
                readOnly
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm"
              />
              <button
                onClick={copyAddress}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
              >
                {copied ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
            I've Made the Payment
          </button>

          <p className="text-xs text-gray-500 text-center">
            Your account will be credited once the transaction is confirmed on the blockchain. This may take a few minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
