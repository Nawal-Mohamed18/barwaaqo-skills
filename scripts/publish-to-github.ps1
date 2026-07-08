# Run after: gh auth login -h github.com -p https --web
$ErrorActionPreference = "Stop"
$gh = "$env:ProgramFiles\GitHub CLI\gh.exe"
$proj = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $proj

& $gh auth status
if ($LASTEXITCODE -ne 0) {
  Write-Host "Not logged in. Run: gh auth login -h github.com -p https --web"
  exit 1
}

$user = (& $gh api user -q .login).Trim()
Write-Host "GitHub user: $user"

# Update deploy URLs if username differs from Nawal-Mohamed18
if ($user -ne "Nawal-Mohamed18") {
  Write-Host "Updating deploy URLs for $user ..."
  $files = @("js/deploy-config.js", "js/lib/config.js", "README.md", "index.html")
  foreach ($f in $files) {
    if (Test-Path $f) {
      (Get-Content $f -Raw) -replace "Nawal-Mohamed18", $user | Set-Content $f -NoNewline
    }
  }
  git add js/deploy-config.js js/lib/config.js README.md index.html
  git commit -m "Update deploy URLs for GitHub user $user" 2>$null
}

& $gh repo create barwaaqo-skills --public --source=. --remote=origin --push --description "Barwaaqo Skills — free online LMS for Somalia and diaspora"

& $gh api repos/$user/barwaaqo-skills/pages -X POST -f build_type=workflow -f source[branch]=main 2>$null

Write-Host ""
Write-Host "Done!"
Write-Host "  GitHub:  https://github.com/$user/barwaaqo-skills"
Write-Host "  Website: https://$user.github.io/barwaaqo-skills/ (may take 2-5 min after Pages workflow runs)"
Write-Host ""
Write-Host "Next: deploy API on Render — https://dashboard.render.com → New → Blueprint → connect barwaaqo-skills repo"
Write-Host "Then set CORS_ORIGINS=https://$user.github.io and FRONTEND_URL=https://$user.github.io/barwaaqo-skills/"
