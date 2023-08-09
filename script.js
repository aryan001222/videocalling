const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startCallButton = document.getElementById('startCall');
const endCallButton = document.getElementById('endCall');

let localStream;
let peerConnection;
let roomId;

startCallButton.addEventListener('click', () => {
    startCallButton.disabled = true;
    endCallButton.disabled = false;

    // Generate a unique room ID (you can use a library like uuid)
    roomId = generateUniqueId(); // Replace with your logic to generate a unique ID

    // Prompt the user with the room ID
    const roomLink = `${window.location.origin}/?room=${roomId}`;
    alert(`Share this link with others: ${roomLink}`);

    socket.emit('join', roomId);
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            localStream = stream;
            localVideo.srcObject = stream;

            // Create RTCPeerConnection and set local stream
            peerConnection = new RTCPeerConnection();
            localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

            // ... (Rest of your peer connection code)

            // Handle ICE candidate events
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

// Set up socket connection
const socket = io();

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