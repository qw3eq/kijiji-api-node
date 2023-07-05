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
        @param {number} options.locationId - The location id
        @param {number} options.minPrice - The minimum price
        @param {number} options.maxPrice - The maximum price
        @param {string} options.sortByName - possible values: dateDesc, priceAsc, priceDesc
        @param {number} options.categoryId - The category id

        @returns {array} - An array of all listings satifying the search query
    */

    search = async (searchQuery, {categoryName = "", brand = "", locationId = 1700276, minPrice = "", maxPrice = "", sortByName = "dateDesc", categoryId = 0} = {}) => {
        const payload = this.defaultPayload;
        payload.categoryName = categoryName;
        payload.brand = brand;
        payload.locationId = locationId;
        payload.minPrice = minPrice;
        payload.maxPrice = maxPrice;
        payload.sortByName = sortByName;
        payload.categoryId = categoryId;
        
        payload.keywords = searchQuery;
    
        try {
            const response = await axios.get('https://www.kijiji.ca/b-search.html?' + toQueryString(payload));
            const $ = cheerio.load(response.data);
            const listingsToReturn = [];

            const totalResultsRaw = $('span:Contains("Showing"):Contains("results")').text().trim();
            const totalResults = totalResultsRaw.split("of ")[1].split(" results")[0];

            $('[data-listing-id]').map((i, el) => {
                const newListing = {};
                newListing.title = $(el).find('div.title').text().trim();
                newListing.price = $(el).find('div.price').text().trim();
                newListing.url = "https://kijiji.ca" + $(el).find('div.title a').attr('href');
                // newListing.distance = $(el).find('div.distance').text().trim();
                newListing.distance = "TBD";
                newListing.location = $(el).find('div.location span').first().text().trim();
                newListing.datePosted = $(el).find('div.location span.date-posted').text().trim();
                newListing.description = $(el).find('div.description').text().trim();

                listingsToReturn.push(newListing);
            });
    
            return {totalResults, listingsToReturn};
        } catch(err) {
            console.log(err.message)
        }
    }
    
    

}




