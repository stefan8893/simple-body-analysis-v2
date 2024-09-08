import { format } from 'date-fns';

export function formatToSearchString(date: Date) {
  return format(date, `yyyy-MM-dd'T'HH:mm`);
}
