import echoRouter from './routes/echo.routes.js'
import settings from './settings.json' assert { type: "json" }


import {bot} from './modules/telegram.js'
import { dateTimeToLocale } from "./modules/common.js";
import express from 'express'
import dotenv from "dotenv"
import https from 'https'
import http from 'http'
import fs from 'fs'
import fetch from "node-fetch"
dotenv.config()
//  *****************************************************

const intervalSeconds = 10
const optionsServer = { key: fs.readFileSync('../cert/key.pem'), cert: fs.readFileSync('../cert/cert.pem') };
const PORT = process.env.PORT || 3000
const app = express()
app.use(express.json())
app.use(process.env.API_ECHO_PATH,   echoRouter)

let server = http.createServer(app);
server.listen(PORT, (req,res) => console.log(`сервер работает на порту ${PORT}`))

//app.get('/', function callback(req,res)
//{
//res.status(200).json('ok')
//
//})

const checkEcho = async(serverslist) => {

    for (const element of serverslist) {

        if (element.active) {

            console.log(`Checking ${element.address}`)

            let response = undefined
            let status = 0
            try {
                response = await fetch(
                element.address,
                {
                    method: "GET",
                    port: element.port,
                    headers: {
                    "Content-Type": "application/json",
                    },
                }
                );

                status = response.status
             } catch (err) {
                console.log(err.message);
                console.log(element.address + ' ' + element.port)
             }
            

            const hoursPassedSinceLasteActive = ((new Date() - element.datetime) / 3600 / 1000).toFixed(2)  

            if (status === 200) {

                element.datetime = new Date()

            }

            else {

                console.log(`${element.address}, status ${status}, hoursPassedSinceLasteActive ${hoursPassedSinceLasteActive}`)

                if (hoursPassedSinceLasteActive > 0.3) {
                     const errorMessage = `Warning! Server ${element.name} ${element.address} is inactive for ${hoursPassedSinceLasteActive} hour!`
                     console.log(errorMessage)
                     
                     const usersArray = process.env.TG_USER.split(',')
                     usersArray.forEach(el => bot.sendMessage(el.trim(), errorMessage))
       
                     
                }
            }

        }

    };

}

const serverslist = settings.serverslist
console.log(serverslist)
serverslist.forEach( (element) => {
    element.datetime = new Date()
}
)
setInterval(function() { checkEcho(serverslist) }, 60 * 1000);
