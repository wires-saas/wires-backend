import * as bcrypt from 'bcrypt';
import { salt } from '../../vault/salt.secret.js';

const saltOrRounds = 10;
const goodPassword = 'good';
const badPassword = 'bad';
const hash = await bcrypt.hash(salt + goodPassword, saltOrRounds);

console.log(await bcrypt.compare(salt + goodPassword, hash));
console.log(await bcrypt.compare(salt + badPassword, hash));
