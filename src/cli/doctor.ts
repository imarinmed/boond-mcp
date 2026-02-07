import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import * as os from 'os';
import { BoondAPIClient } from '../api/client.js';

interface DiagnosticCheck {
  name: string;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface DiagnosticReport {
  checks: DiagnosticCheck[];
  overall: 'healthy' | 'issues' | 'errors';
}

export async function doctorCommand(): Promise<void> {
  console.log('🩺 BoondManager MCP Doctor');
  console.log('━'.repeat(70));

  const report: DiagnosticReport = {
    checks: [],
    overall: 'healthy',
  };

  // Check 1: .env File
  const envPath = join(process.cwd(), '.env');
  if (existsSync(envPath)) {
    report.checks.push({
      name: '.env file',
      status: 'success',
      message: `Found at ${envPath}`,
    });
  } else {
    report.checks.push({
      name: '.env file',
      status: 'error',
      message: `.env file not found at ${envPath}`,
    });
    report.overall = 'errors';
  }

  // Parse .env file
  const envVars: Record<string, string> = {};
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  }

  // Check 2: BOOND_API_TOKEN
  const token = envVars['BOOND_API_TOKEN'] || process.env['BOOND_API_TOKEN'];
  if (!token) {
    report.checks.push({
      name: 'BOOND_API_TOKEN',
      status: 'error',
      message: 'Not set in .env or environment',
    });
    report.overall = 'errors';
  } else if (token === 'your_api_token_here') {
    report.checks.push({
      name: 'BOOND_API_TOKEN',
      status: 'error',
      message: 'Still set to placeholder value',
    });
    report.overall = 'errors';
  } else if (token.length < 10) {
    report.checks.push({
      name: 'BOOND_API_TOKEN',
      status: 'error',
      message: `Token too short (${token.length} chars, need ≥10)`,
    });
    report.overall = 'errors';
  } else {
    report.checks.push({
      name: 'BOOND_API_TOKEN',
      status: 'success',
      message: `Valid (${token.length} characters)`,
    });
  }

  // Check 3: BOOND_API_URL (Optional)
  const apiUrl = envVars['BOOND_API_URL'] || process.env['BOOND_API_URL'];
  if (!apiUrl) {
    report.checks.push({
      name: 'BOOND_API_URL',
      status: 'info',
      message: 'Using default (https://ui.boondmanager.com/api/1.0)',
    });
  } else {
    try {
      const url = new URL(apiUrl);
      if (url.protocol.startsWith('http')) {
        report.checks.push({
          name: 'BOOND_API_URL',
          status: 'success',
          message: apiUrl,
        });
      } else {
        report.checks.push({
          name: 'BOOND_API_URL',
          status: 'error',
          message: `Invalid protocol (must be http/https): ${apiUrl}`,
        });
        report.overall = 'errors';
      }
    } catch (error) {
      report.checks.push({
        name: 'BOOND_API_URL',
        status: 'error',
        message: `Invalid URL format: ${apiUrl}`,
      });
      report.overall = 'errors';
    }
  }

