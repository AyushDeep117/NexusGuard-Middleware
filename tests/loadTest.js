Zconst axios = require('axios');

const URL = 'http://localhost:3000/api/v1/feed';

async function simulateAttack() {
  console.log("--- Starting Security Shield Test (15 Requests) ---");
  
  for (let i = 1; i <= 15; i++) {
    try {
      const response = await axios.get(URL);
      console.log(`Request ${i}: ✅ [200 OK] - ${response.data.status}`);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        console.log(`Request ${i}: ❌ [429 Too Many Requests] - Shield Blocked!`);
      } else {
        console.log(`Request ${i}: ⚠️ Error - ${error.message}`);
      }
    }
  }
}

simulateAttack();