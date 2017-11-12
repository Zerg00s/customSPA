$PageUrl = $SERVER_RELATIVE_WEB + "/SitePages/Home.aspx"
$TempPageUrl = $SERVER_RELATIVE_WEB + "/SitePages/TempPage.aspx"
$CewpLink = $TARGET_SITE_URL + "/_catalogs/masterpage/reception/home.html"
$WebPartTitle  = "CEWP"
$ErrorActionPreference = "Stop";

$webpart = "<?xml version='1.0' encoding='utf-8'?>
	<WebPart xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns='http://schemas.microsoft.com/WebPart/v2'>
	  <Title>"+ $WebPartTitle +"</Title>
	  <FrameType>None</FrameType>
	  <Description />
	  <IsIncluded>true</IsIncluded>
	  <PartOrder>0</PartOrder>
	  <FrameState>Normal</FrameState>
	  <Height />
	  <Width />
	  <ChromeType>None</ChromeType>
	  <AllowRemove>true</AllowRemove>
	  <AllowZoneChange>true</AllowZoneChange>
	  <AllowMinimize>true</AllowMinimize>
	  <AllowConnect>true</AllowConnect>
	  <AllowEdit>true</AllowEdit>
	  <AllowHide>true</AllowHide>
	  <IsVisible>true</IsVisible>
	  <DetailLink />
	  <HelpLink />
	  <HelpMode>Modeless</HelpMode>
	  <Dir>Default</Dir>
	  <PartImageSmall />
	  <MissingAssembly>Cannot import this Web Part.</MissingAssembly>
	  <PartImageLarge>/_layouts/15/images/mscontl.gif</PartImageLarge>
	  <IsIncludedFilter />
	  <ContentLink>" + $CewpLink + "</ContentLink>
	  <Assembly>Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c</Assembly>
	  <TypeName>Microsoft.SharePoint.WebPartPages.ContentEditorWebPart</TypeName>
	  <ContentLink xmlns='http://schemas.microsoft.com/WebPart/v2/ContentEditor'>"+ $CewpLink + "</ContentLink>
	  <Content xmlns='http://schemas.microsoft.com/WebPart/v2/ContentEditor' />
	  <PartStorage xmlns='http://schemas.microsoft.com/WebPart/v2/ContentEditor' />
	</WebPart>"


# Enable Wiki Home Page Feature. When activated, it creates SitePages library that we will use
#$WikiHomePageFeature = "00bfea71-d8fe-4fec-8dad-01c19a6e4053"
#Enable-PnPFeature -Identity $WikiHomePageFeature -Scope Web


Add-PnPWikiPage -PageUrl $TempPageUrl -Layout 3 -ErrorAction Ignore
Set-PnPHomePage -RootFolderRelativeUrl "SitePages/TempPage.aspx"

Remove-PnPWikiPage -PageUrl $PageUrl

Write-host "Creating page" $PageUrl
Add-PnPWikiPage -PageUrl $PageUrl -Layout 3 

# Remove the webpart:
Remove-PnPWebPart -Title $WebPartTitle -ServerRelativePageUrl $PageUrl

# Now add the webpart back:
Add-PnPWebPartToWikiPage -ServerRelativePageUrl $PageUrl -XML $webpart -Row 1 -Column 1

# SET A HOME PAGE:
Set-PnPHomePage -RootFolderRelativeUrl "SitePages/Home.aspx"
