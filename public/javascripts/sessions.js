function showButtonToBuyTicket(personId, sessionId) {
    const divToAddButton = document.getElementById("divToAddButtonToBuyTicket")
    const button = document.createElement("button")
    button.setAttribute("class", "btn btn-info")
    button.setAttribute("id", "centerElement")
    button.innerHTML = "Buy Ticket"
    button.addEventListener("click", function () {
        buyTicketAndChangeUserIcon(personId, sessionId)
    })
    divToAddButton.appendChild(button)
}

function buyTicketAndChangeUserIcon(personId, sessionId) {
    const path = `/movies/buyTicket/${personId}/${sessionId}`
    ajaxHttpRequest('POST', path, null, (err, session) => {
        if (err) return alert(err)
        changeUserIcon(personId, sessionId)
    })
}

function changeUserIcon(personId, sessionId) {
    const divToRemoveButton = document.getElementById("divToAddButtonToBuyTicket")
    const buttonToRemove = document.getElementById("centerElement")
    divToRemoveButton.removeChild(buttonToRemove)
    const elementToChange = document.getElementById(personId)
    elementToChange.removeChild(elementToChange.childNodes[1])
    const elementToAdd = document.createElement("button")
    elementToAdd.setAttribute("id", "buttonToShowBuyTicketButton")
    elementToAdd.addEventListener("click", function () {
        showButtonToBuyTicket(personId, sessionId)
    })
    elementToAdd.setAttribute("class", "fa fa-user fa-4x")
    elementToAdd.setAttribute("style", "color: #ff3333")
    elementToChange.appendChild(elementToAdd)
}

function updateSession(movieId, sessionId) {
    const errorPanel = document.getElementById('errorPanel')
    if (errorPanel) {
        let parent = document.getElementById('editSessionPopUp')
        parent.removeChild(errorPanel)
    }
    const path = `/movies/${movieId}/updateSession/${sessionId}`
    const cinemaName = document.getElementById('editSessionCinema')
    const date = document.getElementById('editSessionDate')
    const roomName = document.getElementById('editSessionRoom')
    const data = `cinemaName=${cinemaName.value}&date=${date.value}&roomName=${roomName.value}`
    ajaxHttpRequest('PUT', path, data, (err, session) => {
        if (err) return updatingSessionPanel(err)
        removeUpdateSessionPopUp()
        editSessionInTable(session)
    })
}

function editSessionInTable(session) {
    const time = document.getElementById(`time${session._id}`)
    const day = document.getElementById(`day${session._id}`)
    const cinema = document.getElementById(`cinema${session._id}`)
    const room = document.getElementById(`room${session._id}`)

    time.innerHTML = session.date.time
    day.innerHTML = session.date.day
    cinema.innerHTML = session.cinemaName
    room.innerHTML = session.roomName
}

function showEditSessionPopUp(movieId, sessionId) {
    if (document.getElementById('editSessionPopUp') !== null) {
        removeUpdateSessionPopUp()
    }
    else {
        const div = document.createElement('div')
        div.setAttribute('id', 'editSessionPopUp')
        div.innerHTML = `<input class="form-control mb-2" id="editSessionCinema" name="cinemaName" placeholder="Cinema Name" type="text" required>
                        <input class="form-control mb-2" id="editSessionDate" name="date" placeholder="Date" type="datetime-local" required>
                        <input class="form-control mt-2 mb-2" id="editSessionRoom" name="roomName" placeholder="RoomName" type="text" required>
                    <button class="btn btn-success" id="sessionSubmit" onclick="updateSession('${movieId}', '${sessionId}')" type="submit"> Submit </button>`
        const divEditSession = document.getElementById('sessionPopUp')
        divEditSession.appendChild(div)
    }
}

function removeUpdateSessionPopUp() {
    const editDiv = document.getElementById('sessionPopUp')
    const editPopUp = document.getElementById('editSessionPopUp')
    editDiv.removeChild(editPopUp)
}

function removeSession(sessionId, cinemaName, roomName) {
    const path = `/movies/${cinemaName}/${roomName}/deleteSession/${sessionId}`
    ajaxHttpRequest('DELETE', path, null, (err, session) => {
        if (err) alert(err)
        removeSessionFromTable(sessionId)
    })
}

function removeSessionFromTable(sessionId) {
    const list = document.getElementById('sessionsList')
    const body = list.getElementsByTagName('tbody')[0]
    const rowToRemove = document.getElementById(`session${sessionId}`)
    body.removeChild(rowToRemove)
}

function updatingSessionPanel(err) {
    let parent = document.getElementById('editSessionPopUp')
    let panel = document.createElement('div')
    panel.setAttribute('id', 'errorPanel')
    panel.innerHTML = `<h1>${err.message}</h1>`
    parent.appendChild(panel)
    document.getElementById('editSessionCinema').value = ''
    document.getElementById('editSessionDate').value = ''
    document.getElementById('editSessionRoom').value = ''
}