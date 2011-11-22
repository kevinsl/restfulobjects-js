<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Isis JS</title>
<link type="text/css" href="css/smoothness/jquery-ui-1.8.16.custom.css" rel="Stylesheet" />
<link type="text/css" href="css/isis.css" rel="Stylesheet" />
<link rel="stylesheet" type="text/css" href="css/bootstrap.css">
<style type="text/css">
      body {
        padding-top: 60px;
      }
</style>
<script src="lib/json2.js" type="text/javascript"></script>
<script src="lib/jquery-1.6.4.js" type="text/javascript"></script>
<script src="lib/jquery-ui-1.8.16.custom.min.js" type="text/javascript"></script>
<script src="lib/underscore.js" type="text/javascript"></script>
<script src="lib/backbone.js" type="text/javascript"></script>
<script src="js/isis.js" type="text/javascript"></script>
<script src="js/isis.models.js" type="text/javascript"></script>
<script src="js/isis.forms.js" type="text/javascript"></script>
<script src="js/isis.views.js" type="text/javascript"></script>
<script src="js/isis.controllers.js" type="text/javascript"></script>
<script type="text/javascript">

	$(function() {
		Isis.init('<%= request.getContextPath() %>');
	});

</script>
</head>
<body>
    <div class="container-fluid">
      <div class="sidebar">
        <div class="well">
        </div>
      </div>
      <div class="content">
      </div>
    </div>
    
</body>
</html>