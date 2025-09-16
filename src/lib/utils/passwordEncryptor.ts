import bcrypt from "bcrypt"

const SALT_ROUNDS = process.env.SALT_CRYPT ? parseInt(process.env.SALT_CRYPT) : 10

function createSalt() {
  return bcrypt.genSalt(SALT_ROUNDS).then(salt => salt)
}

export const hashPassword = async (password: string) => {
  const salt = await createSalt()
  return bcrypt.hash(password, salt).then(hash => hash)
}

export const comparePassword = async (unhashedPassword: string, hashedPassword: string) => {
  return bcrypt.compare(unhashedPassword, hashedPassword).then(hash => hash)
}
