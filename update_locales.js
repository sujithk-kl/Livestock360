const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'client/src/locales/en/translation.json');
const taPath = path.join(__dirname, 'client/src/locales/ta/translation.json');

const enNew = {
  "side_subscriptions": "Subscriptions",
  "sub_title_customer": "Customer Subscriptions",
  "sub_title_my": "My Subscriptions",
  "sub_status_active": "Active",
  "sub_status_paused": "Paused",
  "sub_status_cancelled": "Cancelled",
  "sub_status_completed": "Completed",
  "sub_search_placeholder": "Search by customer or product...",
  "sub_filter_all": "All",
  "sub_no_found": "No subscriptions found",
  "sub_try_filter": "Try a different filter or search term",
  "sub_skipped_tomorrow": "Skipped Tomorrow",
  "sub_period": "Period",
  "sub_daily": "Daily",
  "sub_addons": "Add-Ons",
  "sub_delivery_address": "Delivery Address",
  "sub_no_address": "No address on file",
  "sub_upcoming_skips": "Upcoming Skips",
  "sub_no_skips": "No upcoming skips",
  "sub_active_addons": "Active Add-Ons",
  "sub_type_recurring": "Recurring",
  "sub_type_onetime": "One-time",
  "sub_back_dashboard": "Dashboard",
  "sub_subscriptions_found": "subscriptions found",
  "sub_subscription_found": "subscription found",
  "sub_past_cutoff_msg": "It's past 10 PM. Changes to tomorrow's delivery are no longer accepted. The farm is already preparing your order.",
  "sub_no_active_msg": "You don't have any active subscriptions yet.",
  "sub_subscribe_btn": "Subscribe to Daily Milk",
  "sub_daily_delivery": "Daily Delivery",
  "sub_start_date": "Start Date",
  "sub_end_date": "End Date",
  "sub_monthly_bill": "Monthly Bill",
  "sub_saved": "Saved",
  "sub_paused_dates": "Paused Dates",
  "sub_cancelled_on": "Cancelled on:",
  "sub_refund_wallet": "Refund to Wallet:",
  "sub_extra_deliveries": "Extra Deliveries",
  "sub_once_on": "Once on",
  "sub_every": "Every",
  "sub_add_extra_items": "Add Extra Items",
  "sub_download_bill": "Download Bill",
  "sub_download_final_bill": "Download Final Bill",
  "sub_cancel_subscription": "Cancel Subscription",
  "sub_smart_controls": "Smart Controls",
  "sub_tomorrow_paused_msg": "Tomorrow's delivery is paused.",
  "sub_resume_tomorrow": "Resume Tomorrow",
  "sub_skip_tomorrow": "Skip Tomorrow",
  "sub_pause_desc": "Pause delivery if you're out of town or simply have plenty of milk remaining.",
  "sub_cutoff_passed_desc": "Cut-off time (10 PM) passed. Adjustments for tomorrow are disabled.",
  "sub_end_vacation": "End Vacation Early",
  "sub_pause_multiple": "Pause Multiple Days",
  "sub_vacation_mode": "Vacation Mode",
  "sub_from_date": "From Date",
  "sub_to_date": "To Date (Inclusive)",
  "sub_confirm_dates": "Confirm Dates",
  "sub_cancel_modal_title": "Cancel Subscription?",
  "sub_cancel_modal_desc1": "Are you sure you want to permanently cancel your",
  "sub_cancel_modal_desc2": "subscription? This action cannot be undone. Any unused prepaid balance will be instantly refunded to your",
  "sub_cancel_modal_wallet": "Livestock360 Wallet",
  "sub_cancel_modal_note": "* The exact prorated refund will be calculated based on the number of days already delivered versus the total amount paid.",
  "sub_close": "Close",
  "sub_confirm_cancel": "Yes, Cancel Subscription"
};

