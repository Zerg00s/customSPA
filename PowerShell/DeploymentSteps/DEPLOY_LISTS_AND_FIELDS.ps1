function CreateList($ListName, $listType){
    if($listType -eq $null){
        $listType = "GenericList"
    }
	$list = Get-PnPList -Identity $ListName -Includes Fields
	if ($list -eq $null){
		$list = New-PnPList -Title $ListName -Template $listType -Url Lists/$ListName
	}
    
    while($list -eq $null){
        sleep -Milliseconds 20
        $list = Get-PnPList -Identity $ListName -Includes Fields
    }
	return $list
}

function CreateLibrary($ListName, $listType){
    Write-host "CHANGE"
    if($listType -eq $null){
        $listType = "DocumentLibrary"
    }
	$list = Get-PnPList -Identity $ListName -Includes Fields
	if ($list -eq $null){
		$list = New-PnPList -Title $ListName -Template $listType -Url $ListName
	}
    while($list -eq $null){
        sleep -Milliseconds 20
        $list = Get-PnPList -Identity $ListName -Includes Fields
    }
    Write-host "Retreived Library " + $list.Title
	return $list
}

function AddField($list, $fieldName, $fieldType){
Write-host "Adding $fieldName to list:" $list.Title
    $isError = $true
    while($isError -eq $true){
        try{
            $field = ($list.Fields) | Where-Object {$_.InternalName -eq $fieldName}
            
            if($field -eq $null){
                Add-PnPField -List $list -DisplayName $fieldName -InternalName $fieldName -Type $fieldType
                $DefaultView = $list.DefaultView
                $DefaultView.ViewFields.Add($field.Title)
                $DefaultView.Update()
                $context = $list.Context
                $context.ExecuteQuery()
            }
            $isError = $false
        }
        catch{
            $error = $true
            $listTitle = $list.Title
        }

    }
}

function AddRichHtmlField($list, $fieldName, $required){
	$guid = [guid]::NewGuid();
	$xml = '<Field Type="Note" RichTextMode="ThemeHtml" RichText="TRUE"  Name="'+$fieldName+'" StaticName="'+$fieldName+'" DisplayName="'+$fieldName+'" ID="{'+$guid + '}" Group="Custom" Required="'+$required+'"  />'
	Write-Host $xml 
    $isError = $true
    while($isError -eq $true){
        try{
            Add-PnPFieldFromXml -List $list -FieldXml $xml
            $isError  =$false;
        }
        catch{
            $isError = $true
        }
    }
}
# CREATE BannerItem list
$SigninsList = CreateList "Signins"
AddField $SigninsList "Email" "Text"
AddField $SigninsList "Purpose" "Text"
AddField $SigninsList "FullNames" "Note"
AddField $SigninsList "Hosts" "Note"
AddField $SigninsList "SignInTime" "Text"
AddField $SigninsList "SignOutTime" "Text"
AddField $SigninsList "Value" "Note"

$PhotoLibrary = CreateLibrary "Photos" "PictureLibrary"

AddField $PhotoLibrary "Email" "Text"
AddField $PhotoLibrary "FullName" "Text"
AddField $PhotoLibrary "Active" "Boolean"

$isError = $true;
while($isError){
    try{
        $items = Get-PnPListItem -List $PhotoLibrary
        $isError = $false
    }
    catch{Write-Host "error!";$isError = $true}
}

if ($items -ne $null){
    foreach($item in $items){
        Remove-PnPListItem -List $PhotoLibrary -Identity $item.id -ErrorAction SilentlyContinue -Confirm:$false -force
    }
}

Add-PNPFile -Path "DeploymentSteps\Photos\Denis.png" -folder "Photos" -Values @{Active=$true;Email="zergoos@zergoos.onmicrosoft.com";FullName="Denis Molodtsov"}
Add-PNPFile -Path "DeploymentSteps\Photos\John.png" -folder "Photos" -Values @{Active=$true;Email="zergoos@t.onmicrosoft.com";FullName="John Smith"}
Add-PNPFile -Path "DeploymentSteps\Photos\Collin.png" -folder "Photos" -Values @{Active=$true;Email="zergoos@t.onmicrosoft.com";FullName="Collin Turner"}
Add-PNPFile -Path "DeploymentSteps\Photos\Omar.png" -folder "Photos" -Values @{Active=$true;Email="zergoos@t.onmicrosoft.com";FullName="Omar Ikaputra"}

