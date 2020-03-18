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

// Function to get recent pic date and get photos for that date
app.post('/apod', async (req, res) => {
    try {
        const date_data = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${req.body.rover}/photos?sol=1&api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        const max_date = date_data.photos[0].rover.max_date
        const data = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${req.body.rover}/photos?earth_date=${max_date}&api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        
        const roverInfo = data.photos[0].rover
        let photos = []
        data.photos.forEach(photoObject => {
            const photoItem = {
                url: photoObject.img_src,
                sol: photoObject.sol,
                camera: photoObject.camera.full_name
            }
            photos.push(photoItem)
        })
        res.send({
            rover: roverInfo,
            photos: photos
        })
    } catch (err) {
        res.sendStatus(400)
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))