const fs = require('fs');
const jwt = require('jsonwebtoken');

// Load key from GitHub Secret (SERVICE_ACCOUNT_KEY)
const rawKey = process.env.SERVICE_ACCOUNT_KEY;

if (!rawKey) {
  console.error('❌ Error: SERVICE_ACCOUNT_KEY secret is missing or empty.');
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(rawKey);
} catch (err) {
  console.error('❌ Error parsing SERVICE_ACCOUNT_KEY JSON:', err.message);
  process.exit(1);
}

const ISSUER_ID = '3388000000023173404';
const CLASS_ID = `${ISSUER_ID}.demo_pass_10011`;
const OBJECT_ID = `${ISSUER_ID}.user_10011`;

// Define Google Wallet Pass Claims (Includes Class & Object definitions)
const claims = {
  iss: serviceAccount.client_email,
  aud: 'google',
  origins: ['https://lolguy88888887.github.io'],
  typ: 'savetowallet',
  payload: {
    // 1. Pre-define the Pass Class inside the JWT payload
    genericClasses: [
      {
        id: CLASS_ID,
        classTemplateInfo: {
          cardTemplateInfo: {
            cardColorHex: '#4285f4'
          }
        }
      }
    ],
    // 2. Define the Pass Object referencing the Class above
    genericObjects: [
      {
        id: OBJECT_ID,
        classId: CLASS_ID,
        state: 'ACTIVE',
        cardTitle: {
          defaultValue: { language: 'en', value: 'Mobile Wallet Pass' }
        },
        header: {
          defaultValue: { language: 'en', value: 'Alex' }
        },
        subheader: {
          defaultValue: { language: 'en', value: 'Account #10011' }
        }
      }
    ]
  }
};

// Sign JWT and write pass-data.json
try {
  const token = jwt.sign(claims, serviceAccount.private_key, { algorithm: 'RS256' });
  const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

  fs.writeFileSync('pass-data.json', JSON.stringify({ url: saveUrl }, null, 2));
  console.log('✅ Successfully generated pass-data.json with Class and Object!');
} catch (err) {
  console.error('❌ Failed to generate JWT token:', err.message);
  process.exit(1);
}
