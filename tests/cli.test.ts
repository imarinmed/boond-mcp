import { describe, test, expect } from 'vitest';
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const repoRoot = join(__dirname, '..');
const cliPath = join(repoRoot, 'build', 'bin', 'boond-mcp.js');

let buildReadyPromise: Promise<void> | null = null;

async function ensureBuiltCli(): Promise<void> {
  if (existsSync(cliPath)) {
    return;
  }

  if (!buildReadyPromise) {
    buildReadyPromise = new Promise((resolve, reject) => {
      const child = spawn('bun', ['run', 'build'], { cwd: repoRoot });

      let stderr = '';
      child.stderr.on('data', data => {
        stderr += data.toString();
      });

      child.on('close', exitCode => {
        if (exitCode === 0 && existsSync(cliPath)) {
          resolve();
          return;
        }

        reject(new Error(stderr || `CLI build failed with exit code ${exitCode}`));
      });
    });
  }

  await buildReadyPromise;
}

// Helper to run CLI command
async function runCLI(args: string[] = []): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number | null;
}> {
  await ensureBuiltCli();

  return new Promise(resolve => {
    const child = spawn('node', [cliPath, ...args]);

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', data => {
      stdout += data.toString();
    });
    child.stderr.on('data', data => {
      stderr += data.toString();
    });

    child.on('close', exitCode => {
      resolve({ stdout, stderr, exitCode });
    });
  });
}

const CLI_TEST_TIMEOUT_MS = 15000;

describe('CLI Framework', () => {
  describe('Version Flag', () => {
    test(
      'should display version with -v flag',
      async () => {
        const result = await runCLI(['-v']);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
      },
      CLI_TEST_TIMEOUT_MS
    );

    test(
      'should display version with --version flag',
      async () => {
        const result = await runCLI(['--version']);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
      },
      CLI_TEST_TIMEOUT_MS
    );
  });

  describe('Help Flag', () => {
    test(
      'should display help with -h flag',
      async () => {
        const result = await runCLI(['-h']);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('Usage:');
        expect(result.stdout).toContain('boond-mcp');
      },
      CLI_TEST_TIMEOUT_MS
    );

    test(
      'should display help with --help flag',
      async () => {
        const result = await runCLI(['--help']);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('Usage:');
        expect(result.stdout).toContain('boond-mcp');
      },
      CLI_TEST_TIMEOUT_MS
    );
  });

  describe('Subcommands', () => {
    test(
      "should recognize 'init' subcommand",
      async () => {
        const result = await runCLI(['init', '--help']);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('Initialize boond-mcp configuration');
      },
      CLI_TEST_TIMEOUT_MS
    );

    test(
      "should recognize 'validate' subcommand",
      async () => {
        const result = await runCLI(['validate', '--help']);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('Validate boond-mcp configuration');
      },
      CLI_TEST_TIMEOUT_MS
    );

    test(
      "should recognize 'test' subcommand",
      async () => {
        const result = await runCLI(['test', '--help']);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('Test API connection');
      },
      CLI_TEST_TIMEOUT_MS
    );

    test(
      "should recognize 'doctor' subcommand",
      async () => {
        const result = await runCLI(['doctor', '--help']);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('Diagnose boond-mcp setup and configuration issues');
      },
      CLI_TEST_TIMEOUT_MS
    );
  });
});

describe('Init Command', () => {
  test(
    'should display help for init command',
    async () => {
      const result = await runCLI(['init', '--help']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Initialize boond-mcp configuration');
    },
    CLI_TEST_TIMEOUT_MS
  );
});

describe('Validate Command', () => {
  test(
    'should recognize validate command',
    async () => {
      const result = await runCLI(['validate', '--help']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Validate boond-mcp configuration');
    },
    CLI_TEST_TIMEOUT_MS
  );
});

describe('Test Command', () => {
  test(
    'should recognize test command',
    async () => {
      const result = await runCLI(['test', '--help']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Test API connection');
    },
    CLI_TEST_TIMEOUT_MS
  );
});

describe('Doctor Command', () => {
  test(
    'should recognize doctor command',
    async () => {
      const result = await runCLI(['doctor', '--help']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Diagnose boond-mcp setup and configuration issues');
    },
    CLI_TEST_TIMEOUT_MS
  );
});
