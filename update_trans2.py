with open('src/app/shared/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("        'NAV_COMPLAINTS': 'Complaints',", "        'NAV_COMPLAINTS': 'Complaints',\n        'NAV_ADMINS': 'Admins',\n        'GENERAL_COMPLAINT': 'General Complaint',")
content = content.replace("        'NAV_COMPLAINTS': 'तक्रारी',", "        'NAV_COMPLAINTS': 'तक्रारी',\n        'NAV_ADMINS': 'प्रशासक',\n        'GENERAL_COMPLAINT': 'सर्वसाधारण तक्रार',")

with open('src/app/shared/translations.ts', 'w', encoding='utf-8') as f:
    f.write(content)

