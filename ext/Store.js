/**
    NOTES TO SELF
    
    the store should somehow unite data as a database for an entire application
    and the API should allow one to seamlessly work with local and remote storage
        the means by which it achieves this is via an optional built-in driver for
        local storage and an overridable driver for remote storage BOTH implemented
        via a datasource object
    
    **the entirety of the store should be abstracted enough that backbone could be
    replaced? (by us...not necessary swapped out by end-developers)
    
    if NO DATASOURCE IS SET IT WILL ALWAYS USE LOCAL STORAGE WHEN AVAILABLE
        can this use optional paths such as flash for older browsers?
    
    querying the store will do the following
        first check to see if the required models are already local and use those
        if they are
        
        if there are none attempt to query remote
        
        if there are some local asynchronously query remote to ensure we have
        all of the correct models
        
        intelligently determine payloads to send/retrieve from remote
        
        **initially only support VERY SIMPLE QUERIES or some type of API
          that can be overloaded by end-developer? -- this needs to be looked
          into with great detail
*/


enyo.kind({
  name: "enyo.Store",
  kind: "enyo.Object",
  published: {
    isLocalStorage: false
  },
  sync: function () {
    
  }
});
