### Priorities

- Add local folder list option for custom folder names so a user can record several people on their own account, this means just trade out the hard coded stream/currentUser getters for setting names/folders manually

- Punch in categorized notes easier.  Sort event tables. Record audio/video. Potentially transcribe audio?

- Auto reconnect protocol for mobile or electron.

- Fix so offline accounts work, at least just with saved google verification (IDB)
   --- make a fallback to read out the event csv for a selected user

- Dumb everything down as much as possible. Give summaries, e.g. sleep. Event + data recording made much simpler.

- Electron with desktop bluetooth.

- Intermittent rewards for events? 
 - - Every time you enter data you get a point. Points based on types of events.
 - - E.g. a score for entering results
 - - Enter a lottery based on user inputs
 - - Add scheduling to point system valued

- Alert system that is disarmable or can notify

- Add Email and SMS with an ability to notify when alerts are thrown.

- Add alt login methods

### KNOWN BUGS

- when not selecting a bluetooth device then selecting again, or when removing a device then reconnecting, this may cause ui not to respond, seems to be more a bluetooth issue
- browserfs EIO errors, though it doesn't seem to stop the files from writing
- redirect can cache and screw up localhost on non-redirect servers (??)
- wtf is wrong with the alert modals ??? I've spent 2 days hitting my head against a wall and I only made it worse.


### UX/UI

- modals acting weird with alerts... 
- create a tiling system for customizing dashboard setup, back up config to indexeddb 
- styling, clean generic crm look like adminlte or google analytics. Modern and information-rich without being overwhelming as we need this to be nice for fairly tech-illiterate people.
- webrtc ux/ui. Make calling yourself its own separate deal from calling other users (since its just setting up a remote connection for yourself)
- animation
- fix chart scaling so the leading/trailing zeros don't make it useless for a few seconds
- https://leafletjs.com/examples/quick-start/ for geolocation


### Scripting/Events/State


### RTC

- proper call interface
- test buffering more


### Backend

- More permissions, check that security meets standards now (https, mongo, cloudflare, access tokens, random Ids)
- plain email/password storage? i.e. not just google reliance, see about microsoft accounts and other

## Data

- more selective data representation, e.g. time-based
- Video/Audio capture local and remote (ez)
- Screen capture

- Lots more recordkeeping tools, charting, etc. 


## Third party

- reintegrate fitbit api, it's there but not in use. Need to build more of the recordkeeping to make use of these. Mongodb is ready to accept anything.


## Widgets

- widgetize all the things
- more data widgets, tables, etc, typical analytics stuff really (just needs to be PERFORMANT).


## Modularity

Restructure the source better around the widget module development so it's easier to document. 