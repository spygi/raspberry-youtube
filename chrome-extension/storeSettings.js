/**
 * Store the settings of the raspberry.
 */
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('saveButton').addEventListener('click', saveSettings);
});

var saveSettings = function (e) {
	var ip = document.getElementById('raspIp').value.trim();
    var port = document.getElementById('raspPort').value.trim();

    // TODO display an error if ip||port are empty
    localStorage['raspIp'] = ip;
    localStorage['raspPort'] = port;
}