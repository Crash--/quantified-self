import {Component, HostListener} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import {AppAuthService} from '../../authentication/app.auth.service';
import {User} from 'quantified-self-lib/lib/users/user';
import {take} from 'rxjs/operators';
import {UserService} from '../../services/app.user.service';
import {UserFormComponent} from '../user-forms/user.form.component';
import {UserAgreementFormComponent} from '../user-forms/user-agreement.form.component';
import * as Raven from "raven-js";
import {Log} from "ng2-logger/browser";
import {AngularFirestore} from "@angular/fire/firestore";
import {AngularFireAuth} from "@angular/fire/auth";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {

  isLoggingIn: boolean;

  private logger = Log.create('LoginComponent');

  @HostListener('window:customToken', ['$event'])
  signInWithCustomToken(event) {
    debugger;
  }


  constructor(
    public authService: AppAuthService,
    public userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {

    this.authService.signOut();
    this.authService.user.subscribe((user) => {
      debugger;
    })
  }

  async anonymousLogin() {
    try {
      return this.redirectOrShowDataPrivacyDialog(await this.authService.anonymousLogin());
    } catch (e) {
      Raven.captureException(e);
      this.logger.error(e);
      this.snackBar.open(`Could not log in due to ${e}`, null, {
        duration: 2000,
      });
    }
  }


  async googleLogin() {
    try {
      return this.redirectOrShowDataPrivacyDialog(await this.authService.googleLogin());
    } catch (e) {
      Raven.captureException(e);
      this.logger.error(e);
      this.snackBar.open(`Could not log in due to ${e}`, null, {
        duration: 2000,
      });
    }
  }

  async facebookLogin() {
    try {
      return this.redirectOrShowDataPrivacyDialog(await this.authService.facebookLogin());
    } catch (e) {
      Raven.captureException(e);
      this.logger.error(e);
      this.snackBar.open(`Could not log in due to ${e}`, null, {
        duration: 2000,
      });
    }
  }

  async twitterLLogin() {
    // Open the popup that will start the auth flow.
    // this.isLoggingIn = true;
    // const wnd = window.open('http://localhost:5001/quantified-self-io/us-central1/authRedirect', 'name', 'height=585,width=400');
    const wnd = window.open('http://localhost:5001/quantified-self-io/us-central1/authPopup.html', 'name', 'height=585,width=400');
    var pollTimer = window.setInterval(async () => {
      if (wnd.closed !== false) { // !== is required for compatibility with Opera
        window.clearInterval(pollTimer);
        // debugger;
      }
    }, 200);
    // try {
    //   return this.redirectOrShowDataPrivacyDialog(await this.authService.suuntoAppLogin());
    // } catch (e) {
    //   Raven.captureException(e);
    //   this.logger.error(e);
    //   this.snackBar.open(`Could not log in due to ${e}`, null, {
    //     duration: 2000,
    //   });
    // }
  }


  private async redirectOrShowDataPrivacyDialog(loginServiceUser) {
    this.isLoggingIn = true;
    try {
      const databaseUser = await this.userService.getUserByID(loginServiceUser.user.uid).pipe(take(1)).toPromise();
      if (databaseUser) {
        await this.router.navigate(['/dashboard']);
        this.snackBar.open(`Welcome back ${databaseUser.displayName || 'Anonymous'}`, null, {
          duration: 2000,
        });
        return;
      }
      this.showUserAgreementFormDialog(new User(loginServiceUser.user.uid, loginServiceUser.user.displayName, loginServiceUser.user.photoURL))
    } catch (e) {
      Raven.captureException(e);
      this.isLoggingIn = false;
    }
  }

  private showUserAgreementFormDialog(user: User) {
    const dialogRef = this.dialog.open(UserAgreementFormComponent, {
      width: '75vw',
      disableClose: true,
      data: {
        user: user,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.isLoggingIn = false;
    });
  }

  @HostListener('window:resize', ['$event'])
  getColumnsToDisplayDependingOnScreenSize(event?) {
   return window.innerWidth < 600 ? 1 : 2;
  }

}
