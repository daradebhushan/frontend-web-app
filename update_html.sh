#!/bin/bash
find src/app/features -name "*.html" -type f | xargs sed -i '' -e "s/>Settings</>{{ 'SETTINGS' | translate }}</g" \
-e "s/>Task Alerts</>{{ 'TASK_ALERTS' | translate }}</g" \
-e "s/>Get notified about new tasks</>{{ 'NOTIFIED_NEW_TASKS' | translate }}</g" \
-e "s/>Email Notifications</>{{ 'EMAIL_NOTIFICATIONS' | translate }}</g" \
-e "s/>Receive updates via email</>{{ 'RECEIVE_UPDATES_EMAIL' | translate }}</g" \
-e "s/>Departments</>{{ 'DEPARTMENTS' | translate }}</g" \
-e "s/>Users & Staff</>{{ 'USERS_STAFF' | translate }}</g" \
-e "s/>Complaint Types</>{{ 'COMPLAINT_TYPES' | translate }}</g" \
-e "s/>Chatbot Settings</>{{ 'CHATBOT_SETTINGS' | translate }}</g" \
-e "s/>Twilio Credentials</>{{ 'TWILIO_CREDENTIALS' | translate }}</g" \
-e "s/>Account SID</>{{ 'ACCOUNT_SID' | translate }}</g" \
-e "s/>Auth Token</>{{ 'AUTH_TOKEN' | translate }}</g" \
-e "s/>Welcome Messages</>{{ 'WELCOME_MESSAGES' | translate }}</g" \
-e "s/>English</>{{ 'ENGLISH' | translate }}</g" \
-e "s/>Marathi</>{{ 'MARATHI' | translate }}</g" \
-e "s/>Hindi</>{{ 'HINDI' | translate }}</g" \
-e "s/>Privacy Policy</>{{ 'PRIVACY_POLICY' | translate }}</g" \
-e "s/>Terms of Service</>{{ 'TERMS_OF_SERVICE' | translate }}</g" \
-e "s/>About Application</>{{ 'ABOUT_APPLICATION' | translate }}</g" \
-e "s/>Contact Support</>{{ 'CONTACT_SUPPORT' | translate }}</g" \
-e "s/>Loknagar SaaS Platform</>{{ 'LOKNAGAR_SAAS' | translate }}</g" \
-e "s/>Edit Profile</>{{ 'EDIT_PROFILE' | translate }}</g" \
-e "s/>No Complaint Types Found</>{{ 'NO_COMPLAINT_TYPES' | translate }}</g" \
-e "s/>Active Status</>{{ 'ACTIVE_STATUS' | translate }}</g" \
-e "s/>Original Complaint Reference</>{{ 'ORIGINAL_COMPLAINT_REF' | translate }}</g" \
-e "s/>Common tasks and reports</>{{ 'COMMON_TASKS_REPORTS' | translate }}</g" \
-e "s/>Chatbot</>{{ 'CHATBOT' | translate }}</g" \
-e "s/>Reset Password</>{{ 'RESET_PASSWORD' | translate }}</g" \
-e "s/>Enter OTP</>{{ 'ENTER_OTP' | translate }}</g" \
-e "s/>New Password</>{{ 'NEW_PASSWORD' | translate }}</g" \
-e "s/>WhatsApp Number</>{{ 'WHATSAPP_NUMBER' | translate }}</g" \
-e "s/>Chatbot Simulator</>{{ 'CHATBOT_SIMULATOR' | translate }}</g"

echo "HTML sed completed"
