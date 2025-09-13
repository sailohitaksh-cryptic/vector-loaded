// src/app/lib/actions.ts

'use server';

import { signIn, auth } from '@/../auth'; // <-- Added 'auth' import
import { AuthError } from 'next-auth';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// --- LOGIN & SIGNUP ACTIONS (Unchanged) ---
export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    await signIn('credentials', { ...Object.fromEntries(formData), redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return 'Invalid credentials.';
    }
    throw error;
  }
  redirect('/home');
}
export type SignUpState = { message?: string; };
export async function signup(prevState: SignUpState | undefined, formData: FormData): Promise<SignUpState> {
  const parsedCredentials = z.object({ email: z.string().email(), password: z.string().min(6) }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsedCredentials.success) {
    return { message: parsedCredentials.error.errors.map((e) => e.message).join(', ') };
  }
  const { email, password } = parsedCredentials.data;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await sql`INSERT INTO users (email, password) VALUES (${email}, ${hashedPassword})`;
  } catch (error) {
    const dbError = error as { code?: string };
    if (dbError?.code === '23505') {
      return { message: 'This email is already registered.' };
    }
    return { message: 'Database Error: Failed to create user.' };
  }
  redirect('/');
}

// --- ANNOTATION ACTION ---

export type AnnotationState = {
  errors?: {
    userAgrees?: string[];
    actualStatus?: string[];
  };
  message?: string | null;
};

export async function submitAnnotation(
  imageId: number,
  modelStatus: string,
  nextId: number | null,
  prevState: AnnotationState,
  formData: FormData,
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { message: 'Authentication error.' };
  }

  const validatedFields = z.object({
    userAgrees: z.enum(['yes', 'no'], {invalid_type_error: 'Please select Yes or No.'}),
    actualStatus: z.string().optional(),
  }).safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Submit.',
    };
  }
  
  const { userAgrees, actualStatus } = validatedFields.data;
  let finalStatus = '';

  if (userAgrees === 'yes') {
    finalStatus = modelStatus;
  } else {
    if (!actualStatus || actualStatus === '') {
      return { message: 'Please select the actual status.' };
    }
    finalStatus = actualStatus;
  }

  try {
    await sql`
      INSERT INTO annotations ("userId", "imageId", "userStatus")
      VALUES (${Number(userId)}, ${imageId}, ${finalStatus})
      ON CONFLICT ("userId", "imageId") DO UPDATE SET "userStatus" = ${finalStatus};
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to save annotation.' };
  }
  
  revalidatePath('/home');

  if (nextId) {
    redirect(`/annotate/${nextId}`);
  } else {
    redirect('/home');
  }
}