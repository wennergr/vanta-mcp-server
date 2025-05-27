# Vanta MCP Server

A <a href="https://modelcontextprotocol.com/"> Model Context Protocol </a> server that provides access to Vanta's compliance and security platform. This enables AI assistants to interact with Vanta's API to retrieve compliance tests, framework information, and manage security findings.

> **⚠️ Important Disclaimer:** This server provides AI assistants with access to your Vanta compliance data. Always verify the accuracy and appropriateness of AI-generated responses before taking any compliance or security actions. Users are responsible for reviewing all outputs and ensuring they meet their organization's security and compliance requirements.

## Features

### Test Management

- Retrieve compliance tests with filtering options
- Get detailed test entity information
- Deactivate test entities during maintenance windows

### Framework Operations

- List available compliance frameworks
- Get detailed framework control information
- Support for SOC2, FedRAMP, CCPA, and other standards

### Multi-Region Support

- US, EU, and AUS regions
- Region-specific API endpoints

## Tools

| Tool Name                | Description                                                                            |
| ------------------------ | -------------------------------------------------------------------------------------- |
| `get_tests`              | Retrieve compliance tests with optional filtering by status, integration, or framework |
| `get_test_entities`      | Get entities (resources) associated with a specific test                               |
| `deactivate_test_entity` | Temporarily deactivate a test entity with reason and duration                          |
| `get_frameworks`         | List all available compliance frameworks                                               |
| `get_framework_controls` | Get detailed control information for a specific framework                              |
| `upload_document`        | Upload a file for compliance documentation and evidence                                |

## Configuration

### Getting a Vanta API Key

1. Generate your API key from the <a href="https://developer.vanta.com/docs/api-access-setup"> developer dashboard </a>

### Usage with Claude Desktop

Add the server to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "vanta": {
      "command": "npx",
      "args": ["-y", "@vanta/vanta-mcp-server"],
      "env": {
        "VANTA_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Usage with Cursor

Add the server to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "vanta": {
      "command": "npx",
      "args": ["-y", "@vanta/vanta-mcp-server"],
      "env": {
        "VANTA_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Environment Variables

- `VANTA_API_KEY` (required): Your Vanta API key
- `REGION` (optional): API region - `us`, `eu`, or `aus` (defaults to `us`)

## Installation

### NPX (Recommended)

```bash
npx vanta-mcp-server
```

### Global Installation

```bash
npm install -g vanta-mcp-server
vanta-mcp-server
```

### From Source

```bash
git clone https://github.com/VantaInc/vanta-mcp-server.git
cd vanta-mcp-server
npm install
npm run build
npm start
```

## Build

To build from source:

```bash
npm run build
```

This will:

1. Compile TypeScript to JavaScript
2. Make the output executable
3. Place built files in the `build/` directory

## Debugging

You can use the MCP Inspector to debug the server:

```bash
npx @modelcontextprotocol/inspector npx vanta-mcp-server
```

The inspector will open in your browser, allowing you to test tool calls and inspect the server's behavior.

## Example Usage

### Get failing AWS tests for SOC2

```typescript
{
  "tool": "get_tests",
  "arguments": {
    "statusFilter": "NEEDS_ATTENTION",
    "integrationFilter": "aws",
    "frameworkFilter": "soc2",
    "pageSize": 50
  }
}
```

### Deactivate entity during maintenance

```typescript
{
  "tool": "deactivate_test_entity",
  "arguments": {
    "testId": "aws-security-groups-open-to-world",
    "entityId": "sg-12345678",
    "deactivateReason": "Scheduled maintenance",
    "deactivateUntil": "2024-02-15T10:00:00Z"
  }
}
```

## License

This project is licensed under the terms of the MIT open source license. Please refer to [LICENSE](LICENSE) file for details.
