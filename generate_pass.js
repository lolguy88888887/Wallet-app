const fs = require('fs');
const jwt = require('jsonwebtoken');

// Load Google Service Account key stored in GitHub Secrets
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY || '{}');

const ISSUER_ID = '3388000000023173404';
const CLASS_ID = `${ISSUER_ID}.demo_pass_10011`;
const OBJECT_ID = `${ISSUER_ID}.user_10011`;

// Define Pass Payload
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
        }
      }
    ]
  }
};

// Sign JWT using Service Account Private Key
try {
  const token = jwt.sign(claims, serviceAccount.private_key, { algorithm: 'RS256' });
  const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

  // Write output to pass-data.json
  fs.writeFileSync('pass-data.json', JSON.stringify({ url: saveUrl }, null, 2));
  console.log('✅ Successfully created pass-data.json!');
} catch (err) {
  console.error('❌ Failed to generate JWT token:', err.message);
  process.exit(1);
}
