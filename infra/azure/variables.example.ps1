$ResourceGroup = "rg-aulafy-staging"
$Location = "brazilsouth"
$AlternativeLocation = "eastus"

$AppServicePlan = "asp-aulafy-staging"
$ApiAppName = "aulafy-api-staging"
$StaticWebAppName = "aulafy-web-staging"

$PostgresServer = "psql-aulafy-staging"
$PostgresDatabase = "aulafy_db"
$PostgresAdminUser = "aulafy_user"

$GitHubRepository = "Kath-Valenzula/Aulafy"
$GitHubBranch = "develop"
$FrontendAppLocation = "frontend/aulafy-web"
$FrontendOutputLocation = "dist/aulafy-web/browser"

$BackendRuntime = "JAVA:17-java17"
$FrontendUrlPlaceholder = "https://placeholder-static-web-app-url"

$PostgresAdminPassword = $env:AULAFY_PG_PASSWORD
$JwtSecret = $env:AULAFY_JWT_SECRET
$TelegramBotToken = $env:TELEGRAM_BOT_TOKEN
$TelegramChatId = $env:TELEGRAM_CHAT_ID
