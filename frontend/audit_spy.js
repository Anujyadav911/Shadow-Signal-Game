const io = require('socket.io-client');

const SOCKET_URL = 'http://localhost:4000';

async function runAudit() {
    console.log('--- Starting Shadow Signal Spy Mode Audit ---');

    const hostSocket = io(SOCKET_URL);
    const p2Socket = io(SOCKET_URL);
    const p3Socket = io(SOCKET_URL);

    const sockets = [hostSocket, p2Socket, p3Socket];
    let roomCode = '';

    // Wait for connection
    await new Promise(resolve => {
        let connected = 0;
        sockets.forEach(s => s.on('connect', () => {
            connected++;
            if (connected === 3) resolve();
        }));
    });
    console.log('✅ 3 Clients Connected');

    // 1. Create Room
    await new Promise(resolve => {
        hostSocket.emit('create_room', 'HostUser', (res) => {
            if (res.success) {
                roomCode = res.roomCode;
                console.log(`✅ Room Created: ${roomCode}`);
                resolve();
            } else {
                console.error('❌ Failed to create room:', res.message);
                process.exit(1);
            }
        });
    });

    // 2. Join Others
    await new Promise(resolve => {
        let joined = 0;
        [p2Socket, p3Socket].forEach((s, i) => {
            s.emit('join_room', { roomCode, username: `Player${i + 2}` }, (res) => {
                if (res.success) {
                    joined++;
                    if (joined === 2) resolve();
                } else {
                    console.error('❌ Join failed');
                }
            });
        });
    });
    console.log('✅ Players Joined');

    // 3. Start Game in SPY Mode
    console.log('>>> Starting Game in SPY Mode...');
    hostSocket.emit('start_game', { roomCode, mode: 'SPY' });

    // 4. Verify Roles and Words
    const gameStartPromises = sockets.map((s, i) => new Promise(resolve => {
        s.on('game_started', (data) => {
            console.log(`User ${i + 1} Role: ${data.role}, Word: ${data.word}`);
            resolve(data);
        });
    }));

    const results = await Promise.all(gameStartPromises);

    const spies = results.filter(r => r.role === 'SPY');
    const agents = results.filter(r => r.role === 'AGENT');

    if (spies.length === 1 && agents.length === 2) {
        console.log('✅ Role Distribution Correct: 1 Spy, 2 Agents');
    } else {
        console.error('❌ Role Distribution FAILED:', results);
    }

    const agentWord = agents[0].word;
    const allAgentsSame = agents.every(a => a.word === agentWord);
    const spyHasWord = !!spies[0].word;
    // In our implementation Spy word might be same or different, check logic roughly

    if (allAgentsSame) console.log('✅ All Agents have same word');
    else console.error('❌ Agents have mixed words');

    if (spyHasWord) console.log('✅ Spy received a word');
    else console.error('❌ Spy received NO word');

    console.log('--- Audit Complete ---');
    sockets.forEach(s => s.disconnect());
    process.exit(0);
}

runAudit();
