// Small shared helper functions

        const getToday = () => new Date().toISOString().split('T')[0];

        // Built-in order sources, always available. The studio owner can add
        // more from the admin dashboard (stored in Firestore, see AdminApp's
        // customSources subscription) - those are merged in on top of these.
        const DEFAULT_ORDER_SOURCES = ['Instagram', 'Etsy', 'Personal Website', 'Facebook', 'In-Person / Craft Fair', 'Other'];

        // Catalogues show up on the landing page in whatever order the studio
        // owner arranged them in the dashboard, which is stored per-document as
        // `sortOrder`. Catalogues saved before that field existed don't have one,
        // so they queue up behind the arranged ones, oldest first - until the
        // owner nudges the list, which renumbers every document.
        const sortCataloguesForDisplay = (list) => [...list].sort((a, b) => {
            const aOrder = typeof a.sortOrder === 'number' ? a.sortOrder : Number.MAX_SAFE_INTEGER;
            const bOrder = typeof b.sortOrder === 'number' ? b.sortOrder : Number.MAX_SAFE_INTEGER;
            if (aOrder !== bOrder) return aOrder - bOrder;
            return (a.createdAt || 0) - (b.createdAt || 0);
        });

        const createBlankOrderForm = () => ({
            receivedDate: getToday(),
            deliveredDate: '',
            status: 'Received',
            customerName: '',
            itemName: '',
            quantity: '1',
            price: '0',
            source: 'Instagram'
        });
