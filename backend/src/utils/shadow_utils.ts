import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { Player, Role } from '../types';

// Load words
const wordsPath = path.join(__dirname, '../data/shadow_words.json');
const wordsData = JSON.parse(fs.readFileSync(wordsPath, 'utf-8'));

export function generateRoomCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getRandomWordPair() {
    const domain = wordsData.domains[Math.floor(Math.random() * wordsData.domains.length)];
    const wordObj = domain.words[Math.floor(Math.random() * domain.words.length)];
    return {
        citizenWord: wordObj.word,
        infiltratorWord: null // Infiltrator gets no word
    };
}

export function assignRoles(players: Player[]): Player[] {
    const shuffled = [...players].sort(() => 0.5 - Math.random());

    // Assign 1 Infiltrator
    shuffled[0].role = 'INFILTRATOR';

    // Assign rest as Citizens
    for (let i = 1; i < shuffled.length; i++) {
        shuffled[i].role = 'CITIZEN';
    }

    return shuffled;
}
