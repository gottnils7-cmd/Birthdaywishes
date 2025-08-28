import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';

function VideoCall({
  socket,
  me,
  callUser,
  setCallUser,
  callAccepted,
  setCallAccepted,
  callEnded,
  setCallEnded,
  call,
  setCall,
  localStream,
  setLocalStream,
  remoteStream,
  setRemoteStream,
  isRemote = false
}) {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [peer, setPeer] = useState(null);
  
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
      });

    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    socket.on('callEnded', () => {
      setCallEnded(true);
      if (connectionRef.current) {
        connectionRef.current.destroy();
      }
      window.location.reload();
    });

    return () => {
      socket.off('callAccepted');
      socket.off('callEnded');
    };
  }, [socket, peer]);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const callUserHandler = (id) => {
    const peer = new Peer({ initiator: true, trickle: false, stream: localStream });
    
    peer.on('signal', (data) => {
      socket.emit('callUser', { userToCall: id, signalData: data, from: me });
    });

    peer.on('stream', (stream) => {
      setRemoteStream(stream);
    });

    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
    setPeer(peer);
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream: localStream });
    
    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: call.from });
    });

    peer.on('stream', (stream) => {
      setRemoteStream(stream);
    });

    peer.signal(call.signal);
    connectionRef.current = peer;
    setPeer(peer);
  };

  const leaveCall = () => {
    setCallEnded(true);
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    socket.emit('endCall', { to: call.from || callUser });
    window.location.reload();
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  if (isRemote) {
    return (
      <div className="video-section">
        <h3>Remote Player</h3>
        <div className="video-container">
          {callAccepted && !callEnded && (
            <video
              className="video"
              ref={remoteVideoRef}
              autoPlay
              playsInline
            />
          )}
          {!callAccepted && (
            <div className="video" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.5)'
            }}>
              <span>Waiting for connection...</span>
            </div>
          )}
        </div>
        
        {call.isReceivingCall && !callAccepted && (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <p>Incoming call...</p>
            <button className="call-btn" onClick={answerCall}>
              📞 Answer
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="video-section">
      <h3>You (Player {me.slice(-1)})</h3>
      <div className="video-container">
        <video
          className="video"
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
        />
      </div>
      
      <div className="video-controls">
        <button 
          className={`control-btn ${!audioEnabled ? 'active' : ''}`}
          onClick={toggleAudio}
          title={audioEnabled ? 'Mute Audio' : 'Unmute Audio'}
        >
          {audioEnabled ? '🎤' : '🔇'}
        </button>
        <button 
          className={`control-btn ${!videoEnabled ? 'active' : ''}`}
          onClick={toggleVideo}
          title={videoEnabled ? 'Turn Off Video' : 'Turn On Video'}
        >
          {videoEnabled ? '📹' : '📴'}
        </button>
      </div>

      <div style={{ margin: '20px 0' }}>
        <input
          type="text"
          placeholder="Enter User ID to call"
          value={callUser}
          onChange={(e) => setCallUser(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '5px',
            border: 'none',
            marginBottom: '10px',
            width: '200px'
          }}
        />
        <br />
        {callAccepted && !callEnded ? (
          <button className="call-btn end" onClick={leaveCall}>
            📞 End Call
          </button>
        ) : (
          <button 
            className="call-btn" 
            onClick={() => callUserHandler(callUser)}
            disabled={!callUser}
          >
            📞 Call User
          </button>
        )}
      </div>

      {me && (
        <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
          <p style={{ margin: '0', fontSize: '14px' }}>
            <strong>Your ID:</strong> {me}
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: '0.8' }}>
            Share this ID with your friend to receive calls
          </p>
        </div>
      )}
    </div>
  );
}

export default VideoCall;