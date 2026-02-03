
function WalletConnect({ onConnect, loading }) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full border border-slate-700/50">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-12 h-12 text-white" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.25 13.5L20 6L31.75 13.5V26.5L20 34L8.25 26.5V13.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20 34V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M31.75 13.5L20 20L8.25 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-center text-white mb-3">Welcome to DevToken</h2>
                <p className="text-slate-400 text-center mb-8">
                    Connect your wallet to start transferring tokens on the blockchain
                </p>

                <button
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${loading
                            ? 'bg-slate-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-purple-500/50'
                        }`}
                    onClick={onConnect}
                    disabled={loading}
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Connecting...</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-3">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                                alt="MetaMask"
                                className="w-6 h-6"
                            />
                            <span>Connect with MetaMask</span>
                        </div>
                    )}
                </button>

                <div className="mt-8 space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-xl">
                        <div className="text-2xl">🔒</div>
                        <div>
                            <strong className="text-white block">Secure</strong>
                            <span className="text-slate-400 text-sm">Non-custodial wallet</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-xl">
                        <div className="text-2xl">⚡</div>
                        <div>
                            <strong className="text-white block">Fast</strong>
                            <span className="text-slate-400 text-sm">Instant transfers</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-xl">
                        <div className="text-2xl">🌐</div>
                        <div>
                            <strong className="text-white block">Decentralized</strong>
                            <span className="text-slate-400 text-sm">No intermediaries</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WalletConnect;