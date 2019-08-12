window.onclick = function (event) {
    if (!event.target.matches('#dropButtonMovie') && !event.target.matches('#dropButtonCinema') ) {
        let dropdowns = document.getElementsByClassName('dropdown-content')
        let i
        for (i = 0; i < dropdowns.length; i++) {
            let openDropdown = dropdowns[i]
            if (openDropdown.classList.contains('show'))
                openDropdown.classList.remove('show')
        }
    }
}

function displayDropDownMovie() {
    const path = '/movies/'
    ajaxHttpRequest('GET', path, null, (err, movies) => {
        if (err) alert(err)
        let dropDownList = document.getElementById('dropDownListMovie')
        const element = document.createElement('div')
        element.setAttribute('id', 'movieDropdown')
        element.className = 'dropdown-content text-center'
        movies.forEach(movie => {
            let a = document.createElement('a')
            a.innerHTML = `<a class=" btn  mx-4 " href="/movies/${movie.id}/details" role="button">
                                ${movie.title}
                            </a>`
            element.appendChild(a)
        })
        dropDownList.appendChild(element)
        document.getElementById('dropButtonMovie').innerText = 'Choose Movie'
        document.getElementById('movieDropdown').classList.toggle('show')
    })
}