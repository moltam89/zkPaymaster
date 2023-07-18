const { Provider, Contract, Wallet, utils } =  require("zksync-web3");

// erc-20
const ERC20ABI = '[ { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transfer", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ]';

const ZK_TESTNET_USDC_ADDRESS = "0x0faF6df7054946141266420b43783387A78d82A9";
const PAYMASTER_ADDRESS = "0xDB4FB4fC0378448f98Ae9967F2081EE899159c20";

const TEST_PK = "0x8bacb91fadac739b93aadf9c2bc878c3f9f12720ab1222c1cc9ff7d36198a6ab";
const TEST_ADDR = "0x4De54860DF6a8b5a142A2b4A00107A72D49123D1";

const main = async () => {
    wallet = new Wallet(TEST_PK);
    provider = new Provider("https://testnet.era.zksync.dev");
    wallet = wallet.connect(provider);

    tokenUSDC = new Contract(ZK_TESTNET_USDC_ADDRESS, ERC20ABI, wallet);

/*** Approve paymaster
    const approve = await tokenUSDC.approve(PAYMASTER_ADDRESS, 100000); // 0.1 USDC required by the paymaster
    console.log("approve", approve);

    return;
*/

    const allowance = await tokenUSDC.allowance(TEST_ADDR, PAYMASTER_ADDRESS);
    console.log("allowance", allowance);

    // Encoding the "ApprovalBased" paymaster flow's input
    const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
        type: "ApprovalBased",
        token: ZK_TESTNET_USDC_ADDRESS,
        // set minimalAllowance as we defined in the paymaster contract
        minimalAllowance: 42, // This is actually not used in the paymaster contract
        // empty bytes as testnet paymaster does not use innerInput
        innerInput: new Uint8Array(),
    });

    const result = await (
        await tokenUSDC.transfer("0x8c9D11cE64289701eFEB6A68c16e849E9A2e781d", 200000, {
            // paymaster info
            customData: {
                paymasterParams: paymasterParams,
                gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
            },
        })
    ).wait();

    console.log("result", result);

    return;
}


main();