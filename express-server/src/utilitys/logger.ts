import logger from "pino";
import dayjs from "dayjs";
import pino from "pino";
import pinoPretty from "pino-pretty";




const log = pino({
    base: {
        pid: false,
    },
    timestamp: () => `,"time":"${dayjs().format()}"`,
    // Use pino-pretty as a transport
    prettifier: pinoPretty,
});

export default log;
