#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scrubScript = path.join(__dirname, '..', 'scripts', 'scrub.ts');

const child = spawn('npx', ['tsx', scrubScript, ...process.argv.slice(2)], { stdio: 'inherit' });

child.on('exit', code => process.exit(code));
