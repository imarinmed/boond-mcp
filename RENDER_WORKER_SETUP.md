# Render Background Worker Setup Guide

## Current Status

- **Problem**: Web Service `srv-d65h6gd6ubrc73951l10` exits early because MCP stdio transport is incompatible with Render's Web Service expectations
- **Solution**: Create a Background Worker (not a Web Service)

## Why Background Worker?

MCP servers using stdio transport don't expose HTTP endpoints. They communicate via stdin/stdout, which is perfect for Background Workers but incompatible with Web Services that expect a listening port.

## Manual Setup Steps (Required)

The Render MCP doesn't support creating Background Workers programmatically. You must create it via the dashboard:

### Step 1: Create Background Worker

1. Visit: https://dashboard.render.com/create
2. Click **"Background Worker"**
3. Connect repository:
   - **Git Provider**: GitHub
   - **Repository**: `imarinmed/boond-mcp`
   - **Branch**: `main`
4. Configure:
   - **Name**: `boond-mcp-worker` (or your preference)
   - **Runtime**: Docker (auto-detected from Dockerfile)
   - **Region**: Frankfurt (or your preferred region)
   - **Plan**: Free (or as needed)

### Step 2: Environment Variables

Add these in the dashboard:

```
BOOND_API_TOKEN=your_actual_token_here
# Optional: BOOND_API_URL=https://custom.boondmanager.com/api/1.0
```

### Step 3: Deploy

Click "Create Background Worker"

## Post-Setup (Automated Validation)

Once you provide the new service ID (format: `srv-xxxxxxxxxxxxxxxxxxxxx`), I will:

1. Monitor deploy status until live
2. Verify logs show stable stdio operation
3. Confirm old web service can be safely paused

## Migration Checklist

- [ ] Create Background Worker in Render dashboard
- [ ] Set `BOOND_API_TOKEN` environment variable
- [ ] Provide new service ID for automated validation
- [ ] Pause/delete old Web Service `srv-d65h6gd6ubrc73951l10`

## Notes

- No code changes required - Dockerfile already configured correctly
- Background Worker is the appropriate service type for MCP stdio servers
- Free plan includes 750 hours/month of background worker runtime
