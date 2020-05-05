const axios = require("axios");

const BEARER_TOKEN = process.env.BEARER_TOKEN;
const YOUR_ID = process.env.YOUR_ID;
const LIMIT = 100;

if (!BEARER_TOKEN || !YOUR_ID) {
  console.error(`You haven't provided an authorization token and/or your Faceit ID.
  You can do so by setting the BEARER_TOKEN and YOUR_ID environment variables.
  Example: BEARER_TOKEN=your_token_here YOUR_ID=your_id_here node index.js`);
  process.exit(1);
}

faceitApi = axios.create({
  baseURL: `https://api.faceit.com/`,
  headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
});

const bulkRemoveFriends = async () => {
  const friends = [];

  let offset = 0;
  while (true) {
    const { data } = await faceitApi.get(
      `/recommender/v1/friends?limit=${LIMIT}&offset=${offset}`
    );

    friends.push(...data.payload.results);

    offset += LIMIT;

    if (offset >= data.payload.total_count) break;
  }

  // Comment if you want to remove all friends
  const friendsFiltered = friends.filter(
    (friend) =>
      !friend.friendOnPlatforms ||
      friend.friendOnPlatforms.indexOf("steam") === -1
  );

  for (let i = 0; i < friendsFiltered.length; ++i) {
    const friend = friendsFiltered[i];

    await faceitApi.delete(`/core/v1/users/${YOUR_ID}/friends/${friend.guid}`);
  }
};

bulkRemoveFriends();
