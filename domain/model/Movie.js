module.exports = Movie

function Movie(id, title, releaseDate, duration, poster) {
    this.id = id
    this.title = title
    this.releaseDate = releaseDate
    this.duration = duration
    this.poster = poster
}