import dayjs from "dayjs";
import pino from "pino";
import pinoPretty from "pino-pretty";

const log = pino({
    base: {
        pid: false,
    },
    timestamp: () => `,"time":"${dayjs().format()}"`,
    prettifier: pinoPretty,
});

export default log;
