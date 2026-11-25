import * as Crypto from 'expo-crypto';
import { getSecurity, saveSecurity } from './storage';
import { SecurityState } from '../types';

export async function hashPassword(password: string, salt: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    salt + password
  );
}

export async function verifyPassword(password: string): Promise<boolean> {
  const sec = await getSecurity();
  if (!sec.enabled || !sec.passwordHash || !sec.salt) return true;
  const hash = await hashPassword(password, sec.salt);
  return hash === sec.passwordHash;
}

export async function setAppPassword(newPassword: string, currentPassword?: string): Promise<{ success: boolean; error?: string }> {
  const sec = await getSecurity();
  if (sec.enabled && sec.passwordHash && sec.salt && currentPassword) {
    const curHash = await hashPassword(currentPassword, sec.salt);
    if (curHash !== sec.passwordHash) {
      return { success: false, error: 'Mot de passe actuel incorrect.' };
    }
  }

  const salt = Math.random().toString(36).substring(2, 12);
  const hash = await hashPassword(newPassword, salt);

  await saveSecurity({
    enabled: true,
    passwordHash: hash,
    salt,
    autoLockMinutes: sec.autoLockMinutes || 0
  });

  return { success: true };
}

export async function disableAppPassword(currentPassword: string): Promise<{ success: boolean; error?: string }> {
  const sec = await getSecurity();
  if (sec.passwordHash && sec.salt) {
    const curHash = await hashPassword(currentPassword, sec.salt);
    if (curHash !== sec.passwordHash) {
      return { success: false, error: 'Mot de passe actuel incorrect.' };
    }
  }

  await saveSecurity({
    ...sec,
    enabled: false
  });

  return { success: true };
}

export async function setAutoLock(minutes: number): Promise<void> {
  const sec = await getSecurity();
  await saveSecurity({
    ...sec,
    autoLockMinutes: minutes
  });
}
