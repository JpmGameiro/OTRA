module.exports = Room

function Room(name, cinemaName, rows, seatsPerRow, sessions) {
    this.name = name
    this.cinemaName = cinemaName
    this.rows = rows
    this.seatsPerRow = seatsPerRow
    this.sessions = sessions
}