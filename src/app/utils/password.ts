import bcrypt from 'bcryptjs';
import env from '../config/env';

/**
 * Hash (encrypt) a plain password using bcrypt.
 * @param password - The plain text password to hash.
 * @returns The hashed password.
 */
const passwordEncrypt = async (password: string): Promise<string> => {
  const saltRounds =
    typeof env.BCRYPT_SALT_ROUND === 'string'
      ? parseInt(env.BCRYPT_SALT_ROUND, 10)
      : env.BCRYPT_SALT_ROUND;

  if (!saltRounds || isNaN(saltRounds)) {
    throw new Error('Invalid BCRYPT_SALT_ROUND in environment variables');
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

/**
 * Compare a plain password with a hashed password.
 * @param plainPassword - The password provided by the user.
 * @param hashedPassword - The hashed password stored in the database.
 * @returns True -> if the passwords match, false otherwise.
 */

const comparePassword = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export { passwordEncrypt, comparePassword };
