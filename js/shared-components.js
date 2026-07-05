// Small shared/reusable presentational components

        // Toast Component for feedback
        const Toast = ({ message, type, onClose }) => {
            React.useEffect(() => {
                const timer = setTimeout(onClose, 3000);
                return () => clearTimeout(timer);
            }, [onClose]);

            return (
                <div className="fixed bottom-5 right-5 z-50 flex items-center p-4 rounded-xl shadow-xl modal-animate border border-stone-200/50 bg-white">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full mr-3 ${type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                    <p className="text-sm font-semibold text-stone-800">{message}</p>
                </div>
            );
        };

        const StatCard = ({ title, value, icon }) => (
            <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-stone-100 flex items-center space-x-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="p-3 bg-stone-50 rounded-xl text-stone-600">
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-medium text-stone-500">{title}</p>
                    <h3 className="text-2xl font-bold text-stone-800">{value}</h3>
                </div>
            </div>
        );
