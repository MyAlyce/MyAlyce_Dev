# MyAlyce_Dev
 Development Env Repo for MyAlyce

 First demo targeting a barebones RPM feature set.
 Second demo implementing goal system and social(ish) tracking features.
 Third will add back office support to start to build out an EHR companion system, eventually a full thing.

WIP Image, showing high performance in live biometric streaming over WebRTC.
![Capture](./Capture.PNG)

### Dev

With the latest NodeJS LTS installed:

Install dependencies, build, and run `npm i && npm start`

You need the global dependency: 
`npm i -g tinybuild`

provide a `.env` file in `backend/dist` with mongodb login credentials:

```
MONGODB=mongodb+srv://user:pass@aa.bb.mongodb.net/dbname
TESTDB=
```


#### Android

With Android Studio installed:
- `npx cap add android`
- `npx cap copy`
- `npx cap open android`

If you do not have our AndroidManifest.xml in `android/app/src/main`, ensure these permissions are available, placed under the <!-- Permissions --> tag in the file created by capacitor:
```xml
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"  />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"  />
<uses-permission
    android:name="android.permission.BLUETOOTH"
/>
<uses-permission
    android:name="android.permission.BLUETOOTH_ADMIN"
/>
<uses-permission
    android:name="android.permission.BLUETOOTH_SCAN"
    tools:targetApi="s"
/>
<uses-permission
    android:name="android.permission.BLUETOOTH_CONNECT"
    tools:targetApi="s"
/>

<uses-permission android:name="android.permission.INTERNET" />
```

The first run will likely need to install all of the tools in the android project necessary. Build the android project in Android Studio after running these commands by clicking the Make Project hammer icon if it doesn't start automatically. Then if you see BUILD SUCCESSFUL, run with your android device connected or the built-in android emulators active.

#### IOS 

With XCode installed:
- `npx cap add ios`
- `npx cap copy`
- `npx cap open ios`
