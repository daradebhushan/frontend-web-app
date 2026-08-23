import re

with open('src/app/shared/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add English keys
en_missing = """
        // Auth / Password
        'RESET_PASSWORD': 'Reset Password',
        'ENTER_OTP': 'Enter OTP',
        'NEW_PASSWORD': 'New Password',
        
        // Profile & Settings
        'MY_PROFILE': 'My Profile',
        'MANAGE_ACCOUNT_SETTINGS': 'Manage your account settings and preferences',
        'ORGANIZATIONAL_DETAILS': 'Organizational Details',
        'SETTINGS': 'Settings',
        'TASK_ALERTS': 'Task Alerts',
        'NOTIFIED_NEW_TASKS': 'Get notified about new tasks',
        'EMAIL_NOTIFICATIONS': 'Email Notifications',
        'RECEIVE_UPDATES_EMAIL': 'Receive updates via email',
        'USERS_STAFF': 'Users & Staff',
        'COMPLAINT_TYPES': 'Complaint Types',
        
        // Chatbot Settings
        'CHATBOT_SETTINGS': 'Chatbot Settings',
        'TWILIO_CREDENTIALS': 'Twilio Credentials',
        'ACCOUNT_SID': 'Account SID',
        'AUTH_TOKEN': 'Auth Token',
        'WHATSAPP_NUMBER': 'WhatsApp Number',
        'WELCOME_MESSAGES': 'Welcome Messages',
        'ENGLISH': 'English',
        'MARATHI': 'Marathi',
        'HINDI': 'Hindi',
        'ABOUT_APPLICATION': 'About Application',
        'CONTACT_SUPPORT': 'Contact Support',
        'LOKNAGAR_SAAS': 'Loknagar SaaS Platform',
        'CHATBOT_SIMULATOR': 'Chatbot Simulator',
        
        // Forms & Admin
        'NO_COMPLAINT_TYPES': 'No Complaint Types Found',
        'ACTIVE_STATUS': 'Active Status',
        'ORIGINAL_COMPLAINT_REF': 'Original Complaint Reference',
        'COMMON_TASKS_REPORTS': 'Common tasks and reports',
        'CHATBOT': 'Chatbot'
"""
content = content.replace("        'ESTIMATED_COMPLETION': 'Estimated completion soon'", "        'ESTIMATED_COMPLETION': 'Estimated completion soon'," + en_missing)

mr_missing = """
        // Auth / Password
        'RESET_PASSWORD': 'पासवर्ड रिसेट करा',
        'ENTER_OTP': 'OTP प्रविष्ट करा',
        'NEW_PASSWORD': 'नवीन पासवर्ड',
        
        // Profile & Settings
        'MY_PROFILE': 'माझे प्रोफाइल',
        'MANAGE_ACCOUNT_SETTINGS': 'आपले खाते सेटिंग्ज व्यवस्थापित करा',
        'ORGANIZATIONAL_DETAILS': 'संस्थात्मक माहिती',
        'SETTINGS': 'सेटिंग्ज',
        'TASK_ALERTS': 'कामाच्या सूचना',
        'NOTIFIED_NEW_TASKS': 'नवीन कामांबद्दल सूचना मिळवा',
        'EMAIL_NOTIFICATIONS': 'ईमेल सूचना',
        'RECEIVE_UPDATES_EMAIL': 'ईमेलद्वारे अपडेट्स मिळवा',
        'USERS_STAFF': 'वापरकर्ते आणि कर्मचारी',
        'COMPLAINT_TYPES': 'तक्रारींचे प्रकार',
        
        // Chatbot Settings
        'CHATBOT_SETTINGS': 'चॅटबॉट सेटिंग्ज',
        'TWILIO_CREDENTIALS': 'ट्विलिओ माहिती',
        'ACCOUNT_SID': 'Account SID',
        'AUTH_TOKEN': 'Auth Token',
        'WHATSAPP_NUMBER': 'व्हॉट्सॲप नंबर',
        'WELCOME_MESSAGES': 'स्वागत संदेश',
        'ENGLISH': 'इंग्रजी',
        'MARATHI': 'मराठी',
        'HINDI': 'हिंदी',
        'ABOUT_APPLICATION': 'ॲप बद्दल',
        'CONTACT_SUPPORT': 'मदत व संपर्क',
        'LOKNAGAR_SAAS': 'लोकनगरी प्रणाली',
        'CHATBOT_SIMULATOR': 'चॅटबॉट सिम्युलेटर',
        
        // Forms & Admin
        'NO_COMPLAINT_TYPES': 'कोणतेही तक्रार प्रकार आढळले नाहीत',
        'ACTIVE_STATUS': 'सक्रिय स्थिती',
        'ORIGINAL_COMPLAINT_REF': 'मूळ तक्रार संदर्भ',
        'COMMON_TASKS_REPORTS': 'सामान्य कामे आणि अहवाल',
        'CHATBOT': 'चॅटबॉट'
"""
content = content.replace("        'ESTIMATED_COMPLETION': 'लवकरच पूर्ण होण्याची शक्यता'", "        'ESTIMATED_COMPLETION': 'लवकरच पूर्ण होण्याची शक्यता'," + mr_missing)

with open('src/app/shared/translations.ts', 'w', encoding='utf-8') as f:
    f.write(content)
