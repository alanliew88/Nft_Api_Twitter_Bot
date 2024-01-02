# NFT Large Movement Twitter Bot
A NFT Large Movement Twitter Bot that post a tweet of Top 5 NFT using Coingecko Public API

![image](https://github.com/alanliew88/Nft_Api_Twitter_Bot/assets/79797236/b94a09a6-3ee1-4206-9127-f44e0b3c08cb)


# This NFT Large Movement Twitter Bot was designed to store the API Json Response using SQLite DB

# Two API Endpoint will be used 
https://www.coingecko.com/api/documentation

To get the Top 5 NFT order by 24h Volume in USD in Descending order 
- https://api.coingecko.com/api/v3/nfts/list?order=h24_volume_usd_desc&per_page=5&page=1

To get the detailed info that needed for particular NFT
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
