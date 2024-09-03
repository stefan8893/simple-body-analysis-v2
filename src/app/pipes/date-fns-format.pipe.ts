import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

@Pipe({
  name: 'formatDate',
  standalone: true,
})
export class FormatDatePipe implements PipeTransform {
  transform(value: string | number | Date, dateFormat: string): string {
    return format(value, dateFormat, { locale: de });
  }
}
