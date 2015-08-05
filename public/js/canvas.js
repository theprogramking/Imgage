var body, canvas, ctx, socket, coords, last_coords, touchdown, input, clear, remove, download, link;

$(document).ready(function() {
    setup_canvas();
    if (localStorage.temp) {
        happyFace(localStorage.temp);
    } else {
        happyFace();
    }
    setup_socket();
    setup_ios();

});

function setup_socket() {
    socket = io.connect();

    socket.on('online', function(message) {
        receive_online_status(message);
    });

    socket.on('c', function(message) {
        receive_coordinates(message);
    });

    receive_coordinates = function(message) {
        coords = message.c;

        for (var i = 0; i < coords.length; i++) {
            current_socket_coords = {
                x: coords[i].current.x,
                y: coords[i].current.y,
            };

            last_socket_coords = {
                x: coords[i].last.x,
                y: coords[i].last.y,
            };

            ctx.beginPath();
            ctx.moveTo(last_socket_coords.x, last_socket_coords.y);
            ctx.lineTo(current_socket_coords.x, current_socket_coords.y);
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.closePath();
        }
    };

    receive_online_status = function(message) {
        if (message.online == 1) {
            $('.listening').html("Nobody else is here. Give it a minute or two, someone might arrive.");
        } else {
            $('.listening').html(message.online + " people are drawing.");
        }
    };
};

function setup_ios() {
    // Hide the toolbar in iOS

}

function setup_canvas() {
    body = document.querySelector("body");
    
    canvas = document.querySelector('canvas');
    input = document.getElementById('url');
    close = document.getElementById('close');
    clear = document.getElementById('clear');
    download = document.getElementById('download');
    link = document.querySelector('a');
    ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;

    // iOS
    canvas.ontouchmove = function(e) {
        coords = [];

        for (var i = 0; i < e.targetTouches.length; i++) {
            var current_coords = {
                x: e.targetTouches[i].clientX,
                y: e.targetTouches[i].clientY
            };

            if (!last_coords) {
                var last_coords_for_index = []
            } else {
                var last_coords_for_index = {
                    x: last_coords[i].x,
                    y: last_coords[i].y
                }
            }

            coords.push({
                current: current_coords,
                last: last_coords_for_index
            });
        }

        move(coords);

        last_coords = [];
        for (var i = 0; i < coords.length; i++) {
            last_coords.push(coords[i].current);
        }
    };

    canvas.ontouchend = function(e) {
        last_coords = null;
    };

    // Typical draw event for desktop 
    canvas.onmousemove = function(e) {

        if (touchdown) {
            if (!last_coords) {
                last_coords = [];
            }

            var current_coords = {
                x: e.clientX - e.target.offsetLeft + window.scrollX,
                y: e.clientY - e.target.offsetTop + window.scrollY
            }

            coords = [{
                current: current_coords,
                last: last_coords
            }];

            //$('.debug').html('coords: ' + current_coords.x + " " + current_coords.y );

            move(coords);

            last_coords = current_coords;
        }
    };

    canvas.onmouseup = function(e) {
        last_coords = null;
        //$('.debug').html('');
    };

    body.onmouseup = function(e) {
        touchdown = false;
        last_coords = null;
    };

    body.onmousedown = function(e) {
        touchdown = true;
    };

    close.onmousedown = function() {
        var sure = confirm("Forget this ever happened?");
        if (sure === true) {
            happyFace("black");
        }
    };

    clear.onmousedown = function() {
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        happyFace(localStorage.temp);
    };
    
    function downloadCanvas(link, canvasId, filename){
        link.href = document.getElementById(canvasId).toDataURL();
        link.download = filename;
    }
    
    link.onmousedown = function(){
        downloadCanvas(this, 'canvas', 'Drawing.png');
    };

    document.onkeypress = function(e) {
        if (e.keyCode == 32) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            happyFace(localStorage.temp);
        } else if (e.keyCode == 13) {
            happyFace(input.value);
            input.value = "";
        } else {
            console.log("That key does not do anything.");
        }
    };

}

function drawLine(color, coords, last_coords) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    if (last_coords.x) {
        ctx.lineTo(last_coords.x, last_coords.y);
    }
    ctx.closePath();
    ctx.stroke();
}

function drawCircle(color, coords) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.arc(coords.x, coords.y, 3, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

function send(coords) {
    socket.emit('c', coords);
}

function move(coords) {
    for (var i = 0; i < coords.length; i++) {
        var current_coords = {
            x: coords[i].current.x,
            y: coords[i].current.y,
        };

        var last_coords = {
            x: coords[i].last.x,
            y: coords[i].last.y,
        };

        ctx.beginPath();
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.moveTo(last_coords.x, last_coords.y);
        ctx.lineTo(current_coords.x, current_coords.y);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.closePath();
    }

    send(coords);
}

function happyFace(url) {
    if (url == "black") {
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        localStorage.temp = "black";
    } else {
        localStorage.setItem('temp', url);
        img = new Image();
        img.src = url;
        img.onload = function() {
            ctx.drawImage(img, 0, 0, img.width, img.height, // source rectangle
                0, 0, canvas.width, canvas.height)
        }
    }
}