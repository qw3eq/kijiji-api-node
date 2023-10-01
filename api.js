import axios from 'axios';
import * as cheerio from 'cheerio';
import toQueryString from './utils.js';


export default class Kijiji {
    constructor() {    
    this.defaultPayload = {
        formSubmit: "true",
        rb: "true",
        adIdRemoved: "",
        adPriceType: "",
        carproofOnly: "false",
        cpoOnly: "false",
        gpTopAd: "false",
        highlightOnly: "false",
        origin:"",
        pageNumber:1,
        searchView:"LIST",
        userId:"",
        urgentOnly: "false",
        keywords: "gaming+pc",
        dc:"true"
    };
    }

    /*
        @param {string} searchQuery - The search query
        @param {object} options - The search options
        @param {string} options.categoryName - The category name
        @param {string} options.brand - The brand
        @param {string} options.address - The name of the city
        @param {number} options.radius - The radius of the search in kms
        @param {number} options.minPrice - The minimum price
        @param {number} options.maxPrice - The maximum price
        @param {string} options.sortByName - possible values: dateDesc, priceAsc, priceDesc
        @param {number} options.categoryId - The category id
        @param {number} options.maxResults - The maximum number of results to return (-1 for all results)

        @returns {object} - The search results
    */

    search = async (searchQuery, {categoryName = "", brand = "", address = "Mississauga", radius="", minPrice = "", maxPrice = "", sortByName = "dateDesc", categoryId = 0, maxResults = null} = {}) => {
        const payload = this.defaultPayload;
        payload.categoryName = categoryName;
        payload.brand = brand;
        payload.address = address;
        payload.radius = radius;
        payload.minPrice = minPrice;
        payload.maxPrice = maxPrice;
        payload.sortByName = sortByName;
        payload.categoryId = categoryId;
        payload.maxResults = maxResults;
        
        payload.keywords = searchQuery;
    
        try {
            const response = await axios.get('https://www.kijiji.ca/b-search.html?' + toQueryString(payload));

            const redirectUrl = response.request.path;

            const $ = cheerio.load(response.data);
            let listingsToReturn = [];

            // Get the total number of results for a query
            const totalResultsRaw = $('span:Contains("Showing"):Contains("results")').text().trim();
            const totalResults = totalResultsRaw.split("of ")[1].split(" results")[0];

            // Total number of pages based on the number of results
            const totalPages = Math.ceil(Number(totalResults) / 40);

            listingsToReturn = await pullListingsFromPage($);
            console.log("About to return " + listingsToReturn.length + " listings")

            // DEBUGGING
            return {listings: totalResults, pages: totalPages, result: listingsToReturn}
            // DEBUGGING

            if(maxResults && listingsToReturn.length >= maxResults) {
                listingsToReturn = listingsToReturn.slice(0, maxResults);
                return {listings: totalResults, pages: totalPages, result: listingsToReturn}
            }

            // Getting results from next pages if there are any
            if (totalPages <= 1) {
                return {listings: totalResults, pages: totalPages, result: listingsToReturn};
            }

            for (let i = 2; i <= totalPages; i++) {
                console.log('Getting page ' + i + ' of ' + totalPages + '...')
                const newPagePath = [
                    ...redirectUrl.split('/').slice(0, 3),
                    `page-${i}`,
                    ...redirectUrl.split('/').slice(3)
                ].join('/');
                
                const res = await axios.get(`https://www.kijiji.ca${newPagePath}}`)


                const $ = cheerio.load(res.data);
                listingsToReturn.push(...await pullListingsFromPage($));

                if(listingsToReturn.length >= maxResults && maxResults != -1) {
                    listingsToReturn = listingsToReturn.slice(0, maxResults);
                    return {listings: totalResults, pages: totalPages, result: listingsToReturn}
                }

            }
    
            return {listings: totalResults, pages: totalPages, result: listingsToReturn};
        } catch(err) {
            console.log(err.message)
            console.log(err)
        }
    }
    
    newPost = async (title, description, price, location, categoryId, images = []) => { 
        
    };
}



async function pullListingsFromPage($) {
        let listingsToReturn = [];
        $('li[data-testid]').map((i, el) => {
            if($(el).attr('data-testid') != "shopping-ads-carousel") {
                
                const newListing = {};
                newListing.title = $(el).find('h3[data-testid="listing-title"]').text().trim();
                newListing.price = $(el).find('p[data-testid="listing-price"]').text().trim();
                newListing.url = "https://kijiji.ca" + $(el).find('a[data-testid="listing-link"]').attr('href');
                newListing.distance = $(el).find('p[data-testid="listing-proximity"]').text().trim();
                newListing.location = $(el).find('p[data-testid="listing-location"]').first().text().trim();
                // newListing.datePosted = $(el).find('p[data-testid="listing-date"]').text().trim();
                newListing.description = $(el).find('p[data-testid="listing-description"]').text().trim();
        
                listingsToReturn.push(newListing);
            }
        });

        listingsToReturn = listingsToReturn.filter(listing => listing.title != "")

        console.log(listingsToReturn.length + " listings before filter")
    
        return listingsToReturn;
    

}