const taNew = {
  "side_subscriptions": "சந்தாக்கள்",
  "sub_title_customer": "நுகர்வோர் சந்தாக்கள்",
  "sub_title_my": "எனது சந்தாக்கள்",
  "sub_status_active": "செயலில்",
  "sub_status_paused": "இடைநிறுத்தப்பட்டுள்ளது",
  "sub_status_cancelled": "ரத்து செய்யப்பட்டது",
  "sub_status_completed": "முடிந்தது",
  "sub_search_placeholder": "வாடிக்கையாளர் அல்லது தயாரிப்பு மூலம் தேடவும்...",
  "sub_filter_all": "அனைத்தும்",
  "sub_no_found": "சந்தாக்கள் எதுவும் கிடைக்கவில்லை",
  "sub_try_filter": "வடிகட்டியை மாற்றவும் அல்லது வேறு சொல்லை தேடவும்",
  "sub_skipped_tomorrow": "நாளை தவிர்க்கப்பட்டது",
  "sub_period": "காலவரையறை",
  "sub_daily": "தினசரி",
  "sub_addons": "கூடுதல் பொருட்கள்",
  "sub_delivery_address": "டெலிவரி முகவரி",
  "sub_no_address": "முகவரி எதுவும் பதிவு செய்யப்படவில்லை",
  "sub_upcoming_skips": "வரவிருக்கும் விடுமுறைகள்",
  "sub_no_skips": "விடுமுறைகள் எதுவும் இல்லை",
  "sub_active_addons": "செயலில் உள்ள கூடுதல் பொருட்கள்",
  "sub_type_recurring": "தொடர்ச்சியான",
  "sub_type_onetime": "ஒரு முறை",
  "sub_back_dashboard": "முகப்பு பலகை",
  "sub_subscriptions_found": "சந்தாக்கள் காணப்பட்டன",
  "sub_subscription_found": "சந்தா காணப்பட்டது",
  "sub_past_cutoff_msg": "இரவு 10 மணி கடந்துவிட்டது. நாளைய டெலிவரியை மாற்றுவதற்கான அனுமதி முடிந்துவிட்டது. பண்ணையில் உங்கள் ஆர்டர் தயாராகி வருகிறது.",
  "sub_no_active_msg": "உங்களிடம் செயலில் உள்ள சந்தா எதுவும் இல்லை.",
  "sub_subscribe_btn": "தினசரி பாலுக்கு சந்தா செலுத்துங்கள்",
  "sub_daily_delivery": "தினசரி டெலிவரி",
  "sub_start_date": "தொடங்கும் தேதி",
  "sub_end_date": "முடியும் தேதி",
  "sub_monthly_bill": "மாதாந்திர கட்டணம்",
  "sub_saved": "சேமிக்கப்பட்டது",
  "sub_paused_dates": "இடைநிறுத்தப்பட்ட தேதிகள்",
  "sub_cancelled_on": "ரத்து செய்யப்பட்ட தேதி:",
  "sub_refund_wallet": "பணப்பையில் திருப்பி செலுத்தப்பட்ட தொகை:",
  "sub_extra_deliveries": "கூடுதல் டெலிவரிகள்",
  "sub_once_on": "ஒரு நாள்",
  "sub_every": "ஒவ்வொரு",
  "sub_add_extra_items": "கூடுதல் பொருட்களைச் சேர்க்கவும்",
  "sub_download_bill": "ரசீதை பதிவிறக்கம் செய்ய",
  "sub_download_final_bill": "இறுதி ரசீதை பதிவிறக்கம் செய்ய",
  "sub_cancel_subscription": "சந்தாவை ரத்து செய்",
  "sub_smart_controls": "ஸ்மார்ட் கட்டுப்பாடுகள்",
  "sub_tomorrow_paused_msg": "நாளைய டெலிவரி நிறுத்தப்பட்டுள்ளது.",
  "sub_resume_tomorrow": "நாளை தொடரவும்",
  "sub_skip_tomorrow": "நாளை தவிர்க்கவும்",
  "sub_pause_desc": "நீங்கள் ஊரில் இல்லை என்றாலோ அல்லது பால் மீதம் இருந்தாலோ டெலிவரியை நிறுத்திக் கொள்ளவும்.",
  "sub_cutoff_passed_desc": "(இரவு 10 மணி) நேரம் கடந்துவிட்டது. நாளைய மாற்றங்கள் முடக்கப்பட்டுள்ளன.",
  "sub_end_vacation": "விடுமுறையை முன்கூட்டியே முடிக்கவும்",
  "sub_pause_multiple": "பல நாட்களுக்கு இடைநிறுத்தம் செய்ய",
  "sub_vacation_mode": "விடுமுறை பயன்முறை",
  "sub_from_date": "தொடக்க தேதி",
  "sub_to_date": "முடிவு தேதி (உள்ளடக்கியது)",
  "sub_confirm_dates": "தேதிகளை உறுதிப்படுத்தவும்",
  "sub_cancel_modal_title": "சந்தாவை ரத்து செய்யவா?",
  "sub_cancel_modal_desc1": "உறுதியாக உங்களது",
  "sub_cancel_modal_desc2": "சந்தாவை ரத்து செய்ய விரும்புகிறீர்களா? இதை மீட்டமைக்க முடியாது. பயன்படுத்தப்படாத மீதமுள்ள இருப்பு உடனடியாக உங்களது",
  "sub_cancel_modal_wallet": "Livestock360 பணப்பையில் திரும்பச் செலுத்தப்படும்.",
  "sub_cancel_modal_note": "* ஏற்கனவே டெலிவரி செய்யப்பட்ட நாட்களின் எண்ணிக்கை மற்றும் நீங்கள் செலுத்திய மொத்த தொகைக்கு ஏற்ப சரியான மீதத் தொகை கணக்கிடப்படும்.",
  "sub_close": "மூடு",
  "sub_confirm_cancel": "ஆம், சந்தாவை ரத்து செய்"
};

function safelyMerge(filePath, newKeys) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let obj = JSON.parse(content);
  obj = { ...obj, ...newKeys };
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 4), 'utf-8');
  console.log('Successfully updated ' + filePath);
}

try {
  safelyMerge(enPath, enNew);
  safelyMerge(taPath, taNew);
  console.log("Locales patched successfully!");
} catch (e) {
  console.error("Error during script execution:", e);
  process.exit(1);
}
