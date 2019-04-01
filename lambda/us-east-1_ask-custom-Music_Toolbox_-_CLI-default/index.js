// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const constants = require('./constants');
const lyrics = constants.lyrics.line1;
const met = require('./met')

// sessionAttributes format
// sessionAttributes = {
//     starttime : '',
//     goal : 0, // minutes
//     metronome = {
//                     tempo : 0
//                 },
//         drone = {
//                     note : 'a4'
//                 }
// };

const timeCalc = (start, end, goal) => {
    var firstCol = start.indexOf(':');
    var hr_str = start.substring(firstCol-2, firstCol);
    var mn_str = start.substring(firstCol+1, firstCol+3);
    var hr_end = start.substring(firstCol-2, firstCol);
    var mn_end = start.substring(firstCol+1, firstCol+3);
    var span = (hr_end * 60 + mn_end) - (hr_str * 60 - mn_str);
    console.log("starting hour: " + hr_str + "starting minute: " + mn_str + "ending hour: " + hr_end + "ending hour: " + mn_end);
    console.log('span: '+span+' goal: '+goal);
    
    return `you have practiced for ${span} minutes.` + checkGoal(span, goal);
};

const checkGoal = (span, goal) => {
    var speechText = `you have completed your goal by ${span*100/goal} percent`
    console.log(speechText)
    return speechText
}

const generateLyrics = (str) => {
    var arr = str.split(/,| /);
    var firstArr = arr.slice(0, 4);
    var restArr = arr.slice(4);

    var b = '0.4'
    var pickUp = `<phoneme alphabet="ipa" ph="k">k</phoneme><break time="${b}s"/>`;
    pickUp += pickUp
    pickUp += pickUp

    var markedUpLyrics = processLyricsArr(firstArr) + processLyricsArr(restArr); // randomly marked-up string
    return `haha really? Cool let me try <break time="1s"/>` + `${pickUp}<say-as interpret-as="interjection"><prosody pitch='-10%' rate="fast" volume="loud"> \
            ${markedUpLyrics}</prosody></say-as> `
}

const processLyricsArr = (words) => {
    var r1 = Math.floor(Math.random() * 4);     // 0 - 3
    var r2 = Math.floor(Math.random() * 3) + 2; // 2 - 4
    var r3 = Math.floor(Math.random() * 3);     // 0 - 2
    var b = '0.1';

    var cur;    
    var rest;      // rest of words array
    var curString; // a string

    if(words.length <= 4) {
        return `<emphasis level="reduced"> ` + words.join(` <break time="${b}s" /> `) + `</emphasis> `;
    } else {
        cur = words.slice(0, r2)
        rest = words.slice(r2)
        curString = cur.join(` `);
        if(r3 === 1) {
            curString = ` <break strength='x-weak' time="${b}s" />  <emphasis level="strong">${curString}</emphasis> `
        } else if (r3 === 2) {
            curString = ` <break strength='x-weak' time="${b}s" />  <emphasis level="strong">${curString}</emphasis> `
        }
    }

    return curString.concat(" "+processLyricsArr(rest))
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = `<audio src='soundbank://soundlibrary/musical/amzn_sfx_drum_comedy_01'/> <prosody rate="fast"> Time to practice! You can set a goal, use a metronome or a drone.</prosody>`;
        
        const SA = handlerInput.attributesManager.getSessionAttributes();
        SA.starttime = handlerInput.requestEnvelope.request.timestamp;
        handlerInput.attributesManager.setSessionAttributes(SA);

        console.log("receiving LaunchRequest at: " + SA.starttime);

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const SetGoalIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'SetGoalIntent';
    },
    handle(handlerInput) {
        const SA = handlerInput.attributesManager.getSessionAttributes();
        var goal = 0;

        if(handlerInput.requestEnvelope.request.intent.slots.dur.value !== null) {
            var textGoal = handlerInput.requestEnvelope.request.intent.slots.dur.value;
            console.log('text goal is: ' + textGoal);
            var hr = 0;
            var mn = 0;

            if(!textGoal.startsWith('PT')) {
                return handlerInput.responseBuilder
                    .speak('too much time, I cannot handle it. define your goal in terms of hours and minutes.')
                    .getResponse();
            } else {
                textGoal = textGoal.substring(2)
                if(textGoal.includes('H')) {
                    hr = parseInt(textGoal.substring(0, textGoal.indexOf('H')));
                    textGoal = textGoal.substring(textGoal.indexOf('H')+1);
                }
                if(textGoal.includes('M')) {
                    mn = parseInt(textGoal.substring(0, textGoal.indexOf('M')));
                }
            }
            goal = 60 * hr + mn;
        } 

        SA.starttime = goal;
        handlerInput.attributesManager.setSessionAttributes(SA);
        console.log('goal set: ' + SA.starttime);

        var speechText = ''
        if (hr !== 0) {
            speechText = `${hr} hour`
            if (hr > 1) { speechText += 's' }
        }
        if (hr !== 0 && mn !== 0) { speechText += ' and '}
        if (mn !== 0) {
            speechText += `${mn} minute`
            if(mn > 1) { speechText += 's' }
        }

        return handlerInput.responseBuilder
            .speak("you have set your goal to be " + speechText)
            .withShouldEndSession(false)
            .getResponse();
    }
}

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

const FasterIntentHandler = {
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
                .getResponse();
            
        }
    }
};

const SlowerIntentHandler = {
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
                .getResponse();
            
        }
    }
};

const StartRapIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'StartRapIntent';
    },
    handle(handlerInput) {
        const line = generateLyrics(lyrics);
        const speechText = line;
        const res = `<break time="1s"/>How do you think?`
        return handlerInput.responseBuilder
            .speak(speechText + res)
            .withShouldEndSession(false)
            .getResponse()
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
            //.withShouldEndSession(false)
            .getResponse();
    }
};

const PracticeTimeIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'PracticeTimeIntent';
    },
    handle(handlerInput) {
        const SA = handlerInput.attributesManager.getSessionAttributes();
        const { starttime } = SA;
        var curTime = handlerInput.requestEnvelope.request.timestamp;
        console.log("current time is " + curTime);
        return handlerInput.responseBuilder
            .speak(timeCalc(curTime, SA.starttime, SA.goal))
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
        SetGoalIntentHandler,
        StartMetronomeIntentHandler,
        FasterIntentHandler,
        SlowerIntentHandler,
        StartRapIntentHandler,
        StartDroneIntentHandler,
        PracticeTimeIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        AudioPlayerEventHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    .addErrorHandlers(
        ErrorHandler)
    .lambda();
