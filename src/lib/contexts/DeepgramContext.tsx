"use client";

import {
  createClient,
  LiveClient,
  SOCKET_STATES,
  LiveTranscriptionEvents,
} from "@deepgram/sdk";
import { createContext, useContext, useState, ReactNode, useRef } from "react";

interface DeepgramContextType {
  connectToDeepgram: () => Promise<void>;
  disconnectFromDeepgram: () => void;
  connectionState: SOCKET_STATES;
  realtimeTranscript: string;
  error: string | null;
}

const DeepgramContext = createContext<DeepgramContextType | undefined>(undefined);

export function DeepgramContextProvider({ children }: { children: ReactNode }) {
  const [connectionState, setConnectionState] = useState<SOCKET_STATES>(SOCKET_STATES.NONE);
  const [realtimeTranscript, setRealtimeTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const deepgramRef = useRef<LiveClient | null>(null);

  const connectToDeepgram = async () => {
    try {
      // Get API key from our secure endpoint
      const response = await fetch("/api/deepgram");
      const { key } = await response.json();

      if (!key) {
        throw new Error("No Deepgram API key found");
      }

      // Create Deepgram client
      const deepgram = createClient(key);
      
      // Create live transcription connection
      const connection = deepgram.listen.live({
        language: "en",
        smart_format: true,
        model: "general",
      });

      // Set up event handlers
      connection.on(LiveTranscriptionEvents.OPEN, () => {
        setConnectionState(SOCKET_STATES.OPEN);
        setError(null);
      });

      connection.on(LiveTranscriptionEvents.CLOSE, () => {
        setConnectionState(SOCKET_STATES.CLOSED);
      });

      connection.on(LiveTranscriptionEvents.TRANSCRIPT_RECEIVED, (data) => {
        const transcript = data.channel.alternatives[0].transcript;
        if (transcript) {
          setRealtimeTranscript((prev) => prev + " " + transcript);
        }
      });

      connection.on(LiveTranscriptionEvents.ERROR, (error) => {
        setError(error.message);
        setConnectionState(SOCKET_STATES.CLOSED);
      });

      // Start recording
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(mediaStream);
      const processor = audioContext.createScriptProcessor(1024, 1, 1);

      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const uint8Array = new Uint8Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          uint8Array[i] = (inputData[i] + 1) * 128;
        }
        connection.send(uint8Array);
      };

      deepgramRef.current = connection;
      setRealtimeTranscript("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to Deepgram");
      setConnectionState(SOCKET_STATES.CLOSED);
    }
  };

  const disconnectFromDeepgram = () => {
    if (deepgramRef.current) {
      deepgramRef.current.finish();
      deepgramRef.current = null;
      setConnectionState(SOCKET_STATES.CLOSED);
    }
  };

  return (
    <DeepgramContext.Provider
      value={{
        connectToDeepgram,
        disconnectFromDeepgram,
        connectionState,
        realtimeTranscript,
        error,
      }}
    >
      {children}
    </DeepgramContext.Provider>
  );
}

export const useDeepgram = () => {
  const context = useContext(DeepgramContext);
  if (context === undefined) {
    throw new Error("useDeepgram must be used within a DeepgramContextProvider");
  }
  return context;
};
