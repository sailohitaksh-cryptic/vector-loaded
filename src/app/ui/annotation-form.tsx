// src/app/ui/annotation-form.tsx

'use client';

import { useState } from 'react';
import type { ImageForAnnotation } from '@/app/lib/definitions';
import { useFormState, useFormStatus } from 'react-dom';
import { submitAnnotation, type AnnotationState } from '@/app/lib/actions';
import Link from 'next/link';

interface AnnotationFormProps {
  image: ImageForAnnotation;
  nextId: number | null;
}

export default function AnnotationForm({ image, nextId }: AnnotationFormProps) {
  // Check if the image has a userStatus. This determines if it's "view-only".
  const isAnnotated = !!image.userStatus;
  
  const [agreed, setAgreed] = useState<boolean | null>(null);
  const initialState: AnnotationState = { message: null, errors: {} };
  const submitAnnotationWithParams = submitAnnotation.bind(null, image.id, image.modelStatus, nextId);
  const [state, dispatch] = useFormState(submitAnnotationWithParams, initialState);

  return (
    <div>
      {/* --- View-Only Mode --- */}
      {isAnnotated && (
        <div className="space-y-6 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-200">Model Prediction:</p>
            <p className="text-lg p-2 bg-white dark:bg-gray-600 rounded mt-1">{image.modelStatus}</p>
          </div>
          <div>
            <p className="font-semibold text-green-600 dark:text-green-400">Your Previous Annotation:</p>
            <p className="text-lg font-bold p-2 bg-white dark:bg-gray-600 rounded mt-1">{image.userStatus}</p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center pt-2">
            This image has already been annotated.
          </p>
        </div>
      )}

      {/* --- Annotation Form (only shown if not yet annotated) --- */}
      {!isAnnotated && (
        <form action={dispatch} className="space-y-6">
          <div>
            <p className="font-semibold">Model Prediction:</p>
            <p className="text-lg p-2 bg-gray-100 dark:bg-gray-700 rounded">{image.modelStatus}</p>
          </div>

          <div>
            <label className="font-semibold block mb-2">Do you agree?</label>
            <div className="flex gap-4">
              <button type="button" onClick={() => setAgreed(true)} className={`px-4 py-2 rounded ${agreed === true ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>Yes</button>
              <button type="button" onClick={() => setAgreed(false)} className={`px-4 py-2 rounded ${agreed === false ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>No</button>
            </div>
            <input type="hidden" name="userAgrees" value={agreed === null ? '' : (agreed ? 'yes' : 'no')} />
          </div>

          {agreed === false && (
            <div>
              <label className="font-semibold block mb-2">What is the abdomen status according to you?</label>
              <select name="actualStatus" required className="w-full p-2 border rounded bg-white dark:bg-gray-700">
                <option value="">Select status...</option>
                <option value="Unfed">Unfed</option>
                <option value="Fully Fed">Fully Fed</option>
                <option value="Semi-Gravid">Semi-Gravid</option>
                <option value="Gravid">Gravid</option>
              </select>
            </div>
          )}
          
          {state.message && <p className="text-sm text-red-500">{state.message}</p>}
          
          <div className="flex items-center gap-4 pt-4">
            <SubmitButton />
            <Link 
              href={nextId ? `/annotate/${nextId}` : '/home'}
              className="w-full text-center bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              Skip
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
      {pending ? 'Saving...' : 'Submit'}
    </button>
  );
}