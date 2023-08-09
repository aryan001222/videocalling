// app.js

const socket = io();

socket.on('userJoined', (socketId) => {
  console.log('User joined:', socketId);
  // Handle new user joining the call (WebRTC signaling)
  createPeerConnection(socketId);
});

socket.on('userLeft', (socketId) => {
  console.log('User left:', socketId);
  // Handle user leaving the call (WebRTC signaling)
  if (peers[socketId]) {
    peers[socketId].destroy();
    delete peers[socketId];
  }
});

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startJoiningBtn = document.getElementById('startJoining');
const endCallBtn = document.getElementById('endCall');
const toggleCameraBtn = document.getElementById('toggleCamera');
const toggleMicrophoneBtn = document.getElementById('toggleMicrophone');

const constraints = {
  video: true,
  audio: true,
};

let localStream;
let isCameraOn = false;
let isMicrophoneOn = false;
let peers = {};

async function startJoining() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia(constraints);
    localVideo.srcObject = localStream;
    isCameraOn = true;
    isMicrophoneOn = true;
    toggleCameraBtn.disabled = false;
    toggleMicrophoneBtn.disabled = false;
    startJoiningBtn.disabled = true;
    endCallBtn.disabled = false;
    socket.emit('joinCall');
  } catch (err) {
    console.error('Error accessing media devices: ', err);
  }
}

function endCall() {
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
    isCameraOn = false;
    isMicrophoneOn = false;
    toggleCameraBtn.disabled = true;
    toggleMicrophoneBtn.disabled = true;
