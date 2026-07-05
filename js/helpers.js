// Small shared helper functions

        const getToday = () => new Date().toISOString().split('T')[0];

        // Built-in order sources, always available. The studio owner can add
        // more from the admin dashboard (stored in Firestore, see AdminApp's
        // customSources subscription) - those are merged in on top of these.
        const DEFAULT_ORDER_SOURCES = ['Instagram', 'Etsy', 'Personal Website', 'Facebook', 'In-Person / Craft Fair', 'Other'];

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
