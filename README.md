# NFT Large Movement Twitter Bot
A NFT Large Movement Twitter Bot that post a tweet of Top 5 NFT using Coingecko Public API

![image](https://github.com/alanliew88/Nft_Api_Twitter_Bot/assets/79797236/b94a09a6-3ee1-4206-9127-f44e0b3c08cb)

# NFT Data Processing and Tweeting

This Node.js application fetches data from the Coingecko API for the top NFTs, stores the information in an SQLite database, processes the data for multiple platforms, and posts the details as a tweet using the Twitter API.

## Overview

The application performs the following tasks:

- Retrieves data for top NFTs from the Coingecko API.
- Stores fetched data into SQLite tables for later use.
- Processes and retrieves specific data for various platforms based on predefined mappings.
- Constructs a tweet containing NFT information for multiple platforms.
- Posts the composed tweet on Twitter using the Twitter API.

## Prerequisites

- Node.js installed on your machine.
- Access to Coingecko and Twitter API keys for authentication.
- SQLite database for storing fetched NFT data.

## Setup

1. Clone the repository to your local machine.
2. Install the required dependencies by running `npm install`.
3. Update the Twitter API and Coingecko API credentials in the script file (`script.js`) with your own keys.
4. Ensure an SQLite database (`nft_data.db`) is present or adjust the database name/location in the script file.
5. Run the script using `node script.js` to execute the process.

## Dependencies

- Axios: Used for making HTTP requests to the Coingecko API.
- SQLite3: SQLite database driver for Node.js.
- Twitter-API-v2: A Twitter API client for Node.js used to post tweets.
- Node-cron: Provides a simple cron-like job scheduling for Node.js.

## Functionality Details

- The application uses SQLite for data storage and retrieval.
- It fetches data from the Coingecko API and populates two tables: `nft_top_5` and `nft_price_change`.
- Mappings for different platforms are defined to display NFT details per platform.
- The script processes and constructs log messages for multiple platforms and prepares a tweet based on this information.

## Important Notes

- Ensure API keys and sensitive information are kept secure and not shared publicly.
- Modify platform mappings and database configurations as needed for your specific use case.
- Monitor Twitter's API usage limits and adhere to them to avoid rate-limiting issues.

## References

- [Coingecko API Documentation](https://www.coingecko.com/api/documentation)
- [Twitter API v2 Documentation](https://developer.twitter.com/en/docs/twitter-api)
- [Node-cron Documentation](https://github.com/node-cron/node-cron)

# Two API Endpoints will be used 
https://www.coingecko.com/api/documentation

To get the Top 5 NFT order by 24h Volume in USD in Descending order 
- https://api.coingecko.com/api/v3/nfts/list?order=h24_volume_usd_desc&per_page=5&page=1

To get the detailed info that is needed for a particular NFT
- https://api.coingecko.com/api/v3/nfts/{id} example,  https://api.coingecko.com/api/v3/nfts/bored-ape-yacht-club
  

# You will need to insert your appKey, appSecret, accessToken, and accessSecret
// Initialize Twitter API client
const twitterClient = new twitterApi.TwitterApi({
  appKey:'your-app-key',
  appSecret:'your-app-secret',
  accessToken: 'your-access-token',
  accessSecret:'your-access-secret',
});


# To run the script, 
node your-script-name.js 
