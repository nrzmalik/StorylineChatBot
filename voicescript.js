var player = GetPlayer();
var chatHistory = player.GetVar("chatHistory");
let recognition;
let recognizing = false;

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!window.SpeechRecognition) {
  alert("Your browser does not support the Web Speech API. Please try with a different browser.");} 
  else {
  recognition = new SpeechRecognition();
  recognition.interimResults = true; // you can set this to false if you want the results to come back only after the user has stopped speaking

  recognition.onstart = function() {
    recognizing = true;
  };

  recognition.onend = function() {
    recognizing = false;
  };




//////


function toggleSpeechRecognition() {
  if (recognizing) {
      recognition.stop();
      recognizing = false;
    } else {
      recognition.start();
      recognizing = true;
    }
  }
}

/// Write recognition
recognition.addEventListener('result', (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript;
    var message = player.GetVar("message");
	player.SetVar("message",transcript);
	console.log(transcript);
});


///Short Message
function shortenMessage() {
  var message = player.GetVar("message");
  let shortMessage;
  
  if(message.length > 125) {
    shortMessage = message.substring(0, 125) + "...";
  } else {
    shortMessage = message;
  }
  
  return shortMessage;
}

/// End recognition
recognition.addEventListener('end', () => {
    console.log('Speech recognition has stopped.');
	player.SetVar("recognition",false);
	var message = player.GetVar("message");
	if (message !== '') {
	player.SetVar("listen",false);
	//player.SetVar("speak",true);
	player.SetVar("response","");
	player.SetVar("shortMessage",shortenMessage());
	SendMessage();
}
	
});

///Speech
function speakResponse() {
  // Ensure that 'player' and 'response' are available before proceeding.
  if (typeof player === 'undefined' || !player.GetVar('response')) {
    console.error('Player or response is not defined.');
    return;
  }

  var response = player.GetVar('response');
  
  var msg = new SpeechSynthesisUtterance();
  var voices = window.speechSynthesis.getVoices();
  msg.voice = voices[0]; 
  msg.volume = 1; // From 0 to 1
  msg.rate = 1; // From 0.1 to 10
  msg.pitch = 1; // From 0 to 2
  msg.text = response;
  msg.onend = function(e) {
    console.log('Finished in ' + event.elapsedTime + ' seconds.');
  };
  speechSynthesis.speak(msg);
}




/// Message request to API
function SendMessage() {

	
    // Get variables from Articulate Storyline
    
    var message = player.GetVar("message");
    var response = player.GetVar("response");
    var role = player.GetVar("role");
    var apiKey = player.GetVar("apiKey");

    // Check if apiKey is not empty
    if (!apiKey) {
        console.error("API Key is missing.");
        return;
    }

    apiKey = "Bearer " + apiKey;
    var question = message;
    message = "Act as a " + role + ". Write your answer in maximun 170 characters. My question is: " + message;

    // Set up API request
    var xhr = new XMLHttpRequest();
    var url = 'https://api.openai.com/v1/chat/completions';
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', apiKey);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var apiResponse = JSON.parse(xhr.responseText);

                if (apiResponse.choices && apiResponse.choices[0] && apiResponse.choices[0].message.content) {
                    var generatedResponse = apiResponse.choices[0].message.content.trim();

                    // Update Articulate Storyline variables
                    player.SetVar("response", generatedResponse);
                    speakResponse();
					player.SetVar("listen",true);
					player.SetVar("speak",false);
				//	player.SetVar("speak",true);
                    
                    player.SetVar("chatHistory", chatHistory + "\nQuestion: " + question + "\nAnswer: " + generatedResponse + "\n");
                    
                    player.SetVar("message", "");
					
                } else {
                    console.error("Unexpected API response:", JSON.stringify(apiResponse));
                }
            } else {
                console.error("Error in API request:", xhr.status, xhr.statusText, xhr.responseText);
            }
        }
    };

    var data = JSON.stringify({
        "model": "gpt-3.5-turbo",
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant."
            },
            {
                "role": "user",
                "content": message
            }
        ]
    });

    xhr.send(data);
    
}




function CopyResponse()
{
	
	var response = player.GetVar("response");
	if (response !== '') {
		
		navigator.clipboard.writeText(response)
		.then(function() {
		console.log('Text copied to clipboard');
		})
		.catch(function(error) {
		console.error('Failed to copy text: ', error);
		});
		
	}
	

}

function ExportChat()
{	

var chatHistory = player.GetVar("chatHistory");
	if (chatHistory !== '') {
	
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

}