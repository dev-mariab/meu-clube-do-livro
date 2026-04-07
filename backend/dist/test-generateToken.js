import { generateToken } from "../dist/utils/jwt.js";
(() => {
    try {
        const userId = "123";
        const email = "teste@exemplo.com";
        const token = generateToken(userId, email);
        console.log("Token gerado:", token);
    }
    catch (error) {
        console.error("Erro ao testar generateToken:", error);
    }
})();
//# sourceMappingURL=test-generateToken.js.map