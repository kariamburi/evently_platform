<?php

  $callbackResponse = file_get_contents('php://input');
  $logFile = "AA3Response.json";
  $log = fopen($logFile, "a");
  fwrite($log, $callbackResponse);
  fclose($log);
