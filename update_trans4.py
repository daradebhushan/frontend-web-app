with open('src/app/shared/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("        'CHIEF_OFFICER': 'Chief Officer (CO)',", "        'CHIEF_OFFICER': 'Chief Officer (CO)',\n        'SYSTEM_OWNER': 'System Owner',\n        'PLATFORM_ADMIN': 'Platform Admin',")
content = content.replace("        'CHIEF_OFFICER': 'मुख्याधिकारी (CO)',", "        'CHIEF_OFFICER': 'मुख्याधिकारी (CO)',\n        'SYSTEM_OWNER': 'सिस्टम मालक',\n        'PLATFORM_ADMIN': 'प्लॅटफॉर्म प्रशासक',")

with open('src/app/shared/translations.ts', 'w', encoding='utf-8') as f:
    f.write(content)

