import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Subscription, throwError } from 'rxjs';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
  form: FormGroup = new FormGroup({});
  submitSubscription: Subscription = new Subscription();
  emailPattern: string = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  passwordPattern: string = '^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$';

  constructor(private newForm: FormBuilder, private http:HttpClient, private router: Router, private tokenService: TokenService){}

  //Initializes a new form with input validation for each variable
  ngOnInit() {
    this.form = this.newForm.group({
      email: new FormControl("", [Validators.required, Validators.pattern(this.emailPattern)]),
      password: new FormControl("", [Validators.required, Validators.pattern(this.passwordPattern)])
    })
  }

  //submit() function will create a new user and submit user to backend for approval
  submit() {
    if (this.form.invalid) {
      return;
    }

    let user = {
      email: this.form.controls['email'].value,
      password: this.form.controls['password'].value,
    };
  
    const options = { headers: { 'Content-Type': 'application/json' } };
    this.submitSubscription = this.http.post('http://localhost:5200/users/login', JSON.stringify(user), options).subscribe((res: any) => {
      if (res.status === 200) {
        this.tokenService.setToken(res.token);
        alert("Successful login.");
        // Redirect user to home page
        window.location.href = '/home';
      }
      catchError((error) => {
        if (error.status === 404) {
          alert('Resource not found.');
        } else if (error.status === 401) {
          alert('Invalid email or password.');
        } else if (error.status === 500) {
          alert('Server down.');
        } else if (error.status === 502) {
          alert('Bad gateway.');
        } else {
          alert('An error occurred.');
        }
        return throwError(() => error);
      })
    });
      
    // Prevents double submit to backend
    return false;
  }

  //reset() function will reset (or erase) all current form information
  reset() {
    this.form.reset();
  }

  //Navigates to the signup page
  navigateToSignUp() {
    this.router.navigate(['/signup']);
  }

  ngOnDestroy(): void {
    if (this.submitSubscription) {
      this.submitSubscription.unsubscribe();
    }
  }
}
