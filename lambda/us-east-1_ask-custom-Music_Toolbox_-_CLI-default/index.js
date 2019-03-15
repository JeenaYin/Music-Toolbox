// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const constants = require('constants');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'Hi! Would you like to use a drone or metronome?';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speechText = 'Hello World!';
        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
const StartMetronomeIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'StartMetronomeIntent';
    },
    handle(handlerInput) {
        var res="";
        if(handlerInput.requestEnvelope.request.intent.slots.BPM.value !== null) {
            var bpm = handlerInput.requestEnvelope.request.intent.slots.BPM.value;
            for(var i=1; i<10; i++){
                res=res+'<break time="'+(60/bpm)+'s"/><phoneme alphabet="ipa" ph="k">k</phoneme>';
            }
        }
        const speechText = "starting metronome at "+bpm;
        return handlerInput.responseBuilder
            .speak(speechText)
            .addAudioPlayerPlayDirective('REPLACE_ALL', 'https://jeenayin.github.io/static/120.mp3', "metronome", 0, null)
            .getResponse();
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';
        return handlerInput.responseBuilder
            .addAudioPlayerClearQueueDirective('CLEAR_ALL')
            .addAudioPlayerStopDirective()
            .speak(speechText)
            .getResponse();
    },
};

const AudioPlayerEventHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type.startsWith('AudioPlayer.');
  },
  handle(handlerInput) {
    const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
    const audioPlayerEventName = requestEnvelope.request.type.split('.');

    switch (audioPlayerEventName) {
      case 'PlaybackStarted':
        break;
      case 'PlaybackStopped':
        responseBuilder
          .addAudioPlayerClearQueueDirective('CLEAR_ALL')
          .addAudioPlayerStopDirective();
        break;
      case 'PlaybackNearlyFinished':
        break;
      default:
        throw new Error('Shouldnt happen');

    }
    return responseBuilder.getResponse();
  },
}

// const PlaybackStoppedIntentHandler = {
//   canHandle(handlerInput) {
//     return handlerInput.requestEnvelope.request.type === 'PlaybackController.PauseCommandIssued' || 
//             handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStopped';
//   },
//   handle(handlerInput) {
//     handlerInput.responseBuilder
//       .addAudioPlayerClearQueueDirective('CLEAR_ALL')
//       .addAudioPlayerStopDirective();

//     return handlerInput.responseBuilder
//       .getResponse();
//   },
// };

// const PlaybackStartedIntentHandler = {
//   canHandle(handlerInput) {
//     return handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStarted';
//   },
//   handle(handlerInput) {
//     handlerInput.responseBuilder
//       .addAudioPlayerClearQueueDirective('CLEAR_ENQUEUED');

//     return handlerInput.responseBuilder
//       .getResponse();
//   },
// };

// const PlaybackRepeatIntentHandler = {
//   canHandle(handlerInput) {
//     return handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackNearlyFinished';
//   },
//   handle(handlerInput) {
//     console.log("nearly finished");
//     return handlerInput.responseBuilder
//       .addAudioPlayerPlayDirective('ENQUEUE', 'https://jeenayin.github.io/static/120.mp3', "metronome", 0, null)
//       .getResponse();
//   },
// };




const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
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
        return handlerInput.requestEnvelope.request.type === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        const speechText = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speechText)
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
        console.log(`~~~~ Error handled: ${error.message}`);
        const speechText = `Sorry, I couldn't understand what you said. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

// This handler acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        StartMetronomeIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        AudioPlayerEventHandler,
        // PlaybackStoppedIntentHandler,
        // PlaybackStartedIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    .addErrorHandlers(
        ErrorHandler)
    .lambda();
