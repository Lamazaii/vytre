declare namespace NodeJS {
  interface BaseProcessEnv {
      // Application settings
      readonly PORT: string;
      readonly NODE_ENV?: 'development' | 'production';
      readonly DEBUG?: string;
  }

  interface DevelopmentProcessEnv extends BaseProcessEnv {
      readonly NODE_ENV: 'development';
      readonly OTHER_ENV_SPECIFIC_VAR: string;
      readonly DEBUG: string;
  }

  interface ProductionProcessEnv extends BaseProcessEnv {
      readonly NODE_ENV: 'production';
  }

  export type ProcessEnv = DevelopmentProcessEnv | ProductionProcessEnv;
}
