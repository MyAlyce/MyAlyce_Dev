import { workers } from "device-decoder";
import gsworker from './device.worker'



export const csvworker = workers.addWorker({url:gsworker});


