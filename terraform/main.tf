terraform {
  required_providers {
    heroku = {
      source  = "heroku/heroku"
      version = ">= 5.0.0"
    }
  }
  required_version = ">= 1.0.0"
}

provider "heroku" {
  # Optionally set HEROKU_API_KEY as an environment variable for authentication
}

resource "heroku_app" "default" {
  name   = "my-heroku-app" 
  region = "us"            

  # Optional: Add buildpacks, stack, etc.
  # buildpacks = ["heroku/python"]
  # stack      = "heroku-20"

  config_vars = {
    "ENVIRONMENT" = "production"
  }
}

resource "heroku_addon" "logentries" {
  app  = heroku_app.default.name
  plan = "logentries:starter" 
}

output "heroku_app_url" {
  value = heroku_app.default.web_url
} 