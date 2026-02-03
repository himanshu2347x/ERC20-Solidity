import { useEffect, useState } from "react";

function Faucet({ contract, address, onSuccess, onError, loading, setLoading }) {
    const [cooldown, setCooldown] = useState(0);
    const [canClaim, setCanClaim] = useState(false);
    const [faucetAmount, setFaucetAmount] = useState("100");

    useEffect(() => {
        if (contract && address) {
            checkCooldown();
            getFaucetAmount();
        }
    }, [contract, address]);

    useEffect(() => {
        if (cooldown > 0) {
            const interval = setInterval(() => {
                setCooldown((prev) => {
                    const newCooldown = prev - 1;
                    if (newCooldown <= 0) {
                        setCanClaim(true);
                        return 0;
                    }
                    return newCooldown;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [cooldown]);

    const getFaucetAmount = async () => {
        try {
            if (!contract) return;
            const amount = await contract.FAUCET_AMOUNT();
            const ethers = await import("ethers");
            setFaucetAmount(ethers.ethers.formatUnits(amount, 18));
        } catch (err) {
            console.error("Error getting faucet amount:", err);
        }
    };

    const checkCooldown = async () => {
        try {
            if (!contract || !address) return;
            const cooldownSeconds = await contract.getFaucetCooldown(address);
            const cooldownNum = Number(cooldownSeconds);

            setCooldown(cooldownNum);
            setCanClaim(cooldownNum === 0);

            console.log("Faucet cooldown:", cooldownNum, "seconds");
        } catch (err) {
            console.error("Error checking cooldown:", err);
            setCanClaim(true); // Allow attempt if check fails
        }
    };

    const handleClaim = async () => {
        if (!contract) {
            onError("Contract not initialized. Please wait...");
            return;
        }

        if (!canClaim) {
            onError(`Please wait ${formatTime(cooldown)} before claiming again`);
            return;
        }

        try {
            setLoading(true);

            console.log("Claiming faucet tokens...");
            const tx = await contract.faucet();

            onSuccess("Faucet claim submitted! Waiting for confirmation...", "info");
            console.log("Transaction hash:", tx.hash);

            await tx.wait();
            console.log("Faucet claim confirmed!");

            onSuccess(`Successfully claimed ${faucetAmount} DVT tokens! 🎉`, "success");

            // Refresh cooldown
            await checkCooldown();
        } catch (err) {
            console.error("Faucet claim error:", err);

            if (err.code === 4001 || err.code === "ACTION_REJECTED") {
                onError("Claim rejected by user");
            } else if (err.message?.includes("cooldown")) {
                onError("Faucet cooldown is still active. Please wait before claiming again.");
                await checkCooldown(); // Refresh to get accurate cooldown
            } else {
                onError("Claim failed: " + (err.reason || err.message || "Unknown error"));
            }
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        if (seconds === 0) return "Ready!";

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };

    return (
        <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-emerald-500/30 mb-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Token Faucet</h3>
                <div className="text-3xl">🚰</div>
            </div>

            <div className="space-y-6">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full shadow-lg mb-4">
                        <span className="text-4xl">💧</span>
                    </div>
                    <h4 className="text-white text-xl font-semibold mb-2">
                        Get Free {faucetAmount} DVT Tokens
                    </h4>
                    <p className="text-slate-300 text-sm">
                        Claim free tokens once every 24 hours
                    </p>
                </div>

                {!canClaim && cooldown > 0 ? (
                    <div className="bg-slate-700/50 rounded-xl p-6 text-center">
                        <div className="text-slate-400 text-sm mb-2">Next claim available in</div>
                        <div className="text-3xl font-bold text-white mb-4">
                            {formatTime(cooldown)}
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-1000"
                                style={{
                                    width: `${Math.max(0, Math.min(100, ((86400 - cooldown) / 86400) * 100))}%`,
                                }}
                            ></div>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={handleClaim}
                        className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading || !canClaim}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Processing...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <span>💧</span>
                                <span>Claim {faucetAmount} DVT</span>
                            </div>
                        )}
                    </button>
                )}

                <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <span className="text-xl">ℹ️</span>
                    <div className="text-emerald-300 text-sm">
                        <div className="font-semibold mb-1">Faucet Rules:</div>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Claim {faucetAmount} DVT tokens for free</li>
                            <li>24-hour cooldown between claims</li>
                            <li>Gas fees apply (paid in ETH)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Faucet;
