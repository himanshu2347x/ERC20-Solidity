import { ethers } from "ethers";
import { useEffect, useState } from "react";
import ABI from "./abi/DevToken.json";
import ApproveTransfer from "./components/ApproveTransfer";
import Dashboard from "./components/Dashboard";
import Faucet from "./components/Faucet";
import TransactionHistory from "./components/TransactionHistory";
import TransferForm from "./components/TransferForm";
import WalletConnect from "./components/WalletConnect";

const CONTRACT_ADDRESS = "0x4AAb49557de7AC638A261d8F11447733c38b8964";
const SEPOLIA_CHAIN_ID = "0xaa36a7";

function getMetaMaskProvider() {
  if (typeof window.ethereum === "undefined") {
    return null;
  }

  if (window.ethereum.providers?.length) {
    return window.ethereum.providers.find((p) => p.isMetaMask) || null;
  }

  if (window.ethereum.isMetaMask) {
    return window.ethereum;
  }

  return null;
}

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState("0");
  const [ethBalance, setEthBalance] = useState("0");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHistory, setTxHistory] = useState([]);
  const [contract, setContract] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  /* -------------------- UPDATE CONTRACT WHEN SIGNER CHANGES -------------------- */
  useEffect(() => {
    if (signer) {
      console.log("✅ Creating new contract instance with updated signer");
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      setContract(contractInstance);
    } else {
      setContract(null);
    }
  }, [signer]);

  /* -------------------- EVENT LISTENERS -------------------- */
  useEffect(() => {
    const metamask = getMetaMaskProvider();
    if (!metamask) return;

    // ✅ REMOVED: Account change handler
    // We DON'T want to automatically switch accounts anymore

    const handleChainChanged = (chainId) => {
      console.log("⛓️ Chain changed:", chainId);
      window.location.reload();
    };

    metamask.on("chainChanged", handleChainChanged);

    return () => {
      if (metamask.removeListener) {
        metamask.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  /* -------------------- CONNECT WALLET -------------------- */
  async function connectWallet() {
    try {
      setLoading(true);

      const metamask = getMetaMaskProvider();

      if (!metamask) {
        showNotification(
          "MetaMask not detected. Please install MetaMask extension.",
          "error"
        );
        window.open("https://metamask.io/download/", "_blank");
        return;
      }

      console.log("MetaMask detected, requesting accounts...");

      const accounts = await metamask.request({
        method: "eth_requestAccounts"
      });

      if (!accounts || accounts.length === 0) {
        showNotification("No accounts found. Please create a MetaMask account.", "error");
        return;
      }

      console.log("Accounts received:", accounts);

      const prov = new ethers.BrowserProvider(metamask);
      const network = await prov.getNetwork();

      console.log("Connected to network:", network.chainId.toString());

      if (network.chainId !== BigInt(parseInt(SEPOLIA_CHAIN_ID, 16))) {
        console.log("Switching to Sepolia...");
        try {
          await metamask.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await metamask.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: SEPOLIA_CHAIN_ID,
                    chainName: "Sepolia Testnet",
                    nativeCurrency: {
                      name: "Sepolia ETH",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    rpcUrls: ["https://sepolia.infura.io/v3/"],
                    blockExplorerUrls: ["https://sepolia.etherscan.io"],
                  },
                ],
              });
            } catch (addError) {
              console.error("Error adding Sepolia network:", addError);
              showNotification("Failed to add Sepolia network", "error");
              return;
            }
          } else {
            console.error("Error switching network:", switchError);
            showNotification("Please switch to Sepolia network manually", "error");
            return;
          }
        }
      }

      const sign = await prov.getSigner();
      const addr = await sign.getAddress();

      setProvider(prov);
      setSigner(sign);
      setAddress(addr);

      await loadBalances(prov, sign, addr);
      showNotification("Wallet connected successfully! 🎉", "success");

      console.log("Successfully connected to:", addr);
    } catch (err) {
      console.error("Connection error:", err);

      if (err.code === 4001) {
        showNotification("Connection rejected by user", "error");
      } else if (err.code === -32002) {
        showNotification("Connection request already pending. Please check MetaMask.", "error");
      } else {
        showNotification(
          "Failed to connect: " + (err.message || "Unknown error"),
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function disconnectWallet() {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setBalance("0");
    setEthBalance("0");
    setTxHistory([]);
    setContract(null);
    console.log("🔌 Wallet disconnected");
  }

  /* -------------------- BALANCES -------------------- */
  async function loadBalances(prov, sign, addr) {
    try {
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, ABI, sign);

      const tokenBal = await contractInstance.balanceOf(addr);
      setBalance(ethers.formatUnits(tokenBal, 18));

      const ethBal = await prov.getBalance(addr);
      setEthBalance(ethers.formatEther(ethBal));

      console.log("💰 Balances loaded - DVT:", ethers.formatUnits(tokenBal, 18), "ETH:", ethers.formatEther(ethBal));
    } catch (error) {
      console.error("Error loading balances:", error);
    }
  }

  /* -------------------- TRANSFER -------------------- */
  async function transferToken() {
    if (!to || !amount) {
      showNotification("Please fill in all fields", "error");
      return;
    }

    if (!ethers.isAddress(to)) {
      showNotification("Invalid recipient address", "error");
      return;
    }

    if (parseFloat(amount) <= 0) {
      showNotification("Amount must be greater than 0", "error");
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      showNotification("Insufficient balance", "error");
      return;
    }

    try {
      setLoading(true);

      if (!contract) {
        showNotification("Contract not initialized", "error");
        return;
      }

      console.log("Sending transaction from:", address);
      const tx = await contract.transfer(to, ethers.parseUnits(amount, 18));

      showNotification("Transaction submitted! Waiting for confirmation...", "info");
      console.log("Transaction hash:", tx.hash);

      await tx.wait();
      console.log("Transaction confirmed!");

      setTxHistory((prev) => [
        {
          hash: tx.hash,
          to,
          amount,
          timestamp: new Date().toLocaleString(),
          status: "success",
        },
        ...prev,
      ]);

      await loadBalances(provider, signer, address);
      showNotification("Transfer successful! 🎉", "success");

      setAmount("");
      setTo("");
    } catch (err) {
      console.error("Transfer error:", err);

      if (err.code === 4001 || err.code === "ACTION_REJECTED") {
        showNotification("Transaction rejected by user", "error");
      } else if (err.message?.includes("insufficient")) {
        showNotification("Insufficient balance or gas", "error");
      } else {
        showNotification(
          "Transaction failed: " + (err.reason || err.message || "Unknown error"),
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function transferAll() {
    if (!to) {
      showNotification("Please enter recipient address", "error");
      return;
    }

    if (parseFloat(balance) === 0) {
      showNotification("No tokens to transfer", "error");
      return;
    }

    if (!ethers.isAddress(to)) {
      showNotification("Invalid recipient address", "error");
      return;
    }

    try {
      setLoading(true);

      if (!contract) {
        showNotification("Contract not initialized", "error");
        return;
      }

      console.log("Sending all tokens to:", to);
      const tx = await contract.transfer(to, ethers.parseUnits(balance, 18));

      showNotification("Transaction submitted! Waiting for confirmation...", "info");
      console.log("Transaction hash:", tx.hash);

      await tx.wait();
      console.log("Transaction confirmed!");

      setTxHistory((prev) => [
        {
          hash: tx.hash,
          to,
          amount: balance,
          timestamp: new Date().toLocaleString(),
          status: "success",
        },
        ...prev,
      ]);

      await loadBalances(provider, signer, address);
      showNotification("Transfer successful! 🎉", "success");

      setAmount("");
      setTo("");
    } catch (err) {
      console.error("Transfer error:", err);

      if (err.code === 4001 || err.code === "ACTION_REJECTED") {
        showNotification("Transaction rejected by user", "error");
      } else if (err.message?.includes("insufficient")) {
        showNotification("Insufficient balance or gas", "error");
      } else {
        showNotification(
          "Transaction failed: " + (err.reason || err.message || "Unknown error"),
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function showNotification(message, type) {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 5000);
  }

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl animate-slide-down ${notification.type === "success"
            ? "bg-green-500 text-white"
            : notification.type === "error"
              ? "bg-red-500 text-white"
              : "bg-blue-500 text-white"
            }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">
              {notification.type === "success"
                ? "✓"
                : notification.type === "error"
                  ? "✕"
                  : "ℹ"}
            </span>
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {!address ? (
          <WalletConnect onConnect={connectWallet} loading={loading} />
        ) : (
          <>
            <div className="mb-8 flex justify-between items-center">
              <h1 className="text-3xl font-bold text-white">DevToken Wallet</h1>
              <button
                onClick={disconnectWallet}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all duration-200"
              >
                <span>🔌</span>
                <span>Disconnect</span>
              </button>
            </div>

            <Dashboard
              address={address}
              balance={balance}
              ethBalance={ethBalance}
            />

            <TransferForm
              to={to}
              setTo={setTo}
              amount={amount}
              setAmount={setAmount}
              onTransfer={transferToken}
              onTransferAll={transferAll}
              loading={loading}
              balance={balance}
            />

            <Faucet
              contract={contract}
              address={address}
              onSuccess={(msg, type) => {
                showNotification(msg, type);
                if (type === "success") {
                  loadBalances(provider, signer, address);
                }
              }}
              onError={(msg) => showNotification(msg, "error")}
              loading={loading}
              setLoading={setLoading}
            />

            <ApproveTransfer
              contract={contract}
              address={address}
              onSuccess={(msg, type) => {
                showNotification(msg, type);
                if (type === "success") {
                  loadBalances(provider, signer, address);
                }
              }}
              onError={(msg) => showNotification(msg, "error")}
              loading={loading}
              setLoading={setLoading}
            />

            <TransactionHistory transactions={txHistory} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;