# BoondManager MCP Server - Setup Guide

## Prerequisites

Before you begin, ensure you have one of the following installed:

- **Node.js 18+** (with npm or yarn)
- **Bun** (recommended for this project) - https://bun.sh

You'll also need a **BoondManager API token**. Obtain this from your BoondManager account.

## Installation Steps

### 1. Clone or Download the Repository

```bash
git clone https://github.com/yourusername/boond-mcp.git
cd boond-mcp
```

Or if distributed as a ZIP/archive:
```bash
unzip boond-mcp.zip
cd boond-mcp
```

### 2. Install Dependencies

Using Bun (recommended):
```bash
bun install
```

Using Node.js:
```bash
npm install
# or
yarn install
```

### 3. Build the Project

Using Bun:
```bash
bun run build
```

Using Node.js:
```bash
npm run build
# or
yarn build
```

### 4. Create Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your BoondManager API token:
```env
BOOND_API_TOKEN=your_actual_api_token_here
```

⚠️ **SECURITY WARNING**: Never commit `.env` to version control. This file is gitignored automatically.

## Claude Desktop Configuration

### macOS Setup

1. Locate your Claude Desktop configuration:
   ```bash
   ~/Library/Application Support/Claude/claude_desktop_config.json
   ```

2. Open the file in your text editor and add the following configuration:

```json
{
  "mcpServers": {
    "boondmanager": {
      "command": "bun",
      "args": ["/absolute/path/to/boond-mcp/build/index.js"],
      "env": {
        "BOOND_API_TOKEN": "your_api_token_here"
      }
    }
  }
}
```

**Important**: Replace `/absolute/path/to` with the actual full path to your boond-mcp directory.

To find the absolute path:
```bash
pwd
# Copy this output and use it in the configuration
```

### Windows Setup

1. Locate your Claude Desktop configuration:
   ```
   %APPDATA%/Claude/claude_desktop_config.json
   ```

2. Add the same configuration as above, using Windows paths:
   ```json
   {
     "mcpServers": {
       "boondmanager": {
         "command": "bun",
         "args": ["C:\\absolute\\path\\to\\boond-mcp\\build\\index.js"],
         "env": {
           "BOOND_API_TOKEN": "your_api_token_here"
         }
       }
     }
   }
   ```

### Linux Setup

1. Locate your Claude Desktop configuration:
   ```
   ~/.config/Claude/claude_desktop_config.json
   ```

2. Add the configuration as shown in macOS example above.

3. Restart Claude Desktop to load the new configuration.

## Testing the Installation

### Test 1: Verify Build Works

```bash
ls -la build/index.js
# Should show the built MCP server file
```

### Test 2: List Available Tools

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | BOOND_API_TOKEN=test bun build/index.js 2>&1 | head -20
```

Expected output should show JSON response with tool definitions.

### Test 3: Test with Actual API Token

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | BOOND_API_TOKEN=your_token_here bun build/index.js 2>&1 | jq '.result.tools | length'
```

Should return the number of tools (should be 94+).

### Test 4: Restart Claude Desktop

1. Completely quit Claude Desktop
2. Reopen Claude Desktop
3. Look for a "BoondManager" option in the MCP menu (should appear after a few seconds)
4. If visible, the connection is working!

## Configuration Details

### Environment Variables

The server uses the following environment variable:

| Variable | Required | Description |
|----------|----------|-------------|
| `BOOND_API_TOKEN` | Yes | Your BoondManager API authentication token |

### API Endpoint

By default, the server connects to:
```
https://ui.boondmanager.com/api
```

To use a different endpoint (e.g., sandbox), modify the client configuration in `src/api/client.ts`.

## Troubleshooting

### "BOOND_API_TOKEN is not set"

**Problem**: The server can't find your API token.

**Solution**:
1. Ensure `.env` file exists in the project root
2. Verify the file contains: `BOOND_API_TOKEN=your_token_here`
3. For Claude Desktop config, ensure the token is in the `env` section
4. Don't include quotes around the token value

### "bun: command not found" or "node: command not found"

**Problem**: Bun or Node.js is not installed or not in PATH.

**Solution**:
1. Install Bun: `curl -fsSL https://bun.sh/install | bash`
2. Install Node.js: https://nodejs.org/
3. Verify installation: `bun --version` or `node --version`

### Build fails with TypeScript errors

**Problem**: `npm run build` or `bun run build` fails.

**Solution**:
1. Ensure all dependencies are installed: `bun install` or `npm install`
2. Check Node.js version: `node --version` (should be 18+)
3. Delete `node_modules` and rebuild:
   ```bash
   rm -rf node_modules
   bun install
   bun run build
   ```

### Claude Desktop shows "Unable to connect to MCP server"

**Problem**: Claude can't connect to the MCP server.

**Solution**:
1. Verify `build/index.js` exists: `ls -la build/index.js`
2. Check the path in `claude_desktop_config.json` is absolute and correct
3. Test the server directly:
   ```bash
   BOOND_API_TOKEN=test bun build/index.js
   ```
4. Restart Claude Desktop completely (quit and reopen)
5. Check for typos in the config file (JSON syntax matters!)

### "Authentication failed" or 401 errors

**Problem**: API token is invalid or expired.

**Solution**:
1. Verify your API token is correct
2. Check if the token has expired
3. Regenerate a new token from your BoondManager account
4. Update `.env` with the new token
5. Restart Claude Desktop

### "Permission denied" errors in Claude Desktop config path

**Problem**: Can't access the config file.

**Solution**:
1. Ensure the path exists (create directories if needed)
2. Check file permissions: `ls -la ~/Library/Application\ Support/Claude/`
3. Try creating the file with proper permissions

## Next Steps

1. Start using the BoondManager tools in Claude Desktop
2. Try example queries from the main README.md
3. Report any issues or feature requests to your team

## Support

For issues or questions:
- Check the main README.md for detailed tool documentation
- Review DISTRIBUTION.md for other deployment methods
- Contact your team administrator

## Updates

To get the latest version:

```bash
git pull origin main
bun install
bun run build
```

Then restart Claude Desktop to load the updated tools.
