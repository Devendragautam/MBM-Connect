import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import {
    callUser,
    answerCall,
    endCall,
    subscribeToCallAccepted,
    subscribeToCallEnded
} from './chat.socket';
import { Phone, PhoneOff, Video, Mic, MicOff, VideoOff } from 'lucide-react';

const VideoCall = ({ currentUser, activeConversation, socketId, incomingCallData, onCallEnded }) => {
    const [stream, setStream] = useState(null);
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState("");
    const [isCalling, setIsCalling] = useState(false);

    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    useEffect(() => {
        if (incomingCallData) {
            setReceivingCall(true);
            setCaller(incomingCallData.from);
            setName(incomingCallData.name);
            setCallerSignal(incomingCallData.signal);
        }
    }, [incomingCallData]);

    useEffect(() => {
        const handleCallEnded = () => {
            setCallEnded(true);
            setCallAccepted(false);
            setReceivingCall(false);
            setIsCalling(false);
            if (connectionRef.current) connectionRef.current.destroy();
            // Stop all tracks
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
            if (onCallEnded) onCallEnded();
        };

        subscribeToCallEnded(handleCallEnded);

        return () => {
            // cleanup
        };
    }, [stream, onCallEnded]);

    const startStream = async () => {
        try {
            const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(currentStream);
            if (myVideo.current) {
                myVideo.current.srcObject = currentStream;
            }
            return currentStream;
        } catch (err) {
            console.error("Failed to get local stream", err);
            alert("Could not access camera/microphone");
            return null;
        }
    };

    const initiateCall = async (userToCallId) => {
        const currentStream = await startStream();
        if (!currentStream) return;

        setIsCalling(true);
        setCallEnded(false);

        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: currentStream,
        });

        peer.on('signal', (data) => {
            callUser({
                userToCall: userToCallId,
                signalData: data,
                from: currentUser._id,
                name: currentUser.name,
            });
        });

        peer.on('stream', (remoteStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = remoteStream;
            }
        });

        subscribeToCallAccepted((signal) => {
            setCallAccepted(true);
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    const answerCallHandler = async () => {
        const currentStream = await startStream();
        if (!currentStream) return;

        setCallAccepted(true);

        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: currentStream,
        });

        peer.on('signal', (data) => {
            answerCall({ signal: data, to: caller });
        });

        peer.on('stream', (remoteStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = remoteStream;
            }
        });

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        if (connectionRef.current) connectionRef.current.destroy();

        // Notify other user
        const otherUserId = isCalling ? activeConversation?.members.find(m => m._id !== currentUser._id)?._id : caller;
        if (otherUserId) {
            endCall({ to: otherUserId });
        }

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setCallAccepted(false);
        setIsCalling(false);
        setReceivingCall(false);
        if (onCallEnded) onCallEnded();
    };

    const toggleMic = () => {
        setMicOn(!micOn);
        if (stream) {
            stream.getAudioTracks()[0].enabled = !micOn;
        }
    };

    const toggleVideo = () => {
        setVideoOn(!videoOn);
        if (stream) {
            stream.getVideoTracks()[0].enabled = !videoOn;
        }
    };

    // Determine user to call (the other user in the conversation)
    const otherUser = activeConversation?.members.find(m => m._id !== currentUser._id);

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-gray-900 rounded-lg shadow-xl text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {/* My Video */}
                {stream && (
                    <div className="relative">
                        <video playsInline muted ref={myVideo} autoPlay className="w-full rounded-lg bg-black" />
                        <span className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">Me</span>
                    </div>
                )}

                {/* User's Video */}
                {callAccepted && !callEnded ? (
                    <div className="relative">
                        <video playsInline ref={userVideo} autoPlay className="w-full rounded-lg bg-black" />
                        <span className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">{name || otherUser?.name || "User"}</span>
                    </div>
                ) : (
                    (isCalling || receivingCall) && (
                        <div className="flex items-center justify-center bg-black/20 rounded-lg h-64">
                            <p className="animate-pulse text-lg">{isCalling ? "Calling..." : receivingCall ? `${name} is calling...` : ""}</p>
                        </div>
                    )
                )}
            </div>

            <div className="mt-6 flex gap-4">
                {/* Call Controls */}
                {!callAccepted && !isCalling && !receivingCall && (
                    <button
                        onClick={() => initiateCall(otherUser?._id)}
                        className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full transition-all"
                        title="Start Call"
                    >
                        <Video size={24} />
                    </button>
                )}

                {receivingCall && !callAccepted && (
                    <div className="flex gap-4">
                        <button onClick={answerCallHandler} className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full animate-bounce">
                            <Phone size={24} />
                        </button>
                        <button onClick={() => {
                            setReceivingCall(false);
                            // Optionally reject call logic
                        }} className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full">
                            <PhoneOff size={24} />
                        </button>
                    </div>
                )}

                {(callAccepted || isCalling) && !callEnded && (
                    <div className="flex gap-4">
                        <button onClick={toggleMic} className={`p-3 rounded-full ${micOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-500 hover:bg-red-600'}`}>
                            {micOn ? <Mic size={24} /> : <MicOff size={24} />}
                        </button>
                        <button onClick={toggleVideo} className={`p-3 rounded-full ${videoOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-500 hover:bg-red-600'}`}>
                            {videoOn ? <Video size={24} /> : <VideoOff size={24} />}
                        </button>
                        <button onClick={leaveCall} className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full">
                            <PhoneOff size={24} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoCall;