# # Create BannerItem list item
# $isError = $true;
# while($isError){
#     try{
#         $items = Get-PnPListItem -List $BannerItemList
#         $isError = $false
#     }
#     catch{$isError = $true; Write-Host 'error!'}
# }
# if ($items -ne $null){
#     Remove-PnPListItem -List $BannerItemList -Identity $items.id -ErrorAction SilentlyContinue -Confirm:$false -force
# }

# $item = Add-PnPListItem -List $BannerItemList
# $item["ShortText"] = "Short text is here 2"
# $item["DetailedText"] = "DetailedText"
# $Picture = "http://feline-nutrition.org/images/nutrition/the-skinny-on-senior-cats-metabolism-explained/nutrition_metabolism_01_categorym.jpg"
# $item["Picture"] = $Picture
# $item.Update()
# $context = $item.Context
# $context.ExecuteQuery()

# # CREATE Announcements list
# $AnnouncementsList = CreateList "Announcements"

# # Create Announcements list item
# $isError = $true;
# while($isError){
#     try{
#         $items = Get-PnPListItem -List $AnnouncementsList
#         $isError = $false
#     }
#     catch{$isError = $true}
# }

# if ($items -ne $null){
#     Remove-PnPListItem -List $AnnouncementsList -Identity $items.id -ErrorAction SilentlyContinue -Confirm:$false -force
# }

# $item = Add-PnPListItem -List $AnnouncementsList
# $item["Title"] = "This is a notification"
# $item.Update()
# $context = $item.Context
# $context.ExecuteQuery()


# # CREATE News list
# $NewsList = CreateList "News" "Announcements"
# AddField $NewsList "Topic" "Choice"
# # Create Announcements list item

# $isError = $true;
# while($isError){
#     try{
#         $items = Get-PnPListItem -List $NewsList
#         $isError = $false
#     }
#     catch{Write-Host "error!";$isError = $true}
    
# }

# if ($items -ne $null){
#     foreach($item in $items){
#         Remove-PnPListItem -List $NewsList -Identity $item.id -ErrorAction SilentlyContinue -Confirm:$false -force
#     }
# }

# $item = Add-PnPListItem -List $NewsList
# $item["Title"] = "This is a news item"
# $item["Topic"] = "Priority One"
# $item["Body"] = "News item"
# $item.Update()
# $context = $item.Context
# $context.ExecuteQuery()

# $item = Add-PnPListItem -List $NewsList
# $item["Title"] = "This is a news item"
# $item["Topic"] = "Operational Updates"
# $item["Body"] = "News item"
# $item.Update()
# $context = $item.Context
# $context.ExecuteQuery()

# $item = Add-PnPListItem -List $NewsList
# $item["Title"] = "This is a news item"
# $item["Topic"] = "Social Calendar"
# $item["Body"] = "News item"
# $item.Update()
# $context = $item.Context
# $context.ExecuteQuery()

# $item = Add-PnPListItem -List $NewsList
# $item["Title"] = "This is a news item"
# $item["Topic"] = "National News"
# $item["Body"] = "News item"
# $item.Update()
# $context = $item.Context
# $context.ExecuteQuery()


# # CREATE NewsRoom list
# $NewsRoomList = CreateList "NewsRoom" "Announcements"
# AddField $NewsRoomList "Topic" "Choice"


# $isError = $true;
# while($isError){
#     try{
#         $items = Get-PnPListItem -List $NewsRoomList
#         $isError = $false
#     }
#     catch{$isError = $true}
# }


# if ($items -ne $null){
#     foreach($item in $items){
#         Remove-PnPListItem -List $NewsRoomList -Identity $item.id -ErrorAction SilentlyContinue -Confirm:$false -force
#     }
# }

# $item = Add-PnPListItem -List $NewsRoomList
# $item["Title"] = "This is a news item"
# $item["Topic"] = "Our Media Releases"
# $item["Body"] = "News item"
# $item.Update()
# $context = $item.Context
# $context.ExecuteQuery()

# $item = Add-PnPListItem -List $NewsRoomList
# $item["Title"] = "This is a news item"
# $item["Topic"] = "News Coverage"
# $item["Body"] = "News item"
# $item.Update()
# $context = $item.Context
# $context.ExecuteQuery()

# $item = Add-PnPListItem -List $NewsRoomList
# $item["Title"] = "This is a news item"
# $item["Topic"] = "OACP News"
# $item["Body"] = "News item"
# $item.Update()
# $context = $item.Context
# $context.ExecuteQuery()

# $item = Add-PnPListItem -List $NewsRoomList
# $item["Title"] = "This is a news item"
# $item["Topic"] = "National News"
# $item["Body"] = "News item"
# $item.Update()
# $context = $item.Context
# $context.ExecuteQuery()
