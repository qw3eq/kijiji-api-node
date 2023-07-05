const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
// const puppeteer = require('puppeteer');


const options = {
    formSubmit: "true",
    rb: "true",
    adIdRemoved: "",
    adPriceType: "",
    brand: "",
    carproofOnly: "false",
    categoryName: "",
    cpoOnly: "false",
    gpTopAd: "false",
    highlightOnly: "false",
    minPrice:"",
    maxPrice:"",
    origin:"",
    pageNumber:1,
    searchView:"LIST",
    sortByName: "dateDesc",
    userId:"",
    urgentOnly: "false",
    keywords: "gaming+pc",
    categoryId: 0,
    dc:"true"
};

(async () => {
    try {
        const response = await axios.get('https://www.kijiji.ca/b-search.html?' + toQueryString(options));
        const $ = cheerio.load(response.data);
        let listingTitles = [];
        let listings = $('[data-listing-id]').map((i, el) => {
            listingTitles.push($(el).find('div.title').text().trim()) 
        });

        console.log(listingTitles)
    } catch(err) {
        console.log(err.message)
    }


})();

// convert object to query string
function toQueryString(obj) {
    const keyValuePairs = [];
    for (const key in obj) {
        keyValuePairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
    }
    return keyValuePairs.join('&');
}





/*
Request URL: https://www.kijiji.ca/b-search.html?


formSubmit: "true",
rb=true,
adIdRemoved=,
adPriceType=,
brand=,
carproofOnly=false,
categoryName=,
cpoOnly=false,
gpTopAd=false,
highlightOnly=false,
locationId=1700276,
minPrice=,
maxPrice=,
origin=,
pageNumber=1,
searchView=LIST,
sortByName=dateDesc
,userId=,
urgentOnly=false,
keywords=gaming+pc,
categoryId=0,
dc=true

*/
