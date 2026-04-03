import bcrypt from "bcrypt";
import { UserModel } from "../dist/models/User.js";

(async () => {
  try {
    const password = "senha123";
    const hash = "$2b$10$saltofakehash1234567890abcdef"; // Substitua por um hash real
    const isValid = await UserModel.verifyPassword(password, hash);
    console.log("Senha válida:", isValid);
  } catch (error) {
    console.error("Erro ao testar verifyPassword:", error);
  }
})();