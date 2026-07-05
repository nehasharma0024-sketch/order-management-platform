// Public-facing catalogue viewer (what a customer sees via the shared link)

        const PublicItemCard = ({ item, onClick }) => {
            const [currentIdx, setCurrentIdx] = React.useState(0);
            const hasImages = item.images && item.images.length > 0;

            const handlePrev = (e) => {
                e.stopPropagation();
                if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
                else setCurrentIdx(item.images.length - 1);
            };

            const handleNext = (e) => {
                e.stopPropagation();
                if (currentIdx < item.images.length - 1) setCurrentIdx(currentIdx + 1);
                else setCurrentIdx(0);
            };

            return (
                <div onClick={onClick} className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden cursor-pointer group hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                    <div className="relative aspect-square w-full bg-stone-50 overflow-hidden">
                        {hasImages ? (
                            <>
                                <img src={item.images[currentIdx]} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                {item.images.length > 1 && (
                                    <>
                                        <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white text-stone-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <ArrowLeftIcon className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white text-stone-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <ArrowRightIcon className="w-3.5 h-3.5" />
                                        </button>
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1 bg-black/25 backdrop-blur-sm px-2 py-1 rounded-full">
                                            {item.images.map((_, idx) => (
                                                <span key={idx} className={`block w-1.5 h-1.5 rounded-full transition-all ${idx === currentIdx ? 'bg-white w-3' : 'bg-white/50'}`} />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-stone-300">
                                <PhotoIcon className="w-12 h-12 stroke-[1.5]" />
                                <span className="text-xs mt-2 font-medium text-stone-400">No images</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="p-5 flex-grow flex flex-col justify-between">
                        <div>
                            <h3 className="text-base font-bold text-stone-800 group-hover:text-stone-900 transition-colors line-clamp-1">{item.title}</h3>
                            {item.description && (
                                <p className="text-xs text-stone-500 mt-1 line-clamp-2">{item.description}</p>
                            )}
                        </div>
                        <div className="mt-4 flex items-center justify-between pt-3 border-t border-stone-50">
                            <span className="text-base font-extrabold text-emerald-600">Rs.{parseFloat(item.price || 0).toLocaleString()}</span>
                            <span className="text-xs font-semibold text-stone-500 group-hover:text-stone-800 flex items-center transition-colors">
                                View details
                                <svg className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </div>
                    </div>
                </div>
            );
        };

        // Item Detail Modal in Public Catalogue Viewer
        const PublicItemDetailModal = ({ isOpen, item, catalogue, onClose }) => {
            if (!isOpen || !item) return null;
            const [activeIdx, setActiveIdx] = React.useState(0);
            const hasImages = item.images && item.images.length > 0;

            const handleWhatsAppInquiry = () => {
                const text = `Hi! I'm interested in "${item.title}" (Rs. ${parseFloat(item.price || 0).toLocaleString()}) from your catalogue "${catalogue.title}". Can you share more details?`;
                const phone = catalogue.whatsApp ? catalogue.whatsApp.replace(/[^0-9]/g, '') : '';
                const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
                window.open(url, '_blank');
            };

            return (
                <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-[#Fdfbf7] rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden modal-animate border border-stone-200/50 flex flex-col md:flex-row relative">
                        <button onClick={onClose} className="absolute right-4 top-4 z-20 text-stone-400 hover:text-stone-700 bg-white/80 hover:bg-white rounded-full p-2 border border-stone-100 shadow-md transition-all">
                            <CloseIcon className="w-5 h-5" />
                        </button>

                        {/* Left Side: Product Images */}
                        <div className="w-full md:w-1/2 bg-stone-100/50 p-6 flex flex-col justify-center border-r border-stone-200/50 relative">
                            <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-sm bg-white border border-stone-100 flex items-center justify-center">
                                {hasImages ? (
                                    <img src={item.images[activeIdx]} className="w-full h-full object-contain" />
                                ) : (
                                    <PhotoIcon className="w-20 h-20 text-stone-300 stroke-[1]" />
                                )}
                                
                                {hasImages && item.images.length > 1 && (
                                    <>
                                        <button onClick={() => setActiveIdx(activeIdx > 0 ? activeIdx - 1 : item.images.length - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-stone-800 shadow-md transition-colors">
                                            <ArrowLeftIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setActiveIdx(activeIdx < item.images.length - 1 ? activeIdx + 1 : 0)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-stone-800 shadow-md transition-colors">
                                            <ArrowRightIcon className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                            
                            {/* Thumbnails */}
                            {hasImages && item.images.length > 1 && (
                                <div className="flex space-x-2 mt-4 overflow-x-auto pb-1 max-w-full justify-center">
                                    {item.images.map((imgUrl, idx) => (
                                        <button key={idx} onClick={() => setActiveIdx(idx)} className={`w-14 h-14 rounded-lg overflow-hidden border-2 bg-white flex-shrink-0 transition-all ${idx === activeIdx ? 'border-stone-800 scale-105 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                                            <img src={imgUrl} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Side: Product Details */}
                        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="inline-flex px-3 py-1 bg-stone-100 text-stone-600 text-xs font-semibold rounded-full border border-stone-200">
                                    Catalogue Item
                                </div>
                                <h2 className="text-2xl md:text-3xl font-extrabold text-stone-900 leading-tight">{item.title}</h2>
                                
                                <div className="text-2xl font-bold text-emerald-600">
                                    Rs. {parseFloat(item.price || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                </div>
                                
                                <div className="border-t border-stone-200/50 pt-4">
                                    <h4 className="text-xs uppercase tracking-wider text-stone-400 font-bold mb-2">Description</h4>
                                    <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                                        {item.description || 'No description provided.'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-stone-200/50 space-y-3">
                                <button onClick={handleWhatsAppInquiry} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/10 flex items-center justify-center space-x-2.5">
                                    <WhatsAppIcon className="w-5 h-5" />
                                    <span>Inquire via WhatsApp</span>
                                </button>
                                
                                {catalogue.whatsApp && (
                                    <p className="text-[11px] text-stone-400 text-center">
                                        Direct inquiries to seller: <span className="font-semibold">{catalogue.whatsApp}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        // Shareable Public Catalogue Viewer Dashboard
        const PublicCatalogueViewer = ({ catalogueId }) => {
            const [catalogue, setCatalogue] = React.useState(null);
            const [loading, setLoading] = React.useState(true);
            const [searchQuery, setSearchQuery] = React.useState('');
            const [sortBy, setSortBy] = React.useState('default');
            const [selectedItem, setSelectedItem] = React.useState(null);

            React.useEffect(() => {
                const catalogueRef = doc(db, 'artifacts', appId, 'public', 'data', 'catalogues', catalogueId);
                const unsubscribe = onSnapshot(catalogueRef, (snap) => {
                    if (snap.exists()) {
                        setCatalogue({ ...snap.data(), id: snap.id });
                    } else {
                        setCatalogue(null);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Error subscribing to public catalogue:", error);
                    setLoading(false);
                });

                return () => unsubscribe();
            }, [catalogueId]);

            React.useEffect(() => {
                if (catalogue && catalogue.title) {
                    document.title = `${catalogue.title} - Manvi Art`;
                } else if (!loading) {
                    document.title = "Catalogue Not Found - Manvi Art";
                }
            }, [catalogue, loading]);

            if (loading) {
                return (
                    <div className="min-h-screen flex flex-col items-center justify-center bg-[#Fdfbf7]">
                        <div className="animate-spin h-10 w-10 text-stone-800 border-4 border-stone-200 border-t-stone-800 rounded-full mb-4"></div>
                        <p className="text-base font-semibold text-stone-600">Loading catalog...</p>
                    </div>
                );
            }

            if (!catalogue) {
                return (
                    <div className="min-h-screen flex flex-col items-center justify-center bg-[#Fdfbf7] text-center p-6 fade-in-up">
                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 text-rose-500">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-stone-800">Catalogue Not Found</h2>
                        <p className="text-sm text-stone-500 mt-2 max-w-sm">The catalogue link might be incorrect or it has been deleted by the administrator.</p>
                        <button
                            onClick={() => window.navigateTo('/')}
                            className="mt-6 px-5 py-2.5 bg-stone-800 text-white text-sm font-semibold rounded-xl hover:bg-stone-900 transition-all shadow-md"
                        >
                            Back to Home
                        </button>
                    </div>
                );
            }

            const filteredItems = (catalogue.items || [])
                .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .sort((a, b) => {
                    if (sortBy === 'price-low-to-high') return a.price - b.price;
                    if (sortBy === 'price-high-to-low') return b.price - a.price;
                    return 0; // Default ordering
                });

            return (
                <div className="min-h-screen pb-20 bg-[#Fdfbf7]">
                    {/* Slim top nav */}
                    <div className="bg-white/80 backdrop-blur-sm border-b border-stone-200/60 sticky top-0 z-20">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center">
                            <button
                                onClick={() => window.navigateTo('/')}
                                className="flex items-center text-xs sm:text-sm font-semibold text-stone-500 hover:text-stone-800 transition-colors"
                            >
                                <ArrowLeftIcon className="w-3.5 h-3.5 mr-1.5" />
                                Manvi Art
                            </button>
                        </div>
                    </div>

                    {/* Header Banner */}
                    <header className="bg-white border-b border-stone-200/80 pt-12 pb-10 px-4 text-center fade-in-up">
                        <div className="max-w-4xl mx-auto space-y-3">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">{catalogue.title}</h1>
                            {catalogue.description && (
                                <p className="text-stone-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">{catalogue.description}</p>
                            )}
                            <div className="pt-2 flex justify-center items-center">
                                <span className="px-3.5 py-1 bg-stone-100 text-stone-600 text-xs font-bold rounded-full border border-stone-200">
                                    {filteredItems.length} Products Available
                                </span>
                            </div>
                        </div>
                    </header>

                    {/* Filter and Search Bar */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 fade-in-up" style={{ animationDelay: '80ms' }}>
                        <div className="bg-white border border-stone-200/80 p-4 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:max-w-md">
                                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                                <input 
                                    type="text" 
                                    placeholder="Search products..." 
                                    className="w-full pl-10 pr-4 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800/10 focus:border-stone-800 bg-stone-50 transition-all focus:bg-white"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            
                            <div className="flex w-full md:w-auto items-center space-x-3">
                                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider whitespace-nowrap">Sort by:</span>
                                <select 
                                    className="w-full md:w-auto px-3.5 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800/10 focus:border-stone-800 bg-white transition-all cursor-pointer"
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                >
                                    <option value="default">Featured</option>
                                    <option value="price-low-to-high">Price: Low to High</option>
                                    <option value="price-high-to-low">Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {filteredItems.length === 0 ? (
                            <div className="bg-white border border-stone-200 rounded-2xl p-16 text-center mt-8">
                                <div className="w-14 h-14 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                                    <SearchIcon className="w-6 h-6" />
                                </div>
                                <p className="text-stone-800 font-bold">No products match your search</p>
                                <p className="text-xs text-stone-400 mt-1">Try checking your spelling or search for something else.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
                                {filteredItems.map((item, idx) => (
                                    <div key={item.id} className="fade-in-up" style={{ animationDelay: `${Math.min(idx, 8) * 60}ms` }}>
                                        <PublicItemCard
                                            item={item}
                                            onClick={() => setSelectedItem(item)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Modals */}
                    <PublicItemDetailModal 
                        isOpen={selectedItem !== null} 
                        item={selectedItem} 
                        catalogue={catalogue} 
                        onClose={() => setSelectedItem(null)} 
                    />
                </div>
            );
        };
