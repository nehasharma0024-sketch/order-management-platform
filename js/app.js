// Main admin application component

        // The admin dashboard. Only ever mounted when the router (js/root.js)
        // decides the current URL is /admin - it is not linked from anywhere
        // in the public-facing pages.
        const AdminApp = () => {
            const [activeTab, setActiveTab] = React.useState('orders');

            // Orders list states
            const [orders, setOrders] = React.useState([]);
            const [loadingOrders, setLoadingOrders] = React.useState(true);
            const [showOrderForm, setShowOrderForm] = React.useState(false);
            const [editingOrder, setEditingOrder] = React.useState(null);
            const [deleteConfirmId, setDeleteConfirmId] = React.useState(null);

            // Order History Sheet filters
            const [orderSearch, setOrderSearch] = React.useState('');
            const [orderSourceFilter, setOrderSourceFilter] = React.useState('All');
            const [orderStatusFilter, setOrderStatusFilter] = React.useState('All');

            // Catalogues creator states
            const [catalogues, setCatalogues] = React.useState([]);
            const [loadingCatalogues, setLoadingCatalogues] = React.useState(true);
            const [currentCatalogueId, setCurrentCatalogueId] = React.useState(null);
            const [catalogueForm, setCatalogueForm] = React.useState({
                title: '',
                description: '',
                whatsApp: '',
                items: []
            });
            const [isSavingCatalogue, setIsSavingCatalogue] = React.useState(false);
            const [deleteCatalogueConfirmId, setDeleteCatalogueConfirmId] = React.useState(null);

            // Modal Trigger for items inside catalogue editor
            const [showItemModal, setShowItemModal] = React.useState(false);
            const [editingItemIndex, setEditingItemIndex] = React.useState(null);

            // App feedback states
            const [toast, setToast] = React.useState(null);
            const [copiedId, setCopiedId] = React.useState(null);

            const showToast = (message, type = 'success') => {
                setToast({ message, type });
            };

            // Set browser page title for admin mode
            React.useEffect(() => {
                document.title = "Studio Suite - Manvi Art";
            }, []);

            // Subscribe to Orders
            React.useEffect(() => {
                const ordersRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
                
                const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
                    const fetchedOrders = [];
                    snapshot.forEach((doc) => {
                        fetchedOrders.push({ ...doc.data(), id: doc.id });
                    });
                    setOrders(fetchedOrders);
                    setLoadingOrders(false);
                }, (error) => {
                    console.error("Firestore orders subscription error:", error);
                    setLoadingOrders(false);
                });
                
                return () => unsubscribe();
            }, []);

            // Subscribe to Catalogues
            React.useEffect(() => {
                const cataloguesRef = collection(db, 'artifacts', appId, 'public', 'data', 'catalogues');

                const unsubscribe = onSnapshot(cataloguesRef, (snapshot) => {
                    const fetchedCatalogues = [];
                    snapshot.forEach((doc) => {
                        fetchedCatalogues.push({ ...doc.data(), id: doc.id });
                    });
                    setCatalogues(fetchedCatalogues);
                    setLoadingCatalogues(false);
                }, (error) => {
                    console.error("Firestore catalogues subscription error:", error);
                    setLoadingCatalogues(false);
                });

                return () => unsubscribe();
            }, []);

            // Order actions
            const saveOrder = async (newOrder) => {
                const orderId = String(newOrder.id);
                const orderRef = doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId);
                try {
                    await setDoc(orderRef, newOrder);
                    showToast("Order saved successfully!");
                } catch (error) {
                    console.error("Error saving order:", error);
                    showToast("Error saving order", "error");
                }
            };

            const handleEditOrder = (order) => {
                setEditingOrder(order);
                setShowOrderForm(true);
            };

            const executeDeleteOrder = async () => {
                if (deleteConfirmId !== null) {
                    const orderRef = doc(db, 'artifacts', appId, 'public', 'data', 'orders', String(deleteConfirmId));
                    try {
                        await deleteDoc(orderRef);
                        setDeleteConfirmId(null);
                        showToast("Order deleted successfully!");
                    } catch (error) {
                        console.error("Error deleting order:", error);
                        showToast("Error deleting order", "error");
                    }
                }
            };

            // Catalogue Actions
            const handleCreateNewCatalogue = () => {
                setCatalogueForm({
                    title: '',
                    description: '',
                    whatsApp: '',
                    items: []
                });
                setCurrentCatalogueId('new');
            };

            const handleEditCatalogue = (catalogue) => {
                setCatalogueForm({
                    title: catalogue.title || '',
                    description: catalogue.description || '',
                    whatsApp: catalogue.whatsApp || '',
                    items: catalogue.items || []
                });
                setCurrentCatalogueId(catalogue.id);
            };

            const executeDeleteCatalogue = async () => {
                if (deleteCatalogueConfirmId !== null) {
                    const catalogueRef = doc(db, 'artifacts', appId, 'public', 'data', 'catalogues', String(deleteCatalogueConfirmId));
                    try {
                        await deleteDoc(catalogueRef);
                        setDeleteCatalogueConfirmId(null);
                        showToast("Catalogue deleted successfully!");
                    } catch (error) {
                        console.error("Error deleting catalogue:", error);
                        showToast("Error deleting catalogue", "error");
                    }
                }
            };

            const handleSaveCatalogue = async () => {
                if (!catalogueForm.title.trim()) {
                    showToast("Catalogue title is required!", "error");
                    return;
                }
                
                setIsSavingCatalogue(true);
                const isNew = currentCatalogueId === 'new';
                const catalogueId = isNew ? 'cat_' + Date.now() : currentCatalogueId;
                
                const catalogueRef = doc(db, 'artifacts', appId, 'public', 'data', 'catalogues', catalogueId);
                const catalogueDoc = {
                    title: catalogueForm.title.trim(),
                    description: catalogueForm.description.trim(),
                    whatsApp: catalogueForm.whatsApp.trim(),
                    items: catalogueForm.items || [],
                    createdAt: isNew ? Date.now() : (catalogues.find(c => c.id === catalogueId)?.createdAt || Date.now())
                };

                try {
                    await setDoc(catalogueRef, catalogueDoc);
                    showToast("Catalogue saved successfully!");
                    setCurrentCatalogueId(null);
                } catch (error) {
                    console.error("Error saving catalogue:", error);
                    showToast("Error saving catalogue", "error");
                } finally {
                    setIsSavingCatalogue(false);
                }
            };

            const handleSaveItem = (itemData) => {
                if (editingItemIndex !== null) {
                    const updatedItems = [...catalogueForm.items];
                    updatedItems[editingItemIndex] = itemData;
                    setCatalogueForm({ ...catalogueForm, items: updatedItems });
                    setEditingItemIndex(null);
                } else {
                    setCatalogueForm({
                        ...catalogueForm,
                        items: [...(catalogueForm.items || []), itemData]
                    });
                }
            };

            const handleDeleteItem = (indexToDelete) => {
                setCatalogueForm({
                    ...catalogueForm,
                    items: catalogueForm.items.filter((_, idx) => idx !== indexToDelete)
                });
            };

            const handleCopyLink = (id) => {
                const url = `${window.location.origin}/catalogue/${id}`;
                navigator.clipboard.writeText(url).then(() => {
                    setCopiedId(id);
                    setTimeout(() => setCopiedId(null), 2000);
                });
            };

            const handleViewCatalogueLive = (id) => {
                window.open(`/catalogue/${id}`, '_blank');
            };

            // Order list helper calculations
            const totalOrders = orders.length;
            const totalRevenue = orders.reduce((sum, order) => sum + (order.quantity * order.price), 0);
            const totalPieces = orders.reduce((sum, order) => sum + order.quantity, 0);
            
            const sourceCounts = orders.reduce((acc, order) => {
                acc[order.source] = (acc[order.source] || 0) + 1;
                return acc;
            }, {});
            
            let topSource = "N/A";
            let maxCount = 0;
            for (const [source, count] of Object.entries(sourceCounts)) {
                if (count > maxCount) {
                    maxCount = count;
                    topSource = source;
                }
            }

            const getCustomerOrderCount = (customerName) => {
                if(!customerName) return 0;
                return orders.filter(o => o.customerName.toLowerCase().trim() === customerName.toLowerCase().trim()).length;
            };

            const getReceivedDate = (order) => order.receivedDate || order.date || '';
            const getDeliveredDate = (order) => order.deliveredDate || '';
            const getStatus = (order) => order.status || (getDeliveredDate(order) ? 'Delivered' : 'Received');

            // Order History Sheet filtering
            const orderSources = Array.from(new Set(orders.map(o => o.source).filter(Boolean))).sort();
            const orderStatuses = Array.from(new Set(orders.map(o => getStatus(o)).filter(Boolean))).sort();

            const filteredOrders = orders.filter(order => {
                if (orderSourceFilter !== 'All' && order.source !== orderSourceFilter) return false;
                if (orderStatusFilter !== 'All' && getStatus(order) !== orderStatusFilter) return false;
                if (orderSearch.trim()) {
                    const term = orderSearch.trim().toLowerCase();
                    const haystack = `${order.customerName || ''} ${order.itemName || ''}`.toLowerCase();
                    if (!haystack.includes(term)) return false;
                }
                return true;
            });

            const areOrderFiltersActive = orderSearch.trim() !== '' || orderSourceFilter !== 'All' || orderStatusFilter !== 'All';
            const clearOrderFilters = () => {
                setOrderSearch('');
                setOrderSourceFilter('All');
                setOrderStatusFilter('All');
            };

            const getDateTimestamp = (dateValue) => {
                if (!dateValue) return 0;
                const [year, month, day] = String(dateValue).split('-').map(Number);
                if (!year || !month || !day) return 0;
                return new Date(year, month - 1, day).getTime();
            };

            const formatOrderDate = (dateValue, fallback = 'Not set') => {
                const timestamp = getDateTimestamp(dateValue);
                if (!timestamp) return fallback;
                return new Date(timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
            };

            const handleExportCSV = () => {
                const headers = ["Order ID,Received Date,Delivered Date,Status,Customer Name,Item Name,Quantity,Price per Item,Total Price,Source"];
                
                const rows = orders.map(order => {
                    const escape = (text) => `"${String(text || '').replace(/"/g, '""')}"`;
                    const total = (order.quantity * order.price).toFixed(2);
                    return `${order.id},${getReceivedDate(order)},${getDeliveredDate(order)},${escape(getStatus(order))},${escape(order.customerName)},${escape(order.itemName)},${order.quantity},${order.price},${total},${escape(order.source)}`;
                });
                
                const csvContent = headers.concat(rows).join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Art_Studio_Orders_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };

            return (
                <div className="min-h-screen pb-16">
                    {/* Administrator Workspace Header */}
                    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-sm">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-800 border border-stone-200 shadow-sm">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold text-stone-800 leading-tight">Studio Suite</h1>
                                        <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Artist Workspace</p>
                                    </div>
                                </div>
                                
                                {/* Desktop Nav Tabs */}
                                <div className="hidden sm:flex bg-stone-100 p-1 rounded-xl space-x-1">
                                    <button onClick={() => { setActiveTab('orders'); setCurrentCatalogueId(null); }} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'orders' ? 'bg-white text-stone-800 shadow-sm border border-stone-200/50' : 'text-stone-500 hover:text-stone-750'}`}>
                                        Orders Tracker
                                    </button>
                                    <button onClick={() => { setActiveTab('catalogues'); setCurrentCatalogueId(null); }} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'catalogues' ? 'bg-white text-stone-800 shadow-sm border border-stone-200/50' : 'text-stone-500 hover:text-stone-750'}`}>
                                        Catalogue Creator
                                    </button>
                                </div>
                            </div>
                            
                            {/* Action Buttons based on context */}
                            <div className="flex items-center space-x-3">
                                {activeTab === 'orders' && (
                                    <>
                                        <button onClick={handleExportCSV} className="flex items-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-stone-600 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors">
                                            <DownloadIcon className="w-4 h-4 sm:mr-2" />
                                            <span className="hidden sm:inline">Export CSV</span>
                                        </button>
                                        <button onClick={() => { setEditingOrder(null); setShowOrderForm(true); }} className="flex items-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-stone-800 hover:bg-stone-900 rounded-xl shadow-md shadow-stone-800/20 transition-all hover:scale-105 active:scale-95">
                                            <PlusIcon className="w-4 h-4 mr-1.5" />
                                            New Order
                                        </button>
                                    </>
                                )}
                                {activeTab === 'catalogues' && !currentCatalogueId && (
                                    <button onClick={handleCreateNewCatalogue} className="flex items-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-stone-800 hover:bg-stone-900 rounded-xl shadow-md shadow-stone-800/20 transition-all hover:scale-105 active:scale-95">
                                        <PlusIcon className="w-4 h-4 mr-1.5" />
                                        New Catalogue
                                    </button>
                                )}
                                {activeTab === 'catalogues' && currentCatalogueId && (
                                    <button 
                                        onClick={handleSaveCatalogue} 
                                        disabled={isSavingCatalogue}
                                        className="flex items-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-stone-800 hover:bg-stone-900 rounded-xl shadow-md shadow-stone-800/20 disabled:opacity-50 flex items-center space-x-1"
                                    >
                                        {isSavingCatalogue && <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full mr-1.5" />}
                                        <span>Save Catalogue</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Mobile Navigation Tabs */}
                    <div className="sm:hidden bg-stone-50 border-b border-stone-200 p-2 flex justify-center space-x-1">
                        <button onClick={() => { setActiveTab('orders'); setCurrentCatalogueId(null); }} className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'orders' ? 'bg-white text-stone-800 shadow-sm border border-stone-200' : 'text-stone-500'}`}>
                            Orders Tracker
                        </button>
                        <button onClick={() => { setActiveTab('catalogues'); setCurrentCatalogueId(null); }} className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'catalogues' ? 'bg-white text-stone-800 shadow-sm border border-stone-200' : 'text-stone-500'}`}>
                            Catalogue Creator
                        </button>
                    </div>

                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                        {activeTab === 'orders' && (
                            <>
                                {/* Statistics Dashboard */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                                    <StatCard title="Total Revenue" value={`Rs.${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} icon={<ReceiptIcon />} />
                                    <StatCard title="Total Orders" value={totalOrders} icon={<ShoppingCartIcon />} />
                                    <StatCard title="Pieces Sold" value={totalPieces} icon={<PackageIcon />} />
                                    <StatCard title="Top Source" value={topSource} icon={<TrendingUpIcon />} />
                                </div>

                                {/* Order History Sheet */}
                                <div className="bg-white border border-stone-200 rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden">
                                    <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-white">
                                        <h2 className="text-lg font-bold text-stone-800">Order History Sheet</h2>
                                        <span className="px-3 py-1 bg-stone-100 text-stone-600 text-xs font-semibold rounded-full border border-stone-200">
                                            {filteredOrders.length} of {orders.length} Records
                                        </span>
                                    </div>

                                    {/* Filters */}
                                    <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center gap-3">
                                        <div className="relative flex-1 min-w-[180px]">
                                            <SearchIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                value={orderSearch}
                                                onChange={e => setOrderSearch(e.target.value)}
                                                placeholder="Search customer or item..."
                                                className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800/20 focus:border-stone-800 transition-all bg-white"
                                            />
                                        </div>
                                        <select
                                            value={orderSourceFilter}
                                            onChange={e => setOrderSourceFilter(e.target.value)}
                                            className="px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800/20 focus:border-stone-800 transition-all bg-white">
                                            <option value="All">All Sources</option>
                                            {orderSources.map(source => <option key={source} value={source}>{source}</option>)}
                                        </select>
                                        <select
                                            value={orderStatusFilter}
                                            onChange={e => setOrderStatusFilter(e.target.value)}
                                            className="px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800/20 focus:border-stone-800 transition-all bg-white">
                                            <option value="All">All Statuses</option>
                                            {orderStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                                        </select>
                                        {areOrderFiltersActive && (
                                            <button
                                                onClick={clearOrderFilters}
                                                className="flex items-center px-3 py-2 text-sm font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors">
                                                <CloseIcon className="w-3.5 h-3.5 mr-1.5" />
                                                Clear filters
                                            </button>
                                        )}
                                    </div>

                                    <div className="overflow-x-auto table-container">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-stone-50 text-stone-505 text-[11px] uppercase tracking-wider font-bold border-b border-stone-100">
                                                    <th className="px-6 py-4">Received</th>
                                                    <th className="px-6 py-4">Delivered</th>
                                                    <th className="px-6 py-4">Customer</th>
                                                    <th className="px-6 py-4">Item Details</th>
                                                    <th className="px-6 py-4 text-right">Pieces</th>
                                                    <th className="px-6 py-4 text-right">Price/Item</th>
                                                    <th className="px-6 py-4 text-right">Total</th>
                                                    <th className="px-6 py-4">Source</th>
                                                    <th className="px-6 py-4 text-center">Manage</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-stone-100/80 bg-white">
                                            {loadingOrders ? (
                                                <tr>
                                                    <td colSpan="9" className="px-6 py-16 text-center text-stone-500 bg-stone-50/30">
                                                        <div className="flex flex-col items-center justify-center animate-pulse">
                                                            <p className="text-base font-medium text-stone-800">Loading your orders...</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : filteredOrders.length === 0 ? (
                                                <tr>
                                                    <td colSpan="9" className="px-6 py-16 text-center text-stone-500 bg-stone-50/30">
                                                        <div className="flex flex-col items-center justify-center">
                                                                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 text-stone-400">
                                                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                    </svg>
                                                                </div>
                                                                {orders.length === 0 ? (
                                                                    <>
                                                                        <p className="text-base font-medium text-stone-800">Your canvas is blank</p>
                                                                        <p className="text-sm mt-1 mb-4">Click "New Order" to record your first sale.</p>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <p className="text-base font-medium text-stone-800">No orders match your filters</p>
                                                                        <button onClick={clearOrderFilters} className="text-sm mt-1 mb-4 text-stone-600 font-semibold hover:text-stone-900 underline">Clear filters</button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredOrders.sort((a,b) => getDateTimestamp(getReceivedDate(b)) - getDateTimestamp(getReceivedDate(a))).map(order => {
                                                        const customerOrders = getCustomerOrderCount(order.customerName);
                                                        return (
                                                            <tr key={order.id} className="hover:bg-stone-50/70 transition-colors group">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-505 font-medium">
                                                                    {formatOrderDate(getReceivedDate(order))}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-505 font-medium">
                                                                    {formatOrderDate(getDeliveredDate(order), 'Pending')}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm font-semibold text-stone-800">{order.customerName}</div>
                                                                    {customerOrders > 1 && (
                                                                        <div className="text-[10px] text-stone-500 font-medium uppercase tracking-wider mt-0.5 flex items-center">
                                                                            <svg className="w-3 h-3 mr-1 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                            </svg>
                                                                            {customerOrders} Orders total
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-stone-600 max-w-xs truncate font-medium">
                                                                    {order.itemName}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600 text-right font-medium">
                                                                    <span className="px-2 py-1 bg-stone-100 rounded-md">{order.quantity}</span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500 text-right">
                                                                    Rs.{order.price.toFixed(2)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600 text-right">
                                                                    Rs.{(order.quantity * order.price).toFixed(2)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                                                                        {order.source}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                                    <div className="flex items-center justify-center space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all">
                                                                        <button
                                                                            onClick={() => handleEditOrder(order)}
                                                                            className="text-stone-300 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100"
                                                                            title="Edit Order">
                                                                            <EditIcon className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setDeleteConfirmId(order.id)}
                                                                            className="text-stone-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50"
                                                                            title="Delete Order">
                                                                            <TrashIcon />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'catalogues' && !currentCatalogueId && (
                            <div>
                                <div className="px-1 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-stone-800">Catalogue Creator</h2>
                                        <p className="text-sm text-stone-400 mt-0.5">Build public shareable catalogs to showcase and sell your artwork.</p>
                                    </div>
                                </div>

                                {/* Catalogues List */}
                                {loadingCatalogues ? (
                                    <div className="bg-white border border-stone-200 rounded-2xl p-16 text-center animate-pulse">
                                        <p className="text-stone-800 font-semibold">Loading catalogues...</p>
                                    </div>
                                ) : catalogues.length === 0 ? (
                                    <div className="bg-white border border-stone-200 rounded-2xl p-16 text-center">
                                        <div className="w-16 h-16 bg-stone-55 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                                            <PhotoIcon className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-lg font-bold text-stone-800">No catalogues yet</h3>
                                        <p className="text-sm text-stone-400 mt-1 max-w-sm mx-auto mb-6">Create a catalogue, add product items with images, and share it with a single URL.</p>
                                        <button onClick={handleCreateNewCatalogue} className="px-5 py-2.5 bg-stone-800 text-white font-medium hover:bg-stone-900 rounded-xl transition-all shadow-md inline-flex items-center text-sm">
                                            <PlusIcon className="w-4 h-4 mr-2" />
                                            Create First Catalogue
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {catalogues.map(cat => (
                                            <div key={cat.id} className="bg-white rounded-2xl border border-stone-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col justify-between hover:border-stone-300 transition-all duration-300">
                                                <div className="p-6">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-lg font-extrabold text-stone-900 line-clamp-1">{cat.title}</h3>
                                                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold whitespace-nowrap">
                                                            {cat.items ? cat.items.length : 0} items
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-stone-400 line-clamp-2 leading-relaxed h-10 mb-4">{cat.description || 'No description provided.'}</p>
                                                    <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider pt-2 border-t border-stone-50 flex items-center">
                                                        <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        Created: {new Date(cat.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>

                                                <div className="bg-stone-50 px-6 py-4 border-t border-stone-100 flex items-center justify-between gap-2">
                                                    <div className="flex items-center space-x-1">
                                                        <button 
                                                            onClick={() => handleCopyLink(cat.id)} 
                                                            className={`p-2 rounded-lg hover:bg-stone-250 transition-all text-xs font-bold flex items-center space-x-1 ${copiedId === cat.id ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-stone-600'}`}
                                                            title="Copy Shareable Link"
                                                        >
                                                            {copiedId === cat.id ? <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" /> : <ShareIcon className="w-4 h-4" />}
                                                            <span>{copiedId === cat.id ? 'Copied!' : 'Link'}</span>
                                                        </button>
                                                        
                                                        <button 
                                                            onClick={() => handleViewCatalogueLive(cat.id)} 
                                                            className="p-2 text-stone-600 hover:bg-stone-250 rounded-lg transition-all text-xs font-bold flex items-center space-x-1"
                                                            title="Open Live Catalogue"
                                                        >
                                                            <EyeIcon className="w-4 h-4" />
                                                            <span>View</span>
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center space-x-1">
                                                        <button 
                                                            onClick={() => handleEditCatalogue(cat)} 
                                                            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200/40 rounded-lg transition-all"
                                                            title="Edit Catalogue"
                                                        >
                                                            <EditIcon className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => setDeleteCatalogueConfirmId(cat.id)} 
                                                            className="p-1.5 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                            title="Delete Catalogue"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Catalogue Editor Sub-View */}
                        {activeTab === 'catalogues' && currentCatalogueId && (
                            <div className="bg-white border border-stone-200 rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-6 sm:p-8">
                                <div className="flex items-center justify-between border-b border-stone-100 pb-6 mb-6">
                                    <div className="flex items-center space-x-3">
                                        <button onClick={() => setCurrentCatalogueId(null)} className="p-2 text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200/60 rounded-xl transition-all">
                                            <ArrowLeftIcon className="w-4 h-4" />
                                        </button>
                                        <div>
                                            <h2 className="text-xl font-bold text-stone-900">{currentCatalogueId === 'new' ? 'Create New Catalogue' : 'Edit Catalogue'}</h2>
                                            <p className="text-xs text-stone-400 mt-0.5">Fill out your catalogue metadata and organize your product items.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button onClick={() => setCurrentCatalogueId(null)} className="px-4 py-2 text-stone-600 hover:bg-stone-55 border border-stone-200 rounded-xl transition-colors text-sm font-semibold">Cancel</button>
                                        <button 
                                            onClick={handleSaveCatalogue} 
                                            disabled={isSavingCatalogue}
                                            className="px-5 py-2 bg-stone-800 text-white hover:bg-stone-900 border border-stone-800 rounded-xl transition-all shadow-md text-sm font-semibold flex items-center space-x-1"
                                        >
                                            {isSavingCatalogue && <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full mr-1.5" />}
                                            <span>Save Changes</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Left Column: Metadata Forms */}
                                    <div className="lg:col-span-1 space-y-5">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400">Catalogue Info</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">Catalogue Title *</label>
                                            <input required type="text"
                                                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800/10 focus:border-stone-800 bg-stone-50 focus:bg-white transition-all text-sm"
                                                value={catalogueForm.title}
                                                onChange={e => setCatalogueForm({ ...catalogueForm, title: e.target.value })}
                                                placeholder="e.g. Summer Art Prints Collection" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">Description / Subtitle</label>
                                            <textarea rows="4"
                                                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800/10 focus:border-stone-800 bg-stone-50 focus:bg-white transition-all text-sm"
                                                value={catalogueForm.description}
                                                onChange={e => setCatalogueForm({ ...catalogueForm, description: e.target.value })}
                                                placeholder="e.g. A limited run of archival giclée prints. Orders are packed carefully and shipped flat." />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">WhatsApp Number for Inquiries</label>
                                            <input type="tel"
                                                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800/10 focus:border-stone-800 bg-stone-50 focus:bg-white transition-all text-sm"
                                                value={catalogueForm.whatsApp}
                                                onChange={e => setCatalogueForm({ ...catalogueForm, whatsApp: e.target.value })}
                                                placeholder="e.g. +919876543210 (include country code)" />
                                            <p className="text-[10px] text-stone-400 mt-1 font-medium leading-relaxed">Customers will see a button to inquire directly about items on WhatsApp, sending a drafted text link with details.</p>
                                        </div>
                                    </div>

                                    {/* Right Column: Items Manager */}
                                    <div className="lg:col-span-2 space-y-5">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 flex items-center">
                                                <span>Catalogue Items</span>
                                                <span className="ml-2 px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md text-xs">{catalogueForm.items ? catalogueForm.items.length : 0} Items</span>
                                            </h3>
                                            <button 
                                                onClick={() => { setEditingItemIndex(null); setShowItemModal(true); }}
                                                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl shadow-sm text-xs font-bold transition-all flex items-center"
                                            >
                                                <PlusIcon className="w-3.5 h-3.5 mr-1" />
                                                Add Item
                                            </button>
                                        </div>

                                        {/* Catalogue Items List */}
                                        {(!catalogueForm.items || catalogueForm.items.length === 0) ? (
                                            <div className="border border-stone-200 border-dashed rounded-2xl p-12 text-center">
                                                <PhotoIcon className="mx-auto w-10 h-10 text-stone-300 stroke-[1.5]" />
                                                <p className="text-sm text-stone-600 font-bold mt-3">No items added to this catalogue</p>
                                                <p className="text-xs text-stone-400 mt-0.5">Click "Add Item" above to fill out product card titles, prices, and upload images.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {catalogueForm.items.map((item, idx) => (
                                                    <div key={item.id || idx} className="border border-stone-200 rounded-2xl p-4 flex gap-3.5 bg-stone-50/50 hover:bg-white hover:shadow-md transition-all group">
                                                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0 flex items-center justify-center">
                                                            {item.images && item.images.length > 0 ? (
                                                                <img src={item.images[0]} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <PhotoIcon className="w-7 h-7 text-stone-300 stroke-[1.5]" />
                                                            )}
                                                        </div>
                                                        <div className="flex-grow flex flex-col justify-between">
                                                            <div>
                                                                <h4 className="text-sm font-bold text-stone-900 line-clamp-1">{item.title}</h4>
                                                                <div className="text-xs font-bold text-emerald-600 mt-0.5">Rs.{parseFloat(item.price || 0).toLocaleString()}</div>
                                                                {item.images && item.images.length > 1 && (
                                                                    <div className="text-[10px] text-stone-400 mt-0.5 font-bold uppercase tracking-wider">{item.images.length} images uploaded</div>
                                                                )}
                                                            </div>
                                                            <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button 
                                                                    onClick={() => { setEditingItemIndex(idx); setShowItemModal(true); }}
                                                                    className="p-1 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded"
                                                                    title="Edit Item"
                                                                >
                                                                    <EditIcon className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteItem(idx)}
                                                                    className="p-1 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded"
                                                                    title="Remove Item"
                                                                >
                                                                    <TrashIcon className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>

                    {/* Toast Notification */}
                    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

                    {/* Modals */}
                    <OrderFormModal
                        isOpen={showOrderForm}
                        onClose={() => { setShowOrderForm(false); setEditingOrder(null); }}
                        onSave={saveOrder}
                        editingOrder={editingOrder}
                    />

                    <ConfirmDeleteModal
                        isOpen={deleteConfirmId !== null}
                        onClose={() => setDeleteConfirmId(null)}
                        onConfirm={executeDeleteOrder}
                    />

                    <ConfirmDeleteModal
                        isOpen={deleteCatalogueConfirmId !== null}
                        onClose={() => setDeleteCatalogueConfirmId(null)}
                        onConfirm={executeDeleteCatalogue}
                        title="Delete Catalogue"
                        desc="Are you sure you want to delete this catalogue? The public link will stop working instantly."
                    />

                    <CatalogueItemModal 
                        isOpen={showItemModal}
                        onClose={() => { setShowItemModal(false); setEditingItemIndex(null); }}
                        onSave={handleSaveItem}
                        editingItem={editingItemIndex !== null ? catalogueForm.items[editingItemIndex] : null}
                    />
                </div>
            )
        }
