<!DOCTYPE html>
<html lang="en" class='main-background'>

<head>
    <title>Reception</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">
    <link rel="stylesheet" href="style.css?ver=6">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto%3A300%2C300italic%2C700%2C700italic%7CRoboto+Slab%3A300%7CRaleway%3A900%2C300&amp;subset=latin%2Clatin-ext&amp;ver=4.6.4"
        type="text/css">
</head> 

<body> 
    <div ng-app='kiosk' ng-controller='KioskController as kiosk' ng-cloak >
        <div class='top-ribbon'>
            <h1 class="center-block" style="color:white !important; width:180px;padding-top:14px"><a style="color:white" href='../../../'>Reception</a></h1>
        </div>

        <div class='main-background'>
            <div>
                <a ng-show="kiosk.location.url() != '/Welcome'" href="#!/Welcome" class='btn btn-primary btn-kiosk back-button btn-kiosk-blue'><i class="fa fa-arrow-left"></i> Back</a>
                <p class='hero-heading'>{{kiosk.message}}</p>
            </div>
            <div class='circles'>
                <span class="circle orange" style='color:rgb(242, 42, 104)'><i ></i></span>
                <span class="circle blue" style='color:rgb(0, 226, 178)'><i ></i></span>
                <span class="circle green" style='color:rgb(0, 109, 149)'><i  ></i></span>
            </div>

            <div ng-view class='view' class="view-animation"></div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.1/angular.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.1/angular-route.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.1/angular-animate.min.js"></script>
    <script src="https://angular-ui.github.io/bootstrap/ui-bootstrap-tpls-2.5.0.js"></script>

    <script> 
        if (typeof _spPageContextInfo == "undefined") {
            window._spPageContextInfo = {};
            window._spPageContextInfo.webServerRelativeUrl = window.location.pathname.split("#!")[0].replace("_catalogs/masterpage/reception/kiosk.aspx","")
            window._spPageContextInfo.webAbsoluteUrl = window.location.href.split("#!")[0].replace("/_catalogs/masterpage/reception/kiosk.aspx","");
        }
    </script>

    <script src="sp.service.js?ver=6"></script>
    <script src="kiosk.module.js?ver=6"></script>
    <script src="kiosk.controller.js?ver=6"></script>
    <script src="signIn.controller.js?ver=6"></script>
    <script src="signOut.controller.js?ver=6"></script>
    <script src="welcome-controller.js?ver=6"></script>
    <script src="modal.controller.js?ver=6"></script>
</body>

</html>