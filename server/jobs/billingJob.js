/**
 * Nightly Billing Job
 *
 * Runs every night at 11:59 PM IST.
 * For each active subscription:
 *   1. Checks if today is paused — skips if so.
 *   2. Deducts the base daily cost from the customer's wallet.
 *   3. Processes each active add-on:
 *      - one-time: fires on delivery date, then marks Completed.
 *      - recurring: fires if today matches one of the recurringDays.
 *   4. Logs every deduction to the Transaction ledger.
 *   5. Auto-pauses subscription if wallet balance hits zero.
 */

const Subscription = require('../models/Subscription');
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const runNightlyBilling = async () => {
    console.log('[Billing Job] Starting nightly billing run at', new Date().toISOString());

    try {
        const todayStr = new Date().toISOString().split('T')[0];
        const today = new Date(todayStr);
        const todayDayName = DAY_NAMES[today.getDay()]; // e.g. "Monday"
        const todayDayOfMonth = String(today.getDate());  // e.g. "4"

        const activeSubscriptions = await Subscription.find({ status: 'Active' });
        console.log(`[Billing Job] Found ${activeSubscriptions.length} active subscriptions to process.`);

        let processed = 0, skipped = 0, autoPaused = 0;

        for (const sub of activeSubscriptions) {
            try {
                // 1. Skip if out of subscription window
                const startDate = new Date(sub.startDate.toISOString().split('T')[0]);
                const endDate = new Date(sub.endDate.toISOString().split('T')[0]);
                if (today < startDate || today > endDate) { skipped++; continue; }

                // 2. Skip if today is a paused date
                const isPaused = sub.pausedDates?.some(d => {
                    return new Date(d.toISOString().split('T')[0]).getTime() === today.getTime();
                });
                if (isPaused) { skipped++; continue; }

                // 3. Load customer once
                const customer = await Customer.findById(sub.customer);
                if (!customer) { skipped++; continue; }

                // --- Calculate total charge for today ---
                let totalChargeToday = (sub.productCostPerDay || 0) + (sub.deliveryCostPerDay || 0);
                let addonDescriptions = [];

                // 4. Process active add-ons
                for (const addon of sub.addOns) {
                    if (addon.status !== 'Active') continue;

                    let shouldChargeAddon = false;

                    if (addon.type === 'one-time') {
                        const addonDate = addon.deliveryDate
                            ? new Date(addon.deliveryDate.toISOString().split('T')[0])
                            : null;
                        if (addonDate && addonDate.getTime() === today.getTime()) {
                            shouldChargeAddon = true;
                            addon.status = 'Completed'; // Fire once and done
                        }
                    } else if (addon.type === 'recurring') {
                        // Match by day name (e.g. "Monday") or day-of-month number (e.g. "4")
                        if (
                            addon.recurringDays.includes(todayDayName) ||
                            addon.recurringDays.includes(todayDayOfMonth)
                        ) {
                            shouldChargeAddon = true;
                        }
                    }

                    if (shouldChargeAddon) {
                        totalChargeToday += addon.costPerDelivery;
                        addonDescriptions.push(`${addon.productName} x${addon.quantity}${addon.unit}`);
                    }
                }

                if (totalChargeToday <= 0) { skipped++; continue; }

                // 5. Check if customer has enough balance
                const currentBalance = customer.walletBalance || 0;
                const newBalance = currentBalance - totalChargeToday;

                if (newBalance < 0) {
                    sub.status = 'Paused';
                    await sub.save();
                    console.log(`[Billing Job] Sub ${sub._id}: Insufficient funds, auto-paused.`);
                    autoPaused++;
                    continue;
                }

                // 6. Deduct from wallet and save
                customer.walletBalance = newBalance;
                await customer.save();
                await sub.save(); // Save addon status updates (e.g. one-time -> Completed)

                // 7. Build a readable description for the transaction log
                let description = `Daily delivery: ${sub.productName}`;
                if (addonDescriptions.length > 0) {
                    description += ` + Add-ons: ${addonDescriptions.join(', ')}`;
                }

                await Transaction.create({
                    customer: customer._id,
                    type: 'DEBIT',
                    amount: totalChargeToday,
                    description,
                    relatedSubscription: sub._id,
                    balanceAfter: newBalance
                });

                console.log(`[Billing Job] Sub ${sub._id}: Deducted RS.${totalChargeToday.toFixed(2)}, balance -> RS.${newBalance.toFixed(2)}`);
                processed++;

            } catch (subError) {
                console.error(`[Billing Job] Error processing sub ${sub._id}:`, subError.message);
            }
        }

        console.log(`[Billing Job] Done - Processed: ${processed}, Skipped: ${skipped}, Auto-Paused: ${autoPaused}`);

    } catch (error) {
        console.error('[Billing Job] Fatal error:', error.message);
    }
};

module.exports = { runNightlyBilling };
