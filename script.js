const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startCallButton = document.getElementById('startCall');
const endCallButton = document.getElementById('endCall');

let localStream;
let peerConnection;
let roomId;

// Set up socket connection
const socket = io('https://videocalling-liart.vercel.app');


// Parse the URL parameters to extract the room ID
const queryParams = new URLSearchParams(window.location.search);
roomId = queryParams.get('room');

if (roomId) {
    startCallButton.disabled = true;
    endCallButton.disabled = false;

    socket.emit('join', roomId);

    // Automatically start the call for the user who receives the link
    startCall();
}

startCallButton.addEventListener('click', () => {
    startCallButton.disabled = true;
    endCallButton.disabled = false;

    if (!roomId) {
        roomId = generateUniqueId();
        localStorage.setItem('roomId', roomId);

        const roomLink = `${window.location.origin}/?room=${roomId}`;
        alert(`Share this link with others: ${roomLink}`);

        socket.emit('join', roomId);
    }

    startCall();
});

endCallButton.addEventListener('click', () => {
    startCallButton.disabled = false;
    endCallButton.disabled = true;

    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }

    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
        remoteVideo.srcObject = null;
    }
});

socket.on('offer', async offer => {
    try {
        // Create an answer and set local description
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        // Send the answer to the other participant
        socket.emit('answer', { answer, roomId });
    } catch (error) {
        console.error('Error creating answer:', error);
    }
});

socket.on('answer', async answer => {
    try {
        // Set the remote description with the received answer
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
        console.error('Error setting remote description:', error);
    }
});

socket.on('ice-candidate', async candidate => {
    try {
        // Add the received ICE candidate to the peer connection
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
        console.error('Error adding ICE candidate:', error);
    }
});

function startCall() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            localStream = stream;
            localVideo.srcObject = stream;

            // Create RTCPeerConnection and set local stream
            peerConnection = new RTCPeerConnection();
            localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

            // Handle ICE candidate events
            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    socket.emit('ice-candidate', { candidate: event.candidate, roomId });
                }
            };

            // Handle remote track events
            peerConnection.ontrack = event => {
                if (event.streams && event.streams[0]) {
                    remoteVideo.srcObject = event.streams[0];
                }
            };

            // Create an offer and set local description
            peerConnection.createOffer()
                .then(offer => peerConnection.setLocalDescription(offer))
                .then(() => {
                    // Send the offer to the other participant
                    socket.emit('offer', { offer, roomId });
                })
                .catch(error => {
                    console.error('Error creating offer:', error);
                });
        })
        .catch(error => {
            console.error('Error accessing webcam:', error);
            startCallButton.disabled = false;
            endCallButton.disabled = true;
        });
}

// Replace this function with your own logic to generate unique IDs
function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
}
