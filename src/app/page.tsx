'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VoiceRecorder from '@/components/VoiceRecorder';
import NoteCard from '@/components/NoteCard';
import { getNotes } from '@/lib/firebase/firebaseUtils';
import type { Note } from '@/lib/types/note';
import { DeepgramContextProvider } from '@/lib/contexts/DeepgramContext';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);

  const fetchNotes = async () => {
    const fetchedNotes = await getNotes();
    setNotes(fetchedNotes);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <DeepgramContextProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        
        <main className="flex-1 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <VoiceRecorder onNewNote={fetchNotes} />
            
            {notes.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Notes</h2>
                <div className="space-y-4">
                  {notes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onUpdate={fetchNotes}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </DeepgramContextProvider>
  );
}
