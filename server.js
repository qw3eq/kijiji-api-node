import express from 'express';
import Kijiji from './api.js';
const app = express();

const PORT = process.env.PORT || 3000;
const kijiji = new Kijiji();

app.use((req, res, next) => {
    console.log('Request Type:', req.method)
    console.log('Request URL:', req.originalUrl)
    next()
})


app.get('/', (req, res) => {
    res.send('Hello World')
})

app.get('/api/listings', async (req, res) => {
    try {
    const searchKeywords = req.query.search;

    if(!searchKeywords) {
        res.status(400).send('Please provide a search query')
        return;
    }

    // Optionals
    const {location, maxResults, radius} = req.query;

    let result = await kijiji.search(searchKeywords, {location: location, maxResults: maxResults, radius: radius})
    console.log(result.totalResults)
    res.send(result);
    } catch(err) {
        console.log(err)
        res.status(500).send(err.message)
    }
})




app.listen(PORT, () => console.log(`Server running on port ${PORT}`));