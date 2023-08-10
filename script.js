const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startCallButton = document.getElementById('startCall');
const endCallButton = document.getElementById('endCall');

let localStream;
let peerConnection;
let roomId;

// Set up socket connection
const socket = io();

// Parse the URL parameters to extract the room ID
const queryParams = new URLSearchParams(window.location.search);
roomId = queryParams.get('room');

if (roomId) {
    startCallButton.disabled = true;
    endCallButton.disabled = false;

    joinMeeting(roomId);
}

startCallButton.addEventListener('click', () => {
    startCallButton.disabled = true;
    endCallButton.disabled = false;

    // Generate a new room ID for each new meeting
    roomId = generateUniqueId();
    const roomLink = `${window.location.origin}/?room=${roomId}`;
    alert(`Share this link with others: ${roomLink}`);

    socket.emit('join', roomId);
    joinMeeting(roomId);
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

// Set up media stream, peer connection, and signaling
function joinMeeting(roomId) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            localStream = stream;
            localVideo.srcObject = stream;

            // Create RTCPeerConnection and set local stream
            peerConnection = new RTCPeerConnection();
            localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    socket.emit('ice-candidate', { candidate: event.candidate, roomId });
                }
            };
        })
        .catch(error => {
            console.error('Error accessing webcam:', error);
            startCallButton.disabled = false;
            endCallButton.disabled = true;
        });
}

// Socket event listeners
socket.on('offer', offer => {
    // ... (Handle offer and create answer)
});

socket.on('answer', answer => {
    // ... (Handle answer)
});

socket.on('ice-candidate', candidate => {
    // ... (Handle ICE candidate)
});

// Replace this function with your own logic to generate unique IDs
function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
}
