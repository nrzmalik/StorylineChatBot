function SendMessage() {
    var player = GetPlayer();
    var firstName = player.GetVar("firstName");
    var BusinessDo = player.GetVar("BusinessDo");
    var BusinessLoc = player.GetVar("BusinessLoc");
    var BusinessChal = player.GetVar("BusinessChal");
    var apiKey = player.GetVar("apiKey");
    apiKey = "Bearer " + apiKey;

    var message = "Hi there, I'm " + firstName + ". My business specializes in " + BusinessDo + " and is located in " + BusinessLoc + ". Currently, I'm encountering challenges related to " + BusinessChal + ". Can you assist me by compiling a comprehensive list of businesses operating in the same area as " + BusinessLoc + "?";

    
    var systemPrompt = "role"; 
    var userPrompt = message;

        
        player.SetVar("response", "Wait...");

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

                   
                        player.SetVar("response", generatedResponse);
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
SendMessage();