  // Check 4: API Connectivity
  if (token && token !== 'your_api_token_here' && token.length >= 10) {
    try {
      const client = new BoondAPIClient(token, apiUrl);
      const result = await client.searchCandidates({
        page: 1,
        limit: 1,
      });
      report.checks.push({
        name: 'API Connectivity',
        status: 'success',
        message: `Connected (${result.pagination.total} candidates available)`,
      });
    } catch (error) {
      if (error instanceof Error) {
        let message = error.message;
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          message = 'Authentication failed (check BOOND_API_TOKEN)';
        } else if (error.message.includes('404')) {
          message = 'API endpoint not found (check BOOND_API_URL)';
        } else if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
          message = 'Network timeout (check connectivity)';
        }
        report.checks.push({
          name: 'API Connectivity',
          status: 'error',
          message,
        });
        report.overall = 'errors';
      } else {
        report.checks.push({
          name: 'API Connectivity',
          status: 'error',
          message: 'Unknown error',
        });
        report.overall = 'errors';
      }
    }
  } else {
    report.checks.push({
      name: 'API Connectivity',
      status: 'warning',
      message: 'Skipped (invalid token)',
    });
  }

  // Check 5: Claude Desktop Config (Platform-Specific)
  let claudeConfigPath: string | null = null;
  if (process.platform === 'darwin') {
    claudeConfigPath = join(
      os.homedir(),
      'Library',
      'Application Support',
      'Claude',
      'claude_desktop_config.json'
    );
  } else if (process.platform === 'win32') {
    const appData = process.env['APPDATA'];
    if (appData) {
      claudeConfigPath = join(appData, 'Claude', 'claude_desktop_config.json');
    }
  }

  if (claudeConfigPath) {
    if (existsSync(claudeConfigPath)) {
      try {
        const configContent = readFileSync(claudeConfigPath, 'utf-8');
        JSON.parse(configContent);
        report.checks.push({
          name: 'Claude Desktop Config',
          status: 'success',
          message: `Found at ${claudeConfigPath}`,
        });
      } catch (error) {
        report.checks.push({
          name: 'Claude Desktop Config',
          status: 'warning',
          message: `Found but invalid JSON at ${claudeConfigPath}`,
        });
      }
    } else {
      report.checks.push({
        name: 'Claude Desktop Config',
        status: 'info',
        message: `Not found at ${claudeConfigPath}`,
      });
    }
  } else {
    report.checks.push({
      name: 'Claude Desktop Config',
      status: 'info',
      message: 'Config check not available on this platform',
    });
  }

  // Check 6: package.json bin Field
  const packageJsonPath = join(process.cwd(), 'package.json');
  if (existsSync(packageJsonPath)) {
    try {
      const packageContent = readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageContent);

      if (packageJson.bin && packageJson.bin['boond-mcp'] && packageJson.bin['boond-mcp-server']) {
        report.checks.push({
          name: 'package.json bin field',
          status: 'success',
          message: 'Both boond-mcp and boond-mcp-server entries present',
        });
      } else {
        report.checks.push({
          name: 'package.json bin field',
          status: 'error',
          message: 'Missing boond-mcp or boond-mcp-server entries',
        });
        report.overall = 'errors';
      }
    } catch (error) {
      report.checks.push({
        name: 'package.json bin field',
        status: 'error',
        message: 'Failed to parse package.json',
      });
      report.overall = 'errors';
    }
  } else {
    report.checks.push({
      name: 'package.json bin field',
      status: 'error',
      message: 'package.json not found',
    });
    report.overall = 'errors';
  }

  // Display report
  displayReport(report);

  // Exit with appropriate code
  process.exit(report.overall === 'errors' ? 1 : 0);
}

function displayReport(report: DiagnosticReport): void {
  console.log('\n📋 Configuration Checks');
  const configChecks = report.checks.slice(0, 3);
  configChecks.forEach(check => {
    const symbol = getSymbol(check.status);
    console.log(`  ${symbol} ${check.name}: ${check.message}`);
  });

  console.log('\n🔌 API Connectivity');
  const apiCheck = report.checks.find(c => c.name === 'API Connectivity');
  if (apiCheck) {
    const symbol = getSymbol(apiCheck.status);
    console.log(`  ${symbol} ${apiCheck.message}`);
  }

  console.log('\n🖥️  Claude Desktop');
  const claudeCheck = report.checks.find(c => c.name === 'Claude Desktop Config');
  if (claudeCheck) {
    const symbol = getSymbol(claudeCheck.status);
    console.log(`  ${symbol} ${claudeCheck.message}`);
  }

  console.log('\n📦 Package Configuration');
  const binCheck = report.checks.find(c => c.name === 'package.json bin field');
  if (binCheck) {
    const symbol = getSymbol(binCheck.status);
    console.log(`  ${symbol} ${binCheck.message}`);
  }

  console.log('\n' + '━'.repeat(70));

  if (report.overall === 'healthy') {
    console.log('\n✅ All checks passed! Your BoondManager MCP setup is healthy.');
    console.log('\n💡 Next Steps:');
    console.log('  1. If Claude Desktop is running, restart it to reload the config');
    console.log('  2. Try asking Claude: "Search for candidates in BoondManager"');
  } else {
    console.log('\n⚠️  Some checks failed. Please review the errors above.');
    console.log('\n💡 Suggestions:');
    console.log('  1. Run `boond-mcp init` to set up configuration');
    console.log('  2. Run `boond-mcp validate` to validate settings');
    console.log('  3. Run `boond-mcp test` to test API connectivity');
  }

  console.log('\n' + '━'.repeat(70));
}

function getSymbol(status: string): string {
  switch (status) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️ ';
    case 'info':
      return 'ℹ️ ';
    default:
      return '  ';
  }
}
