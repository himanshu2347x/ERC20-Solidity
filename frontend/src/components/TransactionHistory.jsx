
function TransactionHistory({ transactions }) {
    const formatAddress = (addr) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const getExplorerLink = (hash) => {
        return `https://sepolia.etherscan.io/tx/${hash}`;
    };

    if (transactions.length === 0) {
        return (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-slate-700/50">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">Transaction History</h3>
                    <div className="text-3xl">📜</div>
                </div>
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-slate-400">No transactions yet</p>
                    <p className="text-slate-500 text-sm mt-2">Your transaction history will appear here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Transaction History</h3>
                <div className="text-3xl">📜</div>
            </div>

            <div className="space-y-4">
                {transactions.map((tx, index) => (
                    <div key={index} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50 hover:border-purple-500/50 transition-all duration-200">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
                                    <span className="text-xl">➡️</span>
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400 text-sm">To:</span>
                                        <span className="text-white font-mono text-sm">{formatAddress(tx.to)}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-red-400 font-bold">-{parseFloat(tx.amount).toLocaleString('en-US', { maximumFractionDigits: 4 })}</span>
                                        <span className="text-slate-400 text-sm ml-1">DVT</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <span>⏱️</span>
                                        <span>{tx.timestamp}</span>
                                    </div>
                                    <a
                                        href={getExplorerLink(tx.hash)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors duration-200"
                                    >
                                        <span>View</span>
                                        <span>↗</span>
                                    </a>
                                </div>

                                {tx.status && (
                                    <div className="mt-2">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${tx.status === 'success' ? 'bg-green-500/20 text-green-400' :
                                                tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${tx.status === 'success' ? 'bg-green-400' :
                                                    tx.status === 'pending' ? 'bg-yellow-400 animate-pulse' :
                                                        'bg-red-400'
                                                }`}></span>
                                            {tx.status}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TransactionHistory;