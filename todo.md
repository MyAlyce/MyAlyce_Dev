### KNOWN BUGS

- when not selecting a bluetooth device then selecting again, or when removing a device then reconnecting, this may cause ui not to respond
- webrtc media device swapping not triggering device change yet
- browserfs EIO errors, though it doesn't seem to stop the files from writing

### UX/UI
- styling, clean generic crm look like adminlte or google analytics
- webrtc ux/ui. Make calling yourself its own separate deal from calling other users (since its just setting up a remote connection for yourself)
- animation
- fix chart scaling so the leading/trailing zeros don't make it useless for a few seconds

### Scripting/Events/State

- finish file saving subscriptions with local/stream recording. Get google drive working somehow
- readd notifications, friends lists, etc.
- make the local recordings more secure per-user

### RTC

- proper call interface
- test buffering more
- fix audio, not sure why it's not audible on receiver as the channels appear to negotiate

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