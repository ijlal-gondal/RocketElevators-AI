// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome, you can say all status or elevator id number. Which would you like to try?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const GetAllStatusIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetAllStatusIntent';
    },
    async handle(handlerInput) {
    let outputSpeech = "This is the default message.";

    const allElevator = await getRemoteData("https://tranquil-reaches-97237.herokuapp.com/api/elevators");
    const allElevatorInt = await getRemoteData("https://tranquil-reaches-97237.herokuapp.com/api/interventions");
    const allBuilding = await getRemoteData("https://tranquil-reaches-97237.herokuapp.com/api/buildings");
    const allCustomer = await getRemoteData("https://tranquil-reaches-97237.herokuapp.com/api/customers");
    const allBatteries = await getRemoteData("https://tranquil-reaches-97237.herokuapp.com/api/batteries");
    const allAddress = await getRemoteData("https://tranquil-reaches-97237.herokuapp.com/api/addresses");
    const allQuotes = await getRemoteData("https://tranquil-reaches-97237.herokuapp.com/api/quotes");
    const allLeads = await getRemoteData("https://tranquil-reaches-97237.herokuapp.com/api/leads");
    
    const allElevatorParse = JSON.parse(allElevator);
    const allElevatorIntParse = JSON.parse(allElevatorInt);
    const allBuildingParse = JSON.parse(allBuilding);
    const allCustomerParse = JSON.parse(allCustomer);
    const allBatteriesParse = JSON.parse(allBatteries);
    const allAddressParse = JSON.parse(allAddress);
    const allQuotesParse = JSON.parse(allQuotes);
    const allLeadsParse = JSON.parse(allLeads);
  
        var city = [];
        for (let i = 0; i < allAddressParse.length; i++) {
            city.push(allAddressParse[i].city);
            var totalCity = new Set(city).size;
            outputSpeech = ` Greetings, 
                                there are currently ${allElevatorParse.length} elevators deployed in the ${allBuildingParse.length} buildings of your ${allCustomerParse.length} customers.
                                Currently, ${allElevatorIntParse.length} elevators are not in Running Status and are being serviced.
                                ${allBatteriesParse.length} Batteries are deployed across ${totalCity} cities.
                                On another note you currently have ${allQuotesParse.length} quotes awaiting processing.
                                You also have ${allLeadsParse.length} leads in your contact requests.`;
        }
        return handlerInput.responseBuilder
            .speak(outputSpeech)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
      }
};

const GetElevatorStatusIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetElevatorStatusIntent';
  },
  async handle(handlerInput) {
    let outputSpeech = "This is the default message.";
    const id = handlerInput.requestEnvelope.request.intent.slots.id.value;
    const elevator = await getRemoteData("https://tranquil-reaches-97237.herokuapp.com/api/elevators/" + id);
    const elevatorStatus = JSON.parse(elevator).status;
    
    outputSpeech = `The status of elevator ${id} is ${elevatorStatus} `;

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt()
      .getResponse();
  }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


const getRemoteData = function (url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? require("https") : require("http");
    const request = client.get(url, (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error("Failed with status code: " + response.statusCode));
      }
      const body = [];
      response.on("data", (chunk) => body.push(chunk));
      response.on("end", () => resolve(body.join("")));
    });
    request.on("error", (err) => reject(err));
  });
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        GetAllStatusIntentHandler,
        GetElevatorStatusIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
