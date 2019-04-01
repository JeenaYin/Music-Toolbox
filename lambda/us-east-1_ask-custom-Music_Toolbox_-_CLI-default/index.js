// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const constants = require('./constants');

// sessionAttributes format
// sessionAttributes = {
//     metronome = {
//                     tempo : 0
//                 },
//         drone = {
//                     note : 'a4'
//                 }
// };

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = `<audio src='soundbank://soundlibrary/musical/amzn_sfx_drum_comedy_01'/> <prosody rate="fast"> Time to practice! Would you like a drone or metronome? </prosody>`;
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const StartMetronomeIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'StartMetronomeIntent';
    },
    handle(handlerInput) {
        var speechText = '';
        if(handlerInput.requestEnvelope.request.intent.slots.BPM.value !== null) {
            var bpm = handlerInput.requestEnvelope.request.intent.slots.BPM.value;
            speechText = "starting metronome at " + bpm; 

            // update sessionattributes
            const SA = handlerInput.attributesManager.getSessionAttributes();
            const { metronome } = SA;
            if(typeof metronome === 'undefined') { 
                SA.metronome = { tempo : parseInt(bpm) } 
                console.log('initialized metronome')
            } 
            else { 
                SA.metronome.tempo = parseInt(bpm) 
                console.log('metronome exists')
            }
            
            handlerInput.attributesManager.setSessionAttributes(SA);
            console.log(handlerInput.attributesManager.getSessionAttributes())
        } 
        return handlerInput.responseBuilder
            .speak(speechText)
            .addAudioPlayerPlayDirective('REPLACE_ALL', constants.audioData.met.url + `${bpm}.mp3`, `metronome.${bpm}`, 0)
            .getResponse();
    }
};

const FasterIntent = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name == 'FasterIntent';
    },
    handle(handlerInput) {
        var inc = 10;
        var curTemp;
        const SA = handlerInput.attributesManager.getSessionAttributes();
        const { metronome } = SA;

        if(typeof metronome === 'undefined') {
            console.log('FasterIntent called when meteronome is not playing');

            return handlerInput.responseBuilder
                .speak('say start metronome to start') 
                .getResponse();

        } else {
            console.log(handlerInput.requestEnvelope.request.intent.slots.Quantifier);
            console.log(handlerInput.requestEnvelope.request.intent.slots.Quantifier.value);            
            var q = '';

            // if user includes a quantifier to faster command
            if(typeof handlerInput.requestEnvelope.request.intent.slots.Quantifier.value !== 'undefined') {
                q = handlerInput.requestEnvelope.request.intent.slots.Quantifier.value;
                var id = handlerInput.requestEnvelope.request.intent.slots.Quantifier.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                switch(id) {
                    case '-':
                        inc -= 5;
                        console.log('quantifier = '+q);
                        console.log('a little faster');
                        break;
                    case '+':
                        inc += 5;
                        console.log('quantifier = '+q);
                        console.log('a lot faster');
                        break;
                    default:
                        console.log('quantifier = '+q);
                        break;
                }
            }

            SA.metronome.tempo += inc;
            curTemp = SA.metronome.tempo;
            console.log(`Tempo increased to ${curTemp}`);

            console.log('new url: '+ constants.audioData.met.url + `${curTemp}.mp3`)
            return handlerInput.responseBuilder
                .speak(`playing ${q} faster`)
                .addAudioPlayerPlayDirective('REPLACE_ALL', constants.audioData.met.url + `${curTemp}.mp3`, `metronome.${curTemp}`, 0)
                .withShouldEndSession(false)
                .getResponse();
            
        }
    }
};

