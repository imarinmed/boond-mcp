import { describe, test, expect } from 'vitest';
import { spawn } from 'child_process';
import { join } from 'path';

// Helper to run CLI command
async function runCLI(args: string[] = []): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number | null;
}> {
  return new Promise(resolve => {
    const cliPath = join(__dirname, '..', 'build', 'bin', 'boond-mcp.js');
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

describe('CLI Framework', () => {
  describe('Version Flag', () => {
    test('should display version with -v flag', async () => {
      const result = await runCLI(['-v']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
    });

    test('should display version with --version flag', async () => {
      const result = await runCLI(['--version']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
    });
  });

  describe('Help Flag', () => {
    test('should display help with -h flag', async () => {
      const result = await runCLI(['-h']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Usage:');
      expect(result.stdout).toContain('boond-mcp');
    });

    test('should display help with --help flag', async () => {
      const result = await runCLI(['--help']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Usage:');
      expect(result.stdout).toContain('boond-mcp');
    });
  });

  describe('Subcommands', () => {
    test("should recognize 'init' subcommand", async () => {
      const result = await runCLI(['init', '--help']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Initialize boond-mcp configuration');
    });

    test("should recognize 'validate' subcommand", async () => {
      const result = await runCLI(['validate']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('validate');
    });

    test("should recognize 'test' subcommand", async () => {
      const result = await runCLI(['test']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('test');
    });

    test("should recognize 'doctor' subcommand", async () => {
      const result = await runCLI(['doctor']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('doctor');
    });
  });
});

describe('Init Command', () => {
  test('should display help for init command', async () => {
    const result = await runCLI(['init', '--help']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Initialize boond-mcp configuration');
  });
});
