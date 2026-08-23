with open('src/app/shared/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("        'NEW_PASSWORD': 'New Password',", "        'NEW_PASSWORD': 'New Password',\n        'BACK_TO_LIST': 'Back to List',")
content = content.replace("        'NEW_PASSWORD': 'नवीन पासवर्ड',", "        'NEW_PASSWORD': 'नवीन पासवर्ड',\n        'BACK_TO_LIST': 'यादीवर परत जा',")

with open('src/app/shared/translations.ts', 'w', encoding='utf-8') as f:
    f.write(content)

