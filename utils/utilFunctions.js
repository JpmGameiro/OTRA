module.exports = {
    generateDate,
    editSessionFields,
    checkIfcanAdd,
    presentDate,
    populateSessionWithInitAndEndTime,
    optionsBuilder
}

function presentDate(date) {
    const toPresent = parseDate(date)
    const hourParsed = parseInt(toPresent.hour) + 1
    const hour =  hourParsed < 10 ? '0' + hourParsed : hourParsed
    const day = `${toPresent.day}-${toPresent.month + 1}-${toPresent.year}`
    const time = `${hour}:${toPresent.minute}`
    return {day: day, time: time}
}

function parseDate(date) {
    let time = date.split('T')
    let year = time[0].split('-')[0]
    let month = (time[0].split('-')[1]) - 1
    let day = time[0].split('-')[2]
    let hour = time[1].split(':')[0]
    let minute = time[1].split(':')[1]
    return {year, month, day, hour, minute}
}

function generateDate(date) {
    const obj = parseDate(date)
    return new Date(obj.year, obj.month, obj.day, obj.hour, obj.minute)
}

function editSessionFields(session, sessionNewParams) {
    const date = generateDate(sessionNewParams.date)
    session.cinemaName = sessionNewParams.cinemaName ? sessionNewParams.cinemaName : session.cinemaName
    session.roomName = sessionNewParams.roomName ? sessionNewParams.roomName : session.roomName
    session.date = sessionNewParams.date ? date : session.date
    return session
}

function checkIfcanAdd(sessionToAdd, actualSession) {
    return ((actualSession.initTime < sessionToAdd.endTime && sessionToAdd.initTime > actualSession.endTime) ||
        (actualSession.initTime > sessionToAdd.endTime && sessionToAdd.initTime < actualSession.endTime))
}

function populateSessionWithInitAndEndTime(session, movie) {
    let initHour = session.date.getHours() //hora de inicio
    let initMinutes = session.date.getMinutes() // minutos de inicio
    initMinutes = initMinutes < 9 ? '0' + initMinutes : initMinutes
    session.initTime = initHour + ':' + initMinutes
    let hoursFromSessionTime = Math.trunc(movie.duration / 60) // horas de filme
    let minutesFromSessionTime = movie.duration % 60 // minutos de filme
    let finalMinutes = (initMinutes + parseInt(minutesFromSessionTime)) % 60 // minutos de fim de filme
    finalMinutes = finalMinutes < 9 ? '0' + finalMinutes : finalMinutes
    let finalHours = finalMinutes > 59 ? (initHour + parseInt(hoursFromSessionTime) + 1) : (initHour + parseInt(hoursFromSessionTime)) // horas de fim de filme
    finalHours = finalHours < 9 ? '0' + finalHours : finalHours
    session.endTime = finalHours + ':' + finalMinutes
    return session
}

/**
 * Generic options object to provide to an http request, containing its method, uri and request body
 * The parameters must be provided in the following order: URI, METHOD, BODY.
 * Only URI is obligatory, the rest can be omitted.
 *
 * By default, the object returned is:
 * { method: 'GET', json: true, uri: @param uri }
 * @returns {Object} json object containing info for an HTTP Request
 */
function optionsBuilder() {
    const argNames = ['uri', 'method', 'body']
    let res = {
        method: 'GET',
        json: true
    }
    for (let i = 0; i < arguments.length; ++i)
        res[argNames[i]] = arguments[i]
    return res
}