const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const twitterApi = require('twitter-api-v2');
const cron = require('node-cron');

// Initialize Twitter API client
const twitterClient = new twitterApi.TwitterApi({
  appKey:'your-app-key',
  appSecret:'your-app-secret',
  accessToken: 'your-access-token',
  accessSecret:'your-access-secret',
});


// Read+Write level
const rwClient = twitterClient.readWrite;

// SQLite database configuration
const db = new sqlite3.Database('./nft_data.db');

// Function to create tables in SQLite database
function createTables() {
  const createTop5TableQuery = `CREATE TABLE IF NOT EXISTS nft_top_5 (
    id TEXT PRIMARY KEY,
    name TEXT,
    asset_platform_id TEXT
  )`;

  const createPriceChangeTableQuery = `CREATE TABLE IF NOT EXISTS nft_price_change (
    id TEXT PRIMARY KEY,
    name TEXT,
    asset_platform_id TEXT,
    native_currency TEXT,
    floor_price_usd_change REAL
  )`;


  db.serialize(() => {
    db.run(createTop5TableQuery, error => {
      if (error) throw error;
      console.log('nft_top_5 table created or already exists');
    });

    db.run(createPriceChangeTableQuery, error => {
      if (error) throw error;
      console.log('nft_price_change table created or already exists');
    });

  });
}


// Function to clean the nft_top_5 table before inserting new data
function cleanNftTop5Table() {
  const deleteQuery = 'DELETE FROM nft_top_5';

  db.run(deleteQuery, error => {
    if (error) {
      console.error('Error cleaning nft_top_5 table:', error.message);
    } else {
      console.log('nft_top_5 table cleaned successfully');
    }
  });
}

// Function to clean the nft_price_change table before inserting new data
function cleanNftPriceChangeTable() {
  const deleteQuery = 'DELETE FROM nft_price_change';

  db.run(deleteQuery, error => {
    if (error) {
      console.error('Error cleaning nft_price_change table:', error.message);
    } else {
      console.log('nft_price_change table cleaned successfully');
    }
  });
}


// Function to fetch data from the API endpoint
async function fetchData(url) {
  try {
    const response = await axios.get(url);
    return response.data || [];
  } catch (error) {
    throw new Error(`Error fetching data: ${error.message}`);
  }
}

// Function to insert data into the nft_top_5 table with selected fields
async function insertDataIntoTop5Table(data) {
  const insertQuery = `INSERT OR IGNORE INTO nft_top_5 (id, name, asset_platform_id) VALUES (?, ?, ?)`;

  for (const item of data) {
    try {
      await db.run(insertQuery, [
        item.id,
        item.name,
        item.asset_platform_id || null,
        
      ]);
      console.log(`Data inserted into nft_top_5 table successfully`);
    } catch (error) {
      console.log(`Duplicate id detected. Skipping insertion for id: ${item.id}`);
    }
  }
}

// Function to insert data into the nft_price_change table with selected fields
async function insertDataIntoPriceChangeTable(data) {
  const insertQuery = `INSERT OR IGNORE INTO nft_price_change (id, name, asset_platform_id, native_currency, floor_price_usd_change) VALUES (?, ?, ?, ?, ?)`;

  for (const item of data) {
    try {
      await db.run(insertQuery, [
        item.id,
        item.name,
        item.asset_platform_id || null,
        item.floor_price && item.floor_price.native_currency || null,
        item.floor_price_in_usd_24h_percentage_change || null
      ]);
      console.log(`Data inserted into nft_price_change table successfully`);
    } catch (error) {
      console.log(`Duplicate id detected. Skipping insertion for id: ${item.id}`);
    }
  }
}


