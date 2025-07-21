import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import weekOfYear from "dayjs/plugin/weekOfYear";

// Extend dayjs with plugins
dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);

export default dayjs; 