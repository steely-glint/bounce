
var configuration = {"iceServers": [
        {url: "stun:stun.l.google.com:19302"}//,
    ]};
var pc;
var socket;

function init() {

    if (typeof webkitRTCPeerConnection == "function") {
        pc = new webkitRTCPeerConnection(configuration, null);
    } else if (typeof mozRTCPeerConnection == "function") {
        pc = mozRTCPeerConnection(configuration, null);
    }

    // send any ice candidates to the other peer
    pc.onicecandidate = function(evt) {
        if (evt.candidate === null) {
            var sdpObj = Phono.sdp.parseSDP(pc.localDescription.sdp);
            var sdpcontext = {"type": pc.localDescription.type, "sdp": sdpObj};
            if (socket === null) {
                console.log("no send mechanism set up")
            } else {
                socket.send(JSON.stringify(sdpcontext));
            }
        } else {
            console.log("ignoring local trickling candidates for now")
        }
    };

    // let the "negotiationneeded" event trigger offer generation
    pc.onnegotiationneeded = function() {
        var sdpConstraints = {'mandatory': {'OfferToReceiveAudio': false, 'OfferToReceiveVideo': false}}
        pc.createOffer(localDescCreated, logError, sdpConstraints);
    }

    //if (isInitiator) {
    // create data channel and setup chat
    return pc;

}

function localDescCreated(desc) {
    pc.setLocalDescription(desc, function() {
        console.log("Set Local description");
    }, logError);
}

function onAnswer(data) {
    if (data.session) {
        var sdp = Phono.sdp.buildSDP(data);
        console.log("answer sdp is " + sdp);
        var message = {'sdp': sdp, 'type': 'answer'};
        var rtcd = new RTCSessionDescription(message);
        console.log("rtcd is " + rtcd);

        pc.setRemoteDescription(rtcd, function() {
            // if we received an offer, we need to answer
            if (pc.remoteDescription.type == "offer")
                pc.createAnswer(localDescCreated, logError);
        }, logError);
    } else {
        console.log("no session in my data");
    }

}





function logError(error) {
    console.log(error.name + ": " + error.message);
}

function setupOutbound(channel) {
    channel.onopen = function() {
        console.log("Outbound channel ");
    };

    channel.onmessage = function(evt) {
        console.log("!?!? got dc message on outbound " + evt.data);
    };

    channel.onclose = function(e) {
        console.log("got dc close on outbound");

    };
    channel.onerror = function(e) {
        console.log("got dc error on outbound");

    };

}

window.onload = function() {
    var mypc = init("DCTick");
    socket = new WebSocket("ws://localhost:31735/bounce/bounce");
    socket.onmessage = function(event) {
        var act = JSON.parse(event.data);
        if (act.type === "idle") {
            console.log("creating channel");


            var dcChannel = mypc.createDataChannel("control", {});
            setupOutbound(dcChannel);

        }
        if (act.type === "answer") {
            onAnswer(act);
        }

    };

};