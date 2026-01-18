if (typeof google === 'undefined') {
	console.log("Mocking google.script.run for local development");
	var google = {
		script: {
			run: {
				withSuccessHandler: function(successCallback) {
					// Store the success callback to call it later
					this._successHandler = successCallback;
					return this; // Return 'this' to allow chaining
				},
				withFailureHandler: function(failureCallback) {
					// Store the failure callback
					this._failureHandler = failureCallback;
					return this; // Return 'this' to allow chaining
				},
				// DEFINE YOUR SERVER FUNCTIONS HERE
				getAllEntries: function() {
					console.log("Mock: getAllEntries called");
					
					// MOCK DATA: Simulate what your Google Sheet would return
					// This must match the structure your real code expects (Array, Object, etc.)
					var mockData = [
						{ id: 1, name: "Sample Entry 1", date: "2023-01-01" },
						{ id: 2, name: "Sample Entry 2", date: "2023-01-02" }
					];
					
					// Simulate the delay of a server request
					setTimeout(() => {
						if (this._successHandler) {
							this._successHandler(mockData);
						}
					}, 500); // 500ms delay
				},
				
				// Add other functions here as you encounter errors
				// createEntry: function(data) { ... },
				// deleteEntry: function(id) { ... }
			}
		}
	};
}