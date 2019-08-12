module.exports = function () {

    let cinemas = []

    function getAllCinemas() {
        return cinemas
    }

    function getCinemaByName(name) {
        console.log('Getting cinema by name...')
        return cinemas.find(cinema => cinema.name === name)
    }

    function getAllSessions() {
        const sessions = []
        cinemas.forEach(cinema => {
            cinema.rooms.forEach(room => {
                room.sessions.forEach(session => {
                    sessions.push(session)
                })
            })
        })
        return sessions
    }

    function getAllRoomsFromCinema(cinemaName) {
        const cinema = getCinemaByName(cinemaName)
        if (cinema !== undefined) return cinema.rooms
    }

    function getAllRooms() {
        const rooms = []
        cinemas.forEach(cinema => {
            cinema.rooms.forEach(room => {
                rooms.push(room)
            })
        })
        return rooms
    }

    function saveCinema(cinema) {
        console.log('Saving cinema...')
        cinemas.push(cinema)
    }

    function saveRoom(room, cinemaName) {
        console.log('Saving Room...')
        let cinemaToAddIndex = cinemas.findIndex(elem => elem.name === cinemaName)
        cinemas[cinemaToAddIndex].rooms.push(room)
    }

    function updateCinema(name,body) {
        console.log('Updating cinema...')
        let index = cinemas.findIndex(cinema => cinema.name === name)
        cinemas[index].name = body.name
        cinemas[index].city = body.city
        cinemas[index].rooms.forEach(room => {
            room.cinemaName = body.name
            room.sessions.map(session => session.cinemaName = body.name)
        })
        return cinemas[index]
    }

    function createSession(session, roomToAddSession) {
        console.log('Saving session...')
        let cinemaIndex = cinemas.findIndex(cinema => cinema.name === session.cinemaName)
        let roomIndex = cinemas[cinemaIndex].rooms.findIndex(room => room.name === roomToAddSession.name)
        cinemas[cinemaIndex].rooms[roomIndex].sessions.push(session)
        return session

    }

    function updateRoom(cinemaName, roomName, body) {
        console.log('Updating room...')
        let cinemaIndex = cinemas.findIndex(cinema => cinema.name === cinemaName)
        let roomIndex = cinemas[cinemaIndex].rooms.findIndex(room => room.name === roomName)
        cinemas[cinemaIndex].rooms[roomIndex].name = body.name
        cinemas[cinemaIndex].rooms[roomIndex].seatsPerRow = body.seatsPerRow
        cinemas[cinemaIndex].rooms[roomIndex].rows = body.rows
        cinemas[cinemaIndex].rooms[roomIndex].sessions.forEach(session => session.roomName = body.name)
        return cinemas[cinemaIndex].rooms[roomIndex]
    }

    function removeSessionFromRoom(cinemaName, roomIndex, session, sessionIndex) {
        let cinemaIndex = cinemas.findIndex(cinema => cinema.name === cinemaName)
        cinemas[cinemaIndex].rooms[roomIndex].sessions.splice(sessionIndex, 1)
        return session
    }

    function resetCinemas() {
        cinemas = []
    }

    return {
        saveCinema,
        saveRoom,
        getAllCinemas,
        getCinemaByName,
        updateCinema,
        createSession,
        getAllSessions,
        updateRoom,
        getAllRoomsFromCinema,
        getAllRooms,
        removeSessionFromRoom,
        resetCinemas
    }
}
