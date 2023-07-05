import Kijiji from './api.js';

(async () => {
    let kijiji = new Kijiji();
    let listings = await kijiji.search("Gaming Pc")
    console.log(listings.result.length)
})();
