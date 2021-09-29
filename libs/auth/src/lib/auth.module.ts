import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './containers/login/login.component';
import { AuthRoutingModule } from './auth-routing.module';
import {
  BrowserCacheLocation,
  InteractionType,
  IPublicClientApplication,
  LogLevel,
  PublicClientApplication,
} from '@azure/msal-browser';
import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalBroadcastService,
  MsalGuard,
  MsalGuardConfiguration,
  MsalInterceptor,
  MsalInterceptorConfiguration,
  MsalService,
} from '@azure/msal-angular';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromAuth from './+state/auth.reducer';
import { AuthEffects } from './+state/auth.effects';
import { FormModule } from '@nx-poc/form';
import { MaterialModule } from '@nx-poc/material';
import { Configuration } from '@azure/msal-browser';

export interface AuthMsalProtectedResource {
  url: string;
  scopes: string[];
}

export interface AuthMsalInterceptorConfiguration {
  interactionType: InteractionType.Redirect | InteractionType.Popup;
  protectedResources: AuthMsalProtectedResource[];
}

export interface AuthModuleConfig {
  msal: {
    instance: Configuration;
    interceptor?: AuthMsalInterceptorConfiguration,
    guard?: MsalGuardConfiguration
  };
}

export const loggerCallback = (logLevel: LogLevel, message: string) => {
  // TODO: log
  console.warn(logLevel, message);
};

const defaultMsalInstanceConfig: Configuration = {
  auth: {
    clientId: '',
    authority: 'https://login.microsoftonline.com/consumers',
    redirectUri: 'http://localhost:4200/',
    postLogoutRedirectUri: 'http://localhost:4200/',
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback,
      logLevel: LogLevel.Info,
      piiLoggingEnabled: false,
    },
  },
}

export const MsalInstanceFactory = (config: Partial<Configuration>) => (): IPublicClientApplication =>
  new PublicClientApplication({
    auth: {
      ...defaultMsalInstanceConfig.auth,
      ...config.auth,
    },
    cache: {
      ...defaultMsalInstanceConfig.cache,
      ...(config?.cache ?? {}),
    },
    system: {
      ...defaultMsalInstanceConfig.system,
      ...(config?.system ?? {}),
    }
  });

export const MsalInterceptorConfigFactory = (config: Partial<AuthMsalInterceptorConfiguration> = {}) =>
  (): MsalInterceptorConfiguration => {
    const protectedResourceMap = new Map<string, string[]>();

    protectedResourceMap.set('https://graph.microsoft.com/v1.0/me', [
      'user.read',
    ]);

    config.protectedResources?.forEach(
      protectedResource => protectedResourceMap.set(protectedResource.url, protectedResource.scopes),
    );

    return {
      interactionType: config?.interactionType ?? InteractionType.Redirect,
      protectedResourceMap,
    };
  };

const defaultMsalGuardConfig: MsalGuardConfiguration = {
  interactionType: InteractionType.Redirect,
  authRequest: {
    scopes: ['user.read'],
  },
  loginFailedRoute: '/',
};

export const MsalGuardConfigFactory = (config: Partial<MsalGuardConfiguration> = {}) => (): MsalGuardConfiguration => ({
  ...defaultMsalGuardConfig,
  ...(config ?? {}),
});

@NgModule({
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormModule.forChild(),
    MaterialModule,
    StoreModule.forFeature(fromAuth.AUTH_FEATURE_KEY, fromAuth.reducer),
    EffectsModule.forFeature([AuthEffects]),
  ],
  declarations: [LoginComponent],
})
export class AuthModule {
  static forRoot(config: AuthModuleConfig): ModuleWithProviders<AuthModule> {
    return {
      ngModule: AuthModule,
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: MsalInterceptor,
          multi: true,
        },
        {
          provide: MSAL_INSTANCE,
          useFactory: MsalInstanceFactory(config.msal.instance),
        },
        {
          provide: MSAL_INTERCEPTOR_CONFIG,
          useFactory: MsalInterceptorConfigFactory(config.msal.interceptor),
        },
        {
          provide: MSAL_GUARD_CONFIG,
          useFactory: MsalGuardConfigFactory(config.msal.guard),
        },
        MsalService,
        MsalGuard,
        MsalBroadcastService,
      ],
    };
  }
}
