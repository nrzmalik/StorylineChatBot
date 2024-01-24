function SendMessage()
{

var player = GetPlayer();
var message = player.GetVar("message");
var message2 = message;
var response = player.GetVar("response");
var chatHistory = player.GetVar("chatHistory");
var role = player.GetVar("role");
role = "Act as "+role+" Assistant. Write a short answer of my question in maximun 500 characters.";
var apiKey = player.GetVar("apiKey");
apiKey = "Bearer "+apiKey;
var question = message;
message = "Question: "+message;
var systemPrompt = role;
var userPrompt = message;
function sendMessage() {
    // Set up API request
    player.SetVar("response", "Wait...");
	player.SetVar("message", "");
	
    var xhr = new XMLHttpRequest();
    var url = 'https://api.openai.com/v1/chat/completions';
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', apiKey);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var apiResponse = JSON.parse(xhr.responseText);

                if (apiResponse.choices && apiResponse.choices[0] && apiResponse.choices[0].message && apiResponse.choices[0].message.content) {
                    var generatedResponse = apiResponse.choices[0].message.content.trim();

                    // Update Articulate Storyline variables
                    player.SetVar("response", generatedResponse);
                    player.SetVar("chatHistory", chatHistory + "\nUser: " + message2 + "\nResponse: " + generatedResponse + "\n");

                } else {
                    player.SetVar("response", "Error: " + JSON.stringify(apiResponse));
                }
            } else {
                player.SetVar("response", "Error: " + xhr.status + ", " + xhr.statusText + ", " + xhr.responseText);
				
            }
        }
    };

    var data = JSON.stringify({
        "model": "gpt-3.5-turbo",
        "messages": [
            {
                "role": "system",
                "content": systemPrompt
            },
            {
                "role": "user",
                "content": userPrompt
            }
        ]
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