function displayDropDownCinema() {
    const path = '/cinemas/'
    ajaxHttpRequest('GET', path, null, (err, cinemas) => {
        if (err) alert(err)
        let dropDownList = document.getElementById('dropDownListCinema')
        const element = document.createElement('div')
        element.setAttribute('id', 'cinemaDropdown')
        element.className = 'dropdown-content text-center'
        cinemas.forEach(cinema => {
            let a = document.createElement('a')
            a.innerHTML = `<a class=" btn  mx-4 " href="/cinemas/${cinema.name}" role="button">
                                ${cinema.name}
                            </a>`
            element.appendChild(a)
        })
        dropDownList.appendChild(element)
        document.getElementById('dropButtonCinema').innerText = 'Choose Cinema'
        document.getElementById('cinemaDropdown').classList.toggle('show')
    })
}

function manageUpdateCinemaPopUp(cinemaName) {
    if (document.getElementById('editCinemaPopUp') !== null) {
        removeUpdateCinemaPopUp()
    }
    else {
        const div = document.createElement('div')
        div.setAttribute('id', 'editCinemaPopUp')
        div.innerHTML = `<input class="form-control" id="inputCinemaName" name="name" placeholder="Name" type="text" required>
                    <input class="form-control" id="inputCinemaCity" name="city" placeholder="City" type="text" required>
                    <button class="btn btn-success" id="cinemaSubmit" onclick="editCinema('${cinemaName}')"> Submit </button>`
        const divEditCinema = document.getElementById('editCinema')
        divEditCinema.appendChild(div)
    }
}

function removeUpdateCinemaPopUp() {
    const editDiv = document.getElementById('editCinema')
    const editPopUp = document.getElementById('editCinemaPopUp')
    editDiv.removeChild(editPopUp)
}

function editCinema(cinemaName) {
    const path = `/cinemas/${cinemaName}/updateCinema`
    const inputCinemaName = document.getElementById('inputCinemaName')
    const inputCinemaCity = document.getElementById('inputCinemaCity')

    let data = `name=${inputCinemaName.value}&city=${inputCinemaCity.value}`

    ajaxHttpRequest('PUT', path, data, (err, cinema) => {
        if (err) return updatingCinemaPanel(err)
        removeUpdateCinemaPopUp()
        changeNameInPage(cinema.name)
    })
}

function changeNameInPage(cinemaName) {
    const divExhibitionText = document.getElementById('exhibitionText')
    divExhibitionText.innerHTML = `In Exhibition At ${cinemaName}`
    const divRoomsInCinema = document.getElementById('roomsInCinema')
    divRoomsInCinema.innerHTML = `Rooms At Cinema ${cinemaName}`
}

function updatingCinemaPanel(err) {
    let parent = document.getElementById('editCinemaPopUp')
    let panel = document.createElement('div')
    panel.setAttribute('id', 'errorPanel')
    panel.innerHTML = `<h1>${err.message}</h1>`
    parent.appendChild(panel)
    document.getElementById('inputCinemaName').value = ''
    document.getElementById('inputCinemaCity').value = ''
}