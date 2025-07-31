# Vanta MCP Server

A [Model Context Protocol](https://modelcontextprotocol.com/) server that provides access to Vanta's automated security compliance platform. Vanta helps organizations achieve and maintain compliance with security frameworks like SOC 2, ISO 27001, HIPAA, GDPR, and others through automated monitoring, evidence collection, and continuous security testing. This MCP server enables AI assistants to interact with Vanta's API to retrieve compliance test results, manage security findings, and access framework requirements.

> **⚠️ Important Disclaimer:** This experimental server is currently in **public preview** and provides AI assistants with access to your Vanta compliance data. You may encounter bugs, errors or unexpected results. Always verify the accuracy and appropriateness of AI-generated responses before taking any compliance or security actions. Users are responsible for reviewing all outputs and ensuring they meet their organization's security and compliance requirements.

## Features

### Security Test Management

- Access Vanta's 1,200+ automated security tests that run continuously to monitor compliance
- Retrieve test results with filtering by status (passing/failing), cloud provider (AWS/Azure/GCP), or compliance framework
- Get detailed information about failing resources (test entities) that need remediation

### Compliance Framework Operations

- Access 35+ supported compliance frameworks including SOC 2, ISO 27001, HIPAA, GDPR, FedRAMP, and PCI
- Retrieve detailed control requirements and evidence mappings for each framework
- Monitor framework completion progress and compliance status
- Get specific control details that map to automated tests and required documentation

### Security Control Management

- List all security controls across all compliance frameworks in your account
- View control names, descriptions, framework mappings, and implementation status
- Get specific tests that validate each security control
- Understand which automated tests monitor compliance for specific controls

### Multi-Region Support

- US, EU, and AUS regions with region-specific API endpoints
- Global compliance support for distributed organizations

## Tools

| Tool Name                | Description                                                                                                                                                                                                                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `get_tests`              | Retrieve Vanta's automated security and compliance tests. Filter by status (OK, NEEDS_ATTENTION, DEACTIVATED), cloud integration (aws, azure, gcp), or compliance framework (soc2, iso27001, hipaa). Returns test results showing which security controls are passing or failing across your infrastructure. |
| `get_test_entities`      | Get specific resources (entities) that are failing a particular security test. For example, if an AWS security group test is failing, this returns the actual security group IDs and details about what's wrong. Essential for understanding exactly which infrastructure components need remediation.       |
| `get_frameworks`         | List all compliance frameworks available in your Vanta account (SOC 2, ISO 27001, HIPAA, GDPR, FedRAMP, PCI, etc.) along with completion status and progress metrics. Shows which frameworks you're actively pursuing and their current compliance state.                                                    |
| `get_framework_controls` | Get detailed security control requirements for a specific compliance framework. Returns the specific controls, their descriptions, implementation guidance, and current compliance status. Essential for understanding what security measures are required for each compliance standard.                     |
| `get_controls`           | List all security controls across all frameworks in your Vanta account. Returns control names, descriptions, framework mappings, and current implementation status. Use this to see all available controls or to find a specific control ID for use with other tools.                                        |
| `get_control_tests`      | Get all automated tests that validate a specific security control. Use this when you know a control ID and want to see which specific tests monitor compliance for that control. Returns test details, current status, and any failing entities for the control's tests.                                     |
| `get_people`             | Returns a list of all people in your Vanta account. This includes employees, contractors, and other personnel who have access to your organization's systems and data. Use this to get information about team members for compliance and security management purposes.                                       |

## Configuration

### Vanta OAuth Credentials

1. Create OAuth credentials from [Vanta's developer dashboard](https://developer.vanta.com/docs/api-access-setup)
2. Save the `client_id` and `client_secret` to an env file:
   ```json
   {
     "client_id": "your_client_id_here",
     "client_secret": "your_client_secret_here"
   }
   ```

> **Note:** Vanta currently allows only a single active access_token per Application. [More info here](https://developer.vanta.com/docs/api-access-setup#authentication-and-token-retrieval)

### Usage with Claude Desktop

Add the server to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "vanta": {
      "command": "npx",
      "args": ["-y", "@vantasdk/vanta-mcp-server"],
      "env": {
        "VANTA_ENV_FILE": "/absolute/path/to/your/vanta-credentials.env"
      }
    }
  }
}
```

If you are unfamiliar with setting up MCP servers in Claude Desktop, [here is an example](https://modelcontextprotocol.io/quickstart/user) in the official MCP documentation.

### Usage with Cursor

Add the server to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "Vanta": {
      "command": "npx",
      "args": ["-y", "@vantasdk/vanta-mcp-server"],
      "env": {
        "VANTA_ENV_FILE": "/absolute/path/to/your/vanta-credentials.env"
      }
    }
  }
}
```

### Environment Variables

- `VANTA_ENV_FILE` (required): Absolute path to the JSON file containing your OAuth credentials
- `REGION` (optional): API region - `us`, `eu`, or `aus` (defaults to `us`)

## Installation

### NPX (Recommended)

```bash
npx @vantasdk/vanta-mcp-server
```

### Global Installation

```bash
npm install -g @vantasdk/vanta-mcp-server
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

## Build from Source

To build from source:

```bash
npm run build
```

This will:

1. Compile TypeScript to JavaScript
2. Make the output executable
3. Place built files in the `build/` directory

Now you can configure Claude Desktop or Cursor to use the built executable:

```json
{
  "mcpServers": {
    "Vanta": {
      "command": "node",
      "args": ["/absolute/path/to/vanta-mcp-server/build/index.js"],
      "env": {
        "VANTA_ENV_FILE": "/absolute/path/to/your/vanta-credentials.env"
      }
    }
  }
}
```

## Debugging

You can use the MCP Inspector to debug the server:

```bash
npx @modelcontextprotocol/inspector npx @vantasdk/vanta-mcp-server
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

## License

This project is licensed under the terms of the MIT open source license. Please refer to [LICENSE](LICENSE) file for details.
