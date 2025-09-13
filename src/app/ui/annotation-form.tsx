// src/app/ui/annotation-form.tsx

'use client';

import { useState } from 'react';
import type { ImageForAnnotation } from '@/app/lib/definitions';
import { useActionState } from 'react';     // <-- Corrected: Import from 'react'
import { useFormStatus } from 'react-dom'; // <-- Corrected: Import from 'react-dom'
import { submitAnnotation } from '@/app/lib/actions';

interface AnnotationFormProps {
  image: ImageForAnnotation;
  nextId: number | null;
}

export default function AnnotationForm({ image, nextId }: AnnotationFormProps) {
  const [agreed, setAgreed] = useState<boolean | null>(null);
  
  const initialState = { message: null, errors: {} };
  const submitAnnotationWithParams = submitAnnotation.bind(null, image.id, image.modelStatus, nextId);
  const [state, dispatch] = useActionState(submitAnnotationWithParams, initialState);

  return (
    <form action={dispatch} className="space-y-6">
      <div>
        <p className="font-semibold">Model Prediction:</p>
        <p className="text-lg p-2 bg-gray-100 dark:bg-gray-700 rounded">{image.modelStatus}</p>
      </div>

      <div>
        <label className="font-semibold block mb-2">Do you agree?</label>
        <div className="flex gap-4">
          <button type="button" onClick={() => setAgreed(true)} className={`px-4 py-2 rounded text-black dark:text-white ${agreed === true ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>Yes</button>
          <button type="button" onClick={() => setAgreed(false)} className={`px-4 py-2 rounded text-black dark:text-white ${agreed === false ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>No</button>
        </div>
        <input type="hidden" name="userAgrees" value={agreed === null ? '' : (agreed ? 'yes' : 'no')} />
      </div>

      {agreed === false && (
        <div>
          <label className="font-semibold block mb-2">What is the abdomen status according to you?</label>
          <select 
            name="actualStatus" 
            required 
            className="w-full p-2 border rounded bg-white dark:bg-gray-700"
          >
            <option value="">Select status...</option>
            <option value="Unfed">Unfed</option>
            <option value="Fully Fed">Fully Fed</option>
            <option value="Semi-Gravid">Semi-Gravid</option>
            <option value="Gravid">Gravid</option>
          </select>
        </div>
      )}
      
      {state.message && <p className="text-sm text-red-500">{state.message}</p>}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
      {pending ? 'Saving...' : 'Submit and Next'}
    </button>
  );
}