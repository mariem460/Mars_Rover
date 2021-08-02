require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls
app.get('/rovers', async (req, res) => {
    try {
        let manifest = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${req.query.name}?api_key=${process.env.API_KEY}`)
            .then(res => res.json())

        let maxDate = manifest.photo_manifest.max_date;

        let photosContainer = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${req.query.name}/photos?earth_date=${maxDate}&api_key=${process.env.API_KEY}`)
            .then(res => res.json())

        let rover = Object.assign({}, manifest.photo_manifest, {photos : undefined}, {recentPhotos: photosContainer.photos})

        res.send(rover)   
    } catch (err) {
        console.log('error:', err);
    }
})


// example API call
app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))