# 🚀 Getting Started with BoondManager MCP Server

Welcome to the comprehensive guide for the BoondManager Model Context Protocol (MCP) server. This document will take you from a fresh installation to running complex business workflows using AI-powered tools.

The BoondManager MCP server acts as a bridge between your BoondManager ERP data and AI assistants like Claude. By following this guide, you'll enable your AI to search candidates, manage opportunities, track time, and handle financial records directly through natural language.

---

## 📋 Table of Contents

1.  [Introduction to MCP](#-introduction-to-mcp)
2.  [Prerequisites](#-prerequisites)
3.  [Installation](#-installation)
4.  [Configuration](#-configuration)
5.  [The BoondManager CLI](#-the-boondmanager-cli)
6.  [Your First Tool Call](#-your-first-tool-call)
7.  [Common Business Workflows](#-common-business-workflows)
8.  [Troubleshooting & Diagnostics](#-troubleshooting--diagnostics)
9.  [Security Best Practices](#-security-best-practices)
10. [Next Steps](#-next-steps)

---

## 🧩 Introduction to MCP

The **Model Context Protocol (MCP)** is an open standard that enables developers to build "connectors" for AI models. Instead of writing custom integrations for every AI tool, MCP provides a standardized way for AI assistants to discover and use tools provided by a server.

The BoondManager MCP server provides **121 specialized tools** that wrap the BoondManager REST API, allowing an AI to:

- **Understand your business context**: "Who are our top candidates in Paris?"
- **Perform actions**: "Create a new invoice for Acme Corp."
- **Automate workflows**: "Log my time for the week and submit it for approval."

---

## 🛠 Prerequisites

Before you begin, ensure your environment meets the following requirements:

### 1. Runtime Environment

- **Node.js**: Version 18.0.0 or higher.
- **Bun (Recommended)**: Version 1.0 or higher. Bun is significantly faster for installing dependencies and running the server.
  - _Check version_: `node -v` or `bun -v`

### 2. BoondManager Access

- **Active Account**: You need a valid login for a BoondManager instance.
- **API Access**: Your user profile must have permissions to use the API.
- **API Token**: This is your "key" to the server.
  - _Where to find it_: Log in to BoondManager -> Go to your **Profile** -> **Administration** -> **API Tokens**.
  - _Note_: If you don't see this section, contact your administrator.

### 3. AI Assistant

- **Claude Desktop**: The primary way to use this server is through the Claude Desktop application.
  - _Download_: [anthropic.com/claude/download](https://anthropic.com/claude/download)

---

## 🚀 Installation

Follow these steps to set up the server on your local machine.

### 1. Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/imarinmed/boond-mcp.git
cd boond-mcp
```

### 2. Install Dependencies

We recommend using Bun for a faster setup.

**Using Bun:**

```bash
bun install
```

**Using npm:**

```bash
npm install
```

### 3. Build the Project

The source code is written in TypeScript and must be compiled to JavaScript before use.

```bash
bun run build
# or
npm run build
```

This creates a `build/` directory containing the executable `index.js`.

### 4. Verify the Executable

Ensure the build was successful:

```bash
ls -la build/index.js
```

---

## ⚙️ Configuration

The server needs to know your API token to communicate with BoondManager.

### 1. Interactive Configuration (CLI)

The easiest way to configure the server is using the built-in `init` command:

```bash
bunx boond-mcp init
```

This interactive wizard will guide you through:

1.  **API Token**: Paste your token from the BoondManager admin panel.
2.  **API URL**: Press Enter to use the default (`https://ui.boondmanager.com/api/1.0`) or provide a custom URL (e.g., for a sandbox environment).

### 2. Manual Configuration (.env)

If you prefer manual setup, create a `.env` file in the root directory:

```env
# .env
BOOND_API_TOKEN=your_64_character_token_here
BOOND_API_URL=https://ui.boondmanager.com/api/1.0
```

### 3. Claude Desktop Setup

To make the tools available in Claude, you must register the server in Claude's configuration.

**Open your configuration file:**

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Add the BoondManager server:**

```json
{
  "mcpServers": {
    "boond-mcp": {
      "command": "node",
      "args": ["/Users/YOUR_USER/path/to/boond-mcp/build/index.js"],
      "env": {
        "BOOND_API_TOKEN": "your_api_token_here"
      }
    }
  }
}
```

⚠️ **CRITICAL**: You **must** use the absolute path to the `build/index.js` file. Relative paths like `./build/index.js` will not work.

---

## 🛠 The BoondManager CLI

The `boond-mcp` executable includes several utility commands to help you manage your server.

### `boond-mcp init`

Starts the interactive configuration wizard described above.

### `boond-mcp validate`

Checks your `.env` file for missing or invalid configuration values without making any network requests.

```bash
bunx boond-mcp validate
```

### `boond-mcp test`

Attempts to connect to the BoondManager API using your configured token. This is the best way to verify your credentials.

```bash
bunx boond-mcp test
```

### `boond-mcp doctor`

The ultimate diagnostic tool. It runs a suite of 6 checks:

1.  **Environment**: Verifies Node/Bun version.
2.  **Config**: Validates `.env` structure.
3.  **Build**: Ensures `build/index.js` exists.
4.  **Connectivity**: Tests API reachability.
5.  **Authentication**: Verifies the API token.
6.  **Permissions**: Checks if the token has basic read access.

```bash
bunx boond-mcp doctor
```

---

## 🔍 Your First Tool Call

After restarting Claude Desktop, you should see a small 🔌 icon or a "BoondManager" entry in the tools menu.

### Example 1: Simple Search

**You**: _"Search for candidates with 'React' experience."_

**Claude's Action**: Calls `boond_candidates_search({ query: "React" })`.

**Result**: Claude displays a list of matching candidates with their IDs and status.

### Example 2: Deep Dive

**You**: _"Tell me more about candidate cand_123. What is their current status and when were they last updated?"_

**Claude's Action**: Calls `boond_candidates_get({ id: "cand_123" })`.

### Example 3: Data Entry

**You**: _"Create a new candidate: Marc Dupont, marc.d@email.com, based in Lyon."_

**Claude's Action**: Calls `boond_candidates_create({ firstName: "Marc", lastName: "Dupont", email: "marc.d@email.com", city: "Lyon" })`.

---

## 🔄 Common Business Workflows

Here is how you can use the AI to handle end-to-end business processes.

### 👥 HR: Recruitment to Onboarding

1.  **Sourcing**: _"Find all candidates who applied this week for the 'Senior Architect' position."_
2.  **Evaluation**: _"Summarize the profile of the top 3 candidates."_
3.  **Contact**: _"Create a contact record for the best candidate at their current company."_
4.  **Contracting**: _"Draft a new contract for resource res_456 starting next month with a salary of €60,000."_

### 💼 CRM: Lead to Quotation

1.  **Prospecting**: _"Search for companies in the 'Automotive' industry that we haven't contacted in 6 months."_
2.  **Opportunity**: _"Create a new opportunity for 'Renault' titled 'EV Dashboard Project' with a 70% probability."_
3.  **Quoting**: _"Generate a quotation for the 'EV Dashboard Project' for a total of €45,000, valid until the end of the year."_

### 💰 Finance: Invoice Lifecycle

1.  **Monitoring**: _"List all invoices that are currently 'Overdue'."_
2.  **Action**: _"For each overdue invoice, find the primary contact's email address."_
3.  **Reporting**: _"Calculate the total outstanding amount for Q1 2024."_

### ⏱️ Time & Expenses: Employee Self-Service

1.  **Time Entry**: _"Log 4 hours on 'Project Alpha' and 4 hours on 'Project Beta' for every day this week."_
2.  **Absence**: _"I'm feeling sick today. Create a sick leave request for today."_
3.  **Expenses**: _"Create an expense report for my train ticket (ID: exp_789) for €85.50."_

---

## 🚑 Troubleshooting & Diagnostics

If things aren't working as expected, follow this checklist:

### 1. Authentication Errors (401)

- **Symptoms**: Claude says "Authentication failed" or "Invalid token".
- **Fix**: Run `bunx boond-mcp test`. If it fails, double-check your token in `.env` and ensure it hasn't expired in the BoondManager UI.

### 2. Resource Not Found (404)

- **Symptoms**: "Candidate not found" or "Invalid ID".
- **Fix**: Ensure you are using the correct ID format (e.g., `cand_123`, not just `123`). IDs are case-sensitive.

### 3. Validation Errors (422)

- **Symptoms**: "Missing required field" or "Invalid date format".
- **Fix**: Provide all mandatory fields. Dates must be in `YYYY-MM-DD` format.

### 4. Claude Connection Issues

- **Symptoms**: Claude says "Server not responding" or the tools don't appear.
- **Fix**:
  1.  Check the absolute path in `claude_desktop_config.json`.
  2.  Ensure you ran `bun run build`.
  3.  Check Claude's logs: `tail -f ~/Library/Logs/Claude/mcp.log` (macOS).

---

## 🔒 Security Best Practices

- **Token Safety**: Your `BOOND_API_TOKEN` provides full access to your data. **Never** share it, commit it to Git, or paste it into public forums.
- **Environment Variables**: Always use `.env` files (which are gitignored) rather than hardcoding tokens in your source code.
- **Least Privilege**: If possible, use a BoondManager account with only the permissions necessary for the tasks you want the AI to perform.
- **Review Actions**: Always review the parameters Claude is about to send (especially for `create`, `update`, or `delete` operations) before confirming.

---

## ⏭️ Next Steps

Now that you're up and running, explore these resources:

- **[Full API Reference](./API_REFERENCE.md)**: A complete list of all 121 tools and their parameters.
- **[Setup Guide](../SETUP.md)**: More details on production deployments and environment variables.
- **[Contributing Guide](../CONTRIBUTING.md)**: Want to add a new tool? Learn how to contribute to the project.

---

💡 **Pro Tip**: You can ask Claude to _"List all available BoondManager tools"_ at any time to see a categorized summary of what it can do!
