//mapping country codes to country names
const countryCodeToName = {
    'US': 'United States', 'CN': 'China', 'CH': 'Switzerland', 'VN': 'Vietnam', 'TR': 'Turkey', 'NL': 'Netherlands', 'ES': 'Spain',
    'IN': 'India', 'ZA': 'South Africa', 'AU': 'Australia', 'CO': 'Colombia', 'LT': 'Lithuania', 'GG': 'Guernsey', 'HU': 'Hungary',
    'RS': 'Serbia', 'CA': 'Canada', 'IE': 'Ireland', 'SG': 'Singapore', 'JP': 'Japan', 'HK': 'Hong Kong', 'BE': 'Belgium', 'ME': 'Montenegro',
    'RO': 'Romania', 'RU': 'Russia', 'IT': 'Italy'
};

// Listener for the cancel button to close window
document.getElementById('cancelButton').addEventListener('click', function() {
    window.close();
});

// Listener for the submit button to perform the API call
document.getElementById('Button').addEventListener('click', function() {
    //clear the previous results
    document.getElementById('result').innerHTML = ' ';
    //clear the previous link container
    var previousLinkContainer = document.getElementById('linkContainer');
    { 
        if (previousLinkContainer) {
            previousLinkContainer.parentNode.removeChild(previousLinkContainer);
        }
    }

    //Gather the user supplied information neccessary to cocnstruct the correct URL
    var ip = document.getElementById('ipInput').value;
    var apiKey = '6e472e745788187d0fbd5b01502432bc493813d92417fe4f33a1a3026a55708e344ee74b553c98ca';
    //define the api endpoint I wish to use
    var url = 'https://api.abuseipdb.com/api/v2/check?ipAddress=' + ip;

    //Attach the headers to the request
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Key': apiKey
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('This address cannot be found right now, please try again later.');
        }
        return response.json();
    })
    .then(data => {
        console.log(data); // log the data to see what it looks like
        if (!data || !data.data) {
            throw new Error('Unexpected response structure');
        }
    
        //Retrive the data from the api and assign to variables
        var isp = data.data.isp;
        var domain = data.data.domain;
        var countryCode = data.data.countryCode;
        var countryName = countryCodeToName[countryCode] || countryCode;
        var city = data.data.city || 'N/A';
        var reports = data.data.totalReports;
        var usageType = data.data.usageType;
        var reputationScore = data.data.abuseConfidenceScore;
        //logic to decide what malicious category the IP falls under
        var isMalicious ='';
            if (reputationScore === 0) {
                isMalicious = 'Not Malicious'
            }
            else if (reputationScore > 0 && reputationScore <= 50) {
                isMalicious = 'Partially Malicious'
            }
            else {
                isMalicious = 'Malicious'
            }

            //create a variable to house the page link that refers to the IP being checked
        var abuseLink = 'https://www.abuseipdb.com/check/' + ip;
    
        var resultDiv = document.getElementById('result');
        //construct how the results will be displayed once an IP has been submitted
        resultDiv.innerHTML = `
        <h1 style="text-align: ccenter; font-weight: bold;">IP Reputation Report</h1>
        <p style="text-align: left;">- Target IP Address: ${ip}</p>
        <p style="text-align: left;">- ISP: ${isp}</p>
        <p style="text-align: left;">- Domain: ${domain}</p>
        <p style="text-align: left;">- Location: ${city}, ${countryName}</p>
        <p style="text-align: left;">- This IP address has been reported ${reports} times.</p>
        <p style="text-align: left;">- Confidence of Abuse: ${reputationScore}% </p>
        <p style="text-align: left;">- Observing the confidence of abuse, we can deduce that the IP is ${isMalicious}.</p>
        <p style="text-align: left;">- The IP resolves to ${isp}, located in ${countryName} and is used for ${usageType}.</p>`;
        
        //Create a container for the link and copy button to position appropriately
        var linkContainer = document.createElement('div');
        linkContainer.id = 'linkContainer';

        // Add the "View in AbuseIPDB" link outside of the resultDiv to prevent it being included in the copy to clipboard
        var abuseIPDBLink = document.createElement('a');        //create anchor element to edit href and textcontent for the link
        abuseIPDBLink.href = abuseLink;
        abuseIPDBLink.textContent = 'View in AbuseIPDB';
        abuseIPDBLink.target = '_blank';
        //add link to the container
        linkContainer.appendChild(abuseIPDBLink);
        //add a line break between the link and copy button
        linkContainer.appendChild(document.createElement('br'));

        // Add the copy button directly outside of the resultDiv to prevent it being copied to clipboard
        var copyResultsButton = document.createElement('button');
        copyResultsButton.textContent = 'Copy';
        copyResultsButton.id = 'copyButton';
        copyResultsButton.style.padding = '5px 10px'; // Adjust size of the button
        copyResultsButton.style.marginTop = '5px'; 
        copyResultsButton.addEventListener('click', exportResult);
        //add copy button to the container
        linkContainer.appendChild(copyResultsButton);
        //insert the container
        resultDiv.parentNode.insertBefore(linkContainer, resultDiv.nextSibling);

        //Added copy functionality to copy to preferred destination using the clipboard api
        function exportResult() {
            var resultText = resultDiv.textContent + '\n'; // Insert newline for separation
            resultText += 'View in AbuseIPDB: ' + abuseLink; // Add the AbuseIPDB link to the copied text
            navigator.clipboard.writeText(resultText)       //start the copy to clipboard
            .then(() => {
                alert('Result has been copied ot the clipboard!');
            })
        //execute this if error found while copying
        .catch((error) => {
            console.error('Unable to copy text to clipboard:', error);
            alert('Failed to copy result to clipboard. Please try again.');
        });
    }
    })
    //error display back in the extension if there is an error fetching data
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('result').textContent = 'Error fetching data: ' + error.message;
    })
})
