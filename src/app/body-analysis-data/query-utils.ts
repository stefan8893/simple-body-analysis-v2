import { format } from 'date-fns';

export function formatToRowKey(date: Date) {
  return format(date, `yyyy-MM-dd'T'HH:mm:ss`);
}
