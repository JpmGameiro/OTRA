module.exports = Session

function Session(movieId, date, cinemaName, roomName, seatsAvailable, totalSeats, busyPlaces, id) {
    this.movieId = movieId
    this.date = date
    this.cinemaName = cinemaName
    this.roomName = roomName
    this.seatsAvailable = seatsAvailable
    this.totalSeats = totalSeats
    this.busyPlaces = busyPlaces
    this.id = id
}