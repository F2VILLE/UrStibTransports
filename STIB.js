require("dotenv").config()

const axios = require("axios").default

class STIB {
    constructor(apiKey) {
        this.BASE_URL = "https://data.stib-mivb.brussels/api/explore/v2.1"
        this.API_KEY = apiKey
    }

    async getWaitingTime(stopId) {
        const stops = []
        return new Promise(async (resolve, reject) => {
            if(typeof stopId == "string") {
                stops.push(stopId)
            }
            else if (typeof stopId == "object") {
                stopId.forEach(stop => {
                    stops.push(stop)
                });
            }
            else {
                return reject("stopId must be an array or a string")
            }
            const filter = stops.map(x => "pointid%20%3D%20" + x).join("%20OR%20")
            axios.get(`${this.BASE_URL}/catalog/datasets/waiting-time-rt-production/records?where=${filter}`, {
                headers: {
                    "Authorization": `Apikey ${this.API_KEY}`
                }
            }).then(r => {
                resolve(r.data)
            }).catch(reject)
        })
    }

    async getLineDetails(lineId) {
        return new Promise(async (resolve, reject) => {
            axios.get(`${this.BASE_URL}/catalog/datasets/gtfs-routes-production/records?where=route_short_name%20%3D%20${lineId}`, {
                headers: {
                    "Authorization": `Apikey ${this.API_KEY}`
                }
            }).then(r => {
                resolve(r.data)
            }).catch(reject)
        })
    }


}

module.exports = STIB