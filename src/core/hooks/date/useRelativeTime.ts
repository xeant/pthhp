import { useState, useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const useRelativeTime = (date: string) => {
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    if (date) {
      setTimeAgo(dayjs(date).fromNow());
    }
  }, [date]);

  return timeAgo;
};

export default useRelativeTime;
