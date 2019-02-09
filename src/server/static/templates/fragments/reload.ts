(() => {
  
  type Signal = | 'connecting' | 'established' | 'reload' | 'ping'

  /** (async-recursive) Maintains a connection to the signal endpoint. */
  function connect(endpoint: string, func: (signal: Signal) => void) {
    let offset = 0
    const request = new XMLHttpRequest()
    request.open('GET', endpoint, true)
    request.send()
    request.addEventListener('readystatechange', () => {
      if (request.readyState === 3) {
        const signal = request.response.slice(offset)
        offset += signal.length
        func(signal)
      }
      if (request.readyState === 4) {
        setTimeout(() => connect(endpoint, func), 4000)
        func('connecting')
      }
    })
  }

  /** Connects to the signal endpoint and responds to signal events. */
  let established = 0
  connect('/smoke/signal', signal => {
    if(signal === 'established') {
      established += 1
    }
    if(signal === 'reload' || established > 1) {
      window.location.reload()
    }
    if(signal !== 'ping') {
      const style   = 'color: #999'
      const message = `smoke-web: ${signal}`
      console.log(`%c${message}`, style);
    }
  })
})()