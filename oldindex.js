require("dotenv").config()

const axios = require("axios").default,
    process = require("process")

const BASE_URL = "https://data.stib-mivb.brussels/api/explore/v2.1/"
const stops = [
    3559, 5407, 5462, 3513
]

const displayWidth = 40
let LINES_DETAILS = {}

async function getLineDetails(lineId) {
    return new Promise(async (resolve, reject) => {
        axios.get(`${BASE_URL}catalog/datasets/gtfs-routes-production/records?where=route_short_name%20%3D%20${lineId}&limit=20`, {
            headers: {
                "Authorization": `Apikey ${process.env.API_KEY}`
            }
        }).then(r => {
            resolve(r.data)
        }).catch(reject)
    })
}

function stringRGB(txt, r, g, b) {
    return `\x1b[38;2;${r};${g};${b}m${txt}\x1b[0m`
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

async function getTimeOnLines(stops) {
    const filter = stops.map(x => "pointid%20%3D%20" + x).join("%20OR%20")
    const r = await axios.get(`${BASE_URL}catalog/datasets/waiting-time-rt-production/records?where=${filter}&limit=10`, {
        headers: {
            "Authorization": `Apikey ${process.env.API_KEY}`
        }
    }).catch(console.error)
    if (!r) return
    if (!LINES_DETAILS || Object.keys(LINES_DETAILS).length == 0) {
        for (const line of [... new Set(r.data.results.map(x => x.lineid))]) {
            const dtls = await getLineDetails(line)
            LINES_DETAILS[line] = dtls.results[0]
        }
    }

    console.clear()
    console.log("\n")
    const separChar = "-"
    const headerChar = "|"
    const nameStop = " • Horaires ULB • "
    const time = `[ ${new Date().toLocaleTimeString("fr-BE", {timeZone: "Europe/Brussels"})} ]`
    console.log(".".repeat(displayWidth) + "\n" + ".".repeat(displayWidth / 2 - time.length / 2) + time + ".".repeat(displayWidth / 2 - time.length / 2) + "\n" + ".".repeat(displayWidth))
    console.log(headerChar.repeat(displayWidth / 2 - nameStop.length / 2) + nameStop + headerChar.repeat(displayWidth / 2 - nameStop.length / 2))
    if (r.data.total_count == 0) return console.log(`Aucun transport prévu à cette heure (${Date.now().toLocaleTimeString()})`)
    const firstPassingTimes = JSON.parse(r.data.results[0].passingtimes)[0]
    if (firstPassingTimes.message && !firstPassingTimes.destination) {
        console.log(separChar.repeat(displayWidth) + "\n" + separChar + " ".repeat(displayWidth / 2 - firstPassingTimes.message["fr"].length / 2 - 1) + firstPassingTimes.message["fr"] + " ".repeat(displayWidth / 2 - firstPassingTimes.message["fr"].length / 2 - 1) + separChar + "\n" + separChar.repeat(displayWidth))
    }
    if (firstPassingTimes.destination) {
        console.log(separChar.repeat(displayWidth) + "\n" + r.data.results.sort((a, b) => new Date((JSON.parse(a.passingtimes))[0].expectedArrivalTime) - new Date((JSON.parse(b.passingtimes))[0].expectedArrivalTime)).map((x, i) => {
            const passingTimes = JSON.parse(x.passingtimes)
            const lineRGB = hexToRgb(LINES_DETAILS[x.lineid].route_color)
            return `${" ".repeat(displayWidth > 40 ? (displayWidth)/2 - 20 : 0)}${i == 0 ? ">" : separChar}   ${stringRGB("[ " + (x.lineid + "  ").slice(0, 3) + "]", lineRGB.r, lineRGB.g, lineRGB.b)} - ${(passingTimes[0].destination["fr"] + " ".repeat(20)).slice(0, 15)}:  ${new Date(passingTimes[0].expectedArrivalTime).toLocaleTimeString("fr-BE", {timeZone: "Europe/Brussels"}).slice(0, -3)}   ${i == 0 ? "<" : separChar}`
        }).join("\n" + separChar.repeat(displayWidth) + "\n") + "\n" + separChar.repeat(displayWidth))

    }
}

async function consoleShow() {
    await getTimeOnLines(stops)

    setTimeout(() => {
        consoleShow()
    }, 10000)
}

consoleShow()