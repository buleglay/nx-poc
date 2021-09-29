import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthModule } from '@nx-poc/auth';
import { Route } from '@angular/router';
import { MsalRedirectComponent } from '@azure/msal-angular';
import { FormModule } from '@nx-poc/form';
import { NxModule } from '@nrwl/angular';
import { MaterialModule } from '@nx-poc/material';

const routes: Route[] = [
  { path: 'auth', loadChildren: () => import('@nx-poc/auth').then(m => m.AuthModule) }
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NxModule.forRoot(),
    RouterModule.forRoot(routes, { initialNavigation: 'enabledBlocking' }),
    StoreModule.forRoot(
      {},
      {
        metaReducers: !environment.production ? [] : [],
        runtimeChecks: {
          strictActionImmutability: true,
          strictStateImmutability: true,
        },
      }
    ),
    AuthModule.forRoot({
      msal: {
        instance: {
          auth: {
            clientId: environment.clientId,
          }
        }
      }
    }),
    FormModule.forRoot(),
    MaterialModule,
    EffectsModule.forRoot([]),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    StoreRouterConnectingModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent, MsalRedirectComponent],
})
export class AppModule {}
