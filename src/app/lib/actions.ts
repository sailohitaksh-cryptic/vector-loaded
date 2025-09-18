// src/app/lib/actions.ts

'use server';

import { signIn, auth } from '@/../auth';
import { AuthError } from 'next-auth';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@vercel/postgres';

// --- LOGIN & SIGNUP (Unchanged) ---
export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    await signIn('credentials', { ...Object.fromEntries(formData), redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === 'CredentialsSignin') {
        return 'Invalid credentials.';
      }
      return 'Something went wrong.';
    }
    throw error;
  }
  redirect('/home');
}
export type SignUpState = { message?: string; };
export async function signup(prevState: SignUpState | undefined, formData: FormData): Promise<SignUpState> {
  const parsed = z.object({ email: z.string().email(), password: z.string().min(6), role: z.enum(['student', 'vco']) }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { message: 'Invalid form data.' };
  const { email, password, role } = parsed.data;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await sql`INSERT INTO users (email, password, role) VALUES (${email}, ${hashedPassword}, ${role})`;
  } catch (error) {
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
  let finalStatus = (userAgrees === 'yes') ? modelStatus : actualStatus;

  if (!finalStatus) {
    return { message: 'Please select the actual status.' };
  }

  const client = await db.connect();
  try {
    await client.sql`BEGIN`;
    await client.sql`
      INSERT INTO annotations ("userId", "imageId", "userStatus")
      VALUES (${Number(userId)}, ${imageId}, ${finalStatus})
      ON CONFLICT ("userId", "imageId") DO UPDATE SET "userStatus" = ${finalStatus};
    `;
    await client.sql`
      UPDATE image_assignments
      SET status = 'completed'
      WHERE "userId" = ${Number(userId)} AND "imageId" = ${imageId};
    `;
    await client.sql`COMMIT`;
  } catch (error) {
    await client.sql`ROLLBACK`;
    return { message: 'Database Error: Failed to save annotation.' };
  } finally {
      client.release();
  }
  
  revalidatePath('/home');
  if (nextId) {
    redirect(`/annotate/${nextId}`);
  } else {
    redirect('/home');
  }
}