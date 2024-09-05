export type Loaded<T> = {
  state: 'loaded';
  value: T;
};

export type Loading = {
  state: 'loading';
};

export type Error = {
  state: 'error';
  errorDetails: string;
};

export type Resource<T> = Loaded<T> | Loading | Error;
