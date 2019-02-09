(function () {
    function connect(endpoint, func) {
        var offset = 0;
        var request = new XMLHttpRequest();
        request.open('GET', endpoint, true);
        request.send();
        request.addEventListener('readystatechange', function () {
            if (request.readyState === 3) {
                var signal = request.response.slice(offset);
                offset += signal.length;
                func(signal);
            }
            if (request.readyState === 4) {
                setTimeout(function () { return connect(endpoint, func); }, 4000);
                func('connecting');
            }
        });
    }
    var established = 0;
    connect('/smoke/signal', function (signal) {
        if (signal === 'established') {
            established += 1;
        }
        if (signal === 'reload' || established > 1) {
            window.location.reload();
        }
        if (signal !== 'ping') {
            var style = 'color: #999';
            var message = "smoke-web: " + signal;
            console.log("%c" + message, style);
        }
    });
})();
