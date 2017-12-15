// just testing :D webworkers
fetch('/getsalt', {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Cache': 'no-cache'
    },
    credentials: 'same-origin',
    body: JSON.stringify({
      username: 'admin'
    })
  })
  .then((res) => res.json())
  .then((jsondata) => {
    console.log(jsondata)
  })
