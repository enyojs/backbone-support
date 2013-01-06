@ECHO OFF

REM make sure we don't stomp variables in calling script
SETLOCAL

REM the location of this batch file
SET SOURCE="%~dp0"

REM target location
SET TARGET=%1

IF [%TARGET%]==[] GOTO FAIL

GOTO OK

:FAIL

ECHO Must supply target folder parameter, e.g.:
ECHO.
ECHO   deploy.bat ../deploy/lib/mvc
ECHO.
GOTO :EOF

:OK

REM copy assets
XCOPY %SOURCE%foss\backbone\backbone-min.js %TARGET%\foss\backbone\backbone.js /Q /E
XCOPY %SOURCE%foss\underscore\underscore-min.js %TARGET%\foss\underscore\underscore.js /Q /E
XCOPY %SOURCE%foss\backbone-relational\backbone-relational.js %TARGET%\foss\backbone-relational\backbone-relational.js /Q /E
XCOPY %SOURCE%foss\jquery\jquery-1.8.3-min.js %TARGET%\foss\jquery\jquery-1.8.3-min.js /Q /E

FOR %%DIR IN ("controllers" "ext" "models" "views") DO (
  XCOPY %SOURCE%%%DIR\*.* %TARGET%\%%DIR\ /Q /E
)

ENDLOCAL