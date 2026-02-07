import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateCommand(): void {
  console.log('BoondManager MCP Server - Configuration Validation\n');

  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  const envPath = join(process.cwd(), '.env');
  if (!existsSync(envPath)) {
    result.valid = false;
    result.errors.push("❌ .env file not found. Run 'boond-mcp init' to create it.");
  } else {
    console.log('✅ .env file exists');

    const envContent = readFileSync(envPath, 'utf-8');
    const envVars: Record<string, string> = {};

    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });

    const token = envVars['BOOND_API_TOKEN'];
    if (!token) {
      result.valid = false;
      result.errors.push('❌ BOOND_API_TOKEN is not set in .env file');
    } else if (token === 'your_api_token_here') {
      result.valid = false;
      result.errors.push('❌ BOOND_API_TOKEN is still set to placeholder value');
    } else if (token.length < 10) {
      result.valid = false;
      result.errors.push(
        '❌ BOOND_API_TOKEN appears to be too short (expected at least 10 characters)'
      );
    } else {
      console.log('✅ BOOND_API_TOKEN is set');
    }

    const apiUrl = envVars['BOOND_API_URL'];
    if (apiUrl) {
      try {
        const url = new URL(apiUrl);
        if (!url.protocol.startsWith('http')) {
          result.valid = false;
          result.errors.push('❌ BOOND_API_URL must use http or https protocol');
        } else {
          console.log('✅ BOOND_API_URL is valid');
        }
      } catch (error) {
        result.valid = false;
        result.errors.push(`❌ BOOND_API_URL is not a valid URL: ${apiUrl}`);
      }
    } else {
      console.log(
        'ℹ️  BOOND_API_URL not set (will use default: https://ui.boondmanager.com/api/1.0)'
      );
    }
  }

  console.log('\n' + '='.repeat(70));

  if (result.valid) {
    console.log('✅ Configuration is valid!');
    console.log('\nNext steps:');
    console.log("  - Run 'boond-mcp test' to verify API connectivity");
    console.log("  - Run 'boond-mcp doctor' to diagnose any issues");
  } else {
    console.log('❌ Configuration validation failed\n');

    if (result.errors.length > 0) {
      console.log('Errors:');
      result.errors.forEach(error => console.log(`  ${error}`));
    }

    if (result.warnings.length > 0) {
      console.log('\nWarnings:');
      result.warnings.forEach(warning => console.log(`  ${warning}`));
    }

    console.log("\nRun 'boond-mcp init' to reconfigure.");
    process.exit(1);
  }

  console.log('='.repeat(70));
}
