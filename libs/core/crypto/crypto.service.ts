import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CryptoService {
    async hashPassword(password: string, salt: number): Promise<string> {
        return await bcrypt.hash(password, salt);
    }

    async match(enteredPassword: string, dbPassword: string): Promise<boolean> {
        return await bcrypt.compare(enteredPassword, dbPassword);
    }
}
