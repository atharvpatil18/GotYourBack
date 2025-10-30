# PowerShell script to reset the GotYourBack database
# This script drops and recreates the database with the correct schema

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   GotYourBack Database Reset Script" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# MySQL connection parameters
$mysqlHost = "localhost"
$mysqlUser = "root"
Write-Host "MySQL Host: $mysqlHost" -ForegroundColor Yellow
Write-Host "MySQL User: $mysqlUser" -ForegroundColor Yellow
Write-Host ""

# Prompt for password
$mysqlPassword = Read-Host "Enter MySQL password for user '$mysqlUser'" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($mysqlPassword)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""
Write-Host "Connecting to MySQL..." -ForegroundColor Yellow

# Test MySQL connection
try {
    $testConnection = "mysql -h $mysqlHost -u $mysqlUser -p$plainPassword -e 'SELECT 1;' 2>&1"
    $result = Invoke-Expression $testConnection
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to connect to MySQL. Please check your credentials." -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Successfully connected to MySQL" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "ERROR: Failed to connect to MySQL: $_" -ForegroundColor Red
    exit 1
}

# Drop and recreate database
Write-Host "Dropping existing database 'gotyourback'..." -ForegroundColor Yellow
$dropDb = "mysql -h $mysqlHost -u $mysqlUser -p$plainPassword -e 'DROP DATABASE IF EXISTS gotyourback;' 2>&1"
Invoke-Expression $dropDb

Write-Host "✓ Database dropped" -ForegroundColor Green
Write-Host ""

Write-Host "Creating new database 'gotyourback'..." -ForegroundColor Yellow
$createDb = "mysql -h $mysqlHost -u $mysqlUser -p$plainPassword -e 'CREATE DATABASE gotyourback;' 2>&1"
Invoke-Expression $createDb

Write-Host "✓ Database created" -ForegroundColor Green
Write-Host ""

# Run migration scripts
$migrationDir = "src\main\resources\db\migration"
$migrations = @(
    "V1__create_tables.sql",
    "V2__add_messages_table.sql",
    "V3__create_notifications_table.sql",
    "V4__add_return_confirmation_fields.sql"
)

Write-Host "Running migration scripts..." -ForegroundColor Yellow
foreach ($migration in $migrations) {
    $migrationPath = Join-Path $migrationDir $migration
    if (Test-Path $migrationPath) {
        Write-Host "  Running: $migration" -ForegroundColor Cyan
        $runMigration = "mysql -h $mysqlHost -u $mysqlUser -p$plainPassword gotyourback < $migrationPath 2>&1"
        $result = Invoke-Expression $runMigration
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ $migration completed" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $migration failed: $result" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "  ! Migration file not found: $migrationPath" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Verifying database structure..." -ForegroundColor Yellow

# Verify tables exist
$verifyTables = "mysql -h $mysqlHost -u $mysqlUser -p$plainPassword gotyourback -e 'SHOW TABLES;' 2>&1"
$tables = Invoke-Expression $verifyTables

Write-Host "✓ Tables created:" -ForegroundColor Green
Write-Host $tables
Write-Host ""

# Verify request_status column
Write-Host "Verifying 'requests' table structure..." -ForegroundColor Yellow
$verifyRequests = "mysql -h $mysqlHost -u $mysqlUser -p$plainPassword gotyourback -e 'DESCRIBE requests;' 2>&1"
$requestsStructure = Invoke-Expression $verifyRequests

if ($requestsStructure -match "request_status") {
    Write-Host "✓ 'request_status' column exists" -ForegroundColor Green
} else {
    Write-Host "✗ 'request_status' column NOT found!" -ForegroundColor Red
    Write-Host $requestsStructure
}

Write-Host ""

# Verify item columns
Write-Host "Verifying 'items' table structure..." -ForegroundColor Yellow
$verifyItems = "mysql -h $mysqlHost -u $mysqlUser -p$plainPassword gotyourback -e 'DESCRIBE items;' 2>&1"
$itemsStructure = Invoke-Expression $verifyItems

if (($itemsStructure -match "item_type") -and ($itemsStructure -match "item_status")) {
    Write-Host "✓ 'item_type' and 'item_status' columns exist" -ForegroundColor Green
} else {
    Write-Host "✗ Item columns NOT correct!" -ForegroundColor Red
    Write-Host $itemsStructure
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Database Reset Complete!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your Spring Boot application:" -ForegroundColor White
Write-Host "   mvn spring-boot:run" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Test the application in your browser" -ForegroundColor White
Write-Host ""
