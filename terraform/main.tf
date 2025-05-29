terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.0"
    }
  }
  required_version = ">= 1.0.0"
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_cloudwatch_log_group" "this" {
  name              = "/aws/lambda/prod-app-log-group"
  retention_in_days = 30                               
  tags = {
    Environment = "production"
    Project     = "my-prod-app"
    ManagedBy   = "Terraform"
  }
} 