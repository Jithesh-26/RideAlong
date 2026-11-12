import { spawn } from 'child_process';

console.log('[RideAlong] Starting Backend API Server and Vite Frontend...');

const server = spawn('node', ['node_modules/tsx/dist/cli.mjs', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true
});

const client = spawn('node', ['node_modules/vite/bin/vite.js', '--host', '--port', '5173'], {
  stdio: 'inherit',
  shell: true
});

process.on('SIGINT', () => {
  server.kill();
  client.kill();
  process.exit();
});

process.on('exit', () => {
  server.kill();
  client.kill();
});
