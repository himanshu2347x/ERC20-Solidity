
function TransferForm({ to, setTo, amount, setAmount, onTransfer, onTransferAll, loading, balance }) {
    const handleMaxClick = () => {
        setAmount(balance);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onTransfer();
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-slate-700/50 mb-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Transfer Tokens</h3>
                <div className="text-3xl">💸</div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                        Recipient Address
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="0x..."
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            disabled={loading}
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                            👤
                        </div>
                    </div>
                </div>

                <div>
                    <label className="flex items-center justify-between text-slate-300 text-sm font-medium mb-2">
                        <span>Amount</span>
                        <span className="text-purple-400 text-xs">
                            Available: {parseFloat(balance).toLocaleString('en-US', { maximumFractionDigits: 4 })} DVT
                        </span>
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-4 py-3 pr-32 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            step="0.0001"
                            min="0"
                            disabled={loading}
                        />
                        <div className="absolute right-20 top-1/2 transform -translate-y-1/2 text-slate-400 font-medium">
                            DVT
                        </div>
                        <button
                            type="button"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleMaxClick}
                            disabled={loading}
                        >
                            MAX
                        </button>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading || !to || !amount}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Processing...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <span>🚀</span>
                                <span>Transfer Tokens</span>
                            </div>
                        )}
                    </button>

                    <button
                        type="button"
                        className="px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={onTransferAll}
                        disabled={loading || !to || parseFloat(balance) === 0}
                    >
                        <div className="flex items-center gap-2">
                            <span>💯</span>
                            <span>All</span>
                        </div>
                    </button>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <span className="text-xl">ℹ️</span>
                    <span className="text-blue-300 text-sm">Gas fees will be deducted from your ETH balance</span>
                </div>
            </form>
        </div>
    );
}

export default TransferForm;