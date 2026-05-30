import { SignJWT, jwtVerify, JWTPayload } from 'jose';

const RAW_SECRET = process.env.JWT_SECRET;
if (!RAW_SECRET) {
    throw new Error('JWT_SECRET is missing. Set process.env.JWT_SECRET');
}

const JWT_SECRET = new TextEncoder().encode(RAW_SECRET);

export type TokenPayload = {
    userId: string;
    email?: string;
} & JWTPayload;

export async function generateToken(userId: number | string, email?: string) {
    const subject = String(userId);
    const jwt = await new SignJWT({ userId: subject, email })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(subject)
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET);

    return jwt;
}


export async function verifyToken(token: string): Promise<TokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as TokenPayload;
    } catch (error) {
        console.error(`Error in jwt.ts (verifyToken): `,error);
        return null;
    }
}