# Vanta MCP Server

A <a href="https://modelcontextprotocol.com/"> Model Context Protocol </a> server that provides access to Vanta's automated security compliance platform. Vanta helps organizations achieve and maintain compliance with security frameworks like SOC 2, ISO 27001, HIPAA, GDPR, and others through automated monitoring, evidence collection, and continuous security testing. This MCP server enables AI assistants to interact with Vanta's API to retrieve compliance test results, manage security findings, access framework requirements, and handle compliance documentation.

> **⚠️ Important Disclaimer:** This server provides AI assistants with access to your Vanta compliance data. Always verify the accuracy and appropriateness of AI-generated responses before taking any compliance or security actions. Users are responsible for reviewing all outputs and ensuring they meet their organization's security and compliance requirements.

## Features

### Security Test Management

- Access Vanta's 1,200+ automated security tests that run continuously to monitor compliance
- Retrieve test results with filtering by status (passing/failing), cloud provider (AWS/Azure/GCP), or compliance framework
- Get detailed information about failing resources (test entities) that need remediation
- Temporarily deactivate specific test entities during planned maintenance or remediation work

### Compliance Framework Operations

- Access 35+ supported compliance frameworks including SOC 2, ISO 27001, HIPAA, GDPR, FedRAMP, and PCI
- Retrieve detailed control requirements and evidence mappings for each framework
- Monitor framework completion progress and compliance status
- Get specific control details that map to automated tests and required documentation

### Document and Evidence Management

- Upload compliance documentation and evidence files required for audits

### Multi-Region Support

- US, EU, and AUS regions with region-specific API endpoints
- Global compliance support for distributed organizations

## Tools

| Tool Name                | Description                                                                                                                                                                                                                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `get_tests`              | Retrieve Vanta's automated security and compliance tests. Filter by status (OK, NEEDS_ATTENTION, DEACTIVATED), cloud integration (aws, azure, gcp), or compliance framework (soc2, iso27001, hipaa). Returns test results showing which security controls are passing or failing across your infrastructure. |
| `get_test_entities`      | Get specific resources (entities) that are failing a particular security test. For example, if an AWS security group test is failing, this returns the actual security group IDs and details about what's wrong. Essential for understanding exactly which infrastructure components need remediation.       |
| `deactivate_test_entity` | Temporarily suppress alerts for a specific failing resource during planned maintenance, system updates, or while remediation is in progress. Requires a business justification and end date. Helps manage security alerts during planned operational activities without compromising audit trails.           |
| `get_frameworks`         | List all compliance frameworks available in your Vanta account (SOC 2, ISO 27001, HIPAA, GDPR, FedRAMP, PCI, etc.) along with completion status and progress metrics. Shows which frameworks you're actively pursuing and their current compliance state.                                                    |
| `get_framework_controls` | Get detailed security control requirements for a specific compliance framework. Returns the specific controls, their descriptions, implementation guidance, and current compliance status. Essential for understanding what security measures are required for each compliance standard.                     |
| `upload_document`        | Upload compliance documentation and evidence files to Vanta. Used for policy documents, procedures, audit evidence, and proof of security control implementation. Supports the documentation requirements needed for compliance audits and framework certification.                                          |

## Configuration

### Vanta OAuth Credentials

1. Create OAuth credentials from the <a href="https://developer.vanta.com/docs/api-access-setup"> developer dashboard </a>
2. Save the `client_id` and `client_secret` to a env file:
   ```json
   {
     "client_id": "your_client_id_here",
     "client_secret": "your_client_secret_here"
   }
   ```

> **Note:** Vanta currently only allows a single active access_token per Application today. [More info here](https://developer.vanta.com/docs/api-access-setup#authentication-and-token-retrieval)

### Usage with Claude Desktop

Add the server to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "vanta": {
      "command": "npx",
      "args": ["-y", "@vanta/vanta-mcp-server"],
      "env": {
        "VANTA_ENV_FILE": "/absolute/path/to/your/vanta-credentials.env"
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
    "Vanta": {
      "command": "npx",
      "args": ["-y", "@vanta/vanta-mcp-server"],
      "env": {
        "VANTA_ENV_FILE": "/absolute/path/to/your/vanta-credentials.json"
      }
    }
  }
}
```

### Environment Variables

- `VANTA_ENV_FILE` (required): Absolute path to JSON file containing OAuth credentials
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
