#!/usr/bin/env node

/**
 * BoondManager MCP Server - Developer CLI Tool
 * Provides commands for configuration, validation, testing, and diagnostics
 */

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get package.json version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson: { version: string } = JSON.parse(
  readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf-8')
) as { version: string };

// Create CLI program
const program = new Command();

program
  .name('boond-mcp')
  .description('BoondManager MCP Server - Developer CLI Tool')
  .version(packageJson.version, '-v, --version', 'Display version number')
  .helpOption('-h, --help', 'Display help information');

// Placeholder subcommands (will be implemented in Tasks 4.3-4.6)
program
  .command('init')
  .description('Initialize boond-mcp configuration')
  .action(async () => {
    const { initCommand } = await import('../cli/init.js');
    await initCommand();
  });

program
  .command('validate')
  .description('Validate boond-mcp configuration')
  .action(async () => {
    const { validateCommand } = await import('../cli/validate.js');
    validateCommand();
  });

program
  .command('test')
  .description('Test API connection')
  .action(async () => {
    const { testCommand } = await import('../cli/test.js');
    await testCommand();
  });

program
  .command('doctor')
  .description('Diagnose boond-mcp setup and configuration issues')
  .action(async () => {
    const { doctorCommand } = await import('../cli/doctor.js');
    await doctorCommand();
  });

// Parse CLI arguments
program.parse(process.argv);
