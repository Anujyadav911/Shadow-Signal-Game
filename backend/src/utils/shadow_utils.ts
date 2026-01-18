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

// Update to return generic pair
export function getRandomWordPair() {
    const domain = wordsData.domains[Math.floor(Math.random() * wordsData.domains.length)];
    const wordObj = domain.words[Math.floor(Math.random() * domain.words.length)];

    // For Infiltrator mode: infiltrator gets nothing.
    // For Spy mode: Spy gets 'similar' word. 
    // Simplified: Spy gets the SAME word for now or a dummy "similar" word if we had a pair DB.
    // The prompt says: "Agents receive word A, Spy receives similar word B".
    // Since we don't have a "similar word" DB in this simple JSON (likely), 
    // we will simulate it by reversing the string or just appending "?" for the audit 
    // OR BETTER: Use another word from the SAME domain as "similar".
    const similarWordObj = domain.words.find((w: any) => w.word !== wordObj.word) || domain.words[0];

    return {
        citizenWord: wordObj.word,
        infiltratorWord: null, // For Infiltrator
        spyWord: similarWordObj.word // For Spy
    };
}

export function assignRoles(players: Player[], mode: 'INFILTRATOR' | 'SPY' = 'INFILTRATOR'): Player[] {
    const shuffled = [...players].sort(() => 0.5 - Math.random());

    if (mode === 'INFILTRATOR') {
        shuffled[0].role = 'INFILTRATOR';
        for (let i = 1; i < shuffled.length; i++) {
            shuffled[i].role = 'CITIZEN';
        }
    } else {
        shuffled[0].role = 'SPY';
        for (let i = 1; i < shuffled.length; i++) {
            shuffled[i].role = 'AGENT';
        }
    }

    return shuffled;
}
