const Subscription = require('../models/Subscription');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

// Helper: silently fire a notification without blocking response
const notify = (recipient, message, type, extras = {}) => {
    Notification.create({ recipient, message, type, ...extras }).catch(err =>
        console.error('[Notification Error]', err.message)
    );
};

// @desc    Create a new subscription
// @route   POST /api/subscriptions
// @access  Private (Customer)
const createSubscription = async (req, res) => {
    try {
        const { productId, quantityPerDay, startDate, endDate, deliveryAddress } = req.body;
        const customerId = req.user.id;

        // ── Enforce delivery cost server-side ──────────────────────────────────
        // ₹300/month = ₹10/day flat rate. Never trust client-sent value.
        const DELIVERY_COST_PER_DAY = 10;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // --- Wallet Balance Guardrail ---
        const dailyCost = (product.price * quantityPerDay) + DELIVERY_COST_PER_DAY;
        const minimumRequired = dailyCost * 3; // Require at least 3 days of funds
        const customer = await Customer.findById(customerId);
        const currentBalance = customer?.walletBalance || 0;

        if (currentBalance < minimumRequired) {
            return res.status(402).json({
                success: false,
                message: `Insufficient wallet balance. You need at least ₹${minimumRequired.toFixed(2)} (3 days of delivery) to start this subscription. Your balance is ₹${currentBalance.toFixed(2)}.`,
                code: 'INSUFFICIENT_WALLET_BALANCE',
                required: minimumRequired,
                currentBalance
            });
        }
        // --- End Guardrail ---

        const subscription = await Subscription.create({
            customer: customerId,
            farmer: product.farmer,
            product: productId,
            productName: product.productName,
            quantityPerDay,
            unit: product.unit,
            productCostPerDay: product.price * quantityPerDay,
            deliveryCostPerDay: DELIVERY_COST_PER_DAY,
            startDate,
            endDate,
            status: 'Active',
            deliveryAddress: {
                street: deliveryAddress?.street || '',
                city: deliveryAddress?.city || '',
                state: deliveryAddress?.state || '',
                pincode: deliveryAddress?.pincode || '',
            }
        });

        // Notify farmer about new subscription
        const customerDoc = await Customer.findById(customerId).select('name');
        const customerName = customerDoc?.name || 'A customer';
        notify(
            product.farmer,
            `New subscription: ${customerName} \u2192 ${quantityPerDay}${product.unit} ${product.productName}/day`,
            'SUB_NEW',
            { subscription: subscription._id }
        );

        res.status(201).json({
            success: true,
            data: subscription
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating subscription'
        });
    }
};

// @desc    Get all subscriptions for a customer
// @route   GET /api/subscriptions/my-subscriptions
// @access  Private (Customer)
const getMySubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ customer: req.user.id })
            .populate('farmer', 'name phone')
            .populate('product', 'productName unit price')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: subscriptions
        });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching subscriptions'
        });
    }
};

