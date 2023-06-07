### KNOWN BUGS

- when not selecting a bluetooth device then selecting again, or when removing a device then reconnecting, this may cause ui not to respond, seems to be more a bluetooth issue
- browserfs EIO errors, though it doesn't seem to stop the files from writing

### Priorities

- Arm/disarm alerts
- Add local folder list option for custom folder names so a user can record several people on their own account
- Punch in categorized notes easier, record audio/video. Potentially transcribe audio? Sort event tables

### UX/UI

- modals acting weird with alerts, tends to cause page reload with onItemClick triggering somehow from the StreamSelect divs... weird
- create a tiling system for customizing dashboard setup, back up config to indexeddb 
- styling, clean generic crm look like adminlte or google analytics. Modern and information-rich without being overwhelming as we need this to be nice for fairly tech-illiterate people.
- webrtc ux/ui. Make calling yourself its own separate deal from calling other users (since its just setting up a remote connection for yourself)
- animation
- fix chart scaling so the leading/trailing zeros don't make it useless for a few seconds

- https://leafletjs.com/examples/quick-start/ for geolocation

### Scripting/Events/State

- finish file saving subscriptions with local/stream recording. Get google drive working somehow
- readd notifications, friends lists, etc.
- make the local recordings more secure per-user

### RTC

- fix selectors not swapping inputs automatically on active calls
- proper call interface
- test buffering more
- audio quality (more filters? compressor? disabling stuff?)

### Backend

- Security, test access token system, more permissions
- plain email/password storage? i.e. not just google reliance, see about microsoft accounts and other

## Data

- more selective data representation
- Video/Audio capture local and remote (ez)
- Screen capture

- Lots more recordkeeping tools

## Third party

- reintegrate fitbit api, it's there but not in use. Need to build more of the recordkeeping to make use of these. Mongodb is ready to accept anything.

## Widgets

- widgetize all the things
- more data widgets, tables, etc, typical analytics stuff really (just needs to be PERFORMANT).

## Modularity

Restructure the source better around the widget module development so it's easier to document. 