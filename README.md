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

### A Whole Health Monitoring System (just ideas, all free to use)
<img width="1430" alt="RPMA (2)" src="https://github.com/MyAlyce/MyAlyce_Dev/assets/18196383/75a714d0-2946-42cd-bd6c-3b87fd205c9f">
This is also based on our hardware progress which can be found here: 

[nRF5x Biosensing Boards](https://github.com/joshbrew/nrf5x-biosensing-boards)

Idea being this can work in acute cases or in assisted living and remote monitoring scenarios. It would be entirely individualized and based on user consent. Epic and other systems feature some of these things but are locked up in giant proprietary schemes that are quite unweildy and expensive. We'd want something community-developed to serve public needs more directly. A good paper on what ideal future EHRs should look like was published by Johns Hopkins: 

[Mobile Technology in Support of Frontline Health Workers](https://chwcentral.org/wp-content/uploads/2016/11/Mobile-Technology-in-Support-of-Frontline-Health-Workers.pdf)
