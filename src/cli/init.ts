import { input, confirm } from '@inquirer/prompts';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export async function initCommand(): Promise<void> {
  console.log('BoondManager MCP Server - Configuration Initialization\n');

  // Check if .env already exists
  const envPath = join(process.cwd(), '.env');
  if (existsSync(envPath)) {
    const overwrite = await confirm({
      message: '.env file already exists. Overwrite?',
      default: false,
    });
    if (!overwrite) {
      console.log('\nConfiguration unchanged.');
      return;
    }
  }

  // Prompt for API token
  const apiToken = await input({
    message: 'Enter your BoondManager API token:',
    required: true,
    validate: (value: string) => {
      if (!value || value.trim().length === 0) {
        return 'API token is required';
      }
      if (value === 'your_api_token_here') {
        return 'Please enter your actual API token, not the placeholder';
      }
      return true;
    },
  });

  // Prompt for custom API URL (optional)
  const useCustomUrl = await confirm({
    message: 'Use custom API URL?',
    default: false,
  });

  let apiUrl = 'https://ui.boondmanager.com/api';
  if (useCustomUrl) {
    apiUrl = await input({
      message: 'Enter custom API URL:',
      default: 'https://ui.boondmanager.com/api',
      required: true,
    });
  }

  // Create .env file
  let envContent = `BOOND_API_TOKEN=${apiToken}\n`;
  if (useCustomUrl) {
    envContent += `BOOND_API_URL=${apiUrl}\n`;
  }

  writeFileSync(envPath, envContent, 'utf-8');
  console.log(`\n✅ Configuration saved to ${envPath}`);

  // Show Claude Desktop integration instructions
  console.log('\n' + '='.repeat(70));
  console.log('Claude Desktop Integration');
  console.log('='.repeat(70));

  const configPath =
    process.platform === 'win32'
      ? join(process.env['APPDATA'] || '', 'Claude', 'claude_desktop_config.json')
      : join(homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');

  console.log(`\nTo use with Claude Desktop, add this to:\n${configPath}\n`);

  const projectPath = process.cwd();
  const configSnippet = {
    mcpServers: {
      'boond-mcp': {
        command: 'node',
        args: [join(projectPath, 'build', 'index.js')],
        env: {
          BOOND_API_TOKEN: apiToken,
        },
      },
    },
  };

  console.log(JSON.stringify(configSnippet, null, 2));
  console.log('\n' + '='.repeat(70));
  console.log("\n✅ Configuration complete! Run 'boond-mcp validate' to verify.");
}
