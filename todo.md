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

- fix audio, not sure why it's not audible on receiver as the channels appear to negotiate
- fix data channel buffering sending wrong result somehow

### Backend

- Security
- plain email/password storage? i.e. not just google reliance, see about microsoft accounts

## Data

- more selective data representation
- Video/Audio capture local and remote (ez)
- Screen capture

## Widgets

- widgetize all the things
- more data widgets, tables, etc, typical analytics stuff really (just needs to be PERFORMANT).

## Modularity

Restructure the source better around the widget module development so it's easier to document. 