function manageUpdateRoomPopUp(cinemaName, roomName) {
    if (document.getElementById(`updateRoomPopUp${roomName}`) !== null) {
        removeUpdateRoomPopUp(roomName)
    }
    else {
        const div = document.createElement('div')
        div.setAttribute('id', `updateRoomPopUp${roomName}`)
        div.innerHTML = `<input class="form-control mt-2" id="updateRoomName${roomName}" name="name" placeholder="Name" type="text" required>
                    <input class="form-control mt-2" id="updateRows${roomName}" name="rows" placeholder="Rows" type="number" required>
                    <input class="form-control mt-2" id="updateSeatsPerRow${roomName}" name="SeatsPerRow" placeholder="SeatsPerRow" type="number" required>
                    <button class="btn btn-success mt-2" id="roomSubmit${roomName}" onclick="updateRoom('${cinemaName}','${roomName}')" type="submit"> Submit </button>`
        const divUpdateRoom = document.getElementById(`updateRoom${roomName}`)
        divUpdateRoom.appendChild(div)
    }
}

function removeUpdateRoomPopUp(roomName) {
    const editDiv = document.getElementById(`updateRoom${roomName}`)
    const editPopUp = document.getElementById(`updateRoomPopUp${roomName}`)
    editDiv.removeChild(editPopUp)
}

function updateRoom(cinemaName, roomName) {
    const path = `${cinemaName}/updateRoom/${roomName}`
    const updateRoomName = document.getElementById(`updateRoomName${roomName}`)
    const updateRows = document.getElementById(`updateRows${roomName}`)
    const updateSeatsPerRow = document.getElementById(`updateSeatsPerRow${roomName}`)

    let data = `name=${updateRoomName.value}&rows=${updateRows.value}&seatsPerRow=${updateSeatsPerRow.value}`

    ajaxHttpRequest('PUT', path, data, (err) => {
        if (err) return alert(err.message)
        document.getElementById(`name${roomName}`).innerHTML = `<strong> Name: </strong> ${updateRoomName.value}`
        document.getElementById(`rows${roomName}`).innerHTML = `<strong> Rows: </strong> ${updateRows.value}`
        document.getElementById(`seats${roomName}`).innerHTML = `<strong> Seats Per Row: </strong> ${updateSeatsPerRow.value}`

        removeUpdateRoomPopUp(roomName)
    })
}

function deleteRoom(cinemaName, roomName) {
    const path = `/cinemas/${cinemaName}/deleteRoom/${roomName}`
    ajaxHttpRequest('DELETE', path, null, (err, room) => {
        if (err) alert(err)
        removeRoomCard(room)
    })
}

function removeRoomCard(room) {
    const div = document.getElementById('roomList')
    const divRoom = div.getElementsByClassName('col-3 mb-2 mt-3')[0]
    const cardToRemove = document.getElementById(`rowCard${room.name}`)
    divRoom.removeChild(cardToRemove)
}
