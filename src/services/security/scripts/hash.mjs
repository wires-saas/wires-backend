import * as bcrypt from 'bcrypt';

const salt = process.env.HASH_SALT;

const saltOrRounds = 10;
const goodPassword = 'good';
const badPassword = 'bad';
const hash = await bcrypt.hash(salt + goodPassword, saltOrRounds);

console.log(await bcrypt.compare(salt + goodPassword, hash));
console.log(await bcrypt.compare(salt + badPassword, hash));
