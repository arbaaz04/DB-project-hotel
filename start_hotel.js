#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = __dirname;
const BACKEND_DIR = path.join(PROJECT_ROOT, 'hms-backend');
const FRONTEND_DIR = path.join(PROJECT_ROOT, 'hms-frontend');
const FRONTEND_PORT = 5173;

let backendProcess = null;
let frontendProcess = null;
let isShuttingDown = false;

function checkDatabaseUrl() {
  const envPath = path.join(BACKEND_DIR, '.env');
  let hasDbUrl = false;

  if (process.env.DATABASE_URL) {
    hasDbUrl = true;
  }

  if (!hasDbUrl && fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    if (envContent.includes('DATABASE_URL=')) {
      hasDbUrl = true;
    }
  }

  if (!hasDbUrl) {
    console.error('Error: DATABASE_URL not set');
    console.error(`Please create ${envPath} with:`);
    console.error('  DATABASE_URL=postgres://user:pass@host:5432/dbname');
    console.error('  PORT=4000');
    process.exit(1);
  }
}

function installDependencies() {
  return new Promise((resolve, reject) => {
    const tasks = [
      { dir: BACKEND_DIR, name: 'Backend' },
      { dir: FRONTEND_DIR, name: 'Frontend' },
    ];

    let completed = 0;
    let needsInstall = false;

    tasks.forEach(({ dir, name }) => {
      const nodeModulesPath = path.join(dir, 'node_modules');

      if (fs.existsSync(nodeModulesPath)) {
        completed++;
        if (completed === tasks.length) resolve();
        return;
      }

      needsInstall = true;
    });

    if (!needsInstall) {
      resolve();
      return;
    }

    tasks.forEach(({ dir, name }) => {
      const nodeModulesPath = path.join(dir, 'node_modules');

      if (fs.existsSync(nodeModulesPath)) {
        completed++;
        if (completed === tasks.length) resolve();
        return;
      }

      console.log(`Installing ${name} dependencies...`);

      const isWindows = process.platform === 'win32';
      const command = isWindows ? 'npm.cmd' : 'npm';
      const npmInstall = spawn(command, ['install'], {
        cwd: dir,
        stdio: 'pipe',
        shell: true,
      });

      npmInstall.stdout.on('data', (data) => {
        process.stdout.write(data);
      });

      npmInstall.stderr.on('data', (data) => {
        process.stderr.write(data);
      });

      npmInstall.on('close', (code) => {
        if (code === 0) {
          completed++;
          if (completed === tasks.length) resolve();
        } else {
          reject(new Error(`${name} npm install failed`));
        }
      });

      npmInstall.on('error', (err) => {
        reject(err);
      });
    });
  });
}

function startBackend() {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const command = isWindows ? 'node.exe' : 'node';

    backendProcess = spawn(command, ['server.js'], {
      cwd: BACKEND_DIR,
      stdio: 'ignore',
      shell: false,
      env: { ...process.env, NODE_NO_WARNINGS: '1' },
    });

    setTimeout(() => resolve(), 2000);

    backendProcess.on('error', (err) => {
      reject(err);
    });

    backendProcess.on('close', (code) => {
      if (!isShuttingDown) {
        console.error(`Backend exited with code ${code}`);
      }
    });
  });
}

function startFrontend() {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const command = isWindows ? 'npm.cmd' : 'npm';

    frontendProcess = spawn(command, ['run', 'dev'], {
      cwd: FRONTEND_DIR,
      stdio: 'ignore',
      shell: true,
    });

    setTimeout(() => resolve(), 2000);

    frontendProcess.on('error', (err) => {
      reject(err);
    });

    frontendProcess.on('close', (code) => {
      if (!isShuttingDown) {
        console.error(`Frontend exited with code ${code}`);
      }
    });
  });
}

function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  return new Promise((resolve) => {
    let stopped = 0;
    const toStop = [];

    if (backendProcess) toStop.push(backendProcess);
    if (frontendProcess) toStop.push(frontendProcess);

    if (toStop.length === 0) {
      resolve();
      return;
    }

    toStop.forEach((proc) => {
      proc.kill('SIGTERM');

      const killTimeout = setTimeout(() => {
        proc.kill('SIGKILL');
      }, 5000);

      proc.on('exit', () => {
        clearTimeout(killTimeout);
        stopped++;
        if (stopped === toStop.length) {
          resolve();
        }
      });
    });

    setTimeout(() => {
      resolve();
    }, 10000);
  });
}

process.on('SIGINT', async () => {
  console.log('\nStopped');
  await shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await shutdown();
  process.exit(0);
});

async function main() {
  try {
    checkDatabaseUrl();
    await installDependencies();
    await Promise.all([startBackend(), startFrontend()]);
    console.log(`\nHotel Management System is running at http://localhost:${FRONTEND_PORT}`);
    console.log('Press Ctrl+C to stop\n');
  } catch (error) {
    console.error('Error:', error.message);
    await shutdown();
    process.exit(1);
  }
}

main();
