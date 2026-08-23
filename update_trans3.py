with open('src/app/shared/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("        'PENDING': 'Pending',", "        'PENDING': 'Pending',\n        'ACCEPTED': 'Accepted',\n        'REJECTED': 'Rejected',\n        'CONVERTED_TO_TASK': 'Converted to Task',")
content = content.replace("        'PENDING': 'प्रलंबित',", "        'PENDING': 'प्रलंबित',\n        'ACCEPTED': 'स्वीकारले',\n        'REJECTED': 'नाकारले',\n        'CONVERTED_TO_TASK': 'कामात रूपांतरित',")

with open('src/app/shared/translations.ts', 'w', encoding='utf-8') as f:
    f.write(content)

