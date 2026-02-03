import React from "react";

function Dashboard({ address, balance, ethBalance }) {
    const formatAddress = (addr) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="space-y-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-slate-700/50">
                <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl opacity-50 animate-pulse"></div>
                        <span className="relative text-white text-xl font-bold">{address.slice(2, 4).toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                        <span className="text-slate-400 text-sm block mb-1">Connected Wallet</span>
                        <div className="flex items-center gap-2">
                            <span className="text-white font-mono text-lg">{formatAddress(address)}</span>
                            <button
                                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors duration-200"
                                onClick={() => copyToClipboard(address)}
                                title="Copy address"
                            >
                                <span className="text-xl">📋</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-purple-500/30 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-2xl">🪙</span>
                            </div>
                            <span className="text-slate-300 text-sm font-medium">DevToken Balance</span>
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-1">
                            {parseFloat(balance).toLocaleString('en-US', { maximumFractionDigits: 4 })}
                        </h2>
                        <span className="text-purple-300 text-sm font-semibold">DVT</span>
                    </div>
                </div>

                <div className="relative bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-blue-500/30 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-2xl">⟠</span>
                            </div>
                            <span className="text-slate-300 text-sm font-medium">ETH Balance</span>
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-1">
                            {parseFloat(ethBalance).toLocaleString('en-US', { maximumFractionDigits: 4 })}
                        </h2>
                        <span className="text-blue-300 text-sm font-semibold">ETH</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;