// @desc    Get subscriptions for a farmer (to see required daily delivery)
// @route   GET /api/subscriptions/farmer
// @access  Private (Farmer)
const getFarmerSubscriptions = async (req, res) => {
    try {
        const { status } = req.query; // optional ?status=Active filter
        const filter = { farmer: req.user.id };
        if (status) filter.status = status;

        const subscriptions = await Subscription.find(filter)
            .populate('customer', 'name phone address city')
            .populate('product', 'productName unit price category')
            .populate('addOns.product', 'productName unit')
            .sort({ createdAt: -1 });

        // Annotate tomorrowStatus for each subscription
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const data = subscriptions.map(sub => {
            const obj = sub.toObject();
            obj.tomorrowSkipped = sub.pausedDates.some(
                d => d.toISOString().split('T')[0] === tomorrowStr
            );
            return obj;
        });

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error fetching farmer subscriptions:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Add a pause date to a subscription (Skip Tomorrow feature)
// @route   POST /api/subscriptions/:id/pause-date
// @access  Private (Customer)
const pauseSubscriptionDate = async (req, res) => {
    try {
        // Support both date and pauseDate keys based on frontend implementation
        const rawDate = req.body.date || req.body.pauseDate;

        if (!rawDate) {
            return res.status(400).json({ success: false, message: 'No pause date provided' });
        }

        const subscription = await Subscription.findOne({ _id: req.params.id, customer: req.user.id });

        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Subscription not found' });
        }

        // 10:00 PM Strict Cut-off Logic for Next Day
        const currentTime = new Date();
        const targetDate = new Date(rawDate);

        if (isNaN(targetDate.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid date format' });
        }

        targetDate.setHours(0, 0, 0, 0);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        // If they are trying to pause tomorrow, check if it's past 10 PM today
        if (targetDate.getTime() === tomorrow.getTime()) {
            if (currentTime.getHours() >= 22) {
                return res.status(400).json({
                    success: false,
                    message: 'Strict cutoff time passed. You cannot modify tomorrow\'s delivery after 10:00 PM.'
                });
            }
        } else if (targetDate.getTime() <= currentTime.getTime()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot pause deliveries for past or current dates.'
            });
        }

        // Add the date to the array if it's not already there
        const dateStr = targetDate.toISOString();
        const alreadyPaused = subscription.pausedDates.some(d => d.toISOString() === dateStr);

        if (!alreadyPaused) {
            subscription.pausedDates.push(targetDate);
            await subscription.save();

            // Notify farmer
            const cust = await Customer.findById(req.user.id).select('name');
            const dateLabel = targetDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            notify(
                subscription.farmer,
                `${cust?.name || 'A customer'} skipped delivery for ${dateLabel} (${subscription.productName})`,
                'SUB_SKIP',
                { subscription: subscription._id }
            );
        }

        res.status(200).json({
            success: true,
            data: subscription,
            message: 'Delivery paused for requested date.'
        });

    } catch (error) {
        console.error('Error pausing subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Remove a pause date from a subscription (Resume Delivery feature)
// @route   POST /api/subscriptions/:id/resume-date
// @access  Private (Customer)
const resumeSubscriptionDate = async (req, res) => {
    try {
        const rawDate = req.body.date || req.body.resumeDate;

        if (!rawDate) {
            return res.status(400).json({ success: false, message: 'No date provided to resume' });
        }

        const subscription = await Subscription.findOne({ _id: req.params.id, customer: req.user.id });

        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Subscription not found' });
        }

        // 10:00 PM Strict Cut-off Logic for Next Day
        const currentTime = new Date();
        const targetDate = new Date(rawDate);

        if (isNaN(targetDate.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid date format' });
        }

        targetDate.setHours(0, 0, 0, 0);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        // If they are trying to resume tomorrow, check if it's past 10 PM today
        if (targetDate.getTime() === tomorrow.getTime()) {
            if (currentTime.getHours() >= 22) {
                return res.status(400).json({
                    success: false,
                    message: 'Strict cutoff time passed. You cannot modify tomorrow\'s delivery after 10:00 PM.'
                });
            }
        } else if (targetDate.getTime() <= currentTime.getTime()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot resume deliveries for past or current dates.'
            });
        }

        // Remove the date from the array
        const dateStr = targetDate.toISOString();
        subscription.pausedDates = subscription.pausedDates.filter(d => d.toISOString() !== dateStr);
        await subscription.save();

        // Notify farmer
        const custR = await Customer.findById(req.user.id).select('name');
        const dateLabelR = targetDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        notify(
            subscription.farmer,
            `${custR?.name || 'A customer'} resumed delivery for ${dateLabelR} (${subscription.productName})`,
            'SUB_RESUME',
            { subscription: subscription._id }
        );

        res.status(200).json({
            success: true,
            data: subscription,
            message: 'Delivery resumed for requested date.'
        });

    } catch (error) {
        console.error('Error resuming subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Pause a range of dates for a subscription (Vacation Mode)
// @route   POST /api/subscriptions/:id/pause-range
// @access  Private (Customer)
const pauseSubscriptionRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'Please provide both start and end dates' });
        }

        const subscription = await Subscription.findOne({ _id: req.params.id, customer: req.user.id });

        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Subscription not found' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid date format' });
        }

        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        if (end < start) {
            return res.status(400).json({ success: false, message: 'End date must be after start date' });
        }

        const currentTime = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        // Generate array of dates
        let currentDate = new Date(start);
        const datesToPause = [];

        while (currentDate <= end) {
            datesToPause.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Validate each date
        for (let d of datesToPause) {
            if (d.getTime() < tomorrow.getTime() && d.getTime() !== tomorrow.getTime()) {
                return res.status(400).json({
                    success: false,
                    message: 'You cannot pause deliveries for past or current dates.'
                });
            }
            if (d.getTime() === tomorrow.getTime() && currentTime.getHours() >= 22) {
                return res.status(400).json({
                    success: false,
                    message: 'Strict cutoff time passed. You cannot pause tomorrow\'s delivery after 10:00 PM.'
                });
            }
        }

        // Add dates if not already paused
        let newPausesAdded = false;
        datesToPause.forEach(d => {
            const dateStr = d.toISOString().split('T')[0];
            const alreadyPaused = subscription.pausedDates.some(pd => pd.toISOString().split('T')[0] === dateStr);
            if (!alreadyPaused) {
                subscription.pausedDates.push(d);
                newPausesAdded = true;
            }
        });

        if (newPausesAdded) {
            await subscription.save();

            // Notify farmer about vacation range
            const custV = await Customer.findById(req.user.id).select('name');
            const startLabel = start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            const endLabel = end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            notify(
                subscription.farmer,
                `${custV?.name || 'A customer'} paused ${subscription.productName} from ${startLabel}\u2013${endLabel}`,
                'SUB_VACATION',
                { subscription: subscription._id }
            );
        }

        res.status(200).json({
            success: true,
            data: subscription,
            message: 'Delivery paused for requested date range.'
        });

    } catch (error) {
        console.error('Error pausing subscription range:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Cancel Vacation Mode (Resume all future paused dates)
// @route   POST /api/subscriptions/:id/cancel-vacation
// @access  Private (Customer)
const cancelVacationMode = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ _id: req.params.id, customer: req.user.id });

        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Subscription not found' });
        }

        const currentTime = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        // Determine the start point for cancelling pauses.
        // If it's past 10 PM today, we cannot cancel tomorrow's pause. We must start from the day after tomorrow.
        const effectiveResumeDate = new Date(tomorrow);
        if (currentTime.getHours() >= 22) {
            effectiveResumeDate.setDate(effectiveResumeDate.getDate() + 1);
        }

        // Filter out any paused dates that are ON or AFTER the effectiveResumeDate
        // This effectively "cancels" the vacation from that point forward
        const originalLength = subscription.pausedDates.length;
        subscription.pausedDates = subscription.pausedDates.filter(d => {
            const pDate = new Date(d);
            pDate.setHours(0, 0, 0, 0);
            return pDate.getTime() < effectiveResumeDate.getTime();
        });

        const datesResumed = originalLength - subscription.pausedDates.length;

        if (datesResumed > 0) {
            await subscription.save();

            // Notify farmer
            const custC = await Customer.findById(req.user.id).select('name');
            notify(
                subscription.farmer,
                `${custC?.name || 'A customer'} cancelled vacation \u2014 ${datesResumed} delivery days resumed (${subscription.productName})`,
                'SUB_RESUME',
                { subscription: subscription._id }
            );
        }

        res.status(200).json({
            success: true,
            data: subscription,
            message: datesResumed > 0
                ? `Vacation cancelled. ${datesResumed} deliveries resumed.`
                : 'No future paused deliveries found to resume.'
        });

    } catch (error) {
        console.error('Error cancelling vacation mode:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Cancel a subscription and issue prorated refund
// @route   PUT /api/subscriptions/:id/cancel
// @access  Private (Customer)
const cancelSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ _id: req.params.id, customer: req.user.id })
            .populate('product', 'price');

        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Subscription not found' });
        }

        if (subscription.status !== 'Active') {
            return res.status(400).json({ success: false, message: 'Only active subscriptions can be cancelled' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dailyCost = (subscription.product.price * subscription.quantityPerDay) + subscription.deliveryCostPerDay;

        // Total days initially paid for
        const totalDays = Math.ceil((new Date(subscription.endDate) - new Date(subscription.startDate)) / (1000 * 60 * 60 * 24)) + 1;
        const totalExpectedCost = dailyCost * totalDays;

        let daysDelivered = 0;

        for (let d = new Date(subscription.startDate); d <= new Date(subscription.endDate); d.setDate(d.getDate() + 1)) {
            const isPaused = subscription.pausedDates.some(pd => new Date(pd).getTime() === d.getTime());

            // Deliveries count if they are in the past or today, and not paused
            if (d.getTime() <= today.getTime() && !isPaused) {
                daysDelivered++;
            }
        }

        // Unused funds calculation
        const totalPaid = subscription.totalBilledAmount > 0 ? subscription.totalBilledAmount : totalExpectedCost;
        const valueDelivered = daysDelivered * dailyCost;
        let refundAmount = totalPaid - valueDelivered;

        if (refundAmount < 0) refundAmount = 0;

        // Issue Wallet Refund
        const Customer = require('../models/Customer');
        await Customer.findByIdAndUpdate(req.user.id, {
            $inc: { walletBalance: refundAmount }
        });

        // Update Subscription Status
        subscription.status = 'Cancelled';
        subscription.cancelledAt = new Date();
        subscription.refundAmount = refundAmount;
        await subscription.save();

        // Notify farmer
        const custCancel = await Customer.findById(req.user.id).select('name');
        notify(
            subscription.farmer,
            `${custCancel?.name || 'A customer'} cancelled their ${subscription.productName} subscription`,
            'SUB_CANCEL',
            { subscription: subscription._id }
        );

        res.status(200).json({
            success: true,
            data: subscription,
            message: `Subscription cancelled. ₹${refundAmount} has been credited to your wallet.`
        });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while cancelling subscription'
        });
    }
};


