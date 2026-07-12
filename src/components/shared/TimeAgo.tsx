"use client";

import { useState, useEffect } from "react";

function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "adesso";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m fa`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h fa`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}g fa`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} sett fa`;
  const months = Math.floor(days / 30);
  return `${months} mesi fa`;
}

export function TimeAgo({ date }: { date: Date | string }) {
  const [timeAgo, setTimeAgo] = useState(() => getTimeAgo(new Date(date)));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(getTimeAgo(new Date(date)));
    }, 60000);
    return () => clearInterval(interval);
  }, [date]);

  return <span title={new Date(date).toLocaleString("it-IT")}>{timeAgo}</span>;
}
