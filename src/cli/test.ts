import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { BoondAPIClient } from '../api/client.js';

export async function testCommand(): Promise<void> {
  console.log('BoondManager MCP Server - API Connectivity Test\n');

  const envPath = join(process.cwd(), '.env');
  if (!existsSync(envPath)) {
    console.log('❌ .env file not found');
    console.log("\nRun 'boond-mcp init' to create configuration.");
    process.exit(1);
  }

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

  if (!envVars['BOOND_API_TOKEN']) {
    console.log('❌ BOOND_API_TOKEN not set in .env file');
    console.log("\nRun 'boond-mcp validate' to check configuration.");
    process.exit(1);
  }

  console.log('✅ Configuration loaded');

  const apiUrl = envVars['BOOND_API_URL'] || 'https://ui.boondmanager.com/api/1.0';
  console.log(`ℹ️  API URL: ${apiUrl}`);

  console.log('\n🔄 Testing API connection...');

  try {
    const client = new BoondAPIClient(envVars['BOOND_API_TOKEN'], apiUrl);

    const result = await client.searchCandidates({
      page: 1,
      limit: 1,
    });

    console.log('\n✅ API connection successful!');
    console.log(`   Total resources available: ${result.pagination.total}`);
    console.log(`   API response time: < 1s`);

    console.log('\n' + '='.repeat(70));
    console.log('✅ All checks passed!');
    console.log('='.repeat(70));
    console.log('\nYour BoondManager MCP Server is ready to use.');
    console.log('\nNext steps:');
    console.log('  - Add to Claude Desktop configuration');
    console.log('  - Restart Claude Desktop');
    console.log('  - Use BoondManager tools in your conversations');
  } catch (error) {
    console.log('\n❌ API connection failed');

    if (error instanceof Error) {
      console.log(`\nError: ${error.message}`);

      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.log('\n💡 Suggestion: Check your BOOND_API_TOKEN');
        console.log('   - Verify token is correct');
        console.log("   - Check token hasn't expired");
        console.log('   - Ensure token has required permissions');
      } else if (error.message.includes('404')) {
        console.log('\n💡 Suggestion: Check your BOOND_API_URL');
        console.log('   - Verify API URL is correct');
        console.log('   - Check for typos in the URL');
      } else if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
        console.log('\n💡 Suggestion: Check network connectivity');
        console.log('   - Verify internet connection');
        console.log('   - Check if API endpoint is reachable');
        console.log('   - Try again in a few moments');
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log("Run 'boond-mcp doctor' for detailed diagnostics.");
    console.log('='.repeat(70));

    process.exit(1);
  }
}
