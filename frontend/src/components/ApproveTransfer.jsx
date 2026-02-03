import { useState } from "react";

function ApproveTransfer({
    contract,
    address,
    onSuccess,
    onError,
    loading,
    setLoading
}) {
    const [activeTab, setActiveTab] = useState("approve");

    // Approve state
    const [spenderAddress, setSpenderAddress] = useState("");
    const [approveAmount, setApproveAmount] = useState("");

    // TransferFrom state
    const [fromAddress, setFromAddress] = useState("");
    const [toAddress, setToAddress] = useState("");
    const [transferAmount, setTransferAmount] = useState("");
    const [allowanceCheck, setAllowanceCheck] = useState("0");

    const handleApprove = async (e) => {
        e.preventDefault();

        if (!contract) {
            onError("Contract not initialized. Please wait...");
            return;
        }

        if (!spenderAddress || !approveAmount) {
            onError("Please fill in all fields");
            return;
        }

        if (parseFloat(approveAmount) <= 0) {
            onError("Amount must be greater than 0");
            return;
        }

        try {
            setLoading(true);
            const ethers = await import("ethers");

            console.log("Approving spender:", spenderAddress, "for amount:", approveAmount);
            const tx = await contract.approve(
                spenderAddress,
                ethers.ethers.parseUnits(approveAmount, 18)
            );

            onSuccess("Approval submitted! Waiting for confirmation...", "info");
            console.log("Transaction hash:", tx.hash);

            await tx.wait();
            console.log("Approval confirmed!");

            onSuccess(`Successfully approved ${approveAmount} DVT for ${spenderAddress.slice(0, 6)}...${spenderAddress.slice(-4)}! 🎉`, "success");

            setSpenderAddress("");
            setApproveAmount("");
        } catch (err) {
            console.error("Approve error:", err);

            if (err.code === 4001 || err.code === "ACTION_REJECTED") {
                onError("Approval rejected by user");
            } else {
                onError("Approval failed: " + (err.reason || err.message || "Unknown error"));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCheckAllowance = async () => {
        if (!contract) {
            onError("Contract not initialized. Please wait...");
            return;
        }

        if (!fromAddress) {
            onError("Please enter the owner address");
            return;
        }

        try {
            // ✅ CORRECT: Check how much the owner (fromAddress) approved YOU (address) to spend
            const allowance = await contract.allowance(fromAddress, address);
            const ethers = await import("ethers");
            const formattedAllowance = ethers.ethers.formatUnits(allowance, 18);
            setAllowanceCheck(formattedAllowance);

            if (parseFloat(formattedAllowance) === 0) {
                onSuccess(`No allowance found. ${fromAddress.slice(0, 6)}...${fromAddress.slice(-4)} needs to approve you first.`, "info");
            } else {
                onSuccess(`You can spend ${formattedAllowance} DVT from ${fromAddress.slice(0, 6)}...${fromAddress.slice(-4)}`, "success");
            }
        } catch (err) {
            console.error("Check allowance error:", err);
            onError("Failed to check allowance: " + (err.message || "Unknown error"));
        }
    };

    const handleTransferFrom = async (e) => {
        e.preventDefault();

        if (!contract) {
            onError("Contract not initialized. Please wait...");
            return;
        }

        if (!fromAddress || !toAddress || !transferAmount) {
            onError("Please fill in all fields");
            return;
        }

        // ✅ REMOVED THIS VALIDATION - it's actually VALID to transfer to yourself
        // The confusion is that YOU are the spender, not the owner

        if (parseFloat(transferAmount) <= 0) {
            onError("Amount must be greater than 0");
            return;
        }

        if (parseFloat(transferAmount) > parseFloat(allowanceCheck)) {
            onError(`Amount exceeds allowance (${allowanceCheck} DVT). Check allowance first.`);
            return;
        }

        try {
            setLoading(true);
            const ethers = await import("ethers");

            console.log("TransferFrom - You (spender):", address);
            console.log("TransferFrom - Owner:", fromAddress);
            console.log("TransferFrom - Recipient:", toAddress);
            console.log("TransferFrom - Amount:", transferAmount);

            const tx = await contract.transferFrom(
                fromAddress,
                toAddress,
                ethers.ethers.parseUnits(transferAmount, 18)
            );

            onSuccess("Transfer submitted! Waiting for confirmation...", "info");
            console.log("Transaction hash:", tx.hash);

            await tx.wait();
            console.log("Transfer confirmed!");

            onSuccess(`Successfully transferred ${transferAmount} DVT from ${fromAddress.slice(0, 6)}...${fromAddress.slice(-4)} to ${toAddress.slice(0, 6)}...${toAddress.slice(-4)}! 🎉`, "success");

            // Refresh allowance after transfer
            const newAllowance = await contract.allowance(fromAddress, address);
            const newFormattedAllowance = ethers.ethers.formatUnits(newAllowance, 18);
            setAllowanceCheck(newFormattedAllowance);

            setTransferAmount("");
        } catch (err) {
            console.error("TransferFrom error:", err);

            if (err.code === 4001 || err.code === "ACTION_REJECTED") {
                onError("Transfer rejected by user");
            } else if (err.message?.includes("allowance exceeded")) {
                onError("Allowance exceeded. Owner needs to approve more tokens.");
            } else if (err.message?.includes("insufficient balance")) {
                onError("Owner has insufficient balance");
            } else {
                onError("Transfer failed: " + (err.reason || err.message || "Unknown error"));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-slate-700/50 mb-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Advanced Operations</h3>
                <div className="text-3xl">🔐</div>
            </div>

            {/* Tab Selector */}
            <div className="flex gap-2 mb-6 p-1 bg-slate-700/50 rounded-xl">
                <button
                    type="button"
                    onClick={() => setActiveTab("approve")}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === "approve"
                        ? "bg-purple-500 text-white shadow-lg"
                        : "text-slate-400 hover:text-white"
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <span>✅</span>
                        <span>Approve</span>
                    </div>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("transferFrom")}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === "transferFrom"
                        ? "bg-purple-500 text-white shadow-lg"
                        : "text-slate-400 hover:text-white"
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <span>🔄</span>
                        <span>Transfer From</span>
                    </div>
                </button>
            </div>

            {/* Approve Tab */}
            {activeTab === "approve" && (
                <form onSubmit={handleApprove} className="space-y-6">
                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">
                            Spender Address (who can spend your tokens)
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="0x... (address to approve)"
                                value={spenderAddress}
                                onChange={(e) => setSpenderAddress(e.target.value)}
                                className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                disabled={loading}
                            />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                                👤
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">
                            Approval Amount
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="0.00"
                                value={approveAmount}
                                onChange={(e) => setApproveAmount(e.target.value)}
                                className="w-full px-4 py-3 pr-20 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                step="0.0001"
                                min="0"
                                disabled={loading}
                            />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 font-medium">
                                DVT
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading || !spenderAddress || !approveAmount}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Processing...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <span>✅</span>
                                <span>Approve Spending</span>
                            </div>
                        )}
                    </button>

                    <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                        <span className="text-xl">ℹ️</span>
                        <span className="text-blue-300 text-sm">
                            <strong>You are currently: {address?.slice(0, 6)}...{address?.slice(-4)}</strong><br />
                            Approving allows another address to spend YOUR tokens on your behalf. Use carefully!
                        </span>
                    </div>
                </form>
            )}

            {/* TransferFrom Tab */}
            {activeTab === "transferFrom" && (
                <form onSubmit={handleTransferFrom} className="space-y-6">
                    {/* Current User Info */}
                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                        <div className="text-purple-300 text-sm">
                            <strong>You are signed in as:</strong><br />
                            <code className="text-purple-200">{address?.slice(0, 10)}...{address?.slice(-8)}</code>
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">
                            Owner Address (whose tokens you want to spend)
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="0x... (token owner who approved you)"
                                    value={fromAddress}
                                    onChange={(e) => setFromAddress(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    disabled={loading}
                                />
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                                    👤
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleCheckAllowance}
                                className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50"
                                disabled={loading || !fromAddress}
                            >
                                Check
                            </button>
                        </div>
                        {parseFloat(allowanceCheck) > 0 && (
                            <div className="mt-2 text-green-400 text-sm">
                                ✓ You can spend: {parseFloat(allowanceCheck).toLocaleString('en-US', { maximumFractionDigits: 4 })} DVT from this owner
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center justify-between text-slate-300 text-sm font-medium mb-2">
                            <span>Recipient Address (where to send the tokens)</span>
                            <button
                                type="button"
                                onClick={() => setToAddress(address)}
                                className="text-xs text-purple-400 hover:text-purple-300 underline"
                            >
                                Use My Address
                            </button>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="0x... (can be your address or anyone else)"
                                value={toAddress}
                                onChange={(e) => setToAddress(e.target.value)}
                                className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                disabled={loading}
                            />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                                👤
                            </div>
                        </div>
                        {toAddress && toAddress.toLowerCase() === address.toLowerCase() && (
                            <div className="mt-2 text-green-400 text-sm">
                                ✓ Tokens will be sent to YOU
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">
                            Amount
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="0.00"
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(e.target.value)}
                                className="w-full px-4 py-3 pr-20 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                step="0.0001"
                                min="0"
                                max={allowanceCheck}
                                disabled={loading}
                            />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 font-medium">
                                DVT
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading || !fromAddress || !toAddress || !transferAmount || parseFloat(allowanceCheck) === 0}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Processing...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <span>🔄</span>
                                <span>Spend Owner's Tokens</span>
                            </div>
                        )}
                    </button>

                    <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                        <span className="text-xl">💡</span>
                        <div className="text-blue-300 text-sm space-y-2">
                            <p className="font-semibold">How TransferFrom Works:</p>
                            <ol className="list-decimal list-inside space-y-1 ml-2">
                                <li>Owner approves YOU to spend their tokens</li>
                                <li>YOU can transfer tokens FROM owner TO any recipient</li>
                                <li>The transaction is signed by YOU (the spender)</li>
                                <li>Recipient can be yourself or anyone else</li>
                            </ol>
                            <p className="mt-2 text-yellow-300 font-semibold">
                                ⚠️ MetaMask will show YOUR account as sender (this is correct - you're spending someone else's tokens with permission!)
                            </p>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}

export default ApproveTransfer;