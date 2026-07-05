// Modal components used in the admin (orders + catalogue editor) views

        const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title = "Delete Order", desc = "Are you sure you want to delete this? This action cannot be undone." }) => {
            if (!isOpen) return null;
            return (
                <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center modal-animate">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-50 mb-4">
                            <TrashIcon className="h-6 w-6 text-rose-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-stone-900 mb-2">{title}</h3>
                        <p className="text-sm text-stone-500 mb-6">{desc}</p>
                        <div className="flex justify-center space-x-3">
                            <button onClick={onClose} className="px-4 py-2 bg-white text-stone-700 font-medium border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors">Cancel</button>
                            <button onClick={onConfirm} className="px-4 py-2 bg-rose-500 text-white font-medium rounded-xl hover:bg-rose-600 transition-colors shadow-sm">Delete</button>
                        </div>
                    </div>
                </div>
            );
        };

        const OrderFormModal = ({ isOpen, onClose, onSave, editingOrder = null, sourceOptions = DEFAULT_ORDER_SOURCES }) => {
            const [formData, setFormData] = React.useState(createBlankOrderForm);

            React.useEffect(() => {
                if (isOpen) {
                    setFormData(editingOrder ? {
                        receivedDate: editingOrder.receivedDate || editingOrder.date || getToday(),
                        deliveredDate: editingOrder.deliveredDate || '',
                        status: editingOrder.status || 'Received',
                        customerName: editingOrder.customerName || '',
                        itemName: editingOrder.itemName || '',
                        quantity: String(editingOrder.quantity ?? 1),
                        price: String(editingOrder.price ?? 0),
                        source: editingOrder.source || 'Instagram'
                    } : createBlankOrderForm());
                }
            }, [isOpen, editingOrder]);

            if (!isOpen) return null;

            const handleSubmit = (e) => {
                e.preventDefault();
                const receivedDate = formData.receivedDate || getToday();
                onSave({
                    ...formData,
                    id: editingOrder ? editingOrder.id : Date.now(),
                    date: receivedDate,
                    receivedDate,
                    deliveredDate: formData.deliveredDate || '',
                    status: formData.status || 'Received',
                    quantity: parseInt(formData.quantity, 10) || 1,
                    price: parseFloat(formData.price) || 0
                });
                onClose();
                setFormData(createBlankOrderForm());
            };

            return (
                <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden modal-animate border border-stone-100">
                        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                            <h2 className="text-lg font-bold text-stone-800">{editingOrder ? 'Edit Order' : 'Record New Order'}</h2>
                            <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors p-1 bg-white rounded-full border border-stone-100">
                                <CloseIcon className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Customer Name</label>
                                    <input required type="text" 
                                        className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800/20 focus:border-stone-800 transition-all bg-stone-50 focus:bg-white" 
                                        value={formData.customerName} 
                                        onChange={e => setFormData({...formData, customerName: e.target.value})} 
                                        placeholder="e.g. Jane Doe" />
                                </div>
                                
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Item Description</label>
                                    <input required type="text" 
                                        className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800/20 focus:border-stone-800 transition-all bg-stone-50 focus:bg-white" 
                                        value={formData.itemName} 
                                        onChange={e => setFormData({...formData, itemName: e.target.value})} 
                                        placeholder="e.g. 8x10 Watercolor Landscape" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Total Pieces</label>
                                    <input required type="number" min="1" 
                                        className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800/20 focus:border-stone-800 transition-all bg-stone-50 focus:bg-white" 
                                        value={formData.quantity} 
                                        onChange={e => setFormData({...formData, quantity: e.target.value})} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Price per Item (Rs)</label>
                                    <input required type="number" min="0" step="0.01" 
                                        className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800/20 focus:border-stone-800 transition-all bg-stone-50 focus:bg-white" 
                                        value={formData.price} 
                                        onChange={e => setFormData({...formData, price: e.target.value})} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Order Source</label>
                                    <select
                                        className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800/20 focus:border-stone-800 transition-all bg-stone-50 focus:bg-white"
                                        value={formData.source}
                                        onChange={e => setFormData({...formData, source: e.target.value})}>
                                        {(formData.source && !sourceOptions.includes(formData.source) ? [formData.source, ...sourceOptions] : sourceOptions).map(source => (
                                            <option key={source} value={source}>{source}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Order Status</label>
                                    <select
                                        className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800/20 focus:border-stone-800 transition-all bg-stone-50 focus:bg-white"
                                        value={formData.status}
                                        onChange={e => setFormData({...formData, status: e.target.value})}>
                                        <option>Received</option>
                                        <option>In Progress</option>
                                        <option>Ready</option>
                                        <option>Delivered</option>
                                        <option>Cancelled</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Order Received Date</label>
                                    <input required type="date" 
                                        className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800/20 focus:border-stone-800 transition-all bg-stone-50 focus:bg-white" 
                                        value={formData.receivedDate} 
                                        onChange={e => setFormData({...formData, receivedDate: e.target.value})} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Order Delivered Date</label>
                                    <input type="date" 
                                        className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800/20 focus:border-stone-800 transition-all bg-stone-50 focus:bg-white" 
                                        value={formData.deliveredDate} 
                                        onChange={e => setFormData({...formData, deliveredDate: e.target.value})} />
                                </div>
                            </div>
                            
                            <div className="pt-4 flex justify-end space-x-3 border-t border-stone-100 mt-6">
                                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm text-stone-600 font-medium hover:bg-stone-100 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 text-sm bg-stone-800 text-white font-medium hover:bg-stone-900 rounded-xl transition-colors shadow-md shadow-stone-800/20 flex items-center">
                                    {editingOrder ? <EditIcon className="w-4 h-4 mr-1.5" /> : <PlusIcon className="w-4 h-4 mr-1.5" />}
                                    {editingOrder ? 'Update Order' : 'Save Order'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )
        };

        // Lets the studio owner add their own order sources (beyond the
        // built-in DEFAULT_ORDER_SOURCES) so the Order Source dropdown can
        // reflect however they actually sell - a specific market, a friend's
        // referral, etc.
        const ManageSourcesModal = ({ isOpen, onClose, customSources, onAdd, onRemove }) => {
            const [newSource, setNewSource] = React.useState('');

            if (!isOpen) return null;

            const handleAdd = (e) => {
                e.preventDefault();
                const trimmed = newSource.trim();
                if (!trimmed) return;
                onAdd(trimmed);
                setNewSource('');
            };

            return (
                <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden modal-animate border border-stone-100">
                        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                            <h2 className="text-lg font-bold text-stone-800">Manage Order Sources</h2>
                            <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors p-1 bg-white rounded-full border border-stone-100">
                                <CloseIcon className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <form onSubmit={handleAdd} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSource}
                                    onChange={e => setNewSource(e.target.value)}
                                    placeholder="e.g. Local Market"
                                    className="flex-1 px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800/20 focus:border-stone-800 transition-all bg-stone-50 focus:bg-white text-sm"
                                />
                                <button type="submit" className="px-4 py-2 bg-stone-800 text-white font-medium hover:bg-stone-900 rounded-xl transition-colors shadow-sm flex items-center text-sm">
                                    <PlusIcon className="w-4 h-4 mr-1" />
                                    Add
                                </button>
                            </form>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Built-in</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {DEFAULT_ORDER_SOURCES.map(source => (
                                        <span key={source} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-stone-500 border border-stone-200">
                                            {source}
                                        </span>
                                    ))}
                                </div>

                                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Your sources</p>
                                {customSources.length === 0 ? (
                                    <p className="text-sm text-stone-400">No custom sources added yet.</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {customSources.map(source => (
                                            <span key={source} className="pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center">
                                                {source}
                                                <button
                                                    onClick={() => onRemove(source)}
                                                    className="ml-1.5 text-emerald-500 hover:text-rose-500 transition-colors"
                                                    title="Remove source">
                                                    <CloseIcon className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-stone-100 flex justify-end bg-stone-50/50">
                            <button onClick={onClose} className="px-5 py-2.5 text-sm bg-stone-800 text-white font-medium hover:bg-stone-900 rounded-xl transition-colors shadow-md shadow-stone-800/20">
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

        // Item Form Modal inside Catalogue Editor
        const CatalogueItemModal = ({ isOpen, onClose, onSave, editingItem = null }) => {
            const [itemForm, setItemForm] = React.useState({
                title: '',
                price: '',
                description: '',
                images: []
            });
            const [uploadingImages, setUploadingImages] = React.useState(false);

            React.useEffect(() => {
                if (isOpen) {
                    if (editingItem) {
                        setItemForm({ ...editingItem });
                    } else {
                        setItemForm({
                            title: '',
                            price: '',
                            description: '',
                            images: []
                        });
                    }
                }
            }, [isOpen, editingItem]);

            if (!isOpen) return null;

            const handleImageUpload = async (e) => {
                const files = Array.from(e.target.files);
                if (!files.length) return;
                setUploadingImages(true);
                const newUploadedUrls = [];

                for (const file of files) {
                    try {
                        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                        const storageRef = ref(storage, `artifacts/${appId}/public/images/${fileName}`);
                        const snapshot = await uploadBytes(storageRef, file);
                        const downloadUrl = await getDownloadURL(snapshot.ref);
                        newUploadedUrls.push(downloadUrl);
                    } catch (error) {
                        console.error("Storage upload failed, fallback to base64:", error);
                        try {
                            const base64Data = await new Promise((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onload = () => resolve(reader.result);
                                reader.onerror = reject;
                                reader.readAsDataURL(file);
                            });
                            newUploadedUrls.push(base64Data);
                        } catch (err) {
                            console.error("Base64 conversion failed:", err);
                        }
                    }
                }

                setItemForm(prev => ({
                    ...prev,
                    images: [...(prev.images || []), ...newUploadedUrls]
                }));
                setUploadingImages(false);
            };

            const removeImage = (indexToRemove) => {
                setItemForm(prev => ({
                    ...prev,
                    images: prev.images.filter((_, idx) => idx !== indexToRemove)
                }));
            };

            const moveImage = (index, direction) => {
                const newImages = [...itemForm.images];
                const newIndex = index + direction;
                if (newIndex >= 0 && newIndex < newImages.length) {
                    const temp = newImages[index];
                    newImages[index] = newImages[newIndex];
                    newImages[newIndex] = temp;
                    setItemForm({ ...itemForm, images: newImages });
                }
            };

            const handleSubmit = (e) => {
                e.preventDefault();
                onSave({
                    ...itemForm,
                    id: itemForm.id || 'item_' + Date.now(),
                    price: parseFloat(itemForm.price) || 0
                });
                onClose();
            };

            return (
                <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden modal-animate border border-stone-100">
                        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                            <h2 className="text-lg font-bold text-stone-800">{editingItem ? 'Edit Item' : 'Add Catalogue Item'}</h2>
                            <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1 bg-white rounded-full border border-stone-100">
                                <CloseIcon className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Item Title *</label>
                                <input required type="text"
                                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800/20 focus:border-stone-800 bg-stone-50 focus:bg-white transition-all"
                                    value={itemForm.title}
                                    onChange={e => setItemForm({ ...itemForm, title: e.target.value })}
                                    placeholder="e.g. Handmade Ceramic Bowl" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Price (Rs) *</label>
                                <input required type="number" min="0" step="0.01"
                                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800/20 focus:border-stone-800 bg-stone-50 focus:bg-white transition-all"
                                    value={itemForm.price}
                                    onChange={e => setItemForm({ ...itemForm, price: e.target.value })}
                                    placeholder="e.g. 1500" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                                <textarea rows="3"
                                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800/20 focus:border-stone-800 bg-stone-50 focus:bg-white transition-all"
                                    value={itemForm.description}
                                    onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
                                    placeholder="Provide detailed description for customers..." />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Product Images</label>
                                <div className="border-2 border-dashed border-stone-200 rounded-xl p-6 hover:bg-stone-50 transition-colors text-center cursor-pointer relative">
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*" 
                                        onChange={handleImageUpload} 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                        disabled={uploadingImages}
                                    />
                                    <div className="space-y-1">
                                        <UploadIcon className="mx-auto h-8 w-8 text-stone-400" />
                                        <p className="text-sm text-stone-600 font-medium">Click or drag files here to upload</p>
                                        <p className="text-xs text-stone-400">Upload multiple images (Original quality)</p>
                                    </div>
                                </div>
                                {uploadingImages && (
                                    <div className="mt-2 flex items-center justify-center space-x-2 text-xs text-stone-600 animate-pulse">
                                        <span className="inline-block w-2.5 h-2.5 bg-stone-500 rounded-full animate-bounce" />
                                        <span>Uploading images to Storage...</span>
                                    </div>
                                )}
                                
                                {itemForm.images && itemForm.images.length > 0 && (
                                    <div className="mt-4 grid grid-cols-4 gap-2">
                                        {itemForm.images.map((imgUrl, idx) => (
                                            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-stone-50 border border-stone-200">
                                                <img src={imgUrl} className="w-full h-full object-cover" />
                                                
                                                {/* Hover control controls */}
                                                <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1">
                                                    {idx > 0 && (
                                                        <button type="button" onClick={() => moveImage(idx, -1)} className="p-0.5 bg-white text-stone-800 rounded hover:bg-stone-100 text-xs font-bold" title="Move Left">&larr;</button>
                                                    )}
                                                    <button type="button" onClick={() => removeImage(idx)} className="p-1 bg-rose-500 hover:bg-rose-600 text-white rounded" title="Remove">
                                                        <TrashIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                    {idx < itemForm.images.length - 1 && (
                                                        <button type="button" onClick={() => moveImage(idx, 1)} className="p-0.5 bg-white text-stone-800 rounded hover:bg-stone-100 text-xs font-bold" title="Move Right">&rarr;</button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex justify-end space-x-3 border-t border-stone-100 mt-6">
                                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm text-stone-600 hover:bg-stone-100 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 text-sm bg-stone-800 text-white font-medium hover:bg-stone-900 rounded-xl transition-colors shadow-md">
                                    {editingItem ? 'Update Item' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        };

