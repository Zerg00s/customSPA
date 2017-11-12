function UploadFolder ([string]$sourceFolderPath,[string]$destinationFolder){
    $destinationFolder = $destinationFolder.TrimEnd("/")
    $sourceFolderPath = (Get-Item $sourceFolderPath).FullName
    
    foreach($file in Get-ChildItem $sourceFolderPath)  
    {  
        if($file.PSIsContainer)
        {
            $folder = Ensure-PnPFolder -SiteRelativePath $destinationFolder"/"$file
            Write-host $folder.Name " folder created" -ForegroundColor Magenta
            UploadFolder $sourceFolderPath"\"$file $destinationFolder"/"$file

        }else{
            $file = Add-PnPFile -Path $file.FullName -Folder $destinationFolder
            Write-host $file.Name "uploaded" -ForegroundColor Green
        }
    }
}

# get destination folder URL from app.json:
$destFolder = (Get-Content -Path "..\config\app.json" -Raw | ConvertFrom-Json).spFolder

$folder -eq $null
while ($folder -eq $null) {
    try{
        $folder = Ensure-PnPFolder -SiteRelativePath $destFolder
    }
    catch{
        $isError = $true
    }
    $isError = $false
}

Write-Host $destFolder -ForegroundColor DarkMagenta

$loc = Get-Location
$sourceFolder = [System.IO.Path]::GetFullPath((Join-Path (pwd) "..\dist\"))

Write-Host $sourceFolder -ForegroundColor DarkMagenta

UploadFolder $sourceFolder $destFolder