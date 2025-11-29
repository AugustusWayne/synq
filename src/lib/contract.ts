import { Abi } from "viem";

export const paymentsAddress = "0xA97Cb465cf77b1f31a9b554491451cc94871E0A1" as const;

export const paymentsAbi: Abi = [
  {
    "type": "function",
    "name": "pay",
    "stateMutability": "payable",
    "inputs": [{ "name": "merchant", "type": "address" }],
    "outputs": []
  },
  {
    "type": "event",
    "name": "PaymentReceived",
    "inputs": [
      { "indexed": true, "name": "merchant", "type": "address" },
      { "indexed": true, "name": "payer", "type": "address" },
      { "indexed": false, "name": "amount", "type": "uint256" },
      { "indexed": false, "name": "timestamp", "type": "uint256" }
    ]
  }
];

export const merchantAddress = "0xCb5452F2123c67738084CA49D34dC249c5c3B599" as const;

