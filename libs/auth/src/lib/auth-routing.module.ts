import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { LoginComponent } from './containers/login/login.component';
import { MsalGuard } from '@azure/msal-angular';

export const authRoutes: Route[] = [
  { path: 'login', component: LoginComponent, canActivate: [MsalGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(authRoutes)],
})
export class AuthRoutingModule {}