const SlowerIntent = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name == 'SlowerIntent';
    },
    handle(handlerInput) {
        var inc = 10;
        var curTemp;
        const SA = handlerInput.attributesManager.getSessionAttributes();
        const { metronome } = SA;

        if(typeof metronome === 'undefined') {
            console.log('SlowerIntent called when meteronome is not playing');

            return handlerInput.responseBuilder
                .speak('say start metronome to start') 
                .getResponse();

        } else {
            console.log(handlerInput.requestEnvelope.request.intent.slots.Quantifier);
            console.log(handlerInput.requestEnvelope.request.intent.slots.Quantifier.value);            
            var q = '';

            // if user includes a quantifier to faster command
            if(typeof handlerInput.requestEnvelope.request.intent.slots.Quantifier.value !== 'undefined') {
                q = handlerInput.requestEnvelope.request.intent.slots.Quantifier.value;
                var id = handlerInput.requestEnvelope.request.intent.slots.Quantifier.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                switch(id) {
                    case '-':
                        inc -= 5;
                        console.log('quantifier = '+q);
                        console.log('a little faster');
                        break;
                    case '+':
                        inc += 5;
                        console.log('quantifier = '+q);
                        console.log('a lot faster');
                        break;
                    default:
                        console.log('quantifier = '+q);
                        break;
                }
            }

            SA.metronome.tempo -= inc;
            curTemp = SA.metronome.tempo;
            console.log(`Tempo decreased to ${curTemp}`);

            console.log('new url: '+ constants.audioData.met.url + `${curTemp}.mp3`)
            return handlerInput.responseBuilder
                .speak(`playing ${q} slower`)
                .addAudioPlayerPlayDirective('REPLACE_ALL', constants.audioData.met.url + `${curTemp}.mp3`, `metronome.${curTemp}`, 0)
                .withShouldEndSession(false)
                .getResponse();
            
        }
    }
};


const StartDroneIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'StartDroneIntent';
    },
    handle(handlerInput) {
        var speechText = '';
        if(typeof handlerInput.requestEnvelope.request.intent.slots.note.value !== 'undefined') {
            var note = handlerInput.requestEnvelope.request.intent.slots.note.value;
            var id = handlerInput.requestEnvelope.request.intent.slots.note.resolutions.resolutionsPerAuthority[0].values[0].value.id;
            console.log("id: "+handlerInput.requestEnvelope.request.intent.slots.note.resolutions.resolutionsPerAuthority[0].values[0].value.id);
            console.log("drone request: "+note);
            //speechText = "starting drone at " + `<say-as interpret-as="spell-out">` + note + `</say-as>`;
            speechText = "starting drone at " + note;

            // update sessionattributes
            const SA = handlerInput.attributesManager.getSessionAttributes();
            const { drone } = SA;
            if(typeof drone === 'undefined') { 
                SA.drone = { note : id } 
                console.log('initialized drone')
            } 
            else { 
                SA.drone.note = id 
                console.log('drone exists')
            }
            
            handlerInput.attributesManager.setSessionAttributes(SA);
            console.log(handlerInput.attributesManager.getSessionAttributes())
        } 
        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt(speechText)
            .addAudioPlayerPlayDirective('REPLACE_ALL', constants.audioData.drone.url + `${id}.mp3`, `drone.${id}`, 0)
            .withShouldEndSession(false)
            .getResponse();
    }
};


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'To use a metronome, say, start metronome. To use a drone, say, start drone.';

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
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent');
    },
    handle(handlerInput) {
        const speechText = 'stopped';
        return handlerInput.responseBuilder
            .addAudioPlayerClearQueueDirective('CLEAR_ALL')
            .addAudioPlayerStopDirective()
            .speak(speechText)
            .withShouldEndSession(false)
            .getResponse();
    },
};

const AudioPlayerEventHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type.startsWith('AudioPlayer.');
  },
  handle(handlerInput) {
    const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
    const audioPlayerEventName = requestEnvelope.request.type.split('.')[1];
    switch (audioPlayerEventName) {
      case 'PlaybackStarted':
        break;

      case 'PlaybackStopped':
        break;

      case 'PlaybackFinished':
        break;

      case 'PlaybackNearlyFinished':
        var t = requestEnvelope.request.token;
        if(t.startsWith("metronome")) {
            tempo = t.split('.')[1];
            responseBuilder
            .addAudioPlayerPlayDirective('ENQUEUE', constants.audioData.met.url + `${tempo}.mp3`, t, 0, t);
        } else if(t.startsWith("drone")) {
            note = t.split('.')[1];
            responseBuilder
            .addAudioPlayerPlayDirective('ENQUEUE', constants.audioData.drone.url + `${note}.mp3`, t, 0, t);
        }
        break;

      default:
        throw new Error('cannot handle ' + audioPlayerEventName);

    }
    return responseBuilder.getResponse();
  },
};

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
        const speechText = `You just triggered ${intentName} in Music Toolbox`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
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
        const speechText = `Sorry, error message: ${error.message}.`;

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
        StartMetronomeIntentHandler,
        FasterIntent,
        StartDroneIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        AudioPlayerEventHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    .addErrorHandlers(
        ErrorHandler)
    .lambda();
