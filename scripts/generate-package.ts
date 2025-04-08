#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { execSync } from 'child_process';

const SPACES = 4;
const ROOT = path.resolve(__dirname, '..');
const PACKAGES_DIR = path.join(ROOT, 'packages');

const { name } = yargs(hideBin(process.argv))
    .option('name', {
        alias: 'n',
        type: 'string',
        demandOption: true,
        description: 'Name of the package',
    })
    .parseSync();

const packagePath = path.join(PACKAGES_DIR, name);

if (!fs.existsSync(packagePath)) {
    fs.mkdirSync(packagePath, { recursive: true });
}

const tsconfig = {
    extends: '../../tsconfig.json',
    compilerOptions: {
        outDir: './dist',
    },
    include: ['./src/index.ts'],
};

fs.writeFileSync(
    path.join(packagePath, 'tsconfig.json'),
    JSON.stringify(tsconfig, null, SPACES)
);

const srcDir = path.join(packagePath, 'src');
fs.mkdirSync(srcDir, { recursive: true });
fs.writeFileSync(
    path.join(srcDir, 'index.ts'),
    `export const hello = () => 'Hello from ${name}';\\n`
);

fs.writeFileSync(
    path.join(packagePath, 'src', 'index.spec.ts'),
    `import { hello } from './';

describe('hello', () => {
  it('returns greeting', () => {
    expect(hello()).toBe('Hello from ${name}');
  });
});
`
);

fs.writeFileSync(
    path.join(packagePath, 'jest.config.js'),
    `module.exports = ${JSON.stringify({
        preset: 'ts-jest',
        collectCoverage: true, // Включает сбор покрытия кода
        coverageDirectory: './coverage', // Директория для хранения отчетов о покрытии
        coverageReporters: ['html', 'text', 'lcov'], // Форматы отчетов
        testEnvironment: 'node',
        transform: {
            '^.+\\.tsx?$': 'ts-jest',
        },
        moduleFileExtensions: ['ts', 'tsx', 'js'],
        transformIgnorePatterns: ['/node_modules/'],
    }, null, SPACES)};
`);

// fs.writeFileSync(
//     path.join(packagePath, '.eslintrc.json'),
//     JSON.stringify({
//         extends: ['../../.eslintrc.json'],
//     }, null, SPACES)
// );

fs.writeFileSync(path.join(packagePath, 'README.md'), `# @tsigel/${name}\\n`);

const packageJson = {
    name: `@tsigel/${name}`,
    version: '0.0.0',
    main: './dist/index.js',
    types: './dist/index.d.ts',
    files: ['dist'],
    repository: 'git@github.com:tsigel/tsigel.git',
    "publishConfig": {
        "access": "public"
    },
    scripts: {
        build: 'tsc',
        test: 'jest',
        lint: 'eslint ./src --ext .ts',
        prepublishOnly: 'npm run build && npm test',
    },
    keywords: [],
    author: '',
    license: 'ISC',
    description: ''
};

fs.writeFileSync(
    path.join(packagePath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
);

// Auto-install deps
console.log('📦 Installing dependencies...');
execSync('npm install -D @types/jest jest ts-jest typescript', { cwd: packagePath, stdio: 'inherit' });

// Update root package.json workspaces
const rootPkgPath = path.join(ROOT, 'package.json');
const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf-8'));

if (!rootPkg.workspaces) {
    rootPkg.workspaces = ['packages/*'];
} else if (!rootPkg.workspaces.includes('packages/*')) {
    rootPkg.workspaces.push('packages/*');
}

fs.writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2));

console.log(`✅ Package @tsigel/${name} scaffolded and added to workspaces.`);