ShopifyApp.configure do |config|
  config.application_name = "<%= @application_name %>"
  config.api_key = "<%= @api_key %>"
  config.secret = "<%= @secret %>"
  config.scope = "<%= @scope %>" # Consult this page for more scope options:
                                 # https://help.shopify.com/en/api/getting-started/authentication/oauth/scopes
  config.embedded_app = <%= embedded_app? %>
  config.after_authenticate_job = false
  config.session_repository = ShopifyApp::InMemorySessionStore
end