function displayDataForMultiplePlatforms(logMessagesArray) {
  return new Promise((resolve, reject) => {
  const platformMappings = {
    'klay-token': 'Klay',
    'ethereum': 'ETH',
    'polygon-pos': 'ETH',
    'solana': 'SOL',
    'ordinals': 'BTC',
    'arbitrum-one': 'ETH',
    'binance-smart-chain': 'BNB',
    'ronin': 'RON',
    'avalanche': 'AVAX',
    'optimistic-ethereum': 'ETH'
    // Add more platform mappings here if needed
  };

  const logMessagesArray = []; // Initialize the array here

  const selectDistinctPlatformsQuery = `SELECT DISTINCT asset_platform_id FROM nft_price_change`;

  db.all(selectDistinctPlatformsQuery, [], (err, distinctRows) => {
    if (err) {
      throw new Error(`Error fetching distinct asset platforms: ${err.message}`);
    }

    const supportedPlatforms = distinctRows.map(row => row.asset_platform_id);
    const placeholders = supportedPlatforms.map(_ => '?').join(',');

    const selectQuery = `
      SELECT name, native_currency, floor_price_usd_change, asset_platform_id
      FROM nft_price_change WHERE asset_platform_id IN (${placeholders})
    `;

    db.all(selectQuery, supportedPlatforms, (err, rows) => {
      if (err) {
        throw new Error(`Error fetching data: ${err.message}`);
      }

      //console.log('--------Top 5 NFT --------')
      rows.forEach(row => {
        let arrowEmoji ='';


        if (row.floor_price_usd_change > 0) {
          arrowEmoji = '🟢\u{2191}'; // Green arrow up emoji
        } else if (row.floor_price_usd_change < 0) {
          arrowEmoji = '🔴\u{2193}'; // Red arrow down emoji
        } else {
          arrowEmoji = '⚫️'; // Black circle emoji for no change
        }
      
        const platformName = platformMappings[row.asset_platform_id] || row.asset_platform_id.toUpperCase();
        // This is to print the example message into the console. 
        //console.log(`The ${row.name} is now ${row.native_currency} ${platformName}, ${arrowEmoji}  ${row.floor_price_usd_change} % change in the last 24h`);

        // Define your NFT details here
        const logMessage = `${row.name} -> ${row.native_currency} ${platformName} | ${arrowEmoji}  ${row.floor_price_usd_change} % `; 

        logMessagesArray.push(logMessage); // Push each log message to the array
      });

      resolve(logMessagesArray);
    });
  });
});
}



// Function to post a tweet for multiple NFTs in a single tweet
async function tweetMultipleNFTs(logMessages) {
  try {
    if (logMessages && logMessages.length > 0) {
      const header = 'Top 5 NFT'; // Define your header here
      const footer = '\n\nBased on the last 24 hour\n#Coingecko #NFT '; // Define your footer here
      const combinedLogMessages = `${header}\n\n${logMessages.join('\n')}${footer}`;
      await rwClient.v2.tweet({
        text: combinedLogMessages,
      });
      console.log('Tweeted the post:', combinedLogMessages);
    } else {
      console.error('Error: logMessages array is empty or undefined.');
    }
  } catch (error) {
    console.error('Error posting tweet:', error);
  }
}

async function displayAndTweetDataForMultiplePlatforms() {
  try {
    const allLogMessages = await displayDataForMultiplePlatforms();

    if (allLogMessages && allLogMessages.length > 0) {
      console.log('Here is the log message:', allLogMessages);
      await tweetMultipleNFTs(allLogMessages);
    } else {
      console.error('Error: logMessages array is empty or undefined.');
    }
  } catch (error) {
    console.error('Error displaying and tweeting data:', error);
  }
}


// Main function to fetch data, process it, and store in SQLite tables
async function main() {
  try {
    // Create tables if not exists
    createTables();
    
    // Clean tables if not exists
    cleanNftTop5Table();
    cleanNftPriceChangeTable();

    // Fetch data from the first API endpoint and store in nft_top_5 table
    const top5Endpoint = 'https://api.coingecko.com/api/v3/nfts/list?order=h24_volume_usd_desc&per_page=5&page=1';
    const top5Data = await fetchData(top5Endpoint);
    insertDataIntoTop5Table(top5Data);

    // Fetch additional data for each ID from the first response and store selected fields in nft_price_change table
    const ids = top5Data.map(item => item.id);
    const priceChangePromises = ids.map(id => fetchData(`https://api.coingecko.com/api/v3/nfts/${id}`));
    const priceChangeData = await Promise.all(priceChangePromises);
    insertDataIntoPriceChangeTable(priceChangeData);

    // Display specific data for 'klay-token' asset_platform_id
    const allLogMessages = await displayDataForMultiplePlatforms();

    // Tweet all combined log messages
    await displayAndTweetDataForMultiplePlatforms(allLogMessages);
    

  } catch (error) {
    console.error(error.message);
  } finally {
    db.close(); // Close SQLite database connection
  }
}

main();