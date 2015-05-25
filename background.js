chrome.runtime.onInstalled.addListener(function() {
	console.debug("background online");

	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    	chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [
          		new chrome.declarativeContent.PageStateMatcher({
            		pageUrl: { hostEquals: 'politiken.dk', schemes: ['http', 'https'] }
          		})
        	],
        	actions: [ 
        		new chrome.declarativeContent.ShowPageAction() 
        	]
    	}]);
    });

    function eatCookies() {
    	console.debug('clearing cookies ...');
    	chrome.cookies.getAll({domain: "politiken.dk"}, function(cookies) {
	    	for(var i=0; i<cookies.length;i++) {
	      		chrome.cookies.remove({url: "http://www.politiken.dk" + cookies[i].path, name: cookies[i].name});
	    	}
	    });	
    }

    eatCookies();

	// holds the previous request. Used when being redirected to article limit reached page.
	var prevRequest = null; 
	chrome.webRequest.onBeforeRequest.addListener(
		function(details) {
			// are we being redirected to article limit page.
			if (prevRequest != null && details.url.indexOf('articlelimit') != -1 && details.requestId === prevRequest.requestId) {
				// if so, clear cookies and redirect to previous page.
				eatCookies();
				return {
					redirectUrl: prevRequest.url
				};
			} else {
				prevRequest = details;
			}
		},
		{
	        urls: [
	            "*://politiken.dk/*",
	            "*://www.politiken.dk/*"
	        ],
	        types: ["main_frame"]
	    },
	    ["blocking"]
	);
});