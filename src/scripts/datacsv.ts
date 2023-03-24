import { workers } from "device-decoder";
import { state } from "graphscript";
import gsworker from './device.worker'

export const csvworker = workers.addWorker({url:gsworker});

state.setState({
    isRecording:false
});


