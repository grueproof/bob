# Start Node.js script
$nodeScript = "D:\dev\repos\bob\server.js"
$nodeProcess = Start-Process "node" -ArgumentList "`"$nodeScript`"" -PassThru

# Wait for the Node.js script to start
Start-Sleep -Seconds 2

# Open local HTML file in default browser
$htmlFile = "D:\dev\repos\bob\index.html"
Start-Process $htmlFile

# Wait for the Node.js script to finish
$nodeProcess.WaitForExit()
