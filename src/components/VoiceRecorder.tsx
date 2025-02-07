'use client';

import { useState } from 'react';
import { Mic, Square } from 'lucide-react';
import { useDeepgram } from '@/lib/contexts/DeepgramContext';
import { addDocument } from '@/lib/firebase/firebaseUtils';
import { motion } from 'framer-motion';

interface VoiceRecorderProps {
  onNewNote: () => void;
}

export default function VoiceRecorder({ onNewNote }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const { connectToDeepgram, disconnectFromDeepgram, realtimeTranscript } = useDeepgram();

  const handleStartRecording = async () => {
    await connectToDeepgram();
    setIsRecording(true);
  };

  const handleStopRecording = async () => {
    disconnectFromDeepgram();
    setIsRecording(false);
    
    if (realtimeTranscript) {
      await addDocument('notes', {
        text: realtimeTranscript,
        timestamp: new Date().toISOString(),
      });
      onNewNote();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <button
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full ${
          isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
        } text-white font-semibold transition-colors`}
      >
        {isRecording ? (
          <>
            <Square className="w-6 h-6" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="w-6 h-6" />
            Start Recording
          </>
        )}
      </button>
      
      {isRecording && (
        <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
          <div className="flex justify-center mb-4">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-12 h-12 bg-blue-500 rounded-full opacity-75"
            />
          </div>
          <p className="text-gray-700 text-lg leading-relaxed">
            {realtimeTranscript || 'Listening...'}
          </p>
        </div>
      )}
    </div>
  );
}