const fs = require('fs');
const jwt = require('jsonwebtoken');

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

// Create a unique object ID
const UNIQUE_SUFFIX = Date.now();
const OBJECT_ID = `${ISSUER_ID}.user_${UNIQUE_SUFFIX}`;

const claims = {
  iss: serviceAccount.client_email,
  aud: 'google',
  origins: ['https://lolguy88888887.github.io'],
  typ: 'savetowallet',
  payload: {
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
        },
        // ADD BARCODE HERE
        barcode: {
          type: 'QR_CODE', // Options: 'QR_CODE', 'CODE_128', 'AZTEC', 'PDF_417'
          value: '10011-ALEX-2026', // The raw text/number stored in the barcode
          alternateText: '10011-ALEX-2026' // Text displayed directly below the code
        }
      }
    ]
  }
};

try {
  const token = jwt.sign(claims, serviceAccount.private_key, { algorithm: 'RS256' });
  const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

  fs.writeFileSync('pass-data.json', JSON.stringify({ url: saveUrl }, null, 2));
  console.log('✅ Successfully created pass-data.json with Barcode!');
} catch (err) {
  console.error('❌ Failed to generate JWT token:', err.message);
  process.exit(1);
}
