'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, Save, X } from 'lucide-react';
import { updateNote, deleteNote } from '@/lib/firebase/firebaseUtils';
import type { Note } from '@/lib/types/note';

interface NoteCardProps {
  note: Note;
  onUpdate: () => void;
}

export default function NoteCard({ note, onUpdate }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(note.text);

  const handleSave = async () => {
    await updateNote(note.id, editedText);
    setIsEditing(false);
    onUpdate();
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this note?')) {
      await deleteNote(note.id);
      onUpdate();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <time className="text-sm text-gray-500">
          {format(new Date(note.timestamp), 'PPpp')}
        </time>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="text-green-600 hover:text-green-700"
              >
                <Save size={18} />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-600 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>
      {isEditing ? (
        <textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className="w-full p-2 border rounded-md"
          rows={4}
        />
      ) : (
        <p className="text-gray-700 whitespace-pre-wrap">{note.text}</p>
      )}
    </div>
  );
} 