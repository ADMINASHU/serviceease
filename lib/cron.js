// lib/cron.js
import cron from 'node-cron';
import fetch from 'node-fetch';

cron.schedule('*/10 * * * *', async () => { // Runs every 10 minutes
  console.log('Running cron job to sync data');
  await fetch('http://localhost:3000/api/sync'); // Ensure your server is running
});
