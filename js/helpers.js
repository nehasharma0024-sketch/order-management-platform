// Small shared helper functions

        const getToday = () => new Date().toISOString().split('T')[0];

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
