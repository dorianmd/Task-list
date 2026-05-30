import { hashSync, genSaltSync, compareSync } from "bcrypt-ts";
import { prismaClient } from "@/lib/prismaClient";

type LoginSuccess = {
    success: true;
    user: {
        id: string;
        email: string;
        password: string;
    };
};

type LoginFailure = {
    success: false;
    error: 'invalid-credentials' | 'unknown-error';
};

async function registerUser(email: string, password: string) {
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);

    try {
        const newUser = await prismaClient.user.create({
            data: {
                email,
                password: hashedPassword,
            }
        });
        return { success: true, user: newUser };
    } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            return { success: false, error: 'email-used' as const };
        }
    }

    return { success: false, error: 'unknown-error' as const };
}

async function loginUser(email: string, password: string): Promise<LoginSuccess | LoginFailure> {
    try {
        const user = await prismaClient.user.findUnique({ where: { email } });
        if (!user) return { success: false, error: 'invalid-credentials' };

        const passwordMatch = compareSync(password, user.password);
        if (!passwordMatch) return { success: false, error: 'invalid-credentials' };

        return { success: true, user: user };
    } catch (error) {
        return { success: false, error: 'unknown-error' };
    }
}

export { registerUser, loginUser };