// @desc    Add an add-on product to a subscription
// @route   POST /api/subscriptions/:id/addons
// @access  Private (Customer)
const addAddon = async (req, res) => {
    try {
        const { productId, quantity, type, deliveryDate, recurringDays } = req.body;

        // 1. Load the subscription and verify ownership
        const subscription = await Subscription.findOne({ _id: req.params.id, customer: req.user.id });
        if (!subscription) return res.status(404).json({ success: false, message: 'Subscription not found' });
        if (subscription.status !== 'Active') return res.status(400).json({ success: false, message: 'Cannot add extras to a non-active subscription' });

        // 2. Load the product and verify it is from the same farmer
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        if (product.farmer.toString() !== subscription.farmer.toString()) {
            return res.status(400).json({ success: false, message: 'Add-on product must be from the same farmer as your subscription' });
        }

        // 3. Validate required fields by type
        if (type === 'one-time' && !deliveryDate) {
            return res.status(400).json({ success: false, message: 'Delivery date is required for a one-time add-on' });
        }
        if (type === 'recurring' && (!recurringDays || recurringDays.length === 0)) {
            return res.status(400).json({ success: false, message: 'At least one recurring day is required' });
        }

        const costPerDelivery = product.price * parseFloat(quantity);

        // 4. Build and push the add-on
        subscription.addOns.push({
            product: productId,
            productName: product.productName,
            quantity: parseFloat(quantity),
            unit: product.unit,
            costPerDelivery,
            type,
            deliveryDate: type === 'one-time' ? new Date(deliveryDate) : undefined,
            recurringDays: type === 'recurring' ? recurringDays : [],
            status: 'Active'
        });

        await subscription.save();

        res.status(200).json({
            success: true,
            message: `Add-on "${product.productName}" has been added to your delivery!`,
            data: subscription
        });
    } catch (error) {
        console.error('Error adding add-on:', error);
        res.status(500).json({ success: false, message: 'Server error while adding add-on' });
    }
};

// @desc    Remove an add-on from a subscription
// @route   DELETE /api/subscriptions/:id/addons/:addonId
// @access  Private (Customer)
const removeAddon = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ _id: req.params.id, customer: req.user.id });
        if (!subscription) return res.status(404).json({ success: false, message: 'Subscription not found' });

        const addon = subscription.addOns.id(req.params.addonId);
        if (!addon) return res.status(404).json({ success: false, message: 'Add-on not found' });

        addon.status = 'Removed';
        await subscription.save();

        res.status(200).json({
            success: true,
            message: 'Add-on removed successfully.',
            data: subscription
        });
    } catch (error) {
        console.error('Error removing add-on:', error);
        res.status(500).json({ success: false, message: 'Server error while removing add-on' });
    }
};

module.exports = {
    createSubscription,
    getMySubscriptions,
    getFarmerSubscriptions,
    pauseSubscriptionDate,
    resumeSubscriptionDate,
    pauseSubscriptionRange,
    cancelVacationMode,
    cancelSubscription,
    addAddon,
    removeAddon
};
