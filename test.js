import Kijiji from './api.js';

(async () => {
    let kijiji = new Kijiji();
    let listings = await kijiji.search("switch", {location: "Mississauga", maxResults: 10, radius: 50})
    console.log(listings);
})();
