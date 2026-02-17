import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import {
    callUser,
    answerCall,
    endCall,
    subscribeToCallAccepted,
    subscribeToCallAccepted,
    subscribeToCallEnded,
    subscribeToCallFailed
} from './chat.socket';
import { Phone, PhoneOff, Video, Mic, MicOff, VideoOff, Wifi, WifiOff } from 'lucide-react';

const VideoCall = ({ currentUser, activeConversation, socketId, incomingCallData, onCallEnded }) => {
    const [stream, setStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState("");
    const [isCalling, setIsCalling] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('idle'); // idle, connecting, connected, failed

    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    // Merged into the main signal handling effect below
    // useEffect(() => {
    //     if (incomingCallData) {
    //      ... 
    //     }
    // }, [incomingCallData]);

    // [NEW] Effect to handle incoming ICE candidates (trickle ICE) for the Answerer
    // We need a ref to store candidates that arrive BEFORE the peer connection is created/ready
    const signalQueueStr = useRef([]);

    useEffect(() => {
        if (incomingCallData) {
            console.log("Received new signal data:", incomingCallData);

            // 1. If it's the initial offer, set it (and don't overwrite if it's just a candidate later)
            if (incomingCallData.signal && incomingCallData.signal.type === 'offer') {
                console.log("Start of call: Received Offer");
                setCallerSignal(incomingCallData.signal);
                setCaller(incomingCallData.from);
                setName(incomingCallData.name);
                setReceivingCall(true);
            }

            // 2. If it's a candidate (no type or type='candidate'), handle buffering or signaling
            else if (incomingCallData.signal && (!incomingCallData.signal.type || incomingCallData.signal.type === 'candidate')) {
                console.log("Received ICE Candidate");
                if (connectionRef.current && !connectionRef.current.destroyed) {
                    // Peer is ready, signal immediately
                    console.log("Peer ready, signaling candidate immediately");
                    connectionRef.current.signal(incomingCallData.signal);
                } else {
                    // Peer not ready (user hasn't answered yet), buffer it
                    console.log("Peer not ready, buffering candidate");
                    signalQueueStr.current.push(incomingCallData.signal);
                }
            }
        }
    }, [incomingCallData]);

    // Effect to attach local stream
    useEffect(() => {
        if (stream && myVideo.current) {
            console.log("Attaching local stream to video element");
            myVideo.current.srcObject = stream;
        }
    }, [stream]);

    // Effect to attach remote stream
    useEffect(() => {
        if (remoteStream && userVideo.current) {
            console.log("Attaching remote stream to video element");
            userVideo.current.srcObject = remoteStream;
        } else if (userVideo.current && !remoteStream) {
            userVideo.current.srcObject = null;
        }
    }, [remoteStream, callAccepted]);

    useEffect(() => {
        const handleCallEnded = () => {
            console.log("Call ended event received");
            cleanupCall();
        };

        const handleCallFailed = ({ reason }) => {
            console.log("Call failed:", reason);
            alert(`Call failed: ${reason}`);
            cleanupCall();
        };

        subscribeToCallEnded(handleCallEnded);
        subscribeToCallFailed(handleCallFailed);

        return () => {
            // cleanup on unmount if needed, but usually handled by leaveCall or parent unmounting
        };
    }, []);

    const cleanupCall = () => {
        setCallEnded(true);
        setCallAccepted(false);
        setReceivingCall(false);
        setIsCalling(false);
        setConnectionStatus('idle');

        if (connectionRef.current) {
            console.log("Destroying connection in cleanup");
            connectionRef.current.destroy();
            connectionRef.current = null;
        }

        signalQueueStr.current = []; // Clear queue

        // Stop all tracks
        if (stream) {
            console.log("Stopping local tracks");
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }

        setRemoteStream(null);
        if (onCallEnded) onCallEnded();
    };

    const startStream = async () => {
        try {
            console.log("Requesting local stream...");
            const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            console.log("Local stream obtained", currentStream.id);
            setStream(currentStream);
            return currentStream;
        } catch (err) {
            console.error("Failed to get local stream", err);
            alert("Could not access camera/microphone. Please check permissions.");
            setConnectionStatus('failed');
            return null;
        }
    };

    // Peer Configuration
    const [iceServers, setIceServers] = useState([]);

    useEffect(() => {
        const fetchIceServers = async () => {
            try {
                // Adjust fetch URL based on your API setup (e.g., using a base URL or proxy)
                // Assuming relative path works with proxy or full URL needed
                const response = await fetch('/api/chat/ice-servers', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure auth if needed, though usually cookies or header
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setIceServers(data.data);
                    addLog("ICE servers fetched successfully");
                }
            } catch (error) {
                console.error("Failed to fetch ICE servers:", error);
                addLog("Failed to fetch ICE servers, using defaults");
                // Fallback to Google STUN if fetch fails
                setIceServers([
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                ]);
            }
        };
        fetchIceServers();
    }, []);

    const peerConfig = {
        iceServers: iceServers.length > 0 ? iceServers : [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
        ]
    };

    const initiateCall = async (userToCallId) => {
        console.log("Initiating call to:", userToCallId);
        setConnectionStatus('connecting');
        const currentStream = await startStream();
        if (!currentStream) return;

        setIsCalling(true);
        setCallEnded(false);

        const peer = new Peer({
            initiator: true,
            stream: currentStream,
            config: peerConfig
        });

        // Event Listeners for Peer
        peer.on('signal', (data) => {
            console.log("Peer (Initiator) generated signal:", data);
            callUser({
                userToCall: userToCallId,
                signalData: data,
                from: currentUser._id,
                name: currentUser.name,
            });
        });

        peer.on('stream', (remoteStream) => {
            console.log("Peer (Initiator) received remote stream:", remoteStream.id);
            setRemoteStream(remoteStream);
            setConnectionStatus('connected');
        });

        peer.on('connect', () => {
            console.log("Peer (Initiator) connected fully");
            setConnectionStatus('connected');
        });

        peer.on('error', (err) => {
            console.error("Peer (Initiator) error:", err);
            setConnectionStatus('failed');
            alert(`Call failed: ${err.message || 'Connection error'}`);
        });

        peer.on('close', () => {
            console.log("Peer (Initiator) connection closed");
            cleanupCall();
        });

        subscribeToCallAccepted((signal) => {
            console.log("Call accepted signal received by Initiator");
            setCallAccepted(true);
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    const answerCallHandler = async () => {
        console.log("Answering call from:", caller);
        setConnectionStatus('connecting');
        const currentStream = await startStream();
        if (!currentStream) return;

        setCallAccepted(true);

        const peer = new Peer({
            initiator: false,
            stream: currentStream,
            config: peerConfig
        });

        peer.on('signal', (data) => {
            console.log("Peer (Answerer) generated signal:", data);
            answerCall({ signal: data, to: caller });
        });

        peer.on('stream', (remoteStream) => {
            console.log("Peer (Answerer) received remote stream:", remoteStream.id);
            setRemoteStream(remoteStream);
            setConnectionStatus('connected');
        });

        peer.on('connect', () => {
            console.log("Peer (Answerer) connected fully");
            setConnectionStatus('connected');
        });

        peer.on('error', (err) => {
            console.error("Peer (Answerer) error:", err);
            setConnectionStatus('failed');
            alert(`Call failed: ${err.message || 'Connection error'}`);
        });

        peer.on('close', () => {
            console.log("Peer (Answerer) connection closed");
            cleanupCall();
        });

        console.log("Signaling peer with caller signal (Offer)");
        peer.signal(callerSignal);

        // FLUSH QUEUE: Signal any buffered candidates that arrived before we answered
        if (signalQueueStr.current.length > 0) {
            console.log(`Flushing ${signalQueueStr.current.length} buffered ICE candidates`);
            signalQueueStr.current.forEach(signal => {
                peer.signal(signal);
            });
            signalQueueStr.current = [];
        }

        connectionRef.current = peer;
    };

    const leaveCall = () => {
        console.log("User leaving call manually");

        // Notify other user
        const otherUserId = isCalling ? activeConversation?.members.find(m => m._id !== currentUser._id)?._id : caller;
        if (otherUserId) {
            endCall({ to: otherUserId });
        }

        cleanupCall();
    };

    const toggleMic = () => {
        setMicOn(!micOn);
        if (stream) {
            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length > 0) {
                audioTracks[0].enabled = !micOn; // If it was on, we toggle to off
                console.log(`Audio track ${!micOn ? 'enabled' : 'disabled'}`);
            }
        }
    };

    const toggleVideo = () => {
        setVideoOn(!videoOn);
        if (stream) {
            const videoTracks = stream.getVideoTracks();
            if (videoTracks.length > 0) {
                videoTracks[0].enabled = !videoOn;
                console.log(`Video track ${!videoOn ? 'enabled' : 'disabled'}`);
            }
        }
    };

    // Determine user to call (the other user in the conversation)
    const otherUser = activeConversation?.members.find(m => m._id !== currentUser._id);

    // Debug logging state
    const [debugLogs, setDebugLogs] = useState([]);
    const addLog = (msg) => {
        console.log(msg);
        setDebugLogs(prev => [...prev.slice(-4), msg]); // Keep last 5 logs
    };

    // Replace console.log with addLog in critical paths
    // (We will use a helper to wrap console.log if we were doing a full refactor, 
    // but here we will just render the specific connection events we care about)

    useEffect(() => {
        if (connectionStatus === 'firstName') return;
        addLog(`Status changed: ${connectionStatus}`);
    }, [connectionStatus]);

    useEffect(() => {
        if (incomingCallData) addLog(`Incoming call data: ${incomingCallData.from}`);
    }, [incomingCallData]);

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-gray-900 rounded-lg shadow-xl text-white w-full max-w-4xl mx-auto">
            {/* Status Bar */}
            <div className="w-full flex justify-between items-center mb-4 px-2">
                <span className={`text-sm px-2 py-1 rounded flex items-center gap-2 ${connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' : connectionStatus === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {connectionStatus === 'connected' ? <Wifi size={16} /> : <WifiOff size={16} />}
                    Status: {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
                </span>
                {callAccepted && !callEnded && <span className="text-gray-400 text-sm">Timer: 00:00 (TODO)</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-[60vh] md:h-[500px]">
                {/* My Video */}
                <div className="relative bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center border border-gray-700">
                    {stream ? (
                        <video
                            playsInline
                            muted
                            ref={myVideo}
                            autoPlay
                            className="w-full h-full object-cover transform scale-x-[-1]"
                        />
                    ) : (
                        <div className="text-gray-500">Local Camera Off/Loading...</div>
                    )}
                    <span className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs backdrop-blur-sm">You</span>
                    {!videoOn && <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80"><VideoOff size={48} className="text-red-500" /></div>}
                </div>

                {/* User's Video */}
                <div className="relative bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center border border-gray-700">
                    {callAccepted && !callEnded ? (
                        <>
                            <video
                                playsInline
                                ref={userVideo}
                                autoPlay
                                className="w-full h-full object-cover"
                            />
                            {/* Fallback if stream is present but track is disabled/muted (requires extra signalling to detect perfectly, but good to have placeholder) */}
                        </>
                    ) : (
                        (isCalling || receivingCall) && (
                            <div className="flex flex-col items-center justify-center p-8 text-center animate-pulse">
                                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl font-bold">{name?.charAt(0) || otherUser?.name?.charAt(0) || "?"}</span>
                                </div>
                                <p className="text-lg font-medium">{isCalling ? "Calling..." : receivingCall ? `${name} is calling...` : "Waiting..."}</p>
                            </div>
                        )
                    )}
                    <span className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs backdrop-blur-sm">{name || otherUser?.name || "Remote User"}</span>
                </div>
            </div>

            <div className="mt-8 flex gap-6">
                {/* Call Controls */}
                {!callAccepted && !isCalling && !receivingCall && (
                    <button
                        onClick={() => initiateCall(otherUser?._id)}
                        className="bg-green-600 hover:bg-green-500 text-white p-4 rounded-full transition-all shadow-lg shadow-green-900/20 hover:scale-110"
                        title="Start Call"
                    >
                        <Video size={28} />
                    </button>
                )}

                {receivingCall && !callAccepted && (
                    <div className="flex gap-8">
                        <button onClick={answerCallHandler} className="bg-green-600 hover:bg-green-500 text-white p-4 rounded-full animate-bounce shadow-lg shadow-green-900/20">
                            <Phone size={28} />
                        </button>
                        <button onClick={() => {
                            setReceivingCall(false);
                            // Optionally reject call logic
                        }} className="bg-red-600 hover:bg-red-500 text-white p-4 rounded-full shadow-lg shadow-red-900/20">
                            <PhoneOff size={28} />
                        </button>
                    </div>
                )}

                {(callAccepted || isCalling) && !callEnded && (
                    <div className="flex gap-4 items-center bg-gray-800 px-6 py-3 rounded-2xl border border-gray-700">
                        <button onClick={toggleMic} className={`p-3 rounded-full transition-colors ${micOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}>
                            {micOn ? <Mic size={24} /> : <MicOff size={24} />}
                        </button>
                        <button onClick={toggleVideo} className={`p-3 rounded-full transition-colors ${videoOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}>
                            {videoOn ? <Video size={24} /> : <VideoOff size={24} />}
                        </button>
                        <div className="w-px h-8 bg-gray-600 mx-2"></div>
                        <button onClick={leaveCall} className="bg-red-600 hover:bg-red-500 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform">
                            <PhoneOff size={24} />
                        </button>
                    </div>
                )}
            </div>
            {!callAccepted && !isCalling && !receivingCall && (
                <p className="mt-4 text-gray-500 text-sm">Ready to call {otherUser?.name}</p>
            )}

            {/* Debug Logs Section */}
            <div className="mt-6 w-full bg-black/50 p-2 rounded text-xs font-mono text-gray-400 h-24 overflow-y-auto">
                <div className="font-bold border-b border-gray-700 mb-1">Debug Logs:</div>
                {debugLogs.map((log, i) => (
                    <div key={i}>{log}</div>
                ))}
            </div>
        </div>
    );
};

export default VideoCall;
