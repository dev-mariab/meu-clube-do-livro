import { UserModel } from "../src/models/User.js";
import { pool } from "../src/config/database.js";
(async () => {
    try {
        const email = "teste@exemplo.com";
        const user = await UserModel.findByEmail(email);
        console.log("Resultado da busca por email:", user);
    }
    catch (error) {
        console.error("Erro ao testar findByEmail:", error);
    }
    finally {
        pool.end();
    }
})();
//# sourceMappingURL=test-findByEmail.js.map