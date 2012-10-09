(function () {
  
  enyo.start = function () {
    // TODO: this needs to be revisited but is a placeholder for now
    if (enyo._app) {
      enyo._app.start();
    } else console.warn("No application found");
  };
  
}());