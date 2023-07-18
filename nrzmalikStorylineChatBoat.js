function SendMessage()
{

var player = GetPlayer();
var message = player.GetVar("message");
var response = player.GetVar("response");
var chatHistory = player.GetVar("chatHistory");
var role = player.GetVar("role");
var apiKey = player.GetVar("apiKey");
apiKey = "Bearer "+apiKey;
var question = message;
message = "Act as a "+role+". Write answer in maximun 450 characters. My question is: "+message;

function sendMessage() {
    // Set up API request
	player.SetVar("response","Wait...");
    var xhr = new XMLHttpRequest();
    var url = 'https://api.openai.com/v1/engines/text-davinci-003/completions';
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', apiKey);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var apiResponse = JSON.parse(xhr.responseText);

                if (apiResponse.choices && apiResponse.choices[0] && apiResponse.choices[0].text) {
                    var generatedResponse = apiResponse.choices[0].text.trim();

                    // Update Articulate Storyline variables
                    player.SetVar("response", generatedResponse);
                    player.SetVar("chatHistory", chatHistory + "\nQuestion: " + question + "\nAnswer: " + generatedResponse+"\n");

                    // Clear the message variable
                    player.SetVar("message", "");
                } else {
                    player.SetVar("response","Error: " + JSON.stringify(apiResponse));
                }
            } else {
                player.SetVar("response","Error: " + xhr.status, xhr.statusText, xhr.responseText);
            }
        }
    };

    var data = JSON.stringify({
        "prompt": message,
        "max_tokens": 80,
        "n": 1,
        "stop": null,
        "temperature": 0.7
    });

    xhr.send(data);
}

sendMessage();

	
}

function ExportChat()
{
	
var title = "Chat History";
var editor = GetPlayer().GetVar("chatHistory");
var blob = new Blob([editor], { type: 'application/msword' });
var downloadLink = document.createElement("a");
downloadLink.download = "Chat History" + ".doc";
downloadLink.innerHTML = "Download File";
downloadLink.href = window.URL.createObjectURL(blob);
document.body.appendChild(downloadLink);
downloadLink.click();
document.body.removeChild(downloadLink);	
}