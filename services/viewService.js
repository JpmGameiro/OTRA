'use strict'

const path = require('path')

module.exports = configureHandlebars

function configureHandlebars(hbs) {
    hbs.registerPartials(path.join(__dirname, '../views/partials'))


    hbs.registerHelper('showPlacesToBuyTicket', function (rows, seatsPerRow, seatsAvailable, totalSeats, sessionId, busyPlaces) {
        let count = 0, countRows = 0, globalCount = 0, aux = 0
        let finalString = ''
        while (countRows++ < parseInt(rows)) {
            finalString += ('<tr>')
            while (count++ < parseInt(seatsPerRow)) {
                globalCount++
                if (busyPlaces.length > 0) {
                    aux = busyPlaces.find(place => parseInt(place) === globalCount)
                }
                if (aux !== undefined && parseInt(aux) !== 0) {
                    finalString += `<td id=${parseInt(aux)}> <button id="buttonToShowBuyTicketButton" class="fa fa-user fa-4x" style="color: #ff3333"></button>`
                }
                else {
                    finalString += `<td id=${globalCount}> <button id="buttonToShowBuyTicketButton" onclick="showButtonToBuyTicket('${globalCount}', 
                    '${sessionId}')" class="fa fa-user fa-4x" style="color: #198a2e"></button>`

                }
            }
            finalString += ('</tr>')
            count = 0
        }
        return new hbs.SafeString('<table>' + finalString + '</table>')
    })
}