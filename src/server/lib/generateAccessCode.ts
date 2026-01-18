import { accessCodeExists } from "@services/userService";

export async function generateUniqueAccessCode(): Promise<string> {
  let attempts = 30
  while(attempts--) {
    const accessCode = generateAccessCode()
    if(!(await accessCodeExists(accessCode))) {
        return accessCode
    }
  }

  throw new Error("Couldn't generate unique AccessCode")
}


// Temporary at some point not now implement better access code generator using hand picked dictionary and a two digit number with enough possibilities to have no collisions
function generateAccessCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}
