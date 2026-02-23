const express = require('express');
const router = express.Router();

module.exports = (supabase) => {
    // Vendor Dashboard Stats
    router.get('/:vid/stats', async (req, res) => {
        try {
            const vid = parseInt(req.params.vid);

            // Get total revenue and sales count
            const { data: revenueData, error: revenueError } = await supabase
                .from('saleitem')
                .select('sid, quantity, product!inner(price, vid), sale!inner(id)')
                .eq('product.vid', vid);

            if (revenueError) throw revenueError;

            let totalRevenue = 0;
            const saleIds = new Set();
            revenueData?.forEach(item => {
                totalRevenue += (item.quantity * (item.product?.price || 0)) || 0;
                if (item.sale?.id) saleIds.add(item.sale.id);
            });

            // Get active products count
            const { count: activeProducts, error: productError } = await supabase
                .from('product')
                .select('id', { count: 'exact', head: true })
                .eq('vid', vid);

            if (productError) throw productError;

            const stats = {
                totalRevenue: parseFloat(totalRevenue) || 0,
                totalSales: saleIds.size || 0,
                activeProducts: activeProducts || 0,
                averageRating: 4.5,
                viewsThisMonth: 0,
                conversionRate: 0
            };

            res.json(stats);
        } catch (err) {
            console.error('Error fetching stats:', err.message);
            res.status(500).send('Error fetching stats');
        }
    });

    // Recent Sales for Vendor
    router.get('/:vid/recent-sales', async (req, res) => {
        try {
            const vid = parseInt(req.params.vid);

            const { data, error } = await supabase
                .from('saleitem')
                .select('sid, quantity, product(name, vid, price), sale(id, date, discount)')
                .eq('product.vid', vid)
                .order('sale(date)', { ascending: false })
                .limit(10);

            if (error) throw error;

            const results = data?.map(item => ({
                id: item.sale?.id,
                product: item.product?.name,
                date: item.sale?.date,
                amount: (item.quantity * (item.product?.price || 0) * (1 - (item.sale?.discount || 0) / 100)) || 0,
                buyer: 'Customer'
            })) || [];

            res.json(results);
        } catch (err) {
            console.error('Error fetching recent sales:', err.message);
            res.status(500).send('Error fetching recent sales');
        }
    });

    // Top Products by Revenue
    router.get('/:vid/top-products', async (req, res) => {
        try {
            const vid = parseInt(req.params.vid);

            // Get all sale items for this vendor
            const { data, error } = await supabase
                .from('saleitem')
                .select('quantity, product!inner(name, price, vid)')
                .eq('product.vid', vid);

            if (error) throw error;

            // Aggregate by product
            const productMap = {};
            data?.forEach(item => {
                if (item.product?.name) {
                    const productName = item.product.name;
                    if (!productMap[productName]) {
                        productMap[productName] = { name: productName, sales: 0, revenue: 0 };
                    }
                    productMap[productName].sales += 1;
                    productMap[productName].revenue += (item.quantity * (item.product?.price || 0)) || 0;
                }
            });

            const results = Object.values(productMap)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5);

            res.json(results);
        } catch (err) {
            console.error('Error fetching top products:', err.message);
            res.status(500).send('Error fetching top products');
        }
    });

    // Monthly Sales Trend
    router.get('/:vid/monthly-sales', async (req, res) => {
        try {
            const vid = parseInt(req.params.vid);
            const fiveMonthsAgo = new Date();
            fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);

            // Get sales for last 5 months
            const { data, error } = await supabase
                .from('saleitem')
                .select('quantity, product!inner(price, vid), sale!inner(date)')
                .eq('product.vid', vid)
                .gte('sale.date', fiveMonthsAgo.toISOString());

            if (error) throw error;

            // Aggregate by month
            const monthMap = {};
            data?.forEach(item => {
                const date = new Date(item.sale?.date);
                const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
                const yearMonth = date.toISOString().slice(0, 7);
                
                const key = `${yearMonth}|${monthKey}`;
                if (!monthMap[key]) {
                    monthMap[key] = { month: monthKey, sales: 0 };
                }
                monthMap[key].sales += (item.quantity * item.product?.price) || 0;
            });

            const results = Object.values(monthMap)
                .sort((a, b) => a.month.localeCompare(b.month));

            res.json(results);
        } catch (err) {
            console.error('Error fetching monthly sales:', err.message);
            res.status(500).send('Error fetching monthly sales');
        }
    });

    return router;
};