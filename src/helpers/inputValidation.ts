import { Filter } from 'eth-logs-indexer';
import { v4 as uuidv4 } from 'uuid';
import { version as uuidVersion } from 'uuid';
import { validate as uuidValidate } from 'uuid';
import { NIL as NIL_UUID } from 'uuid';

function uuidValidateV4(uuid: string) {
  return uuidValidate(uuid) && uuidVersion(uuid) === 4 && uuid !== NIL_UUID;
}

export function validateFilters(filters: Filter[]) {
  const errors: { filter: Filter; reason: string }[] = [];

  for (const filter of filters) {
    if (filter.id && !uuidValidateV4(filter.id)) {
      errors.push({ filter, reason: 'Invalid uuidv4' });
    }
  }

  return errors;
}
