
function ajaxHttpRequest(method, path, data, cb) {
    const xhr = new XMLHttpRequest()
    xhr.open(method, path, true)

    //Send the proper header information along with the request
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xhr.setRequestHeader('Accept', 'application/json')

    xhr.onreadystatechange = function () {//Call a function when the state changes.
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                let json = JSON.parse(xhr.responseText)
                cb(null, json)
            }
            else
                cb(new Error(xhr.status + ': ' + xhr.responseText), null)
        }
    }
    xhr.send(data)
}
