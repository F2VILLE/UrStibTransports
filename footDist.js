require("dotenv").config()

// const distance = require('google-distance-matrix');
const axios = require("axios").default
const BASE_URL = "https://data.stib-mivb.brussels/api/explore/v2.1/"
const {Client} = require("@googlemaps/google-maps-services-js");
const mapclient = new Client({})
const stopid = 3559

let origins = ['50.8122546,4.3822596'];
let destinations = [];

axios.get(`${BASE_URL}catalog/datasets/stop-details-production/records?where=id%20%3D%20${stopid}&limit=20`, {
    headers: {
        "Authorization": `Apikey ${process.env.API_KEY}`
    }
}).then(r => {
    destinations.push(Object.values(JSON.parse(r.data.results[0].gpscoordinates)).join(","))
    console.log(`${JSON.parse(r.data.results[0].name)["fr"]} : ${destinations[0]}`)
}).catch(console.error)

 
