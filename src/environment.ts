export default {
  debug: !!process.env.DEBUG,
  environment: (process.defaultApp === undefined ? 'production' : 'development') as
    | 'production'
    | 'development'
};
