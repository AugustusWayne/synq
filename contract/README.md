# Smart Contracts - Avalanche x402

Payment smart contracts built with Solidity and Foundry.

---

## 📁 Structure

```
contract/
├── src/
│   ├── Payments.sol      # Main payment contract
│   └── deployed.json     # Deployment info
├── script/
│   └── Deploy.s.sol      # Deployment script
├── test/
│   └── Payments.t.sol    # Contract tests
└── foundry.toml          # Foundry config
```

---

## 🔧 Setup

### **Install Foundry**
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### **Install Dependencies**
```bash
forge install
```

---

## 📝 Contracts

### **Payments.sol**

Main payment processing contract.

**Key Functions:**
- `pay(address merchant)` - Send payment to merchant
- Emits `PaymentReceived` event on successful payment

**Events:**
```solidity
event PaymentReceived(
    address indexed payer,
    address indexed merchant,
    uint256 amount,
    uint256 timestamp
);
```

---

## 🧪 Testing

### **Run Tests**
```bash
forge test
```

### **Run with Gas Report**
```bash
forge test --gas-report
```

### **Run with Verbosity**
```bash
forge test -vvv
```

---

## 🚀 Deployment

### **1. Set Environment**
Create `.env` file:
```bash
PRIVATE_KEY=your_private_key_here
```

### **2. Deploy to Fuji Testnet**
```bash
forge script script/Deploy.s.sol \
  --rpc-url https://api.avax-test.network/ext/bc/C/rpc \
  --broadcast \
  --legacy \
  --slow
```

### **3. Verify Contract** (Optional)
```bash
forge verify-contract \
  --chain-id 43113 \
  --constructor-args $(cast abi-encode "constructor()") \
  CONTRACT_ADDRESS \
  src/Payments.sol:Payments \
  --etherscan-api-key YOUR_SNOWTRACE_KEY
```

---

## 📊 Deployed Contracts

### **Fuji Testnet**
- **Address:** `0xA97Cb465cf77b1f31a9b554491451cc94871E0A1`
- **Explorer:** [View on Snowtrace](https://testnet.snowtrace.io/address/0xA97Cb465cf77b1f31a9b554491451cc94871E0A1)
- **Network:** Avalanche Fuji (Chain ID: 43113)
- **RPC:** https://api.avax-test.network/ext/bc/C/rpc

---

## 🔍 Contract ABI

The ABI is automatically generated in `out/Payments.sol/Payments.json` after building.

To use in frontend, copy the ABI to `src/lib/contract.ts`.

---

## 🛠️ Foundry Commands

### **Build**
```bash
forge build
```

### **Test**
```bash
forge test
```

### **Format**
```bash
forge fmt
```

### **Gas Snapshots**
```bash
forge snapshot
```

### **Local Node (Anvil)**
```bash
anvil
```

### **Deploy**
```bash
forge script script/Deploy.s.sol:Deploy --rpc-url <RPC_URL> --broadcast
```

### **Cast (Blockchain interactions)**
```bash
# Get balance
cast balance 0xYourAddress --rpc-url fuji

# Call contract
cast call CONTRACT_ADDRESS "function()" --rpc-url fuji

# Send transaction
cast send CONTRACT_ADDRESS "function()" --private-key KEY --rpc-url fuji
```

---

## 📖 Resources

- **Foundry Book:** https://book.getfoundry.sh/
- **Avalanche Docs:** https://docs.avax.network/
- **Solidity Docs:** https://docs.soliditylang.org/

---

## 📝 License

MIT
